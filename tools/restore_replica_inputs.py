#!/usr/bin/env python3
"""Verify and restore the shared-input release asset before strict gallery validation."""
import hashlib,json,tarfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def restore():
 man=json.loads((ROOT/'comparison/replication-inputs.json').read_text());p=ROOT/'.release'/man['asset']
 if sha(p)!=man['sha256'] or p.stat().st_size!=man['bytes']:raise SystemExit('Shared input package checksum mismatch')
 with tarfile.open(p) as t:
  entries=t.getmembers()
  if set(x.name for x in entries)!=set(man['files']):raise SystemExit('Unexpected shared-input archive inventory')
  if any(not x.isfile() or Path(x.name).is_absolute() or '..' in Path(x.name).parts for x in entries):raise SystemExit('Unsafe archive member')
  t.extractall(ROOT,filter='data')
 for name,d in man['files'].items():
  if sha(ROOT/name)!=d['sha256'] or (ROOT/name).stat().st_size!=d['bytes']:raise SystemExit('Shared input changed: '+name)
 print('Verified shared inputs:',len(man['files']))
if __name__=='__main__':restore()
