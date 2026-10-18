// Fixed-step rigid brick fall, recorded once. No frame-history state in render().
import * as T from 'three';
import {mulberry,clamp} from '/core/lib.js';
const V=(...a)=>new T.Vector3(...a),rng=mulberry(691);
export function fallingStack(centers,halfExtents,pivot){
 const dt=1/240,gravity=420,release=.36,axis=V(0,0,1),bodies=centers.map((p,i)=>({p:p.clone(),q:new T.Quaternion(),v:V(),w:V((rng()-.5)*6,(rng()-.5)*8,-3-rng()*2),half:halfExtents[i]})),frames=[];
 let released=false;const corners=[];for(let x of[-1,1])for(let y of[-1,1])for(let z of[-1,1])corners.push(V(x,y,z));
 const floor=(x,z)=>Math.abs(x-9)<4&&Math.abs(z+2)<4?.7:Math.abs(x)<16&&Math.abs(z)<12?.3:0;
 for(let step=0;step<=960;step++){
  let t=step*dt,angle=.07+2.4*t*t,omega=4.8*t;
  if(t<release){bodies.forEach((b,i)=>{b.q.setFromAxisAngle(axis,-angle);b.p.copy(centers[i]).sub(pivot).applyQuaternion(b.q).add(pivot)})}
  else{
   if(!released){released=true;bodies.forEach(b=>{let r=b.p.clone().sub(pivot);b.v.set(omega*r.y,-omega*r.x,0);b.v.add(V((rng()-.3)*7,rng()*3,(rng()-.5)*10))})}
   for(const b of bodies){b.v.y-=gravity*dt;b.p.addScaledVector(b.v,dt);let wl=b.w.length();if(wl>.0001)b.q.premultiply(new T.Quaternion().setFromAxisAngle(b.w.clone().divideScalar(wl),wl*dt));let lo=Infinity,contact=V();for(const corner of corners){let c=corner.clone().multiply(b.half).applyQuaternion(b.q).add(b.p);if(c.y<lo){lo=c.y;contact.copy(c)}}let ground=floor(contact.x,contact.z);if(lo<ground){b.p.y+=ground-lo;if(b.v.y<0)b.v.y*=-.28;b.v.x*=.76;b.v.z*=.76;b.w.multiplyScalar(.65);if(t>1.2&&b.v.length()<4){b.v.set(0,0,0);b.w.multiplyScalar(.2)}}}
   for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){let a=bodies[i],b=bodies[j],dx=b.p.x-a.p.x,dz=b.p.z-a.p.z,d=Math.hypot(dx,dz);if(Math.abs(a.p.y-b.p.y)<1.4&&d>0&&d<2.6){let push=(2.6-d)*.5;a.p.x-=dx/d*push;a.p.z-=dz/d*push;b.p.x+=dx/d*push;b.p.z+=dz/d*push}}
  }
  if(step%10===0)frames.push(bodies.map(b=>({p:b.p.toArray(),q:b.q.toArray()})));
 }
 function pose(t,i){let f=Math.round(clamp(t,0,4)*24),a=frames[Math.min(frames.length-1,f)][i];return{p:V(...a.p),q:new T.Quaternion(...a.q)}}
 return{pose,rest:i=>pose(4,i)};
}
