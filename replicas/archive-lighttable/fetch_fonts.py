"""Freeze OFL fonts required by the independent archive recreation."""
from pathlib import Path
import re,urllib.request,urllib.parse
p=Path(__file__).parent;out=p/'fonts';out.mkdir(exist_ok=True)
src=''.join(x.read_text()for x in p.glob('*.js'))+(p/'subtitles.json').read_text();latin=''.join(chr(i)for i in range(32,127));chars=''.join(sorted(set(re.findall(r'[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef·×→−—]',src))))+latin
ua={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'}
def get(url):return urllib.request.urlopen(urllib.request.Request(url,headers=ua),timeout=60).read()
for fam,weights,key in [('Noto Sans SC',[400,500,600],'SC'),('Noto Serif SC',[600],'SS'),('IBM Plex Mono',[400,500],'PM'),('IBM Plex Sans',[400,500],'PS')]:
 for w in weights:
  text=chars if key in['SC','SS']else latin+'·×→−—’';css=get('https://fonts.googleapis.com/css2?family='+urllib.parse.quote(fam)+':wght@'+str(w)+'&text='+urllib.parse.quote(text)).decode();url=re.findall(r'url\((https://[^)]+)\)',css)[0];(out/(key+str(w)+'.woff2')).write_bytes(get(url))
for fam in['notosanssc','notoserifsc','ibmplexsans','ibmplexmono']:(out/('OFL-'+fam+'.txt')).write_bytes(get('https://raw.githubusercontent.com/google/fonts/main/ofl/'+fam+'/OFL.txt'))
