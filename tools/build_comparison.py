#!/usr/bin/env python3
"""Build the single-page comparison gallery; publication requires all51 real verified films."""
import argparse,hashlib,json,shutil,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from render_comparisons import hash_source

def build(output,preview=False):
    catalog=json.loads((ROOT/'comparison/catalog.json').read_text());media=ROOT/'.release/comparison';errors=[]
    if len(catalog)!=51 or len({s['slug'] for s in catalog})!=51:errors.append('The complete51-style inventory is required')
    for s in catalog:
        slug=s['slug'];result=ROOT/'comparison/results'/(slug+'.json');generation=ROOT/'comparisons'/slug/'generation.json'
        if result.exists():
            d=json.loads(result.read_text())
            if d.get('status')!='verified':errors.append(slug+': render status is not verified')
            if d.get('qa',{}).get('reference_fidelity')=='rejected_by_user':errors.append(slug+': first-pass fidelity rejected; publish the matched regeneration instead')
            if d.get('model')!='gpt-6.1-sol' or d.get('reasoning_effort')!='high':errors.append(slug+': requested model settings mismatch')
            if not (media/'posters'/(slug+'.jpg')).is_file():errors.append(slug+': poster missing')
            s.update(status=d['status'],gpt_duration=d['duration'],gpt_title=d['title'],comparison_notes=d['comparison_notes'],model=d['model'],reasoning_effort=d['reasoning_effort'],video_sha256=d['video_sha256'])
            if d['source_sha256']!=hash_source(generation.parent):errors.append(slug+': source changed after rendering')
            if d['qa'].get('visual_review')!='passed':errors.append(slug+': visual review not completed')
            video=media/(slug+'.mp4')
            if not video.is_file():errors.append(slug+': MP4 missing')
            elif hashlib.sha256(video.read_bytes()).hexdigest()!=d['video_sha256']:errors.append(slug+': MP4 checksum mismatch')
        else:s['status']='pending';errors.append(slug+': video not verified')
        s['gpt_video']='films/'+slug+'.mp4';s['gpt_poster']='posters/'+slug+'.jpg'
    if errors and not preview:raise SystemExit('Publication gate failed:\n'+'\n'.join(errors))
    output.mkdir(parents=True,exist_ok=True)
    for name in ['index.html','style.css','app.js']:shutil.copy2(ROOT/'comparison/site'/name,output/name)
    (output/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n');(output/'.nojekyll').touch()
    for slug in [s['slug'] for s in catalog]:
        for src,dest in [(media/(slug+'.mp4'),output/'films'/(slug+'.mp4')),(media/'posters'/(slug+'.jpg'),output/'posters'/(slug+'.jpg'))]:
            if src.exists():dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dest)
    # All row URLs are same-page hashes, and original movies stay visibly attributed to their host.
    print(f'Built one gallery page with {len(catalog)} side-by-side comparisons; {sum(s["status"]=="verified" for s in catalog)} videos verified; preview={preview}')
    return catalog
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--out',type=Path,default=ROOT/'_site');p.add_argument('--preview',action='store_true');a=p.parse_args();build(a.out,a.preview)
