// Attributed isolated generic mountain, house, arch and tree factories from LemoLab MIT toolkit. No full-world assembly.
import * as WC from './engine/index.js';import{mulberry,clamp}from'/core/lib.js';let CARVE=false;const rv=(t0,t1,key,speed=1100)=>CARVE?{t0,t1,key,speed,jit:.12}:undefined;export function carving(v){CARVE=v}
export function peak(px, py, hw, base, lit, dark, sp, seed, reveal) {
  const r = mulberry(seed), L = [[px, py]], R = [[px, py]];
  // jagged flanks: a shoulder or two on each side
  const nl = 6; for (let k = 1; k <= nl; k++) { const u = k / nl; L.push([px - hw * u + (r() - .5) * 26, py + (base - py) * Math.pow(u, 1.25) + (r() - .5) * 18]); R.push([px + hw * u * 1.1 + (r() - .5) * 26, py + (base - py) * Math.pow(u, 1.15) + (r() - .5) * 18]); }
  const poly = [...L.reverse(), ...R.slice(1), [px + hw * 1.1, base + 60], [px - hw, base + 60]];
  const spine = y => px + 30 * clamp((y - py) / (base - py)) ** 2 + 8 * Math.sin(y * .05);
  const tone = () => (x, y) => { const u = clamp((y - py) / (base - py)), sx = spine(y);
    if (x < sx) return clamp(lit - .6 * u * u + .12 * Math.sin(x * .04 - y * .06) * u);
    return clamp(dark + .6 * Math.max(0, Math.sin((x - sx) * .05 + y * .025) - .8) * (1 - u)); };
  const dir = (x, y) => x < spine(y) ? Math.PI - .7 + .15 * Math.sin(y * .01) : .62;
  return WC.shape([poly], { tone, dir, sp, lo: .3, hi: .95, halo: 4, seed, seg: [24, 100], jit: .06, res: 3, reveal, kind: CARVE && sp > 8 ? 'u' : 'v' });
}
export function house(x, base, w, h, roofH, flip, seed) {
  const r = mulberry(seed);
  const wall = [[x, base], [x, base - h], [x + w, base - h], [x + w, base]];
  const ov = 14;
  const roof = [[x - ov, base - h + 4], [x + w * (flip ? .38 : .62), base - h - roofH], [x + w + ov, base - h + 4], [x + w + ov, base - h + 18], [x - ov, base - h + 18]];
  const wins = [];
  const nw = w > 110 ? 2 : 1;
  for (let i = 0; i < nw; i++) { const wx = x + w * (nw === 1 ? .5 : (.3 + .4 * i)) - 11, wy = base - h * .62; if (r() < .8) wins.push(WC.rect(wx, wy, 22, 28)); }
  const chim = r() < .6 ? WC.rect(x + w * (flip ? .7 : .2), base - h - roofH * .75, 16, roofH * .55) : null;
  return { wall, roof, wins, chim, x, w, base, h, roofH, flip };
}
export function archPoly(cx, cy, w, h) {
  const P = [[cx - w / 2, cy + h / 2]];
  for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; P.push([cx + Math.cos(a) * w / 2, cy - h / 2 + w / 2 + Math.sin(a) * w / 2]); }
  P.push([cx + w / 2, cy + h / 2]);
  return P;
}
export function pine(x, base, h, seed) {
  const r = mulberry(seed), tiers = 6, polys = [], caps = [];
  for (let i = 0; i < tiers; i++) {
    const u = i / tiers, y0 = base - h * (u * .82), top = base - h * (u * .82 + .3), wd = h * .3 * (1 - u * .75);
    const P = [[x, top]];
    const nT = 7;
    for (let k = 0; k <= nT; k++) { const f = k / nT; P.push([x + wd * f + (k % 2 ? -4 : 3), top + (y0 - top) * (.5 + .5 * f) + (k % 2 ? -10 : 5)]); }
    for (let k = nT; k >= 0; k--) { const f = k / nT; P.push([x - wd * f + (k % 2 ? 4 : -3), top + (y0 - top) * (.5 + .5 * f) + (k % 2 ? -10 : 5)]); }
    polys.push(P);
    // snow lying on the upper edge of each tier: thick U-cuts following the tier edge
    for (const sd of [-1, 1]) {
      const pts = []; for (let k = 0; k <= 8; k++) { const f = .08 + .84 * k / 8; pts.push([x + sd * wd * f, top + (y0 - top) * (.5 + .5 * f) - 3 + (k % 2 ? -5 : 2)]); }
      caps.push(WC.mkStroke(pts, pts.map((_, k) => (sd < 0 ? 11 : 6) * (1 - k / 10)), { kind: 'u', seed: r() * 99 }));
    }
  }
  const trunk = WC.rect(x - 8, base - 24, 16, 44);
  const tree = WC.shape([...polys, trunk], { reveal: rv(4.6, 5.5, (xx, yy) => clamp((base - yy) / h)), tone: () => (xx, yy) => (xx < x ? .62 : .3) + .15 * Math.sin(yy * .09), dir: (xx, yy) => (xx < x ? 2.55 : .6), sp: 8, lo: .38, hi: 1, halo: 5, seed: 200 + seed, seg: [10, 30], gap: [2, 6], res: 2, fill: true });
  return { tree, caps };
}