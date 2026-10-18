#!/usr/bin/env python3
"""Render full reference-matched films; acceptance is a separate scene review."""
import argparse,concurrent.futures,hashlib,json,subprocess,time,traceback,os
from fractions import Fraction
from pathlib import Path
from limit_replica_peaks import enforce as enforce_audio
from replica_paths import WORK_ROOT
ROOT=Path(__file__).resolve().parents[1];WORK=WORK_ROOT/'replicas';MEDIA=ROOT/'.release/replicas';RESULTS=ROOT/'comparison/replica-results';VOICE_PY=Path(os.environ.get('GPTCAR_VOICE_PYTHON',str(ROOT/'.venv/bin/python')))
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def source_hash(folder,meta):
 h=hashlib.sha256()
 for p in sorted(folder.rglob('*')):
  if p.is_file() and not any(x in p.parts for x in ['stills','out','__pycache__']) and p.suffix not in ['.mp4','.wav','.log']:
   h.update(str(p.relative_to(folder)).encode());h.update(p.read_bytes())
 for component in meta.get('shared_components',[]):
  path=component if isinstance(component,str) else component['path'];p=(ROOT/path.split('::',1)[0]).resolve()
  if ROOT not in p.parents:raise RuntimeError('Component outside repository: '+path)
  if not p.exists():raise RuntimeError('Shared component missing: '+path)
  h.update(path.encode())
  if p.is_dir():
   for child in sorted(p.rglob('*')):
    if child.is_file():h.update(str(child.relative_to(p)).encode());h.update(child.read_bytes())
  else:h.update(p.read_bytes())
 return h.hexdigest()
def run(cmd,log,timeout=3600):
 with log.open('a') as f:r=subprocess.run([str(v) for v in cmd],cwd=ROOT,stdout=f,stderr=subprocess.STDOUT,timeout=timeout)
 if r.returncode:raise RuntimeError(f'{cmd[0]} failed ({r.returncode}); inspect {log}')
def reference(slug):
 r=json.loads((ROOT/'comparison/reference-metadata'/(slug+'.json')).read_text());r['fps_number']=float(Fraction(r['fps']));r['video_duration']=int(r['frame_count'])/r['fps_number'];return r

def render(slug,stills_only=False):
 folder=ROOT/'replicas'/slug;meta=json.loads((folder/'generation.json').read_text());ref=reference(slug);brief=ROOT/'comparison/matched-briefs'/(slug+'.json');digest=source_hash(folder,meta);work=WORK/slug;work.mkdir(parents=True,exist_ok=True);log=work/'render.log';log.write_text('')
 if meta.get('model')!='gpt-6.1-sol' or meta.get('reasoning_effort')!='high' or meta.get('uses_upstream_scene_code') is not False:raise RuntimeError('Unverified model/scene provenance')
 if meta.get('matched_brief_sha256')!=sha(brief):raise RuntimeError('Matched brief changed or not pinned')
 for required in ['PROMPT.md','TREATMENT.md','index.html','narration.json','score.json','CREDITS']:
  if not (folder/required).exists():raise RuntimeError('Missing '+required)
 times=sorted(set(float(t) for t in meta.get('review_times',[])))
 if len(times)<3:raise RuntimeError('Explicit scene review times required')
 if times[0]<0 or times[-1]>=ref['video_duration']:raise RuntimeError('Review time outside film')
 run(['node','core/render/still.mjs',folder,*times,'--size',f"{ref['width']}x{ref['height']}",'--out',work/'stills'],log)
 if stills_only:return slug,'stills-ready'
 result=RESULTS/(slug+'.json');dest=MEDIA/(slug+'.mp4')
 if result.exists() and dest.exists():
  prev=json.loads(result.read_text())
  if prev['source_sha256']==digest and prev['video_sha256']==sha(dest):return slug,'cached'
 voice_dir=WORK_ROOT/'voices'/slug
 run([VOICE_PY,'tools/synthesize_replica_voice.py',folder/'narration.json',voice_dir],log,1800)
 run([VOICE_PY,'tools/compose_replica_audio.py',folder/'score.json',voice_dir/'timing.json',work/'mix.wav','--duration',ref['video_duration']],log,1800)
 run(['node','core/render/video.mjs',folder,'--fps',ref['fps_number'],'--workers',2,'--size',f"{ref['width']}x{ref['height']}",'--out',work/'picture.mp4'],log,7200)
 final=work/'final.mp4';run(['sh','core/render/mux.sh',work/'picture.mp4',work/'mix.wav',final,ref['fps_number'],0],log)
 audio_levels=enforce_audio(final, work/'mix.wav')
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(final)]));v=next(x for x in probe['streams'] if x['codec_type']=='video');a=next(x for x in probe['streams'] if x['codec_type']=='audio')
 if int(v['nb_frames'])!=int(ref['frame_count']) or float(Fraction(v['r_frame_rate']))!=ref['fps_number'] or (v['width'],v['height'])!=(ref['width'],ref['height']):raise RuntimeError('Published reference format/framecount mismatch')
 run(['ffmpeg','-hide_banner','-i',final,'-af','ebur128=peak=true','-vf','blackdetect=d=0.15:pix_th=0.025','-f','null','-'],work/'analysis.log')
 MEDIA.mkdir(parents=True,exist_ok=True);(MEDIA/'posters').mkdir(exist_ok=True);final.replace(dest);poster_time=times[len(times)//2];poster=MEDIA/'posters'/(slug+'.jpg');poster_frame=min((work/'stills').glob('t_*.jpg'),key=lambda p:abs(float(p.stem[2:])-poster_time));poster.write_bytes(poster_frame.read_bytes())
 original_poster=MEDIA/'reference-posters'/(slug+'.jpg');original_poster.parent.mkdir(exist_ok=True)
 reference_movie=WORK_ROOT/'reference/films'/(slug+'.mp4')
 run(['ffmpeg','-y','-v','error','-ss',poster_time,'-i',reference_movie,'-frames:v',1,'-q:v',2,original_poster],log)
 run(['ffmpeg','-y','-v','error','-ss',poster_time,'-i',dest,'-frames:v',1,'-q:v',2,poster],log)
 records={'slug':slug,'status':'rendered','model':'gpt-6.1-sol','reasoning_effort':'high','title':meta.get('title',slug),'source_sha256':digest,'matched_brief_sha256':sha(brief),'reference_video_sha256':ref['sha256'],'video_sha256':sha(dest),'poster_sha256':sha(poster),'reference_poster_sha256':sha(original_poster),'poster_time':poster_time,'bytes':dest.stat().st_size,'width':v['width'],'height':v['height'],'fps':ref['fps_number'],'frames':int(v['nb_frames']),'duration':ref['video_duration'],'audio_codec':a['codec_name'],'audio_levels':audio_levels,'review_times':times,'shared_components':meta.get('shared_components',[]),'qa':{'technical_render':'passed','scene_fidelity':'pending','audio_review':'pending','black_intervals_detected':'black_start:' in (work/'analysis.log').read_text()},'updated_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())};RESULTS.mkdir(parents=True,exist_ok=True);result.write_text(json.dumps(records,indent=2)+'\n');return slug,'rendered-awaiting-review'
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('slugs',nargs='+');p.add_argument('--jobs',type=int,default=1);p.add_argument('--stills-only',action='store_true');a=p.parse_args()
 with concurrent.futures.ThreadPoolExecutor(max_workers=a.jobs) as pool:
  for future in concurrent.futures.as_completed([pool.submit(render,s,a.stills_only) for s in a.slugs]):
   try:print(*future.result(),flush=True)
   except Exception:traceback.print_exc();raise SystemExit(1)
