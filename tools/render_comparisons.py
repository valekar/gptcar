#!/usr/bin/env python3
"""Resume the51-style render queue, validating real movies and recording source hashes."""
import argparse,concurrent.futures,hashlib,json,os,subprocess,time,traceback
from pathlib import Path
from replica_paths import WORK_ROOT
ROOT=Path(__file__).resolve().parents[1];OUTPUT=ROOT/'.release/comparison';RESULTS=ROOT/'comparison/results';WORK=WORK_ROOT/'renders'
def execute(args,log,timeout=600):
    with log.open('a') as f:
        r=subprocess.run([str(x) for x in args],cwd=ROOT,stdout=f,stderr=subprocess.STDOUT,timeout=timeout)
    if r.returncode:raise RuntimeError(f'{Path(str(args[0])).name} failed ({r.returncode}); see {log}')
def hash_source(folder):
    h=hashlib.sha256()
    for p in sorted(folder.rglob('*')):
        if p.is_file() and not any(x in p.parts for x in ['stills','out','__pycache__']) and p.suffix not in ['.mp4','.wav']:
            h.update(str(p.relative_to(folder)).encode());h.update(p.read_bytes())
    return h.hexdigest()
def render(slug):
    folder=ROOT/'comparisons'/slug;d=json.loads((folder/'generation.json').read_text());digest=hash_source(folder)
    result=RESULTS/(slug+'.json');dest=OUTPUT/(slug+'.mp4')
    if result.exists() and dest.exists():
        prior=json.loads(result.read_text())
        if prior.get('source_sha256')==digest and prior.get('status')=='verified':return slug,'cached'
    work=WORK/slug;work.mkdir(parents=True,exist_ok=True);log=work/'render.log';log.write_text('')
    try:
        for name in ['TREATMENT.md','index.html','audio.json','CREDITS']:
            if not (folder/name).exists():raise RuntimeError(f'Missing{name}')
        if d.get('model')!='gpt-6.1-sol' or d.get('reasoning_effort')!='high' or d.get('uses_upstream_demo_code') is not False:raise RuntimeError('Model/provenance metadata mismatch')
        # Film generation is stable once its source-ready manifest is written.
        execute(['node','core/render/still.mjs',folder,2,10,17,'--size','1280x720','--out',work/'stills'],log)
        execute([ROOT/'.venv/bin/python','tools/compose_comparison_audio.py',folder/'audio.json',work/'mix.wav'],log)
        execute(['node','core/render/video.mjs',folder,'--fps',24,'--workers',1,'--size','1280x720','--out',work/'picture.mp4'],log,1200)
        final=work/'final.mp4'
        execute(['sh','core/render/mux.sh',work/'picture.mp4',work/'mix.wav',final,24,0],log)
        probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(final)]))
        video=next(s for s in probe['streams'] if s['codec_type']=='video');audio=next(s for s in probe['streams'] if s['codec_type']=='audio')
        if (video['width'],video['height'],video['r_frame_rate'],int(video['nb_frames']))!=(1280,720,'24/1',480):raise RuntimeError('Unexpected video format/frame count')
        if abs(float(probe['format']['duration'])-20)>.1:raise RuntimeError('Wrong duration')
        execute(['ffmpeg','-hide_banner','-i',final,'-af','ebur128','-vf','blackdetect=d=0.15:pix_th=0.025','-f','null','-'],work/'analysis.log')
        analysis=(work/'analysis.log').read_text()
        if 'black_start:' in analysis:raise RuntimeError('Black interval detected; inspect scene')
        final.replace(dest)
        poster=OUTPUT/'posters'/(slug+'.jpg');poster.write_bytes((work/'stills/t_10.jpg').read_bytes())
        evidence={'slug':slug,'status':'verified','model':'gpt-6.1-sol','reasoning_effort':'high','source_sha256':digest,'video_sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'duration':20,'fps':24,'width':1280,'height':720,'frames':480,'audio_codec':audio['codec_name'],'qa':{'render_errors':False,'black_intervals':False,'visual_review':'pending'},'title':d.get('title',slug),'comparison_notes':d.get('comparison_notes',''),'updated_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
        result.write_text(json.dumps(evidence,indent=2)+'\n');return slug,'verified'
    except Exception as e:
        (work/'failure.json').write_text(json.dumps({'slug':slug,'error':str(e),'source_sha256':digest},indent=2));return slug,'FAILED '+str(e)

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--jobs',type=int,default=2);p.add_argument('--watch',action='store_true');p.add_argument('--only',nargs='*');a=p.parse_args()
    OUTPUT.mkdir(parents=True,exist_ok=True);(OUTPUT/'posters').mkdir(exist_ok=True);RESULTS.mkdir(parents=True,exist_ok=True);WORK.mkdir(parents=True,exist_ok=True)
    slugs=a.only or [s['slug'] for s in json.loads((ROOT/'gptcar.json').read_text())['styles']]
    attempted={};pending={}
    with concurrent.futures.ThreadPoolExecutor(max_workers=a.jobs) as pool:
        while True:
            for slug in slugs:
                meta=ROOT/'comparisons'/slug/'generation.json'
                if not meta.exists() or slug in pending.values():continue
                try:d=json.loads(meta.read_text());digest=hash_source(meta.parent)
                except Exception:continue
                if d.get('status') not in ['source-ready','verified'] or attempted.get(slug)==digest:continue
                attempted[slug]=digest;pending[pool.submit(render,slug)]=slug
            done=[f for f in pending if f.done()]
            for f in done:
                print(*f.result(),flush=True);del pending[f]
            complete=sum(1 for s in slugs if (RESULTS/(s+'.json')).exists() and json.loads((RESULTS/(s+'.json')).read_text()).get('status')=='verified' and json.loads((RESULTS/(s+'.json')).read_text()).get('source_sha256')==hash_source(ROOT/'comparisons'/s))
            if complete==len(slugs):print(f'COMPLETE {complete}/{len(slugs)}',flush=True);return
            if not a.watch and not pending:return
            time.sleep(3)
if __name__=='__main__':main()
