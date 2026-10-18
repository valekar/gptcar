#!/usr/bin/env python3
"""Independently transcribe fresh timed narration takes; record evidence, never accept a film."""
import argparse, datetime, hashlib, json, sys
from pathlib import Path
import numpy as np
import soundfile as sf
import soxr
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from core.tts.asr_check import load_model, compare, detect_lang

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def check(slugs,voice_root,out,model_name='base.en'):
    models={}
    for slug in slugs:
        narration=ROOT/'replicas'/slug/'narration.json';timing=voice_root/slug/'timing.json'
        expected=json.loads(narration.read_text());expected=expected.get('lines',[]) if isinstance(expected,dict) else expected
        records=json.loads(timing.read_text());wanted={line['id']:line['text'] for line in expected}
        if set(wanted)!={line['id'] for line in records}:raise RuntimeError(slug+': narration/timing line IDs differ')
        evidence=[]
        for line in records:
            if line['text']!=wanted[line['id']]:raise RuntimeError(slug+': synthesized text differs from frozen narration')
            path=Path(line['file']);y,sr=sf.read(path,dtype='float32');y=y.mean(axis=1) if y.ndim>1 else y
            duration=len(y)/sr
            # synthesized_duration is the pre-pitch take. raw_duration is after
            # varispeed, before optional atempo fitting (which adds tiny padding).
            expected_duration=line['raw_duration']/line.get('tempo_factor',1)
            if abs(duration-expected_duration)>.05:raise RuntimeError(slug+': timed voice duration changed')
            language=detect_lang([line['text']]);name=model_name if language=='en' else model_name.removesuffix('.en')
            if name not in models:models[name]=load_model(name)
            y=soxr.resample(y,sr,16000,quality='HQ');pad=np.zeros(9600,np.float32)
            kw=dict(initial_prompt='以下是普通话的句子。') if language=='zh' else {}
            segments,_=models[name].transcribe(np.concatenate([pad,y,pad]).astype(np.float32),beam_size=5,language=language,word_timestamps=True,**kw)
            tail=(len(y)+len(pad))/16000-.5;segments=[s for s in segments if not(s.no_speech_prob>.5 and s.start>tail)]
            got=' '.join(s.text.strip() for s in segments);ok,similarity=compare(line['text'],got,language)
            evidence.append(dict(id=line['id'],text=line['text'],transcript=got,normalized_exact=ok,similarity=similarity,language=language,asr_model=name,take_sha256=sha(path),start=line['start'],duration=duration,pitch_semitones=line.get('pitch_semitones',0),tempo_factor=line.get('tempo_factor',1),filter=line.get('filter')))
            print(slug,line['id'],'exact' if ok else 'REVIEW',repr(got),flush=True)
        out.mkdir(parents=True,exist_ok=True)
        report=dict(slug=slug,method='Independent Whisper transcription of the actual newly synthesized/pitched/tempo-fitted voice takes. No expected-text initial prompt. Music and radio filtering are separately mixed.',narration_sha256=sha(narration),timing_sha256=sha(timing),checked_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),line_count=len(evidence),normalized_exact_count=sum(x['normalized_exact'] for x in evidence),lines=evidence)
        (out/(slug+'.json')).write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('slugs',nargs='+');p.add_argument('--voice-root',type=Path,default=ROOT.parent.parent/'work/gptcar/voices');p.add_argument('--out',type=Path,default=ROOT/'comparison/replica-narration-checks');p.add_argument('--model',default='base.en');a=p.parse_args();check(a.slugs,a.voice_root,a.out,a.model)
