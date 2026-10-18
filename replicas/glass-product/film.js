// Newly assembled reference-matched scene. No original main/product/story module imports.
import * as T from 'three';
import {makeStudio} from '/styles/glass-product/demo/studio.js';
import {makePost} from '/core/three/post.js';
import {clamp,seg,ss,eio,eo,ei,lerp,hash} from '/core/lib.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {earbud,pebbleCase,spread} from './objects.js';
const W=1920,H=1080, V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Y=V(0,1,0),film=document.querySelector('#film'),overlay=document.querySelector('#text'),g=overlay.getContext('2d');
const renderer=new T.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});renderer.setPixelRatio(2);renderer.setSize(W,H);renderer.domElement.style.zIndex=0;renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';overlay.style.zIndex=1;film.prepend(renderer.domElement);renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1.1;
const scene=new T.Scene(),camera=new T.PerspectiveCamera(28,W/H,1,3000),post=makePost(renderer,scene,camera,W,H,{ssaa:2,ao:false});post.bloom.threshold=1.1;post.bloom.radius=.4;post.vig.uniforms.amt.value=.3;post.vig.uniforms.contrast.value=.12;
const studio=makeStudio(renderer,scene),box=pebbleCase(),buds=[earbud(-1),earbud(1)];scene.add(box.root,...buds.map(b=>b.root));RectAreaLightUniformsLib.init();const key=new T.RectAreaLight('#fff',0,90,40);scene.add(key);
const shots=[[0,4,'dark'],[4,8,'open'],[8,10,'macroA'],[10,12,'macroB'],[12,17,'explode'],[17,18,'front'],[18,20,'channels'],[20,22,'pair'],[22,24,'caustics'],[24,28,'reveal'],[28,32,'end']];
const beatHits=[];for(let bar=8;bar<12;bar++)for(const off of[0,.75,1,1.5])beatHits.push({t:bar*2+off,big:bar===8&&off===0});beatHits.push({t:24,big:true});
function pose(b,p,axis,roll=0){b.root.position.copy(p);b.root.quaternion.setFromUnitVectors(Y,axis.clone().normalize());b.root.rotateY(roll)}
function travel(b,t,mode){let amp=0,flash=0;for(const hit of beatHits){let d=t-hit.t;if(d>=0&&d<1.6){amp+=(hit.big?12:8)*Math.exp(-d/.55);flash+=(hit.big?1.6:1)*Math.exp(-d/.12)}}const steady=mode===3?7:0;[b.ringMat,b.spiralMat].forEach((m,i)=>{m.userData.U.clock.value=t;m.userData.U.energy.value=mode>=2?(amp+steady)*(i===1?.15:1):0;m.userData.U.idle.value=mode===1?.008+.008*(1+Math.sin(t*2.4)):.01;m.userData.U.stereo.value=b.side===1?0:.5});b.glow.intensity=mode>=2?6+flash*12:0;return flash}

