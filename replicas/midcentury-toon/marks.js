// Reusable style helpers adapted from LemoLab MIT film.js; no original scenes/renderFilm.
import { PAL, setClock, shape, plane, ink, rays, ellipse, rect, rrect, spline, move, xform, star, sparkle, text, fit, measure, arrow, dashed,
  paperFinish, kidney, boomerang, subpath, pointAt, plen, clamp, lerp, seg, ss, eo, eio, back, twos, TAU, hash } from './engine/toon.js';
import { drawOwner, drawPip, drawDock, drawHand, armJoints } from './engine/chars.js';
import { icon } from './engine/icons.js';

const W=1920,H=1080,BEAT=60/132;let C,COL,SUBS;export const configure=(content,palette,subs)=>{C=content;COL=palette;SUBS=subs};const subs=()=>SUBS;
const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, k) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
const tint = (c, k) => mix(c, '#FFFFFF', k), shade = (c, k) => mix(c, '#2B2420', k);

function cam(ctx, cx, cy, z = 1, r = 0) { ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.rotate(r); ctx.translate(-cx, -cy); }
const w2s = (x, y, c) => { const dx = x - c.cx, dy = y - c.cy, co = Math.cos(c.r || 0), si = Math.sin(c.r || 0); return [W / 2 + c.z * (co * dx - si * dy), H / 2 + c.z * (si * dx + co * dy)]; };
function bg(ctx, col) { ctx.fillStyle = col; ctx.fillRect(-4000, -4000, 9920, 9080); }
const B = (s, b) => s.t0 + b * BEAT;          // absolute time of beat b in section s
const pop = (t, t0, d = 0.28) => back(seg(t, t0, t0 + d), 1.9);
function blinkAt(u, ts) { return ts.some(b => u > b && u < b + 0.13) ? 1 : 0; }
const colsOf = () => ({ product: COL.product, productD: COL.productD });

