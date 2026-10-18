// Independent model construction for the reference-matched Aura pilot.
// Analytic profiles in millimetres; all electronic internals are opaque geometry.
import * as T from 'three';
import {mulberry} from '/core/lib.js';
const tau=Math.PI*2;
const metal=(color='#c7cbd1',roughness=.2,extra={})=>new T.MeshPhysicalMaterial({color,metalness:1,roughness,envMapIntensity:1.2,...extra});
const glass=(extra={})=>new T.MeshPhysicalMaterial({color:'#ffffff',roughness:.015,transmission:1,thickness:4,ior:1.52,dispersion:5,attenuationColor:new T.Color('#f3f8fb'),attenuationDistance:160,side:T.DoubleSide,envMapIntensity:1.25,...extra});
const frost=(extra={})=>glass({color:'#eef2f5',roughness:.4,transmission:.85,thickness:7,dispersion:1.5,...extra});
const lathe=(p,n=144)=>new T.LatheGeometry(p.map(a=>new T.Vector2(...a)),n);
const mesh=(g,m)=>new T.Mesh(g,m);
const torus=(r,t,m)=>{let a=mesh(new T.TorusGeometry(r,t,24,160),m);a.rotation.x=Math.PI/2;return a};
function curveTube(points,r,mat,closed=false){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points,closed),Math.max(120,points.length*3),r,8,closed),mat)}
function brushedTexture(){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d'),rng=mulberry(778);g.fillStyle='#808080';g.fillRect(0,0,512,512);for(let i=0;i<1300;i++){g.beginPath();g.strokeStyle=`rgba(${rng()<.5?'255,255,255':'0,0,0'},${.03+rng()*.09})`;g.lineWidth=.3+rng()*.8;g.arc(256,256,2+rng()*355,0,tau);g.stroke()}const tx=new T.CanvasTexture(c);return tx}
const brush=brushedTexture();
function boardTexture(){const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d'),rng=mulberry(431);g.fillStyle='#101418';g.fillRect(0,0,1024,1024);g.strokeStyle='#c19b52';g.lineCap='square';for(let i=0;i<95;i++){let x=512+(rng()-.5)*750,y=512+(rng()-.5)*750;g.lineWidth=2+rng()*4;g.beginPath();g.moveTo(x,y);for(let n=0;n<5;n++){let a=Math.floor(rng()*8)*Math.PI/4,d=35+rng()*150;x+=Math.cos(a)*d;y+=Math.sin(a)*d;g.lineTo(x,y)}g.stroke();g.fillStyle='#e0bb73';g.beginPath();g.arc(x,y,5+rng()*5,0,tau);g.fill()}g.lineWidth=5;g.beginPath();g.arc(512,512,470,0,tau);g.stroke();const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=8;return tx}
const boardMap=boardTexture();
// A continuous travelling light along tube UV; the reflected guide remains dark at rest.
export function lightGuide(closed){
 const m=new T.MeshPhysicalMaterial({color:'#12161b',metalness:0,roughness:.08,clearcoat:1,clearcoatRoughness:.05,emissive:'#fff',envMapIntensity:1.4});
 const U={clock:{value:0},energy:{value:0},idle:{value:0},stereo:{value:0},loop:{value:closed?1:0}};m.userData.U=U;
 m.onBeforeCompile=s=>{Object.assign(s.uniforms,U);s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 lightUV;').replace('#include <uv_vertex>','#include <uv_vertex>\nlightUV=uv;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 lightUV; uniform float clock,energy,idle,stereo,loop;').replace('#include <emissivemap_fragment>',`float along=lightUV.x;float ph=clock*.6+stereo;float d=fract(along-ph+.5)-.5;float d2=fract(along+ph+.25)-.5;float h=exp(-d*d/.00028);float tail=d<0.?exp(d/.12)*.55:0.;float h2=exp(-d2*d2/.00035);vec3 ice=vec3(.122,.714,1.);vec3 violet=vec3(.5,.25,1.);vec3 col=mix(ice,violet,.5+.5*sin(clock*2.+along*6.28));totalEmissiveRadiance=col*(idle+energy*(max(h,tail)+h2*.8))+vec3(pow(h,3.)*.3*energy);`)};m.customProgramCacheKey=()=>`aura-new-guide-${closed}`;return m;
}
export function earbud(side){
 const root=new T.Group(),layers=[];
 function layer(obj,y,spacing){let group=new T.Group();group.add(obj);group.position.y=y;root.add(group);layers.push({group,y,spacing});return group}
 // Smooth lens dome, closed with a thin optical lip at its equator.
 const lensPts=[];for(let i=0;i<=72;i++){let a=i/72*Math.PI/2;lensPts.push([10*Math.cos(a),5.2*Math.sin(a)])}lensPts.push([0,4.9]);
 layer(mesh(lathe(lensPts),glass({thickness:4.5})),0,40);
 const paths=new T.Group(),spiralMat=lightGuide(false);
 for(let k=0;k<6;k++){const pts=[];for(let i=0;i<=80;i++){const u=i/80,a=k*tau/6+side*u*2.2,r=1.6+5.6*u;pts.push(new T.Vector3(Math.cos(a)*r,.22*Math.sin(Math.PI*u),Math.sin(a)*r))}paths.add(curveTube(pts,.13,spiralMat))}
 const hub=mesh(new T.SphereGeometry(1.15,40,24),metal('#d9dce0',.08));hub.scale.y=.28;paths.add(hub);layer(paths,2.9,31);
 const ringMat=lightGuide(true);layer(torus(7.5,.8,ringMat),1.5,23);
 const driver=new T.Group(),profile=[];for(let i=0;i<=120;i++){const r=5.8*i/120;profile.push([r,.1*Math.sin((r/5.8)*54)+(r<1.5?.55*(1-r/1.5):0)])}driver.add(mesh(lathe(profile),metal('#c8c2b8',.22,{roughnessMap:brush,side:T.DoubleSide})));let basket=mesh(new T.CylinderGeometry(6.1,5.4,1.2,96,1,true),metal('#979da5',.3,{side:T.DoubleSide}));basket.position.y=-.6;driver.add(basket);layer(driver,.9,15);
 const band=torus(10,.42,metal('#d4d7db',.16));band.scale.z=.75;layer(band,0,7);
 layer(mesh(new T.CylinderGeometry(2.8,2.8,1.5,64),metal('#e3e7e9',.14)),-.7,0);
 const pcb=new T.Group(),board=mesh(new T.CylinderGeometry(6.9,6.9,.5,96),new T.MeshPhysicalMaterial({map:boardMap,color:'#fff',metalness:.35,roughness:.42,clearcoat:.6}));pcb.add(board);
 const rng=mulberry(811);for(let i=0;i<20;i++){let a=rng()*tau,r=1.3+Math.sqrt(rng())*4.5,big=i<4;const chip=mesh(new T.BoxGeometry(big?1.7:.5+rng()*.65,big?.45:.3,big?1.8:.5),big?new T.MeshStandardMaterial({color:'#07090b',roughness:.3}):metal('#c09a54',.3));chip.position.set(Math.cos(a)*r,.45,Math.sin(a)*r);chip.rotation.y=Math.round(rng()*4)*Math.PI/4;pcb.add(chip);if(big)for(let j=-1;j<=1;j++){let pin=mesh(new T.BoxGeometry(.28,.13,2.25),metal('#c1c5c9',.28));pin.position.copy(chip.position).add(new T.Vector3(j*.45,-.1,0));pcb.add(pin)}}layer(pcb,-2,-8);
 layer(mesh(new T.CylinderGeometry(4.2,4.2,2.2,96),metal('#b9bec4',.28,{roughnessMap:brush})),-3.4,-15);
 const rear=[];for(let i=0;i<=64;i++){let a=i/64*Math.PI/2;rear.push([10*Math.cos(a),-5.2*Math.sin(a)])}rear.push([2.8,-6.5],[2.8,-9.2],[2.5,-9.6],[0,-9.6]);
 const shell=mesh(lathe(rear),frost());layer(shell,0,-24);
 const tipCurve=new T.SplineCurve([[2.75,-7.2],[3.3,-8.2],[5.25,-10.2],[5.4,-11.2],[4.6,-12.5],[2.7,-12.8],[2.25,-12.0],[2.6,-9.2]].map(a=>new T.Vector2(...a))).getPoints(80);layer(mesh(new T.LatheGeometry(tipCurve,128),new T.MeshPhysicalMaterial({color:'#c9d0d6',roughness:.62,sheen:1,sheenRoughness:.45,sheenColor:'#fff',side:T.DoubleSide,envMapIntensity:1.8})),0,-34);
 const glow=new T.PointLight('#9be8ff',0,40,2);glow.position.y=1.5;root.add(glow);
 return {root,layers,ringMat,spiralMat,glow,side};
}
export function spread(bud,amount,phase){bud.layers.forEach((l,i)=>{l.group.position.y=l.y+l.spacing*amount;l.group.rotation.set(Math.sin(i*1.7+.4)*.32*amount,(Math.sin(i*.9)*.45+phase*l.spacing*.004)*amount,Math.cos(i*2.3+.9)*.28*amount)})}
export function pebbleCase(){
 const root=new T.Group(),r=33,z=27;
 const p=[[0,-15],[18,-15]];for(let i=0;i<=64;i++){let a=-.9+i/64*.9;p.push([r*Math.cos(a),15*Math.sin(a)])}const base=mesh(lathe(p,192),frost({thickness:14,transmission:.9,roughness:.42}));base.scale.z=z/r;root.add(base);
 const face=new T.Shape();face.absellipse(0,0,32.4,26.4,0,tau,false);for(const x of[-15.5,15.5]){const h=new T.Path();h.absarc(x,0,10.6,0,tau,true);face.holes.push(h)}let deck=mesh(new T.ShapeGeometry(face,96),new T.MeshPhysicalMaterial({color:'#16181b',metalness:.6,roughness:.38,clearcoat:.4,side:T.DoubleSide}));deck.rotation.x=-Math.PI/2;deck.position.y=-.05;root.add(deck);
 for(const x of[-15.5,15.5]){const rim=torus(10.7,.35,metal('#dce1e7',.12));rim.position.x=x;root.add(rim)}
 const lidPivot=new T.Group();lidPivot.position.z=-27;root.add(lidPivot);const lp=[];for(let i=0;i<=64;i++){let a=i/64*Math.PI/2;lp.push([r*Math.cos(a),17*Math.sin(a)])}const lid=mesh(lathe(lp,192),glass({thickness:1.6,dispersion:4}));lid.scale.z=z/r;lid.position.z=27;lidPivot.add(lid);const rim=torus(33,.45,metal('#d9dce0',.12));rim.scale.z=z/r;rim.position.set(0,.2,27);lidPivot.add(rim);
 const hinge=mesh(new T.CylinderGeometry(1.5,1.5,18,64),metal('#e4e7eb',.12));hinge.rotation.z=Math.PI/2;hinge.position.set(0,.4,-26.4);root.add(hinge);
 const glowMat=new T.MeshBasicMaterial({color:'#000'}),disc=mesh(new T.CircleGeometry(1,96),glowMat);disc.rotation.x=-Math.PI/2;disc.scale.set(20.4,16.7,1);disc.position.y=-12.8;root.add(disc);
 const edgeMat=lightGuide(true),path=[];for(let i=0;i<=160;i++){let a=i/160*tau;path.push(new T.Vector3(30.8*Math.cos(a),.1,24.8*Math.sin(a)))}root.add(curveTube(path,.22,edgeMat,true));
 const light=new T.PointLight('#e2f4ff',0,60,2);light.position.y=-7;root.add(light);
 return {root,lidPivot,hinge,cradles:[new T.Vector3(-15.5,1.2,0),new T.Vector3(15.5,1.2,0)],edgeMat,setCharge(a){disc.visible=a>.001;glowMat.color.set('#dff3ff').multiplyScalar(a*1.35);light.intensity=a*12}};
}
