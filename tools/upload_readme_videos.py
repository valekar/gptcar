#!/usr/bin/env python3
"""Upload the prepared public comparison previews as native GitHub attachments.

Uses the same endpoint as GitHub CLI's official internal/attachments/client.go:
https://github.com/cli/cli/blob/trunk/internal/attachments/client.go
No issues, comments or releases are created. URLs are saved after each upload.
Existing attachment mappings with matching content are reused.
"""
import argparse,hashlib,json,os,subprocess
from pathlib import Path
import requests
ROOT=Path(__file__).resolve().parents[1]

def upload(slugs=None):
    manifest=json.loads((ROOT/'comparison/readme-media.json').read_text());mapping=ROOT/'comparison/readme-attachments.json';saved=json.loads(mapping.read_text())if mapping.exists()else dict(repository='valekar/gptcar',attachments={})
    result=subprocess.run(['git','credential','fill'],input='protocol=https\nhost=github.com\n\n',capture_output=True,text=True,check=True,env={**os.environ,'GIT_TERMINAL_PROMPT':'0'});credential=dict(x.split('=',1)for x in result.stdout.splitlines()if'='in x);token=credential.get('password');assert token,'No configured GitHub credential'
    session=requests.Session();session.headers.update({'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','User-Agent':'GPTcar-README-comparisons'})
    r=session.get('https://api.github.com/repos/valekar/gptcar',timeout=30);r.raise_for_status();repo=r.json();assert repo['permissions']['push'],'Repository write access required'
    for row in manifest['media']:
        if slugs and row['slug']not in slugs:continue
        key=row['side']+'__'+row['slug'];prior=saved['attachments'].get(key)
        if prior and prior['sha256']==row['sha256']:print('Reused',key,flush=True);continue
        f=ROOT/'work/readme-inline/videos'/row['filename'];assert hashlib.sha256(f.read_bytes()).hexdigest()==row['sha256'];assert f.stat().st_size<10_000_000
        with f.open('rb')as stream:
            response=session.post('https://uploads.github.com/user-attachments/assets',params={'name':f.name,'content_type':'video/mp4','repository_id':repo['id']},headers={'Content-Type':'application/octet-stream'},data=stream,timeout=180,allow_redirects=False)
        if not response.ok:raise RuntimeError('Upload refused: HTTP '+str(response.status_code)+' '+response.text[:200])
        url=response.json()['url'];assert url.startswith('https://github.com/user-attachments/assets/'),url
        saved['attachments'][key]=dict(url=url,filename=f.name,sha256=row['sha256'],source_sha256=row['source_sha256']);mapping.write_text(json.dumps(saved,indent=2)+'\n');print('Uploaded',key,url,flush=True)
    return saved
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--style',action='append');a=p.parse_args();upload(a.style)
