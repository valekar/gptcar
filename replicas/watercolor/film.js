/* GPT-6.1 Sol High: independent reference-matched scene assembly.
   Shared only engine.js/plants.js botanical primitives, coast data and paper. */
const canvas=document.getElementById('c'), ctx=canvas.getContext('2d');
window.DUR=113.6;
const layers=[{p:.25,y:640,s:.38,a:.46},{p:.55,y:690,s:.62,a:.72},{p:1,y:745,s:1,a:1},{p:1.55,y:1115,s:1.75,a:.94}];
const travel=monotone([[0,700],[10.3,700],[16,1400],[22,2150],[28,3400],[33,4100],[37,4750],[41,5500],[45,5850],[51,6350],[54,7300],[58.5,7550],[61.2,8250],[66,9300],[73,9800]]);
const lift=t=>980*(eio(seg(t,54.2,57.8))-eio(seg(t,58.4,60.9)));
const bounds=[2500,4700,7300,8700,14000];
const zone=x=>{const i=bounds.findIndex(b=>x<b);return i<0?4:i};
const zpal=[['#f0d6b8','#dcae8e','#dba47e','#dda27a'],['#efdcc6','#c89b8c','#d0ae80','#dbb584'],['#ece2cd','#bdb99c','#cbc28f','#dccb92'],['#dfe3dc','#9fb1b8','#98aa8a','#a7b48e'],['#dbe3d8','#9ab19f','#6f8d6d','#6e8b69']];
const rainkeys=[[-1600,150],[700,160],[2500,250],[4700,500],[7300,900],[8700,1800],[9400,2800],[10200,3600],[13000,4000]];
function rainval(x){for(let i=1;i<rainkeys.length;i++)if(x<rainkeys[i][0])return Math.exp(lerp(Math.log(rainkeys[i-1][1]),Math.log(rainkeys[i][1]),seg(x,rainkeys[i-1][0],rainkeys[i][0])));return 4000}
function gradientColor(x,k){const knots=[700,3500,6000,7900,10200];for(let j=1;j<knots.length;j++)if(x<knots[j])return mixc(zpal[j-1][k],zpal[j][k],ss(seg(x,knots[j-1],knots[j])));return zpal[4][k]}
let paper,plants=[],heroes={},coasts=[],mapPath,mapCells=[],mapFires=[],ground,cloudSprites=[];
const fade=(t,a,b,fi=.5,fo=.5)=>ss(seg(t,a,a+fi))*(1-ss(seg(t,b-fo,b)));
function item(layer,x,g,s=1,extra={}){const l=layers[layer],obj=withSeed(Math.floor(x*7+layer*92013),()=>g(s*l.s));const q={layer,x,y:l.y+withSeed(Math.floor(x),()=>rnd(-6,22)),g:obj,a:l.a,...extra};q.sprite=sprite(obj.S);if(obj.woody){q.black=sprite(obj.woody,'#2a2320');q.green=sprite(obj.shoots)}plants.push(q);return q}
function buildGarden(){
 withSeed(932307,()=>{
 heroes.spin=item(2,1450,spinifex,1.7);heroes.mulga=item(2,3500,mulga,1.55);heroes.gum=item(2,4960,gum,1.12);heroes.ash=item(2,7560,ash,1);heroes.emergent=item(2,9420,s=>rfTree(s,{emergent:true}),1.05);
 const protect=x=>[1450,3500,4960,7560,9420].some(v=>Math.abs(v-x)<140);
 for(let li=0;li<4;li++)for(let x=-1700;x<13500;){let zi=zone(x+rnd(-180,180));let g,sc=rnd(.72,1.16),gap;
 if(li===3){g=zi<1?spinifex:zi<2?saltbush:zi<3?tussock:groundFern;gap=zi<3?rnd(550,900):rnd(300,520)}
 else if(zi===0){g=rnd()<.24?desertOak:spinifex;gap=li===2?rnd(140,270):rnd(250,450)}
 else if(zi===1){g=pick([mulga,mulga,saltbush,wattle,spinifex]);gap=rnd(130,225)}
 else if(zi===2){g=gum;gap=rnd(210,320)}
 else if(zi===3){g=rnd()<.38?ash:treeFern;sc=g===ash?(li===2?rnd(.82,.95):rnd(.8,1)):sc;gap=rnd(130,220)}
 else{g=pick([rfTree,rfTree,fanPalm,treeFern]);gap=rnd(75,145)}
 if(li!==2||!protect(x)){const q=item(li,x,g,sc);if(zi===2&&li===2&&x>5650&&x<6900&&q.g.woody)q.fire=true;}
 if(zi===2&&li===2)for(let k=0;k<3;k++)item(li,x+rnd(20,180),tussock,rnd(.6,1));
 if(zi>=3&&li===2){item(li,x+rnd(20,80),groundFern,rnd(.8,1.3));if(zi===4){item(li,x+rnd(20,70),shrub,rnd(.75,1));if(rnd()<.6)item(li,x+rnd(-30,30),vine,rnd(.7,1.1))}}
 x+=gap;
 }
 heroes.uluru=item(0,2540,uluru,1,{a:.8});
 plants.sort((a,b)=>a.layer-b.layer||a.y-b.y);
 ground=document.createElement('canvas');ground.width=15000;ground.height=370;const g=ground.getContext('2d');
 for(let x=0;x<15000;x+=rnd(15,50)){const wx=x-1600,zi=zone(wx),col=zi<2?'#8e714b':zi<3?'#847c4f':'#42684a';for(let k=0;k<4;k++){let y=rnd(0,350);let st=mk(qcurve(x,y,x+rnd(5,50),y+rnd(-2,2),rnd(-3,3),5),rnd(.5,1.6),col,{nb:0,a:rnd(.1,.28),prof:'tip'});drawS(g,st)}}
 for(let x=3900;x<14000;x+=rnd(550,950)){const q=cloud(rnd(.6,1),x<7300?'#b6c0c0':'#9aa9ae');cloudSprites.push({x,y:rnd(140,340),s:sprite(q.S)})}
 });
}
function paperBase(){ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.drawImage(paper,0,0,W,H)}
function washShape(points,col,alpha=.2){ctx.save();ctx.fillStyle=col;for(let pass=0;pass<3;pass++){ctx.globalAlpha=alpha/3*1.6;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y+Math.sin(i*13+pass)*3):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}ctx.restore()}
function landscapeBase(t){const x=travel(t),up=lift(t);let bg=gradientColor(x,0),soil=gradientColor(x,3);
 const sky=ctx.createLinearGradient(0,190,0,800);sky.addColorStop(0,rgba(bg,0));sky.addColorStop(1,rgba(bg,.22));ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 for(let dep=0;dep<3;dep++){const par=[.13,.25,.55][dep],base=[655,665,705][dep]+up*par;const pts=[];for(let sx=-100;sx<W+120;sx+=28){const wx=x+(sx-960)/par;let z=zone(wx),amp=[100,150,115,250,170][z]*[.7,1,.5][dep];pts.push([sx,base-(fbm(wx/800+dep*21)*.75+fbm(wx/270+11)*.25)*amp])}pts.push([W+120,1800],[-100,1800]);washShape(pts,gradientColor(x,dep===2?2:1),[.18,.31,.3][dep])}
 const gy=745+up,pts=[[-50,gy],[W+50,gy+2],[W+50,2000],[-50,2000]];washShape(pts,soil,.16);
 const fadeGround=ctx.createLinearGradient(0,gy,0,Math.max(gy+1,1080));fadeGround.addColorStop(0,rgba(PAPER,0));fadeGround.addColorStop(1,rgba(PAPER,.72));ctx.fillStyle=fadeGround;ctx.fillRect(0,gy,W,Math.max(0,1080-gy));
 ctx.save();ctx.globalAlpha=.9;ctx.drawImage(ground,1600+travel(t)-960,0,1920,Math.max(1,Math.min(370,1080-gy)),0,gy,1920,Math.max(1,Math.min(370,1080-gy)));ctx.restore();
 for(const q of cloudSprites){const sx=960+(q.x-x)*.2;if(sx<-450||sx>W+500)continue;ctx.save();ctx.globalAlpha=.6;ctx.drawImage(q.s.cv,sx+q.s.x0,q.y+up*.2+q.s.y0);ctx.restore()}
}
function screen(q,t,dx=0,dy=0){const l=layers[q.layer];return [960+(q.x-travel(t))*l.p+dx,q.y+lift(t)*l.p+dy]}
function renderPlant(q,t){const l=layers[q.layer],[x,y]=screen(q,t);if(x<-650||x>W+700)return;let p=clamp((W+260-x)/360);if(t<13.4)p*=clamp((lerp(-300,1650,eio(seg(t,10.2,13.4)))-x)/330);if(q.layer===3)p=1;
 if(zone(q.x)===4&&t<62.8)p*=ss(seg(t,61.1,62.0));if(p<=0)return;
 ctx.save();ctx.translate(x,y);ctx.transform(1,0,.008*Math.sin(t*1.15+q.x)*p,1,0,0);ctx.globalAlpha=q.a;
 if(q.fire){const start=41.6+(q.x-5650)/1250*3,burn=ss(seg(t,start,start+.9)),reg=ss(seg(t,47.4+(q.x-5650)/1250*1.6,49+(q.x-5650)/1250*1.6));ctx.globalAlpha=q.a*(1-burn);ctx.drawImage(q.sprite.cv,q.sprite.x0,q.sprite.y0);ctx.globalAlpha=q.a*burn;ctx.drawImage(q.black.cv,q.black.x0,q.black.y0);if(reg>0){ctx.globalAlpha=1;drawList(ctx,q.g.shoots,reg)}}
 else if(p<1)drawList(ctx,q.g.S,p);else ctx.drawImage(q.sprite.cv,q.sprite.x0,q.sprite.y0);ctx.restore()
}
function mark(pts,width,color,options={}){if(pts.length===2){let [a,b]=pts;if(Math.hypot(b[0]-a[0],b[1]-a[1])<.01){a=[a[0]-.6,a[1]];b=[b[0]+.6,b[1]]}pts=qcurve(a[0],a[1],b[0],b[1],0,8)}drawS(ctx,mk(pts,width,color,{nb:width>5?3:0,a:.88,...options}))}
function animal(t,kind,x,y,scale=1,phase=0){withSeed(310+phase,()=>{ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);const ink='#3d3129';
 if(kind==='roo'){const h=(t-11.865)/1.161,cyc=h-Math.floor(h),hop=Math.sin(cyc*Math.PI)*24;ctx.translate(0,-hop);mark(qcurve(-3,-15,-18,-70,-10),24,'#b86e45',{prof:'leaf'});mark(qcurve(-17,-65,-9,-86,-4),15,'#b86e45',{prof:'leaf'});mark(qcurve(-10,-82,6,-77,2),7,'#aa5f3e');mark(qcurve(-12,-86,-15,-103,-1),4,'#965331');mark(qcurve(-7,-86,-3,-104,1),4,'#965331');mark(qcurve(-8,-12,-66,0,-8),10,'#b5794f',{prof:'tip'});let a=Math.sin(cyc*6.28);mark([[-9,-20],[8+a*8,-7],[30+a*5,1]],7,'#ae6c43');mark([[-20,-19],[-4-a*6,-6],[15-a*6,1]],5,'#965e3e');mark([[-8,-58],[3,-40],[13,-45]],4,'#965e3e');mark([[0,-81],[1,-81]],2,ink)}
 if(kind==='koala'){mark(qcurve(-5,-10,-7,-55,3),29,'#858781',{prof:'leaf'});mark([[-6,-49],[-4,-60]],23,'#8d918a',{prof:'leaf'});for(const xx of [-18,7])mark([[xx,-59],[xx+1,-64]],15,'#7e837e',{prof:'leaf'});mark([[-5,-57],[-6,-48]],7,'#393b39',{prof:'leaf'});mark([[-19,-33],[1,-24],[13,-29]],8,'#797f78');mark([[-10,-13],[8,-4],[14,-11]],8,'#797f78');for(const xx of [-12,1])mark([[xx,-59],[xx+.5,-59]],2,ink)}
 if(kind==='cassowary'){mark(qcurve(-24,-30,25,-32,1),51,'#2a3430',{prof:'leaf'});for(let i=0;i<16;i++)mark(qcurve(-15+i*2,-33,-30+i*2,5,rnd(-4,4)),2,'#1e2c29',{prof:'tip',a:.6});mark(qcurve(20,-41,26,-83,5),10,'#316b87');mark(qcurve(25,-81,37,-82,-2),13,'#43829b',{prof:'leaf'});mark([[26,-88],[27,-101],[36,-91]],5,'#7d7055');mark([[34,-83],[46,-80]],4,'#c6aa6d',{prof:'tip'});mark([[25,-70],[21,-57]],4,'#a84b3e');mark([[35,-86],[36,-86]],2,ink);for(const [i,xx] of [-10,10].entries()){const a=Math.sin(t*4+i*Math.PI);mark([[xx,-8],[xx+a*9,10],[xx+a*17,24]],5,'#817f62');mark([[xx+a*17,24],[xx+a*17+12,26]],3,'#685c48')}}ctx.restore()})}
