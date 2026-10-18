"""Deterministic material and nature sounds for explicit narrative cue sheets."""
import numpy as np
from scipy.signal import butter,sosfilt
SR=48000

def effect(kind,duration,seed=6103,**p):
 d=float(duration);t=np.arange(max(1,round(d*SR)))/SR;u=t/max(d,.001);rng=np.random.default_rng(seed);noise=rng.normal(size=len(t));env=np.sin(np.pi*np.clip(u,0,1))**2
 def bp(a,lo,hi):return sosfilt(butter(2,[lo,hi],btype='bandpass',fs=SR,output='sos'),a)
 def lp(a,hz):return sosfilt(butter(2,hz,fs=SR,output='sos'),a)
 if kind in ('paper','brush','scratch'):
  a=bp(noise,500,7200)*(.6+.4*np.sin(2*np.pi*(9 if kind=='brush' else 31)*t));a*=env if kind=='brush' else np.exp(-u*4)
 elif kind in ('stamp','hit','thump'):
  a=(np.sin(2*np.pi*(90*t-28*t*t/max(d,.01)))+bp(noise,100,1600)*.25)*np.exp(-u*11)
 elif kind in ('raindrop','drip'):
  f=2200-1000*np.minimum(u*4,1);phase=2*np.pi*np.cumsum(f)/SR;a=(np.sin(phase)+.2*np.sin(phase*1.5))*np.exp(-u*9)*np.minimum(t/.002,1)
 elif kind in ('wind','mist','whoosh'):
  a=lp(noise,400 if kind=='wind' else 1800)*env*(.8+.2*np.sin(2*np.pi*.7*t))
 elif kind in ('bird','chirp'):
  frequency=2400+1100*np.sin(np.pi*u)+300*np.sin(2*np.pi*24*t);a=np.sin(2*np.pi*np.cumsum(frequency)/SR)*env*np.maximum(np.sin(2*np.pi*8*t),0)**2
 elif kind=='whipbird':
  f=1300+700*np.sin(np.pi*np.minimum(u/.65,1));f=np.where(u>.65,2400-1900*(u-.65)/.35,f);a=np.sin(2*np.pi*np.cumsum(f)/SR)*env*(.7+.3*np.sin(2*np.pi*14*t))
 elif kind in ('fire','crackle'):
  clicks=np.zeros(len(t));positions=rng.integers(0,len(t),max(1,int(d*45)));clicks[positions]=rng.uniform(.2,1.2,len(positions));clicks=lp(clicks,6000);a=(lp(noise,500)*.4+bp(noise,1600,9500)*.15+clicks*4)*np.minimum(t/.3,1)*np.minimum((d-t)/.5,1)
 elif kind=='rain':
  a=bp(noise,900,10000)*(.3+.05*np.sin(2*np.pi*.8*t))*np.minimum(t/.2,1)*np.minimum((d-t)/.25,1)
 elif kind=='sine_glide':
  f0=float(p.get('freq_start',440));f1=float(p.get('freq_end',880));f=f0*(f1/f0)**u;a=np.sin(2*np.pi*np.cumsum(f)/SR)*np.minimum(t/.01,1)*np.minimum((d-t)/.02,1)
 elif kind=='glass_shimmer':
  f=float(p.get('frequency',1100));a=sum(np.sin(2*np.pi*f*r*t)*np.exp(-u*(3+i))*(.5**i) for i,r in enumerate([1,1.498,2.407,3.153,4.222]))*np.minimum(t/.006,1)
 elif kind=='magnetic_snap':
  a=(bp(noise,1800,11000)*.5+np.sin(2*np.pi*190*t)*.35)*np.exp(-u*28)+np.sin(2*np.pi*1640*t)*np.exp(-u*9)*.12
 elif kind=='kick808':
  f=float(p.get('frequency',52))*(1+3*np.exp(-t*55));a=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-u*5)*np.minimum(t/.002,1)
 elif kind in ('chime','bell'):
  f=float(p.get('frequency',880));a=(np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*f*1.498*t))*np.exp(-u*5)*np.minimum(t/.003,1)
 elif kind in ('click','letterpress','guillotine'):
  a=(bp(noise,1200,9000)+np.sin(2*np.pi*160*t)*.2)*np.exp(-u*35)
 elif kind=='sheep_baa':
  f=185+30*np.sin(np.pi*u)+8*np.sin(2*np.pi*8*t);phase=2*np.pi*np.cumsum(f)/SR
  glottal=sum(np.sin(phase*k)/k for k in range(1,22));formants=sum(bp(glottal,max(40,hz-90),hz+90)*g for hz,g in [(600,1),(1150,.6),(2450,.2)])
  a=formants*env*(.8+.2*np.sin(2*np.pi*10*t))
 elif kind=='felt_puff':
  a=(lp(noise,850)*.8+np.sin(2*np.pi*170*t)*.15)*np.exp(-u*9)*np.minimum(t/.008,1)
 elif kind=='cloth':
  a=bp(noise,180,2100)*env*(.65+.35*np.sin(2*np.pi*17*t))
 elif kind=='yawn':
  f=155-65*u;phase=2*np.pi*np.cumsum(f)/SR;v=np.sin(phase)+.4*np.sin(phase*2)+.18*np.sin(phase*3)
  a=(v*.35+bp(noise,200,1800)*.25)*env*(.8+.2*np.sin(2*np.pi*4*t))
 elif kind=='crickets':
  pulse=np.maximum(np.sin(2*np.pi*32*t),0)**8;phrase=np.maximum(np.sin(2*np.pi*1.1*t),0)**2
  a=(np.sin(2*np.pi*4700*t)+.3*np.sin(2*np.pi*5200*t))*pulse*phrase*np.minimum(t/.2,1)*np.minimum((d-t)/.2,1)
 elif kind=='clock':
  a=np.zeros(len(t))
  for i in range(int(d*2)+1):
   local=t-i*.5;valid=(local>=0)&(local<.06);f=2600 if i%2 else 1900
   a[valid]+=(np.sin(2*np.pi*f*local[valid])+.3*noise[valid])*np.exp(-local[valid]*130)
 elif kind=='page_turn':
  a=bp(noise,350,6500)*(np.exp(-((u-.2)/.12)**2)+.65*np.exp(-((u-.73)/.2)**2))*(.7+.3*np.sin(2*np.pi*23*t))
 elif kind=='duck_quack':
  f=float(p.get('frequency',280))*(1-.22*u+.04*np.sin(2*np.pi*32*t));phase=2*np.pi*np.cumsum(f)/SR
  voice=sum(np.sin(phase*k)/k for k in range(1,16));a=(bp(voice,450,2200)*1.6+bp(noise,800,2200)*.08)*np.exp(-u*4)*np.minimum(t/.025,1)
 elif kind in ('engine_idle','engine_rev'):
  f=float(p.get('frequency',42))*(1+(.08*np.sin(2*np.pi*3*t) if kind=='engine_idle' else 3*np.sin(np.pi*u)**2));phase=2*np.pi*np.cumsum(f)/SR
  a=(np.sin(phase)+.4*np.sin(2*phase)+.2*np.sin(4*phase)+lp(noise,1000)*.35)*np.minimum(t/.08,1)*np.minimum((d-t)/.15,1)
 elif kind=='rail_clack':
  a=np.zeros(len(t));interval=float(p.get('interval',.45))
  for onset in np.arange(0,d,interval):
   for offset in [0,.065]:
    q=t-onset-offset;valid=(q>=0)&(q<.15);a[valid]+=(np.sin(2*np.pi*165*q[valid])+.3*np.sin(2*np.pi*680*q[valid])+noise[valid]*.3)*np.exp(-q[valid]*45)
 elif kind in ('water','water_roar'):
  a=(bp(noise,250,4500)*.35+lp(noise,650)*(.7 if kind=='water_roar' else .25))*(.65+.2*np.sin(2*np.pi*.8*t)+.15*np.sin(2*np.pi*2.3*t))*np.minimum(t/.1,1)*np.minimum((d-t)/.2,1)
 elif kind=='splash':
  a=bp(noise,250,7500)*np.exp(-u*7)*np.minimum(t/.005,1)
  for onset in rng.uniform(.015,max(.016,d*.7),8):
   q=np.maximum(t-onset,0);a+=.12*np.sin(2*np.pi*(1300*q-700*q*q/max(d,.05)))*np.exp(-q*30)*(t>=onset)
 elif kind=='sword_draw':
  a=(bp(noise,2200,11000)*.35+sum(np.sin(2*np.pi*f*t)*g for f,g in [(1100,.3),(2840,.2),(5360,.1)]))*env+np.sin(2*np.pi*1760*t)*np.exp(-u*4)*.2
 elif kind=='sword_cut':
  a=bp(noise,800,12000)*np.exp(-((u-.2)/.12)**2)+(.25*np.sin(2*np.pi*1380*t)+.1*np.sin(2*np.pi*3110*t))*np.exp(-u*9)
 elif kind=='paper_scroll':
  a=(bp(noise,200,4200)*(.6+.4*np.sin(2*np.pi*19*t))+.08*np.sin(2*np.pi*(160*t+40*t*t)))*env
 else:raise ValueError('Unsupported material cue: '+kind)
 return np.asarray(a,dtype=np.float32)

