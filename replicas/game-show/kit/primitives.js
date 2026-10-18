// Shared MIT generic assets/helpers only; exact source ranges are itemized in CREDITS. No upstream scene assembly or render.
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
const FPS = 30, DUR = 148.8;

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


function bg(parent, color) { return el('rect', { width: 1920, height: 1080, fill: color }, parent); }

function heartPath(s = 1) {
  return `M0 ${30 * s}C${-40 * s} 0 ${-50 * s} ${-30 * s} ${-25 * s} ${-45 * s}C${-10 * s} ${-52 * s} 0 ${-40 * s} 0 ${-30 * s}C0 ${-40 * s} ${10 * s} ${-52 * s} ${25 * s} ${-45 * s}C${50 * s} ${-30 * s} ${40 * s} 0 0 ${30 * s}Z`;
}

const K = {
  ol: '#1B1B1B', white: '#FFFFFF', cream: '#FFF6E5', yellow: '#FFD23F', orange: '#FF8C42', red: '#FF5A5F',
  pink: '#FF8FB1', purple: '#6B4FBB', purpleD: '#46318F', teal: '#3FB8AF', tealD: '#2B8F88', blue: '#4D7CFE',
  navy: '#26264A', sky: '#8ED1FC', green: '#5BD68A', wood: '#C98A52', woodD: '#8E5530', gray: '#C3CAD9',
  skin: '#FFD1A8', gpt: '#19B388', claude: '#D97757', gem1: '#4E7CF6', gem2: '#9B6CF0', llama: '#F4E9D8',
  whale: '#4D6BFE', dblue: '#2B59C3', chalk: '#2F5D50', lime: '#C6F16D',
};
F.round = "'Fredoka', 'Noto Sans SC'";
const OW = 8;
const SO = { stroke: K.ol, 'stroke-width': OW, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };

const BPM = 150, B = 60 / BPM, BARL = 4 * B;
const at = (bar, beat = 0) => (bar * 4 + beat) * B;
const END_BAR = 93;
window.DUR = at(END_BAR);

// ---------------- 事件登记 ----------------
const EV = [];
const PUNCH = [];
function ev(t, s, o = {}) { EV.push({ t: +t.toFixed(4), s, ...o }); }
function punch(t, a = 0.018) { PUNCH.push([t, a]); }
window.EV = EV;

// 节拍工具
const frac = (t) => ((t / B) % 1 + 1) % 1;
const hopY = (t, h = 40) => { const f = frac(t); return -h * 4 * f * (1 - f); };
// 在 t0 处被“打”一下的挤压值
const hitSq = (t, t0, amt = 0.2) => (t >= t0 && t < t0 + 0.35) ? 1 - amt * Math.exp(-(t - t0) * 14) * Math.cos((t - t0) * 30) : 1;
const near = (t, t0, a = 0.05, b = 0.22) => t >= t0 - a && t < t0 + b;
function gtext(parent, s, x, y, size, o = {}) {
  return txt(parent, s, { x, y, 'font-size': size, 'font-family': o.family || F.sans, 'font-weight': o.weight || 900, fill: o.fill || K.white,
    stroke: o.stroke || K.ol, 'stroke-width': o.sw ?? size * 0.14, 'paint-order': 'stroke', 'stroke-linejoin': 'round', 'text-anchor': o.anchor || 'middle' });
}

