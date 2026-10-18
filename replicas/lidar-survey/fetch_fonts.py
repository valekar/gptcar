from pathlib import Path
import urllib.request, shutil
from fontTools import subset
D=Path('replicas/lidar-survey');F=D/'fonts';F.mkdir(exist_ok=True)
url='https://raw.githubusercontent.com/google/fonts/main/ofl/'
files={**{f'BarlowCondensed-{w}.ttf':f'barlowcondensed/BarlowCondensed-{w}.ttf' for w in ['Light','Regular','Medium']},**{f'IBMPlexMono-{w}.ttf':f'ibmplexmono/IBMPlexMono-{w}.ttf' for w in ['Regular','Medium']}}
for f,u in files.items():
 if not (F/f).exists():(F/f).write_bytes(urllib.request.urlopen(url+u).read())
cache=Path('work/gptcar/matched-audit/NotoSansSC.ttf')
if not cache.exists():cache.write_bytes(urllib.request.urlopen(url+'notosanssc/NotoSansSC%5Bwght%5D.ttf').read())
chars=''.join((D/f).read_text() for f in ['hud.js','subtitles.json','PROMPT.md'])+''.join(chr(i)for i in range(32,127))+'×²−▸°'
o=subset.Options();o.flavor='woff2';o.layout_features=['*'];font=subset.load_font(str(cache),o);s=subset.Subsetter(o);s.populate(text=chars);s.subset(font);subset.save_font(font,str(F/'NotoSansSC-sub.woff2'),o)
for f in Path('styles/lidar-survey/demo/fonts').glob('OFL*'):shutil.copy2(f,F/f.name)
css='@font-face{font-family:"Noto Sans SC";src:url(fonts/NotoSansSC-sub.woff2);font-weight:100 900}\n'
for w,n in [(300,'Light'),(400,'Regular'),(500,'Medium')]:css+=f'@font-face{{font-family:"Barlow Condensed";src:url(fonts/BarlowCondensed-{n}.ttf);font-weight:{w}}}\n'
for w,n in [(400,'Regular'),(500,'Medium')]:css+=f'@font-face{{font-family:"Plex Mono";src:url(fonts/IBMPlexMono-{n}.ttf);font-weight:{w}}}\n'
(D/'fonts.css').write_text(css)
