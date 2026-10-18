// Attributed generic leader/dimension primitives adapted from the MIT style overlay helper.
// Original scene labels, story application and end card are not reused.
import * as THREE from 'three';
import {clamp,seg,ss,eo} from '/core/lib.js';
export function makeMarks(canvas,camera){
const g=canvas.getContext('2d'),texts=[],SANS='"NotoSC", sans-serif',MONO='"JBMono", "NotoSC", monospace',LAT='"Inter", "NotoSC", sans-serif';
const INK='#f1efe9',DIM='rgba(241,239,233,.62)',ACC='#ff6b3d',LINE='rgba(241,239,233,.75)';
const v3 = new THREE.Vector3();
let CAM=camera, Wd=1920, Hd=1080;
const proj = v => { v3.copy(v).project(CAM); return [(v3.x + 1) / 2 * Wd, (1 - v3.y) / 2 * Hd, v3.z]; };
const fade = (t, a, d = .3) => ss(seg(t, a, a + d));

// one label: anchor dot + leader (diagonal then horizontal) + index / name / spec
function label(t, o) {
  const { t0, t1, a, lx, ly, idx, name, spec, id, align = 'left' } = o;
  const dl = eo(seg(t, t0, t0 + .38)), tx = fade(t, t0 + .18, .32), out = 1 - fade(t, t1 - .3, .3);
  if (dl <= 0 || out <= 0) return;
  const [ax, ay] = a, dir = align === 'left' ? 1 : -1, ex = lx - dir * 34;
  g.globalAlpha = out;
  g.fillStyle = INK; g.beginPath(); g.arc(ax, ay, 3.2, 0, 7); g.fill();
  g.strokeStyle = 'rgba(241,239,233,.35)'; g.lineWidth = 1; g.beginPath(); g.arc(ax, ay, 3.2 + 6 * dl, 0, 7); g.stroke();
  const s1 = Math.hypot(ex - ax, ly - ay), s2 = Math.abs(lx - dir * 14 - ex), len = (s1 + s2) * dl;
  g.strokeStyle = LINE; g.lineWidth = 1.3; g.beginPath(); g.moveTo(ax, ay);
  if (len <= s1) g.lineTo(ax + (ex - ax) * len / s1, ay + (ly - ay) * len / s1);
  else { g.lineTo(ex, ly); g.lineTo(ex + dir * (len - s1), ly); }
  g.stroke();
  if (tx <= 0) return;
  g.globalAlpha = out * tx; const dx = (1 - tx) * 10 * dir;
  g.textAlign = align; g.textBaseline = 'alphabetic';
  const nx = align === 'left' ? lx + (idx ? 34 : 0) : lx;
  if (idx) { g.fillStyle = ACC; g.font = `500 15px ${MONO}`; g.fillText(idx, lx + dx, ly - 6); }
  g.fillStyle = INK; g.font = `500 30px ${SANS}`; g.fillText(name, nx + dx, ly + 4);
  let w = g.measureText(name).width;
  if (spec) { g.fillStyle = DIM; g.font = `400 17px ${MONO}`; g.fillText(spec, nx + dx, ly + 30); w = Math.max(w, g.measureText(spec).width); }
  g.textAlign = 'left';
  if (tx > .99 && out > .99) {
    const x0 = align === 'left' ? lx : lx - w - 4, x1 = align === 'left' ? nx + w + 4 : lx;
    texts.push({ id, text: name + (spec ? ' ' + spec : ''), x0: Math.max(0, x0), y0: ly - 26, x1: Math.min(Wd, x1), y1: ly + (spec ? 36 : 12) });
  }
}

// dimension line between two 3D points, offset already applied by the caller; ext = [[from, to], …] extension lines
function dimension(t, o) {
  const { t0, t1, A, B, ext = [], text, id, sub } = o;
  const k = eo(seg(t, t0, t0 + .55)), out = 1 - fade(t, t1 - .3, .3);
  if (k <= 0 || out <= 0) return;
  const a = proj(A), b = proj(B), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  g.globalAlpha = out; g.strokeStyle = ACC; g.lineWidth = 1.4;
  for (const [p, q] of ext) { const p1 = proj(p), q1 = proj(q); g.beginPath(); g.moveTo(p1[0], p1[1]); g.lineTo(p1[0] + (q1[0] - p1[0]) * k, p1[1] + (q1[1] - p1[1]) * k); g.stroke(); }
  g.beginPath(); g.moveTo(mx + (a[0] - mx) * k, my + (a[1] - my) * k); g.lineTo(mx + (b[0] - mx) * k, my + (b[1] - my) * k); g.stroke();
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  for (const p of [a, b]) { g.save(); g.translate(p[0], p[1]); g.rotate(ang - Math.PI / 4); g.beginPath(); g.moveTo(-6 * k, 0); g.lineTo(6 * k, 0); g.stroke(); g.restore(); }
  const tA = fade(t, t0 + .35, .3); if (tA <= 0) return;
  // text sits on the side of the line away from the object, never upside down
  let ra = ang; if (ra > Math.PI / 2) ra -= Math.PI; if (ra < -Math.PI / 2) ra += Math.PI;
  g.save(); g.translate(mx, my); g.rotate(ra); g.globalAlpha = out * tA; g.textAlign = 'center';
  g.font = `500 22px ${MONO}`; const w = g.measureText(text).width;
  g.fillStyle = 'rgba(14,15,17,.72)'; g.fillRect(-w / 2 - 8, -34, w + 16, 30);
  g.fillStyle = INK; g.fillText(text, 0, -11);
  if (sub) { g.font = `400 16px ${SANS}`; g.fillStyle = DIM; g.fillText(sub, 0, -42); }
  g.restore(); g.textAlign = 'left';
  if (tA > .99 && out > .99) texts.push({ id, text: (sub ? sub + ' ' : '') + text, x0: mx - w / 2 - 30, y0: my - 64, x1: mx + w / 2 + 30, y1: my + 30 });
}


return{g,project:proj,label,dimension,begin(){texts.length=0;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,1920,1080);g.globalAlpha=1}};
}
