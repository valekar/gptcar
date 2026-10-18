// Attributed MIT generic medium engine and character/isolated prop models. Complete original game scene excluded.
// 蓝图画风（向 blueprint 学：晒图蓝纸、淡蓝白线四档线宽、中心线/隐藏线虚线、尺寸线与手写标注、一枚红章只用一次）——自写简化版
import { staticTex } from './glpass.js';
import { clamp } from '/core/lib.js';
const TAU = Math.PI * 2;
export const LINE = '#e7f0f9', RED = '#c23b2e';
export const WT = { out: 4.2, det: 2.6, thin: 1.6, hair: 1.1 };
export function paper(g) { g.drawImage(staticTex('blueprint', { seed: 4.2 }), 0, 0); }
let DRAW = 1;   // 全局"画到哪"（0..1），给逐笔出线用
export function setDraw(d) { DRAW = d; }
// 画一条折线/曲线（按弧长截断 = 出线）
export function bl(g, pts, w = WT.det, o = {}) {
  let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  const lim = L * clamp(o.draw ?? DRAW);
  g.save(); g.strokeStyle = o.col || LINE; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; if (o.dash) g.setLineDash(o.dash);
  g.shadowColor = 'rgba(231,240,249,.35)'; g.shadowBlur = 2;
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); let acc = 0;
  for (let i = 1; i < pts.length; i++) { if (acc + seg[i - 1] <= lim) { g.lineTo(pts[i][0], pts[i][1]); acc += seg[i - 1]; } else { const u = (lim - acc) / seg[i - 1]; g.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u); break; } }
  g.stroke(); g.restore();
}
export const arcPts = (x, y, rx, ry = rx, a0 = 0, a1 = TAU, n = 64) => { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry]); } return p; };
export const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
export function rrPts(x, y, w, h, r) { const p = []; const c = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]]; for (const [cx, cy, a] of c) for (let i = 0; i <= 8; i++) { const t = a + i / 8 * Math.PI / 2; p.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); } p.push(p[0]); return p; }
// 纸色填充（遮挡：先用纸色填再描线）
export function occlude(g, pts, col = 'rgba(28,62,125,1)') { g.save(); g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip(); paper(g); g.restore(); }
export function label(g, txt, x, y, size = 30, o = {}) {
  g.save(); g.font = `${size}px Arch`; g.fillStyle = o.col || LINE; g.textAlign = o.align || 'left'; g.textBaseline = 'middle';
  const n = Math.floor(txt.length * clamp(o.draw ?? DRAW)); g.fillText(txt.slice(0, n), x, y); g.restore();
}
// 尺寸线：两端箭头 + 延伸线 + 文字
export function dim(g, x0, y0, x1, y1, txt, o = {}) {
  const off = o.off || 0, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const a = [x0 + nx * off, y0 + ny * off], b = [x1 + nx * off, y1 + ny * off];
  bl(g, [[x0, y0], [a[0] + nx * 10, a[1] + ny * 10]], WT.hair); bl(g, [[x1, y1], [b[0] + nx * 10, b[1] + ny * 10]], WT.hair);
  bl(g, [a, b], WT.hair);
  const ah = (p, s) => { const ux = dx / L * s, uy = dy / L * s; g.save(); g.fillStyle = LINE; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] + ux * 16 + nx * 5, p[1] + uy * 16 + ny * 5); g.lineTo(p[0] + ux * 16 - nx * 5, p[1] + uy * 16 - ny * 5); g.fill(); g.restore(); };
  if ((o.draw ?? DRAW) > .5) { ah(a, 1); ah(b, -1); }
  g.save(); g.translate((a[0] + b[0]) / 2 + nx * 18, (a[1] + b[1]) / 2 + ny * 18); let ang = Math.atan2(dy, dx); if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI; g.rotate(ang);
  label(g, txt, 0, 0, o.size || 26, { align: 'center' }); g.restore();
}
export function stamp(g, txt, x, y, s = 1, rot = -.12, a = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha = a;
  g.strokeStyle = RED; g.fillStyle = RED; g.lineWidth = 7; g.beginPath(); g.roundRect(-150, -60, 300, 120, 14); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.roundRect(-138, -48, 276, 96, 8); g.stroke();
  g.font = '84px Titan'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 6);
  g.restore();
}
// ───────── 蓝图版 Dot：正视工程图 (x,y)=脚底，s=缩放；d = 出线进度 ─────────
export function cadetBlue(g, x, y, s = 1, o = {}) {
  const d = o.draw ?? 1; setDraw(d);
  g.save(); g.translate(x, y); g.scale(s, s);
  const W = WT, k = 1 / s;
  // 中心线
  bl(g, [[0, -330], [0, 20]], W.hair * k, { dash: [34 * k, 7 * k, 6 * k, 7 * k] });
  // 背包（隐藏线）
  bl(g, rrPts(-64, -140, 128, 96, 16), W.thin * k, { dash: [11 * k, 7 * k] });
  // 身体
  bl(g, rrPts(-54, -124, 108, 84, 22), W.out * k);
  bl(g, rectPts(-58, -66, 116, 14), W.det * k);
  bl(g, rrPts(-20, -112, 40, 30, 6), W.det * k);
  // 拉链（虚线）
  bl(g, [[0, -122], [0, -68]], W.thin * k, { dash: [5 * k, 5 * k] });
  for (const sx of [-1, 1]) {
    bl(g, rrPts(sx * 24 - 17, -56, 34, 40, 10), W.det * k);
    bl(g, rrPts(sx * 24 - 22, -22, 44, 24, 11), W.out * k);
    bl(g, rrPts(sx * 72 - 14, -120, 28, 62, 14), W.det * k);
    bl(g, arcPts(sx * 72, -52, 15), W.det * k);
  }
  bl(g, arcPts(0, -124, 50, 15), W.det * k);
  bl(g, arcPts(0, -178, 62), W.out * k);
  bl(g, arcPts(0, -178, 55, 55, Math.PI * 1.05, Math.PI * 1.45, 20), W.thin * k);
  bl(g, arcPts(0, -172, 42), W.thin * k);
  bl(g, [[-60, -178], [60, -178]], W.hair * k, { dash: [34 * k, 7 * k, 6 * k, 7 * k] });
  for (const sx of [-1, 1]) bl(g, arcPts(sx * 17, -176, 6), W.thin * k);
  // 天线：弹簧锯齿 + 球
  const sp = [[0, -240]]; for (let i = 1; i <= 8; i++) sp.push([(i % 2 ? 6 : -6), -240 - i * 5]); sp.push([0, -284]);
  bl(g, sp, W.det * k); bl(g, arcPts(0, -296, 13), W.out * k);
  g.restore();
  if (o.labels !== false) {
    const L = (t, x0, y0, x1, y1, al) => { bl(g, [[x0, y0], [x1, y1], [x1 + (al === 'right' ? -60 : 60), y1]], WT.hair); label(g, t, x1 + (al === 'right' ? -66 : 66), y1, 26 * Math.min(1.4, s), { align: al === 'right' ? 'right' : 'left' }); };
    L('ANTENNA, SPRING (1)', x + 14 * s, y - 296 * s, x + 110 * s, y - 330 * s);
    L('HELMET Ø 124', x - 50 * s, y - 210 * s, x - 120 * s, y - 250 * s, 'right');
    L('CADET NO. 05', x + 18 * s, y - 100 * s, x + 130 * s, y - 120 * s);
    L('BOOT (2)', x - 40 * s, y - 10 * s, x - 120 * s, y + 20 * s, 'right');
  }
}
export function testCadet(g, t) { paper(g); cadetBlue(g, 800, 960, 2.6); stamp(g, 'OK', 1500, 800, 1); }

