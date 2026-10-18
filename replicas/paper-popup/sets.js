import * as T from 'three';
import * as A from './art.js';
import {cutMesh,thread} from '/styles/paper-popup/demo/cutmesh.js';
import {texOf} from '/styles/paper-popup/demo/book.js';
import {seg,ss,back,mulberry,lerp,spring} from '/core/lib.js';
export const turns=[[48.6,51.4],[71.6,74.4],[86.8,89.6]],rise=[11.3,50.5,73.5,88.7];
export function theatre(book){const sets=[0,1,2,3].map(()=>new T.Group()),cards=[],waves=[],river=[],stars=[],slats=[],tx=[0,1,2,3].map(i=>({ground:texOf(A.page(i,true)),sky:texOf(A.page(i))}));sets.forEach(g=>book.stage.add(g));
 function card(s,it,x,z,delay=0,ry=0){const pivot=new T.Group(),m=cutMesh(it);pivot.position.set(x,0,z);pivot.rotation.y=ry;pivot.add(m);sets[s].add(pivot);cards.push({pivot,m,s,delay});return{pivot,m}}
 const clouds=[];for(const[x,y,w]of[[-.12,.205,.06],[.13,.225,.05],[-.01,.25,.04]]){let q=cutMesh(A.cloud(w));q.add(thread(.2));q.position.set(x,y,.03);book.sky.add(q);clouds.push({q,y})}
 const sun=card(0,A.sun(),.06,.008,2.6),house=card(0,A.mushroom(.078,true),-.13,.085,.8);const doorPivot=new T.Group(),door=cutMesh({...A.door(),ax:0});doorPivot.position.set(-.007,0,.0006);doorPivot.add(door);house.pivot.add(doorPivot);
 card(0,A.fence(.06,.016),-.055,.1,1.2);card(0,A.sign(.036,'Papervale'),-.005,.118,1.4);
 for(const[w,h,x,z,seed,col]of [[.24,.075,-.12,.014,8,'#b5e39a'],[.26,.085,.09,.016,9,'#a9dd8c'],[.20,.05,-.15,.045,4,'#8fd06e'],[.22,.045,.13,.048,5,'#8fd06e']])card(0,A.hill(w,h,seed,col),x,z,.4+z*6);
 for(const[x,z,h,p]of [[-.205,.07,.07,true],[-.03,.058,.065,false],[.175,.06,.05,false],[.21,.085,.065,true]])card(0,A.tree(h,p,8),x,z,1+z*5);
 for(let i=0;i<3;i++){let q=card(0,A.wave(.19,.014+i*.002,19+i),.13,.1+i*.02,1.2);river.push(q)}
 const R=mulberry(160);for(let i=0;i<9;i++){const x=-.2+i*.05+(R()-.5)*.02,z=.2+R()*.05,h=.016+R()*.008;card(0,A.flower(h,['#f8d552','#e8829c','#e3c1ed'][i%3],i),x,z,.03+i*.01)}for(const[x,z]of [[-.19,.22],[.20,.18],[-.2,.08]])card(0,A.bush(.06,.036,5),x,z,.1);
 for(let row=0;row<3;row++)for(let i=0;i<9;i++){let x=-.225+i*.056+(row%2)*.013,z=.02+row*.02;card(1,A.tree(.105+R()*.06,true,i+row*9),x,z,.25+i*.025+row*.12)}for(let i=0;i<5;i++)card(1,A.tree(.105,false,i),-.19+i*.092,.085,.8+i*.05);
 card(1,A.log(.08),.005,.102,1.1);for(let i=0;i<10;i++){card(1,A.bush(.029,.021,i,true),i%2?-.15-R()*.05:.14+R()*.06,.18+R()*.05,.7+i*.035);if(i<6)card(1,A.woodlandMushroom(.016+R()*.012),-.2+R()*.4,.085+R()*.035,.9+i*.04)}
 card(2,A.island(),.15,.016,.3);card(2,{...A.island(),w:.045,h:.025},-.17,.014,.3);
 for(let i=0;i<5;i++){const q=card(2,A.wave(.5,[.03,.026,.022,.016,.012][i],30+i),0,[.03,.075,.115,.175,.235][i],.25+i*.08);waves.push(q)}
 for(let i=0;i<4;i++){let g=new T.Group(),front=new T.Mesh(new T.PlaneGeometry(.109,.296),new T.MeshStandardMaterial({map:tx[2].sky,roughness:.92,side:T.FrontSide}));front.geometry.translate(0,.148,0);front.geometry.attributes.uv.array.forEach(()=>{});const uv=front.geometry.attributes.uv;for(let k=0;k<uv.count;k++)uv.setX(k,(uv.getX(k)+i)/4);let c=A.page(2),ctx=c.getContext('2d');ctx.fillStyle='#16224f';ctx.fillRect(0,0,2048,1400);const nr=mulberry(13);ctx.fillStyle='#f8e8c9';for(let j=0;j<400;j++)ctx.fillRect(nr()*2048,nr()*1400,1.5,1.5);let night=texOf(c),backMesh=new T.Mesh(front.geometry,new T.MeshStandardMaterial({map:night,roughness:.92,side:T.BackSide}));g.position.set(-.165+i*.11,0,.004);g.add(front,backMesh);book.sky.add(g);slats.push(g)}
 for(let i=0;i<9;i++){let g=cutMesh(A.star());g.add(thread(.32));g.position.set(-.18+i*.043,.075+(i%3)*.02,.025);book.sky.add(g);stars.push({g,y:g.position.y,d:i*.12})}const moon=cutMesh(A.moon());moon.position.set(-.12,.2,.025);moon.add(thread(.18));book.sky.add(moon);
 card(3,A.sketch(.05,true),-.15,.025,.6);card(3,A.sketch(.046),.16,.032,.75);
 function update(t){let s=0;turns.forEach((r,i)=>{if(t>=r[0]+.45)s=i+1});const turning=turns.findIndex(r=>t>=r[0]+.45&&t<r[1]-.3);book.groundMat.map=tx[s].ground;book.backMat.map=tx[turning<0?s:turning].sky;book.groundMat.needsUpdate=book.backMat.needsUpdate=true;if(turning>=0){book.leafFront.material.map=tx[turning].ground;book.leafBack.material.map=tx[turning+1].sky;book.leafFront.material.emissiveMap=tx[turning].ground;book.leafBack.material.emissiveMap=tx[turning+1].sky;book.leafFront.material.needsUpdate=book.leafBack.material.needsUpdate=true;book.setLeaf(ss(seg(t,turns[turning][0]+.45,turns[turning][1]-.3)))}else book.setLeaf(0);
 for(const r of cards){const end=r.s<3?turns[r.s][0]:1e5,u=back(seg(t,rise[r.s]+r.delay,rise[r.s]+r.delay+.8),1.3)*(1-ss(seg(t,end,end+.45)));r.pivot.visible=t>rise[r.s]&&t<end+.6;r.m.rotation.x=-Math.PI/2*(1-u)}
 doorPivot.rotation.y=-1.9*ss(seg(t,20.3,20.7))*(1-ss(seg(t,22,22.6))*.95);for(const r of clouds){r.q.visible=t>14&&t<49;r.q.position.y=r.y+Math.sin(t*.8+r.y*30)*.002+(1-spring(Math.max(0,t-15.6),4,.4))*.16}
 sun.pivot.position.y=-ss(seg(t,34.6,37.6))*.11;sun.m.rotation.z=Math.sin(t*1.2)*.025;
 river.forEach((r,i)=>{let x=Math.sin(t*2.6+i*2)*.003;for(let a of[32.02,33,33.88])x+=Math.sin(seg(t,a-.1,a+.5)*Math.PI)*.012*(i%2?-1:1);r.m.position.x=x});waves.forEach((r,i)=>{r.m.position.x=Math.sin(t*1.7+i*1.3)*.008*(i%2?-1:1);r.m.position.y=Math.sin(t*2.3+i)*.0012});
 for(let i=0;i<4;i++){slats[i].visible=t>74.1&&t<87.4;slats[i].rotation.y=Math.PI*ss(seg(t,81.8+i*.28,82.5+i*.28))}moon.visible=t>82.4&&t<87;moon.position.y=.4-(t>82.4?spring(t-82.4,4,.45)*.275:0);for(const r of stars){r.g.visible=t>82.5&&t<87;r.g.position.y=.4-(t>82.5+r.d?spring(t-82.5-r.d,5,.4)*(.4-r.y):0);r.g.rotation.z=Math.sin(t*1.5+r.d)*.08}
 return s}
 return{update};
}
