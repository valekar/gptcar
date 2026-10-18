import{monotone,ss,seg,eo,eio,clamp}from'/core/lib.js';
import{cameraKeys,dives,rotate,world,hit}from'./layout.js';
// Zero-endpoint monotone tracks via equal-value guard keys; generic core helper handles the interpolation.
const curve=k=>monotone([[k[0][0]-1,k[0][1]],...k,[k.at(-1)[0]+1,k.at(-1)[1]]]),vec=k=>{let a=curve(k.map(([t,p])=>[t,p[0]])),b=curve(k.map(([t,p])=>[t,p[1]]));return t=>[a(t),b(t)]};
let C=vec(cameraKeys.map(([t,p])=>[t,p])),Z=curve(cameraKeys.map(([t,p,z])=>[t,Math.log(z)])),A=curve(cameraKeys.map(([t,p,z,a])=>[t,a]));
export const cam=t=>({centre:C(t),z:Math.exp(Z(t)),angle:A(t)*Math.PI/180});
for(let d of dives){d.S=curve([[d.drop,cam(d.drop).z*2.5],...d.scale,[d.lift,cam(d.lift).z*2.5]]);d.C=vec([[d.drop,d.anchor],...d.centre,[d.lift,d.anchor]])}
export function screen(w,c){let p=rotate(w.map((v,i)=>(v-c.centre[i])*c.z),c.angle);return[p[0]+960,p[1]+540]}
export function state(t){let c=cam(t),d=dives.find(d=>t>=d.drop-.4&&t<=d.lift+.4),s={camera:c,id:0,centre:[0,0],radius:0,alpha:0,lift:1,scale:1,inner:[0,0],distortion:.16,enter:0,depth:0,shift:[0,0],fly:[0,0],wil:[0,0],develop:t<15?0:1.25*eio(seg(t,15,15.8))};
 if(!d)return s;let landing=eo(seg(t,d.drop-.4,d.drop)),lifting=eo(seg(t,d.lift,d.lift+.4)),q=clamp(t,d.drop,d.lift);s.id=d.id;s.alpha=landing*(1-ss(seg(t,d.lift,d.lift+.4)));s.lift=1+.35*(1-landing)+.35*lifting;s.radius=1000*c.z*s.lift;s.centre=screen(d.anchor,c);s.scale=t<d.drop||t>d.lift?c.z*2.5*s.lift:d.S(q);s.inner=d.C(q);
 let push=d.id===1?2:d.id===2?16:25,end=d.id===1?3.2:d.id===2?17.9:26.2333,rise=d.id===1?9.3333:d.id===2?22.6667:35;
 s.distortion=.16*(1-ss(seg(t,push+(d.id===2?.4:.3),end)))+.16*ss(seg(t,rise+.3,d.lift));
 if(d.id>1){s.enter=ss(seg(t,push+(d.id===2?.5:.4),d.id===2?18:26.3333))*(1-ss(seg(t,rise,rise+.9)));if(d.id===2){let p=ss(seg(t,16.6,23.0667)),f=eio(seg(t,16.8,23.2667));s.depth=.55*p;s.shift=[260*p,-140*p];s.fly=[125*f,-26*f];s.wil=[10*f,0]}else s.depth=.6*ss(seg(t,26.3333,35))}return s;
}
export function inside(w,n,s,focus=0){let q=1+s.depth*s.enter*(n-focus),v=w.map((a,i)=>((a-s.inner[i])*q+s.shift[i]*s.enter*(n-focus))*s.scale),r=rotate(v,s.camera.angle);return r.map((a,i)=>a+s.centre[i])}
export function photo(k,p,s){let n=k==='p1'?Math.max(0,(p[1]-1540)/2064):clamp((p[1]-1385)/2232,0,1);return inside(world(k,p),n,s,k==='p1'?340/2064:.01)}
