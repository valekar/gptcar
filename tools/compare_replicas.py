#!/usr/bin/env python3
"""Create timestamp-matched pairs from both final movies, avoiding still/decoder frame rounding."""
import argparse,concurrent.futures,json,math,subprocess
from pathlib import Path
from PIL import Image,ImageDraw
from render_replicas import ROOT,source_hash,sha,reference

def compare(slug,times=None):
 folder=ROOT/'replicas'/slug;g=json.loads((folder/'generation.json').read_text());r=json.loads((ROOT/'comparison/replica-results'/(slug+'.json')).read_text());ref=reference(slug);movie=ROOT/'.release/replicas'/(slug+'.mp4')
 if r['source_sha256']!=source_hash(folder,g) or r['video_sha256']!=sha(movie):raise SystemExit('Render current frozen source before comparing final movies')
 out=ROOT.parent.parent/'work/gptcar/movie-review'/slug;out.mkdir(parents=True,exist_ok=True);frames=[]
 for requested in times or g['review_times']:
  index=min(int(ref['frame_count'])-1,math.ceil(float(requested)*ref['fps_number']-1e-7));t=index/ref['fps_number'];frames.append((requested,index,t))
 def decode(item):
  requested,index,t=item;paths=[]
  for label,src in [('opus',ROOT.parent.parent/'work/gptcar/reference/films'/(slug+'.mp4')),('gpt',movie)]:
   dst=out/f'{label}-{index:06d}.jpg';subprocess.run(['ffmpeg','-y','-v','error','-ss',f'{t:.9f}','-i',str(src),'-frames:v','1','-q:v','2',str(dst)],check=True);paths.append(dst)
  return requested,index,t,paths
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:decoded=list(pool.map(decode,frames))
 for i in range(0,len(decoded),6):
  rows=decoded[i:i+6];sheet=Image.new('RGB',(960,len(rows)*294),'#eef0ed');draw=ImageDraw.Draw(sheet)
  for y,(requested,index,t,paths) in enumerate(rows):
   for col,p in enumerate(paths):
    im=Image.open(p);im.thumbnail((480,270));sheet.paste(im,(col*480,y*294));draw.text((col*480+5,y*294+274),f'{slug} | frame {index} | {t:.4f}s | '+('Opus' if col==0 else 'GPT'),fill='#172821')
  sheet.save(out/f'pair-{i//6+1:02d}.jpg',quality=90)
 (out/'index.json').write_text(json.dumps(dict(slug=slug,source_sha256=r['source_sha256'],video_sha256=r['video_sha256'],reference_video_sha256=ref['sha256'],method='Both completed CFR movies decoded at the same quantized frame timestamp; source render(t) stills are not mixed with decoded original frames.',frames=[dict(requested=a,index=b,time=c) for a,b,c in frames],sheets=math.ceil(len(frames)/6)),indent=2)+'\n');print(slug,len(frames),'matched final-movie frames',flush=True)
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('slug');p.add_argument('--times',nargs='+',type=float);a=p.parse_args();compare(a.slug,a.times)
