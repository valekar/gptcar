// New print staging and camera composition; generic relief compositor and paper curl are attributed.
import*as W from'./engine/index.js';import{seg,ss,eo,lerp}from'/core/lib.js';
export const WIDTH=1920,HEIGHT=1080,IMG={x:36,y:36,w:1848,h:912};export const[mask,m]=W.canvas(),[color,c]=W.canvas(),printer=W.makePrinter();
export const buffers=Array.from({length:5},()=>W.canvas());
export function matrix(cam={}){let z=cam.z??1,a=cam.r||0,co=Math.cos(a)*z,si=Math.sin(a)*z,x=cam.x??924,y=cam.y??456;return[co,si,-si,co,960-co*x+si*y,492-si*x-co*y]}
export function print(tg,t,cam,draw,{seed=3,jolt=false,cap=true,reg=[3,2],plateAmt=1}={}){
 m.setTransform(1,0,0,1,0,0);c.setTransform(1,0,0,1,0,0);m.fillStyle='#fff';m.fillRect(0,0,1920,1080);c.clearRect(0,0,1920,1080);
 for(let q of[m,c]){q.save();q.beginPath();q.rect(36,36,1848,912);q.clip();q.transform(...matrix(cam))}m.fillStyle='#000';m.fillRect(-4000,-4000,12000,12000);draw(m,c);m.restore();c.restore();
 m.setTransform(1,0,0,1,0,0);c.setTransform(1,0,0,1,0,0);if(cap)caption(t);let dx=0,dy=0;if(jolt!==false){if(jolt<1/24)[dx,dy]=[5,-3];else if(jolt<2/24)[dx,dy]=[-2,1]}if(dx||dy){tg.fillStyle='#EFE8D8';tg.fillRect(0,0,1920,1080)}tg.drawImage(printer.render(mask,color,{seed,inkSeed:seed,reg,plateAmt}),dx,dy);
}
export const narration=await fetch('narration.json').then(r=>r.json());
export function caption(t){let line=narration.lines.find(l=>t>=l.start-.05&&t<l.start+Math.max(1.8,l.duration+.6));if(!line)return;let a=Math.min(seg(t,line.start-.05,line.start+.05),1-seg(t,line.start+Math.max(1.8,line.duration+.6)-.15,line.start+Math.max(1.8,line.duration+.6)));m.save();m.font='400 44px "IM Fell English"';m.textAlign='center';m.textBaseline='middle';m.fillStyle=`rgba(0,0,0,${a})`;m.fillText(line.text,960,1016);m.restore()}
export function black(q){q.fillStyle='#000';q.fillRect(-3000,-3000,8000,8000)}
export function tint(c,x,y,r,amount){if(amount<=0)return;let gr=c.createRadialGradient(x,y,10,x,y,r);gr.addColorStop(0,`rgba(0,0,0,${amount})`);gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(x-r,y-r,r*2,r*2)}
let paperCache;export function paper(){if(paperCache)return paperCache;const[a,q]=W.canvas();m.setTransform(1,0,0,1,0,0);m.fillStyle='#fff';m.fillRect(0,0,1920,1080);c.clearRect(0,0,1920,1080);q.drawImage(printer.render(mask,color,{seed:13}),0,0);return paperCache=a}
export function backOf(front,alpha=.3){const[a,q]=buffers[4];q.setTransform(1,0,0,1,0,0);q.globalCompositeOperation='source-over';q.globalAlpha=1;q.drawImage(paper(),0,0);q.save();q.globalCompositeOperation='multiply';q.globalAlpha=alpha;q.setTransform(-1,0,0,1,1920,0);q.drawImage(front,0,0);q.restore();return a}
export function roller(g,x){g.save();g.fillStyle='rgba(0,0,0,.45)';g.filter='blur(16px)';g.fillRect(x+30,30,70,1040);g.filter='none';let gr=g.createLinearGradient(x-38,0,x+38,0);for(let[p,c]of[[0,'#050505'],[.35,'#3a3a3a'],[.5,'#8d8d8d'],[.62,'#2a2a2a'],[1,'#040404']])gr.addColorStop(p,c);g.fillStyle=gr;g.fillRect(x-38,16,76,1020);g.fillStyle='#5a3d22';g.fillRect(x-10,-40,20,70);g.fillRect(x-46,6,92,14);g.restore()}
function drawBaren(g,x,y,angle){g.save();g.translate(x,y);g.fillStyle='rgba(0,0,0,.35)';g.filter='blur(14px)';g.beginPath();g.ellipse(18,22,118,112,0,0,Math.PI*2);g.fill();g.filter='none';let gr=g.createRadialGradient(-30,-30,10,0,0,120);gr.addColorStop(0,'#6b5238');gr.addColorStop(.8,'#3b2a1a');gr.addColorStop(1,'#22170e');g.fillStyle=gr;g.beginPath();g.arc(0,0,112,0,Math.PI*2);g.fill();g.rotate(angle);g.strokeStyle='rgba(255,230,190,.12)';g.lineWidth=2;for(let j=0;j<6;j++){g.beginPath();g.arc(0,0,18+j*16,0,Math.PI*1.6);g.stroke()}g.fillStyle='#2a1d12';g.fillRect(-16,-128,32,60);g.restore()}

const barenCache=new Map();export function baren(g,x,y,angle){let key=angle.toFixed(6),cv=barenCache.get(key);if(!cv){let pair=W.canvas(420,420);drawBaren(pair[1],210,210,angle);cv=pair[0];barenCache.set(key,cv)}g.drawImage(cv,x-210,y-210)}
