#!/usr/bin/env python3
"""Recreate exact timed narration with the local Kokoro engine; retain every line."""
import argparse,hashlib,json,sys,subprocess,os,re,shutil
from pathlib import Path
import numpy as np,soundfile as sf
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
def synthesize(spec,out):
    out.mkdir(parents=True,exist_ok=True);lines=spec.get('lines',[]);records=[];engine=None;word_model=None
    for n,line in enumerate(lines):
        text=line['text'];voice=line.get('voice',spec.get('voice','af_heart'));speed=float(line.get('speed',spec.get('speed',.93)));language=line.get('language',spec.get('language','en-us'));ident=line.get('id',f'v{n+1:02d}');path=out/(ident+'.wav');segments=line.get('delivery_segments');pause=float(line.get('segment_pause',.09));key=[text,voice,speed,language]
        native=line.get('engine',spec.get('engine'))=='macos-say'
        neural='Neural' in voice
        rate=line.get('rate',spec.get('rate'))
        neural_pitch=line.get('pitch_hz',line.get('pitch',spec.get('pitch_hz',spec.get('pitch','+0Hz')))) if neural else None
        say=line.get('say',text)
        if native:
            if not isinstance(rate,(int,float)) or not np.isfinite(rate) or rate<=0:raise ValueError(ident+': macos-say rate must be positive WPM')
            key.extend(['macos-say',rate])
        if neural:
            if not isinstance(neural_pitch,str) or not re.fullmatch(r'[+-]\d+Hz',neural_pitch):raise ValueError(ident+': neural pitch must use signed Hz')
            key.extend([rate,neural_pitch,say])
        if segments:
            words=lambda value: re.findall(r"[\w']+",value.casefold())
            if not isinstance(segments,list) or not all(isinstance(s,str) and s.strip() for s in segments) or words(' '.join(segments))!=words(text):raise ValueError(ident+': delivery segments must retain the exact original words in order')
            if not 0<=pause<=.5:raise ValueError(ident+': segment pause must be between 0 and .5 seconds')
            if neural or native:raise ValueError('Segmented delivery currently requires the local voice engine')
            key.extend([segments,pause])
        digest=hashlib.sha256(json.dumps(key,ensure_ascii=False).encode()).hexdigest();cache=out/(ident+'.json')
        if not path.exists() or not cache.exists() or json.loads(cache.read_text()).get('input_sha256')!=digest:
            shared=out/'_takes'/f'{digest}.wav'
            if shared.exists():
                shutil.copyfile(shared,path)
            elif native:
                request=out/(ident+'-say.txt');request.write_text(text)
                aiff=out/(ident+'-fresh.aiff')
                subprocess.run(['/usr/bin/say','-v',voice,'-r',str(rate),'-f',str(request),'-o',str(aiff)],check=True)
                subprocess.run(['ffmpeg','-y','-v','error','-i',str(aiff),'-ac','1','-ar','24000','-c:a','pcm_s24le',str(path)],check=True)
                aiff.unlink()
            elif neural:
                request=out/(ident+'-request.json');req=dict(id=ident,text=text,say=say,voice=voice,speed=speed,pitch=neural_pitch)
                if rate is not None:req['rate']=rate
                request.write_text(json.dumps([req],ensure_ascii=False));subprocess.run([sys.executable,str(ROOT/'core/tts/tts_zh.py'),str(request),str(out)],check=True)
            else:
                if engine is None:
                    from kokoro_onnx import Kokoro
                    engine=Kokoro(str(ROOT/'core/tts/kokoro-v1.0.onnx'),str(ROOT/'core/tts/voices-v1.0.bin'))
                parts=[]
                for clause in segments or [text]:
                    a,sr=engine.create(clause,voice=voice,speed=speed,lang=language);nz=np.flatnonzero(np.abs(a)>max(float(np.max(np.abs(a))),1e-9)*.01)
                    if len(nz):a=a[max(0,nz[0]-int(.015*sr)):min(len(a),nz[-1]+int(.1*sr))]
                    if parts:parts.append(np.zeros(int(pause*sr),dtype=a.dtype))
                    parts.append(a)
                a=np.concatenate(parts)
                if not len(a) or np.max(np.abs(a))<1e-4:raise RuntimeError(ident+' is silent')
                sf.write(path,a,sr,subtype='PCM_24')
            if not shared.exists():
                shared.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,shared)
            cache.write_text(json.dumps(dict(input_sha256=digest,text=text,voice=voice,speed=speed,language=language),ensure_ascii=False,indent=2)+'\n')
        audio,sr=sf.read(path);synthesized_duration=len(audio)/sr;pitch=float(line.get('pitch_semitones',0 if neural else line.get('pitch',0)))
        pitch_mode=line.get('pitch_mode','varispeed')
        if pitch_mode not in ('varispeed','preserve_duration'):raise ValueError('Unsupported pitch mode '+pitch_mode)
        if pitch:
            # Match the original character direction: varispeed pitch-up also shortens the take.
            import soxr
            if pitch_mode=='preserve_duration':
                import librosa
                audio=librosa.effects.pitch_shift(audio,sr=sr,n_steps=pitch)
            else:audio=soxr.resample(audio,sr*2**(pitch/12),sr)
            path=out/(ident+'-pitched.wav');sf.write(path,audio,sr,subtype='PCM_24')
        uncut_duration=len(audio)/sr
        cut=line.get('cut');trim_word=line.get('trim_word');trim_evidence=None
        if trim_word:
            if cut is not None:raise ValueError(ident+': use trim_word or cut, not both')
            words=lambda value:re.findall(r"[\w']+",value.casefold())
            if words(text)[:1]!=words(trim_word) or words(line.get('spoken_text',''))!=words(trim_word):raise ValueError(ident+': first-word trim must preserve the declared spoken text')
            if word_model is None:
                from core.tts.asr_check import load_model
                word_model=load_model('small.en')
            import soxr
            y=soxr.resample(audio,sr,16000).astype(np.float32);pad=np.zeros(4800,np.float32)
            detected,_=word_model.transcribe(np.concatenate([pad,y,pad]),language='en',beam_size=5,word_timestamps=True)
            detected=list(detected);tokens=[w for segment in detected for w in (segment.words or []) if words(w.word)]
            if not tokens or words(tokens[0].word)!=words(trim_word):raise RuntimeError(ident+': independent first-word ASR could not locate '+trim_word)
            cut=min(uncut_duration-.001,max(.03,tokens[0].end-.3))
            trim_evidence=dict(word=tokens[0].word,start=max(0,tokens[0].start-.3),end=cut,asr_model='small.en',transcript=' '.join(seg.text.strip() for seg in detected))
        if cut is not None:
            cut=float(cut)
            if cut<=0 or cut>=uncut_duration:raise ValueError(ident+': intentional cut must fall inside the generated take')
            audio=audio[:round(cut*sr)].copy();fade=min(round(float(line.get('cut_fade',.04))*sr),len(audio))
            if fade:audio[-fade:]*=np.linspace(1,0,fade)
            path=out/(ident+'-cut.wav');sf.write(path,audio,sr,subtype='PCM_24')
        actual=len(audio)/sr;start=float(line['start']);window=float(line.get('duration',actual));next_start=float(lines[n+1]['start']) if n+1<len(lines) else float(spec.get('duration',start+window+.5));available=window+.4 if line.get('allow_overlap',spec.get('allow_overlap',False)) else min(window+.4,next_start-start-.1)
        # Fresh takes may vary slightly; preserve all words and cue onset with a bounded pitch-preserving fit.
        fitted=path
        factor=actual/max(available,.1)
        if factor>1.001:
            if factor>1.25:raise RuntimeError(f'{ident}: {actual:.3f}s speech will not fit {available:.3f}s; adjust delivery speed without changing text')
            fitted=out/(ident+'-timed.wav');subprocess.run(['ffmpeg','-y','-v','error','-i',str(path),'-af',f'atempo={factor:.8f}',str(fitted)],check=True)
        record=dict(id=ident,text=text,voice=voice,language=language,start=start,planned_duration=window,synthesized_duration=synthesized_duration,raw_duration=actual,pitch_semitones=pitch,file=str(fitted.resolve()),tempo_factor=max(1,factor),filter=line.get('filter'))
        if native:record.update(engine='macos-say',rate=rate)
        if trim_evidence:record.update(spoken_text=line['spoken_text'],trim_word=trim_word,trim_evidence=trim_evidence)
        for field,default in [('gain',1),('pan',0)]:
            if field in line:
                value=float(line[field])
                if not np.isfinite(value) or (field=='gain' and value<0) or (field=='pan' and not -1<=value<=1):raise ValueError(ident+': invalid speech '+field)
                record[field]=value
        if pitch_mode!='varispeed':record['pitch_mode']=pitch_mode
        if cut is not None:record.update(intentional_cut_seconds=cut,uncut_duration=uncut_duration,cut_fade=float(line.get('cut_fade',.04)))
        if line.get('allow_overlap',spec.get('allow_overlap',False)):record['allow_overlap']=True
        records.append(record)
        print(ident,round(actual,3),voice,flush=True)
    (out/'timing.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n');return records
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('spec',type=Path);p.add_argument('out',type=Path);a=p.parse_args();synthesize(json.loads(a.spec.read_text()),a.out)
