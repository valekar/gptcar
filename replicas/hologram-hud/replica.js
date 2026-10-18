// Independent scene assembly/choreography. Credited MIT model and generic renderers.
import {Holo,loadModel,makeCamera,drawPad,drawScanPlane} from '../../styles/hologram-hud/demo/engine/holo.js';
import * as U from '../../styles/hologram-hud/demo/engine/hud.js';
const W=1920,H=1080,g=document.querySelector('#c').getContext('2d'),T=U.theme(188,38),M=await loadModel('volt.json'),D=await(await fetch('content.json')).json(),V=(await(await fetch('narration.json')).json()).lines;
await Promise.all(['300 176px Rajdhani','500 38px Rajdhani','600 30px Rajdhani','400 20px ShareTechMono'].map(f=>document.fonts.load(f)));
const holo=new Holo(W,H),subHolo=new Holo(540,540),temp=Object.assign(document.createElement('canvas'),{width:W,height:H}),tg=temp.getContext('2d'),loupe=Object.assign(document.createElement('canvas'),{width:540,height:540}),lg=loupe.getContext('2d');
const clamp=U.clamp,seg=(t,a,b)=>clamp((t-a)/(b-a)),mix=(a,b,u)=>a+(b-a)*u,eo=x=>1-(1-clamp(x))**3,ss=x=>{x=clamp(x);return x*x*(3-2*x)},eio=x=>{x=clamp(x);return x<.5?4*x*x*x:1-4*(1-x)**3},rad=d=>d*Math.PI/180,part=i=>D.callouts[i].part;
const base=(o={})=>({target:[0,.54,0],yaw:rad(24),pitch:rad(10),dist:2.85,fov:.6,cx:1240,cy:610,...o});
function lerpCam(a,b,u){return Object.fromEntries(Object.keys(a).map(k=>[k,Array.isArray(a[k])?a[k].map((v,i)=>mix(v,b[k][i],u)):mix(a[k],b[k],u)]));}
function compositionCamera(t){
 if(t<2.6)return base({yaw:mix(rad(57),rad(24),ss(seg(t,0,2.6))),pitch:mix(rad(14),rad(10),ss(seg(t,0,2.6)))});
 if(t<8)return base({yaw:rad(24)+Math.sin((t-2.6)*.24)*.025});
 const bat=base({target:M.byId.battery.anchor,yaw:rad(25),pitch:rad(11),dist:1.6,cx:760,cy:590});
 const motor=(u)=>base({target:M.byId.motor.center,yaw:mix(rad(-11),rad(46),u),pitch:rad(8),dist:1.6,cx:900,cy:565});
 const wide=base({target:[0,.51,0],yaw:rad(30),pitch:rad(11),dist:3.6,cx:940,cy:600});
 if(t<13.55)return lerpCam(base(),{...bat,yaw:rad(25)+seg(t,9.5,13.55)*.035},eo(seg(t,8,9.5)));
 if(t<14.05)return lerpCam(bat,motor(0),eio(seg(t,13.55,14.05)));
 if(t<17.55)return motor(seg(t,14,18));
 if(t<18.05)return lerpCam(motor(1),wide,eio(seg(t,17.55,18.05)));
 if(t<22)return{...wide,cx:mix(W*.49,W*.475,seg(t,18,22))};
 if(t<24)return lerpCam(wide,base({yaw:rad(26),pitch:0,dist:3.05,cx:1090,cy:600}),ss(seg(t,22,24)));
 if(t<28)return base({target:[0,.54,0],yaw:rad(26),pitch:mix(0,rad(13),ss(seg(t,24,28))),dist:mix(3.05,2.85,ss(seg(t,24,28))),cx:1090,cy:600});
 if(t<29)return lerpCam(base({yaw:rad(26),pitch:rad(13),dist:2.85,cx:1090,cy:600}),base({yaw:rad(24),pitch:rad(13),dist:3.5,cx:1020,cy:600}),eo(seg(t,28,29)));
 if(t<34)return base({yaw:rad(24)+.02*seg(t,29,34),pitch:rad(13),dist:mix(3.5,3.4,seg(t,29,34)),cx:1020,cy:600});
 if(t<35.25)return base({yaw:rad(25),pitch:rad(13),dist:3.4,cx:1020,cy:600});
 return base({target:[0,.35,0],yaw:rad(25),pitch:rad(13),dist:3.5,cx:960,cy:625});
}
// Camera orientation/distance independently measured from visible original HUD telemetry.
const telemetry=[[0, 57, 14, 2.7], [0.5, 50.9, 12.4, 2.73], [1.5, 40.7, 10.3, 2.77], [2.5, 33.5, 8.8, 2.81], [3.5, 28.7, 7.8, 2.83], [4.5, 25.9, 7.3, 2.84], [5.5, 24.5, 7, 2.85], [6.5, 24.1, 6.9, 2.85], [7.5, 24.1, 6.9, 2.85], [8, 24.1, 6.9, 2.85], [8.5, 26.2, 7.6, 2.62], [9.5, 39.6, 11.5, 1.59], [10.5, 40.7, 11.5, 1.57], [11.5, 41.8, 11.5, 1.55], [12.5, 43, 11.5, 1.53], [13.5, 44.1, 11.5, 1.51], [13.55, 44, 11.5, 1.5], [13.65, 42.8, 11.3, 1.48], [13.75, 30.8, 10.5, 1.43], [13.85, 0, 8.5, 1.37], [13.95, -10.5, 8.1, 1.35], [14, -11.3, 8, 1.35], [14.05, -11.4, 8, 1.35], [14.5, -9.3, 8, 1.35], [15.5, 6.2, 8, 1.35], [16.5, 28.2, 8, 1.35], [17.5, 43.7, 8, 1.35], [17.55, 45, 8, 1.35], [17.65, 44.3, 7.9, 1.46], [17.75, 38.1, 7.5, 1.98], [17.85, 27, 6.7, 2.9], [17.95, 17.8, 5.8, 3.48], [18, 17.3, 5.7, 3.49], [18.05, 17.2, 5.7, 3.5], [18.5, 17.2, 5.7, 3.5], [19.5, 17.2, 5.7, 3.5], [20.5, 17.2, 5.7, 3.5], [21.5, 17.2, 5.7, 3.5], [22, 17.2, 5.7, 3.5], [22.5, 20.5, 4.7, 3.41], [23.5, 35.5, 0, 3.05], [24, 35.5, 0, 3.05], [24.5, 35.5, 0.5, 3.04], [25.5, 35.5, 3.8, 2.97], [26.5, 35.5, 8.7, 2.88], [27.5, 35.5, 12.1, 2.81], [28, 35.5, 13.2, 2.8], [28.5, 35.5, 12.2, 2.89], [29, 35.5, 9.7, 3.5], [29.5, 35.5, 9.7, 3.48], [30.5, 35.5, 9.7, 3.46], [31.5, 35.5, 9.7, 3.44], [32.5, 35.5, 9.7, 3.42], [33.5, 35.5, 9.7, 3.41], [39, 35.5, 9.7, 3.4]];
function camera(t){let c=compositionCamera(t),i=telemetry.findIndex(k=>k[0]>t);if(i<0)i=telemetry.length-1;i=Math.max(1,i);let a=telemetry[i-1],b=telemetry[i],u=seg(t,a[0],b[0]);let sh=framing(t);return {...c,cx:c.cx+sh[0],cy:c.cy+sh[1],yaw:rad(mix(a[1],b[1],u)),pitch:rad(mix(a[2],b[2],u)),dist:mix(a[3],b[3],u)};}
// Translation derived from common-time reference CAD landmarks, in production pixels.
const framingKeys=[[0,-155,-40],[.5,-165,-45],[1.5,-140,-68],[2.5,-118,-82],[3.5,-105,-87],[5.5,-95,-94],[7.5,-95,-94],[8,-95,-94],[8.5,205,-60],[9.5,-50,-50],[13.55,-50,-50],[14.05,15,-25],[17.55,15,-25],[18.05,-10,-88],[22,-10,-88],[22.5,-15,-86],[23.5,85,-80],[24,85,-80],[28,85,-80],[28.5,70,-85],[29,-40,-103],[34,-40,-103],[35.25,-40,-103],[35.26,0,-50],[39,0,-50]];
function framing(t){let i=framingKeys.findIndex(k=>k[0]>t);if(i<0)i=framingKeys.length-1;i=Math.max(1,i);let a=framingKeys[i-1],b=framingKeys[i],u=seg(t,a[0],b[0]);return[mix(a[1],b[1],u),mix(a[2],b[2],u)];}
function opts(t){let o={hue:188,glow:1,lineWidth:1.35,gain:1,scanOffset:Math.floor(t*24),explode:{},angle:{}};
 if(t<2.6)o.scan={y:mix(.16,M.ymax+.1,seg(t,0,2.6)**.8),band:.07};
 const i=t>=8&&t<14?0:t>=14&&t<18?1:t>=18&&t<22?2:-1;
 if(i>=0){if(i!==2){o.focus=part(i);o.dim=.12;}let a=[9,14.5,18.5][i],b=[10,15.25,19.25][i],c=[13.45,17.45,21.45][i];o.explode[part(i)]=eo(seg(t,a,b))*(1-eo(seg(t,c,c+.5)));if(i===1){o.angle['motor-rotor']=(t-14.5)*.8;o.angle['motor-stator']=-(t-14.5)*.35;}}
 if(t>=22&&t<24)o.gain=1-.68*seg(t,22.5,23.5);
 if(t>=24){o.solid=.7;o.lineWidth=1.35*(1.12+.38*(1-seg(t,24,24.5)));o.glow=1.4;o.spin=t<28?eio(seg(t,24,28))*Math.PI*2:Math.PI*2;o.wave={y:mix(-.05,M.ymax+.1,seg(t,t<26?24:26,t<26?25.3:27.1)),w:.07};}
 if(t>=34)o.scanDown={y:mix(M.ymax+.15,-.2,eio(seg(t,34,35.25)))};return o;
}
function text(c,s,x,y,size=22,color=T.line(.8),weight=500,track=0,align='left',mono=false){c.save();c.font=`${weight} ${size}px ${mono?'ShareTechMono':'Rajdhani'}`;c.letterSpacing=track+'px';c.textBaseline='alphabetic';c.textAlign=align;c.fillStyle=color;c.fillText(s,x,y);c.restore();}
function title(t,alpha=1){let k=t>=28?seg(t,28.25,28.9):seg(t,2,2.5),frame=Math.floor(t*24);g.save();g.globalAlpha=alpha;text(g,U.rollText('VOLT',k,frame),110,260,176,T.hi(.95),300,26);g.strokeStyle=T.line(.5*seg(t,3,3.4));g.beginPath();g.moveTo(110,289);g.lineTo(470,289);g.stroke();text(g,U.rollText('CE-01 · CITY E-BIKE',seg(t,3,3.5),frame),110,317,22,T.line(.75),400,2,'left',true);text(g,U.rollText('Stripped to what matters.',seg(t,3.5,4),frame),110,364,32,T.hi(.8),500);g.restore();}
function chips(t,a=1){for(let i=0;i<3;i++){let start=[13.75,17.75,21.75][i],u=eo(seg(t,start,start+.4));if(u>0)U.chip(g,T,mix(140,110,u),470+i*112,D.callouts[i],u*a,{index:String(i+1).padStart(2,'0'),w:360});}}
function activeCard(t,info){let i=t>=8&&t<14?0:t>=14&&t<18?1:t>=18&&t<22?2:-1;if(i<0)return;
 let a=[8,14,18][i],leader=[9.75,14.75,18.75][i],roll=[10,15.5,19.5][i],confirm=[11,16,20][i],dock=[13.75,17.75,21.75][i],y=[330,330,640][i],x=i===2?1320:1250;
 let bb=info.bbox[part(i)],p=info.anchor[part(i)];if(i!==2)U.targetBox(g,T,bb,seg(t,a,a+.22),{flash:t<a+.125,tag:`TGT 0${i+1} · LOCK`,alpha:1-eo(seg(t,i===0?13.55:17.55,i===0?13.65:17.65))});
 let fade=1-seg(t,dock,dock+.35),to=[x,y];if(p&&i!==2)U.leader(g,T,p,[x-135,y],to,seg(t,leader,leader+.5),{alpha:fade});
 if(i===2)brakeLoupe(t,info);
 U.specCard(g,T,x,y,D.callouts[i],{reveal:seg(t,leader+.5,leader+.85),roll:seg(t,roll,confirm),detail:seg(t,roll+.05,roll+.35),frame:Math.floor(t*24),flash:t>=confirm&&t<confirm+1/24},{index:String(i+1).padStart(2,'0'),w:i===2?430:460,big:i===2?116:132,alpha:fade});
}
function brakeLoupe(t,info){let a=eo(seg(t,18.05,18.3))*(1-ss(seg(t,21.6,22))),x=1530,y=360,r=225*a;if(r<=0)return;
 const c={target:M.byId.brakes.center,yaw:mix(rad(49),rad(29),ss(seg(t,18,22))),pitch:rad(10),dist:.39,fov:.6,cx:240,cy:235};lg.clearRect(0,0,540,540);lg.fillStyle=T.bg0;lg.fillRect(0,0,540,540);let inf=subHolo.draw(lg,M,c,{...opts(t),only:['brakes'],focus:'brakes',glow:1.15});
 U.targetBox(lg,T,inf.bbox.brakes,seg(t,18.25,18.47),{tag:'TGT 03 · LOCK',pad:12,flash:t>=18.25&&t<18.375});g.save();g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.clip();g.drawImage(loupe,x-270,y-270);g.restore();g.save();g.strokeStyle=T.line(.85*a);g.lineWidth=2;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.stroke();g.restore();text(g,'ZOOM ×4.3',x-r,y-r-20,20,T.line(.9*a),400,0,'left',true);let p=info.anchor.brakes;if(p)U.leader(g,T,p,[x-r-10,y+70],[x-r,y+60],a,{alpha:a*.6});}
