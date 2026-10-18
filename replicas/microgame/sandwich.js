// Attributed MIT isolated sandwich model; no catch scene.
import {ink} from './m_riso.js'; const TAU=Math.PI*2;
export function sandwich(g, x, y, rot, bite = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  const tri = (gg, s) => { gg.moveTo(-90 * s, 50 * s); gg.lineTo(90 * s, 50 * s); gg.lineTo(-60 * s, -80 * s); gg.closePath(); };
  const f = (fn, b, yy, p, over) => { g.save(); if (over) g.globalCompositeOperation = 'lighter'; g.beginPath(); fn(g); g.fillStyle = ink(b, yy, p); g.fill(); g.restore(); };
  f(gg => { gg.save(); gg.translate(0, 16); tri(gg, 1.02); gg.restore(); }, 0, .7, .2);          // 下层面包
  f(gg => { gg.save(); gg.translate(4, 4); tri(gg, 1.06); gg.restore(); }, .7, 1, 0);             // 生菜 = 黄 + 蓝（叠印出绿）
  f(gg => { gg.save(); gg.translate(-2, -4); tri(gg, 1.0); gg.restore(); }, 0, 0, 1);             // 火腿
  f(gg => { gg.save(); gg.translate(0, -18); tri(gg, 1.0); gg.restore(); }, 0, .7, .2);         // 上层面包
  f(gg => { gg.save(); gg.translate(0, -18); tri(gg, .8); gg.restore(); }, 0, .35, .05);
  if (bite) { g.save(); g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(70 - i * 26, 30 - i * 34, 34, 0, TAU); g.fill(); } g.restore(); }
  g.restore();
}