function at(t){
 const [a,z,id]=shots.find(s=>t>=s[0]&&t<s[1])||shots.at(-1),u=seg(t,a,z);let eye,target=V(),focus,aperture=260,fov=28,lid=0,visibleCase=true,vis=[true,true],modes=[0,0],charge=0,bg=0,sweep,caustic=[0,0],bloom=.16,spot=.02,keyI=0;
 const env={left:1,right:1,top:1,front:1,back:1,key:0};
 buds.forEach((b,i)=>{pose(b,box.cradles[i],Y,i===0?.4:-.3);spread(b,0,0)});
 function orbit(az,el,d,center=V()){return center.clone().add(V(Math.sin(az)*Math.cos(el)*d,Math.sin(el)*d,Math.cos(az)*Math.cos(el)*d))}
 function sweepAt(start,end,power=7,reverse=false,tilt=0){if(t>start&&t<end){let s=seg(t,start,end);sweep={x:lerp(reverse?1:-1,reverse?-1:1,s),I:power*Math.sin(s*Math.PI),tilt}}}
 if(id==='dark'){
  const rise=ss(seg(t,.9,3.5));Object.assign(env,{left:.07*rise,right:.07*rise,top:.03*rise,front:0,back:.12*rise});eye=V(-68,5,116).lerp(V(-60,3,104),eio(u));target=V(0,10,0);fov=30;focus=V(-10,0,20);aperture=150;modes=[1,1];spot=0;sweepAt(.5,1.7);sweepAt(2,3.2,7,true,.25);
 }else if(id==='open'){
  lid=1.72*eio(seg(t,4.5,7.6));charge=.15*ss(seg(t,6,7.6));bg=.25;eye=orbit(lerp(.45,.8,eio(u)),.42,200);target=V(-2,10,-8);fov=27;focus=V();modes=[1,1];
 }else if(id==='macroA'){
  lid=1.72;charge=.15;const rise=eio(seg(t,8,9.4)),p=box.cradles[1].clone().add(V(0,18*rise,0));pose(buds[1],p,V(-.25*rise,1,.35*rise),-.3+rise*.6);eye=p.clone().add(V(-30,22,34).lerp(V(-22,16,30),eio(u)));target=p.clone().add(V(-1,2,1));fov=30;focus=p.clone().add(V(-4,5,5)).lerp(p.clone().add(V(0,1,0)),ss(seg(t,8.9,9.6)));aperture=900;modes=[1,1];
 }else if(id==='macroB'){
  visibleCase=false;vis=[false,true];const p=V(0,18,0),az=lerp(-.3,.35,eio(u));pose(buds[1],p,V(.9,.35,.2),t*.35);eye=p.clone().add(V(Math.sin(az)*42,6,Math.cos(az)*42));target=p.clone().add(V(0,-1,0));fov=30;focus=p.clone().add(V(Math.sin(az)*8,0,Math.cos(az)*8));aperture=700;modes=[0,1];caustic[1]=.3;
 }else if(id==='explode'){
  visibleCase=false;vis=[false,true];Object.assign(env,{left:1.4,right:1.4,top:1.5,front:.6,back:1.6,key:1.3});bg=.9;const center=V(0,20,0),axis=V(-.33,.215,.92).normalize();let amount=t<15?eo(seg(t,12,15)):t<15.75?1+.03*seg(t,15,15.75):t<16?1.03*(1-ei(seg(t,15.75,16))):0;pose(buds[1],center,axis,.3);spread(buds[1],amount,(t-12)*1.4);let push=eo(seg(t,16,16.9)),az=lerp(.26,.44,eio(u)),d=lerp(94,86,eio(u))-40*push;eye=center.clone().add(V(Math.sin(az)*d,12-4*push,Math.cos(az)*d));target=center.clone().addScaledVector(axis,3*amount).add(V(0,-1,0));focus=center.clone().addScaledVector(axis,6*amount);fov=34;aperture=lerp(70,160,push);keyI=5;if(t>=16&&t<16.084){const fr=Math.floor(t*24),damp=Math.exp(-(t-16)/.08);eye.add(V(hash(fr)-.5,hash(fr+9)-.5,0).multiplyScalar(2.2*damp))}modes=[0,t>=16?2:0];caustic[1]=t>=16?.6:0;
 }else if(id==='front'){
  visibleCase=false;vis=[false,true];let p=V(0,18,0);pose(buds[1],p,V(.12,.5,1),.3+t*.1);eye=p.clone().add(V(10,14,62).lerp(V(6,12,54),eio(u)));target=p;focus=p.clone().add(V(0,2,5));aperture=300;modes=[0,2];caustic[1]=.6;
 }else if(id==='channels'){
  visibleCase=false;vis=[false,true];let p=V(0,18,0);pose(buds[1],p,V(0,1,.25),.3+t*.12);eye=p.clone().add(V(-6,30,16).lerp(V(-3,26,13),eio(u)));target=p.clone().add(V(0,3,0));focus=p.clone().add(V(0,5,1));fov=32;aperture=700;modes=[0,2];caustic[1]=.6;
 }else if(id==='pair'){
  visibleCase=false;let enter=eio(seg(t,20,21.2));pose(buds[1],V(16,20,0),V(.2,.6,1),.3+t*.1);pose(buds[0],V(lerp(-75,-16,enter),20,lerp(-20,0,enter)),V(-.2,.6,1),.4-t*.1);eye=V(-18,30,120).lerp(V(-8,26,108),eio(u));target=V(0,12,0);focus=V(0,18,0);aperture=200;modes=[enter>.5?2:0,2];caustic=[.6*enter,.6];
 }else if(id==='caustics'){
  visibleCase=false;pose(buds[0],V(-16,20,0),V(-.2,1,.3),.4-t*.1);pose(buds[1],V(16,20,0),V(.2,1,.3),.3+t*.1);let az=lerp(-.25,.1,eio(u));eye=V(Math.sin(az)*70,150,Math.cos(az)*70);target=V(0,-8,0);focus=V(0,10,0);fov=34;aperture=160;modes=[2,2];caustic=[.7,.7];spot=.05;
 }else{
  lid=1.72;const down=eio(seg(t,27,27.8)),w=seg(t,24,32),late=eio(seg(t,27.6,29.6));eye=orbit(lerp(-.26,-.06,eio(w)),lerp(.2,.28,eio(w)),lerp(228,244,w)+26*late);target=V(0,lerp(31,26,late),-6);focus=V(0,10,0);fov=27;aperture=160;
  buds.forEach((b,i)=>{let p=box.cradles[i].clone().add(V(0,17*(1-down),0));let normal=Y.clone().multiplyScalar(.7).addScaledVector(eye.clone().sub(p).normalize(),.75).add(V(i?.12:-.12,0,0)).normalize().lerp(Y,down);pose(b,p,normal,i?-.3:.4)});charge=.35+.65*ss(seg(t,27.8,28.4));bg=1.1;Object.assign(env,{left:1.3,right:1.3,back:2.6,front:0,top:1.5});modes=[3,3];spot=.04;bloom=.3;sweepAt(24,25.3,6);if(id==='end'){Object.assign(env,{left:.6,right:.6,top:.5,front:0,back:1.2});charge=1;bg=1.1-.4*seg(t,28,32)}
 }
 if(id==='macroA'||id==='macroB'){for(const st of[8,9,10,11])sweepAt(st,st+.45,5,false,-.35)}
 box.root.visible=visibleCase;box.lidPivot.visible=box.hinge.visible=id!=='macroA';box.lidPivot.rotation.x=-lid;box.setCharge(charge);box.edgeMat.userData.U.clock.value=t;box.edgeMat.userData.U.energy.value=0;box.edgeMat.userData.U.idle.value=.025;
 let flash=0;buds.forEach((b,i)=>{b.root.visible=vis[i];flash+=travel(b,t,modes[i])});
 scene.backgroundIntensity=bg;studio.U.uBgI.value=bg;key.intensity=keyI;key.position.set(0,80,30);key.lookAt(0,20,0);
 camera.position.copy(eye);camera.fov=fov;camera.updateProjectionMatrix();camera.lookAt(target);if(sweep)sweep.az=Math.atan2(eye.x,eye.z)+Math.PI;studio.updateEnv({...env,sweep:sweep||{I:0},aura:{I:visibleCase?0:flash*.9,col:new T.Color('#62dcff')}});
 post.dof.focus=eye.distanceTo(focus||target);post.dof.aper=aperture;post.dof.maxCoc=14;post.bloom.strength=bloom+flash*.05;
 const U=studio.U;U.uTime.value=t*.6;U.uSpot.value=spot;buds.forEach((b,i)=>{let p=b.root.position;U.uC.value[i].set(p.x,p.z,10+(p.y+15)*.3,!visibleCase&&vis[i]?(caustic[i]*(.35+flash*.5)+(sweep?sweep.I/7*.6:0)):0)});U.uC.value[2].set(0,0,0,0);U.uWave.value.forEach(w=>w.set(0,0,0,0));let n=0;if(!visibleCase)for(const k of beatHits){let d=t-k.t;if(d<0||d>2.2)continue;buds.forEach((b,i)=>{if(modes[i]!==2||n>=12)return;U.uWave.value[n++].set(b.root.position.x,b.root.position.z,8+55*d,(k.big?.7:.38)*Math.exp(-d/.6))})}
 scene.updateMatrixWorld();camera.updateMatrixWorld();studio.reflect(camera);post.composer.render();paint(t);
}
function tracked(text,x,y,size,weight,tracking,color='#e7edf4',alpha=1){g.save();g.globalAlpha=alpha;g.font=`${weight} ${size}px AuraInter`;g.letterSpacing=tracking+'px';g.textAlign='center';g.textBaseline='middle';g.fillStyle=color;g.fillText(text,x+tracking*.5,y);g.restore()}
function pill(text,t,start,duration){const alpha=ss(seg(t,start-.05,start+.15))*(1-ss(seg(t,start+duration-.2,start+duration)));if(alpha<=0)return;g.save();g.globalAlpha=alpha;g.font='300 40px AuraInter';g.letterSpacing='1px';let w=g.measureText(text).width+96,x=(W-w)/2,y=H-128;g.beginPath();g.roundRect(x,y,w,76,38);g.save();g.clip();g.filter='blur(18px) brightness(1.25)';g.drawImage(renderer.domElement,0,0,W,H);g.filter='none';g.fillStyle='rgba(210,225,240,.1)';g.fillRect(x,y,w,76);g.restore();let gr=g.createLinearGradient(x,y,x+w,y+76);gr.addColorStop(0,'#ffffff88');gr.addColorStop(.5,'#ffffff22');gr.addColorStop(1,'#ffffff66');g.strokeStyle=gr;g.lineWidth=1.2;g.stroke();g.beginPath();g.moveTo(x+40,y+1);g.lineTo(x+w-40,y+1);g.strokeStyle='#75d9ff66';g.stroke();g.font='300 40px AuraInter';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#f5f8fc';g.fillText(text,W/2,y+39);g.restore()}
function paint(t){g.clearRect(0,0,W,H);if(t>=1&&t<3.9){let a=ss(seg(t,1,1.6))*(1-ss(seg(t,3.4,3.9)));tracked('AURA',960,250,132,200,64,'#ecf2f8',a);tracked('A GLASS PRODUCT FILM',960,345,18,400,9,'#cfd8e0',a*.7)}if(t>=8.5&&t<10.5)pill('Nothing to hide.',t,8.55,1.944);if(t>=12.4&&t<15)pill('Every part, in plain sight.',t,12.45,2.516);if(t>=24.5){tracked('MEET',960,78,20,500,10,'#cfd8e0',ss(seg(t,24.5,24.9))*(1-ss(seg(t,26.2,26.8)))*.85);tracked('AURA',960,150,112,200,56,'#ecf2f8',ss(seg(t,24.5,25.3)));tracked('Hear the light.',960,238,38,300,2,'#e6edf3',ss(seg(t,25.8,26.4)))}if(t>=28){let a=ss(seg(t,28.3,29));g.save();g.globalAlpha=a;const gr=g.createLinearGradient(0,820,0,1080);gr.addColorStop(0,'#0000');gr.addColorStop(1,'#000a');g.fillStyle=gr;g.fillRect(0,820,1920,260);g.fillStyle='#ffffff33';g.fillRect(900,962,120,1);tracked('GLASS PRODUCT RENDER',960,994,19,500,8,'#c3ccd5');tracked('GPT-6.1 Sol · reference recreation',960,1030,21,300,2,'#8f9aa6');g.restore()}let black=Math.max(1-ss(seg(t,.1,.5)),ss(seg(t,31.4,32)));if(black>0){g.fillStyle=`rgba(0,0,0,${black})`;g.fillRect(0,0,W,H)}}
await Promise.all([document.fonts.load('200 132px AuraInter'),document.fonts.load('300 40px AuraInter'),document.fonts.load('500 20px AuraInter')]);
window.render=t=>at(clamp(t,0,32));window.DUR=32;window.READY=true;
