// Isolated generic atomic TV lettering helper; LemoLab MIT.
import{TAU}from'/core/lib.js';import{INK,push,pop,translate,rotate,scale,shape,stroke,ell,arc,text}from'./toon.js';
export function titleArt(t, big = 1) {
  // 片名：50 年代原子时代电视片头——奶油色块状字 + 品红硬投影 + 青色轨道环，一颗咖啡豆绕字飞行（不用荧光绿、不做滴液，避开原作 logo 的联想）
  const k = big, orb = t * 1.6, rx = 560 * k, ry = 92 * k;
  const ring = (a0, a1, lw) => { const P = arc(0, 6 * k, rx, ry, a0, a1, 40); stroke(P, lw + 12, { boil: .5 }); stroke(P, lw, { line: '#5ee6ff', boil: .5 }); };
  const bean = () => { const bx = Math.cos(orb) * rx, by = 6 * k + Math.sin(orb) * ry; push(); translate(bx, by); rotate(orb + 1.2);
    shape(ell(0, 0, 26 * k, 18 * k), { fill: '#8a4b2a', lw: 6 }); stroke([[-18 * k, 3 * k], [0, -3 * k], [18 * k, 3 * k]], 4); pop(); };
  rotate(-.05);
  push(); rotate(.12); ring(Math.PI, TAU, 9 * k); if (Math.sin(orb) < 0) bean(); pop();   // 环的后半圈在字后面
  text('COFFEE RUN', 12 * k, 12 * k, { font: `400 ${150 * k}px Bungee`, fill: '#ff4fa3', outlineW: 22, outlineCol: INK });
  text('COFFEE RUN', 0, 0, { font: `400 ${150 * k}px Bungee`, fill: '#fff3d6', outlineW: 22, outlineCol: INK });
  push(); rotate(.12); ring(0, Math.PI, 9 * k); if (Math.sin(orb) >= 0) bean(); pop();   // 前半圈压在字上
  for (let i = 0; i < 4; i++) {   // 四角星闪
    const x = [-600, 610, -420, 470][i] * k, y = [-110, -95, 120, 118][i] * k, r = (16 + 10 * Math.sin(t * 5 + i * 1.7)) * k;
    shape([[x, y - r], [x + r * .28, y - r * .28], [x + r, y], [x + r * .28, y + r * .28], [x, y + r], [x - r * .28, y + r * .28], [x - r, y], [x - r * .28, y - r * .28]], { fill: '#ffe066', lw: 5 });
  }
}