function birds(t){if(t<25||t>31)return;const p=seg(t,25,31);withSeed(18,()=>{for(let i=0;i<17;i++){const x=lerp(1900,-200,p)+i*24,y=210+Math.sin(i*3)*36+Math.sin(t*9+i)*9;mark([[x-8,y-3],[x,y+5],[x+8,y-4]],3.2,i%3?'#6a9a58':'#8faf5b',{prof:'tip'})}})}
function nature(t){const cam=travel(t),up=lift(t);if(t<34)for(let i=0;i<2;i++){const wx=1050+(t-11.8)*115-i*110;animal(t,'roo',960+wx-cam,750+up,.85-i*.22,i)}
 const [gx,gy]=screen(heroes.gum,t);if(t>34&&t<42)animal(t,'koala',gx+heroes.gum.g.fork[0]+10,gy+heroes.gum.g.fork[1]+5,.72);
 if(t>52&&t<55.5){const [x,y]=screen(heroes.ash,t,93,0);withSeed(50,()=>{mark([[x,y-16],[x,y-8],[x-3,y]],3,INK);mark([[x,y-8],[x+4,y]],2,INK);mark([[x,y-19],[x,y-18]],5,INK,{prof:'leaf'})})}
 if(t>61.5&&t<71){const wx=9150+(t-62)*30;animal(t,'cassowary',960+wx-cam,746+up,.85)}birds(t);
}
function effects(t){withSeed(250,()=>{if(t>26.3&&t<32){const [x,y]=screen(heroes.mulga,t);for(let i=0;i<14;i++){let ph=(t-26.4-i*.36);if(ph<0||ph>1.7)continue;const side=i%2?-1:1,topx=x+side*(70+(i%4)*24),topy=y-220-(i%3)*25;const xx=lerp(topx,x,seg(ph,.5,1.5)),yy=ph<.5?lerp(topy-100,topy,ph/.5):lerp(topy,y,seg(ph,.5,1.5));mark([[xx,yy-8],[xx,yy]],4,'#3f7fa8',{prof:'leaf',a:.8})}ctx.save();ctx.globalAlpha=.17*ss(seg(t,27,30));ctx.fillStyle='#3f7fa8';ctx.beginPath();ctx.ellipse(x,y+4,80,12,0,0,7);ctx.fill();ctx.restore();ctx.save();ctx.setLineDash([5,5]);ctx.strokeStyle=rgba('#3d3129',.5);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+75*ss(seg(t,27,31)));ctx.stroke();ctx.restore()}
 if(t>41.6&&t<47.7){for(let wx=5650;wx<6900;wx+=27){const start=41.6+(wx-5650)/1250*3;let p=ss(seg(t,start,start+.3))*(1-ss(seg(t,start+1.9,start+3)));if(p<.01)continue;const x=960+wx-travel(t),y=750+lift(t),h=(34+hash(wx)*76)*p;mark(qcurve(x,y,x+Math.sin(t*8+wx)*9,y-h,-12),15*p,'#c76528',{prof:'tip',a:.8});mark(qcurve(x+2,y,x-3,y-h*.6,7),8*p,'#e9a742',{prof:'tip',a:.7})}}
 if(t>61&&t<71.3){ctx.save();ctx.strokeStyle=rgba('#708e91',.23);ctx.lineWidth=1;for(let i=0;i<100;i++){let x=hash(i*7)*W,y=((hash(i*9)*H+t*220)%H);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+15);ctx.stroke()}ctx.restore()}
 })}
