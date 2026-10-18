"""Fetch licensed fonts from Google Fonts; subset CJK to this independent composition."""
from pathlib import Path
import re,urllib.request,urllib.parse
root=Path(__file__).parent;out=root/'fonts';out.mkdir(exist_ok=True)
agent={'User-Agent':'Mozilla/5.0 Chrome/120 Safari/537.36'}
def get(u):return urllib.request.urlopen(urllib.request.Request(u,headers=agent),timeout=60).read()
base='https://raw.githubusercontent.com/google/fonts/main/ofl/'
for family,files in {'barlowcondensed':['BarlowCondensed-Light.ttf','BarlowCondensed-Regular.ttf'],'ibmplexmono':['IBMPlexMono-Regular.ttf','IBMPlexMono-Medium.ttf']}.items():
 for name in files:(out/name).write_bytes(get(base+family+'/'+name))
for family in ['barlowcondensed','ibmplexmono','notosanssc','notoserifsc']:(out/(family+'-OFL.txt')).write_bytes(get(base+family+'/OFL.txt'))
source=(root/'film.js').read_text()+(root/'subtitles.json').read_text();chars=''.join(sorted(set(re.findall(r'[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef·×µ]',source))))+'0123456789%.,:;-+()/°= abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
for family,w,name in [('Noto Sans SC',400,'NotoSansSC-400'),('Noto Sans SC',500,'NotoSansSC-500'),('Noto Serif SC',600,'NotoSerifSC-600')]:
 css=get('https://fonts.googleapis.com/css2?family='+urllib.parse.quote(family)+':wght@'+str(w)+'&text='+urllib.parse.quote(chars)).decode();url=re.findall(r'url\((https://[^)]+)\)',css)[0];(out/(name+'.woff2')).write_bytes(get(url))