// ---------------- 通用视觉 ----------------
function stripes(parent, col, w = 60, angle = -30) {
  const g = el('g', { transform: `rotate(${angle} 960 540)` }, parent);
  let d = '';
  for (let x = -1400; x < 3400; x += w * 2) d += `M${x} -1400 h${w} v3900 h${-w} Z`;
  el('path', { d, fill: col }, g);
  return g;
}
function dots(parent, col, step = 70, r = 10) {
  let d = '';
  for (let y = 0; y < 1180; y += step) for (let x = ((y / step) % 2) * step / 2; x < 2000; x += step) d += `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  return el('path', { d, fill: col }, parent);
}
function raysEl(parent, n, col) {
  const g = el('g', {}, parent);
  for (let i = 0; i < n; i += 2) {
    const a = i / n * Math.PI * 2, da = Math.PI / n;
    el('path', { d: `M0 0 L${Math.cos(a - da) * 1600} ${Math.sin(a - da) * 1600} L${Math.cos(a + da) * 1600} ${Math.sin(a + da) * 1600} Z`, fill: col }, g);
  }
  return g;
}
function starPath(n, r1, r2) {
  let d = '';
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? r2 : r1; d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`; }
  return d + 'Z';
}
// 打击特效（星爆 + 圆环），返回每帧更新函数
function burst(parent, x, y, t0, col = K.yellow, size = 1) {
  const g = el('g', {}, parent);
  const ring = el('circle', { cx: 0, cy: 0, r: 50, fill: 'none', stroke: K.white, 'stroke-width': 10 }, g);
  el('path', { d: starPath(8, 70, 28), fill: col, ...SO, 'stroke-width': 6 }, g);
  const lines = el('g', { stroke: K.ol, 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2; el('line', { x1: Math.cos(a) * 90, y1: Math.sin(a) * 90, x2: Math.cos(a) * 130, y2: Math.sin(a) * 130 }, lines); }
  op(g, 0);
  return (t) => {
    const p = (t - t0) / 0.3;
    if (p < 0 || p > 1) { op(g, 0); return; }
    op(g, 1 - p * p);
    tf(g, x, y, size * (0.55 + 0.7 * E.out(p)), p * 30);
    ring.setAttribute('r', 50 + 60 * p); ring.setAttribute('stroke-width', 10 * (1 - p));
  };
}
function judge(parent, word, x, y, t0, col = K.pink, dur = 1.0) {
  const g = el('g', {}, parent);
  gtext(g, word, 0, 0, 120, { family: F.round, weight: 700, fill: col, sw: 18 });
  op(g, 0);
  return (t) => {
    if (t < t0 || t > t0 + dur) { op(g, 0); return; }
    op(g, 1 - seg(t, t0 + dur - 0.2, t0 + dur));
    tf(g, x, y - 20 * E.out(seg(t, t0, t0 + dur)), E.back(seg(t, t0, t0 + 0.25)), -6);
  };
}
// 年代横幅
function banner(parent, year, name, sub, col) {
  const g = el('g', {}, parent);
  const yw = measure(year, 64, F.round, 700), nw = measure(name, 54, F.sans, 900), sw = measure(sub, 34, F.sans, 900);
  const W = Math.max(yw + 26 + nw, sw) + 64, H = 158;
  el('rect', { x: 10, y: 10, width: W, height: H, rx: 24, fill: K.ol }, g);
  el('rect', { x: 0, y: 0, width: W, height: H, rx: 24, fill: col, ...SO, 'stroke-width': 7 }, g);
  gtext(g, year, 32, 74, 64, { family: F.round, weight: 700, anchor: 'start', sw: 12 });
  gtext(g, name, 32 + yw + 26, 72, 54, { anchor: 'start', sw: 12 });
  txt(g, sub, { x: 34, y: 128, 'font-size': 34, 'font-family': F.sans, 'font-weight': 900, fill: K.ol });
  return { g };
}
function bannerAnim(b, t, t0, t1, x = 56, y = 44) {
  if (t < t0 || t >= t1) { op(b.g, 0); return; }
  op(b.g, 1);
  const pin = E.back(seg(t, t0, t0 + 0.35)), pout = E.in(seg(t, t1 - 0.2, t1));
  tf(b.g, lerp(-900, x, pin), y - 260 * pout, 1, lerp(-6, -1.5, pin));
}


function robotDB(parent) {
  const g = el('g', {}, parent);
  const body = el('g', {}, g);
  el('rect', { x: -100, y: -200, width: 200, height: 200, rx: 26, fill: K.dblue, ...SO }, body);
  const lights = [0, 1, 2].map(i => el('circle', { cx: -40 + i * 40, cy: -120, r: 12, fill: K.yellow, ...SO, 'stroke-width': 5 }, body));
  el('rect', { x: -60, y: -70, width: 120, height: 34, rx: 8, fill: '#1E3F8F', ...SO, 'stroke-width': 5 }, body);
  const head = el('g', {}, body);
  el('rect', { x: -120, y: -380, width: 240, height: 170, rx: 28, fill: '#DDE3EE', ...SO }, head);
  el('rect', { x: -96, y: -360, width: 192, height: 126, rx: 16, fill: '#16233F', ...SO, 'stroke-width': 5 }, head);
  const face = el('g', { fill: K.lime }, head);
  el('rect', { x: -60, y: -330, width: 30, height: 30 }, face); el('rect', { x: 30, y: -330, width: 30, height: 30 }, face);
  const mouth = el('rect', { x: -40, y: -276, width: 80, height: 12 }, face);
  el('line', { x1: 0, y1: -380, x2: 0, y2: -420, stroke: K.ol, 'stroke-width': 7 }, head);
  const bulb = el('circle', { cx: 0, cy: -428, r: 14, fill: K.red, ...SO, 'stroke-width': 6 }, head);
  const arm = el('g', {}, g);
  const aO = el('line', { stroke: K.ol, 'stroke-width': 40, 'stroke-linecap': 'round' }, arm);
  const aI = el('line', { stroke: K.gray, 'stroke-width': 26, 'stroke-linecap': 'round' }, arm);
  const hand = el('circle', { r: 24, fill: K.dblue, ...SO, 'stroke-width': 6 }, arm);
  return { g, body, lights, bulb, mouth, arm: { aO, aI, hand } };
}
function robotAG(parent) {
  const g = el('g', {}, parent);
  const body = el('g', {}, g);
  el('path', { d: 'M -80 0 C -90 -80 -60 -150 0 -150 C 60 -150 90 -80 80 0 Z', fill: K.white, ...SO }, body);
  el('rect', { x: -44, y: -100, width: 88, height: 20, rx: 10, fill: K.blue }, body);
  const head = el('g', {}, body);
  el('circle', { cx: 0, cy: -270, r: 118, fill: K.white, ...SO }, head);
  el('circle', { cx: 0, cy: -262, r: 58, fill: K.ol }, head);
  const pupil = el('circle', { cx: 12, cy: -276, r: 16, fill: K.white }, head);
  el('path', { d: 'M -100 -330 Q 0 -410 100 -330', fill: 'none', stroke: K.blue, 'stroke-width': 14, 'stroke-linecap': 'round' }, head);
  const arm = el('g', {}, g);
  const aO = el('line', { stroke: K.ol, 'stroke-width': 40, 'stroke-linecap': 'round' }, arm);
  const aI = el('line', { stroke: K.white, 'stroke-width': 26, 'stroke-linecap': 'round' }, arm);
  const hand = el('circle', { r: 24, fill: K.white, ...SO, 'stroke-width': 6 }, arm);
  return { g, body, pupil, arm: { aO, aI, hand } };
}
function robotT(parent) {
  // Transformer 拳击机器人（原点=脚底）
  const g = el('g', {}, parent);
  const body = el('g', {}, g);
  for (const x of [-50, 50]) el('rect', { x: x - 26, y: -60, width: 52, height: 64, rx: 12, fill: K.gray, ...SO }, body);
  el('rect', { x: -120, y: -300, width: 240, height: 250, rx: 36, fill: K.yellow, ...SO }, body);
  el('rect', { x: -70, y: -220, width: 140, height: 90, rx: 14, fill: K.ol }, body);
  txt(body, '注意力', { x: 0, y: -160, 'font-size': 36, 'font-family': F.sans, 'font-weight': 900, fill: K.lime, 'text-anchor': 'middle' });
  const head = el('g', {}, body);
  el('rect', { x: -100, y: -470, width: 200, height: 160, rx: 40, fill: K.yellow, ...SO }, head);
  el('rect', { x: -76, y: -430, width: 152, height: 60, rx: 30, fill: K.ol }, head);
  const visor = el('g', { fill: '#5CF2FF' }, head);
  el('circle', { cx: -34, cy: -400, r: 14 }, visor); el('circle', { cx: 34, cy: -400, r: 14 }, visor);
  el('path', { d: 'M -20 -345 Q 0 -332 20 -345', fill: 'none', stroke: K.ol, 'stroke-width': 7, 'stroke-linecap': 'round' }, head);
  el('line', { x1: 0, y1: -470, x2: 0, y2: -510, stroke: K.ol, 'stroke-width': 7 }, head);
  el('circle', { cx: 0, cy: -516, r: 14, fill: K.red, ...SO, 'stroke-width': 6 }, head);
  const mkGlove = () => { const gl = el('g', {}, g); el('path', { d: 'M -46 -40 C -70 -40 -76 40 -40 46 L 40 46 C 70 40 70 -40 40 -46 Z', fill: K.red, ...SO }, gl); el('path', { d: 'M -20 -40 C -40 -20 -40 10 -20 20', fill: 'none', stroke: K.ol, 'stroke-width': 6 }, gl); return gl; };
  const armB = el('g', {}, g);
  const aO = el('line', { stroke: K.ol, 'stroke-width': 42, 'stroke-linecap': 'round' }, armB);
  const aI = el('line', { stroke: K.gray, 'stroke-width': 28, 'stroke-linecap': 'round' }, armB);
  const glove = mkGlove();
  const glove2 = mkGlove();
  return { g, body, visor, arm: { aO, aI }, glove, glove2 };
}

// ---------------- 棋盘（透视四边形） ----------------
const BQ = { tl: [700, 600], tr: [1220, 600], br: [1330, 770], bl: [590, 770] };
function quad(u, v) {
  const top = [lerp(BQ.tl[0], BQ.tr[0], u), lerp(BQ.tl[1], BQ.tr[1], u)];
  const bot = [lerp(BQ.bl[0], BQ.br[0], u), lerp(BQ.bl[1], BQ.br[1], u)];
  return [lerp(top[0], bot[0], v), lerp(top[1], bot[1], v)];
}
function quadPoly(u0, v0, u1, v1) { return [quad(u0, v0), quad(u1, v0), quad(u1, v1), quad(u0, v1)].map(p => p.map(n => n.toFixed(1)).join(',')).join(' '); }
function pawn(parent, col, king = false) {
  const g = el('g', {}, parent);
  const h = king ? 1.35 : 1;
  el('path', { d: `M -26 0 L 26 0 L 20 -14 L 10 -18 C 16 ${-40 * h} 10 ${-52 * h} 0 ${-52 * h} C -10 ${-52 * h} -16 ${-40 * h} -10 -18 L -20 -14 Z`, fill: col, ...SO, 'stroke-width': 5 }, g);
  el('circle', { cx: 0, cy: -58 * h, r: 13, fill: col, ...SO, 'stroke-width': 5 }, g);
  if (king) el('path', { d: `M 0 ${-92} L 0 ${-72} M -9 ${-84} L 9 ${-84}`, stroke: K.ol, 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
  return g;
}


// ---------------- 角色 v2：16 个模型 ----------------
function bean(parent, o) {
  const { color, belly = null, antenna = K.white, name = null, kind = 'bot', eyeFill = K.ol, acc = null, ant = null, tagCol = K.ol } = o;
  const g = el('g', {}, parent);
  const body = el('g', {}, g);
  const mkArm = () => { const a = el('g', {}, body); el('rect', { x: -14, y: -4, width: 28, height: 70, rx: 14, fill: color, ...SO }, a); el('circle', { cx: 0, cy: 70, r: 17, fill: K.white, ...SO, 'stroke-width': 6 }, a); return a; };
  const armL = mkArm(), armR = mkArm();
  for (const x of [-34, 34]) el('ellipse', { cx: x, cy: -8, rx: 30, ry: 15, fill: color, ...SO }, body);
  if (kind === 'llama') for (const sx of [-1, 1]) el('path', { d: `M ${sx * 30} -160 C ${sx * 34} -230 ${sx * 60} -250 ${sx * 64} -210 C ${sx * 66} -180 ${sx * 56} -160 ${sx * 50} -150 Z`, fill: color, ...SO }, body);
  if (kind === 'whale') el('path', { d: 'M 70 -60 C 120 -70 140 -120 130 -150 C 110 -130 90 -120 76 -110 Z', fill: color, ...SO }, body);
  el('path', { d: 'M -80 -20 C -88 -112 -52 -172 0 -172 C 52 -172 88 -112 80 -20 C 72 -2 -72 -2 -80 -20 Z', fill: color, ...SO }, body);
  if (belly) el('ellipse', { cx: 0, cy: -48, rx: 44, ry: 32, fill: belly }, body);
  if (acc === 'noise') { const r = rng(77); for (let i = 0; i < 26; i++) el('circle', { cx: (r() - .5) * 120, cy: -30 - r() * 120, r: 3 + r() * 5, fill: [K.pink, K.yellow, K.lime, K.white][i % 4] }, body); }
  if (acc === 'mask') el('path', { d: 'M -70 -128 Q 0 -146 70 -128 L 66 -96 Q 0 -110 -66 -96 Z', fill: K.ol }, body);
  // 头顶
  if (kind === 'llama') {
    for (const [x, y, r] of [[-22, -168, 20], [0, -176, 22], [22, -168, 20]]) el('circle', { cx: x, cy: y, r, fill: K.white, ...SO, 'stroke-width': 6 }, body);
  } else if (kind === 'whale') {
    el('path', { d: 'M 0 -172 C -6 -196 -30 -206 -40 -196 M 0 -172 C 6 -196 30 -206 40 -196 M 0 -172 L 0 -206', fill: 'none', stroke: K.sky, 'stroke-width': 10, 'stroke-linecap': 'round' }, body);
  } else if (acc === 'beret') {
    el('ellipse', { cx: 12, cy: -168, rx: 74, ry: 24, fill: '#2B2F77', ...SO, transform: 'rotate(-12 12 -168)' }, body);
    el('circle', { cx: 16, cy: -196, r: 9, fill: '#2B2F77', ...SO, 'stroke-width': 5 }, body);
  } else if (acc === 'captain') {
    el('path', { d: 'M -60 -150 C -60 -210 60 -210 60 -150 Z', fill: K.white, ...SO }, body);
    el('path', { d: 'M -78 -150 L 78 -150 L 70 -134 L -70 -134 Z', fill: K.ol }, body);
    el('circle', { cx: 0, cy: -176, r: 10, fill: K.yellow, ...SO, 'stroke-width': 4 }, body);
  } else if (ant) {
    el('line', { x1: 0, y1: -172, x2: 0, y2: -206, stroke: K.ol, 'stroke-width': 7 }, body);
    const a = el('g', { transform: 'translate(0 -222)' }, body);
    if (ant === 'q') txt(a, '?', { x: 0, y: 18, 'font-size': 56, 'font-family': F.round, 'font-weight': 700, fill: K.yellow, stroke: K.ol, 'stroke-width': 7, 'paint-order': 'stroke', 'text-anchor': 'middle' });
    if (ant === 'bolt') el('path', { d: 'M 6 -26 L -14 4 L 0 4 L -6 28 L 16 -4 L 2 -4 Z', fill: K.yellow, ...SO, 'stroke-width': 5 }, a);
    if (ant === 'moon') el('path', { d: 'M 8 -22 A 22 22 0 1 0 8 22 A 16 16 0 1 1 8 -22 Z', fill: K.yellow, ...SO, 'stroke-width': 5 }, a);
    if (ant === 'heart') el('path', { d: heartPath(0.55), fill: K.red, ...SO, 'stroke-width': 5 }, a);
    if (ant === 'cloud') el('path', { d: 'M -26 10 C -40 10 -40 -10 -24 -10 C -24 -26 0 -30 6 -16 C 20 -24 34 -10 26 4 C 36 10 30 20 20 18 L -24 18 Z', fill: K.white, ...SO, 'stroke-width': 5 }, a);
    if (ant === 'sprout') { el('path', { d: 'M 0 10 C -30 -4 -30 -24 -6 -20 Z', fill: K.green, ...SO, 'stroke-width': 5 }, a); el('path', { d: 'M 0 10 C 30 -4 30 -24 6 -20 Z', fill: K.green, ...SO, 'stroke-width': 5 }, a); }
    if (ant === 'brush') { el('rect', { x: -6, y: -30, width: 12, height: 40, fill: K.wood, ...SO, 'stroke-width': 4 }, a); el('path', { d: 'M -10 -30 C -10 -50 10 -50 10 -30 Z', fill: K.red, ...SO, 'stroke-width': 4 }, a); }
  } else if (antenna) {
    el('line', { x1: 0, y1: -172, x2: 0, y2: -214, stroke: K.ol, 'stroke-width': 7 }, body);
    el('circle', { cx: 0, cy: -220, r: 15, fill: antenna, ...SO, 'stroke-width': 6 }, body);
  }
  const eyes = el('g', {}, body);
  for (const x of [-28, 28]) { el('ellipse', { cx: x, cy: -112, rx: 11, ry: 16, fill: eyeFill }, eyes); el('circle', { cx: x + 4, cy: -118, r: 4, fill: eyeFill === K.ol ? K.white : K.ol }, eyes); }
  const lc = eyeFill === K.ol ? K.ol : K.white;
  const eyesX = el('path', { d: 'M -40 -124 L -16 -100 M -16 -124 L -40 -100 M 16 -124 L 40 -100 M 40 -124 L 16 -100', stroke: lc, 'stroke-width': 7, 'stroke-linecap': 'round' }, body);
  const eyesUp = el('path', { d: 'M -40 -108 Q -28 -124 -16 -108 M 16 -108 Q 28 -124 40 -108', stroke: lc, 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, body);
  if (acc === 'mustache') el('path', { d: 'M 0 -92 C -14 -104 -34 -96 -46 -110 C -48 -98 -30 -84 0 -88 C 30 -84 48 -98 46 -110 C 34 -96 14 -104 0 -92 Z', fill: K.ol }, body);
  for (const x of [-54, 54]) el('ellipse', { cx: x, cy: -86, rx: 14, ry: 8, fill: K.pink, opacity: .85 }, body);
  const mC = el('path', { d: 'M -14 -80 Q 0 -68 14 -80', fill: 'none', stroke: lc, 'stroke-width': 6, 'stroke-linecap': 'round' }, body);
  const mO = el('g', {}, body);
  el('ellipse', { cx: 0, cy: -74, rx: 17, ry: 19, fill: K.ol, stroke: lc === K.white ? K.white : 'none', 'stroke-width': 3 }, mO);
  el('ellipse', { cx: 0, cy: -64, rx: 10, ry: 7, fill: K.red }, mO);
  let tag = null;
  if (name) {
    tag = el('g', {}, g);
    const w = measure(name, 34, F.round, 700) + 36;
    el('rect', { x: -w / 2, y: 16, width: w, height: 50, rx: 25, fill: tagCol, stroke: K.white, 'stroke-width': 4 }, tag);
    txt(tag, name, { x: 0, y: 52, 'font-size': 34, 'font-family': F.round, 'font-weight': 700, fill: K.white, 'text-anchor': 'middle' });
  }
  const c = { g, body, armL, armR, eyes, eyesX, eyesUp, mC, mO, tag };
  pose(c, {});
  return c;
}
function pose(c, { hey = 0, open = false, sq = 1, lean = 0, face = null, blink = false, armsL = null, armsR = null }) {
  const aL = armsL ?? lerp(18, 158, hey), aR = armsR ?? lerp(18, 158, hey);
  c.armL.setAttribute('transform', `translate(-72 -98) rotate(${aL})`);
  c.armR.setAttribute('transform', `translate(72 -98) rotate(${-aR})`);
  c.body.setAttribute('transform', `rotate(${lean}) scale(${(1 / Math.sqrt(sq)).toFixed(3)} ${sq.toFixed(3)})`);
  show(c.mO, open); show(c.mC, !open);
  show(c.eyes, !face && !blink); show(c.eyesX, face === 'x'); show(c.eyesUp, face === 'up' || (blink && !face));
}
function twins(parent, name = 'Gemini') {
  const g = el('g', {}, parent);
  const a = el('g', { transform: 'translate(-52 0) scale(0.72)' }, g), b = el('g', { transform: 'translate(52 0) scale(0.72)' }, g);
  const c1 = bean(a, { color: K.gem1, antenna: K.yellow }), c2 = bean(b, { color: K.gem2, antenna: K.yellow });
  const tag = el('g', {}, g);
  const w = measure(name, 34, F.round, 700) + 36;
  el('rect', { x: -w / 2, y: 16, width: w, height: 50, rx: 25, fill: K.ol, stroke: K.white, 'stroke-width': 4 }, tag);
  txt(tag, name, { x: 0, y: 52, 'font-size': 34, 'font-family': F.round, 'font-weight': 700, fill: K.white, 'text-anchor': 'middle' });
  return { g, c1, c2, tag, twin: true };
}
function poseAny(c, o) { if (c.twin) { pose(c.c1, o); pose(c.c2, { ...o, lean: -(o.lean || 0) }); } else pose(c, o); }
const CAST = {
  gpt: (p, n = 'GPT') => bean(p, { color: K.gpt, belly: '#8BE3C4', antenna: K.white, name: n }),
  claude: (p, n = 'Claude') => bean(p, { color: K.claude, belly: '#F6D3BE', antenna: K.cream, name: n }),
  gemini: (p, n = 'Gemini') => twins(p, n),
  llama: (p) => bean(p, { color: K.llama, belly: K.white, kind: 'llama', name: 'Llama' }),
  deepseek: (p) => bean(p, { color: K.whale, belly: '#BFD0FF', kind: 'whale', name: 'DeepSeek' }),
  ernie: (p) => bean(p, { color: '#3AA0FF', belly: '#C9E6FF', ant: 'heart', name: '文心一言' }),
  qwen: (p) => bean(p, { color: '#7B5CFF', belly: '#D7CCFF', ant: 'q', name: '通义千问' }),
  mistral: (p) => bean(p, { color: '#FF7A1A', belly: '#FFD2A8', acc: 'beret', name: 'Mistral' }),
  kimi: (p) => bean(p, { color: '#DADDE8', belly: K.white, ant: 'moon', name: 'Kimi' }),
  grok: (p) => bean(p, { color: '#4B505C', belly: '#8A90A0', ant: 'bolt', eyeFill: K.white, name: 'Grok' }),
  bert: (p) => bean(p, { color: '#FFB84D', belly: '#FFE2B0', acc: 'mask', eyeFill: K.white, antenna: null, name: 'BERT' }),
  dalle: (p) => bean(p, { color: '#FF6FA8', belly: '#FFD0E2', acc: 'mustache', ant: 'brush', name: 'DALL·E' }),
  mj: (p) => bean(p, { color: '#6C8CFF', belly: '#D2DCFF', acc: 'captain', name: 'Midjourney' }),
  sd: (p) => bean(p, { color: '#A7AFC2', belly: '#E3E7F0', acc: 'noise', antenna: null, name: 'Stable Diffusion' }),
  sora: (p) => bean(p, { color: '#8ED1FC', belly: K.white, ant: 'cloud', name: 'Sora' }),
  baby: (p) => bean(p, { color: K.white, belly: '#F3F3F3', ant: 'sprout', name: '???' }),
};
const ALL = ['gpt', 'claude', 'gemini', 'llama', 'deepseek', 'ernie', 'qwen', 'mistral', 'kimi', 'grok', 'bert', 'dalle', 'mj', 'sd', 'sora'];
function smallBot(parent, col) { return bean(parent, { color: col, antenna: K.yellow }); }

function human(parent, shirt = '#6C8EF5', glasses = true, hair = K.ol) {
  const g = el('g', {}, parent);
  const body = el('g', {}, g);
  el('path', { d: 'M -86 0 C -96 -100 -64 -160 0 -160 C 64 -160 96 -100 86 0 Z', fill: shirt, ...SO }, body);
  el('path', { d: 'M -30 -160 L 0 -110 L 30 -160', fill: K.white, ...SO, 'stroke-width': 6 }, body);
  const head = el('g', {}, body);
  el('circle', { cx: 0, cy: -232, r: 76, fill: K.skin, ...SO }, head);
  el('path', { d: 'M -78 -236 C -84 -320 84 -320 78 -236 C 50 -270 -40 -276 -78 -236 Z', fill: hair }, head);
  if (glasses) { const gl = el('g', { fill: 'none', stroke: K.ol, 'stroke-width': 6 }, head); el('circle', { cx: -28, cy: -232, r: 20 }, gl); el('circle', { cx: 28, cy: -232, r: 20 }, gl); el('line', { x1: -8, y1: -232, x2: 8, y2: -232 }, gl); }
  const eyes = el('g', {}, head);
  for (const x of [-28, 28]) el('circle', { cx: x, cy: -232, r: 7, fill: K.ol }, eyes);
  const mC = el('path', { d: 'M -14 -196 Q 0 -188 14 -196', fill: 'none', stroke: K.ol, 'stroke-width': 6, 'stroke-linecap': 'round' }, head);
  const mO = el('ellipse', { cx: 0, cy: -190, rx: 14, ry: 18, fill: K.ol }, head);
  const sweat = el('path', { d: 'M 70 -280 q -14 22 0 30 q 14 -8 0 -30 Z', fill: K.sky, ...SO, 'stroke-width': 4 }, head);
  const arm = el('g', {}, g);
  const aO = el('line', { stroke: K.ol, 'stroke-width': 44, 'stroke-linecap': 'round' }, arm);
  const aI = el('line', { stroke: shirt, 'stroke-width': 30, 'stroke-linecap': 'round' }, arm);
  const hand = el('circle', { r: 22, fill: K.skin, ...SO, 'stroke-width': 6 }, arm);
  return { g, body, head, eyes, mC, mO, sweat, arm: { aO, aI, hand } };
}
function humanFace(h, open, sweat) { show(h.mO, open); show(h.mC, !open); op(h.sweat, sweat ? 1 : 0); }
function setArm(a, x1, y1, x2, y2) {
  for (const l of [a.aO, a.aI]) { l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2); }
  if (a.hand) { a.hand.setAttribute('cx', x2); a.hand.setAttribute('cy', y2); }
}
function robotW(parent) {
  const g = el('g', {}, parent);
  el('circle', { cx: 0, cy: 0, r: 110, fill: '#16307A', ...SO }, g);
  const lines = el('g', { fill: 'none', stroke: '#5CF2FF', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
  for (let i = 0; i < 5; i++) el('path', { d: `M ${-80 + i * 8} ${-40 + i * 20} Q 0 ${-90 + i * 45} ${80 - i * 8} ${-40 + i * 20}`, opacity: 0.4 + 0.12 * i }, lines);
  const glow = el('circle', { cx: 0, cy: 0, r: 110, fill: '#5CF2FF', opacity: 0 }, g);
  return { g, lines, glow };
}
function podium(parent, col, label) {
  const g = el('g', {}, parent);
  el('path', { d: 'M -130 0 L 130 0 L 110 -220 L -110 -220 Z', fill: col, ...SO }, g);
  el('rect', { x: -95, y: -200, width: 190, height: 70, rx: 12, fill: K.ol }, g);
  const sc = txt(g, '$0', { x: 0, y: -150, 'font-size': 46, 'font-family': F.round, 'font-weight': 700, fill: K.lime, 'text-anchor': 'middle' });
  const light = el('rect', { x: -110, y: -110, width: 220, height: 26, rx: 8, fill: '#444', ...SO, 'stroke-width': 5 }, g);
  txt(g, label, { x: 0, y: -30, 'font-size': 38, 'font-family': F.round, 'font-weight': 700, fill: K.white, 'text-anchor': 'middle', stroke: K.ol, 'stroke-width': 6, 'paint-order': 'stroke' });
  return { g, sc, light };
}
// 通用：从天而降
function dropY(t, t0, y, h = 500, d = 0.28) { if (t < t0 - d) return null; return t < t0 ? y - h * (1 - E.in(seg(t, t0 - d, t0))) : y; }
function heyAt(arr, t, w = 0.24) { return arr.some(t0 => t >= t0 - 0.02 && t < t0 + w); }
function nearestIn(arr, t, before = 0.15, after = 0.25) { let b = null; for (const x of arr) if (t >= x - before && t < x + after) b = x; return b; }


function taskIcon(parent, kind) {
  const g = el('g', {}, parent);
  const col = { bug: K.lime, mail: K.sky, chart: K.yellow, code: K.pink, video: K.orange }[kind];
  el('rect', { x: -62, y: -62, width: 124, height: 124, rx: 24, fill: col, ...SO }, g);
  if (kind === 'bug') { el('ellipse', { cx: 0, cy: 6, rx: 26, ry: 32, fill: K.ol }, g); el('path', { d: 'M -26 -4 L -44 -14 M 26 -4 L 44 -14 M -26 16 L -44 22 M 26 16 L 44 22 M -10 -26 L -18 -40 M 10 -26 L 18 -40', stroke: K.ol, 'stroke-width': 6, 'stroke-linecap': 'round' }, g); }
  if (kind === 'mail') { el('rect', { x: -40, y: -26, width: 80, height: 54, rx: 6, fill: K.white, ...SO, 'stroke-width': 5 }, g); el('path', { d: 'M -40 -26 L 0 6 L 40 -26', fill: 'none', stroke: K.ol, 'stroke-width': 5 }, g); }
  if (kind === 'chart') { for (const [x, h] of [[-26, 30], [0, 50], [26, 70]]) el('rect', { x: x - 10, y: 36 - h, width: 20, height: h, fill: K.ol }, g); }
  if (kind === 'code') txt(g, '</>', { x: 0, y: 18, 'font-size': 50, 'font-family': F.round, 'font-weight': 700, fill: K.ol, 'text-anchor': 'middle' });
  if (kind === 'video') txt(g, '▶', { x: 4, y: 20, 'font-size': 60, 'font-family': F.round, fill: K.ol, 'text-anchor': 'middle' });
  const check = el('g', {}, g);
  el('circle', { cx: 40, cy: -40, r: 30, fill: K.green, ...SO, 'stroke-width': 5 }, check);
  el('path', { d: 'M 26 -40 L 36 -28 L 56 -52', fill: 'none', stroke: K.white, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, check);
  return { g, check };
}
function avocadoChair(parent) {
  // 分三层逐层显影
  const L = [el('g', {}, parent), el('g', {}, parent), el('g', {}, parent)];
  el('path', { d: 'M -150 120 C -170 -60 -110 -160 0 -160 C 110 -160 170 -60 150 120 Z', fill: '#9BCB4C', ...SO }, L[0]);
  el('rect', { x: -190, y: 40, width: 70, height: 120, rx: 30, fill: '#6FA83A', ...SO }, L[0]);
  el('rect', { x: 120, y: 40, width: 70, height: 120, rx: 30, fill: '#6FA83A', ...SO }, L[0]);
  el('path', { d: 'M -110 110 C -120 -20 -70 -110 0 -110 C 70 -110 120 -20 110 110 Z', fill: '#E7F2A6' }, L[1]);
  el('rect', { x: -170, y: 100, width: 340, height: 60, rx: 20, fill: '#9BCB4C', ...SO }, L[1]);
  el('circle', { cx: 0, cy: 10, r: 55, fill: '#8A5A2B', ...SO }, L[2]);
  el('circle', { cx: -18, cy: -8, r: 14, fill: '#B98555' }, L[2]);
  for (const x of [-150, 130]) el('rect', { x, y: 160, width: 20, height: 40, fill: K.woodD, ...SO, 'stroke-width': 5 }, L[2]);
  return L;
}
function castlePic(parent) {
  const L = [el('g', {}, parent), el('g', {}, parent), el('g', {}, parent), el('g', {}, parent)];
  el('rect', { x: -300, y: -200, width: 600, height: 400, fill: '#2B2F77' }, L[0]);
  for (let i = 0; i < 14; i++) el('path', { d: starPath(5, 12, 5), fill: K.yellow, transform: `translate(${-270 + (i * 97) % 540} ${-170 + (i * 53) % 140})` }, L[1]);
  el('circle', { cx: 200, cy: -120, r: 44, fill: K.cream }, L[1]);
  el('path', { d: 'M -300 200 L -300 120 Q -150 60 0 110 Q 150 60 300 120 L 300 200 Z', fill: '#3D8A5C' }, L[2]);
  el('path', { d: 'M -110 120 L -110 -20 L -80 -20 L -80 -50 L -50 -50 L -50 -20 L 50 -20 L 50 -50 L 80 -50 L 80 -20 L 110 -20 L 110 120 Z', fill: '#C9C1E8', ...SO, 'stroke-width': 6 }, L[3]);
  el('path', { d: 'M -20 120 L -20 60 Q 0 40 20 60 L 20 120 Z', fill: K.ol }, L[3]);
  for (const x of [-80, 80]) el('path', { d: `M ${x - 30} -50 L ${x} -110 L ${x + 30} -50 Z`, fill: K.red, ...SO, 'stroke-width': 6 }, L[3]);
  return L;
}
function catPic(parent) {
  const g = el('g', {}, parent);
  el('rect', { x: -300, y: -200, width: 600, height: 400, fill: '#FFE9A8' }, g);
  const c = el('g', {}, g);
  for (const sx of [-1, 1]) el('path', { d: `M ${sx * 30} -60 L ${sx * 90} -120 L ${sx * 100} -30 Z`, fill: K.orange, ...SO }, c);
  el('ellipse', { cx: 0, cy: 10, rx: 120, ry: 100, fill: K.orange, ...SO }, c);
  for (const x of [-40, 40]) el('ellipse', { cx: x, cy: 0, rx: 12, ry: 18, fill: K.ol }, c);
  el('path', { d: 'M -18 36 Q 0 50 18 36', fill: 'none', stroke: K.ol, 'stroke-width': 6 }, c);
  el('path', { d: 'M -120 150 L 120 150', stroke: K.ol, 'stroke-width': 6 }, g);
  return { g, c };
}


  function humanoid(parent, col = '#E8ECF4') {
    const g = el('g', {}, parent);
    const body = el('g', {}, g);
    const mkLimb = (len, w) => { const l = el('g', {}, body); el('rect', { x: -w / 2, y: -6, width: w, height: len, rx: w / 2, fill: col, ...SO, 'stroke-width': 6 }, l); el('circle', { cx: 0, cy: len, r: w / 2 + 2, fill: K.ol }, l); return l; };
    const legL = mkLimb(150, 34), legR = mkLimb(150, 34);
    el('rect', { x: -52, y: -300, width: 104, height: 160, rx: 30, fill: col, ...SO }, body);
    el('rect', { x: -30, y: -270, width: 60, height: 40, rx: 10, fill: '#5CF2FF', ...SO, 'stroke-width': 5 }, body);
    const armL = mkLimb(125, 28), armR = mkLimb(125, 28);
    const head = el('g', {}, body);
    el('rect', { x: -44, y: -396, width: 88, height: 86, rx: 32, fill: col, ...SO }, head);
    el('rect', { x: -34, y: -378, width: 68, height: 40, rx: 18, fill: K.ol }, head);
    for (const x of [-14, 14]) el('circle', { cx: x, cy: -358, r: 7, fill: '#5CF2FF' }, head);
    return { g, body, armL, armR, legL, legR };
  }
  function hpose(h, { aL = 10, aR = 10, lL = 0, lR = 0, rot = 0 }) {
    h.legL.setAttribute('transform', `translate(-24 -150) rotate(${lL})`);
    h.legR.setAttribute('transform', `translate(24 -150) rotate(${-lR})`);
    h.armL.setAttribute('transform', `translate(-62 -280) rotate(${aL})`);
    h.armR.setAttribute('transform', `translate(62 -280) rotate(${-aR})`);
    h.body.setAttribute('transform', `rotate(${rot} 0 -200)`);
  }
