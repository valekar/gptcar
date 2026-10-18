// Measured reference compositions as data; independently applied similarity interpolation.
export const cameraKeys = [
[0,'open',960,540,68000,90,1],[2.6667,'open',960,540,63500,88.5,0],
[5.3333,'tissue',960,405,9200,25.4,1],[9.3333,'tissue',960,405,8550,26.4,0],
[10.6667,'A',1090,470,2700,18.5,1],[15.3333,'A',1090,470,2600,19.3,0],
[16.6667,'B',830,470,2700,18.5,1],[20.6667,'B',830,470,2600,19.3,0],
[21.6667,'mid',960,540,3950,18.5,1],[26.6667,'mid',960,540,3780,19.1,0],
[29.3333,'nucleus',840,560,345,34,1],[32.6667,'nucleus',840,560,318,35.2,0],
[35.3333,'end',1450,470,46000,96,1],[39.5,'end',1450,470,44600,97,1]];
const mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],add=(a,b)=>[a[0]+b[0],a[1]+b[1]],div=(a,b)=>{let s=b[0]**2+b[1]**2;return[(a[0]*b[0]+a[1]*b[1])/s,(a[1]*b[0]-a[0]*b[1])/s]};
export function makeCamera(P,N){
 const photo=(x,y)=>[(x-P.slide_reg.origin[0])*P.slide_reg.k,(y-P.slide_reg.origin[1])*P.slide_reg.k];
 const points={open:photo(630,1520),end:photo(630,1481),tissue:P.tissue.center,A:P.rois.A.center,B:P.rois.B.center,mid:P.rois.A.center.map((v,i)=>(v+P.rois.B.center[i])/2),nucleus:[N.cx,N.cy]};
 const keys=cameraKeys.map(([t,p,x,y,fov,roll,linear])=>{let angle=roll*Math.PI/180,k=1920*.25/fov,a=[k*Math.cos(angle),k*Math.sin(angle)];return{t,angle,k,a,b:sub([x,y],mul(a,points[p])),linear}});
 return t=>{let i=0;while(i<keys.length-2&&t>=keys[i+1].t)i++;const x=keys[i],y=keys[i+1];let u=Math.max(0,Math.min(1,(t-x.t)/(y.t-x.t)));if(!x.linear)u=u<.5?4*u**3:1-(-2*u+2)**3/2;
 let ratio=div(y.a,x.a),shift=sub(y.b,mul(ratio,x.b)),z=sub([1,0],ratio),a,b;
 if(Math.hypot(...z)<1e-8){a=x.a;b=x.b.map((v,j)=>v+shift[j]*u)}else{let pivot=div(shift,z),turn=(y.angle-x.angle)*u,scale=Math.exp(Math.log(y.k/x.k)*u),q=[scale*Math.cos(turn),scale*Math.sin(turn)];a=mul(q,x.a);b=add(mul(q,sub(x.b,pivot)),pivot)}
 let k=Math.hypot(...a);return{a,b,k,angle:Math.atan2(a[1],a[0]),fov:480/k,screen:p=>add(mul(a,p),b),world:p=>div(sub(p,b),a)}};
}
