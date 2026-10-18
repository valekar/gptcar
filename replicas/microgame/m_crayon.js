// Attributed MIT generic medium engine and character/isolated prop models. Complete original game scene excluded.
// 蜡笔绘本画风（向 crayon-book 学：蜡只沾在纸牙上、RGB=颜色 A=压力、靛蓝描边不用黑、来回排线涂出界、12fps 线条沸腾）——自写简化版
import { pass, canvas } from './glpass.js';
import { mulberry, vnoise, clamp } from '/core/lib.js';
const TAU = Math.PI * 2;
export const [crC, cx] = canvas();
export const CR = { ink: '#2d3263', yel: '#f5c63c', org: '#ec8a3c', red: '#d4483c', pink: '#ee8ea4', peach: '#f4c7a4', brown: '#7a4b31', ochre: '#e7b867', green: '#62a24c', sky: '#79acd9', violet: '#6a5aa6', white: '#fbfaf4' };
let BOIL = 0;   // 沸腾种子（每 2 帧换）
export function clearCrayon(boil = 0) { cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, 1920, 1080); BOIL = boil; }
const rgba = (hex, a) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${clamp(a)})`;
// 手抖描边：沿折线加低频法向抖动，宽度 ±15%，两端收笔
export function cline(pts, o = {}) {
  const w = o.w || 7, col = o.col || CR.ink, pr = o.p ?? .82, seed = (o.seed || 1) + BOIL * 17;
  const P = []; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 6)); for (let k = 0; k < n; k++) P.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
  P.push(pts[pts.length - 1]);
  const N = P.length, draw = o.draw ?? 1, M = Math.max(2, Math.floor(N * draw));
  const off = i => { const a = P[Math.max(0, i - 1)], b = P[Math.min(N - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; const j = (vnoise(i * .09 + seed) - .5) * 3.4; return [P[i][0] - dy / d * j, P[i][1] + dx / d * j]; };
  cx.save(); cx.lineCap = 'round'; cx.lineJoin = 'round';
  for (let pass2 = 0; pass2 < 2; pass2++) {
    cx.beginPath();
    for (let i = 0; i < M; i++) { const [x, y] = off(i); const q = pass2 ? [x + (vnoise(i * .3 + seed + 9) - .5) * 2, y + (vnoise(i * .3 + seed + 5) - .5) * 2] : [x, y]; i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); }
    cx.strokeStyle = rgba(col, pr * (pass2 ? .55 : .95)); cx.lineWidth = w * (pass2 ? .45 : 1) * (1 + .15 * (vnoise(seed) - .5)); cx.stroke();
  }
  cx.restore();
}
export function cpoly(pts, o = {}) { cline([...pts, pts[0]], o); }
export function circlePts(x, y, rx, ry = rx, n = 40, a0 = 0) { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + i / n * TAU; p.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry]); } return p; }
// 来回排线上色：裁剪到（放大一点的）形状里，涂出界 0–7px
export function hatch(pathPts, o = {}) {
  const col = o.col || CR.yel, pr = o.p ?? .74, gap = o.gap || 10.5, ang = o.ang ?? -.6, seed = (o.seed || 1) + BOIL * 13;
  const xs = pathPts.map(p => p[0]), ys = pathPts.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const grow = 1 + 6 / Math.max(20, (x1 - x0));
  cx.save(); cx.beginPath(); pathPts.forEach((p, i) => { const q = [mx + (p[0] - mx) * grow, my + (p[1] - my) * grow]; i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); }); cx.closePath(); cx.clip();
  cx.translate(mx, my); cx.rotate(ang);
  const R = Math.hypot(x1 - x0, y1 - y0) / 2 + 10, r = mulberry(seed * 31 + 7);
  cx.lineCap = 'round'; cx.lineJoin = 'round';
  const passes = o.cross ? 2 : 1;
  for (let ps = 0; ps < passes; ps++) {
    if (ps) cx.rotate(1.2);
    cx.beginPath(); let k = 0;
    for (let y = -R; y <= R; y += gap * (ps ? 1.4 : 1), k++) { const j = (r() - .5) * 3; if (k % 2) { cx.lineTo(R, y + j); } else { cx.lineTo(-R, y + j); } }
    cx.strokeStyle = rgba(col, pr * (ps ? .45 : .72 + r() * .4)); cx.lineWidth = (o.lw || 11) * .82; cx.stroke();
  }
  cx.restore();
}
export function cfill(pathPts, col, o = {}) { hatch(pathPts, { col, ...o }); }
// 前面的东西擦掉后面的蜡（小孩先画人物，再绕着涂背景）
export function knock(pts) { cx.save(); cx.globalCompositeOperation = 'destination-out'; cx.beginPath(); pts.forEach((p, i) => i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1])); cx.closePath(); cx.fillStyle = '#000'; cx.fill(); cx.restore(); }
export function print(g, o = {}) {
  const out = pass('crayon', crC, { pageOff: o.off || [0, 0], pageScale: o.scale || 1, layer: o.layer ? 1 : 0 });
  g.drawImage(out, 0, 0);
}
export function ctext(txt, x, y, size, col, rot = 0, pr = .95) {
  cx.save(); cx.translate(x, y); cx.rotate(rot); cx.font = `${size}px Gochi`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillStyle = rgba(col, pr); cx.fillText(txt, 0, 0); cx.restore();
}

// ───────── 蜡笔版 Dot（儿童画比例：头盔很大、手是圆、脚是椭圆）(x,y)=脚底，s=缩放 ─────────
export function cadetCrayon(x, y, s = 1, o = {}) {
  const k = s, P = (px, py) => [x + px * k, y + py * k], face = o.face || 'smile';
  const hy = -210, R = 92;
  // 天线 + 球
  const aw = o.ant || 0;
  cline([P(0, hy - R), P(4 + aw * 10, hy - R - 30), P(aw * 24, hy - R - 58)], { w: 6 * k, seed: 2 });
  const ball = circlePts(...P(aw * 24, hy - R - 76), 18 * k);
  cfill(ball, CR.org, { gap: 8 * k, lw: 9 * k, seed: 3 }); cline(ball, { w: 6 * k, seed: 4 });
  // 背包
  const bp = [P(-104, -170), P(104, -170), P(108, -58), P(-108, -58)];
  cfill(bp, CR.org, { seed: 5, gap: 10 * k, lw: 11 * k }); cpoly(bp, { w: 7 * k, seed: 6 });
  // 身体（白 = 纸，只有描边 + 淡淡的灰紫排线阴影）
  const body = [P(-78, -150), P(78, -150), P(88, -40), P(-88, -40)];
  knock(body);
  hatch(body, { col: CR.white, p: .9, seed: 7, gap: 9 * k, lw: 11 * k });
  hatch([P(40, -148), P(78, -150), P(88, -40), P(50, -40)], { col: CR.violet, p: .35, seed: 8, gap: 12 * k, lw: 8 * k });
  cpoly(body, { w: 7 * k, seed: 9 });
  // 05
  ctext('05', ...P(-8, -88), 58 * k, CR.red, -.06);
  // 腿 + 靴
  for (const sx of [-1, 1]) {
    const leg = [P(sx * 52 - 22, -42), P(sx * 52 + 22, -42), P(sx * 52 + 22, -18), P(sx * 52 - 22, -18)];
    cpoly(leg, { w: 6 * k, seed: 10 + sx });
    const boot = circlePts(...P(sx * 58, -8), 36 * k, 16 * k, 30);
    cfill(boot, CR.org, { seed: 12 + sx, gap: 8 * k, lw: 9 * k }); cline(boot, { w: 7 * k, seed: 14 + sx });
  }
  // 手臂 + 圆手
  const arms = o.arms || [[-1, -140, -130, -92], [1, 140, -130, -92]];
  for (const [sx, hx, hy2, sy] of arms) {
    cline([P(sx * 76, sy - 40), P(hx, hy2)], { w: 7 * k, seed: 16 + sx });
    cline([P(sx * 76, sy - 10), P(hx + (hx > 0 ? -6 : 6), hy2 + 24)], { w: 7 * k, seed: 18 + sx });
    const hand = circlePts(...P(hx, hy2 + 12), 20 * k);
    cfill(hand, CR.org, { seed: 20 + sx, gap: 8 * k, lw: 9 * k }); cline(hand, { w: 6 * k, seed: 22 + sx });
  }
  // 头盔：大圆，淡天蓝轻压（只沾纸牙峰）
  const helm = circlePts(...P(0, hy), R * k);
  cfill(helm, CR.sky, { p: .38, seed: 24, gap: 12 * k, lw: 10 * k });
  // 脸
  const facep = circlePts(...P(0, hy + 10), 62 * k, 58 * k);
  knock(facep);
  cfill(facep, CR.peach, { p: .85, seed: 25, gap: 9 * k, lw: 11 * k }); cline(facep, { w: 5 * k, seed: 26, col: CR.brown, p: .8 });
  // 头发：扇贝刘海
  const hair = []; for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; hair.push(P(Math.cos(a) * 64, hy + 4 + Math.sin(a) * 60 + (i % 2 ? 14 : 0))); }
  cfill(hair, CR.brown, { seed: 27, gap: 8 * k, lw: 10 * k }); cline(hair, { w: 5 * k, seed: 28, col: CR.brown });
  const bun = circlePts(...P(0, hy - 62), 24 * k, 16 * k);
  cfill(bun, CR.brown, { seed: 29, gap: 8 * k, lw: 9 * k });
  // 眼睛（点点 + 白蜡高光）+ 腮红 + 嘴
  for (const sx of [-1, 1]) {
    if (face === 'yay') cline([P(sx * 24 - 10, hy + 16), P(sx * 24, hy + 6), P(sx * 24 + 10, hy + 16)], { w: 6 * k, seed: 30 + sx });
    else { const e = circlePts(...P(sx * 24, hy + 12), 8 * k); cfill(e, CR.ink, { p: 1, seed: 31 + sx, gap: 5 * k, lw: 8 * k }); }
    const ch = circlePts(...P(sx * 38, hy + 34), 11 * k, 8 * k); cfill(ch, CR.pink, { p: .7, seed: 33 + sx, gap: 7 * k, lw: 8 * k });
  }
  if (face === 'yay' || face === 'smile') { const m = []; for (let i = 0; i <= 10; i++) { const a = .2 + i / 10 * (Math.PI - .4); m.push(P(Math.cos(a) * 18, hy + 36 + Math.sin(a) * (face === 'yay' ? 16 : 10))); } cline(m, { w: 5 * k, seed: 35, col: CR.red }); }
  if (face === 'effort') { cline([P(-14, hy + 42), P(14, hy + 40)], { w: 5 * k, seed: 35, col: CR.red }); }
  // 头盔轮廓 + 两道白蜡反光
  cline(helm, { w: 7 * k, seed: 36 });
  const hl = []; for (let i = 0; i <= 8; i++) { const a = Math.PI * 1.1 + i / 8 * .5; hl.push(P(Math.cos(a) * (R - 16), hy + Math.sin(a) * (R - 16))); }
  cline(hl, { w: 8 * k, col: CR.white, seed: 37 });
  // 领圈
  const col = circlePts(...P(0, hy + R - 2), 58 * k, 12 * k, 30);
  cfill(col, CR.sky, { seed: 38, gap: 8 * k, lw: 9 * k, p: 1 }); cline(col, { w: 6 * k, seed: 39 });
  return { ball: P(aw * 24, hy - R - 76) };
}
export function testCadet(g, t) { clearCrayon(0); cadetCrayon(700, 1000, 2.3); cadetCrayon(1400, 1000, 1.2, { face: 'yay', ant: .5 }); print(g); }

