#!/usr/bin/env python3
"""Render a film's explicit note/effect score to stereo PCM; no external samples."""
import argparse,json
from pathlib import Path
import numpy as np
import soundfile as sf
SR=48000

def compose(score,duration=20):
    out=np.zeros((int(SR*duration),2),dtype=np.float64)
    rng=np.random.default_rng(81723)
    def add(signal,t,gain,pan):
        start=round(float(t)*SR)
        if start<0:signal=signal[-start:];start=0
        n=min(len(signal),len(out)-start)
        if n<=0:return
        pan=np.clip(float(pan),-1,1);signal=signal[:n]*float(gain)
        out[start:start+n,0]+=signal*np.sqrt((1-pan)/2)
        out[start:start+n,1]+=signal*np.sqrt((1+pan)/2)
    for note in score.get('notes',[]):
        duration_n=float(note.get('duration',.5));t=np.arange(max(1,round(duration_n*SR)))/SR
        freq=440*2**((float(note.get('midi',60))-69)/12);phase=2*np.pi*freq*t
        instrument=note.get('instrument','felt')
        if instrument=='bell':wave=np.sin(phase)+.35*np.sin(phase*2.76)*np.exp(-t*8)+.18*np.sin(phase*5.4)*np.exp(-t*12);env=np.exp(-t*5/max(.25,duration_n))
        elif instrument in ('pluck','marimba','felt'):wave=np.sin(phase)+(.3 if instrument=='pluck' else .13)*np.sin(2*phase)+.07*np.sin(3*phase);env=np.exp(-t*(5 if instrument=='marimba' else 3.5)/max(.2,duration_n))
        elif instrument=='chip':wave=np.tanh(5*np.sin(phase))*.5;env=np.ones_like(t)
        elif instrument=='brass':wave=sum(np.sin(phase*i)/i for i in range(1,7))*.45;env=np.ones_like(t)
        elif instrument=='organ':wave=np.sin(phase)+.35*np.sin(2*phase)+.2*np.sin(4*phase);env=np.ones_like(t)
        elif instrument=='bass':wave=np.sin(phase)+.22*np.sin(2*phase);env=np.exp(-t*1.2/max(.2,duration_n))
        elif instrument=='flute':wave=np.sin(phase+.015*np.sin(2*np.pi*5*t))+.08*np.sin(2*phase);env=np.ones_like(t)
        elif instrument=='pad':wave=np.sin(phase)+.25*np.sin(phase*1.003)+.15*np.sin(phase*2);env=np.ones_like(t)
        else:raise ValueError(f'Unsupported instrument {instrument}')
        edge=np.minimum(t/(.08 if instrument=='pad' else .008),1)*np.minimum((duration_n-t)/(.15 if instrument=='pad' else .025),1)
        add(wave*env*np.clip(edge,0,1),note['t'],note.get('gain',.1),note.get('pan',0))
    for effect in score.get('effects',[]):
        d=float(effect.get('duration',.25));t=np.arange(max(1,round(d*SR)))/SR;u=t/max(d,.001)
        kind=effect.get('kind','click');noise=rng.normal(size=len(t));smooth=np.convolve(noise,np.ones(12)/12,mode='same')
        if kind=='rain':wave=noise*.12*np.minimum(t/.05,1)*np.minimum((d-t)/.08,1)
        elif kind=='wind':wave=smooth*.35*np.sin(np.pi*u)**2
        elif kind=='whoosh':wave=(noise-smooth)*np.sin(np.pi*u)**2*.35
        elif kind=='paper':wave=(noise-smooth)*np.exp(-u*4)*(.6+.4*np.sin(2*np.pi*35*t))
        elif kind=='scratch':wave=noise*np.maximum(np.sin(2*np.pi*30*t),0)*np.exp(-u*2)*.35
        elif kind=='hit':wave=np.sin(2*np.pi*(90*t-45*t*t/max(d,.01)))*np.exp(-u*7)+noise*np.exp(-u*20)*.3
        elif kind=='click':wave=noise*np.exp(-u*35)*.6
        elif kind=='chime':wave=(np.sin(2*np.pi*880*t)+.3*np.sin(2*np.pi*1318*t))*np.exp(-u*5)
        else:raise ValueError(f'Unsupported effect {kind}')
        add(wave,effect['t'],effect.get('gain',.1),effect.get('pan',0))
    peak=np.max(np.abs(out))
    if peak>0:out*=min(.85/peak,2)
    return np.tanh(out)

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('score',type=Path);p.add_argument('output',type=Path);p.add_argument('--duration',type=float,default=20);a=p.parse_args()
    a.output.parent.mkdir(parents=True,exist_ok=True);sf.write(a.output,compose(json.loads(a.score.read_text()),a.duration),SR,subtype='PCM_24')
