// Attributed isolated LemoLab MIT prop factories; scene layout and story state are separately authored.
import{PAL,tri,mix,hex,hash,clamp,lerp,seg,ss,eo,back,TAU,C30,S30,person,ICON,hatch}from'./engine.js';
const ZW=-1.2,cont=['#B3352B','#3C7FB1','#5E8C4A','#D9A53A','#E9DCC2','#2F6F73'];export const containerTri=i=>tri(cont[i%cont.length],.2,.24);
export function shrub(iso, x, y, z, t, st = {}) {
  const k = iso.cam.k; if (k > 120 || !iso.vis(x, y, z, 2)) return;
  iso.sphereNow(x, y, z + .75, .95, ['#86B266', '#5E8C4A', '#436B34'], { hi: false });
  if (k > 7) { for (let i = 0; i < 4; i++) { const a = hash(x * 3 + y * 7 + i) * TAU; iso.sphereNow(x + Math.cos(a) * .55, y + Math.sin(a) * .55, z + .55 + hash(i + x) * .5, .17, st.ripe === false ? PAL.green : PAL.red, { hi: false }); } }
}
export function tree(iso, T) {
  const { x, y, h, r } = T;
  if (!iso.vis(x, y, h, r + h)) return;
  iso.add(x + y + h * .5, () => {
    const k = iso.cam.k;
    if (T.kind === 'cone') { iso.cylNow(x, y, 0, .22, .9, tri('#7A5236'), { axis: 'z' }); }
    else { const [sx, sy] = iso.P(x, y, 0), [ex, ey] = iso.P(x, y, h * .55); const g = iso.g; g.fillStyle = iso.col('#7A5236'); g.fillRect(sx - .18 * k, ey, .36 * k, sy - ey); }
    if (T.kind === 'cone') iso.coneNow(x, y, .6, r * .8, h + 1, tri('#4F7F45'), { n: 10, rot: .3 });
    else iso.sphereNow(x, y, h * .55 + r * .65, r * .8, ['#8CB86D', '#679A50', '#4A7639'], { hi: false });
  }, 1);
}
export function farmhouse(iso, x, y) {
  iso.box(x, y, 0, 7, 5, 3.4, tri('#EFE2C8'), { decal: (I) => { I.face3([[x + 1.2, y + 5.02, .3], [x + 1.2, y + 5.02, 2.3], [x + 2.5, y + 5.02, 2.3], [x + 2.5, y + 5.02, .3]], tri('#6A432A'), { out: [0, 1, 0] }); I.face3([[x + 4, y + 5.02, 1.4], [x + 4, y + 5.02, 2.6], [x + 5.6, y + 5.02, 2.6], [x + 5.6, y + 5.02, 1.4]], tri('#3C7FB1'), { out: [0, 1, 0] }); } });
  iso.roof(x, y, 3.4, 7, 5, 2.2, tri('#B3352B'), { ridge: 'x', over: .35, gable: tri('#EFE2C8') });
}

// ---------- the ship (local frame: u along heading, v across, z up; origin at hull centre on the waterline) ----------
export const SHIP = { L: 64, W: 12, deck: 4.8, bays: 9, rows: 5, cl: 5.8, cw: 2.2, ch: 2.2 };
export function hullPoly() { const h = SHIP.L / 2, w = SHIP.W / 2; return [[-h, -w], [h - 7, -w], [h, 0], [h - 7, w], [-h, w]]; }
// containers on deck: filled count n (0..max), order bottom tier first, near rows last
export function deckSlots() { const out = []; for (let tier = 0; tier < 4; tier++) for (let b = 0; b < SHIP.bays; b++) for (let r = 0; r < SHIP.rows; r++) { if (b === 0 && tier > 2) continue; out.push({ b, r, tier, u: -SHIP.L / 2 + 10 + b * 5.9, v: -SHIP.W / 2 + .4 + r * 2.24, z: SHIP.deck + tier * SHIP.ch, c: Math.floor(hash(b * 17 + r * 5 + tier * 31) * 6) }); } return out; }
export const DECK = deckSlots();
export const HOLD = { u: -SHIP.L / 2 + 10 + 3 * 5.9, v: -SHIP.W / 2 + .4, z: .1 };  // our container: 4th bay, near row (ship heading −x → local −v faces the viewer), in the hold
export function hull2(pts) { pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = []; for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); } for (const p of pts.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); } return lo.slice(0, -1).concat(up.slice(0, -1)); }
export function shipToWorld(sh, u, v, z) { const c = Math.cos(sh.rot), s = Math.sin(sh.rot); return [sh.x + u * c - v * s, sh.y + u * s + v * c, ZW + z]; }

