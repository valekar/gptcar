// Independent assembly of the preserved real LOD1.3 roof polygons and shared walls.
import * as T from 'three';
export function buildModel(M,stats){const vertices=[],normals=[],data=[],edgeHeights=new Map(),shaded=new Map(stats.zalm_shadow.shaded.map((r,i)=>[r.bi,i]));
 const key=(a,b)=>a[0]+','+a[1]+'/'+b[0]+','+b[1];
 for(let[bi,h,rings]of M.p)for(let ring of rings)for(let i=0;i<ring.length;i++){let a=ring[i],b=ring[(i+1)%ring.length],k=key(a,b);edgeHeights.set(k,Math.max(h,edgeHeights.get(k)||0))}
 function vertex(v,n,d){vertices.push(...v);normals.push(...n);data.push(...d)}
 function triangle(a,b,c,n,d){let ab=new T.Vector3(...b).sub(new T.Vector3(...a)),ac=new T.Vector3(...c).sub(new T.Vector3(...a));if(ab.cross(ac).dot(new T.Vector3(...n))<0)[b,c]=[c,b];vertex(a,n,d);vertex(b,n,d);vertex(c,n,d)}
 function prism(rings,height,record,share){
  for(let ri=0;ri<rings.length;ri++){let r=rings[ri],area=r.reduce((v,p,i)=>v+p[0]*r[(i+1)%r.length][1]-r[(i+1)%r.length][0]*p[1],0),orientation=Math.sign(area)*(ri?-1:1);
   for(let i=0;i<r.length;i++){let a=r[i],b=r[(i+1)%r.length],low=share?(edgeHeights.get(key(b,a))||0):0,dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(low>=height-1e-5||length<1e-6)continue;let n=[dz/length*orientation,0,-dx/length*orientation],p0=[a[0],low,a[1]],p1=[b[0],low,b[1]],p2=[b[0],height,b[1]],p3=[a[0],height,a[1]];triangle(p0,p1,p2,n,record);triangle(p0,p2,p3,n,record)}}
  let contours=rings.map(r=>r.map(p=>new T.Vector2(...p))),all=contours.flat();for(let ids of T.ShapeUtils.triangulateShape(contours[0],contours.slice(1))){let[a,b,c]=ids.map(i=>[all[i].x,height,all[i].y]);triangle(a,b,c,[0,1,0],record)}
 }
 for(let[bi,h,rings]of M.p){let[y,bh]=M.b[bi],seed=Math.sin((bi*1.37+.5)*127.1+311.7)*43758.5453;prism(rings,h,[y,bh,seed-Math.floor(seed),shaded.get(bi)??-1],true)}
 for(let ring of M.decks)prism([ring],.0015,[-1,0,0,-1],false);
 let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geo.setAttribute('aData',new T.Float32BufferAttribute(data,4));geo.computeBoundingSphere();return geo;
}
export function attributes(g){g.setAttribute('aData',new T.BufferAttribute(new Float32Array(g.attributes.position.count*4),4));return g}
