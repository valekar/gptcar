/* New reference-matched scene implementation, GPT-6.1 Sol High.
   Canonical script/camera landmarks are requirements, not upstream executable scenes. */
import {makeComp} from './gl.js';
import {CAM,BOIL,layer,clear,line,fill,dab,text,ellipse,sx,sy} from './crayon.js';
import {group,clearGroup,part} from './rig.js';
import {girl,moon,sheep} from './chars.js';
import {PAL} from './pal.js';
import {world,waxStars,washPaint,moonPosition,seat,stars} from './page-art.js';
import {bookFrame} from './physical-book.js';
import {seg,lerp,track,ss,eo,hash} from '/core/lib.js';
const out=document.getElementById('c'),g=out.getContext('2d'),paint=document.createElement('canvas');paint.width=1920;paint.height=1080;const comp=makeComp(paint);
const sky=group(),ground={f:layer(),l:layer()},m=group(),s=group(),child=group(),wash=layer(),marks=layer(),sub=layer(),subpaper=layer();
const K=PAL.crayon;
const narration=await(await fetch('captions.json')).json();
const camera=track([[0,[1600,900,.6]],[5.6,[1600,900,.6]],[8.2,[2420,650,1.35]],[14.9,[2420,650,1.35]],[17.6,[1960,1130,.88]],[19.8,[1960,1130,.88]],[20.9,[1795,1480,1.7]],[21.6,[1795,1480,1.7]],[22.6,[1795,1425,1.7]],[23.5,[1795,1355,1.7]],[24.2,[1790,1290,1.55]],[27.1,[2110,800,.75]],[37.4,[2110,800,.75]],[40,[2400,610,1.25]],[42.4,[2410,600,1.3]],[43.3,[1458,955,2]],[44.8,[1458,955,2]],[46,[1600,900,.6]]]);
function moonAct(t){const q={x:moonPosition[0],y:moonPosition[1],s:moonPosition[2],seed:700,expr:'wide',lineDraw:seg(t,.9,1.6),fillDraw:seg(t,2.6,3.6),face:t>=1.67,look:[0,0],r:0};
 if(t>=7.5&&t<10){const turn=t<8.33?-1:t<9.17?0:1;q.expr=turn?'grumpy':'wide';q.r=turn*.35+(turn?Math.sin(t*20)*.04:0)}
 if(t>=10&&t<13.95){q.expr='look';q.look=[Math.sin((t-10)*7.54)*.6,.35]}
 if(t>=15&&t<27.5){q.expr=t>=18.33&&t<19.8?'smile':'look';q.look=[-.75,.66]}
 if(t>=27.5&&t<37.5){let p=seg(t,27.5,37);q.expr='look';q.look=[lerp(-.75,-.3,p),lerp(.66,.3,p)];q.lid=.5*seg(t,30,37)}
 if(t>=37.5){q.cap=seg(t,37.5,38.2);q.expr='drowsy';q.lid=.6}
 if(t>=38.3&&t<39.2){q.expr='yawn';q.yawnK=.6+.6*Math.sin(seg(t,38.3,39.2)*Math.PI)}
 if(t>=39.2){q.expr='asleep';q.lid=0;q.s*=1+.012*Math.sin(t*2.2)}
 q.r-=ss(seg(t,38.6,40));if(t>=40){q.blanket=ss(seg(t,40,41.6));q.hand=t<42.3?1:0;q.tuck=t>=41.6&&t<42.3?seg(t,41.6,42.3)*2:0}return q;
}
function childAct(t){let q={x:1548,y:1602,s:.44,view:'front',pose:'bed',expr:'awake',seed:3000};
 if(t<19.75){if(t>18.2){q.expr='smile';q.arms={R:Math.floor(t*6)%2?[[34,-182],[80,-200],[94,-252]]:[[34,-182],[86,-206],[112,-246]]}}return q}
 q.s=.56;q.view='side';q.pose='stand';q.toy=[-6,-130];
 if(t<20.2){let u=seg(t,19.75,20.2);q.x=lerp(1560,1740,u);q.y=lerp(1560,1640,u)-90*Math.sin(u*Math.PI);return q}
 if(t<24){let n=-1;for(let i=0;i<5;i++)if(t>=21.65+i*.45)n=i;let a=n<=0?1640:1598-(n-1)*44,b=n<0?1640:1598-n*44;q.x=1792;q.y=lerp(a,b,eo(seg(t,21.65+n*.45,21.87+n*.45)));q.view='back';q.pose='climb';q.ph=(n+1)%2;q.toy=[4,-128];return q}
 if(t<26.25){let u=seg(t,24.3,26.2);q.x=lerp(1850,seat[0]+20,u);q.y=lerp(1306,seat[1]+2,u)-Math.abs(Math.sin(u*Math.PI*4))*10;q.flip=true;q.r=.12;let h=Math.floor(t*4)%2?14:-6;q.legs=[[[4,-90],[h,-50],[h+4,-12]],[[-6,-90],[-h,-50],[-h-6,-12]]];return q}
 q.x=seat[0];q.y=seat[1];q.pose='sit';q.hug=true;q.headTilt=-.3;q.toy=[46,-58];
 q.expr=t<36?(t>=27.5&&t<36&&Math.sin(t*8)>.05?'sing':'awake'):t<41.3?'smile':t<43.2?'sleepy':t<44?'yawn':'sleep';
 if(t>=44&&t<44.3)q.r=-.55;if(t>=44.3){q.x-=40;q.y+=6;q.pose='lieback';q.flip=true;q.r=Math.atan2(-40,620);q.toy=[-58,-112]}return q;
}
function captions(t,canvasLayer=true){const i=narration.findIndex((q,i)=>t>=q.start-.1&&t<Math.min(q.start+Math.max(1.8,q.duration+.7),narration[i+1]?.start-.25||99));if(i<0)return;const q=narration[i],draw=seg(t,q.start-.1,q.start+.25),str=q.text;
 if(!canvasLayer){g.save();g.font='54px "Patrick Hand"';let w=g.measureText(str).width;g.fillStyle='#f4efe3';g.beginPath();g.ellipse(960,1002,w/2+35,41,0,0,7);g.fill();g.fillStyle=K.ink;g.textAlign='center';g.fillText(str.slice(0,Math.ceil(str.length*draw)),960,1021);g.restore();return}
 let c=subpaper.g;c.font='54px "Patrick Hand"';let w=c.measureText(str).width;c.fillStyle='#000';c.beginPath();for(let i=0;i<=64;i++){let a=i/64*Math.PI*2,x=960+Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**.3*(w/2+42)*(1+Math.sin(a*13)*.025),y=1002+Math.sin(a)*43*(1+Math.sin(a*7)*.08);i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();c.fill();text(sub,str,960,1020,{size:54,reveal:draw,seed:781,p:1});}
export function pageFrame(t,cam=camera(t),withSubs=true){[CAM.x,CAM.y,CAM.s]=cam;BOIL.step=Math.floor(t*12+1e-6);BOIL.amp=t>=44.4?.5:1;for(const C of[sky,m,s,child])clearGroup(C);for(const L of[ground.f,ground.l,wash,marks,sub,subpaper])clear(L);
 world(ground.f,ground.l,t);if(t>=4.3)waxStars(sky);
 text(ground.l,'The Moon',sx(110),sy(210),{font:'Gaegu',weight:700,size:140*CAM.s,align:'left',reveal:seg(t,2.6,3.3),seed:21,p:.95,stroke:2});text(ground.l,"Can't Sleep",sx(150),sy(345),{font:'Gaegu',weight:700,size:140*CAM.s,align:'left',reveal:seg(t,3.35,4.2),seed:29,p:.95,stroke:2});
 if(t>.9)moon(m,moonAct(t));
 for(let i=0;i<5;i++){let start=10+i*60/72,u=(t-start)/1.5;if(u>=0&&u<=1){const ph=Math.floor(u*18)/18;sheep(s,{x:lerp(1640,3260,ph),y:960-330*Math.sin(ph*Math.PI),r:(ph-.5)*.3,s:1.8,seed:900+i*17})}if(t>start+.6)text(ground.l,String(i+1),sx(1860+78*i),sy(390+i%2*18),{size:96*CAM.s,font:'Gaegu',weight:700,seed:40+i,reveal:seg(t,start+.6,start+.8),p:.9})}
 if(t>4.2){let q=childAct(t);if(q.toy){q.sheep=P=>{const at=P([q.toy])[0];sheep(child,{x:at[0],y:at[1],s:t>=26.25?.72:.78,flip:q.flip,eyesClosed:t>=44,seed:3350})}}girl(child,q);if(q.pose==='bed')sheep(child,{x:1618,y:1558,s:.5,seed:3350,r:-.1});part(child,[[1446,1560],[1520,1548],[1600,1556],[1676,1546],[1676,1590],[1446,1600]],{col:K.sky,p:.8,gap:8,w:10,seed:3990},{w:7,seed:3991})}
 for(let i=0;i<11;i++){let a=27.7+i*60/72,u=(t-a)/3.2;if(u<0||u>1||a>36)continue;let x=seat[0]+44+150*u+26*Math.sin(u*6+i),y=seat[1]-116-330*u;line(marks,[[x,y],[x,y-44],[x+18,y-34],[x+20,y-22]],{col:K.ink,w:6,p:1-seg(u,.6,1),seed:800+i});fill(marks,ellipse(x-8,y,10,7,18),{col:K.ink,p:.95*(1-seg(u,.6,1)),gap:3,w:5,seed:820+i})}
 if(t>44.7)for(let i=0;i<4;i++){let u=(t-44.7-i*1.1)/2.4;if(u>=0&&u<=1)text(marks,'z',sx(seat[0]+40+60*u),sy(seat[1]-70-140*u),{size:(40+30*u)*CAM.s,font:'Gaegu',weight:700,p:1-seg(u,.6,1),seed:850+i})}
 washPaint(wash,t);if(withSubs)captions(t);comp.paperCam(CAM.x*.6,CAM.y*.6,CAM.s/.6);comp.begin();comp.group(sky);comp.crayon(ground.f.c);comp.crayon(ground.l.c);const offset=[hash(BOIL.step)*300,hash(BOIL.step+7)*300];comp.group(m,{goff:offset});comp.group(s,{goff:offset});if(t>27.9)comp.wash(wash.c,{color:PAL.wash});comp.group(child,{goff:offset});comp.crayon(marks.c,{goff:offset});if(withSubs){comp.knock(subpaper.c);comp.crayon(sub.c)}comp.finish({vig:.3*(1-seg(t,45,46))});return paint;
}
window.DUR=52;window.render=t=>{if(t<45.8){g.setTransform(1,0,0,1,0,0);g.drawImage(pageFrame(t),0,0)}else{const page=pageFrame(45.9,[1600,900,.6],false);bookFrame(g,page,t);captions(t,false)}};
await Promise.all(['400 54px "Patrick Hand"','700 140px Gaegu','400 50px Gaegu'].map(f=>document.fonts.load(f)));window.READY=true;window.render(0);