export function drawShip(iso, st) {
  const { x, y, rot } = st, L = SHIP.L, Wd = SHIP.W, D = SHIP.deck;
  iso.push(x, y, ZW, rot);
  const W0 = iso.w(0, 0, 0);
  if (st.wake > 0) iso.add(-8.5e5, () => { // V-shaped wake on the water behind the stern
    const g = iso.g, k = iso.cam.k; g.save(); g.strokeStyle = iso.col('#E8F1F6', .85); g.lineCap = 'round'; g.lineWidth = Math.max(1.5, k * .35);
    for (let i = 0; i < 5; i++) { const d = 4 + i * 7 * st.wake, sp = 2 + i * 2.6 * st.wake; g.globalAlpha = (1 - i / 5) * .8; for (const sgn of [-1, 1]) { const a = iso.L(-L / 2 - d, sgn * (Wd / 2 + sp * .2), 0), b = iso.L(-L / 2 - d - 5 * st.wake, sgn * (Wd / 2 + sp), 0); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } }
    const a = iso.L(L / 2, -Wd / 2 - .5, 0), b = iso.L(L / 2 + 1, 0, 0), c = iso.L(L / 2, Wd / 2 + .5, 0); g.globalAlpha = .9; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.stroke(); g.restore();
  }, 0);
  iso.add(W0[0] + W0[1] + 2, () => {
    const hullT = ['#51677D', '#34495E', '#26384A'];
    const hp = hullPoly(), cut = st.cut || 0;
    // which long side faces the viewer? (local +v normal → world)
    const nv = iso.wn(0, 1, 0), nearSide = nv[0] + nv[1] > 0 ? 1 : -1;
    if (cut <= 0) {
      iso.prismNow(hp, 0, D, hullT, { topColor: '#9AA3A6' });
      iso.prismNow(hp, 0, 1.0, tri('#B3352B'), { top: false });
      iso.prismNow(hp, D - .45, .45, tri('#EFE6D2'), { top: false });
    } else {
      drawHullCut(iso, hp, hullT, nearSide, cut, st);
    }
    iso.sub(() => {
      // superstructure (stern)
      const su = -L / 2 + 1;
      iso.box(su, -Wd / 2 + .5, D, 6, Wd - 1, 8.2, tri('#F3ECDD'), {
        decal: (I) => { for (let r = 0; r < 3; r++) { const z = D + 2.2 + r * 2.2; I.face3([[su + 6.02, -Wd / 2 + 1.5, z], [su + 6.02, Wd / 2 - 1.5, z], [su + 6.02, Wd / 2 - 1.5, z + .9], [su + 6.02, -Wd / 2 + 1.5, z + .9]], tri('#3E5E7E'), { out: [1, 0, 0] }); I.face3([[su + 6.02, -Wd / 2 + 1.5, z], [su + 6.02, Wd / 2 - 1.5, z], [su + 6.02, Wd / 2 - 1.5, z + .9], [su + 6.02, -Wd / 2 + 1.5, z + .9]].map(p => [p[0] - 6.04, p[1], p[2]]), tri('#3E5E7E'), { out: [-1, 0, 0] }); for (const sv of [-1, 1]) for (let w = 0; w < 3; w++) { const u0 = su + .7 + w * 1.8; I.face3([[u0, sv * (Wd / 2 - .48), z], [u0 + 1.1, sv * (Wd / 2 - .48), z], [u0 + 1.1, sv * (Wd / 2 - .48), z + .9], [u0, sv * (Wd / 2 - .48), z + .9]], tri('#3E5E7E'), { out: [0, sv, 0] }); } } }
      });
      iso.box(su - .3, -Wd / 2 - .4, D + 8.2, 6.6, Wd + .8, .5, tri('#E6DCC6'));
      iso.box(su + 1.2, -1.3, D + 8.7, 2.4, 2.6, 4.2, tri('#B3352B'), { decal: (I) => { I.face3([[su + 1.2, 1.32, D + 11], [su + 3.6, 1.32, D + 11], [su + 3.6, 1.32, D + 11.8], [su + 1.2, 1.32, D + 11.8]], tri('#F3ECDD'), { out: [0, 1, 0] }); I.face3([[su + 3.62, -1.3, D + 11], [su + 3.62, 1.3, D + 11], [su + 3.62, 1.3, D + 11.8], [su + 3.62, -1.3, D + 11.8]], tri('#F3ECDD'), { out: [1, 0, 0] }); } });
      // bow mast
      iso.box(L / 2 - 8.5, -.3, D, .6, .6, 5, tri('#E6DCC6'));
      // open hatch over the hold (before our container goes in)
      if (st.hatch !== undefined && st.hatch < 1) { const H = HOLD, f = st.hatch; const hx0 = H.u - .6, hx1 = H.u + SHIP.cl + .6, hy0 = -SHIP.W / 2 + 1, hy1 = SHIP.W / 2 - 1; iso.add(-1e4, () => { iso.poly([[hx0, hy0], [hx1, hy0], [hx1, hy1], [hx0, hy1]].map(q => iso.L(q[0], q[1], SHIP.deck + .01)), '#2A2622'); const cz = SHIP.deck + .02; iso.poly([[hx0, hy0], [lerp(hx1, hx0, 1 - f), hy0], [lerp(hx1, hx0, 1 - f), hy1], [hx0, hy1]].map(q => iso.L(q[0], q[1], cz)), '#8E989C'); }, 0); if (st.holdBox) st.holdBox(iso); }
      // deck containers
      const n = st.n ?? DECK.length;
      for (let i = 0; i < Math.min(n, DECK.length); i++) {
        const s = DECK[i]; let dz = 0, a = 1; if (st.drop) { const r = st.drop(i); if (!r) continue; [dz, a] = r; }
        const prevA = iso.alpha; iso.alpha = a;
        iso.box(s.u, s.v, s.z + dz, SHIP.cl, SHIP.cw - .08, SHIP.ch - .06, containerTri(s.c), { decal: ribs(s.u, s.v, s.z + dz), cull: false });
        iso.alpha = prevA;
      }
      if (st.extra) st.extra(iso);
    });
  }, 1);
  iso.pop();
}
// container ribs (vertical lines on the two visible long faces) — only when big enough on screen
export function ribs(u, v, z, l = SHIP.cl, w = SHIP.cw - .08, h = SHIP.ch - .06) {
  return (I) => {
    if (I.cam.k * I.scale() < 9) return; const g = I.g; g.save(); g.lineWidth = Math.max(.6, I.cam.k * .04); g.strokeStyle = I.col('#000', .16);
    const nv = I.wn(0, 1, 0), fy = nv[0] + nv[1] > 0 ? v + w : v; const nu = I.wn(1, 0, 0), fx = nu[0] + nu[1] > 0 ? u + l : u;
    g.beginPath(); for (let i = 1; i < 12; i++) { const uu = u + l * i / 12; const a = I.L(uu, fy, z + .15), b = I.L(uu, fy, z + h - .15); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    for (let i = 1; i < 5; i++) { const vv = v + w * i / 5; const a = I.L(fx, vv, z + .15), b = I.L(fx, vv, z + h - .15); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } g.stroke(); g.restore();
  };
}
function drawHullCut(iso, hp, hullT, near, cut, st) {
  // far half of the hull as an open shell: far side inner wall, floor, the hold, then the near wall sliding away
  const D = SHIP.deck, L = SHIP.L, Wd = SHIP.W, vN = near * Wd / 2, vF = -near * Wd / 2;
  iso.prismNow(hp, 0, .01, hullT, { topColor: '#6F6A60' });                              // floor
  iso.face3([[-L / 2, vF, 0], [L / 2 - 7, vF, 0], [L / 2 - 7, vF, D], [-L / 2, vF, D]], hullT, { both: true, color: '#5E6F80' }); // far wall inner
  if (st.holdDraw) iso.sub(() => st.holdDraw(iso));
  // near wall slides out along its normal and fades
  const off = near * 7 * eo(cut), a = 1 - ss(seg(cut, .15, .8));
  if (a > 0) { const pa = iso.alpha; iso.alpha = a; iso.push(0, off, 0, 0); iso.prismNow(hp, 0, D, hullT, { topColor: '#9AA3A6' }); iso.prismNow(hp, 0, 1, tri('#B3352B'), { top: false }); iso.pop(); iso.alpha = pa; }
  // deck slab (hatch covers) stays; cut rims hatched
  const deckPoly = hp.map(p => [p[0], p[1]]);
  const pa = iso.alpha; iso.prismNow(deckPoly, D - .5, .5, tri('#9AA3A6'), {}); iso.alpha = pa;
  const hp2 = ss(seg(cut, .5, 1)); if (hp2 > 0) { const g = iso.g; g.save(); g.globalAlpha = hp2;
    hatch(g, [[-L / 2, vN, D - .5], [L / 2 - 7, vN, D - .5], [L / 2 - 7, vN, D], [-L / 2, vN, D]].map(q => iso.L(...q)), { sp: 6 });
    hatch(g, [[-L / 2, vN, -.02], [L / 2 - 7, vN, -.02], [L / 2 - 7, vN, .1], [-L / 2, vN, .1]].map(q => iso.L(...q)), { sp: 6 });
    hatch(g, [[-L / 2, vN, 0], [-L / 2 + .5, vN, 0], [-L / 2 + .5, vN, D], [-L / 2, vN, D]].map(q => iso.L(...q)), { sp: 6 });
    g.restore(); }
}

// gantry crane on the quay: at world (x, y), boom along +y. hook = {dz, box: containerTri|null}
export function crane(iso, x, y, st = {}) {
  if (st.flip) return craneFlip(iso, x, y, st);
  const Cc = tri('#D9A53A', .22, .25), H = 19, reach = st.reach || 31, back = 6;
  const leg = (lx, ly) => iso.box(x + lx, y + ly, 0, .7, .7, H, Cc);
  leg(-3, -4); leg(3, -4); leg(-3, 3); leg(3, 3);
  iso.box(x - 3, y - 4, H - 1.2, .7, 7.7, 1.2, Cc); iso.box(x + 3, y - 4, H - 1.2, .7, 7.7, 1.2, Cc);
  iso.box(x - 3, y - 4 - back, H, 6.7, reach + back, 1.4, Cc, { bias: 40 });             // boom
  iso.box(x - 1.6, y - 4 - back - 1, H + 1.4, 3.9, 3, 3, tri('#EFE6D2'), { bias: 40 });                 // machinery house
  const ty = y + (st.trolley ?? 16);
  iso.box(x - 1.4, ty - 1.2, H - 1, 3.5, 2.4, 1, tri('#3A3A3A'), { bias: 42 });
  const hz = st.hookZ ?? 8;
  iso.line3([[x - .6, ty, H - 1], [x - .6, ty, hz + 1.2]], '#3A3230', 1.4, { bias: 41 });
  iso.line3([[x + 1.2, ty, H - 1], [x + 1.2, ty, hz + 1.2]], '#3A3230', 1.4, { bias: 41 });
  if (st.box) {
    const bx = x - SHIP.cl / 2, by = ty - SHIP.cw / 2, bz = hz - SHIP.ch + 1.2;
    iso.add(bx + by + bz + 44, () => { const g = iso.g; g.save(); if (st.clip) { g.beginPath(); st.clip.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip(); } iso.boxNow(bx, by, bz, SHIP.cl, SHIP.cw, SHIP.ch, st.box, { decal: ribs(bx, by, bz) }); g.restore(); }, 1);
  }
  iso.box(x - 2.4, ty - 1.3, hz + 1.1, 5.2, 2.6, .35, tri('#D9A53A'), { bias: 41.6 });   // spreader
}
function craneFlip(iso, x, y, st) { // quay B: boom reaching back over the water (−y)
  const Cc = tri('#D9A53A', .22, .25), H = 19, reach = st.reach || 24;
  if (st.alpha !== undefined && st.alpha <= 0) return; const pa = iso.alpha; if (st.alpha !== undefined) iso.alpha = st.alpha;
  for (const [lx, ly] of [[-3, -3], [3, -3], [-3, 4], [3, 4]]) iso.box(x + lx, y + ly, 0, .7, .7, H, Cc);
  iso.box(x - 3, y + 4 - reach, H, 6.7, reach + 6, 1.4, Cc, { bias: -10 });
  iso.box(x - 1.6, y + 7, H + 1.4, 3.9, 3, 3, tri('#EFE6D2'));
  const ty = y + (st.trolley ?? -12); iso.box(x - 1.4, ty - 1.2, H - 1, 3.5, 2.4, 1, tri('#3A3A3A'));
  const hz = st.hookZ ?? 12; iso.line3([[x, ty, H - 1], [x, ty, hz]], '#3A3230', 1.4); iso.box(x - 2.4, ty - 1.3, hz - .35, 5.2, 2.6, .35, tri('#D9A53A'));
  iso.alpha = pa;
}
export function drawTruck(iso, x, y, rot, st = {}) {
  iso.push(x, y, 0, rot);
  const W0 = iso.w(0, 0, 0);
  iso.add(W0[0] + W0[1] + 1.2, () => iso.sub(() => {
    const cab = tri(st.cab || '#B3352B', .2, .24), bed = tri('#8A6844');
    for (const [u, v] of [[-2.2, -1.25], [1.6, -1.25], [-2.2, 1.05], [1.6, 1.05]]) iso.cyl(u, v, .55, .55, .2, tri('#2E2A28'), { axis: 'y', n: 12 });
    iso.box(-3, -1.1, .5, 3.6, 2.2, .5, bed);                                    // bed floor
    iso.box(-3, -1.1, 1.0, 3.6, .15, .7, bed); iso.box(-3, .95, 1.0, 3.6, .15, .7, bed); iso.box(-3, -1.1, 1.0, .15, 2.2, .7, bed);
    iso.box(.8, -1.1, .5, 1.6, 2.2, 2.0, cab, { decal: (I) => { I.face3([[2.42, -.8, 1.5], [2.42, .8, 1.5], [2.42, .8, 2.3], [2.42, -.8, 2.3]], tri('#9CC3DD'), { out: [1, 0, 0] }); I.face3([[1.0, -1.12, 1.5], [2.2, -1.12, 1.5], [2.2, -1.12, 2.3], [1.0, -1.12, 2.3]], tri('#9CC3DD'), { out: [0, -1, 0] }); I.face3([[1.0, 1.12, 1.5], [2.2, 1.12, 1.5], [2.2, 1.12, 2.3], [1.0, 1.12, 2.3]], tri('#9CC3DD'), { out: [0, 1, 0] }); } });
    for (let i = 0; i < (st.sacks || 0); i++) iso.box(-2.7 + i * 1.1, -.5, 1.0, 1.0, 1.1, .7, tri('#C9A874', .2, .22));
    if (st.box) iso.box(-3.1, -1.1, 1.0, 5.8 * .62, 2.2, 1.6, st.box);
  }), 1);
  iso.pop();
}
export function drawBike(iso, x, y, rot, st = {}) {
  iso.push(x, y, 0, rot);
  iso.bill(0, 0, 0, (g) => {
    g.strokeStyle = '#2E2522'; g.lineWidth = .09; for (const u of [-.55, .55]) { g.beginPath(); g.ellipse(u, -.35, .34, .34, 0, 0, Math.PI * 2); g.stroke(); }
    g.beginPath(); g.moveTo(-.55, -.35); g.lineTo(-.1, -.8); g.lineTo(.4, -.8); g.lineTo(.55, -.35); g.moveTo(-.1, -.8); g.lineTo(0, -.35); g.stroke();
    g.fillStyle = '#C9A874'; g.fillRect(-.95, -1.05, .5, .42);
    person(g, { body: '#3C7FB1', hat: 'cap', skin: '#C98B62', arm: 2.2, h: 2.2, bob: 0 });
  }, { r: 3 });
  iso.pop();
}

// ---------- cutaway building: closed exterior, or open = front walls slide out & fade, roof lifts ----------
// B = {x, y, w, d, h}; st = {open, wall: tri, roof: fn(iso, dz, alpha) , floor, interior: fn(iso), decal: fn}
export function cutBuilding(iso, B, st) {
  const { x, y, w, d, h } = B, o = st.open || 0, th = .45;
  iso.add(x + w / 2 + y + d / 2 + h / 2, () => {
    if (o <= 0) { iso.boxNow(x, y, 0, w, d, h, st.wall, { decal: st.decal }); if (st.roof) st.roof(iso, 0, 1); return; }
    iso.poly([[x, y], [x + w, y], [x + w, y + d], [x, y + d]].map(q => iso.P(q[0], q[1], .02)), st.floor || '#D8CCB6');
    if (st.floorDecal) st.floorDecal(iso);
    iso.boxNow(x, y, 0, th, d, h, st.inner || st.wall); iso.boxNow(x, y, 0, w, th, h, st.inner || st.wall);
    // hatched section on the cut wall tops
    const op = ss(seg(o, .6, 1)); if (op > 0) { const g = iso.g; g.save(); g.globalAlpha = op; hatchTop(iso, x, y, th, d, h); hatchTop(iso, x, y, w, th, h); g.restore(); }
    if (st.backDecal) st.backDecal(iso);
    iso.sub(() => st.interior && st.interior(iso));
    const a = 1 - ss(seg(o, .1, .75)), off = eo(o) * 7;
    if (a > 0) {
      const pa = iso.alpha; iso.alpha = a;
      iso.boxNow(x + w - th + off * .7, y, 0, th, d, h, st.wall); iso.boxNow(x, y + d - th + off, 0, w, th, h, st.wall);
      if (st.roof) st.roof(iso, off * 1.3, a);
      iso.alpha = pa;
    }
  }, 1);
}
function hatchTop(iso, x, y, w, d, h) {
  const pts = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]].map(q => iso.P(q[0], q[1], h + .01));
  const g = iso.g; g.save(); g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = iso.col('#FBF4E6'); g.fill(); g.clip();
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); g.strokeStyle = iso.col('#2E2522', .55); g.lineWidth = 1.2; g.beginPath();
  for (let s = Math.min(...xs) - 300; s < Math.max(...xs); s += 6) { g.moveTo(s, Math.max(...ys)); g.lineTo(s + (Math.max(...ys) - Math.min(...ys)), Math.min(...ys)); } g.stroke(); g.restore();
}