function footer(t,a=1){if(t<=29.5)return;let x=1515,y=560,w=350;U.plate(g,T,x-22,y-20,w+44,350,seg(t,29.5,30)*a);text(g,'WEIGHT',x,y+25,22,T.line(.7*a),600,3);g.save();g.font='300 90px Rajdhani';g.fillStyle=t>=30?T.acc(a):T.line(a);let k=seg(t,29.5,30),val=U.rollText('17.4',k,Math.floor(t*24));let vw=U.monoText(g,val,x,y+105,46);text(g,'kg',x+vw+10,y+105,30,T.acc(a));g.restore();g.strokeStyle=T.line(.3*a);g.beginPath();g.moveTo(x,y+140);g.lineTo(x+w,y+140);g.stroke();text(g,'FROM',x,y+170,22,T.line(.7*a),600,3);g.save();g.font='300 90px Rajdhani';g.fillStyle=t>=30.5?T.acc(a):T.line(a);let pw=U.monoText(g,U.rollText('1,990',seg(t,30,30.5),Math.floor(t*24)),x,y+250,46);text(g,'EUR',x+pw+8,y+250,27,T.acc(a));g.restore();if(t>=31){g.strokeStyle=T.acc(.6*a);g.strokeRect(x,y+275,w,35);text(g,'RESERVE NOW · SHIPS SPRING 2027',x+w/2,y+299,17,T.acc(a),600,2,'center');}}
function end(t){let k=seg(t,35,35.75),f=Math.floor(t*24);text(g,U.rollText('Volt · Spec Scan',k,f),960,420,92,T.hi(.95),300,7,'center');text(g,U.rollText('SCI-FI HOLOGRAM HUD',seg(t,35.4,36),f),960,490,26,T.line(.8),600,5,'center');g.strokeStyle=T.line(.3*seg(t,35.8,36.2));g.beginPath();g.moveTo(770,530);g.lineTo(1150,530);g.stroke();text(g,U.rollText('GPTcar',seg(t,35.8,36.3),f),960,595,32,T.hi(.9),500,0,'center');text(g,U.rollText('GPT-6.1 Sol · reference by LemoLab',seg(t,36.2,36.7),f),960,645,21,T.line(.8),400,1,'center');['Fresh Kokoro voice · synthesized score and material effects','Fonts: Rajdhani · Share Tech Mono (SIL OFL1.1)','Shared MIT CAD model/engine; independent scene assembly'].forEach((s,i)=>text(g,U.rollText(s,seg(t,36.5+i*.1,37.2+i*.1),f),960,735+i*34,20,T.line(.55),400,0,'center'));}
function render(t){g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';let c=camera(t),o=opts(t);U.background(g,W,H,T,{px:Math.sin(c.yaw)*40,py:c.pitch*50,cx:c.cx,cy:600});drawPad(g,c,W,H,{hue:188,rot:t*.12+(o.spin||0),alpha:t>=35.25?.6:1});
 let info=null;if(t<35.25){let blur=t>=13.55&&t<14.05||t>=17.55&&t<18.05;if(blur){for(let i=0;i<5;i++){let ts=t+(i-2)/4/48;tg.clearRect(0,0,W,H);let inf=holo.draw(tg,M,camera(ts),opts(ts));g.save();g.globalAlpha=.2;g.drawImage(temp,0,0);g.restore();if(i===2)info=inf;}}else info=holo.draw(g,M,c,o);if(t<2.4)drawScanPlane(g,c,W,H,o.scan.y,{hue:188,r:1.05,alpha:1});if(t>=34)drawScanPlane(g,c,W,H,o.scanDown.y,{hue:188,r:1.05,alpha:1-seg(t,35.05,35.25)});if(t>=24&&t<34)U.beam(g,T,makeCamera(c,W,H).project,.8,t,{y1:M.ymax});}
 let a=1-seg(t,34,34.5);if(t<8&&t>=2||t>=28&&t<35)title(t,a);if(t<35)chips(t,a*(t<24?1-.65*seg(t,22.5,23.5):1));if(info&&t<22)activeCard(t,info);if(t>=28&&t<35){for(let i=0;i<3;i++)U.marker(g,T,info?.anchor[part(i)],String(i+1).padStart(2,'0'),seg(t,28.5+i*.25,28.7+i*.25)*a,0,M.byId[part(i)].tagDir||1);footer(t,a);}if(t>=35)end(t);
 if(t>=6&&t<7.5){let i=Math.min(2,Math.floor((t-6)/.5));U.targetBox(g,T,info?.bbox[part(i)],seg(t,6+i*.5,6.35+i*.5),{alpha:.25,pad:8});}
 let status=t<2.6?`SCANNING ${String(Math.floor(seg(t,0,2.6)*100)).padStart(3,'0')}%`:t<8?'SCAN COMPLETE · 3 SYSTEMS':t<14?'TARGET 1/3 · BATTERY':t<18?'TARGET 2/3 · MOTOR':t<22?'TARGET 3/3 · BRAKES':t<24?'RECOMPILING':t<28?'HOLO SOLID · 360°':'SPEC SHEET · READY';if(t<35)U.chrome(g,W,H,T,{tl:'VOLT CE-01 // SPEC SCAN',tr:status,bl:`HOLO_00${Math.floor(t*3)%10} · Y:${M.ymax.toFixed(2)} M`,br:`${(c.yaw*180/Math.PI).toFixed(1)}° · ${(c.pitch*180/Math.PI).toFixed(1)}° · ${c.dist.toFixed(2)} M`,alpha:a,px:c.yaw*25});
 let l=V.find(v=>t>=v.start-.1&&t<Math.min(v.start+v.duration+.3,V[V.indexOf(v)+1]?.start-.12||99));if(l)U.subtitle(g,W,H,T,l.text,Math.min(seg(t,l.start-.1,l.start+.1),1-seg(t,l.start+l.duration+.1,l.start+l.duration+.3)),{t,y:962});if(t>=24&&t<24.125)U.glitch(g,W,H,1-seg(t,24,24.125),Math.floor(t*24));U.vignette(g,W,H,.5);
}
window.DUR=39;window.render=render;window.READY=true;render(0);
