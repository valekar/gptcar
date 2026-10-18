const C=document.querySelector('canvas'), X=C.getContext('2d'); C.width=1280;C.height=720;
const W=1280,H=720,TAU=Math.PI*2,cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ss=v=>{v=cl(v);return v*v*(3-2*v)},mix=(a,b,u)=>a+(b-a)*u;
const hash=n=>{let v=Math.sin(n*127.1+311.7)*43758.5453123;return v-Math.floor(v)},rnd=(n,a,b)=>mix(a,b,hash(n));
function layer(w=1280,h=720){let c=document.createElement('canvas');c.width=w;c.height=h;return c}
const PAPER=layer(),P=PAPER.getContext('2d');P.fillStyle='#f3ecdc';P.fillRect(0,0,W,H);for(let i=0;i<13000;i++){P.strokeStyle=`rgba(74,54,28,${rnd(i,.008,.065)})`;P.lineWidth=rnd(i+3,.3,1);let x=rnd(i+1,0,W),y=rnd(i+2,0,H);P.beginPath();P.moveTo(x,y);P.lineTo(x+rnd(i+6,1,9),y+rnd(i+7,-1,1));P.stroke()}
function paper(col){X.globalCompositeOperation='source-over';X.globalAlpha=1;X.filter='none';X.fillStyle=col||'#f3ecdc';X.fillRect(0,0,W,H);if(!col)X.drawImage(PAPER,0,0);else{X.globalCompositeOperation='multiply';X.globalAlpha=.25;X.drawImage(PAPER,0,0);X.globalAlpha=1;X.globalCompositeOperation='source-over'}}
function poly(pts,c,stroke,w=2){X.beginPath();pts.forEach((p,i)=>i?X.lineTo(...p):X.moveTo(...p));X.closePath();if(c){X.fillStyle=c;X.fill()}if(stroke){X.strokeStyle=stroke;X.lineWidth=w;X.stroke()}}
function line(pts,c='#24201b',w=2,pr=1){if(pr<=0)return;X.beginPath();let N=(pts.length-1)*cl(pr),n=Math.floor(N);X.moveTo(...pts[0]);for(let i=1;i<=n;i++)X.lineTo(...pts[i]);if(n<pts.length-1){let a=pts[n],b=pts[n+1],u=N-n;X.lineTo(mix(a[0],b[0],u),mix(a[1],b[1],u))}X.strokeStyle=c;X.lineWidth=w;X.lineCap='round';X.lineJoin='round';X.stroke()}
function ellipse(x,y,rx,ry,c,s,w=2){X.beginPath();X.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);if(c){X.fillStyle=c;X.fill()}if(s){X.strokeStyle=s;X.lineWidth=w;X.stroke()}}
function txt(text,x,y,size=30,col='#2d2924',align='left',font='Georgia'){X.font=`${size}px ${font}`;X.fillStyle=col;X.textAlign=align;X.fillText(text,x,y)}
function cam(x=640,y=360,z=1,roll=0){X.translate(640,360);X.rotate(roll);X.scale(z,z);X.translate(-x,-y)}
function wavePts(x,y,len,amp=10,seed=0){return Array.from({length:65},(_,i)=>[x+i*len/64,y+amp*Math.sin(i*.19+seed)+amp*.25*Math.sin(i*.51+seed)])}
function grain(alpha=.11){X.save();X.globalCompositeOperation='multiply';X.globalAlpha=alpha;X.drawImage(PAPER,0,0);X.restore()}
function brush(pts,color,width,seed=1,dry=.4,progress=1){if(progress<=0)return;let n=64,pp=[],norm=[],left=[],right=[];for(let i=0;i<=n;i++){let u=i/n*cl(progress),q=u*(pts.length-1),j=Math.min(pts.length-2,Math.floor(q)),f=q-j,a=pts[j],b=pts[j+1],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;let x=mix(a[0],b[0],f),y=mix(a[1],b[1],f),nx=-dy/L,ny=dx/L;let pressure=(.25+.75*Math.pow(Math.sin(Math.PI*i/n),.38))*(.86+.14*Math.sin(i*.67+seed));let r=width*.5*pressure;pp.push([x,y]);norm.push([nx,ny]);left.push([x+nx*r,y+ny*r]);right.push([x-nx*r,y-ny*r])}X.save();X.globalCompositeOperation='multiply';X.globalAlpha=.32*(1-dry*.6);poly([...left,...right.reverse()],color);let tracks=9;for(let j=0;j<tracks;j++){let run=[],off=(j/(tracks-1)-.5)*width*.88;X.globalAlpha=.15+hash(seed+j)*.18;for(let i=0;i<=n;i++){let q=pp[i],v=norm[i],keep=Math.sin(i*.23+seed+j*3)+Math.sin(i*.51+j*2)>-1.3+dry*.7;if(keep){run.push([q[0]+v[0]*off,q[1]+v[1]*off]);}else{if(run.length>1)line(run,color,Math.max(.8,width*.035));run=[]}}if(run.length>1)line(run,color,Math.max(.8,width*.035))}X.restore()}
function wash(pts,col,seed=1,alpha=.35){X.save();X.globalCompositeOperation='multiply';for(let j=0;j<3;j++){X.globalAlpha=alpha/3;poly(pts.map((p,i)=>[p[0]+rnd(seed+i*3+j,-4,4),p[1]+rnd(seed+i*9+j,-4,4)]),col)}X.restore()}
function hatchPoly(pts,col='#211b17',spacing=9,angle=.2,width=1.5){X.save();X.beginPath();pts.forEach((p,i)=>i?X.lineTo(...p):X.moveTo(...p));X.closePath();X.clip();X.translate(640,360);X.rotate(angle);for(let y=-1300;y<1300;y+=spacing)line([[-1600,y],[1600,y]],col,width);X.restore()}
function tree(x,y,size,col='#4d6950',mode='wash',seed=2){if(mode==='wash'){brush([[x,y],[x-size*.05,y-size*.6],[x+size*.12,y-size]],'#685341',size*.06,seed,.65);for(let k=0;k<24;k++){let a=rnd(seed+k,0,TAU),r=rnd(seed+k+37,.1,.6)*size;let xx=x+Math.cos(a)*r,yy=y-size*.8+Math.sin(a)*r*.65;brush([[xx-size*.12,yy+size*.05],[xx+size*.1,yy-size*.08]],col,size*.16,seed+k,.5)}}else{poly([[x-size*.05,y],[x+size*.05,y],[x+size*.03,y-size*.8],[x-size*.03,y-size*.8]],col);for(let j=0;j<4;j++)poly([[x-size*(.35-j*.06),y-size*(.22+j*.18)],[x,y-size*(.8+j*.08)],[x+size*(.35-j*.06),y-size*(.22+j*.18)]],col)}}
function roof(x,y,w,h,col='#a4533d',s){poly([[x,y],[x+w/2,y-h],[x+w,y],[x+w,y+h*.9],[x,y+h*.9]],col,s);line([[x-8,y],[x+w/2,y-h-7],[x+w+8,y]],s||col,4)}
function dots(x,y,w,h,col,step=14,r=2.3,ang=0){X.save();X.beginPath();X.rect(x,y,w,h);X.clip();X.translate(x+w/2,y+h/2);X.rotate(ang);X.fillStyle=col;X.beginPath();for(let a=-w-h;a<w+h;a+=step)for(let b=-w-h;b<w+h;b+=step){X.moveTo(a+r,b);X.arc(a,b,r,0,TAU)}X.fill();X.restore()}
function figure(x,y,s=1,col='#303139',pose=0,outline){X.save();X.translate(x,y);X.scale(s,s);ellipse(0,-93,17,20,col,outline,2);poly([[-17,-70],[13,-72],[23,-20],[-22,-20]],col,outline,2);line([[-8,-23],[-16+pose*12,0],[-25+pose*25,24]],col,10);line([[9,-23],[15-pose*12,2],[26-pose*25,24]],col,10);line([[-14,-62],[-35,-37],[-25,-20]],col,8);line([[13,-61],[30,-38],[38,-57+pose*12]],col,8);X.restore()}
function seal(x,y,s=35,col='#ae332a'){X.save();X.translate(x,y);X.fillStyle=col;X.fillRect(0,0,s,s);line([[7,8],[s-7,8],[s-7,s-8],[7,s-8],[7,8]],'#f3ecdc',2);line([[s/2,8],[s/2,s-8]],'#f3ecdc',2);line([[7,s/2],[s-7,s/2]],'#f3ecdc',2);X.restore()}
function finish(){X.setTransform(1,0,0,1,0,0);X.globalAlpha=1;X.globalCompositeOperation='source-over';X.filter='none'}


