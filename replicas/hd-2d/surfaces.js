// Isolated generic pixel-surface texture functions, LemoLab MIT; excludes all scene assembly.
import{PX,ramp,h2,fbm,mulberry}from'./px.js';
export function masonry(w, h, o = {}) {   // 石阶/石墙：错缝方石
  const P = new PX(w, h), s = o.seed ?? 1, R = ramp(o.cols ?? ['#121118', '#22212a', '#34323c', '#48454f', '#5e5a63', '#77727a']), bw = o.bw ?? 12, bh = o.bh ?? 6;
  P.fill((x, y) => {
    const row = Math.floor(y / bh), off = row % 2 ? bw >> 1 : 0, col = Math.floor((x + off) / bw), xx = (x + off) % bw, yy = y % bh, id = h2(col, row, s);
    let v = .42 + id * .3 + (fbm(x * .2, y * .2, s) - .5) * .3 - yy / bh * .12;
    if (yy === 0 || xx === 0) v = .07; else if (yy === 1) v += .14; else if (yy === bh - 1 || xx === bw - 1) v -= .12;
    if (o.moss && fbm(x * .1, y * .15, s + 5) > .6 && yy < 3) return ramp(['#101a12', '#1c2c1c', '#2b4028'])(fbm(x * .4, y * .4, s) , x, y);
    return R(v, x, y);
  });
  return P.done();
}
export function rockBig(w, h, o = {}) {   // 大块面低对比岩石：Voronoi 块面 + 块内上亮下暗 + 稀疏裂缝
  const P = new PX(w, h), s = o.seed ?? 1, cell = o.cell ?? 22, R = ramp(o.cols ?? ['#2a2c36', '#343743', '#3f4250', '#4b4f5e', '#575b6a']);
  P.fill((x, y) => {
    const cx = Math.floor(x / cell), cy = Math.floor(y / (cell * .7)); let d1 = 1e9, d2 = 1e9, id = 0, py0 = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const X = cx + i, Y = cy + j, px = (X + .5 + (h2(X, Y, s) - .5) * .8) * cell, py = (Y + .5 + (h2(Y, X, s + 5) - .5) * .8) * cell * .7, d = Math.hypot(x - px, (y - py) * 1.2); if (d < d1) { d2 = d1; d1 = d; id = h2(X, Y, s + 9); py0 = py; } else if (d < d2) d2 = d; }
    let v = .3 + id * .4 + (py0 - y) / cell * .35 + (fbm(x * .08, y * .08, s) - .5) * .15;
    const edge = d2 - d1; if (edge < 1.1 && id > .35) v = .05; else if (edge < 2.2) v -= .12;
    return R(v, x, y);
  });
  return P.done();
}
export function foamCanvas(seed) {   // 崖脚白浪：横向条带，靠岩一侧最密
  const P = new PX(256, 24), F = ramp(['#6a86a8', '#a8c0da', '#e4eef8', '#ffffff']);
  P.fill((x, y) => { const v = 1 - y / 24, n = fbm(x * .08, y * .3, seed, 3), m = n + v * .7 - .7 + (y < 3 ? .25 : 0); if (m < 0 || (m < .12 && h2(x, y, seed) > .5)) return null; return F(Math.min(.99, m * 2.2), x, y); });
  return P.done();
}
export function lensCanvas(lit) {   // 菲涅尔透镜：横向棱纹环
  const P = new PX(48, 40), G = ramp(lit ? ['#8a5a1c', '#e0a040', '#ffe08a', '#fff8e0'] : ['#0e1a20', '#1c3038', '#2e4a52', '#4a6e74', '#8ab0b0']);
  P.fill((x, y) => { const band = y % 5, mid = y > 16 && y < 24; let v = .35 + (band === 1 ? .45 : band === 0 ? -.2 : 0) + (mid ? .15 : 0) + (x % 12 === 0 ? -.25 : 0) + (h2(x >> 1, y, 3) - .5) * .12; return G(v, x, y); });
  return P.done();
}
export function grassCanvas(seed) {
  const P = new PX(16, 12), G = ramp(['#0b140f', '#172618', '#243a22', '#34502e', '#4a6a3c']), R = mulberry(seed);
  for (let b = 0; b < 9; b++) { let x = 2 + R() * 12, lean = (R() - .3) * .6; const hgt = 5 + R() * 7; for (let y = 0; y < hgt; y++) { P.set(Math.round(x), 11 - y, G(.25 + y / hgt * .7, b, y)); x += lean; } }
  return P.done();
}
export function cloudCanvas(seed, w = 256, h = 96, rim = 0) {
  const P = new PX(w, h), R = ramp(['#1a2030', '#262e42', '#343e56', '#46526c', '#5c6a84']), RIM = ramp(['#8a9cc0', '#c4d2ee', '#eef4ff']);
  const N = (x, y) => { const u = x / w, v = y / h, edge = Math.sin(u * Math.PI) * Math.sin(v * Math.PI); return fbm(x * .03, y * .06, seed, 5) * 1.25 + edge * .55 - .7; };
  P.fill((x, y) => { const n = N(x, y); if (n < .05) return null; if (rim && (N(x, y - 3) < .05 || N(x + (rim > 0 ? 3 : -3), y) < .05)) return RIM(.35 + h2(x, y, seed) * .5, x, y); return R(.25 + n * 1.3 - y / h * .3, x, y); });
  return P.done();
}
export function towerCanvas() {
  const P = new PX(64, 128), W = ramp(['#8d8a88', '#b9b5ae', '#dcd8cf', '#f0ece2']), Rr = ramp(['#4a1216', '#7a1f22', '#a2302c', '#c2463a']);
  P.fill((x, y) => { const band = Math.floor(y / 24) % 2 === 1; const v = .55 + (h2(x >> 1, y >> 1, 2) - .5) * .2 - (y % 6 === 0 ? .15 : 0); return band ? Rr(v, x, y) : W(v, x, y); });
  return P.done();
}
