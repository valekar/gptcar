import * as THREE from 'three';
import {pointVS,pointFS,groundVS,groundFS,photoVS,photoFS} from './shaders.js';
export const palette={bg:'#05080a',fog:'#0a1013',low:'#1f3f35',mid:'#5c9a7a',high:'#e2f3dc',ground:'#c8b38c',clay:'#bdb5a6',shade:'#26303a',scan:'#d4fff0',amber:'#ffb347'};
const linear=h=>new THREE.Vector3(...[1,3,5].map(i=>(parseInt(h.slice(i,i+2),16)/255)**2.2));
export async function survey(scene){
 const [facts,profile,pb,gb,cb,photo]=await Promise.all([fetch('data/facts.json').then(r=>r.json()),fetch('data/profile_C.json').then(r=>r.json()),...['points.bin','ground.bin','canopy.bin'].map(f=>fetch('assets/build/'+f).then(r=>r.arrayBuffer())),new THREE.TextureLoader().loadAsync('assets/build/naip.jpg')]);
 photo.colorSpace=THREE.SRGBColorSpace;photo.anisotropy=8;
 const shared={};for(const [k,v] of Object.entries({F1:-1000,F2:-10000,Cut:99,T:0,Px:2,Proj:1,W:0,Ghost:0,Photo:1,Ground:1,Sec:0}))shared['u'+k]={value:v};
 for(const n of ['Fog','Bg','Scan','Amber'])shared['u'+n]={value:linear(palette[n.toLowerCase()])};
 shared.uSecP={value:new THREE.Vector2(...facts.profile.centre)};shared.uSecD={value:new THREE.Vector2(...facts.profile.dir)};
 const count=new DataView(pb).getUint32(0,true),geom=new THREE.BufferGeometry();let off=4;
 geom.setAttribute('position',new THREE.BufferAttribute(new Uint16Array(pb,off,count*3),3));off+=count*6;
 for(const name of ['hag','cls','inten','rnd']){geom.setAttribute(name,new THREE.BufferAttribute(new Uint8Array(pb,off,count),1,['inten','rnd'].includes(name)));off+=count;}
 const q=facts.quant,pu={...shared,uOff:{value:new THREE.Vector3(q.OX,q.OY,q.OZ)},uSc:{value:new THREE.Vector3(q.SXY,q.SXY,q.SZ)}};
 for(const [n,c] of Object.entries({cLow:'low',cMid:'mid',cHigh:'high',cG:'ground'}))pu[n]={value:linear(palette[c])};
 const dots=new THREE.Points(geom,new THREE.ShaderMaterial({uniforms:pu,vertexShader:pointVS(false),fragmentShader:pointFS}));dots.frustumCulled=false;scene.add(dots);
 const ghosts=new THREE.Points(geom,new THREE.ShaderMaterial({uniforms:pu,vertexShader:pointVS(true),fragmentShader:pointFS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));ghosts.frustumCulled=false;ghosts.renderOrder=5;scene.add(ghosts);
 function decodeGrid(buf){const dv=new DataView(buf),nx=dv.getUint32(0,true),ny=dv.getUint32(4,true),header=Array.from(new Float32Array(buf,8,5)),n=nx*ny;return{nx,ny,header,n,z:new Uint16Array(buf.slice(28,28+n*2))};}
 const G=decodeGrid(gb),C=decodeGrid(cb);const [x0,y0,res,oz,sz]=G.header;
 function meshGrid(d){const a=new Float32Array(d.n*3),idx=new Uint32Array((d.nx-1)*(d.ny-1)*6),[x,y,r]=d.header;let k=0;for(let j=0;j<d.ny;j++)for(let i=0;i<d.nx;i++){const v=j*d.nx+i;a[3*v]=x+i*r;a[3*v+1]=oz+d.z[v]*sz;a[3*v+2]=-y-j*r;if(i<d.nx-1&&j<d.ny-1){idx.set([v,v+1,v+d.nx+1,v,v+d.nx+1,v+d.nx],k);k+=6;}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(a,3));g.setIndex(new THREE.BufferAttribute(idx,1));return g;}
 const groundGeometry=meshGrid(G);off=28+G.n*2;groundGeometry.setAttribute('nrm',new THREE.BufferAttribute(new Int8Array(gb,off,G.n*3),3,true));off+=G.n*3;groundGeometry.setAttribute('lt',new THREE.BufferAttribute(new Uint8Array(gb,off,G.n*4),4,true));
 const rad=Math.PI/180,sun=new THREE.Vector3(Math.sin(-45*rad)*Math.cos(26*rad),Math.sin(26*rad),-Math.cos(-45*rad)*Math.cos(26*rad)).normalize();
 const terrain=new THREE.Mesh(groundGeometry,new THREE.ShaderMaterial({uniforms:{...shared,uSun:{value:sun},cClay:{value:linear(palette.clay)},cShade:{value:linear(palette.shade)}},vertexShader:groundVS,fragmentShader:groundFS}));terrain.frustumCulled=false;scene.add(terrain);
 const aerial=new THREE.Mesh(meshGrid(C),new THREE.ShaderMaterial({uniforms:{...shared,tPhoto:{value:photo},uBox:{value:new THREE.Vector4(x0,y0,x0+(G.nx-1)*res,y0+(G.ny-1)*res)}},vertexShader:photoVS,fragmentShader:photoFS}));aerial.frustumCulled=false;scene.add(aerial);
 const height=(east,north)=>{let x=Math.max(0,Math.min(G.nx-1.001,(east-x0)/res)),y=Math.max(0,Math.min(G.ny-1.001,(north-y0)/res));const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,z=(i,j)=>oz+G.z[j*G.nx+i]*sz;return(z(i,j)*(1-fx)+z(i+1,j)*fx)*(1-fy)+(z(i,j+1)*(1-fx)+z(i+1,j+1)*fx)*fy;};
 return{facts,profile,shared,ghosts,aerial,height,count};
}