const LAND=layer(3300,800),LX=LAND.getContext('2d');
function land(){let save=X;/* each terrain ribbon is an individual transparent brush mark */
for(let i=0;i<150;i++){let x=i*23-80,col=x<1000?'#c78766':x<2200?'#a9af73':'#769a8b';let y=450+50*Math.sin(i*.11);brush([[x,y+80],[x+65,y+80],[x+130,y+80]],col,120,i,.7)}
for(let i=0;i<12;i++){let x=i*270-100,y=460,h=70+rnd(i,0,125);let col=x<1000?'#b77659':x<2200?'#a8ad69':'#75917d';let pts=Array.from({length:30},(_,k)=>{let u=k/29;return[x+u*380,y-Math.pow(Math.sin(u*Math.PI),.4)*h*(.88+.12*Math.sin(u*11+i))]});wash([...pts,[x+380,530],[x,530]],col,i,.5);for(let k=0;k<5;k++)brush([[x+50+k*40,y-15],[x+110+k*25,y-h*.7]],col,12,i+k,.8)}
for(let i=0;i<42;i++){let x=i*74+15;if(x<1000){brush([[x,540],[x+15,478],[x+45,471]],'#a75843',32,i,.8)}else if(x<2200){for(let j=0;j<3;j++)brush([[x+j*5,540],[x+j*5+Math.sin(i)*15,465-rnd(i+j,0,55)]],'#76864f',5,i+j,.7)}else tree(x,530,rnd(i,115,230),'#567c65','wash',i)}
}
// Cache the broad painted world once; its paper margin is intentionally open.
const oldDraw=()=>{};
function drawCountry(t){let offset=mix(300,2700,ss(t/17)),z=t>16?mix(1,.58,ss((t-16)/4)):1.06;X.save();cam(offset,360,z);let front=offset+550;X.save();X.beginPath();X.rect(-300,-200,front+300,1400);X.clip();
for(let j=0;j<3;j++)brush([[-300,210+j*10],[3400,220+j*13]],j===0?'#b7c5ca':'#ccd3c8',75,j,.7);
land();let creek=[];for(let i=0;i<90;i++){let x=i*38;creek.push([x,570+25*Math.sin(i*.14)])}brush(creek,'#7099a2',24,4,.3);for(let i=0;i<24;i++){let x=2300+i*40;brush([[x,580],[x+70,580+8*Math.sin(i)]],'#6a9ca7',9,i,.7)}
X.restore();let xx=offset-100,yy=460;for(let i=0;i<18;i++){let x=xx+rnd(i,-240,240),y=110+((t*110+i*39)%330);brush([[x,y],[x-8,y+30]],'#819ca5',3,i,.4)}
let words=offset<1050?'red earth':offset<2150?'grass opens':'the green coast';txt(words,offset-370,645,34,'#675d4e','left','cursive');line([[offset-360,615],[offset-300,575]],'#796d58',1.3);X.restore()}
function render(t){paper();drawCountry(t);grain(.22);finish()}

window.DUR=20;window.READY=true;window.render=render;render(0);
