// Independently drawn stamped pastry face; room's generic prop now depends on this asset, not an upstream shot.
import {text} from './paper.js';
export function cakeFace(x,r,kind='color',o={}){
 const bump=kind==='bump',base=bump?'#777':o.base||'#d49b4b',hi=bump?'#eee':o.hi||'#ffdc8e',lo=bump?'#333':o.lo||'#a76b2e';
 x.save();x.fillStyle=base;x.strokeStyle=hi;x.lineWidth=r*.035;x.beginPath();
 for(let i=0;i<=240;i++){let a=i/240*Math.PI*2,rr=r*(1-.043*(1+Math.cos(a*16)));let px=Math.cos(a)*rr,py=Math.sin(a)*rr;i?x.lineTo(px,py):x.moveTo(px,py);}x.closePath();x.fill();x.stroke();
 for(let q of [.72,.68,.29,.25]){x.beginPath();x.strokeStyle=q===.68?lo:hi;x.lineWidth=r*.023;x.arc(0,0,r*q,0,Math.PI*2);x.stroke();}
 for(let i=0;i<16;i++){let a=(i+.5)*Math.PI/8;x.strokeStyle=lo;x.lineWidth=r*.023;x.beginPath();x.moveTo(Math.cos(a)*r*.77,Math.sin(a)*r*.77);x.lineTo(Math.cos(a)*r*.94,Math.sin(a)*r*.94);x.stroke();}
 for(let i=0;i<8;i++){let a=i*Math.PI/4;x.save();x.rotate(a);x.translate(0,r*.48);x.fillStyle=hi;x.beginPath();x.moveTo(0,-r*.12);x.quadraticCurveTo(-r*.1,r*.01,0,r*.13);x.quadraticCurveTo(r*.1,r*.01,0,-r*.12);x.fill();x.restore();}
 for(let i=0;i<60;i++){let a=i*Math.PI/30;x.fillStyle=hi;x.beginPath();x.arc(Math.cos(a)*r*.33,Math.sin(a)*r*.33,r*.012,0,Math.PI*2);x.fill();}
 const ch=o.char??'圆';if([...ch].length>1){text(x,[...ch][0],0,r*.075,r*.20,'"MaShanZheng"',{fill:hi});text(x,[...ch][1],0,-r*.12,r*.20,'"MaShanZheng"',{fill:hi});}else text(x,ch,0,0,r*.38,'"MaShanZheng"',{fill:hi});x.restore();
}
