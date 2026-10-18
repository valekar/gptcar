// Independently assembled process props. Dimensions are measured from the published reference.
// Uses the attributed generic Iso primitive toolkit, not the original station/story renderer.
import {tri,hex,mix,hash,lerp,seg,ss,TAU,PAL} from './engine.js';

export function grains(I,a,b,t,color,n=16) {
  I.add(10000,()=>{for(let j=0;j<n;j++){
    const f=(j/n+t*2.2)%1,p=a.map((v,k)=>lerp(v,b[k],f));p[2]-=.4*f*f;
    const [x,y]=I.L(...p),g=I.g;g.beginPath();g.ellipse(x+(hash(j)-.5)*6,y,I.cam.k*.1,I.cam.k*.07,j,0,TAU);g.fillStyle=I.col(color);g.fill();
  }},1);
}
export function crack(I,p,q) {
  I.add(20000,()=>{const g=I.g,[x,y]=I.L(...p),k=I.cam.k;g.save();g.globalAlpha=1-q;g.strokeStyle=PAL.ink;g.lineWidth=2.2;g.lineCap='round';
    for(let j=0;j<6;j++){const a=j*TAU/6+.3,r=k*(.25+q*.5);g.beginPath();g.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);g.lineTo(x+Math.cos(a)*(r+.3*k),y+Math.sin(a)*(r+.3*k));g.stroke();}
    for(let j=0;j<3;j++){const a=hash(p[0]+j)*TAU;g.beginPath();g.ellipse(x+Math.cos(a)*q*k*1.1,y+Math.sin(a)*q*k*.8+q*q*k,k*.1,k*.07,a,0,TAU);g.fillStyle='#8A5A34';g.fill();}g.restore();
  },1);
}
export function drumModel(I,R,state) {
  const {t,color,loaded,cooling}=state,x=R.x+4.2,y=R.y+6.5,z=3.4,L=5.2;
  for(const [a,b,w,d,h,c] of [[1,1,3,2.2,2.1,'#9FAF7A'],[1,3.3,3,2.2,1.4,'#A8B882'],[1.4,1.2,2.2,1.8,1.1,'#9FAF7A']]) I.box(R.x+a,R.y+b,a===1.4?2.1:0,w,d,h,tri(c));
  I.box(x-.2,y-1.8,0,L+.4,3.6,1.2,tri('#3A3432'));
  I.cyl(x,y,z,2.4,L,tri('#3A3432'),{axis:'x',n:28,spin:t*2.2,stripe:j=>j%7===0?'#5A524E':null,decal:Q=>{
    const g=Q.g,[sx,sy]=Q.L(x+L+.02,y,z),r=1.35*Q.cam.k;g.save();g.beginPath();g.ellipse(sx,sy,r*.72,r*1.02,-.52,0,TAU);g.fillStyle=Q.col('#C9C2B4');g.fill();
    g.beginPath();g.ellipse(sx,sy,r*.6,r*.86,-.52,0,TAU);g.fillStyle=Q.col('#2A2420');g.fill();g.clip();
    if(loaded)for(let j=0;j<26;j++){let a=j*TAU/26+t*2.2*(1+j%3*.2),rr=r*(.25+.5*hash(j));g.beginPath();g.ellipse(sx+Math.cos(a)*rr*.6,sy+Math.sin(a)*rr*.8+r*.25,r*.09,r*.065,a,0,TAU);g.fillStyle=Q.col(color);g.fill();}g.restore();
  }});
  I.box(x+1.2,y-.7,5.6,1.6,1.4,1.5,tri('#6E6A62'));I.cyl(x+3.6,y,5.5,.32,2.5,tri('#8A8580'),{n:12});
  I.cyl(R.x+12.4,R.y+8.6,0,2.3,1.2,tri('#B8B2A6'),{n:28,capColor:cooling>0?hex(mix('#8E8A82','#5A301C',ss(cooling))):'#8E8A82'});
  if(cooling>0)I.line3([[R.x+12.4,R.y+8.6,1.3],[R.x+12.4+Math.cos(t*3)*2,R.y+8.6+Math.sin(t*3)*2,1.3]],'#3A3432',3,{bias:5});
}
export function espressoModel(I,C,state) {
  const {t,open,dropGrowing,dropFalling,stream}=state,x=C.x+5.8,y=C.y+3.1,z=2.32,w=3,d=1.3,h=1.9,T=tri('#B9B6AE',.25,.28);
  I.add(x+w/2+y+d/2+z+h,()=>{
    if(open<1)I.boxNow(x,y,z,w,d,h,T);
    if(open>0){
      I.face3([[x+w+.01,y,z],[x+w+.01,y+d,z],[x+w+.01,y+d,z+h],[x+w+.01,y,z+h]],T,{out:[1,0,0],color:'#3A3432'});
      const g=I.g;g.save();g.globalAlpha=open;I.cylNow(x+w-.9,y+.65,z+.35,.45,1.1,tri('#C0704A'),{n:16});
      const [ex,ey]=I.L(x+w-.9,y+.65,z+.5);g.beginPath();g.ellipse(ex,ey,.3*I.cam.k,.15*I.cam.k,0,0,TAU);g.fillStyle=I.col('#F09A3E',.5+.4*(.5+.5*Math.sin(t*9)));g.fill();
      I.line3([[x+w-.9,y+.65,z+1.45],[x+w-.9,y+.65,z+1.7],[x+1.5,y+.65,z+1.7],[x+1.5,y+d+.2,z+1.2]],'#8A8580',Math.max(2,I.cam.k*.08),{now:true});g.restore();
      I.face3([[x,y+d+.01,z],[x+w,y+d+.01,z],[x+w,y+d+.01,z+h],[x,y+d+.01,z+h]],T,{out:[0,1,0]});
    }
    I.boxNow(x-.05,y-.05,z+h,w+.1,d+.1,.1,tri('#3A3432'));
    for(let j=0;j<3;j++)I.cylNow(x+.5+j*.8,y+.6,z+h+.1,.22,.3,tri('#F4ECDC'),{n:12});
    I.face3([[x+.2,y+d+.01,z+.9],[x+w-.2,y+d+.01,z+.9],[x+w-.2,y+d+.01,z+h-.25],[x+.2,y+d+.01,z+h-.25]],tri('#3A3432'),{out:[0,1,0]});
    I.boxNow(x+.6,y+d,z,w-1.2,.55,.12,tri('#6E6A62'));I.boxNow(x+1.2,y+d,z+1,.5,.4,.35,tri('#8A8580'));
    I.boxNow(x+1.33,y+d+.4,z+.9,.24,.18,.12,tri('#6E6A62'));I.boxNow(x+1.39,y+d+.55,z+.92,.12,1,.1,tri('#2E2A28'));
    const [sx,sy]=I.L(C.x+7.3,C.y+4.65,z+.95),[cx,cy]=I.L(C.x+7.3,C.y+4.65,z+.4),g=I.g,k=I.cam.k;
    if(dropGrowing>0&&dropGrowing<1){g.beginPath();g.ellipse(sx,sy+dropGrowing*.05*k,.04*k*(.5+dropGrowing),.05*k*(.5+dropGrowing*1.2),0,0,TAU);g.fillStyle=I.col('#3A2016');g.fill();}
    if(dropFalling>=0&&dropFalling<1){g.beginPath();g.ellipse(sx,lerp(sy,cy,dropFalling**2),.05*k,.07*k,0,0,TAU);g.fillStyle=I.col('#3A2016');g.fill();}
    if(stream>0){g.save();g.strokeStyle=I.col('#4A2A1A');g.lineWidth=Math.max(1.5,.035*k*stream);g.beginPath();g.moveTo(sx,sy);g.lineTo(cx,cy);g.stroke();g.restore();}
  },1);
}