// 1950s caption card
function subtitle(ctx, t) {
  const cue = subs().find(s => t >= s.t0 && t < s.t1); if (!cue) return;
  const a = Math.min(ss(seg(t, cue.t0, cue.t0 + 0.16)), 1 - ss(seg(t, cue.t1 - 0.16, cue.t1)));
  const f = fit(ctx, cue.text, '500 {px}px Jost', 42, 1280, 1, 30);
  const w = measure(ctx, f.lines[0], f.font) + 120, h = 78, x = W / 2 - w / 2, y = H - 60 - h;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 10);
  shape(ctx, rrect(x, y, w, h, 12), { fill: COL.paper, line: 3.2, seed: 901, grain: 0.15, breaks: 0.08, off: [5, 5] });
  star(ctx, x + 30, y + h / 2, 14, { n: 8, inner: 0.4, fill: COL.accent, off: [0, 0], rot: t * 0.8 });
  star(ctx, x + w - 30, y + h / 2, 14, { n: 8, inner: 0.4, fill: COL.accent, off: [0, 0], rot: -t * 0.8 });
  text(ctx, f.lines[0], W / 2, y + h / 2 + f.px * 0.34, { font: f.font, fill: COL.ink, align: 'center' });
  ctx.restore();
}
// step header: ink numeral badge + slab title (slides in on twos)
function stepHeader(ctx, t, s, label, num) {
  const k = eo(seg(twos(t), s.t0 + 0.05, s.t0 + 0.4));
  if (k <= 0) return;
  ctx.save(); ctx.translate(-(1 - k) * 520, 0);
  shape(ctx, ellipse(128, 132, 54, 54, 40), { fill: COL.ink, line: 0, seed: 700, grain: 0.1, off: [0, 0] });
  if (typeof num === 'number') text(ctx, String(num), 128, 154, { font: '62px Slab', fill: COL.paper, align: 'center' });
  else star(ctx, 128, 132, 40, { n: 12, inner: 0.6, fill: COL.accent, off: [0, 0] }), text(ctx, num, 128, 141, { font: '24px Slab', fill: PAL.white, align: 'center' });
  const small = typeof num === 'number' ? `STEP ${num} OF ${C.steps.length}` : '';
  if (small) text(ctx, small, 206, 104, { font: '600 22px Jost', fill: COL.ink, track: 6 });
  const f = fit(ctx, label, '{px}px Slab', 64, 1100, 1, 40);
  text(ctx, f.lines[0], 204, small ? 170 : 156, { font: f.font, fill: COL.ink, plate: PAL.white, off: [4, 4] });
  ctx.restore();
}
// detail tag: paper card with an accent star, pops on its beat
function tag(ctx, t, t0, str, x, y, o = {}) {
  const k = pop(t, t0); if (k <= 0) return null;
  const f = fit(ctx, str, '500 {px}px Jost', o.px || 36, o.maxW || 620, 2, 24);
  const w = Math.max(...f.lines.map(l => measure(ctx, l, f.font))) + 96, h = 30 + f.lines.length * f.px * 1.2;
  const X = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
  ctx.save(); ctx.translate(X + w / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-(X + w / 2), -(y + h / 2));
  shape(ctx, rrect(X, y, w, h, 14), { fill: COL.paper, line: 3.6, seed: 710, grain: 0.15, off: [6, 5] });
  star(ctx, X + 38, y + h / 2, 17, { n: 8, inner: 0.42, fill: COL.accent, off: [0, 0], rot: t * 0.6 });
  f.lines.forEach((l, i) => text(ctx, l, X + 66, y + 15 + f.px * 0.92 + i * f.px * 1.2, { font: f.font, fill: COL.ink }));
  ctx.restore();
  return { x: X, y, w, h };
}
// frame-in-frame detail circle (the manual's magnifier call-out) with a leader line to its subject
function callout(ctx, t, t0, cx, cy, r, inner, bgc, leader) {
  const k = back(seg(t, t0, t0 + 0.32), 1.5); if (k <= 0) return;
  const R = r * k;
  if (leader) { const a = Math.atan2(leader[1] - cy, leader[0] - cx); dashed(ctx, [[cx + Math.cos(a) * (R + 14), cy + Math.sin(a) * (R + 14)], leader], 4, 14, 10, -t * 40, COL.ink, clamp(k)); shape(ctx, ellipse(leader[0], leader[1], 9, 9, 12), { fill: COL.ink, line: 0, off: [0, 0], grain: 0 }); }
  shape(ctx, ellipse(cx, cy, R + 16, R + 16, 72), { fill: COL.paper, line: 4.5, seed: 720, grain: 0.15, breaks: 0.05 });
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
  ctx.fillStyle = bgc; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  ctx.translate(cx, cy); ctx.scale(k, k); inner(ctx); ctx.restore();
  ink(ctx, ellipse(cx, cy, R, R, 72), 4, { closed: true, seed: 721, breaks: 0.1 });
}
// the step stamp: a numbered medallion that lands on the outgoing scene's subject one beat before the cut
function medallionAt(ctx, t, tStamp, x, y, i, r = 104) {
  const k = pop(t, tStamp, 0.24); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate((1 - k) * 0.4);
  star(ctx, 0, 0, r * 1.2, { n: 16, inner: 0.84, fill: PAL.white, off: [0, 0], rot: i * 0.2 });
  shape(ctx, ellipse(0, 0, r, r, 64), { fill: COL.steps[i % COL.steps.length], line: 5, seed: 730 + i, grain: 0.3 });
  text(ctx, String(i + 1), 0, r * 0.38, { font: `${Math.round(r * 1.1)}px Slab`, fill: COL.ink, plate: PAL.white, off: [5, 5], align: 'center' });
  ctx.restore();
}

