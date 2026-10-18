/* Independently assembled page geometry and paint choreography.
   Uses attributed crayon stroke and character-model primitives only. */
import {line,fill,dab,ellipse,handCircle,CAM,W,H} from './crayon.js';
import {star} from './chars.js';
import {PAL} from './pal.js';
import {seg,lerp,hash,mulberry,eio} from '/core/lib.js';
const K=PAL.crayon;
const roofs=[[1100,1050],[1720,1010],[1950,1318],[1320,1360]];
const front=[[900,1640],[900,1345],[1100,1050],[1300,1353],[1300,1640]];
const side=[[1300,1353],[1900,1317],[1900,1640],[1300,1640]];
const win=[[1440,1420],[1680,1406],[1680,1592],[1440,1602]];
export const moonPosition=[2450,560,240],seat=[1452,1032];
export const stars=[];
const rng=mulberry(298751);
while(stars.length<250){let x=40+rng()*3120,y=30+rng()*1250,r=4+rng()*18;if(Math.hypot(x-2450,y-560)<310||x<820&&y<400||x>830&&x<1990&&y>900||Math.hypot(x-530,y-1290)<240||stars.some(q=>Math.hypot(x-q.x,y-q.y)<45))continue;stars.push({x,y,r,angle:rng()*1.2,seed:4000+stars.length})}
function polygon(F,L,pts,c,seed,p,draw=1,width=8){fill(F,pts,{col:c,p,gap:10,w:12,over:4,ang:.52,draw,boil:0,seed});line(L,[...pts,pts[0]],{w:width,p:.86,draw:1,seed:seed+1,boil:.6})}
export function world(F,L,t){const outline=seg(t,.3,1.2),colour=seg(t,3,4.3),treeLine=seg(t,1.7,2.3),treeFill=seg(t,4,4.8),grass=seg(t,3.6,4.6);
 const edge=Array.from({length:43},(_,i)=>[i*80-80,1625+Math.sin(i*1.2)*10+hash(i*3)*9]);fill(F,[...edge,[3300,1870],[-80,1870]],{col:K.green,p:.76,gap:12,w:14,ang:1.25,seed:104,draw:grass,boil:0});line(L,edge,{col:K.green,w:7,seed:105,draw:seg(t,1.8,2.4),boil:.6});
 for(let i=0;i<28;i++){const x=hash(i*41+100)*3200,y=1670+hash(i*23)*115;line(L,[[x-9,y],[x-4,y-22],[x+1,y],[x+11,y-19]],{col:K.green,w:4,draw:grass,seed:150+i});if(i%6===0&&grass>.5){for(let k=0;k<5;k++)dab(F,x+Math.cos(k*6.283/5)*11,y-25+Math.sin(k*6.283/5)*11,8,{col:i%2?K.yellow:K.pink,p:.9,seed:i*7+k});}}
 const trunk=[[503,1640],[501,1418],[557,1418],[557,1640]],crown=Array.from({length:73},(_,i)=>{const a=i/72*Math.PI*2,r=1+.085*Math.abs(Math.sin(a*4.5));return[530+Math.cos(a)*185*r,1290+Math.sin(a)*165*r]});
 for(const [shape,c,seed]of[[trunk,K.brown,201],[crown,K.green,210]]){fill(F,shape,{col:c,p:.79,gap:12,w:14,ang:.8,draw:treeFill,boil:0,seed});line(L,[...shape,shape[0]],{w:7,draw:treeLine,seed:seed+1,boil:.6})}
 if(treeFill>.7)for(let i=0;i<5;i++)dab(F,445+hash(i*7)*190,1200+hash(i*11)*160,13,{col:K.red,p:.85,seed:220+i,boil:0});
 for(const [shape,c,seed]of[[side,K.ochre,301],[front,K.ochre,311],[roofs,K.red,321]]){fill(F,shape,{col:c,p:c===K.red?.8:.86,gap:10,w:12,ang:c===K.red?.62:-.4,draw:colour,boil:0,cross:c!==K.red,crossP:.5,seed});line(L,[...shape,shape[0]],{w:8,seed:seed+1,draw:seg(t,.6,1.5),boil:.6})}
 line(L,[[870,1360],[1100,1050],[1320,1360]],{col:K.ink,w:8,seed:329,draw:outline,boil:.6});
 line(L,[[870,1360],[1100,1050],[1320,1360]],{col:K.red,w:16,seed:330,draw:colour,boil:0});
 const chimney=[[1212,928],[1294,928],[1294,1072],[1212,1082]],cap=[[1200,912],[1306,912],[1306,940],[1200,940]],door=[[1058,1640],[1058,1512],[1080,1494],[1128,1494],[1150,1512],[1150,1640]];
 for(const [shape,c,seed]of[[chimney,K.brown,340],[cap,K.red,350],[door,K.brown,360],[ellipse(1100,1210,44,44,32),K.sky,370]]){fill(F,shape,{col:c,p:.85,gap:8,w:10,ang:1.45,seed,draw:colour,boil:0});line(L,[...shape,shape[0]],{w:6.5,seed:seed+1,draw:seg(t,.6,1.5),boil:.6})}
 if(colour>.6){line(L,[[1058,1210],[1142,1210]],{w:5,seed:381});line(L,[[1100,1168],[1100,1252]],{w:5,seed:382});dab(F,1135,1574,5,{col:K.yellow,p:1,seed:383});}
 fill(F,win,{col:K.yellow,p:.97,gap:7,w:10,cross:true,crossP:.6,seed:390,draw:seg(t,3.6,4.4),boil:0});line(L,[...win,win[0]],{w:7,seed:391,draw:outline});if(colour>.7){for(const [i,shape]of[[0,[[1446,1424],[1500,1422],[1470,1520],[1446,1560]]],[1,[[1674,1410],[1620,1412],[1650,1510],[1674,1550]]]])fill(F,shape,{col:K.pink,p:.87,gap:6,w:8,seed:392+i,boil:0});
 for(let row=1;row<5;row++)for(let j=0;j<9;j++){const u=row/5,x0=lerp(1100,1320,u),x1=lerp(1720,1950,u),y0=lerp(1050,1360,u),y1=lerp(1010,1318,u);const a=j/9,b=(j+1)/9;line(L,[[lerp(x0,x1,a),lerp(y0,y1,a)],[lerp(x0,x1,(a+b)/2),lerp(y0,y1,(a+b)/2)+13],[lerp(x0,x1,b),lerp(y0,y1,b)]],{col:K.brown,w:3.7,p:.48,seed:500+row*10+j,boil:.6})}
 for(let j=0;j<3;j++){let yy=970+j*43;line(L,[[1215,yy],[1291,yy]],{w:3.5,p:.5,seed:560+j});line(L,[[1240+j*9,yy],[1240+j*9,yy+40]],{w:3,p:.45,seed:570+j})}}
 const count=Array.from({length:8},(_,i)=>seg(t,20.3+i*.45-.12,20.3+i*.45)).reduce((a,b)=>a+b,0),rail=seg(t,20.15,20.35)*(.42+.58*count/8);
 if(rail>0){line(L,[[1745,1640],[lerp(1745,1760,rail),lerp(1640,1296,rail)]],{w:8,col:K.brown,seed:601});line(L,[[1825,1640],[lerp(1825,1840,rail),lerp(1640,1292,rail)]],{w:8,col:K.brown,seed:602});for(let i=0;i<8;i++){let y=1598-i*44,u=seg(y,1640,1294);line(L,[[lerp(1745,1760,u)-5,y+2],[lerp(1825,1840,u)+5,y]],{w:7.5,col:K.brown,draw:Math.max(0,Math.min(1,count-i)),seed:610+i})}}
}
export function waxStars(G){for(const q of stars)if(q.r>10)star(G,[q.x,q.y],q.r,q.seed,q.angle,K.white,false);else dab(G.f,q.x,q.y,q.r,{col:K.white,p:1,gap:3,w:4,over:.5,seed:q.seed,boil:.25})}
export function washPaint(L,t){const g=L.g;g.save();g.setTransform(CAM.s,0,0,CAM.s,W/2-CAM.x*CAM.s,H/2-CAM.y*CAM.s);
 for(const [i,[a,b,top,bot,dir]]of [[27.9,29.9,-120,640,1],[30,32.1,540,1090,-1],[32.5,34.7,990,1800,1]].entries()){
 if(t<a)continue;const p=.15*seg(t,a,b)+.85*eio(seg(t,a,b)),front=dir>0?lerp(-260,3460,p):lerp(3460,-260,p);g.save();g.beginPath();let xedge=dir>0?-400:3600;g.moveTo(xedge,top-80);for(let y=top-80;y<=bot+80;y+=15)g.lineTo(front+dir*65*Math.sin(seg(y,top,bot)*Math.PI)+Math.sin(y*.05+i)*12,y);g.lineTo(xedge,bot+80);g.closePath();g.clip();g.beginPath();for(let x=-300;x<=3500;x+=30){const y=top+14*Math.sin(x*.007+i)+7*Math.sin(x*.019);x===-300?g.moveTo(x,y):g.lineTo(x,y)}for(let x=3500;x>=-300;x-=30)g.lineTo(x,bot+12*Math.sin(x*.006+i)+10*Math.sin(x*.017));g.closePath();g.fillStyle='#000';g.globalAlpha=.8;g.fill();g.clip();
 for(let k=0;k<36;k++){const yy=lerp(top,bot,hash(i*53+k*13)),dark=k%3;g.beginPath();for(let x=-300;x<=3500;x+=45){let y=yy+Math.sin(x*.004+k)*13+Math.sin(x*.017+i)*5;x===-300?g.moveTo(x,y):g.lineTo(x,y)}g.lineWidth=5+hash(k*19)*24;g.globalAlpha=dark?.15:.07;g.globalCompositeOperation=dark?'source-over':'destination-out';g.strokeStyle='#000';g.stroke()}g.restore()}
 g.restore();}
