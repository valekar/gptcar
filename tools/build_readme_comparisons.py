#!/usr/bin/env python3
"""Generate all51 native GitHub video pairs in README.md from pinned manifests."""
import argparse,html,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
START='<!-- readme-comparisons:start -->';END='<!-- readme-comparisons:end -->'

def build(check=False):
    catalog=json.loads((ROOT/'comparison/catalog.json').read_text());media=json.loads((ROOT/'comparison/readme-media.json').read_text())['media'];uploads=json.loads((ROOT/'comparison/readme-attachments.json').read_text())['attachments'];index={(r['slug'],r['side']):r for r in media}
    assert len(catalog)==51 and len({s['slug']for s in catalog})==51
    assert len(index)==102,'Prepare the complete102-film preview inventory first'
    chunks=[START,'## All 51 video comparisons','',
    'Watch the films here in the README. **Opus 5.5 originals are on the left; GPT-6.1 Sol High recreations are on the right.** Each player has its own play, seek, volume and fullscreen controls. Play one soundtrack at a time when comparing audio.','',
    'These are **full-length, 640-pixel previews**, compressed for the README. The full-resolution masters and the scene script are linked below every pair. Expand a category to watch its styles; the first category is open. The [comparison gallery](https://valekar.github.io/gptcar/) also offers synchronized playback.','',
    'Original films: Lemomo / LemoLab. GPT reconstructions: GPTcar. Shared assets and remaining differences are documented in the [production conditions](comparison/REPLICATION.md) and [review report](comparison/REPLICATION_REPORT.md).','']
    categories=list(dict.fromkeys(s['category']for s in catalog));n=0
    for ci,category in enumerate(categories):
        styles=[s for s in catalog if s['category']==category]
        chunks.extend(['<details'+(' open'if ci==0 else'')+'>','<summary><strong>'+html.escape(category)+' · '+str(len(styles))+' styles</strong></summary>',''])
        for s in styles:
            n+=1;slug=s['slug'];rows=[]
            for side in ['opus','gpt']:
                item=index[(slug,side)];asset=uploads[side+'__'+slug];assert asset['sha256']==item['sha256'];assert asset['source_sha256']==item['source_sha256'];assert re.fullmatch(r'https://github\.com/user-attachments/assets/[0-9a-f-]{36}',asset['url']);assert abs(item['preview_duration']-item['source_duration'])<.15
                rows.append('<td width="50%"><video src="'+asset['url']+'" controls width="400"></video></td>')
            chunks.extend(['### '+str(n)+'. '+s['name'],'',
                '<table>','<thead><tr><th width="50%">Opus 5.5 · Original</th><th width="50%">GPT-6.1 Sol High · Recreation</th></tr></thead>',
                '<tbody><tr>'+''.join(rows)+'</tr></tbody>','</table>','',
                '[Full-resolution Opus]('+index[(slug,'opus')]['source_url']+') · [Full-resolution GPT]('+index[(slug,'gpt')]['source_url']+') · [Scene script](comparison/matched-briefs/'+slug+'.md) · [Style instructions](styles/'+slug+'/STYLE.md)',''])
        chunks.extend(['</details>',''])
    chunks.extend(['<!-- Generated with python3 tools/build_readme_comparisons.py; attachment hashes in comparison/readme-attachments.json. -->',END])
    block='\n'.join(chunks);readme=ROOT/'README.md';text=readme.read_text()
    if START in text:
        a=text.index(START);b=text.index(END,a)+len(END);new=text[:a]+block+text[b:]
    else:
        point=text.index('## Start in Codex');new=text[:point]+block+'\n\n'+text[point:]
    assert new.count('<video ')==102;assert len(new.encode())<500_000
    if check:assert new==text,'README generated block is stale'
    else:readme.write_text(new)
    print('README:51 styles,102 native video players,',len(new.encode()),'bytes')
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--check',action='store_true');a=p.parse_args();build(a.check)
