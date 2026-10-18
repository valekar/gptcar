// Attributed generic crucible, liquid-stream, spark and steam models, isolated from LemoLab MIT.
import*as WC from'./engine/index.js';import{mulberry,clamp,lerp}from'/core/lib.js';const PI=Math.PI;
export function crucible(m, c, x, y, a, glow = 1, sc = 1.7) {
  const loc = [[-44, -40], [44, -40], [40, -10], [30, 40], [-30, 40], [-40, -10]];
  const tr = ([u, v]) => [x + u * sc * Math.cos(a) - v * sc * Math.sin(a), y + u * sc * Math.sin(a) + v * sc * Math.cos(a)];
  const P = WC.spline(loc.map(tr), 4, true);
  WC.drawStrokes(m, WC.cutAlong(WC.offsetPoly(P, 5), { closed: true, w: 8, kind: 'u', seg: [400, 900], gap: [0, 1], seed: 3 }));
  WC.fillPoly(m, [P], '#000');
  // two carved bands + a lit flank facing the glow (below-right)
  for (const v of [-18, 14]) WC.drawStrokes(m, WC.cutAlong([tr([-40, v]), tr([0, v + 4]), tr([38, v])], { w: 3, kind: 'k', seed: 7 + v }));
  WC.drawStrokes(m, WC.cutAlong([tr([36, -30]), tr([34, 0]), tr([26, 34])], { w: 5, kind: 'v', seed: 9 }));
  const mid = tr([0, -40]);
  const surf = WC.ellipse(mid[0], mid[1], 38 * sc, 7 * sc, 24, a);
  WC.fillPoly(m, [surf], '#fff'); WC.plate(c, [WC.ellipse(mid[0], mid[1], 40 * sc, 9 * sc, 24, a)], glow);
  return { lip: tr([44, -40]), mid };
}
export function stream(m, c, p0, p1, t, w = 16, prog = 1) {
  const cx = lerp(p0[0], p1[0], .75) + 20, cy = p0[1] - 10;
  const pts = WC.spline([p0, [cx, cy + (p1[1] - p0[1]) * .15], [p1[0] + 4, lerp(p0[1], p1[1], .6)], p1], 3);
  const n = Math.max(2, Math.round(pts.length * clamp(prog)));
  const P = pts.slice(0, n);
  const s = WC.mkStroke(P, P.map((_, i) => w * (1 - .35 * i / pts.length)), { kind: 'u', seed: 3 });
  WC.drawStrokes(m, [{ ...s, w: s.w.map(v => v * 1.45 + 5), chip: .05 }], { color: '#000' });   // dark wood left around the stream
  WC.drawStrokes(m, [s]);
  c.fillStyle = '#000'; c.beginPath(); WC.strokePath(c, { ...s, w: s.w.map(v => v * 2.2), kind: 'u', chip: .05 }, 1); c.fill();
  // flow striations (left standing = black) wobbling at 12 fps
  const q = Math.floor(t * 12), r = mulberry(77 + q);
  const fl = [];
  for (let k = 0; k < 3; k++) { const i0 = Math.floor(r() * P.length * .6), i1 = Math.min(P.length - 1, i0 + 8 + Math.floor(r() * 14)); if (i1 - i0 > 3) fl.push(WC.mkStroke(P.slice(i0, i1).map(([x, y]) => [x + (r() - .5) * 3, y]), 1.6, { kind: 'k', seed: r() * 9 })); }
  WC.drawStrokes(m, fl, { color: '#000' });
  return P[P.length - 1];
}
export function sparks(m, c, x, y, t, n = 40, R0 = 260, seed = 1) {
  const q = Math.floor(t * 12), r = mulberry(seed * 100 + q), st = [];
  for (let i = 0; i < n; i++) {
    const a = -PI * .9 + r() * PI * .8 - .2, d = 30 + r() * R0, L = 6 + r() * 16, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d + d * d * .0015;
    st.push(WC.mkStroke([[px, py], [px + Math.cos(a) * L, py + Math.sin(a) * L]], 2.5 + r() * 2, { kind: 'stab', seed: r() * 99 }));
  }
  WC.drawStrokes(m, st);
  c.fillStyle = '#000'; c.beginPath(); for (const s of st) WC.strokePath(c, { ...s, w: s.w.map(v => v * 2) }, 1); c.fill();
}
export function steam(m, x, y, t, k = 1) {
  const q = Math.floor(t * 12), r = mulberry(300 + q), st = [];
  for (let i = 0; i < 16 * k; i++) {
    const x0 = x + (r() - .5) * 360, h = 120 + r() * 260, ph = r() * 6;
    const pts = []; for (let j = 0; j < 10; j++) { const u = j / 9; pts.push([x0 + Math.sin(u * 5 + ph + t * 3) * 22 * u, y - u * h]); }
    st.push(WC.mkStroke(pts, pts.map((_, j) => 7 * Math.sin(Math.PI * (j + .5) / 10)), { kind: 'v', seed: r() * 99 }));
  }
  WC.drawStrokes(m, st);
}