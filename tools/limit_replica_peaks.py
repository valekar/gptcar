#!/usr/bin/env python3
"""Keep AAC reconstruction peaks below−1 dBTP without changing video frames."""
import argparse,json,re,subprocess
from pathlib import Path

def levels(movie):
 p=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(movie),'-vn','-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,check=True)
 i=float(re.findall(r'^\s+I:\s+(-?[\d.]+)',p.stderr,re.M)[-1]);peak=float(re.findall(r'^\s+Peak:\s+(-?[\d.]+)',p.stderr,re.M)[-1]);return dict(integrated_lufs=i,true_peak_dbtp=peak)
def enforce(movie):
 d=levels(movie);gain=0
 def apply(delta):
  tmp=movie.with_name(movie.stem+'-peak-adjusted.mp4')
  subprocess.run(['ffmpeg','-y','-v','error','-i',str(movie),'-map','0:v:0','-map','0:a:0','-c:v','copy','-af',f'volume={delta:.4f}dB','-c:a','aac','-b:a','256k','-movflags','+faststart',str(tmp)],check=True);tmp.replace(movie)
 for attempt in range(2):
  if d['true_peak_dbtp']<=-1:break
  delta=-1.4-d['true_peak_dbtp'];gain+=delta;apply(delta);d=levels(movie)
 if d['integrated_lufs']<-15.2 and d['true_peak_dbtp']<-1.4:
  delta=min(-14-d['integrated_lufs'],-1.4-d['true_peak_dbtp']);gain+=delta;apply(delta);d=levels(movie)
 if d['true_peak_dbtp']>-1 or not -15.2<=d['integrated_lufs']<=-12.8:raise RuntimeError('Audio needs mix revision: '+str(d))
 return dict(**d,peak_gain_adjustment_db=round(gain,3))
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('movie',type=Path);a=p.parse_args();print(json.dumps(enforce(a.movie)))
