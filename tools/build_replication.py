#!/usr/bin/env python3
"""Build the one-page gallery from reviewed full-length replicas; reject v1 publication."""
import argparse,hashlib,json,shutil,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'tools'))
from render_replicas import source_hash,reference,sha

def build(out,preview=False,media_base=None):
 catalog=json.loads((ROOT/'comparison/catalog.json').read_text());errors=[];media=ROOT/'.release/replicas';accepted=0
 if len(catalog)!=51 or len({s['slug'] for s in catalog})!=51:errors.append('Complete unique51-style inventory required')
 for s in catalog:
  slug=s['slug'];rp=ROOT/'comparison/replica-results'/(slug+'.json');gp=ROOT/'replicas'/slug/'generation.json';review=ROOT/'comparison/replica-reviews'/(slug+'.json');ref=reference(slug);s['original_duration']=ref['video_duration'];s['prompt_url']='https://github.com/valekar/gptcar/blob/main/comparison/matched-briefs/'+slug+'.md'
  if rp.exists() and gp.exists():
   d=json.loads(rp.read_text());g=json.loads(gp.read_text());v=media/(slug+'.mp4');poster=media/'posters'/(slug+'.jpg');problems=[]
   original_poster=media/'reference-posters'/(slug+'.jpg')
   if d.get('status')!='rendered' or d.get('model')!='gpt-6.1-sol' or d.get('reasoning_effort')!='high':problems.append('unverified model/render provenance')
   if d['source_sha256']!=source_hash(gp.parent,g):problems.append('stale film source')
   if d['matched_brief_sha256']!=sha(ROOT/'comparison/matched-briefs'/(slug+'.json')):problems.append('stale matched brief')
   if (d['frames'],d['fps'],d['width'],d['height'])!=(int(ref['frame_count']),ref['fps_number'],ref['width'],ref['height']):problems.append('reference delivery format mismatch')
   if not v.exists() or sha(v)!=d['video_sha256']:problems.append('missing/changed movie')
   if not poster.exists() or sha(poster)!=d['poster_sha256']:problems.append('missing/changed poster')
   if not original_poster.exists() or sha(original_poster)!=d.get('reference_poster_sha256'):problems.append('missing/changed matching reference poster')
   r=json.loads(review.read_text()) if review.exists() else {}
   if r.get('verdict')!='accepted-for-gallery' or r.get('reviewed_source_sha256')!=d['source_sha256'] or r.get('audio_review')!='passed':problems.append('independent scene/audio review incomplete')
   if r.get('reviewed_video_sha256')!=d['video_sha256']:problems.append('reviewed movie differs from release movie')
   errors.extend(slug+': '+x for x in problems);ok=not problems;accepted+=int(ok)
   s.update(run_version=2,status='verified' if ok else 'rendered',gpt_duration=d['duration'],gpt_fps=d['fps'],gpt_title=d['title'],comparison_notes=r.get('comparison_notes',g.get('comparison_notes','Full reference script and scene structure recreated from the published film/specification; newly generated scene assembly, speech and score. Shared generic engine/data components are credited in source. Original conversation prompt was not published.')),model=d['model'],reasoning_effort=d['reasoning_effort'],video_sha256=d['video_sha256'],source_url='https://github.com/valekar/gptcar/tree/main/replicas/'+slug)
   if 'stale film source' in problems or 'stale matched brief' in problems:
    s['status']='revision-in-progress';s['comparison_notes']='Previous full-length render shown while scene corrections are being rendered and reviewed. '+s['comparison_notes']
   s['opus_poster']='reference-posters/'+slug+'.jpg?v='+d['reference_poster_sha256'][:16]
   paths=[(v,out/'films'/(slug+'.mp4')),(poster,out/'posters'/(slug+'.jpg')),(original_poster,out/'reference-posters'/(slug+'.jpg'))]
  else:
   errors.append(slug+': full replica not rendered');s.update(run_version=1,status='rejected-first-pass',gpt_duration=20,gpt_fps=24,comparison_notes='First pass rejected: this abbreviated20-second film changes the original script and artwork. Full reference-matched replacement is in progress.');old=ROOT/'comparison/results'/(slug+'.json')
   if old.exists():s['gpt_title']=json.loads(old.read_text()).get('title',slug)
   paths=[(ROOT/'.release/comparison'/(slug+'.mp4'),out/'films'/(slug+'.mp4')),(ROOT/'.release/comparison/posters'/(slug+'.jpg'),out/'posters'/(slug+'.jpg'))]
  version=d['video_sha256'][:16] if rp.exists() and gp.exists() else 'first-pass'
  poster_version=d['poster_sha256'][:16] if rp.exists() and gp.exists() else 'first-pass'
  s['gpt_video']=(media_base.rstrip('/')+'/' if media_base else 'films/')+slug+'.mp4?v='+version;s['gpt_poster']='posters/'+slug+'.jpg?v='+poster_version
  if preview:
   for src,dest in paths:
    if src.exists():dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dest)
 if errors and not preview:raise SystemExit('Full-replication publication gate failed:\n'+'\n'.join(errors))
 out.mkdir(parents=True,exist_ok=True)
 for name in ['index.html','style.css','app.js']:shutil.copy2(ROOT/'comparison/site'/name,out/name)
 if not preview:
  for slug in [s['slug'] for s in catalog]:
   paths=[(media/'posters'/(slug+'.jpg'),out/'posters'/(slug+'.jpg')),(media/'reference-posters'/(slug+'.jpg'),out/'reference-posters'/(slug+'.jpg'))]
   if not media_base:paths.append((media/(slug+'.mp4'),out/'films'/(slug+'.mp4')))
   for src,dest in paths:dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dest)
  p=out/'index.html';text=p.read_text();start=text.find('<div class="revision-notice"');end=text.find('</div>',start)
  if start>=0:p.write_text(text[:start]+text[end+6:])
 (out/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n');(out/'.nojekyll').touch();print(f'Onepage: {accepted}/51 full replicas accepted; preview={preview}');return catalog
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--out',type=Path,default=ROOT/'_site');p.add_argument('--preview',action='store_true');p.add_argument('--media-base',help='Public full-quality release URL; files are still verified locally before publication.');a=p.parse_args();build(a.out,a.preview,a.media_base)