function handwriting(txt,x,y,p,size=32){if(p<=0)return;ctx.save();ctx.beginPath();ctx.rect(x-16,y-size*1.3,Math.max(0,760*p),size*2);ctx.clip();ctx.font=`500 ${size}px Caveat`;ctx.textAlign='left';ctx.fillStyle=INK;ctx.shadowBlur=10;ctx.shadowColor=PAPER;ctx.fillText(txt,x,y);ctx.shadowBlur=0;ctx.fillText(txt,x,y);ctx.restore()}
function note(t,a,b,q,dx,dy,label,lx,ly,size=32){const f=fade(t,a,b,.25,.5);if(f<=0)return;const [x,y]=screen(q,t,dx,dy);ctx.save();ctx.globalAlpha=f;const p=ss(seg(t,a,a+.65));ctx.strokeStyle=rgba(INK,.7);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+lx*.3,y+ly*.7,x+lx*p,y+ly*p);ctx.stroke();handwriting(label,x+lx+5,y+ly-8,seg(t,a+.25,a+1.3),size);ctx.restore()}
function annotations(t){note(t,13.6,21,heroes.uluru,0,-20,'Uluru',-35,-70,26);note(t,18,22.8,heroes.spin,20,-70,'spinifex  ·  Triodia',70,-150);note(t,27.4,33.2,heroes.mulga,40,-150,'branches up, rain runs down',110,-150);note(t,36.2,41.2,heroes.gum,20,-240,'gum tree  ·  Eucalyptus',120,-120);const recovered=plants.find(q=>q.fire&&q.x>6050);if(recovered)note(t,49,52.2,recovered,0,-130,'epicormic shoots',90,-150);
 note(t,52.6,55,heroes.ash,94,-16,'a person, for scale',70,-100,26);note(t,55.2,59,heroes.ash,12,heroes.ash.g.top+140,'mountain ash  ·  Eucalyptus regnans',-440,-60);
 if(t>54.3&&t<59.4){const [x,y]=screen(heroes.ash,t,150,0),top=y+heroes.ash.g.top,pr=eo(seg(t,54.3,57.6)),yy=lerp(y,top,pr);ctx.save();ctx.globalAlpha=1-ss(seg(t,58.9,59.4));ctx.strokeStyle=rgba(INK,.65);ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,yy);for(const cy of [y,yy]){ctx.moveTo(x-8,cy);ctx.lineTo(x+8,cy)}ctx.stroke();handwriting('≈ 100 m',x+20,Math.max(140,Math.min(900,(y+yy)/2)),seg(t,55.6,56.6),40);ctx.restore()}
 if(t>63.6&&t<70.4){ctx.save();ctx.globalAlpha=1-ss(seg(t,69.8,70.4));ctx.strokeStyle=rgba(INK,.7);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(92,230);ctx.lineTo(92,lerp(230,745,eo(seg(t,63.6,64.6))));ctx.stroke();for(const [s,y,a] of [['emergent',262,64],['canopy',410,64.7],['understorey',590,65.4],['forest floor',712,66.1]]){const p=seg(t,a,a+.5);ctx.beginPath();ctx.moveTo(84,y);ctx.lineTo(92+8*p,y);ctx.stroke();handwriting(s,110,y,seg(t,a,a+1),30)}ctx.restore()}}
