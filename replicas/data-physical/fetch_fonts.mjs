// OFL font-subset acquisition; no original renderer or scene is executed.
import fs from 'node:fs';
const dir=new URL('.',import.meta.url),labels='风电太阳能黄铜每一片是年份装机将近的两倍一直在涨得更快超过仅当年新增多退后步十二合成张表盘如今正好反了过来条螺旋数据实物化全球累计经整理仅仅仅数据：IRENA (2026)，经 Our World in Data 整理 · CC BY 4.0';
const text=[...new Set(' 0123456789.,:+-=×÷·–—→%()/ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz，。：（）'+labels)].join('');
fs.mkdirSync(new URL('fonts',dir),{recursive:true});let css='';
for(const[fam,weights,name]of[['Noto Sans SC','400;500','NotoSC'],['Noto Serif SC','600','NotoSerifSC'],['Inter','200;300;400;500','Inter'],['JetBrains Mono','400;500','JBMono']]){const url='https://fonts.googleapis.com/css2?family='+fam.replaceAll(' ','+')+':wght@'+weights+'&text='+encodeURIComponent(text),r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36'}});if(!r.ok)throw Error(r.status);const content=await r.text();let i=0;for(const block of content.match(/@font-face\s*{[^}]*}/g)||[]){const wt=/font-weight:\s*(\d+)/.exec(block)[1],u=/url\((.*?)\)/.exec(block)[1],f=name+'-'+wt+'-'+i+++'.woff2',bin=await fetch(u);fs.writeFileSync(new URL('fonts/'+f,dir),Buffer.from(await bin.arrayBuffer()));css+=`@font-face{font-family:${name};font-weight:${wt};font-display:block;src:url(fonts/${f})}\n`}}
fs.writeFileSync(new URL('fonts.css',dir),css);console.log('fonts ready');
