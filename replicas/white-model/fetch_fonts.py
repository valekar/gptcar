"""Download and freeze OFL faces for the independent white-model recreation."""
from pathlib import Path
import urllib.request,urllib.parse,re
p=Path(__file__).parent;out=p/'fonts';out.mkdir(exist_ok=True)
source=''.join(f.read_text()for f in p.glob('*.js'))+(p/'subtitles.json').read_text();chars=''.join(sorted(set(re.findall(r'[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef·°–]',source))))+''.join(chr(i)for i in range(32,127));ua={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'}
def get(u):return urllib.request.urlopen(urllib.request.Request(u,headers=ua),timeout=60).read()
css=[]
for family,weights,alias in [('Noto Sans SC',[300,500],'SC'),('Inter Tight',[200,400],'IT'),('IBM Plex Mono',[400],'PM')]:
 for w in weights:
  data=get('https://fonts.googleapis.com/css2?family='+urllib.parse.quote(family)+':wght@'+str(w)+'&text='+urllib.parse.quote(chars)).decode();url=re.findall(r'url\((https://[^)]+)\)',data)[0];name=alias+str(w)+'.woff2';(out/name).write_bytes(get(url));css.append('@font-face{font-family:'+alias+';src:url(fonts/'+name+');font-weight:'+str(w)+'}')
for family in['notosanssc','intertight','ibmplexmono']:(out/('OFL-'+family+'.txt')).write_bytes(get('https://raw.githubusercontent.com/google/fonts/main/ofl/'+family+'/OFL.txt'))
(p/'fonts.css').write_text('\n'.join(css))
