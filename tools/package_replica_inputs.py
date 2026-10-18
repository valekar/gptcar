#!/usr/bin/env python3
"""Package credited shared inputs excluded from Git so CI can verify the same film sources."""
import hashlib,json,subprocess,tarfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def package():
 tracked=set(subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode().split('\0'));files={}
 for p in sorted((ROOT/'replicas').glob('*/generation.json')):
  for c in json.loads(p.read_text()).get('shared_components',[]):
   rel=c if isinstance(c,str) else c['path'];q=(ROOT/rel.split('::',1)[0]).resolve()
   if ROOT not in q.parents:raise RuntimeError('Shared input outside checkout')
   if not q.exists():raise RuntimeError('Missing shared input: '+rel)
   for f in (sorted(q.rglob('*')) if q.is_dir() else [q]):
    if not f.is_file():continue
    name=f.relative_to(ROOT).as_posix()
    if name not in tracked:files[name]=f
 out=ROOT/'.release/replication-inputs.tar.gz';out.parent.mkdir(exist_ok=True)
 with tarfile.open(out,'w:gz') as t:
  for name,f in sorted(files.items()):t.add(f,arcname=name,recursive=False)
 man={'asset':out.name,'sha256':sha(out),'bytes':out.stat().st_size,'files':{n:dict(sha256=sha(f),bytes=f.stat().st_size) for n,f in sorted(files.items())}}
 (ROOT/'comparison/replication-inputs.json').write_text(json.dumps(man,indent=2)+'\n');print('Shared input package:',len(files),'files,',out.stat().st_size,'bytes')
if __name__=='__main__':package()
