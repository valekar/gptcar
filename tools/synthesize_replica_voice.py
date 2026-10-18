#!/usr/bin/env python3
"""Recreate exact timed narration with the local Kokoro engine; retain every line."""
import argparse,hashlib,json,sys,subprocess,os
from pathlib import Path
import numpy as np,soundfile as sf
ROOT=Path(__file__).resolve().parents[1]
def synthesize(spec,out):
    out.mkdir(parents=True,exist_ok=True);lines=spec.get('lines',[]);records=[];engine=None
    for n,line in enumerate(lines):
        text=line['text'];voice=line.get('voice',spec.get('voice','af_heart'));speed=float(line.get('speed',spec.get('speed',.93)));language=line.get('language',spec.get('language','en-us'));ident=line.get('id',f'v{n+1:02d}');path=out/(ident+'.wav');digest=hashlib.sha256(json.dumps([text,voice,speed,language],ensure_ascii=False).encode()).hexdigest();cache=out/(ident+'.json')
        if not path.exists() or not cache.exists() or json.loads(cache.read_text()).get('input_sha256')!=digest:
            if 'Neural' in voice:
                request=out/(ident+'-request.json');request.write_text(json.dumps([dict(id=ident,text=text,voice=voice,speed=speed)],ensure_ascii=False));subprocess.run([sys.executable,str(ROOT/'core/tts/tts_zh.py'),str(request),str(out)],check=True)
            else:
                if engine is None:
                    from kokoro_onnx import Kokoro
                    engine=Kokoro(str(ROOT/'core/tts/kokoro-v1.0.onnx'),str(ROOT/'core/tts/voices-v1.0.bin'))
                a,sr=engine.create(text,voice=voice,speed=speed,lang=language);nz=np.flatnonzero(np.abs(a)>max(float(np.max(np.abs(a))),1e-9)*.01)
                if len(nz):a=a[max(0,nz[0]-int(.015*sr)):min(len(a),nz[-1]+int(.1*sr))]
                if not len(a) or np.max(np.abs(a))<1e-4:raise RuntimeError(ident+' is silent')
                sf.write(path,a,sr,subtype='PCM_24')
            cache.write_text(json.dumps(dict(input_sha256=digest,text=text,voice=voice,speed=speed,language=language),ensure_ascii=False,indent=2)+'\n')
        audio,sr=sf.read(path);synthesized_duration=len(audio)/sr;pitch=float(line.get('pitch_semitones',line.get('pitch',0)))
        if pitch:
            # Match the original character direction: varispeed pitch-up also shortens the take.
            import soxr
            audio=soxr.resample(audio,sr*2**(pitch/12),sr);path=out/(ident+'-pitched.wav');sf.write(path,audio,sr,subtype='PCM_24')
        actual=len(audio)/sr;start=float(line['start']);window=float(line.get('duration',actual));next_start=float(lines[n+1]['start']) if n+1<len(lines) else float(spec.get('duration',start+window+.5));available=min(window+.4,next_start-start-.1)
        # Fresh takes may vary slightly; preserve all words and cue onset with a bounded pitch-preserving fit.
        fitted=path
        factor=actual/max(available,.1)
        if factor>1.001:
            if factor>1.25:raise RuntimeError(f'{ident}: {actual:.3f}s speech will not fit {available:.3f}s; adjust delivery speed without changing text')
            fitted=out/(ident+'-timed.wav');subprocess.run(['ffmpeg','-y','-v','error','-i',str(path),'-af',f'atempo={factor:.8f}',str(fitted)],check=True)
        records.append(dict(id=ident,text=text,voice=voice,language=language,start=start,planned_duration=window,synthesized_duration=synthesized_duration,raw_duration=actual,pitch_semitones=pitch,file=str(fitted.resolve()),tempo_factor=max(1,factor),filter=line.get('filter')))
        print(ident,round(actual,3),voice,flush=True)
    (out/'timing.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n');return records
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('spec',type=Path);p.add_argument('out',type=Path);a=p.parse_args();synthesize(json.loads(a.spec.read_text()),a.out)
