#!/usr/bin/env python3
"""Make full-length GitHub README attachment previews; never uploads files.

The original and GPT masters remain unchanged. Upload these MP4s through GitHub's
Markdown editor, then record the returned attachment URLs in readme-media.json.
"""
import argparse,concurrent.futures,hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def prepare(slugs=None,workers=4):
    catalog=json.loads((ROOT/'comparison/catalog.json').read_text());out=ROOT/'work/readme-inline/videos';out.mkdir(parents=True,exist_ok=True)
    previous=ROOT/'comparison/readme-media.json';old=json.loads(previous.read_text())if previous.exists()else {'media':[]};known={(r['slug'],r['side']):r for r in old['media']}
    jobs=[(s,side)for s in catalog if not slugs or s['slug']in slugs for side in ['opus','gpt']]
    def work(job):
        s,side=job;src=(ROOT/'work/replication/reference/films'if side=='opus'else ROOT/'.release/replicas')/(s['slug']+'.mp4');dst=out/(side+'__'+s['slug']+'.mp4')
        if not src.is_file():raise FileNotFoundError(src)
        probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(src)]));duration=float(probe['format']['duration']);srcsha=hashlib.sha256(src.read_bytes()).hexdigest();prior=known.get((s['slug'],side),{})
        if not(dst.exists()and prior.get('source_sha256')==srcsha):
            # Conservative VBV ceiling leaves headroom below GitHub's free10MB limit.
            ceiling=max(180,min(1800,int((9_000_000*8/duration/1000-96)*.82)))
            vf='scale=640:360:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=640:360:(ow-iw)/2:(oh-ih)/2,setsar=1'
            subprocess.run(['ffmpeg','-y','-v','error','-i',str(src),'-map','0:v:0','-map','0:a:0?','-vf',vf,'-c:v','libx264','-preset','fast','-crf','25','-maxrate',str(ceiling)+'k','-bufsize',str(ceiling*2)+'k','-pix_fmt','yuv420p','-threads','2','-c:a','aac','-b:a','96k','-movflags','+faststart',str(dst)],check=True)
        final=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(dst)]));actual=float(final['format']['duration']);v=next(x for x in final['streams']if x['codec_type']=='video');assert abs(actual-duration)<.15,(src,duration,actual);assert v['width']==640 and v['height']==360;assert dst.stat().st_size<10_000_000,dst
        row=dict(slug=s['slug'],name=s['name'],category=s['category'],side=side,filename=dst.name,source_url=s['opus_video']if side=='opus'else'https://github.com/valekar/gptcar/releases/download/comparison-v2/'+s['slug']+'.mp4',source_sha256=srcsha,source_duration=duration,preview_duration=actual,width=640,height=360,bytes=dst.stat().st_size,sha256=hashlib.sha256(dst.read_bytes()).hexdigest(),attachment_url=prior.get('attachment_url'))
        print(side,s['slug'],round(duration,2),round(row['bytes']/1e6,2),'MB',flush=True);return row
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers)as pool:
        for row in pool.map(work,jobs):known[(row['slug'],row['side'])]=row
    rows=[known[(s['slug'],side)]for s in catalog for side in ['opus','gpt']if(s['slug'],side)in known]
    previous.write_text(json.dumps(dict(format='Full-length640×360 H.264/AAC README previews; masters unchanged; GitHub attachments required for inline playback.',media=rows),indent=2)+'\n');return rows
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--style',action='append');p.add_argument('--workers',type=int,default=4);a=p.parse_args();prepare(a.style,a.workers)
