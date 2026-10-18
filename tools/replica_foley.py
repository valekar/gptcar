"""Deterministic material and nature sounds for explicit narrative cue sheets."""
import numpy as np
from scipy.signal import butter,sosfilt
SR=48000

def chip_process(a,bits=None,sample_rate=None):
 a=np.asarray(a,dtype=np.float32)
 if sample_rate is not None:
  rate=float(sample_rate)
  if not np.isfinite(rate) or not 1000<=rate<=SR:raise ValueError('chip sample_rate must be1000..48000')
  clock=np.arange(len(a));index=np.minimum((np.floor(clock*rate/SR)*SR/rate).astype(int),len(a)-1);a=a[index]
 if bits is not None:
  bits=int(bits)
  if not 1<=bits<=24:raise ValueError('chip bits must be1..24')
  peak=max(float(np.max(np.abs(a))),1e-9)
  if bits==1:a=np.where(a>=0,peak,-peak)
  else:
   levels=2**(bits-1)-1;a=np.round(a/peak*levels)/levels*peak
 return a

def effect(kind,duration,seed=6103,**p):
 # Explicit workshop cue names preserve their material family and seeded variation.
 kind={'baren':'baren_rub','peel':'paper_peel','proof_peel':'paper_peel','paper_lay':'paper_land','paper_tap':'pen_tap','tissue_rustle':'paper_fold','beam_creak':'hull_creak','compass_click':'turret_click','compass_drop':'loupe_clack','cloth_grip':'handoff_rub','ink_dot':'water_plop','water_plip':'water_plop','wet_brush':'brush','pour':'coffee_pour','clunk':'stone_thunk','crack':'bean_crack','debris':'sugar_crunch','dust':'candle_puff','mould_smash':'impact','tongs_clank':'container_clang','burin_lift':'pen_tap','swarf_ping':'porcelain_clink','carve_title':'knife_run','rays_carve':'carve_fine'}.get(kind,kind)
 d=float(duration);t=np.arange(max(1,round(d*SR)))/SR;u=t/max(d,.001);rng=np.random.default_rng(seed);noise=rng.normal(size=len(t));env=np.sin(np.pi*np.clip(u,0,1))**2
 def bp(a,lo,hi):return sosfilt(butter(2,[lo,hi],btype='bandpass',fs=SR,output='sos'),a)
 def lp(a,hz):return sosfilt(butter(2,hz,fs=SR,output='sos'),a)
 kind={'screen_clack':'wood_knock','screen_hinge':'door_hinge','paper_stamp':'rubber_stamp','trail_tick':'keyboard_click','paper_hiss':'tape_hiss','registration_clamp':'relay_click','lake_lap':'sea_swell','mountain_wind':'wind','drying_clip':'magnet_clack','far_wind':'wind','wind_muffled':'wind','amb_forge':'fire_roar'}.get(kind,kind)
 if kind=='chip_noise':
  rate=float(p.get('sample_rate',16000))
  if not np.isfinite(rate) or not 1000<=rate<=SR:raise ValueError('chip sample_rate must be1000..48000')
  count=max(1,int(np.ceil(d*rate))+1);seq=np.empty(count,np.float32);state=(int(seed)&32767) or 1
  for i in range(count):
   seq[i]=1 if state&1 else -1;feedback=(state^(state>>1))&1;state=(state>>1)|(feedback<<14)
  a=seq[np.minimum((t*rate).astype(int),count-1)]*np.exp(-u*float(p.get('decay',6)))*np.minimum(t/.0005,1)
 elif kind in ('gift_pot','gift_candle','gift_keys','gift_ring','gift_spoon','gift_bracelet'):
  f={'gift_pot':185,'gift_candle':640,'gift_keys':3600,'gift_ring':5100,'gift_spoon':1750,'gift_bracelet':2400}[kind];a=np.zeros(len(t))
  onsets=[0,.035,.075] if kind in ('gift_keys','gift_bracelet') else [0]
  for onset in onsets:
   q=t-onset;v=q>=0
   for i,r in enumerate([1,2.76,4.98]):
    if f*r<18000:a[v]+=(.5/(i+1))*np.sin(2*np.pi*f*r*q[v])*np.exp(-q[v]*(14+i*12))*np.minimum(q[v]/.0007,1)
   a[v]+=bp(noise,700,6000)[v]*.15*np.exp(-q[v]*85)*np.minimum(q[v]/.001,1)
  a*=np.minimum((d-t)/.025,1)
 elif kind=='squeegee_mesh':
  speed=np.clip(float(p.get('speed',1)),.1,5);grain=float(p.get('frequency',250));a=(bp(noise,500,min(15000,5000+speed*1200))*.65+lp(noise,900)*.2)*env*(.55+.45*np.sin(2*np.pi*grain*t))
 elif kind=='ink_squelch':
  f=170+95*np.sin(np.pi*u);ph=2*np.pi*np.cumsum(f)/SR;a=(np.sin(ph)*.3+bp(noise,300,2800)*.55)*env*(.5+.5*np.sin(2*np.pi*9*t)**2)
 elif kind=='waterfall':
  a=(bp(noise,300,9500)*.6+lp(noise,300)*.35)*env*(.85+.15*np.sin(2*np.pi*1.7*t))
 elif kind=='visitor_murmur':
  # Indistinct room texture only: no sampled speech or intelligible words.
  a=bp(noise,220,1600)*.25
  for i in range(4):
   f=rng.uniform(115,220);ph=2*np.pi*np.cumsum(f*(1+.08*np.sin(2*np.pi*(.6+i*.2)*t)))/SR
   a+=(np.sin(ph)+.18*np.sin(3*ph))*.06*(.5+.5*np.sin(2*np.pi*(1.2+i*.4)*t)**2)
  a*=env
 elif kind in ('knife_bite','knife_flick','stab'):
  a=(bp(noise,900,7800)*.55+np.sin(2*np.pi*330*t)*.22)*np.exp(-u*(30 if kind=='knife_flick' else 17))*np.minimum(t/.001,1)
 elif kind in ('knife_run','gouge_u','gouge_v','carve_fine','clay_rasp'):
  lo,hi,rate={'knife_run':(700,6500,27),'gouge_u':(250,3300,18),'gouge_v':(1500,8700,37),'carve_fine':(2300,10500,54),'clay_rasp':(300,3900,16)}[kind]
  a=(bp(noise,lo,hi)*.65+np.sin(2*np.pi*(230 if kind=='gouge_u' else 610)*t)*.06)*env*(.25+.75*np.maximum(np.sin(2*np.pi*rate*t),0)**2)
 elif kind in ('burin_scrape','hatch_scratch','circular_scribe'):
  density=max(.1,float(p.get('density',1)));rate=(31 if kind=='burin_scrape' else 75 if kind=='hatch_scratch' else 17)*density
  chatter=.25+.75*np.maximum(np.sin(2*np.pi*rate*t+.15*np.sin(2*np.pi*7*t)),0)**2
  a=(bp(noise,2600,9000)*chatter*.65+np.sin(2*np.pi*1780*t)*.035)*env
 elif kind=='burnish_rub':
  a=(bp(noise,450,4200)*.6+np.sin(2*np.pi*(820*t+80*t*t))* .07)*env*(.6+.4*np.sin(2*np.pi*4*t)**2)
 elif kind in ('press_roller','brayer'):
  a=(lp(noise,1200)*.45+bp(noise,1200,4200)*.18+np.sin(2*np.pi*68*t)*.12)*env*(.7+.3*np.sin(2*np.pi*9*t)**2)
 elif kind=='press_thump':
  a=(np.sin(2*np.pi*74*t)*.6+np.sin(2*np.pi*183*t)*.2+lp(noise,1800)*.45)*np.exp(-u*12)*np.minimum(t/.002,1)
 elif kind=='workshop_clock':
  a=np.zeros(len(t));step=float(p.get('interval',.5))
  for i,onset in enumerate(np.arange(0,d,step)):
   q=t-onset;valid=q>=0;f=1800 if i%2 else 1350
   a[valid]+=(np.sin(2*np.pi*f*q[valid])*.35+bp(noise,1000,6000)[valid]*.4)*np.exp(-q[valid]*130)*np.minimum(q[valid]/.0005,1)
 elif kind in ('bellows','fire_roar'):
  a=(lp(noise,600)*.7+bp(noise,700,4000)*.3)*env
  if kind=='bellows':a*=.25+.75*np.sin(np.pi*u)**2
  else:a*=.7+.3*np.sin(2*np.pi*3.7*t)**2
 elif kind=='sizzle':
  a=bp(noise,1800,14500)*env*(.18+.82*(rng.random(len(t))<.065))
 elif kind=='molten_bubble':
  a=lp(noise,400)*env*.15
  for onset in rng.uniform(0,d,max(2,int(d*9))):
   q=t-onset;v=q>=0;f=rng.uniform(100,420)
   a[v]+=.18*np.sin(2*np.pi*(f*q[v]-f*q[v]*q[v]*1.4))*np.exp(-q[v]*22)*np.minimum(q[v]/.002,1)
  a*=np.minimum((d-t)/.03,1)
 elif kind in ('anvil_modal','foundry_bell','foundry_echo'):
  f=float(p.get('frequency',p.get('f0',146.8324)));ratios=p.get('ratios',[.5,1,1.2,1.5,2,2.5,3,4]);a=np.zeros(len(t))
  for i,r in enumerate(ratios):a+=(.7/(1+i*.5))*np.sin(2*np.pi*f*float(r)*t)*np.exp(-t*(.55+i*.32))
  a+=bp(noise,1200,7500)*np.exp(-t*90)*.15
  if kind=='foundry_echo':a=lp(a,1800)
  a*=np.minimum(t/.001,1)*np.minimum((d-t)/.07,1)
 elif kind=='fluorescent_bed':
  a=(sum(np.sin(2*np.pi*120*k*t)*(.13/k) for k in range(1,6))+np.sin(2*np.pi*9000*t)*.013+lp(noise,500)*.02)*env
 elif kind=='ballast_arc':
  a=(bp(noise,2000,10000)*.6+np.sin(2*np.pi*120*t)*.25)*np.exp(-u*7)*(.3+.7*(rng.random(len(t))<.1))*np.minimum(t/.001,1)
 elif kind in ('camcorder_motor','zoom_servo','af_motor'):
  f={'camcorder_motor':180,'zoom_servo':550,'af_motor':950}[kind];ph=2*np.pi*np.cumsum(f*(1+.3*np.sin(np.pi*u)))/SR
  a=(np.sin(ph)*.3+lp(noise,1600)*.15)*env
 elif kind=='overhead_drag':
  a=(bp(noise,180,2700)*.5+np.sin(2*np.pi*(82*t+10*t*t))* .17)*env*(.7+.3*np.sin(2*np.pi*11*t))
 elif kind=='door_latch':
  a=(np.sin(2*np.pi*730*t)*.4+bp(noise,400,6000)*.4)*np.exp(-u*24)*np.minimum(t/.001,1)
 elif kind=='door_hinge':
  f=230+110*np.sin(np.pi*u)+12*np.sin(2*np.pi*22*t);a=(np.sin(2*np.pi*np.cumsum(f)/SR)*.5+bp(noise,450,2200)*.12)*env
 elif kind=='tape_hiss':
  a=bp(noise,2000,14000)*env*.3
 elif kind=='low_drone':
  a=(np.sin(2*np.pi*42*t)*.5+np.sin(2*np.pi*63.1*t)*.2+lp(noise,150)*.3)*env
 elif kind=='stem_snap':
  a=(bp(noise,1800,9000)*.6+np.sin(2*np.pi*970*t)*.2)*np.exp(-u*35)*np.minimum(t/.001,1)
 elif kind in ('fruit_thud','fruit_cut'):
  a=(np.sin(2*np.pi*(130*t-40*t*t/max(d,.01)))*.5+bp(noise,300,3000)*.45)*np.exp(-u*(14 if kind=='fruit_thud' else 6))*np.minimum(t/.002,1)
 elif kind in ('grain_pour','grain_rake'):
  clicks=rng.random(len(t))<.014;a=(bp(noise,700,7000)*clicks*2+bp(noise,200,2000)*.2)*env
 elif kind=='container_clang':
  a=sum(g*np.sin(2*np.pi*f*t)*np.exp(-t*k) for f,g,k in [(135,.7,4),(380,.35,6),(717,.2,8),(1220,.13,12)])*np.minimum(t/.001,1)+bp(noise,300,5000)*np.exp(-u*30)*.25
 elif kind=='crane_motor':
  a=(np.sin(2*np.pi*115*t)*.35+np.sin(2*np.pi*232*t)*.1+lp(noise,1700)*.3)*env
 elif kind=='burlap_tear':
  a=bp(noise,450,6500)*env*(.35+.65*np.maximum(np.sin(2*np.pi*48*t),0))
 elif kind in ('hull_creak','roaster_drum'):
  a=(lp(noise,350)*.4+np.sin(2*np.pi*(55 if kind=='hull_creak' else 82)*t)*.3)*env*(.7+.3*np.sin(2*np.pi*3*t))
 elif kind=='bean_crack':
  a=bp(noise,1500,9500)*np.exp(-u*35)*np.minimum(t/.0005,1)
 elif kind=='grinder':
  f=850+160*np.sin(np.pi*u);a=(np.sin(2*np.pi*np.cumsum(f)/SR)*.2+bp(noise,900,7000)*.5)*env
 elif kind=='tamp':
  a=(np.sin(2*np.pi*155*t)*.5+lp(noise,2200)*.5)*np.exp(-u*18)*np.minimum(t/.001,1)
 elif kind=='coffee_pour':
  a=(bp(noise,700,6500)*.35+np.sin(2*np.pi*(1800*t+300*t*t/max(d,.01)))*.1)*env
 elif kind=='thunder':
  a=(lp(noise,260)*.85+bp(noise,300,1600)*.18)*np.minimum(t/.05,1)*np.exp(-u*3)*(.65+.35*np.sin(2*np.pi*3*t)**2)
 elif kind=='heartbeat':
  a=np.zeros(len(t))
  for offset,vol in [(0,1),(.16,.65)]:
   q=np.maximum(t-offset,0);a+=vol*(np.sin(2*np.pi*65*q)+lp(noise,150)*.3)*np.exp(-q*28)*np.minimum(q/.008,1)*(t>=offset)
 elif kind=='rope_creak':
  f=130+80*np.sin(np.pi*u)+14*np.sin(2*np.pi*21*t);a=(np.sin(2*np.pi*np.cumsum(f)/SR)*.6+bp(noise,400,2600)*.25)*env
 elif kind in ('wood_step','dirt_step','stone_step'):
  f,lo,hi={'wood_step':(165,160,2500),'dirt_step':(90,450,5500),'stone_step':(480,650,6500)}[kind]
  a=(np.sin(2*np.pi*f*t)*.35+bp(noise,lo,hi)*.6)*np.exp(-u*17)*np.minimum(t/.002,1)
 elif kind=='lighthouse_ignite':
  a=(np.sin(2*np.pi*42*t)*np.exp(-t*2)*.7+bp(noise,300,2000)*env*.4+(np.sin(2*np.pi*2200*t)+.35*np.sin(2*np.pi*3370*t))*env*.08)*np.minimum(t/.03,1)
 elif kind=='camera_shutter':
  a=(bp(noise,500,6500)*.6+np.sin(2*np.pi*850*t)*.2)*np.exp(-u*30)*np.minimum(t/.0005,1)
 elif kind=='cat_meow':
  f=480+220*np.sin(np.pi*u)-140*u;ph=2*np.pi*np.cumsum(f)/SR
  a=(np.sin(ph)+.35*np.sin(2*ph)+.15*np.sin(3*ph))*env*(.85+.15*np.sin(2*np.pi*20*t))
 elif kind=='cat_purr':
  a=(lp(noise,550)*.5+np.sin(2*np.pi*80*t)*.2)*(.1+.9*np.maximum(np.sin(2*np.pi*26*t),0)**2)*env
 elif kind in ('ceramic_clink','print_pop','keyboard_click'):
  f,decay={'ceramic_clink':(2200,12),'print_pop':(430,25),'keyboard_click':(1400,35)}[kind]
  a=(np.sin(2*np.pi*f*t)*.5+bp(noise,800,7000)*.3)*np.exp(-u*decay)*np.minimum(t/.001,1)
 elif kind=='cartoon_boing':
  f=180+320*np.exp(-t*7)*np.cos(2*np.pi*7*t);a=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-u*4)*np.minimum(t/.004,1)
 elif kind=='riso_feed':
  a=(bp(noise,450,5800)*.45+np.sin(2*np.pi*120*t)*.12)*env*(.65+.35*np.sin(2*np.pi*29*t))
 elif kind=='riso_drum':
  pulse=np.maximum(np.sin(2*np.pi*float(p.get('rate',7))*t),0)**12
  a=(lp(noise,700)*.4+bp(noise,1200,5000)*pulse*.4+np.sin(2*np.pi*73*t)*.13)*env
 elif kind=='freewheel':
  pulse=np.maximum(np.sin(2*np.pi*float(p.get('rate',35))*t),0)**22
  a=bp(noise,1800,9000)*pulse*env
 elif kind=='brake_squeal':
  f=1300+240*np.sin(np.pi*u)+24*np.sin(2*np.pi*37*t);ph=2*np.pi*np.cumsum(f)/SR
  a=(np.sin(ph)*.4+bp(noise,2200,9000)*.2)*env
 elif kind=='bread_crunch':
  a=bp(noise,650,7800)*np.exp(-u*5)*(.25+.75*(rng.random(len(t))<.065))*np.minimum(t/.003,1)
 elif kind=='church_bell':
  f=float(p.get('frequency',330));a=sum(g*np.sin(2*np.pi*f*r*t)*np.exp(-t*k) for r,g,k in [(1,.75,.9),(2.02,.4,1.6),(2.77,.22,2.4),(4.07,.12,3.8)])*np.minimum(t/.002,1)*np.minimum((d-t)/.08,1)
 elif kind=='paper_land':
  a=(bp(noise,400,6000)*.6+lp(noise,250)*.3)*np.exp(-u*12)*np.minimum(t/.002,1)
 elif kind=='projector_clatter':
  rate=float(p.get('rate',24));pulse=np.maximum(np.sin(2*np.pi*rate*t),0)**20
  a=(bp(noise,500,6200)*(.08+.65*pulse)+np.sin(2*np.pi*96*t)*.035)*np.minimum(t/.2,1)*np.minimum((d-t)/.2,1)
 elif kind=='porcelain_clink':
  f=float(p.get('frequency',2600));a=sum(g*np.sin(2*np.pi*f*r*t)*np.exp(-t*k) for r,g,k in [(1,.7,14),(1.72,.3,25),(2.31,.15,35)])*np.minimum(t/.001,1)
 elif kind in ('sugar_step','sugar_crunch'):
  clicks=rng.random(len(t))<.008;a=bp(noise,1100,9000)*clicks*4*np.exp(-u*7)+bp(noise,600,4400)*.1*np.exp(-u*6)
 elif kind in ('rubber_creak','rubber_boing'):
  f=(180+140*np.sin(np.pi*u)+22*np.sin(2*np.pi*19*t)) if kind=='rubber_creak' else (95+240*np.exp(-t*8))
  ph=2*np.pi*np.cumsum(f)/SR;a=(np.sin(ph)+.3*np.sin(3*ph))*np.exp(-u*4)*np.minimum(t/.004,1)
 elif kind in ('drain_slurp','water_gurgle'):
  f=170+150*np.sin(2*np.pi*8*t)+70*np.sin(2*np.pi*17*t);ph=2*np.pi*np.cumsum(f)/SR
  a=(np.sin(ph)*.5+bp(noise,250,2200)*.35)*env*(.4+.6*np.maximum(np.sin(2*np.pi*11*t),0))
 elif kind=='alarm_ring':
  a=(np.sin(2*np.pi*1800*t)+.4*np.sin(2*np.pi*2930*t))*(.25+.75*np.maximum(np.sin(2*np.pi*18*t),0))*np.minimum(t/.003,1)*np.minimum((d-t)/.05,1)
 elif kind in ('portal_open','portal_close','portal_suck','portal_whoosh'):
  rising=kind in ('portal_open','portal_whoosh');f=(80+900*u*u) if rising else (980-900*u*u)
  ph=2*np.pi*np.cumsum(f)/SR;a=(np.sin(ph)*.3+bp(noise,200,4000)*.6)*env*(.8+.2*np.sin(2*np.pi*23*t))
 elif kind=='portal_hum':
  a=(np.sin(2*np.pi*73*t)+.3*np.sin(2*np.pi*147.4*t)+lp(noise,500)*.15)*env*(.8+.2*np.sin(2*np.pi*4*t))
 elif kind in ('jelly_glorp','jelly_slide','jelly_squish','cartoon_gulp','cartoon_slurp'):
  f=150+190*np.sin(np.pi*u)+50*np.sin(2*np.pi*13*t);ph=2*np.pi*np.cumsum(f)/SR
  a=(np.sin(ph)*.6+bp(noise,350,2400)*.45)*env*(.4+.6*np.maximum(np.sin(2*np.pi*(5 if kind=='jelly_slide' else 9)*t),0))
 elif kind=='wet_blink':
  a=(bp(noise,600,3400)*.45+np.sin(2*np.pi*(500*t-180*t*t/max(d,.01)))*.2)*np.exp(-u*14)*np.minimum(t/.001,1)
 elif kind=='pigeon_coo':
  ph=2*np.pi*np.cumsum(330+50*np.sin(2*np.pi*2.4*t))/SR;a=(np.sin(ph)+.24*np.sin(2*ph))*env*np.maximum(np.sin(2*np.pi*2.4*t),0)**.5
 elif kind=='cartoon_chomp':
  a=(bp(noise,700,6500)*.6+np.sin(2*np.pi*160*t)*.3)*np.exp(-u*9)*np.minimum(t/.001,1)
 elif kind=='cartoon_wheee':
  f=650+800*np.sin(np.pi*u);ph=2*np.pi*np.cumsum(f)/SR;a=(np.sin(ph)+.15*np.sin(2*ph))*env
 elif kind=='crt_power_on':
  f=280+1000*np.exp(-t*8);a=(np.sin(2*np.pi*np.cumsum(f)/SR)*.25+bp(noise,1500,9000)*.3)*np.exp(-u*6)+np.sin(2*np.pi*15625*t)*.025*env
 elif kind=='radio_squelch':
  a=bp(noise,600,5000)*(.5+.5*np.sin(2*np.pi*83*t))*np.exp(-u*5)*np.minimum(t/.004,1)
 elif kind=='cassette_click':
  a=(bp(noise,800,6000)*.6+np.sin(2*np.pi*730*t)*.2)*np.exp(-u*32)*np.minimum(t/.0005,1)
 elif kind in ('cassette_motor','tape_tracking'):
  a=(lp(noise,1400)*.16+np.sin(2*np.pi*(110*t+.12*np.sin(2*np.pi*.8*t)))*.08+bp(noise,3000,11000)*.04)*env
 elif kind=='tire_hiss':
  a=bp(noise,1500,9000)*env*(.7+.3*np.sin(2*np.pi*17*t))
 elif kind=='throttle_twist':
  f=90+230*u;ph=2*np.pi*np.cumsum(f)/SR;a=(np.sin(ph)+.25*np.sin(3*ph)+lp(noise,750)*.35)*env
 elif kind=='bridge_bell':
  f=float(p.get('frequency',780));a=sum(g*np.sin(2*np.pi*f*r*t)*np.exp(-t*k) for r,g,k in [(1,.8,2),(2.76,.3,4),(5.4,.16,7)])*np.minimum(t/.002,1)*np.minimum((d-t)/.04,1)
 elif kind=='impact':
  a=(lp(noise,1800)*.8+np.sin(2*np.pi*(70*t-18*t*t/max(d,.1)))*.5+bp(noise,2400,9000)*.2)*np.exp(-u*13)*np.minimum(t/.001,1)
 elif kind in ('metal_scrape','sparks'):
  a=(bp(noise,1600,10500)*.5+np.sin(2*np.pi*(1900*t+700*t*t))*.2)*env*(.3+.7*(rng.random(len(t))<.06))
 elif kind in ('rocket_ignition','rocket_roar'):
  a=(lp(noise,550)*.8+bp(noise,700,6000)*.3+np.sin(2*np.pi*47*t)*.1)*np.minimum(t/(.025 if kind=='rocket_ignition' else .3),1)*np.minimum((d-t)/.15,1)
 elif kind=='light_switch':
  a=(bp(noise,1500,7500)*.7+np.sin(2*np.pi*950*t)*.2)*np.exp(-u*45)*np.minimum(t/.0005,1)
 elif kind=='wood_mould':
  a=(np.sin(2*np.pi*155*t)*.6+np.sin(2*np.pi*410*t)*.17+bp(noise,350,3200)*.35)*np.exp(-u*19)*np.minimum(t/.001,1)
 elif kind=='train_rail':
  interval=float(p.get('interval',.42));pulse=np.maximum(np.sin(2*np.pi*t/interval),0)**30
  a=(lp(noise,430)*.35+bp(noise,500,3400)*pulse*.45+np.sin(2*np.pi*58*t)*.1)*np.minimum(t/.4,1)*np.minimum((d-t)/.4,1)
 elif kind=='box_lid':
  a=(bp(noise,200,2400)*.5+np.sin(2*np.pi*165*t)*.25)*np.exp(-u*12)*np.minimum(t/.002,1)
 elif kind=='pastry_bite':
  a=bp(noise,500,6500)*np.exp(-u*7)*(.3+.7*(rng.random(len(t))<.08))*np.minimum(t/.003,1)
 elif kind=='handwriting':
  a=bp(noise,1200,6900)*(.25+.75*np.maximum(np.sin(2*np.pi*float(p.get('speed',6))*t),0)**2)*env
 elif kind=='kettle_steam':
  a=(bp(noise,2000,9500)*.45+np.sin(2*np.pi*(2300*t+25*t*t))*.04)*np.minimum(t/.6,1)*np.minimum((d-t)/.3,1)
 elif kind=='cicadas':
  rate=float(p.get('rate',38));a=bp(noise,3400,8600)*(.3+.7*np.maximum(np.sin(2*np.pi*rate*t),0)**2)*(.7+.3*np.sin(2*np.pi*.8*t))*np.minimum(t/.4,1)*np.minimum((d-t)/.4,1)
 elif kind in ('paper','brush','scratch'):
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
 elif kind=='match_strike':
  a=bp(noise,1700,10500)*np.exp(-u*7)*np.minimum(t/.003,1)+lp(noise,1300)*np.exp(-((u-.48)/.27)**2)*.4
 elif kind=='lamp_ignite':
  a=(lp(noise,650)*.65+bp(noise,1300,7000)*.2)*np.exp(-u*3)*np.minimum(t/.025,1)
 elif kind=='lamp_snuff':
  a=(bp(noise,400,4700)*.6+lp(noise,450)*.3)*np.exp(-u*6)*np.minimum(t/.008,1)
 elif kind=='rod_tap':
  a=(np.sin(2*np.pi*750*t)*.55+np.sin(2*np.pi*1930*t)*.2+bp(noise,1400,7000)*.25)*np.exp(-u*25)*np.minimum(t/.0008,1)
 elif kind in ('leather_flap','wing_flap'):
  rate=float(p.get('rate',4 if kind=='wing_flap' else 2.5));pulse=np.maximum(np.sin(2*np.pi*rate*t),0)**3
  a=(bp(noise,200,2300)*.8+np.sin(2*np.pi*95*t)*.12)*pulse*env
 elif kind=='leather_step':
  a=(lp(noise,1100)*.55+np.sin(2*np.pi*(120*t-38*t*t/max(d,.01)))*.4+bp(noise,1500,5000)*.12)*np.exp(-u*17)*np.minimum(t/.002,1)
 elif kind=='bow_creak':
  f=230+100*u+15*np.sin(2*np.pi*27*t);phase=2*np.pi*np.cumsum(f)/SR
  a=(np.sin(phase)+.4*np.sin(phase*3)+bp(noise,500,3600)*.3)*env*(.6+.4*np.sin(2*np.pi*41*t))
 elif kind=='bow_twang':
  f=float(p.get('frequency',170))*(1+.12*np.exp(-t*45));phase=2*np.pi*np.cumsum(f)/SR
  a=sum(np.sin(phase*k)*np.exp(-t*(7+k*2))/k for k in range(1,9))*np.exp(-u*4)*np.minimum(t/.001,1)
 elif kind=='arrow_whoosh':
  a=bp(noise,1100,11000)*np.exp(-((u-.43)/.22)**2)*(.7+.3*np.sin(2*np.pi*73*t))
 elif kind=='leather_thwack':
  a=(lp(noise,1600)*.65+bp(noise,1800,6500)*.22+np.sin(2*np.pi*135*t)*.3)*np.exp(-u*20)*np.minimum(t/.001,1)
 elif kind=='clapper':
  a=(np.sin(2*np.pi*1100*t)*.3+np.sin(2*np.pi*2280*t)*.18+bp(noise,1700,10000)*.6)*np.exp(-u*32)*np.minimum(t/.0008,1)
 elif kind=='theatre_room':
  a=(lp(noise,650)*.6+bp(noise,1000,3400)*.05+np.sin(2*np.pi*50*t)*.035)*np.minimum(t/.25,1)*np.minimum((d-t)/.35,1)
 elif kind=='breath':
  a=bp(noise,450,4000)*env*(.65+.35*np.sin(np.pi*u))
 elif kind=='taiko':
  variant=p.get('variant','nagado')
  if variant not in ('odaiko','nagado','shime','ka'):raise ValueError('Unknown taiko '+str(variant))
  if variant=='ka':
   a=sum(g*np.sin(2*np.pi*f*t)*np.exp(-t*k) for f,g,k in [(980,.5,38),(2320,.3,65),(4180,.14,95)])+bp(noise,1700,10500)*np.exp(-t*160)*.5
  else:
   f,decay={'odaiko':(57,2.1),'nagado':(103,4.2),'shime':(220,9)}[variant];f*=float(p.get('tuning',1));phase=2*np.pi*np.cumsum(f*(1+.12*np.exp(-t*35)))/SR
   a=sum(g*np.sin(phase*r)*np.exp(-t*decay*(1+i*.35)) for i,(r,g) in enumerate([(1,1),(1.594,.55),(2.136,.33),(2.296,.2),(2.653,.14),(2.918,.08)]))
   a+=bp(noise,800,7000)*np.exp(-t*(65 if variant=='odaiko' else 110))*.4
  a*=np.minimum(t/.001,1)*np.minimum((d-t)/.025,1)
 elif kind=='drum_kit':
  variant=p.get('variant','kick')
  if variant=='kick':
   phase=2*np.pi*np.cumsum(48+125*np.exp(-t*38))/SR;a=np.sin(phase)*np.exp(-t*13)+bp(noise,2500,9000)*np.exp(-t*150)*.15
  elif variant=='snare':
   a=(np.sin(2*np.pi*185*t)*.45+np.sin(2*np.pi*330*t)*.2)*np.exp(-t*24)+bp(noise,1700,12500)*np.exp(-t*17)*.7
  elif variant=='clap':
   a=np.zeros(len(t))
   for onset in [0,.012,.027,.047]:
    q=t-onset;valid=q>=0;a[valid]+=bp(noise,800,6500)[valid]*np.exp(-q[valid]*(90 if onset<.047 else 25))*.5
  elif variant in ('hat','crash'):
   metal=sum(np.sin(2*np.pi*f*t) for f in [3517,4873,6121,7933,10103,12479])/6
   a=bp(noise*.7+metal*.5,4000,18000)*np.exp(-t*(70 if variant=='hat' else 3.5))
  else:raise ValueError('Unknown drum kit '+str(variant))
  a*=np.minimum(t/.0005,1)*np.minimum((d-t)/.015,1)
 elif kind=='ship_horn':
  f=float(p.get('frequency',95));phase=2*np.pi*f*t;a=sum(np.sin(phase*k)/k**1.3 for k in range(1,14))+.45*sum(np.sin(phase*1.498*k)/k**1.5 for k in range(1,8))
  a=lp(a,750 if p.get('far') else 2100)*np.minimum(t/.22,1)*np.minimum((d-t)/.4,1)
 elif kind=='marker_squeak':
  f=1350+270*np.sin(2*np.pi*5*t)+100*np.sin(2*np.pi*23*t);a=(np.sin(2*np.pi*np.cumsum(f)/SR)*.3+bp(noise,600,4400)*.55)*env
 elif kind=='magnet_clack':
  a=(np.sin(2*np.pi*470*t)*.35+np.sin(2*np.pi*2010*t)*.15+bp(noise,1500,10000)*.5)*np.exp(-u*25)*np.minimum(t/.001,1)
 elif kind=='suction_pop':
  f=310-190*np.minimum(u*5,1);a=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-u*16)*.6+bp(noise,400,7000)*np.exp(-u*35)*.3
 elif kind=='ruler_ring':
  a=sum(g*np.sin(2*np.pi*f*t)*np.exp(-t*k) for f,g,k in [(440,.5,3),(1220,.3,5),(2370,.15,9),(3920,.08,12)])*np.minimum(t/.001,1)
 elif kind=='eraser_felt':
  a=bp(noise,150,2700)*env*(.55+.45*np.sin(2*np.pi*7*t)**2)
 elif kind=='rubber_stamp':
  a=(lp(noise,1800)*.55+np.sin(2*np.pi*125*t)*.4+bp(noise,2100,6500)*.15)*np.exp(-u*17)*np.minimum(t/.001,1)
 elif kind=='room_hvac':
  a=(lp(noise,550)*.6+np.sin(2*np.pi*60*t)*.055+np.sin(2*np.pi*120*t)*.02)*np.minimum(t/.25,1)*np.minimum((d-t)/.3,1)
 elif kind=='baren_rub':
  a=bp(noise,180,2600)*env*(.45+.55*np.sin(2*np.pi*9*t)**2)
 elif kind=='scroll_slide':
  a=bp(noise,350,6500)*env*(.7+.3*np.sin(2*np.pi*31*t))+.08*np.sin(2*np.pi*180*t)*env
 elif kind=='hollow_wood_step':
  a=sum(g*np.sin(2*np.pi*f*t)*np.exp(-t*k) for f,g,k in [(270,.55,40),(710,.3,65),(1680,.15,90)])+bp(noise,800,5500)*np.exp(-t*100)*.2
  a*=np.minimum(t/.001,1)
 elif kind=='wind_chime':
  a=sum(g*np.sin(2*np.pi*f*t)*np.exp(-t*k) for f,g,k in [(2360,.55,2),(5150,.3,3),(7980,.15,4)])*np.minimum(t/.001,1)*np.minimum((d-t)/.03,1)
 elif kind=='field_trickle':
  a=bp(noise,800,6500)*.3
  for onset in rng.uniform(0,d,max(2,int(d*15))):
   q=t-onset;valid=q>=0;f=rng.uniform(1100,2900);a[valid]+=.15*np.sin(2*np.pi*(f*q[valid]-f*q[valid]**2*.7))*np.exp(-q[valid]*45)
  a*=np.minimum(t/.1,1)*np.minimum((d-t)/.15,1)
 elif kind=='sea_swell':
  swell=(.25+.75*np.sin(np.pi*u)**2);a=(lp(noise,650)*.65+bp(noise,900,7000)*.2)*swell*np.minimum(t/.25,1)*np.minimum((d-t)/.35,1)
 elif kind=='goose':
  f=350+40*np.sin(np.pi*u)+10*np.sin(2*np.pi*26*t);phase=2*np.pi*np.cumsum(f)/SR;v=sum(np.sin(phase*k)/k for k in range(1,13));a=(bp(v,450,2800)+bp(noise,800,2700)*.12)*env
 elif kind=='kite_call':
  f=2400-900*u+180*np.sin(2*np.pi*7*t);a=(np.sin(2*np.pi*np.cumsum(f)/SR)+.16*np.sin(2*np.pi*np.cumsum(f*2)/SR))*env*(.6+.4*np.sin(2*np.pi*7*t)**2)
 elif kind=='bubble_splash':
  f=640-460*np.minimum(u*3,1);a=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-u*8)*.45+bp(noise,300,6000)*np.exp(-u*11)*.35
  for onset in rng.uniform(.02,max(.021,d*.65),5):
   q=t-onset;valid=q>=0;a[valid]+=.1*np.sin(2*np.pi*rng.uniform(800,1900)*q[valid])*np.exp(-q[valid]*40)
  a*=np.minimum(t/.003,1)
 elif kind=='wood_knock':
  a=np.zeros(len(t))
  for onset,gain in [(0,1),(.21,float(p.get('bounce_gain',.3)))]:
   q=t-onset;valid=q>=0;a[valid]+=gain*(.5*np.sin(2*np.pi*310*q[valid])+.25*np.sin(2*np.pi*890*q[valid])+.15*np.sin(2*np.pi*1730*q[valid])+bp(noise,600,4000)[valid]*.25)*np.exp(-q[valid]*45)
 elif kind=='ceramic_clack':
  a=sum(g*np.sin(2*np.pi*f*t)*np.exp(-t*k) for f,g,k in [(1620,.5,12),(3410,.3,18),(5370,.15,29)])+bp(noise,1700,11000)*np.exp(-t*130)*.3
  a*=np.minimum(t/.001,1)
 elif kind=='stone_thunk':
  a=(np.sin(2*np.pi*95*t)*.5+np.sin(2*np.pi*247*t)*.2+lp(noise,1700)*.4)*np.exp(-t*28)*np.minimum(t/.002,1)
 elif kind=='electric_hum':
  f=float(p.get('frequency',60));a=(np.sin(2*np.pi*f*t)*.5+.2*np.sin(2*np.pi*f*2*t)+.08*np.sin(2*np.pi*f*4*t)+lp(noise,1100)*.1)*np.minimum(t/.08,1)*np.minimum((d-t)/.12,1)
 elif kind=='scissor_snip':
  a=(bp(noise,1500,10500)*.65+np.sin(2*np.pi*2700*t)*.1)*np.exp(-u*24)*np.minimum(t/.001,1)
 elif kind=='paper_fold':
  a=bp(noise,350,7000)*env*(.4+.6*np.sin(2*np.pi*36*t)**2)+bp(noise,1900,9000)*np.exp(-((u-.65)/.1)**2)*.25
 elif kind=='unfold_snap':
  a=bp(noise,400,8500)*(np.exp(-u*18)+.3*np.exp(-((u-.45)/.18)**2))+np.sin(2*np.pi*130*t)*np.exp(-u*12)*.2
 elif kind=='cardboard_step':
  a=(np.sin(2*np.pi*55*t)*.5+lp(noise,1300)*.5+bp(noise,1900,6000)*.12)*np.exp(-u*17)*np.minimum(t/.002,1)
 elif kind=='candle_puff':
  a=bp(noise,300,3500)*np.exp(-((u-.25)/.2)**2)+lp(noise,650)*np.exp(-u*5)*.2
 elif kind=='candle_whoomp':
  a=(lp(noise,850)*.65+np.sin(2*np.pi*(95*t-32*t*t/max(d,.01)))*.3+bp(noise,1300,5000)*.2)*np.exp(-((u-.28)/.23)**2)
 elif kind=='firecracker':
  a=bp(noise,700,18000)*np.exp(-t*140)+lp(noise,900)*np.exp(-t*32)*.5+np.sin(2*np.pi*105*t)*np.exp(-t*38)*.2
  a*=np.minimum(t/.0004,1)
 elif kind=='paper_peel':
  a=bp(noise,550,7500)*env*(.45+.55*np.maximum(np.sin(2*np.pi*(13+20*u)*t),0)**2)
 elif kind=='dazzled_whimper':
  f=310-100*u+15*np.sin(2*np.pi*7*t);phase=2*np.pi*np.cumsum(f)/SR;v=sum(np.sin(phase*k)/k for k in range(1,15));a=(bp(v,400,2700)*.55+bp(noise,800,2300)*.08)*env
 elif kind=='brush_sweep':
  rate=float(p.get('rate',2.2));a=bp(noise,1100,10500)*(.35+.65*np.sin(2*np.pi*rate*t)**2)*np.minimum(t/.04,1)*np.minimum((d-t)/.06,1)
 elif kind=='brush_tap':
  a=(bp(noise,1100,11000)*.7+np.sin(2*np.pi*190*t)*.1)*np.exp(-t*28)*np.minimum(t/.003,1)
 elif kind=='firework':
  launch=min(.42,d*.35);f=650+1950*np.clip(t/max(launch,.01),0,1);a=np.sin(2*np.pi*np.cumsum(f)/SR)*np.sin(np.pi*np.clip(t/max(launch,.01),0,1))**2*.18
  q=t-launch;valid=q>=0;a[valid]+=(lp(noise,1000)[valid]*.7+np.sin(2*np.pi*70*q[valid])*.4+bp(noise,1700,12000)[valid]*.35)*np.exp(-q[valid]*12)
  for onset in launch+rng.uniform(.04,max(.05,d-launch-.02),18):
   q=t-onset;valid=q>=0;a[valid]+=bp(noise,2000,14000)[valid]*np.exp(-q[valid]*100)*rng.uniform(.03,.12)
  a*=np.minimum((d-t)/.03,1)
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
 elif kind=='metal_tick':
  a=sum(g*np.sin(2*np.pi*f*t)*np.exp(-t*k) for f,g,k in [(3100,.45,60),(4870,.3,80),(7190,.18,105)])+bp(noise,3200,8500)*np.exp(-t*170)*.25
  a*=np.minimum(t/.0008,1)
 elif kind=='acrylic_tok':
  a=sum(g*np.sin(2*np.pi*f*t)*np.exp(-t*k) for f,g,k in [(1060,.5,70),(1720,.25,110),(2670,.12,160)])+bp(noise,600,3100)*np.exp(-t*190)*.18
  a*=np.minimum(t/.001,1)
 elif kind=='bow_rosin':
  a=(bp(noise,900,6500)*.6+np.sin(2*np.pi*230*t)*.1)*env*(.7+.3*np.sin(2*np.pi*37*t))
 elif kind=='wet_steps':
  a=np.zeros(len(t))
  for onset in np.arange(0,d,float(p.get('interval',.55))):
   q=t-onset;valid=q>=0;a[valid]+=(lp(noise,1400)[valid]*.7+np.sin(2*np.pi*95*q[valid])*.3)*np.exp(-q[valid]*25)*np.minimum(q[valid]/.005,1)
 elif kind=='nylon':
  a=bp(noise,650,8000)*env*(.5+.5*np.maximum(np.sin(2*np.pi*27*t),0))
 elif kind=='rib_click':
  a=(bp(noise,1500,9500)*.4+np.sin(2*np.pi*2150*t)*.3+np.sin(2*np.pi*3670*t)*.16)*np.exp(-u*22)*np.minimum(t/.001,1)
 elif kind=='umbrella_fwump':
  a=(lp(noise,1100)*.6+np.sin(2*np.pi*(130*t-50*t*t/max(d,.01)))*.35)*np.exp(-((u-.25)/.23)**2)
 elif kind=='paint_dab':
  a=(bp(noise,300,4500)*.4+np.sin(2*np.pi*(420*t-220*t*t/max(d,.01)))*.3)*np.exp(-u*10)*np.minimum(t/.003,1)
 elif kind=='knife_scrape':
  a=(bp(noise,1700,10500)*.6+.12*np.sin(2*np.pi*3200*t))*env*(.6+.4*np.sin(2*np.pi*42*t))
 elif kind=='shaker':
  a=bp(noise,2500,11000)*np.exp(-u*6)*np.minimum(t/.005,1)
 elif kind=='pen_scratch':
  speed=np.clip(float(p.get('speed',1)),.05,4);a=bp(noise,700, min(16000,4200+speed*1800))*env*(.65+.35*np.sin(2*np.pi*(17+speed*19)*t))
 elif kind=='pen_tap':
  a=(bp(noise,1000,8500)*.4+np.sin(2*np.pi*1720*t)*.3+np.sin(2*np.pi*2850*t)*.12)*np.exp(-u*28)*np.minimum(t/.001,1)
 elif kind=='ink_bloom':
  f=650-380*np.minimum(u*3,1);phase=2*np.pi*np.cumsum(f)/SR;a=(np.sin(phase)*.3+lp(noise,1100)*.35)*np.exp(-u*7)*np.minimum(t/.008,1)
 elif kind=='handoff_rub':
  a=bp(noise,240,3500)*env*(.75+.25*np.sin(2*np.pi*13*t))
 elif kind=='turret_click':
  a=(bp(noise,1000,9000)*.4+np.sin(2*np.pi*1850*t)*.25+np.sin(2*np.pi*4120*t)*.15)*np.exp(-u*23)*np.minimum(t/.001,1)
 elif kind=='focus_servo':
  f=float(p.get('frequency',135))*(1+.3*np.sin(np.pi*u));phase=2*np.pi*np.cumsum(f)/SR;a=(np.sin(phase)*.3+np.sin(phase*3)*.1+bp(noise,350,1600)*.2)*env
 elif kind=='glass_pen':
  a=bp(noise,1900,10500)*env*(.6+.4*np.sin(2*np.pi*51*t))
 elif kind=='scan_noise':
  a=bp(noise,1100,6800)*env*(.4+.6*np.sin(2*np.pi*float(p.get('rate',7))*t)**2)
 elif kind=='lab_room':
  a=(lp(noise,800)*.5+np.sin(2*np.pi*60*t)*.08+np.sin(2*np.pi*120*t)*.03)*np.minimum(t/.2,1)*np.minimum((d-t)/.2,1)
 elif kind=='glass_shatter':
  a=bp(noise,1700,15000)*np.exp(-t*65)*.7
  for onset in np.r_[0,rng.uniform(.015,max(.016,d*.65),18)]:
   q=t-onset;valid=q>=0;f=rng.uniform(1800,8700)
   a[valid]+=rng.uniform(.03,.13)*np.sin(2*np.pi*f*q[valid])*np.exp(-q[valid]*rng.uniform(8,24))
 elif kind=='lead_creak':
  f=160+65*np.sin(np.pi*u)+12*np.sin(2*np.pi*19*t);phase=2*np.pi*np.cumsum(f)/SR
  a=(sum(np.sin(phase*k)/k for k in range(1,9))*.25+bp(noise,450,2500)*.2)*env*(.55+.45*np.sin(2*np.pi*11*t)**2)
 elif kind=='wing_flutter':
  pulse=np.maximum(np.sin(2*np.pi*float(p.get('rate',9))*t),0)**2
  a=(bp(noise,400,5000)*.6+lp(noise,600)*.3)*pulse*env
 elif kind=='ballast_hum':
  a=(np.sin(2*np.pi*100*t)+.16*np.sin(2*np.pi*200*t)+.05*np.sin(2*np.pi*300*t)+lp(noise,450)*.12)*np.minimum(t/.15,1)*np.minimum((d-t)/.15,1)
 elif kind=='loupe_clack':
  a=(bp(noise,900,6500)*.4+np.sin(2*np.pi*1120*t)*.3)*np.exp(-t*80)+np.sin(2*np.pi*3270*t)*np.exp(-t*17)*.12
  a*=np.minimum(t/.001,1)
 elif kind=='marker_stroke':
  speed=np.clip(float(p.get('speed',1)),.05,4);a=(bp(noise,450,min(12000,3000+speed*1300))*.7+np.sin(2*np.pi*170*t)*.08)*env*(.7+.3*np.sin(2*np.pi*(13+speed*9)*t))
  if p.get('squeak'):a+=np.sin(2*np.pi*np.cumsum(1300+230*np.sin(2*np.pi*6*t))/SR)*env*.12
 elif kind=='magnet_board':
  a=(np.sin(2*np.pi*210*t)*.5+bp(noise,500,5000)*.3)*np.exp(-u*18)*np.minimum(t/.001,1)
 elif kind=='felt_erase':
  a=bp(noise,180,2800)*env*(.6+.4*np.sin(2*np.pi*5*t)**2)
 elif kind=='marker_cap':
  a=(bp(noise,1700,9000)*.6+np.sin(2*np.pi*2050*t)*.18)*np.exp(-u*30)*np.minimum(t/.001,1)
 elif kind=='marker_tray':
  a=(bp(noise,350,5000)*.35+np.sin(2*np.pi*730*t)*.25+np.sin(2*np.pi*1390*t)*.15)*np.exp(-u*15)*np.minimum(t/.001,1)
 elif kind=='projector_fan':
  a=(lp(noise,1200)*.65+np.sin(2*np.pi*145*t)*.08+np.sin(2*np.pi*290*t)*.03)*np.minimum(t/.25,1)*np.minimum((d-t)/.25,1)
 elif kind=='lamp_strike':
  a=bp(noise,1600,11500)*np.exp(-t*65)*.4+(np.sin(2*np.pi*100*t)*.13+bp(noise,800,2500)*.15)*np.minimum(t/.008,1)*np.exp(-u*3)
 elif kind=='relay_click':
  a=(bp(noise,1400,8500)*.6+np.sin(2*np.pi*2400*t)*.2)*np.exp(-u*32)*np.minimum(t/.0007,1)
 elif kind=='light_wash':
  a=(bp(noise,1200,7500)*.35+np.sin(2*np.pi*np.cumsum(900+850*u)/SR)*.08)*env
 elif kind=='degauss':
  phase=2*np.pi*np.cumsum(65-40*u)/SR;a=(np.sin(phase)+.2*np.sin(phase*3)+lp(noise,500)*.3)*np.exp(-u*7)*np.minimum(t/.004,1)
 elif kind=='buckling_key':
  body=155 if p.get('variant') in ('space','enter') else 235
  a=(bp(noise,1200,10000)*.5+np.sin(2*np.pi*body*t)*.35)*np.exp(-t*80)+np.sin(2*np.pi*3400*t)*np.exp(-t*38)*.12
  q=t-.025;valid=q>=0;a[valid]+=bp(noise,600,5000)[valid]*np.exp(-q[valid]*110)*.25
 elif kind in ('modem_handshake','modem_upload'):
  bits=rng.integers(0,2,max(2,int(d*300)+2));index=np.minimum((t*300).astype(int),len(bits)-1);f=np.where(bits[index],2400,1200)
  if kind=='modem_handshake':
   f=np.where(u<.22,2100,f);a=np.sin(2*np.pi*np.cumsum(f)/SR)*.45
   middle=(u>=.22)&(u<.42);a[middle]=.3*(np.sin(2*np.pi*1650*t[middle])+np.sin(2*np.pi*1850*t[middle]))
   a+=bp(noise,700,3100)*np.clip((u-.7)/.3,0,1)*.3
  else:a=np.sin(2*np.pi*np.cumsum(f)/SR)*.35+bp(noise,600,3200)*.25
  a=bp(a,300,3400)*np.minimum(t/.008,1)*np.minimum((d-t)/.02,1)
 elif kind in ('error_beep','bel'):
  f=1000 if kind=='bel' else float(p.get('frequency',640));phase=2*np.pi*f*t
  a=sum(np.sin(phase*k)/k for k in range(1,min(21,int(15000/f))+1,2))*np.minimum(t/.003,1)*np.minimum((d-t)/.008,1)
 elif kind=='terminal_fan':
  a=(lp(noise,950)*.4+np.sin(2*np.pi*120*t)*.15+np.sin(2*np.pi*15700*t)*.015)*np.minimum(t/.2,1)*np.minimum((d-t)/.2,1)
 elif kind=='bike_bell':
  a=sum(g*np.sin(2*np.pi*f*t)*np.exp(-t*k) for f,g,k in [(1600,.5,4),(2388,.25,6),(4080,.13,9)])*np.minimum(t/.001,1)
 elif kind=='grass_slide':
  a=bp(noise,250,4200)*env*(.6+.4*np.sin(2*np.pi*29*t)**2)
 elif kind=='catch_slap':
  a=(bp(noise,400,6500)*.5+np.sin(2*np.pi*180*t)*.3)*np.exp(-u*16)*np.minimum(t/.001,1)
 elif kind=='water_plop':
  f=460-330*np.minimum(u*3,1);a=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-u*8)*np.minimum(t/.004,1)+bp(noise,600,4500)*np.exp(-u*15)*.15
 elif kind in ('keycap_clack','switch_thock','board_tap','case_thud'):
  f,lo,hi,decay={'keycap_clack':(1700,1000,8500,28),'switch_thock':(230,300,5000,16),'board_tap':(640,500,6500,23),'case_thud':(95,80,1600,11)}[kind]
  a=(np.sin(2*np.pi*f*t)*.4+bp(noise,lo,hi)*.4)*np.exp(-u*decay)*np.minimum(t/.001,1)
 elif kind=='steps':
  a=np.zeros(len(t))
  for onset in np.arange(0,d,float(p.get('interval',.5))):
   q=t-onset;valid=q>=0;a[valid]+=(bp(noise,180,2200)[valid]*.5+np.sin(2*np.pi*115*q[valid])*.3)*np.exp(-q[valid]*35)*np.minimum(q[valid]/.003,1)
 else:raise ValueError('Unsupported material cue: '+kind)
 return chip_process(a,p.get('bits'),p.get('sample_rate'))

