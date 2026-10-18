#!/usr/bin/env python3
"""Render an explicit full-length sampled score, foley and recreated narration."""
import argparse,json,sys
from pathlib import Path
import numpy as np,soundfile as sf
from scipy.signal import fftconvolve
from scipy.ndimage import uniform_filter1d
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT));sys.path.insert(0,str(ROOT/'tools'))
from core.audio import sampler as S
from compose_comparison_audio import compose as synth_score
SR=48000

def compose(score,voice_records,duration,out):
    music=np.zeros((round(duration*SR),2),np.float32);speech=np.zeros_like(music);S.seed(6101)
    def add(dst,signal,start,gain=1,pan=0):
        signal=np.asarray(signal,dtype=np.float32);i=round(float(start)*SR)
        if i<0:signal=signal[-i:];i=0
        n=min(len(signal),len(dst)-i)
        if n<=0:return
        a=signal[:n]*float(gain)
        if a.ndim==1:dst[i:i+n,0]+=a*np.sqrt((1-float(pan))/2);dst[i:i+n,1]+=a*np.sqrt((1+float(pan))/2)
        else:dst[i:i+n]+=a
    synth=[]
    for note in score.get('notes',[]):
        name=note.get('instrument','piano')
        if name in S.REG or name in S.ALIASES:
            signal=S.note(name,note.get('midi',60),float(note['duration']),vel=float(note.get('velocity',.65)))
            add(music,signal,note['t'],note.get('gain',.15),np.clip(note.get('pan',0),-1,1))
        else:synth.append(note)
    for hit in score.get('hits',[]):
        a=S.hit(hit['instrument'],hit.get('variant'),vel=float(hit.get('velocity',.7)),dur=float(hit.get('duration',.4)));add(music,a,hit['t'],hit.get('gain',.15),np.clip(hit.get('pan',0),-1,1))
    # Explicit synth voices and seeded material foley from the original root synthesizer.
    if synth or score.get('effects'):
        add(music,synth_score({'notes':synth,'effects':score.get('effects',[])},duration),0,1)
    room=float(score.get('room',.12))
    if room:
        rng=np.random.default_rng(6102);t=np.arange(int(.65*SR))/SR;ir=rng.normal(size=len(t))*np.exp(-t*10);ir[:int(.02*SR)]=0;ir/=np.sqrt(np.sum(ir*ir)+1e-9)
        for ch in range(2):music[:,ch]+=fftconvolve(music[:,ch],ir,mode='full')[:len(music)]*room
    def rms(a):return np.sqrt(np.mean(a*a)+1e-12)
    if np.max(np.abs(music))>1e-6:music*=10**(float(score.get('music_rms_db',-23))/20)/rms(music)
    duck=np.ones(len(music),np.float32)
    from scipy.signal import resample_poly
    from fractions import Fraction
    for line in voice_records:
        a,sr=sf.read(line['file'],dtype='float32');a=a.mean(axis=1) if a.ndim==2 else a
        if sr!=SR:
            ratio=Fraction(SR,sr);a=resample_poly(a,ratio.numerator,ratio.denominator)
        active=a[np.abs(a)>max(.005,np.max(np.abs(a))*.02)]
        if not len(active):raise RuntimeError(line['id']+' is silent')
        # Bound Kokoro transient peaks before matching speech level.
        a=np.tanh(a/(rms(active)*4))*rms(active)*4;a*=10**(-18/20)/max(rms(a[np.abs(a)>.003]),1e-8)
        add(speech,a,line['start']);i=max(0,round((line['start']-.15)*SR));j=min(len(duck),round((line['start']+len(a)/SR+.2)*SR));duck[i:j]=np.minimum(duck[i:j],.62)
    duck=uniform_filter1d(duck,size=int(.25*SR),mode='nearest');mix=music*duck[:,None]+speech
    peak=float(np.max(np.abs(mix)))
    if peak<1e-5:raise RuntimeError('Empty soundtrack')
    if peak>.88:mix*=.88/peak
    out.parent.mkdir(parents=True,exist_ok=True);sf.write(out,mix,SR,subtype='PCM_24')
    (out.with_suffix('.json')).write_text(json.dumps({'duration':duration,'notes':len(score.get('notes',[])),'hits':len(score.get('hits',[])),'effects':len(score.get('effects',[])),'narration_lines':len(voice_records),'speech_recreated':True,'original_master_reused':False},indent=2)+'\n')
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('score',type=Path);p.add_argument('timing',type=Path);p.add_argument('out',type=Path);p.add_argument('--duration',type=float,required=True);a=p.parse_args();compose(json.loads(a.score.read_text()),json.loads(a.timing.read_text()),a.duration,a.out)