// ---------- hold, container interior, sacks (ship-local coordinates; called inside the ship transform) ----------

// Isolated cargo hold/container/sack model; no scene timing or camera.
export const HOLDZ = [.1, 2.25];
export function holdContainers(iso, st) {
  for (let tier = 0; tier < 2; tier++) for (let b = 0; b < SHIP.bays; b++) for (let r = 0; r < SHIP.rows; r++) {
    const u = -SHIP.L / 2 + 10 + b * 5.9, v = -SHIP.W / 2 + .4 + r * 2.24, z = HOLDZ[tier];
    const ours = b === 3 && r === 0 && tier === 0;
    if (ours) { containerOpen(iso, u, v, z, st.boxOpen || 0, st); continue; }
    iso.box(u, v, z, SHIP.cl, SHIP.cw - .08, 2.1, containerTri(Math.floor(hash(b * 7 + r * 13 + tier * 29 + 3) * 6)), { decal: ribs(u, v, z, SHIP.cl, SHIP.cw - .08, 2.1) });
  }
}
export const SACK = { a: 2.4, c: 1.03 };                          // our sack's face centre in container-local (a along u, c up)
function containerOpen(iso, u, v, z, o, st) {
  const L = SHIP.cl, Wd = SHIP.cw - .08, H = 2.1, T = tri('#B3352B', .2, .24);
  const W0 = iso.w(u + L / 2, v + Wd / 2, z + H / 2);
  iso.add(W0[0] + W0[1] + W0[2], () => {
    if (o <= 0) { iso.boxNow(u, v, z, L, Wd, H, T, { decal: ribs(u, v, z, L, Wd, H) }); return; }
    // inner back wall (+v side), floor, end walls, then sacks, then the near side sliding away
    iso.face3([[u, v + Wd, z], [u + L, v + Wd, z], [u + L, v + Wd, z + H], [u, v + Wd, z + H]], T, { both: true, color: '#7E2A22' });
    iso.face3([[u, v, z], [u + L, v, z], [u + L, v + Wd, z], [u, v + Wd, z]], T, { both: true, color: '#6B5A48' });
    iso.face3([[u, v, z], [u, v + Wd, z], [u, v + Wd, z + H], [u, v, z + H]], T, { both: true, color: '#8C2E25' });
    iso.sub(() => {
      for (let tier = 0; tier < 3; tier++) for (let a = 0; a < 6; a++) for (let b = 0; b < 2; b++) {
        const su = u + .05 + a * .95, sv = v + .05 + b * 1.02, sz = z + .02 + tier * .68, isOurs = a === 2 && b === 0 && tier === 1;
        iso.box(su, sv, sz, .9, 1.0, .66, tri(isOurs ? '#CDA86F' : '#C4A26E', .2, .24), { cull: false, decal: sackDecal(su, sv, sz, isOurs ? st : null) });
      }
    });
    iso.face3([[u + L, v, z], [u + L, v + Wd, z], [u + L, v + Wd, z + H], [u + L, v, z + H]], T, { both: true, color: '#9E3127' });
    iso.face3([[u, v, z + H], [u + L, v, z + H], [u + L, v + Wd, z + H], [u, v + Wd, z + H]], T, { both: true, color: T[0] });
    const a = 1 - ss(seg(o, .1, .8)); if (a > 0) { const pa = iso.alpha; iso.alpha = a; iso.push(0, -eo(o) * 2.5, 0, 0); iso.face3([[u, v, z], [u + L, v, z], [u + L, v, z + H], [u, v, z + H]], T, { both: true }); iso.pop(); iso.alpha = pa; }
  }, 1);
}
function sackDecal(su, sv, sz, st) {
  return (I) => {
    const k = I.cam.k * I.scale(); if (k < 25) return;
    const g = I.g; const p = (a, c) => I.L(su + a, sv - .005, sz + c);
    g.save(); g.strokeStyle = I.col('#8A6A40', .8); g.lineWidth = Math.max(1, k * .012);
    g.beginPath(); const a0 = p(.02, .5), a1 = p(.88, .5); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.stroke();
    const b0 = p(.02, .56), b1 = p(.88, .56); g.strokeStyle = I.col('#B3352B', .7); g.lineWidth = Math.max(1, k * .02); g.beginPath(); g.moveTo(b0[0], b0[1]); g.lineTo(b1[0], b1[1]); g.stroke();
    g.restore();
    if (st && st.tear > 0 && st.tearDraw) st.tearDraw(I, su, sv, sz);
  };
}