def saw(midi,duration):
 t=np.arange(max(1,round(duration*SR)))/SR;f=440*2**((float(midi)-69)/12);a=sum(np.sin(2*np.pi*f*k*t)/k*np.exp(-k/7) for k in range(1,min(24,int(18000/f))+1));edge=np.minimum(t/.008,1)*np.minimum((duration-t)/.04,1);return np.asarray(a*edge*.6,dtype=np.float32)


def synth_note(kind,midi,duration,**p):
 if kind=='saw':return saw(midi,duration)
 t=np.arange(max(1,round(duration*SR)))/SR;f=440*2**((float(midi)-69)/12);edge=np.minimum(t/.003,1)*np.minimum((duration-t)/.025,1)
 if kind in ('chip_pulse','chip_triangle','chip_wavetable'):
  rate=float(p.get('sample_rate',22050))
  if not np.isfinite(rate) or not 1000<=rate<=SR:raise ValueError('chip sample_rate must be1000..48000')
  clock=np.floor(t*rate)/rate;phase=(f*clock)%1
  if kind=='chip_pulse':
   duty=float(p.get('duty',.25))
   if not 0<duty<1:raise ValueError('chip duty must be0..1 exclusive')
   a=(np.where(phase<duty,1.,-1.)-(2*duty-1))*.5
  elif kind=='chip_triangle':a=2/np.pi*np.arcsin(np.sin(2*np.pi*phase))
  else:
   wave=p.get('wave','bell')
   if isinstance(wave,(list,tuple)):
    table=np.asarray(wave,dtype=float)
    if table.ndim!=1 or len(table)<2 or not np.isfinite(table).all():raise ValueError('Invalid chip wavetable')
    a=table[np.minimum((phase*len(table)).astype(int),len(table)-1)]
   elif wave=='triangle':a=2/np.pi*np.arcsin(np.sin(2*np.pi*phase))
   elif wave=='saw':a=phase*2-1
   elif wave=='sine':a=np.sin(2*np.pi*phase)
   else:a=np.sin(2*np.pi*phase)+.32*np.sin(2*np.pi*phase*3)+.16*np.sin(2*np.pi*phase*7)
   a/=max(float(np.max(np.abs(a))),1e-9)
  a=chip_process(a,p.get('bits',4 if kind=='chip_triangle' else 8),rate)*np.exp(-t*float(p.get('decay',.2)))
 elif kind=='whistle':
  ph=2*np.pi*np.cumsum(f*2**((.08*np.sin(2*np.pi*5*t)+float(p.get('glide',0))*np.exp(-t*12))/12))/SR
  breath=np.random.default_rng(6107).normal(size=len(t));breath=sosfilt(butter(2,[1500,6500],btype='bandpass',fs=SR,output='sos'),breath)
  a=(np.sin(ph)+.035*np.sin(2*ph)+.035*breath)*np.minimum(t/.035,1)*np.minimum((duration-t)/.07,1)
 elif kind=='theremin':
  vibrato=6*np.sin(2*np.pi*5.3*t);glide=float(p.get('glide',0))*np.exp(-t*5)
  ph=2*np.pi*np.cumsum(f*2**((vibrato/100+glide)/12))/SR;a=(np.sin(ph)+.07*np.sin(2*ph))*np.minimum(t/.07,1)*np.minimum((duration-t)/.12,1)
 elif kind=='fm_epiano':
  a=(np.sin(2*np.pi*f*t+1.6*np.sin(2*np.pi*f*2*t)*np.exp(-t*5))+.12*np.sin(2*np.pi*f*7*t)*np.exp(-t*15))*np.exp(-t*2.6/max(duration,.3))
 elif kind=='slap_bass':
  a=(np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*2*t)*np.exp(-t*7)+.23*np.sin(2*np.pi*f*8*t)*np.exp(-t*35))*np.exp(-t*5/max(duration,.3))
 elif kind=='synth_brass':
  a=sum(np.sin(2*np.pi*f*k*t)/k*np.exp(-k/6) for k in range(1,min(24,int(18000/f))+1))*np.minimum(t/.035,1)*np.exp(-t*1.2/max(duration,.1))
 elif kind=='lpg_plonk':
  value=float(p.get('value',0));index=float(p.get('fm_index',.3+2.4*np.clip((value+.4)/1.8,0,1)))
  mod=np.sin(2*np.pi*f*2.713*t)*index*np.exp(-t*5)
  a=(np.sin(2*np.pi*f*t+mod)+.12*np.sin(2*np.pi*f*4.12*t)*np.exp(-t*12))*np.exp(-t*(7-2*np.clip(value,0,1)))
 elif kind=='fm_glass':
  a=np.sin(2*np.pi*f*t+2.6*np.sin(2*np.pi*f*2.414*t)*np.exp(-t*4))*np.exp(-t*3/max(duration,.2));a+=.13*np.sin(2*np.pi*f*4.173*t)*np.exp(-t*8)
 elif kind=='sub808':
  phase=2*np.pi*np.cumsum(f*(1+.75*np.exp(-t*45)))/SR;a=np.tanh(1.4*(np.sin(phase)+.08*np.sin(2*phase)))*np.exp(-t*2.2/max(duration,.1))
 elif kind=='toy_piano':
  a=sum(g*np.sin(2*np.pi*f*r*t)*np.exp(-t*k/max(duration,.2)) for r,g,k in [(1,1,3),(2.018,.35,5),(3.87,.2,7),(5.43,.09,11)])
 elif kind in ('analog_saw_pad','analog_square_seq'):
  # Band-limited detuned oscillators with moving low-pass harmonic weights.
  # Wow is a slow three-cent excursion; square sequencing stays analog/smooth.
  pad=kind=='analog_saw_pad';wow=3*np.sin(2*np.pi*.31*t)
  cutoff=(850+1700*np.sin(np.pi*np.clip(t/max(duration,.01),0,1))**2) if pad else (700+3100*np.exp(-t*7))
  a=np.zeros(len(t));harmonics=range(1,min(40,int(18000/f))+1,1 if pad else 2)
  for detune,gain in [(-6,.28),(0,.44),(6,.28)]:
   phase=2*np.pi*np.cumsum(f*2**((wow+detune)/1200))/SR
   for k in harmonics:
    weight=1/np.sqrt(1+(k*f/cutoff)**6)
    a+=gain*np.sin(phase*k)*weight/k
  attack=min(.25 if pad else .012,duration*.2);release=min(.8 if pad else .12,duration*.3)
  a*=np.minimum(t/max(attack,.001),1)*np.minimum((duration-t)/max(release,.001),1)
 else:raise ValueError('Unsupported synth voice '+kind)
 return np.asarray(a*edge,dtype=np.float32)
