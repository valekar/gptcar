#!/usr/bin/env python3
"""Render an explicit full-length sampled score, foley and recreated narration."""
import argparse,json,sys
from pathlib import Path
import numpy as np,soundfile as sf
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.ndimage import uniform_filter1d
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT));sys.path.insert(0,str(ROOT/'tools'))
from core.audio import sampler as S
from core.audio import pluck as P
from compose_comparison_audio import compose as synth_score
from replica_foley import effect as make_effect, synth_note
SR=48000

def compose(score,voice_records,duration,out):
    music=np.zeros((round(duration*SR),2),np.float32);speech=np.zeros_like(music);foley=np.zeros_like(music);S.seed(6101);P._rng=np.random.default_rng(6104)
    def add(dst,signal,start,gain=1,pan=0):
        signal=np.asarray(signal,dtype=np.float32);i=round(float(start)*SR)
        if i<0:signal=signal[-i:];i=0
        n=min(len(signal),len(dst)-i)
        if n<=0:return
        a=signal[:n]*float(gain)
        if a.ndim==1:dst[i:i+n,0]+=a*np.sqrt((1-float(pan))/2);dst[i:i+n,1]+=a*np.sqrt((1+float(pan))/2)
        else:dst[i:i+n]+=a
    synth={'music':[],'foley':[]}
    for note in score.get('notes',[]):
        name=note.get('instrument','piano')
        channel=note.get('channel','music')
        if channel not in synth:raise ValueError('Unknown note channel: '+channel)
        dst=music if channel=='music' else foley
        if name in S.REG or name in S.ALIASES:
            signal=S.note(name,note.get('midi',60),float(note['duration']),vel=float(note.get('velocity',.65)))
            add(dst,signal,note['t'],note.get('gain',.15),np.clip(note.get('pan',0),-1,1))
        elif name in P.PRESETS:
            signal=P.pluck(name,note.get('midi',60),float(note['duration']),vel=float(note.get('velocity',.65)),**{k:note[k] for k in ['bend','vib','glide','harmonic','trem'] if k in note})
            add(dst,signal,note['t'],note.get('gain',.1),note.get('pan',0))
        elif name in ['saw','fm_glass','sub808','toy_piano','analog_saw_pad','analog_square_seq','lpg_plonk','fm_epiano','slap_bass','synth_brass','theremin','whistle','chip_pulse','chip_triangle','chip_wavetable']:add(dst,synth_note(name,note.get('midi',60),float(note['duration']),**{k:note[k] for k in ['value','fm_index','glide','duty','bits','sample_rate','wave','decay'] if k in note}),note['t'],note.get('gain',.1),note.get('pan',0))
        else:synth[channel].append(note)
    for hit in score.get('hits',[]):
        channel=hit.get('channel','music')
        if channel not in synth:raise ValueError('Unknown hit channel: '+channel)
        a=S.hit(hit['instrument'],hit.get('variant'),vel=float(hit.get('velocity',.7)),dur=float(hit.get('duration',.4)));add(music if channel=='music' else foley,a,hit['t'],hit.get('gain',.15),np.clip(hit.get('pan',0),-1,1))
    # Explicit synth voices and seeded material foley from the original root synthesizer.
    for channel,notes in synth.items():
        if notes:add(music if channel=='music' else foley,synth_score({'notes':notes,'effects':[]},duration),0,1)
    for i,cue in enumerate(score.get('effects',[])):
        params={k:v for k,v in cue.items() if k not in ['kind','duration','t','gain','pan']}
        add(foley,make_effect(cue['kind'],cue.get('duration',.25),seed=6103+i,**params),cue['t'],cue.get('gain',.1),cue.get('pan',0))
    if not score.get('silence_music_ranges') and not score.get('music_gain_points'):
        music+=foley;foley.fill(0)
    room=float(score.get('room',.12))
    if room:
        rng=np.random.default_rng(6102);t=np.arange(int(.65*SR))/SR;ir=rng.normal(size=len(t))*np.exp(-t*10);ir[:int(.02*SR)]=0;ir/=np.sqrt(np.sum(ir*ir)+1e-9)
        for ch in range(2):music[:,ch]+=fftconvolve(music[:,ch],ir,mode='full')[:len(music)]*room
    def rms(a):return np.sqrt(np.mean(a*a)+1e-12)
    if np.max(np.abs(music))>1e-6:music*=10**(float(score.get('music_rms_db',-23))/20)/rms(music)
    if score.get('music_gain_points'):
        points=np.asarray(score['music_gain_points'],dtype=float)
        if points.ndim!=2 or points.shape[1]!=2 or not np.isfinite(points).all() or np.any(points[:,1]<0) or np.any(np.diff(points[:,0])<=0):raise ValueError('music_gain_points must be increasing [time, nonnegative linear gain] pairs')
        music*=np.interp(np.arange(len(music))/SR,points[:,0],points[:,1])[:,None]
    for region in score.get('music_filter_ranges',[]):
        i=max(0,round(float(region['start'])*SR));j=min(len(music),round(float(region['end'])*SR))
        if j<=i:raise ValueError('Empty music filter range')
        low=float(region.get('low',350));high=float(region.get('high',3300))
        filtered=sosfilt(butter(3,[low,high],btype='bandpass',fs=SR,output='sos'),music[i:j],axis=0)
        ramp=min(round(.01*SR),(j-i)//2);weight=np.ones(j-i)
        if ramp:weight[:ramp]=np.linspace(0,1,ramp);weight[-ramp:]=np.linspace(1,0,ramp)
        music[i:j]=music[i:j]*(1-weight[:,None])+filtered*weight[:,None]
    # Narrative pauses cut musical releases while retaining clock, room and action foley.
    for start,end in score.get('silence_music_ranges',[]):
        music[max(0,round(start*SR)):min(len(music),round(end*SR))]=0
    duck=np.ones(len(music),np.float32)
    from scipy.signal import resample_poly
    from fractions import Fraction
    for line in voice_records:
        a,sr=sf.read(line['file'],dtype='float32');a=a.mean(axis=1) if a.ndim==2 else a
        if sr!=SR:
            ratio=Fraction(SR,sr);a=resample_poly(a,ratio.numerator,ratio.denominator)
        if line.get('filter') in ('radio','radio1930'):
            band=[260,4600] if line['filter']=='radio1930' else [380,2800]
            a=sosfilt(butter(4,band,btype='bandpass',fs=SR,output='sos'),a)
            a=np.tanh(a*3)/3
        elif line.get('filter')=='pa':
            a=sosfilt(butter(4,[330,3450],btype='bandpass',fs=SR,output='sos'),a)
            cone=sosfilt(butter(2,[950,1750],btype='bandpass',fs=SR,output='sos'),a)
            a=np.tanh((a+.2*cone)*1.5)/1.5
        elif line.get('filter')=='quiet_operator':
            bass=sosfilt(butter(2,240,btype='lowpass',fs=SR,output='sos'),a)
            a=sosfilt(butter(2,7200,btype='lowpass',fs=SR,output='sos'),a+.22*bass)
        elif line.get('filter')=='lowpass7k':
            a=sosfilt(butter(4,7000,btype='lowpass',fs=SR,output='sos'),a)
        elif line.get('filter') in ('vask','gary'):
            center=180 if line['filter']=='vask' else 3200
            boost=10**((2.5 if line['filter']=='vask' else 2)/20)-1
            band=sosfilt(butter(2,[center/1.7,min(11000,center*1.7)],btype='bandpass',fs=SR,output='sos'),a)
            a=a+boost*band
            if line['filter']=='vask':a=np.tanh(a*1.35)/1.35
        elif line.get('filter')=='machine':
            clock=np.arange(len(a))/SR
            a=a*(.84+.16*np.sin(2*np.pi*52*clock))
            delayed=np.zeros_like(a);delay=round(.006*SR)
            if len(a)>delay:delayed[delay:]=a[:-delay]
            a=sosfilt(butter(4,[140,7000],btype='bandpass',fs=SR,output='sos'),a+.22*delayed)
            a=np.tanh(a*1.6)/1.6
        elif line.get('filter'):
            raise RuntimeError('Unsupported narration filter: '+str(line['filter']))
        active=a[np.abs(a)>max(.005,np.max(np.abs(a))*.02)]
        if not len(active):raise RuntimeError(line['id']+' is silent')
        # Bound Kokoro transient peaks before matching speech level.
        a=np.tanh(a/(rms(active)*4))*rms(active)*4;a*=10**(-18/20)/max(rms(a[np.abs(a)>.003]),1e-8)
        add(speech,a,line['start']);i=max(0,round((line['start']-.15)*SR));j=min(len(duck),round((line['start']+len(a)/SR+.2)*SR));duck[i:j]=np.minimum(duck[i:j],.62)
    duck=uniform_filter1d(duck,size=int(.25*SR),mode='nearest');mix=(music+foley)*duck[:,None]+speech
    if score.get('master_filter')=='optical':
        # Recreate the narrow optical track with subtle deterministic wow/flutter.
        clock=np.arange(len(mix))/SR
        offset=(.00035*np.sin(2*np.pi*.7*clock)+.00006*np.sin(2*np.pi*8.3*clock))*SR
        sample=np.clip(np.arange(len(mix))+offset,0,len(mix)-1)
        for ch in range(2):mix[:,ch]=np.interp(sample,np.arange(len(mix)),mix[:,ch])
        mix=sosfilt(butter(3,[110,6200],btype='bandpass',fs=SR,output='sos'),mix,axis=0)
        mix=np.tanh(mix*1.15)/1.15
    elif score.get('master_filter'):
        raise ValueError('Unsupported master filter: '+str(score['master_filter']))
    for start,end in score.get('silence_ranges',[]):
        mix[max(0,round(start*SR)):min(len(mix),round(end*SR))]=0
    peak=float(np.max(np.abs(mix)))
    if peak<1e-5:raise RuntimeError('Empty soundtrack')
    if peak>.88:mix*=.88/peak
    out.parent.mkdir(parents=True,exist_ok=True);sf.write(out,mix,SR,subtype='PCM_24')
    (out.with_suffix('.json')).write_text(json.dumps({'duration':duration,'notes':len(score.get('notes',[])),'hits':len(score.get('hits',[])),'effects':len(score.get('effects',[])),'narration_lines':len(voice_records),'speech_recreated':True,'original_master_reused':False},indent=2)+'\n')
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('score',type=Path);p.add_argument('timing',type=Path);p.add_argument('out',type=Path);p.add_argument('--duration',type=float,required=True);a=p.parse_args();compose(json.loads(a.score.read_text()),json.loads(a.timing.read_text()),a.duration,a.out)