function kneelPose(x, fy, s, handF, handB, u, face) {
  // arms solved (2-bone IK) so the flat hands sit on the given world points
  const pose = { x, y: fy, s, dir: 1, view: 'q', kneel: true, face, blink: blinkAt(u, [0.9, 3.6]), handF: 'flat', handB: 'flat' };
  const ik = (which, target) => {
    const sh = armJoints({ ...pose, armF: { a1: 0, a2: 0 }, armB: { a1: 0, a2: 0 } }, which).sh;
    const sx = x + sh[0] * s, sy = fy + (sh[1] + 150) * s;
    const dx = (target[0] - sx) / s, dy = (target[1] - sy) / s, d = Math.min(Math.hypot(dx, dy), 190), base = Math.atan2(dy, dx);
    const a = Math.acos(clamp((100 * 100 + d * d - 92 * 92) / (2 * 100 * d), -1, 1));
    const a1 = base - a, el = [Math.cos(a1) * 100, Math.sin(a1) * 100];
    const a2 = Math.atan2(dy * d / Math.hypot(dx, dy) - el[1], dx * d / Math.hypot(dx, dy) - el[0]);
    return { a1, a2 };
  };
  pose.armF = ik('F', handF); pose.armB = ik('B', handB);
  return pose;
}
function drawItem(ctx, it) {
  const cut = (pts, fill, seed, sh = PAL.paperDD) => shape(ctx, pts, { fill, line: 4.2, seed, grain: 0.3, shade: [{ pts: move(pts, 12, 12), color: sh, alpha: 0.5 }] });
  if (it.shape === 'sofa') { const k = kidney(it.x, it.y, it.s, it.rot || 0); cut(k, it.color, 233);
    [-0.55, -0.18, 0.18, 0.55].forEach((f, i) => shape(ctx, ellipse(it.x + f * it.s * 1.35, it.y - it.s * 0.02 + Math.abs(f) * 10, it.s * 0.2, it.s * 0.14, 20), { fill: it.accent, line: 3, seed: 234 + i, grain: 0.25 })); }
  else if (it.shape === 'boomerang') cut(boomerang(it.x, it.y, it.s, it.rot || 0), it.color, 232, PAL.brown);
  else if (it.shape === 'chair') { const p = spline([[it.x - 64, it.y - 58], [it.x + 64, it.y - 64], [it.x + 72, it.y + 58], [it.x - 58, it.y + 66]], true, 6); cut(p, it.color, 240);
    shape(ctx, spline([[it.x - 36, it.y - 30], [it.x + 40, it.y - 34], [it.x + 44, it.y + 32], [it.x - 30, it.y + 38]], true, 6), { fill: it.accent, line: 3, seed: 241, grain: 0.25 }); }
  else if (it.shape === 'plant') { star(ctx, it.x, it.y, it.s, { n: 9, inner: 0.35, fill: it.color, line: 3.5, rot: 0.2 }); shape(ctx, ellipse(it.x, it.y, it.s * 0.33, it.s * 0.33, 16), { fill: PAL.brown, line: 3, seed: 243 }); }
  else if (it.shape === 'table') { for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.785; shape(ctx, ellipse(it.x + Math.cos(a) * it.s * 1.35, it.y + Math.sin(a) * it.s * 1.35, it.s * 0.36, it.s * 0.36, 24), { fill: it.accent, line: 3.5, seed: 251 + i, grain: 0.3 }); }
    cut(ellipse(it.x, it.y, it.s, it.s, 56), it.color, 250); sparkle(ctx, it.x, it.y, it.s * 0.3, { fill: COL.accent }); }
  else if (it.shape === 'kidney') { const k = kidney(it.x, it.y, it.s, it.rot || 0); cut(k, it.color, 261, shade(it.color, 0.25)); if (it.accent) ink(ctx, kidney(it.x, it.y, it.s * 0.75, it.rot || 0), 3, { closed: true, color: it.accent, seed: 262, breaks: 0.4 }); }
  else if (it.shape === 'bed') { const e = ellipse(it.x, it.y, it.s, it.s * 0.6, 40); cut(e, it.color, 263, shade(it.color, 0.25));
    for (let i = 0; i < 9; i++) { const a = i * 2.4, r = it.s * 0.55 * Math.sqrt((i + 0.5) / 9); star(ctx, it.x + Math.cos(a) * r, it.y + Math.sin(a) * r * 0.6, 14, { n: 5, inner: 0.45, fill: i % 2 ? PAL.white : (it.accent || PAL.mustard), off: [0, 0] }); } }
  else cut(ellipse(it.x, it.y, it.s || 60, it.s || 60, 40), it.color || PAL.white, 260);
}

export{cam,w2s,bg,B,pop,blinkAt,colsOf,subtitle,stepHeader,tag,callout,medallionAt,kneelPose,drawItem,tint,shade,mix};