function topMatter(t){const names=[[11.2,22.8,'01','Hummock grassland','the red centre'],[23,33.8,'02','Acacia shrubland','mulga country'],[34,51.8,'03','Eucalypt woodland','gum trees, and fire'],[52,60.8,'04','Tall wet forest','the mountain ash'],[61.2,70.2,'05','Rainforest','the green edge']];
 for(const [a,b,num,title,sub]of names){const f=fade(t,a,b,.6,.5);if(f<=0)continue;ctx.save();ctx.globalAlpha=f;ctx.textAlign='left';ctx.fillStyle=INK;ctx.font='400 15px "IBM Plex Mono"';ctx.letterSpacing='3px';ctx.fillText(num+' / 05',128,90);ctx.letterSpacing='0px';withSeed(7+Number(num),()=>mark([[86,84],[112,84]],9,zpal[Number(num)-1][3],{prof:'even'}));ctx.fillStyle=INK;ctx.font='500 52px "Cormorant Garamond"';ctx.fillText(title,82,146);ctx.font='italic 500 28px "Cormorant Garamond"';ctx.fillText(sub,86,184);ctx.restore()}
 const f=fade(t,11.4,70.2,.8,.6);if(f>0){ctx.save();ctx.globalAlpha=f;ctx.textAlign='right';ctx.fillStyle=INK;ctx.font='400 14px "IBM Plex Mono"';ctx.letterSpacing='3px';ctx.fillText('ANNUAL RAINFALL',1836,90);ctx.letterSpacing='0px';const mm=rainval(travel(t));ctx.font='500 54px "Cormorant Garamond"';ctx.fillText(mm<250?'< 250 mm':'≈ '+(mm<1000?Math.round(mm/10)*10:Math.round(mm/100)*100).toLocaleString('en-US')+' mm',1836,146);const u=seg(Math.log(mm),Math.log(100),Math.log(4000));ctx.strokeStyle=rgba(INK,.4);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(1560,176);ctx.lineTo(1836,176);ctx.stroke();ctx.strokeStyle='#3f7fa8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(1560,176);ctx.lineTo(1560+276*u,176);ctx.stroke();for(const m of [100,250,500,1000,4000]){let x=1560+276*seg(Math.log(m),Math.log(100),Math.log(4000));ctx.font='400 11px "IBM Plex Mono"';ctx.fillStyle=rgba(INK,.55);ctx.textAlign='center';ctx.fillText(m,x,201)}ctx.restore()}}
function mist(t){const p=eio(seg(t,70.3,73.6));if(p<=0)return;for(const [extra,alpha] of [[120,.55],[0,1]]){ctx.save();ctx.beginPath();ctx.moveTo(-20,1200);for(let x=-20;x<2000;x+=24)ctx.lineTo(x,1180-p*1400-extra+(vnoise(x*.006+extra)-.5)*160+Math.sin(x*.01+t)*12);ctx.lineTo(2000,1200);ctx.closePath();ctx.clip();ctx.globalAlpha=alpha;ctx.drawImage(paper,0,0);ctx.restore()}}
const project=(lo,la)=>[830+(lo-133.8)*24*Math.cos(26*Math.PI/180),520-(la+27)*24];
const bandColors=['#ce8653','#c5a76c','#aeaf7a','#7f9a6c','#426d56'];
const mapPaint=document.createElement('canvas'),mapStep=3,mapX=350,mapY=100;
mapPaint.width=Math.ceil(1030/mapStep);mapPaint.height=Math.ceil(850/mapStep);
const mapBrush=mapPaint.getContext('2d'),mapPixels=mapBrush.createImageData(mapPaint.width,mapPaint.height);
const mapRGB=bandColors.map(h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16))),mapStops=[250,500,900,1500].map(Math.log);
function pigmentNoise(x,y,scale){const xx=x/scale,yy=y/scale,ix=Math.floor(xx),iy=Math.floor(yy),u=ss(xx-ix),v=ss(yy-iy);const n=(a,b)=>hash(a*127.1+b*311.7);return lerp(lerp(n(ix,iy),n(ix+1,iy),u),lerp(n(ix,iy+1),n(ix+1,iy+1),u),v)-.5}
function prepareMap(){mapPath=new Path2D();withSeed(2199,()=>{for(const ring of AUS){const points=ring.map(([lo,la])=>project(lo,la));points.forEach(([x,y],i)=>i?mapPath.lineTo(x,y):mapPath.moveTo(x,y));mapPath.closePath();for(let i=0;i<points.length-1;i+=24){let pts=points.slice(i,i+25);if(pts.length>1)coasts.push(mk(pts,3,INK,{a:.8,nb:3,prof:'even',rough:.3}))}}});
 const stations=RAIN_STATIONS.map(([lo,la,r])=>[...project(lo,la),Math.log(r)]),test=document.createElement('canvas').getContext('2d');
 for(let j=0;j<mapPaint.height;j++)for(let i=0;i<mapPaint.width;i++){const x=mapX+(i+.5)*mapStep,y=mapY+(j+.5)*mapStep;if(!test.isPointInPath(mapPath,x,y))continue;let sw=0,sv=0;for(const [sx,sy,v] of stations){const d=(sx-x)**2+(sy-y)**2+30,w=1/(d*d);sw+=w;sv+=w*v}
 // A continuous pigment field: overlapping irregular pools plus fine sediment,
 // sampled once per output pixel. No translucent rectangle overlap or grid seams.
 const pool=pigmentNoise(x,y,38)*1.18+pigmentNoise(x+113,y-71,15)*.48+pigmentNoise(x,y,5)*.14;
 const grain=pigmentNoise(x-21,y+44,3.1)*.12+pigmentNoise(x,y,11)*.08;
 mapCells.push({x,y,log:sv/sw,rough:pool,grain,alpha:.76+pigmentNoise(x,y,24)*.22+pigmentNoise(x,y,4)*.12,idx:(j*mapPaint.width+i)*4,rad:Math.hypot(x-830,y-520)+pigmentNoise(x,y,25)*95})}
 const eligible=mapCells.filter(q=>q.log>Math.log(480)&&q.log<Math.log(950));
 for(let i=0;i<26;i++)mapFires.push({...eligible[Math.floor(hash(i*17.31+817)*eligible.length)],phase:hash(i*29.17+20)*6});
}
function paintRainfall(tau,rad){const pixels=mapPixels.data;pixels.fill(0);for(const q of mapCells){const wet=ss(seg(rad-q.rad,-18,22));if(wet<=0)continue;const v=q.log+2.45*(1-tau)+q.rough;let b=0;while(b<4&&v>mapStops[b])b++;let col=mapRGB[b];for(let n=0;n<4;n++){const blend=ss(seg(v,mapStops[n]-.115,mapStops[n]+.115));if(v>mapStops[n]-.115&&v<mapStops[n]+.115){col=mapRGB[n].map((c,k)=>lerp(c,mapRGB[n+1][k],blend));break}}
 const a=q.idx,sediment=1+q.grain;pixels[a]=Math.min(255,col[0]*sediment);pixels[a+1]=Math.min(255,col[1]*sediment);pixels[a+2]=Math.min(255,col[2]*sediment);pixels[a+3]=255*q.alpha*wet}
 mapBrush.putImageData(mapPixels,0,0);ctx.save();ctx.clip(mapPath);ctx.imageSmoothingEnabled=true;ctx.filter='blur(1.3px)';ctx.drawImage(mapPaint,mapX,mapY,mapPaint.width*mapStep,mapPaint.height*mapStep);ctx.filter='none';ctx.globalAlpha*=.12;ctx.drawImage(mapPaint,mapX-.8,mapY+.6,mapPaint.width*mapStep,mapPaint.height*mapStep);ctx.restore()
}
function deepTime(t){return t<79.4?1:t<80.8?1-eio(seg(t,79.4,80.8)):t<86.2?0:eio(seg(t,86.2,95))}
function mapStage(t){if(t<73.3)return;const tau=deepTime(t),off=90*(1-tau),f=(1-.7*ss(seg(t,101,103.2)))*(1-ss(seg(t,112.4,113.6)));ctx.save();ctx.translate(0,off);ctx.globalAlpha=f;
 const reveal=eio(seg(t,75.6,78.2)),rad=lerp(-120,1100,reveal);paintRainfall(tau,rad);for(let i=0;i<coasts.length;i++)drawS(ctx,coasts[i],clamp(seg(t,73.3,76.4)*coasts.length-i),null,f);
 // The final ink contour remains above the migrating washes, including deep time.
 if(t>=76.4){ctx.save();ctx.strokeStyle=rgba(INK,.78);ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.stroke(mapPath);ctx.restore()}

 if(t>89.2&&t<95.5)withSeed(70,()=>{for(let i=0;i<mapFires.length;i++){const q=mapFires[i],ph=q.phase,ff=ss(seg(t,89.4+ph*.25,90+ph*.25))*(1-ss(seg(t,93.6+ph*.2,94.6+ph*.2)));if(ff<=0)continue;const h=40*ff*(.8+.2*Math.sin(t*8+ph)),x=q.x,y=q.y+6;mark(qcurve(x-3,y,x+Math.sin(t*9+ph)*6,y-h,-5,10),9,'#c66b2e',{prof:'tip',a:.85});mark(qcurve(x+2,y,x-3,y-h*.66,3,8),4.5,'#e2a044',{prof:'tip',a:.9})}});
 ctx.restore();
 const route=fade(t,76.8,79.6,.5,.6);if(route>0){ctx.save();ctx.globalAlpha=route;const a=project(131.04,-25.34),b=project(145.4,-16.2),pr=seg(t,76.8,78.8);ctx.setLineDash([4,5]);ctx.lineWidth=2;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(...a);ctx.quadraticCurveTo(920,350,lerp(a[0],b[0],pr),lerp(a[1],b[1],pr));ctx.stroke();ctx.setLineDash([]);handwriting('desert',a[0]-22,a[1]+34,seg(t,76.8,77.6),26);handwriting('our walk',915,350,seg(t,77.4,78.4),32);handwriting('rainforest',b[0]+24,b[1]-4,seg(t,78.4,79.1),26);ctx.restore()}
 const rf=fade(t,76.2,101.4,.8,.7);if(rf>0){ctx.save();ctx.globalAlpha=rf;ctx.textAlign='left';ctx.fillStyle=INK;const n=Math.round(50*(1-tau));ctx.font=(n?'500 150px':'italic 500 104px')+' "Cormorant Garamond"';ctx.fillText(n||'today',1420,330);if(n){ctx.font='italic 500 34px "Cormorant Garamond"';ctx.fillText('million years ago',1426,408)}ctx.font='400 14px "IBM Plex Mono"';ctx.letterSpacing='3px';ctx.fillText('ANNUAL RAINFALL',1424,560);ctx.letterSpacing='0px';const labs=['< 250 mm','250 – 500','500 – 900','900 – 1500','> 1500'];for(let i=0;i<5;i++){let p=seg(t,77+i*.18,77.5+i*.18);withSeed(90+i,()=>{mark([[1424,600+i*40],[1424+44*eo(p),600+i*40]],16,bandColors[i],{prof:'even'})});ctx.fillStyle=INK;ctx.font='400 17px "IBM Plex Mono"';ctx.fillText(labs[i],1490,606+i*40)}ctx.font='italic 400 20px "Cormorant Garamond"';ctx.fillText('schematic, from long-term averages',1424,820);ctx.restore()}
 if(t>86.8&&t<94.5){ctx.save();ctx.globalAlpha=fade(t,86.8,94.5,.6,.8);ctx.strokeStyle=rgba(INK,.75);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(1300,640);ctx.lineTo(1300,530);ctx.moveTo(1292,540);ctx.lineTo(1300,530);ctx.lineTo(1308,540);ctx.stroke();handwriting('drifting north',1318,580,seg(t,87.2,88.4),30);ctx.restore()}
 if(t>97.3&&t<101.4){ctx.save();ctx.globalAlpha=fade(t,97.3,101.4,.3,.6);for(const [label,xy,dx,dy,a]of [['dry heart',project(133.3,-24.8),-280,-110,97.5],['green edge',project(147.6,-20.4),75,-146,98.7]]){const [x,y]=xy;let p=seg(t,a-.1,a+.4);ctx.strokeStyle=rgba(INK,.7);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+dx*.3,y+dy*.6,x+dx*p,y+dy*p);ctx.stroke();handwriting(label,x+dx,y+dy-8,seg(t,a,a+.8),42)}ctx.restore()}
}
function titleBlock(t,start,y,alpha,closing=false){if(alpha<=0)return;const p=eio(seg(t,start,start+1.6));ctx.save();ctx.globalAlpha=alpha;ctx.textAlign='center';ctx.fillStyle=INK;ctx.font=`italic 500 ${closing?118:124}px "Cormorant Garamond"`;const w=ctx.measureText('Follow the Rain').width;ctx.save();ctx.beginPath();ctx.rect(960-w/2-20,y-150,(w+40)*p,190);ctx.clip();ctx.fillText('Follow the Rain',960,y);ctx.restore();ctx.globalAlpha=alpha*ss(seg(t,start+1,start+1.8));ctx.font='500 25px "Cormorant Garamond"';ctx.letterSpacing='7px';ctx.fillText('AUSTRALIA’S VEGETATION, FROM DRY HEART TO GREEN EDGE',966,y+72);ctx.globalAlpha=alpha*ss(seg(t,start+1.4,start+2.2));ctx.letterSpacing='6px';ctx.font='400 26px "Noto Serif SC"';ctx.fillText('跟着雨走 · 澳洲植被图卷',963,y+122);ctx.letterSpacing='0px';ctx.restore()}
function subtitles(t){for(const q of SPEECH){const a=fade(t,q.start-.15,q.start+q.duration+.45,.25,.35);if(a<=0)continue;ctx.save();ctx.globalAlpha=a*.82;ctx.textAlign='center';ctx.font='italic 500 36px "Cormorant Garamond"';ctx.fillStyle=INK;ctx.shadowColor=PAPER;ctx.shadowBlur=18;const words=q.caption.split(' '),lines=[''];for(const w of words){let last=lines.length-1;if(ctx.measureText(lines[last]+w).width>1400)lines.push('');lines[lines.length-1]+=(lines[lines.length-1]?' ':'')+w}const base=lines.length>1?962:1000;for(let j=0;j<lines.length;j++){ctx.fillText(lines[j],960,base+j*38);ctx.fillText(lines[j],960,base+j*38)}ctx.font='400 24px "Noto Serif SC"';ctx.fillText(q.caption_zh,960,1042);ctx.fillText(q.caption_zh,960,1042);ctx.restore()}}
function render(t){paperBase(); if(t<70.5){ctx.save();ctx.globalAlpha=ss(seg(t,1.6,2.2))*(1-ss(seg(t,40,50))*.65);withSeed(3,()=>{ctx.save();ctx.beginPath();ctx.arc(1464,330,61,0,Math.PI*2);ctx.clip();for(let i=0;i<6;i++)mark(qcurve(1395,275+i*22,1535,275+i*22,0,18),39,'#cf4f2c',{prof:'even',a:.78,rough:.08});for(let i=0;i<7;i++)mark(qcurve(1390,292+i*12,1540,292+i*12,0,12),2.5,'#b8401f',{a:.38,prof:'even'});ctx.restore()});ctx.restore()}
if(t<73.6){ctx.save();const reveal=t<13.2?lerp(-150,2100,seg(t,10.2,13.2)):2200;ctx.beginPath();ctx.moveTo(-100,-1500);for(let y=-1500;y<2300;y+=30)ctx.lineTo(reveal+Math.sin(y*.025)*20,y);ctx.lineTo(-100,2300);ctx.closePath();ctx.clip();landscapeBase(t);for(const q of plants)renderPlant(q,t);nature(t);effects(t);annotations(t);ctx.restore();
 withSeed(399,()=>{let a=t<10.8?1:1-ss(seg(t,10.8,14));if(a>0){ctx.save();ctx.globalAlpha=a;drawS(ctx,mk(qcurve(0,745,1920,745,-4,45),4.3,INK2,{prof:'even',a:.65}),eio(seg(t,.5,2.8)));ctx.restore()}});

 topMatter(t);if(t<11)titleBlock(t,2.3,440,1-ss(seg(t,9.9,10.9)));mist(t)}
 mapStage(t);if(t>101.6){const a=1-ss(seg(t,112.4,113.4));titleBlock(t,101.9,480,a,true);ctx.save();ctx.globalAlpha=a*ss(seg(t,105,106.2));ctx.textAlign='center';ctx.fillStyle=INK;ctx.font='400 15px "IBM Plex Mono"';ctx.fillText('MUSIC  Newly composed acoustic score  ·  Original musical direction: “Wildflowers”',960,930);ctx.fillText('VOICE  Fresh Kokoro TTS   ·   COASTLINE  Natural Earth   ·   RAINFALL BANDS ARE SCHEMATIC',960,960);ctx.font='italic 500 30px "Cormorant Garamond"';ctx.fillText('GPT-6.1 Sol · reference-matched recreation',960,1010);ctx.restore()}
 subtitles(t);ctx.globalAlpha=1;
}
window.render=render;
(async()=>{paper=new Image();paper.src='paper.jpg';await paper.decode();await Promise.all(['500 52px "Cormorant Garamond"','italic 500 36px "Cormorant Garamond"','500 32px Caveat','400 15px "IBM Plex Mono"','400 24px "Noto Serif SC"'].map(s=>document.fonts.load(s,'Aa跟着雨走')));buildGarden();prepareMap();window.READY=true;render(0)})();
