import * as T from 'three';
import * as A from './art.js';
import {cutMesh,blobShadow} from '/styles/paper-popup/demo/cutmesh.js';
import {texOf} from '/styles/paper-popup/demo/book.js';
import {seg,ss,eo,lerp,track,clamp} from '/core/lib.js';
const V=(...a)=>new T.Vector3(...a),PG=.0175;
export function characters(book){
 const pip=new T.Group(),body=new T.Group(),cache=new Map();pip.add(body);book.stage.add(pip);const shadow=blobShadow(.016,.25);book.stage.add(shadow);let last='';
 function draw(p){const key=JSON.stringify(p);if(key===last)return;last=key;let card=cache.get(key);if(!card){card=cutMesh(A.pipArt(p));cache.set(key,card)}body.clear();body.add(card)}
 const crumple=cutMesh(A.crumple());book.stage.add(crumple);const crshadow=blobShadow(.025,.24);book.stage.add(crshadow);
 const fold=new T.Group();book.stage.add(fold);const craft=new T.Group();fold.add(craft);const mat=new T.MeshStandardMaterial({color:'#f7f0dc',roughness:.91,side:T.DoubleSide}),triangles=[[[.03,0,0],[-.025,0,.025],[-.01,-.011,0]],[[.03,0,0],[-.025,0,-.025],[-.01,-.011,0]],[[.03,0,0],[-.025,0,.025],[-.02,.006,.01]],[[.03,0,0],[-.025,0,-.025],[-.02,.006,-.01]]];for(const pts of triangles){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pts.flat(),3));geo.computeVertexNormals();const m=new T.Mesh(geo,mat.clone());m.castShadow=m.receiveShadow=true;craft.add(m);let line=new T.Line(new T.BufferGeometry().setFromPoints(pts.map(p=>V(...p))),new T.LineBasicMaterial({color:'#baa785'}));craft.add(line)}const face=A.item(.012,.008,x=>{x.fillStyle='#5d503d';for(let q of[320,680]){x.beginPath();x.ellipse(q,400,35,50,0,0,7);x.fill()}x.strokeStyle='#5d503d';x.lineWidth=24;x.beginPath();x.arc(500,500,120,.1,Math.PI-.1);x.stroke()}),fc=cutMesh(face);fc.rotation.y=Math.PI/2;fc.position.set(.016,-.003,0);craft.add(fc);const fshadow=blobShadow(.031,.24);book.stage.add(fshadow);
 const whale=cutMesh(A.whale());book.stage.add(whale);const boat=cutMesh(A.boat());book.stage.add(boat);
 const flight=track([[103.9,[-.06,.05,.34]],[104.28,[0,.012,.325]],[104.8,[0,.02,.42]],[106.2,[.16,.12,.72]],[107.6,[.42,.15,.6]],[108.9,[.36,.08,.38]],[110,[.22,.01,.47]],[110.45,[.19,-PG+.002,.52]]]);
 const piecewise=(t,keys)=>track(keys)(t);
 function update(t,camera){const q=Math.floor(t*12)/12;let px=-.12,py=0,pz=.135,ry=0,scale=1,walk=0,visible=t>=20.4,back=false,wave=false,happy=false,surprise=false,flat=1,lean=0;const motion=(a,b,t0,t1)=>{let u=seg(q,t0,t1);px=lerp(a[0],b[0],u);pz=lerp(a[1],b[1],u);walk=u>0&&u<1?Math.floor((q-t0)*10)%12/12*Math.PI*2:0;py+=Math.abs(Math.sin(walk))*.0014};
 if(t<22){let u=seg(q,20.4,21.4);py=Math.sin(u*Math.PI)*.024;px=lerp(-.128,-.112,u);pz=lerp(.095,.136,u);surprise=true;scale=.75+.25*eo(u)}else if(t<25.8){happy=true;wave=true;py=Math.sin(seg(q,22.5,22.9)*Math.PI)*.006+Math.sin(seg(q,23.2,23.6)*Math.PI)*.006}
 else if(t<29.3)motion([-.115,.15],[.035,.16],26.2,31);
 else if(t<31.8){px=.052;pz=.14;wave=t>29.6;happy=true}
 else if(t<34.4)motion([.052,.14],[.09,.165],31.8,33.7);
 else if(t<48.6){px=.035;pz=.16;surprise=t>39&&t<44;happy=t>45;wave=t>45.2;py=Math.sin(seg(q,46.7,47.1)*Math.PI)*.006}
 else if(t<51.4)visible=false;
 else if(t<56.5)motion([-.14,.142],[.035,.146],51.5,56.5);
 else if(t<60.7){px=.035;pz=.146;surprise=true}
 else if(t<63.4){let u=seg(q,61,61.55);px=lerp(-.006,.072,u);pz=.151;py=Math.sin(u*Math.PI)*.035+u*.03;if(t>=61.55){let v=seg(q,61.55,62.15);px=.073;py=lerp(.03,.012,v)+Math.sin(v*Math.PI)*.03}if(t>=62.15){let v=seg(q,62.15,62.75);px=lerp(.074,.03,v);py=lerp(.012,0,v)+Math.sin(v*Math.PI)*.025}surprise=true}
 else if(t<66.4){px=.055;pz=.16;lean=.3;wave=true;happy=t>65.3}
 else if(t<71.6){px=.035;pz=.158;happy=true;wave=t>68.5}
 else if(t<74.4)visible=false;
 else if(t<86.9){px=lerp(-.13,.11,seg(t,74.6,87))+.008;py=.012+Math.sin(q*2.3)*.0015;pz=.1395;happy=t<82;surprise=t>=82;body.rotation.z=Math.sin(q*1.9)*.06}
 else if(t<89.6)visible=false;
 else if(t<96.4)motion([-.11,.13],[.045,.276],89.8,96.4);
 else if(t<103.9){px=0;pz=.284;back=true;ry=Math.PI;surprise=t<101;wave=t>=101;py=Math.sin(seg(q,101.2,101.7)*Math.PI)*.006;if(t>=103.2){py+=Math.sin(seg(q,103.95,104.3)*Math.PI)*.025;pz=lerp(.25,.33,seg(q,103.3,104.3))}}
 else if(t<111){const f=V(...flight(Math.min(t,110.45)));px=f.x-.004;py=f.y+.004;pz=f.z;happy=true;wave=true;ry=Math.atan2(camera.position.x-px,camera.position.z-pz);if(t>110.45)px+=eo(seg(t,110.45,110.9))*.018}
 else{px=.215;pz=.53;py=-PG;surprise=t<116;happy=t>121.5;wave=t>118.6;ry=0;py+=Math.sin(seg(q,121,121.4)*Math.PI)*.008}
 if(t>=48.6&&t<49.05||t>=71.6&&t<72.05||t>=86.8&&t<87.25){scale=1-seg(t,t<50?48.6:t<80?71.6:86.8,t<50?49.05:t<80?72.05:87.25)}
 pip.visible=visible;draw({walk:Math.round(walk*4)/4,happy,surprise,back,wave,phase:Math.floor(q*4)%6,blink:Math.floor(q*12)%49===0});pip.position.set(px,py,pz);pip.rotation.set(lean,ry,0);body.scale.setScalar(scale*.9);shadow.visible=visible&&t<103.2||t>110.4;shadow.position.set(px,py<0?-PG+.0004:.0004,pz);shadow.scale.setScalar(clamp(1-py*9,.25,1));
 crumple.visible=crshadow.visible=t>=56.5&&t<66.3;let cx=lerp(.26,.075,eo(seg(q,56.6,57.7))),sy=1,sx=1;if(t>=61.55){let u=seg(q,61.55,61.85);sy-=Math.sin(u*Math.PI)*.35;sx+=Math.sin(u*Math.PI)*.2}if(t>=62.15){sy*=lerp(1,.16,eo(seg(t,62.15,62.2)));sx*=lerp(1,1.5,eo(seg(t,62.15,62.2)))}if(t>64.4){sy*=lerp(1,.5,seg(q,64.4,66.1));sx*=lerp(1,1.15,seg(q,64.4,66.1))}crumple.position.set(cx,0,.152);crumple.rotation.z=t<57.8?(cx-.26)/.021:Math.sin(q*3)*.03;crumple.scale.set(sx,sy,1);crshadow.position.set(cx,.0004,.152);
 fold.visible=t>=66.2&&!(t>=71.9&&t<74.6)&&!(t>=87&&t<89.8);let fp,fr=0,fyaw=0,fscale=1;
 if(t<67.5){fp=V(.075,.0012+.012*ss(seg(t,66.8,67.5)),.152);fscale=ss(seg(t,66.2,66.7));craft.scale.z=lerp(.05,1,ss(seg(t,66.55,67.3)))}else if(t<68.7){let u=seg(t,67.5,68.7);fp=V(.05+Math.sin(u*6.283)*.035,.013+.02*Math.sin(u*Math.PI),.122+Math.cos(u*6.283)*.03);fyaw=-u*6.283;fr=-.5*Math.sin(u*Math.PI)}else if(t<71.9){fp=V(.085,.03+Math.sin(t*2.5)*.003,.16);fyaw=Math.PI;fr=Math.sin(t*2)*.1;fscale=1-ss(seg(t,71.6,71.9))}else if(t<87){let a=t*1.3;fp=V(px+Math.cos(a)*.035,.055+Math.sin(t*2.1)*.006,.135+Math.sin(a)*.02);fyaw=-a-Math.PI/2;fr=-.35;fscale=eo(seg(t,74.6,75))*(1-ss(seg(t,86.7,87)))}else if(t<103.9){fp=V(lerp(-.24,-.06,eo(seg(t,90,96))),lerp(.035,.05,seg(t,94,97))+Math.sin(t*2.3)*.003,lerp(.12,.34,seg(t,90,97)));fyaw=t<96.2?0:-Math.PI/2+.6;fr=Math.sin(t*2)*.1;fscale=eo(seg(t,89.8,90.2))}else{fp=V(...flight(Math.min(t,110.45)));let next=V(...flight(Math.min(t+.02,110.45))),d=next.sub(fp);fyaw=t<110.45?Math.atan2(-d.z,d.x):.05;fr=t<110.45?Math.sin(seg(t,104.8,110.4)*Math.PI*2)*.5:0;if(t>110.45)fp.x+=eo(seg(t,110.45,110.9))*.018}fold.position.copy(fp);fold.rotation.set(fr,fyaw,0);fold.scale.setScalar(fscale);fshadow.visible=fold.visible&&t>104.8;fshadow.position.set(fp.x,-PG+.0004,fp.z);fshadow.scale.setScalar(clamp(1-(fp.y+PG)*8,.3,1));
 whale.visible=t>78&&t<82.3;whale.position.set(.05,-.03+Math.sin(seg(t,78,82.3)*Math.PI)*.05,.052);whale.rotation.z=Math.sin(t*2)*.03;
 boat.visible=t>74.2&&t<87.2;boat.position.set(lerp(-.13,.11,seg(t,74.6,87)),-.006+Math.sin(t*2.3)*.0015,.14);boat.rotation.z=Math.sin(t*1.9)*.06;
 return{pip:pip.position.clone().add(V(0,.036,0)),crumple:crumple.position.clone().add(V(0,.045,0)),fold:fold.position.clone().add(V(0,.025,0))};
 }
 return{update};
}
