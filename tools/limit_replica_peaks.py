#!/usr/bin/env python3
"""Keep AAC reconstruction peaks below−1 dBTP without changing video frames."""
import argparse,json,re,subprocess
from pathlib import Path

def levels(movie):
 p=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(movie),'-vn','-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,check=True)
 i=float(re.findall(r'^\s+I:\s+(-?[\d.]+)',p.stderr,re.M)[-1]);peak=float(re.findall(r'^\s+Peak:\s+(-?[\d.]+)',p.stderr,re.M)[-1]);return dict(integrated_lufs=i,true_peak_dbtp=peak)
def enforce(movie, source_audio=None):
 d=levels(movie);gain=0;limiter=False
 def apply(delta):
  tmp=movie.with_name(movie.stem+'-peak-adjusted.mp4')
  subprocess.run(['ffmpeg','-y','-v','error','-i',str(movie),'-map','0:v:0','-map','0:a:0','-c:v','copy','-af',f'volume={delta:.4f}dB','-c:a','aac','-b:a','256k','-movflags','+faststart',str(tmp)],check=True);tmp.replace(movie)
 for attempt in range(2):
  if d['true_peak_dbtp']<=-1:break
  delta=-1.4-d['true_peak_dbtp'];gain+=delta;apply(delta);d=levels(movie)
 if d['integrated_lufs']<-15.2 and d['true_peak_dbtp']<-1.4:
  delta=min(-14-d['integrated_lufs'],-1.4-d['true_peak_dbtp']);gain+=delta;apply(delta);d=levels(movie)
 # Dense mixes need limiting, not repeated lossy AAC generations. Each
 # attempt starts with the original PCM and copies the existing video stream.
 if d['integrated_lufs']<-15.2 or d['true_peak_dbtp']>-1:
  if source_audio is None:
   raise RuntimeError('Fresh PCM source required for peak limiting: '+str(d))
  source_audio=Path(source_audio)
  pcm=levels(source_audio);delta=-14-pcm['integrated_lufs'];ceiling=.70
  for attempt in range(4):
   tmp=movie.with_name(movie.stem+'-limited.mp4')
   filt=f'volume={delta:.4f}dB,aresample=192000,alimiter=limit={ceiling:.4f}:attack=5:release=50:level=false:latency=true,aresample=48000,afade=t=in:d=0.04'
   subprocess.run(['ffmpeg','-y','-v','error','-i',str(movie),'-i',str(source_audio),'-map','0:v:0','-map','1:a:0','-c:v','copy','-af',filt,'-c:a','aac','-b:a','256k','-movflags','+faststart','-shortest',str(tmp)],check=True)
   tmp.replace(movie);limiter=True;gain=delta;d=levels(movie)
   if -15.2<=d['integrated_lufs']<=-12.8 and d['true_peak_dbtp']<=-1:break
   if d['true_peak_dbtp']>-1:ceiling*=10**((-1.5-d['true_peak_dbtp'])/20)
   delta+=max(-3,min(3,-14.4-d['integrated_lufs']))
 if d['true_peak_dbtp']>-1 or not -15.2<=d['integrated_lufs']<=-12.8:raise RuntimeError('Audio needs mix revision: '+str(d))
 return dict(**d,peak_gain_adjustment_db=round(gain,3),**({'oversampled_peak_limiter':True,'limiter_source':'fresh_pcm','startup_fade_seconds':0.04} if limiter else {}))
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('movie',type=Path);p.add_argument('--source-audio',type=Path);a=p.parse_args();print(json.dumps(enforce(a.movie,a.source_audio)))
