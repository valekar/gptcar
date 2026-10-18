// Generic potential-flow route helper, explicitly liftable in STYLE/DEMO; LemoLab MIT.
import{plen,clamp,lerp,seg,eio,TAU}from'./engine/toon.js';const BEAT=60/132,B=(s,b)=>s.t0+b*BEAT;
export function makeRoute(plan){let PATH=null;const planOf=()=>plan;
function obstacles() {
  const P = planOf(), out = [];
  for (const it of P.items) {
    const m = 30;
    if (it.shape === 'sofa' || it.shape === 'kidney') out.push({ cx: it.x, cy: it.y, rx: it.s * 1.05 + m, ry: it.s * 0.52 + m });
    else if (it.shape === 'boomerang') out.push({ cx: it.x, cy: it.y, rx: it.s * 1.02 + m, ry: it.s * 0.55 + m });
    else if (it.shape === 'chair') out.push({ cx: it.x, cy: it.y, rx: 70 * it.s + m, ry: 66 * it.s + m });
    else if (it.shape === 'bed') out.push({ cx: it.x, cy: it.y, rx: it.s + m, ry: it.s * 0.6 + m });
    else if (it.shape === 'plant') out.push({ cx: it.x, cy: it.y, rx: it.s + m, ry: it.s + m });
    else if (it.shape === 'table') out.push({ cx: it.x, cy: it.y, rx: it.s * 1.72 + m, ry: it.s * 1.72 + m });
    else out.push({ cx: it.x, cy: it.y, rx: (it.s || 60) + m, ry: (it.s || 60) + m });
  }
  return out;
}
// potential-flow streamline: a horizontal lane at y0 bends around each obstacle ellipse and never enters it
function laneY(x, y0, obs) {
  let y = y0;
  for (const o of obs) {
    const X = (x - o.cx) / o.rx, Y0 = (y0 - o.cy) / o.ry;
    if (Math.abs(X) > 5 || Math.abs(Y0) > 3) continue;
    const sg = Y0 >= 0 ? 1 : -1, a = Math.abs(Y0);
    const f = Y => Y - Y / (X * X + Y * Y) - a;
    let lo = Math.sqrt(Math.max(0, 1 - X * X)) + 1e-4, hi = a + 2;
    if (f(lo) > 0) lo = 1e-4;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; }
    y += (sg * (lo + hi) / 2 - Y0) * o.ry;
  }
  return y;
}
function buildPath() {
  if (PATH) return PATH;
  const P = planOf(), obs = obstacles(), pts = [], marks = {}, decor = [];
  const Z = P.zones, y0 = P.y0, y1 = P.y1, ins = 34, door = (P.y0 + P.y1) / 2;
  const push = (p) => pts.push(p);
  const lineTo = (x, y, n = 12) => { const a = pts[pts.length - 1]; for (let i = 1; i <= n; i++) push([lerp(a[0], x, i / n), lerp(a[1], y, i / n)]); };
  const cum = () => plen(pts);
  const loopAt = (cx, cy, r, dir) => { for (let j = 1; j <= 22; j++) { const a = Math.PI + dir * j / 22 * TAU; push([cx + r + Math.cos(a) * r, cy + Math.sin(a) * r * 1.0]); } };
  push([P.dock[0], P.dock[1] - 44]);
  Z.forEach((z, zi) => {
    const L = z.x0 + ins, R = z.x1 - ins, Tp = y0 + ins, Bt = y1 - ins;
    // enter the zone
    if (zi === 0) lineTo(P.dock[0], Bt, 6); else lineTo(L, door, 10);
    // 1. wall-follow: one loop round the zone (rounded corners)
    const start = pts[pts.length - 1].slice();
    const perim = zi === 0 ? [[L, Bt], [L, Tp], [R, Tp], [R, Bt], [start[0] + 30, Bt]] : [[L, Bt], [R, Bt], [R, Tp], [L, Tp], [L, door - 30]];
    perim.forEach(([x, y]) => lineTo(x, y, Math.ceil(Math.hypot(x - pts[pts.length - 1][0], y - pts[pts.length - 1][1]) / 10)));
    marks['perim' + zi] = cum();
    // 2. lanes: boustrophedon, bottom -> top, bending round furniture; every turn is a small loop (the print's motif)
    const narrow = z.x1 - z.x0 < 400, S = 82, n = narrow ? 0 : Math.max(3, Math.floor((Bt - Tp - 60) / S) | 1);
    const gap = (Bt - Tp - 60) / (n - 1);
    let first = true;
    if (narrow) { // a hall: two straight lanes up and down, a curl at the top turn
      const xa = L + (R - L) * 0.33, xb = L + (R - L) * 0.67, i0 = pts.length;
      lineTo(xa, door, 8); lineTo(xa, Tp + 44, 40);
      const cy = Tp + 44, r = (xb - xa) / 2;
      for (let j = 1; j <= 10; j++) { const a = Math.PI + j / 10 * Math.PI; push([xa + r + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9]); }
      const ap = pts[pts.length - 1]; for (let j = 1; j <= 20; j++) { const ph = j / 20 * TAU; push([ap[0] - 11 + 11 * Math.cos(ph), ap[1] + 11 * Math.sin(ph)]); }
      lineTo(xb, Bt - 44, 50);
      for (let y = Tp + 110; y < Bt - 60; y += 120) decor.push({ x: (xa + xb) / 2, y, kind: (y / 120 | 0) % 2 ? 'star' : 'dot', idx: i0 + 8 + Math.round((y - Tp) / (Bt - Tp) * 40) });
    }
    for (let k = 0; k < n; k++) {
      const yk = Bt - 30 - k * gap, dir = k % 2 ? -1 : 1, xa = dir > 0 ? L + 40 : R - 40, xb = dir > 0 ? R - 40 : L + 40;
      const N = Math.ceil(Math.abs(xb - xa) / 8), lane = [];
      for (let i = 0; i <= N; i++) { const x = lerp(xa, xb, i / N); lane.push([x, clamp(laneY(x, yk, obs), Tp + 14, Bt - 14)]); }
      if (first) { if (zi > 0) lineTo(L, lane[0][1], 20); lineTo(lane[0][0], lane[0][1], 8); first = false; }
      const l0 = pts.length;
      lane.forEach(p => push(p));
      // decor sits in the gap above this lane (stars + dots), revealed when the lane is drawn
      if (k < n - 1) for (let x = L + 70 + (k % 2) * 64; x < R - 50; x += 128) {
        const yy = laneY(x, yk - gap / 2, obs);
        if (obs.some(o => ((x - o.cx) / o.rx) ** 2 + ((yy - o.cy) / o.ry) ** 2 < 1.25)) continue;
        decor.push({ x, y: yy, kind: ((x / 128 | 0) + k) % 2 ? 'star' : 'dot', idx: l0 + Math.round((dir > 0 ? (x - xa) : (xa - x)) / 8) });
      }
      if (k < n - 1) { // U-turn: rounded corners outward, a small curl halfway up (the print's motif)
        const [ex, ey] = pts[pts.length - 1], ny = clamp(laneY(ex, yk - gap, obs), Tp + 14, Bt - 14), r = Math.min((ey - ny) / 2, 34), ox = ex + dir * r, my = (ey + ny) / 2;
        for (let j = 1; j <= 8; j++) { const th = j / 8 * Math.PI / 2; push([ex + dir * r * Math.sin(th), ey - r + r * Math.cos(th)]); }
        lineTo(ox, my, 4);
        for (let j = 1; j <= 20; j++) { const ph = j / 20 * TAU; push([ox + dir * 12 - dir * 12 * Math.cos(ph), my - 12 * Math.sin(ph)]); }
        lineTo(ox, ny + r, 4);
        for (let j = 1; j <= 8; j++) { const th = j / 8 * Math.PI / 2; push([ex + dir * r * Math.cos(th), ny + r - r * Math.sin(th)]); }
      }
    }
    marks['zone' + zi] = cum();
    // leave for the next zone through the door
    if (zi < Z.length - 1) { const e = pts[pts.length - 1]; lineTo(R, e[1], 6); lineTo(R + 10, door, 12); lineTo(z.x1 + ins, door, 8); }
  });
  const homeFrom = pts.length - 1;
  // 3. home: straight back to the dock through the doors (drawn as a dotted return line)
  { const zl = Z[Z.length - 1], e = pts[pts.length - 1]; lineTo(e[0], y0 + ins, 6); lineTo(zl.x0 + ins, y0 + ins, 30); lineTo(zl.x0 + ins, door, 20); }
  lineTo(Z[Z.length - 1].x0 + 30, door, 20);
  lineTo(Z[0].x1 - 50, door, 20);
  lineTo(Z[0].x1 - 50, y1 - 62, 30);
  lineTo(P.dock[0], y1 - 62, 50);
  lineTo(P.dock[0], P.dock[1] - 44, 10);
  const tot = cum(), cumArr = [0]; for (let i = 1; i < pts.length; i++) cumArr.push(cumArr[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  decor.forEach(d => d.u = cumArr[Math.min(d.idx, cumArr.length - 1)] / tot);
  const M = {}; for (const k in marks) M[k] = marks[k] / tot;
  M.homeStart = cumArr[homeFrom] / tot;
  PATH = { pts, tot, M, decor, homeFrom };
  return PATH;
}
// progress along the path: zone by zone, each landing on its beat
function planProgress(t, s) {
  const P = buildPath(), M = P.M, nz = planOf().zones.length, b = x => B(s, x);
  const keys = [[s.t0 + 0.1, 0], [b(3.6), M.perim0]];
  const zoneBeats = [4, 6, 8, 9.5].slice(0, nz);
  for (let z = 0; z < nz; z++) {
    const st = b(zoneBeats[z]), en = st + (z === 0 ? 0.75 : 0.6);
    if (z > 0) keys.push([st, M['perim' + z] - (M['perim' + z] - M['zone' + (z - 1)]) * 1.0]);
    keys.push([en, M['zone' + z]]);
  }
  keys.push([b(10.3), M.homeStart], [b(11), 1]);
  // monotone piecewise: ease within each key pair
  if (t <= keys[0][0]) return 0;
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [ta, pa] = keys[i - 1], [tb, pb] = keys[i]; return lerp(pa, pb, eio(seg(t, ta, tb))); }
  return 1;
}

return{path:buildPath,progress:planProgress};}
