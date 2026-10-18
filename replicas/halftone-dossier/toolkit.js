// Shared generic drawing/material/type and reusable tabby rigs, extracted from MIT upstream index.html lines55–337; no original scenes.
const NS = 'http://www.w3.org/2000/svg';
const C = {
  paper: '#F4ECDD', navy: '#1D2340', blue: '#2E55D6', pink: '#FF5A87', yellow: '#FFC628',
  orange: '#F58A34', ored: '#D9621E', cream: '#FFF4E2', red: '#E8384F', night: '#18203F',
  night2: '#2A3568', skin: '#F7C9A1', mint: '#56C29E',
};
const F = {
  serif: "'Noto Serif SC'", cute: "'ZCOOL KuaiLe'", bagel: "'Bagel Fat One'",
  mono: "'JetBrains Mono', 'Noto Sans SC'", sans: "'Noto Sans SC'",
};


function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function txt(parent, str, attrs) { const e = el('text', attrs, parent); e.textContent = str; return e; }
function tf(e, x = 0, y = 0, s = 1, r = 0, sy) {
  e.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)} ${(sy ?? s).toFixed(4)})`);
}
function op(e, o) { e.setAttribute('opacity', Math.max(0, Math.min(1, o)).toFixed(3)); }
function show(e, v) { e.style.display = v ? '' : 'none'; }

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, p) => a + (b - a) * p;
const E = {
  out: p => 1 - Math.pow(1 - p, 3),
  in: p => p * p * p,
  io: p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
  back: p => { const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },
  elastic: p => p <= 0 ? 0 : p >= 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * 2 * Math.PI / 3) + 1,
};
const pop = (t, t0, d = 0.35) => t < t0 ? 0 : E.back(seg(t, t0, t0 + d));
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const mctx = document.createElement('canvas').getContext('2d');
function measure(str, size, family, weight = 900) { mctx.font = `${weight} ${size}px ${family}`; return mctx.measureText(str).width; }

// 逐字文字（可做逐字弹入），可选错版阴影
function chars(parent, str, o) {
  const { x, y, size, family, weight = 900, fill = C.navy, anchor = 'start', ls = 0, shadow, stroke, sw = 0 } = o;
  const g = el('g', {}, parent);
  const arr = [...str];
  const widths = arr.map(c => measure(c, size, family, weight));
  const total = widths.reduce((a, b) => a + b, 0) + ls * (arr.length - 1);
  let cx = anchor === 'middle' ? x - total / 2 : anchor === 'end' ? x - total : x;
  const items = arr.map((ch, i) => {
    const cg = el('g', {}, g);
    const base = { x: 0, y: 0, 'font-size': size, 'font-family': family, 'font-weight': weight, 'text-anchor': 'middle' };
    if (shadow) txt(cg, ch, { ...base, x: shadow.dx, y: shadow.dy, fill: shadow.fill, class: 'mul' });
    const st = stroke ? { stroke, 'stroke-width': sw, 'paint-order': 'stroke', 'stroke-linejoin': 'round' } : {};
    txt(cg, ch, { ...base, fill, ...st });
    const it = { g: cg, x: cx + widths[i] / 2, y, w: widths[i], size };
    cx += widths[i] + ls;
    tf(cg, it.x, it.y);
    return it;
  });
  return { g, items, total };
}
// 逐字动画：弹入（从下方挤压回弹）
function charsPop(c, t, t0, stagger = 0.05, d = 0.38, from = 60) {
  c.items.forEach((it, i) => {
    const s = t0 + i * stagger;
    const p = seg(t, s, s + d);
    const h = it.size * 0.35;
    if (t < s) { op(it.g, 0); return; }
    op(it.g, 1);
    const sc = E.back(p);
    const sq = 1 + 0.25 * Math.sin(p * Math.PI) * (1 - p);
    it.g.setAttribute('transform', `translate(${it.x} ${it.y + from * (1 - E.out(p))}) translate(0 ${-h}) scale(${(sc / sq).toFixed(3)} ${(sc * sq).toFixed(3)}) translate(0 ${h})`);
  });
}
function charsIdle(c, t, amp = 4, spd = 3) {
  c.items.forEach((it, i) => tf(it.g, it.x, it.y + Math.sin(t * spd + i * 0.8) * amp));
}

// 半调网点：f(x,y) → 0..1 网点大小
function halftone(parent, { x0 = 0, y0 = 0, w = 1920, h = 1080, step = 22, angle = 15, color, f, maxK = 0.62 }) {
  const a = angle * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
  const n = Math.ceil(Math.hypot(w, h) / step / 2) + 2;
  let d = '';
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
    const u = i * step, v = j * step;
    const x = x0 + w / 2 + u * ca - v * sa, y = y0 + h / 2 + u * sa + v * ca;
    if (x < x0 - step || x > x0 + w + step || y < y0 - step || y > y0 + h + step) continue;
    const s = clamp(f(x, y)); if (s < 0.05) continue;
    const r = s * step * maxK;
    d += `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-2 * r).toFixed(1)} 0`;
  }
  return el('path', { d, fill: color }, parent);
}
const radial = (cx, cy, R, pw = 1.2) => (x, y) => Math.pow(clamp(1 - Math.hypot(x - cx, y - cy) / R), pw);
const edge = (R = 900, pw = 1.6) => (x, y) => Math.pow(clamp(Math.hypot(x - 960, y - 540) / R - 0.35), pw) * 1.3;

function bg(parent, color) { return el('rect', { width: 1920, height: 1080, fill: color }, parent); }

// 字幕条
function caption(parent, parts, { x = 960, y = 980, size = 46 } = {}) {
  const g = el('g', {}, parent);
  const inner = el('g', {}, g);
  const w = parts.reduce((a, [s]) => a + measure(s, size, F.sans, 900), 0);
  const padX = 34, hgt = size * 1.7;
  el('rect', { x: -w / 2 - padX + 8, y: -hgt / 2 + 8, width: w + padX * 2, height: hgt, rx: 14, fill: C.pink, class: 'mul' }, inner);
  el('rect', { x: -w / 2 - padX, y: -hgt / 2, width: w + padX * 2, height: hgt, rx: 14, fill: C.navy }, inner);
  const t = el('text', { x: -w / 2, y: size * 0.36, 'font-size': size, 'font-family': F.sans, 'font-weight': 900 }, inner);
  parts.forEach(([s, col]) => { const sp = el('tspan', { fill: col || C.cream }, t); sp.textContent = s; });
  return { g, inner, x, y };
}
function captionAnim(c, t, t0) {
  const p = seg(t, t0, t0 + 0.4);
  if (t < t0) { op(c.g, 0); return; }
  op(c.g, seg(t, t0, t0 + 0.12));
  tf(c.g, c.x, c.y + 40 * (1 - E.out(p)), lerp(0.8, 1, E.back(p)), -1.2 * (1 - p) - 0.6);
}

// 印章
function stampEl(parent, str, { size = 200, color = C.red, family = F.sans, padX = 50, padY = 26, border = 12 } = {}) {
  const g = el('g', {}, parent);
  const inner = el('g', { filter: 'url(#stampInk)' }, g);
  const w = measure(str, size, family, 900) + padX * 2, h = size * 1.08 + padY * 2;
  el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 22, fill: 'none', stroke: color, 'stroke-width': border }, inner);
  el('rect', { x: -w / 2 + border * 1.8, y: -h / 2 + border * 1.8, width: w - border * 3.6, height: h - border * 3.6, rx: 12, fill: 'none', stroke: color, 'stroke-width': border * 0.35 }, inner);
  txt(inner, str, { x: 0, y: size * 0.36, 'font-size': size, 'font-family': family, 'font-weight': 900, fill: color, 'text-anchor': 'middle' });
  return { g, w, h };
}
function stampAnim(s, t, t0, x, y, rot) {
  if (t < t0 - 0.09) { op(s.g, 0); return; }
  const p = seg(t, t0 - 0.09, t0);
  const after = Math.max(0, t - t0);
  const bounce = 1 + 0.05 * Math.sin(after * 30) * Math.exp(-after * 9);
  op(s.g, p < 1 ? 0.3 + 0.7 * p : 0.93);
  tf(s.g, x, y, lerp(2.6, 1, E.in(p)) * bounce, rot);
}

function heartPath(s = 1) {
  return `M0 ${30 * s}C${-40 * s} 0 ${-50 * s} ${-30 * s} ${-25 * s} ${-45 * s}C${-10 * s} ${-52 * s} 0 ${-40 * s} 0 ${-30 * s}C0 ${-40 * s} ${10 * s} ${-52 * s} ${25 * s} ${-45 * s}C${50 * s} ${-30 * s} ${40 * s} 0 0 ${30 * s}Z`;
}

// ============================================================
// 猫（胖橘）
// ============================================================
const LW = 7; // 描边
function catHead(parent) {
  const g = el('g', {}, parent);
  const S = { stroke: C.navy, 'stroke-width': LW, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const mkEar = (sx) => {
    const eg = el('g', {}, g);
    const e2 = el('g', { transform: `scale(${sx} 1)` }, eg);
    el('path', { d: 'M -118 -24 C -126 -86 -116 -140 -100 -154 C -80 -144 -50 -118 -26 -96 Z', fill: C.orange, ...S }, e2);
    el('path', { d: 'M -102 -60 C -106 -94 -102 -118 -95 -128 C -84 -120 -68 -106 -56 -98 Z', fill: C.pink }, e2);
    return eg;
  };
  const earL = mkEar(1), earR = mkEar(-1);
  el('path', { d: 'M -130 22 C -130 -60 -72 -104 0 -104 C 72 -104 130 -60 130 22 C 130 86 72 114 0 114 C -72 114 -130 86 -130 22 Z', fill: C.orange, ...S }, g);
  const st = { stroke: C.ored, 'stroke-width': 10, 'stroke-linecap': 'round', fill: 'none' };
  el('path', { d: 'M -24 -100 Q -20 -84 -15 -70 M 0 -102 L 0 -64 M 24 -100 Q 20 -84 15 -70', ...st }, g);
  el('path', { d: 'M -127 6 L -104 12 M -124 34 L -103 34 M 127 6 L 104 12 M 124 34 L 103 34', ...st, 'stroke-width': 8 }, g);
  el('ellipse', { cx: -84, cy: 44, rx: 21, ry: 11, fill: C.pink, opacity: .8 }, g);
  el('ellipse', { cx: 84, cy: 44, rx: 21, ry: 11, fill: C.pink, opacity: .8 }, g);
  const mkEye = (x) => {
    const eg = el('g', {}, g);
    const open = el('g', {}, eg);
    const pupil = el('g', {}, open);
    el('ellipse', { cx: 0, cy: 0, rx: 18, ry: 23, fill: C.navy }, pupil);
    el('circle', { cx: 6, cy: -9, r: 7.5, fill: C.cream }, pupil);
    el('circle', { cx: -6, cy: 9, r: 3.2, fill: C.cream }, pupil);
    const closed = el('path', { d: 'M -20 -2 Q 0 14 20 -2', fill: 'none', stroke: C.navy, 'stroke-width': 7, 'stroke-linecap': 'round' }, eg);
    return { g: eg, open, pupil, closed, x, y: 8 };
  };
  const eyeL = mkEye(-48), eyeR = mkEye(48);
  el('path', { d: 'M -10 30 L 10 30 L 0 41 Z', fill: C.pink, stroke: C.navy, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, g);
  const mouth = el('path', { d: 'M -21 47 Q -10 60 0 47 Q 10 60 21 47', fill: 'none', stroke: C.navy, 'stroke-width': 5.5, 'stroke-linecap': 'round' }, g);
  const mouthO = el('g', {}, g);
  el('path', { d: 'M -17 46 Q 0 88 17 46 Z', fill: C.navy, stroke: C.navy, 'stroke-width': 4, 'stroke-linejoin': 'round' }, mouthO);
  el('ellipse', { cx: 0, cy: 66, rx: 8, ry: 6, fill: C.pink }, mouthO);
  el('path', { d: 'M -102 30 L -154 20 M -102 45 L -156 50 M 102 30 L 154 20 M 102 45 L 156 50', stroke: C.navy, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
  const cat = { g, earL, earR, eyeL, eyeR, mouth, mouthO };
  setFace(cat, {});
  return cat;
}
// open: 0..1 睁眼程度；look: 瞳孔偏移；mouthOpen；earL/earR 旋转角
function setFace(cat, { open = 1, lookX = 0, lookY = 0, mouthOpen = false, earL = 0, earR = 0, happy = false }) {
  for (const e of [cat.eyeL, cat.eyeR]) {
    const o = happy ? 0 : open;
    tf(e.g, e.x, e.y);
    show(e.open, o > 0.18); show(e.closed, o <= 0.18);
    e.open.setAttribute('transform', `scale(1 ${Math.max(o, 0.18).toFixed(3)})`);
    tf(e.pupil, lookX, lookY);
  }
  show(cat.mouth, !mouthOpen); show(cat.mouthO, mouthOpen);
  cat.earL.setAttribute('transform', `rotate(${earL} -70 -60)`);
  cat.earR.setAttribute('transform', `rotate(${-earR} 70 -60)`);
}
function blinkAt(t, times, d = 0.16) {
  let o = 1;
  for (const b of times) { const p = seg(t, b, b + d); if (p > 0 && p < 1) o = Math.min(o, Math.abs(1 - 2 * p)); }
  return o;
}
function tailEl(parent, d, width = 34) {
  const g = el('g', {}, parent);
  el('path', { d, fill: 'none', stroke: C.navy, 'stroke-width': width + LW * 2, 'stroke-linecap': 'round' }, g);
  el('path', { d, fill: 'none', stroke: C.orange, 'stroke-width': width, 'stroke-linecap': 'round' }, g);
  el('path', { d, fill: 'none', stroke: C.ored, 'stroke-width': width, 'stroke-linecap': 'butt', 'stroke-dasharray': '10 34', 'stroke-dashoffset': -20 }, g);
  return g;
}
// 正面坐姿
function catSit(parent) {
  const g = el('g', { filter: 'url(#boil)' }, parent);
  const tail = tailEl(g, 'M 0 0 C 90 0 150 -50 132 -150');
  tf(tail, 90, 285);
  const S = { stroke: C.navy, 'stroke-width': LW, 'stroke-linejoin': 'round' };
  const body = el('g', {}, g);
  el('path', { d: 'M -96 70 C -146 150 -146 284 -84 304 L 84 304 C 146 284 146 150 96 70 Z', fill: C.orange, ...S }, body);
  el('path', { d: 'M -52 112 C -74 172 -64 262 0 272 C 64 262 74 172 52 112 Z', fill: C.cream }, body);
  el('path', { d: 'M -134 178 L -106 184 M -140 222 L -110 226 M 134 178 L 106 184 M 140 222 L 110 226', stroke: C.ored, 'stroke-width': 9, 'stroke-linecap': 'round' }, body);
  const paws = el('g', {}, g);
  for (const x of [-46, 46]) {
    el('ellipse', { cx: x, cy: 300, rx: 36, ry: 23, fill: C.cream, ...S }, paws);
    el('path', { d: `M ${x - 10} 290 L ${x - 10} 304 M ${x + 10} 290 L ${x + 10} 304`, stroke: C.navy, 'stroke-width': 4, 'stroke-linecap': 'round' }, paws);
  }
  const headWrap = el('g', {}, g);
  const head = catHead(headWrap);
  return { g, tail, body, paws, headWrap, head };
}
// 侧面跑姿（原点：身体中心；朝右）
function catRun(parent) {
  const g = el('g', {}, parent);
  const inner = el('g', { filter: 'url(#boil)' }, g);
  const tail = tailEl(inner, 'M 0 0 C -60 -6 -110 -40 -128 -96', 30);
  tf(tail, -140, -10);
  const S = { stroke: C.navy, 'stroke-width': LW, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const legs = [];
  for (const [x, back] of [[-96, 1], [-56, 0], [66, 1], [106, 0]]) {
    const lg = el('g', {}, inner);
    el('rect', { x: -17, y: -6, width: 34, height: 80, rx: 17, fill: back ? C.ored : C.orange, ...S }, lg);
    el('ellipse', { cx: 0, cy: 70, rx: 21, ry: 14, fill: C.cream, ...S }, lg);
    legs.push({ g: lg, x, ph: back ? 0 : Math.PI });
  }
  el('ellipse', { cx: 0, cy: 0, rx: 158, ry: 74, fill: C.orange, ...S }, inner);
  el('path', { d: 'M -70 -70 Q -60 -40 -66 -18 M -20 -74 Q -12 -44 -18 -20 M 30 -72 Q 36 -44 30 -22', stroke: C.ored, 'stroke-width': 11, 'stroke-linecap': 'round', fill: 'none' }, inner);
  el('path', { d: 'M -90 30 Q 0 70 90 30 Q 60 66 0 70 Q -60 66 -90 30 Z', fill: C.cream }, inner);
  const headWrap = el('g', {}, inner);
  const head = catHead(headWrap);
  tf(headWrap, 150, -52, 0.78);
  return { g, inner, tail, legs, headWrap, head };
}
function runCycle(c, t, speed = 14, amp = 38) {
  c.legs.forEach(l => {
    const a = Math.sin(t * speed + l.ph) * amp;
    tf(l.g, l.x, 40, 1, a);
  });
  c.tail.setAttribute('transform', `translate(-140 -10) rotate(${Math.sin(t * speed * 0.5) * 12})`);
}
// 趴姿（踩键盘后）：原点身体底部中心
function catLoaf(parent) {
  const g = el('g', {}, parent);
  const inner = el('g', { filter: 'url(#boil)' }, g);
  const S = { stroke: C.navy, 'stroke-width': LW, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const tail = tailEl(inner, 'M 196 -30 C 240 10 180 40 60 36', 30);
  el('path', { d: 'M -214 0 C -224 -110 -150 -176 0 -176 C 150 -176 224 -110 214 0 Z', fill: C.orange, ...S }, inner);
  el('path', { d: 'M -20 -172 Q -6 -140 -14 -112 M 40 -172 Q 52 -140 44 -112 M 100 -160 Q 108 -132 98 -106', stroke: C.ored, 'stroke-width': 12, 'stroke-linecap': 'round', fill: 'none' }, inner);
  for (const x of [-120, -40]) el('ellipse', { cx: x, cy: -4, rx: 38, ry: 20, fill: C.cream, ...S }, inner);
  const headWrap = el('g', {}, inner);
  const head = catHead(headWrap);
  tf(headWrap, -110, -150, 0.86);
  return { g, inner, tail, headWrap, head };
}
// 蜷睡（原点：身体中心）
function catCurl(parent) {
  const g = el('g', {}, parent);
  const inner = el('g', { filter: 'url(#boil)' }, g);
  const S = { stroke: C.navy, 'stroke-width': LW, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  el('path', { d: 'M -190 40 C -200 -80 -110 -140 10 -140 C 140 -140 210 -70 200 40 C 196 100 120 120 0 120 C -120 120 -186 100 -190 40 Z', fill: C.orange, ...S }, inner);
  el('path', { d: 'M 20 -136 Q 34 -104 24 -76 M 80 -128 Q 96 -98 84 -70 M 136 -104 Q 150 -78 136 -52 M 170 -60 Q 180 -36 166 -16', stroke: C.ored, 'stroke-width': 12, 'stroke-linecap': 'round', fill: 'none' }, inner);
  const headWrap = el('g', {}, inner);
  const head = catHead(headWrap);
  tf(headWrap, -80, 10, 0.82, -12);
  const tail = tailEl(inner, 'M 196 50 C 190 130 20 150 -110 112', 34);
  return { g, inner, headWrap, head, tail };
}


export { NS, C, F, LW, el, txt, tf, op, show, clamp, seg, lerp, E, pop, rng, measure, chars, charsPop, charsIdle, halftone, radial, edge, bg, caption, captionAnim, stampEl, stampAnim, heartPath, catHead, setFace, blinkAt, tailEl, catSit, catRun, runCycle, catLoaf, catCurl };