def saw(midi,duration):
 t=np.arange(max(1,round(duration*SR)))/SR;f=440*2**((float(midi)-69)/12);a=sum(np.sin(2*np.pi*f*k*t)/k*np.exp(-k/7) for k in range(1,min(24,int(18000/f))+1));edge=np.minimum(t/.008,1)*np.minimum((duration-t)/.04,1);return np.asarray(a*edge*.6,dtype=np.float32)


def synth_note(kind,midi,duration):
 if kind=='saw':return saw(midi,duration)
 t=np.arange(max(1,round(duration*SR)))/SR;f=440*2**((float(midi)-69)/12);edge=np.minimum(t/.003,1)*np.minimum((duration-t)/.025,1)
 if kind=='fm_glass':
  a=np.sin(2*np.pi*f*t+2.6*np.sin(2*np.pi*f*2.414*t)*np.exp(-t*4))*np.exp(-t*3/max(duration,.2));a+=.13*np.sin(2*np.pi*f*4.173*t)*np.exp(-t*8)
 elif kind=='sub808':
  phase=2*np.pi*np.cumsum(f*(1+.75*np.exp(-t*45)))/SR;a=np.tanh(1.4*(np.sin(phase)+.08*np.sin(2*phase)))*np.exp(-t*2.2/max(duration,.1))
 elif kind=='toy_piano':
  a=sum(g*np.sin(2*np.pi*f*r*t)*np.exp(-t*k/max(duration,.2)) for r,g,k in [(1,1,3),(2.018,.35,5),(3.87,.2,7),(5.43,.09,11)])
 else:raise ValueError('Unsupported synth voice '+kind)
 return np.asarray(a*edge,dtype=np.float32)
