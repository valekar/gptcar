// Attributed MIT isolated canopy, capsule and instrument-panel factories; no boss world, camera, route or performance.
import {P,K,setCtx} from './toon.js';import*as INK from './m_ink.js';import*as BL from './m_blue.js';import*as AS from './m_ascii.js';import {drawDot} from './chars.js';import{clamp,seg,eo,ss,lerp}from'/core/lib.js';const TAU=Math.PI*2;
export function inkCanopy(g, C, hem, R, H, grow, capTop, o = {}) {
  INK.clearInk();
  const z = o.z || 1, q = clamp(grow);
  if (q <= 0) { INK.print(g, { layer: true }); return; }
  const [hx, hy] = C(hem[0], hem[1]), [tx, ty] = C(capTop[0], capTop[1]);
  const Rz = R * z, Hz = H * z;
  const cen = [hx, hy - Hz * .45];
  // 1) 墨滴从舱顶喷出（0–.1）
  if (q < .16) {
    const u = eo(q / .1), px = lerp(tx, cen[0], u), py = lerp(ty, cen[1], u);
    INK.stroke([[tx, ty], [lerp(tx, px, .5), lerp(ty, py, .5) + 10], [px, py]], { w: 22 * z, tone: .9, dry: .15, wet: true, prof: 'nail', seed: 400 });
    INK.blot(px, py, (18 + 60 * seg(q, .08, .16)) * z, .9, 401, true, .3);
  }
  // 2) 圆墨滴洇开（.1–.3），3) 墨滴横向摊开成伞形、伞瓣分开（.28–1）
  const fan = ss(seg(q, .28, .85));
  if (q >= .08 && fan < .3) {
    const br = lerp(30, Rz * .32, eo(seg(q, .08, .28)));
    INK.blot(cen[0], cen[1], br * (1 + fan * 1.2), .85 * (1 - fan / .3), 402, true, .1);
  }
  if (fan > 0) {
    const N = 9, rx = Rz * (.36 + .64 * fan), ry = Hz * (.5 + .5 * fan), apex = [hx, hy - ry];
    const ix = INK.ix; ix.save(); ix.globalCompositeOperation = 'lighter';
    const split = seg(q, .45, .85);   // 伞瓣缝逐渐出现
    for (let i = 0; i < N; i++) {
      const a0 = Math.PI + i / N * Math.PI, a1 = Math.PI + (i + 1) / N * Math.PI;
      const gap = .007 * split;
      const e = Math.abs((i + .5) / N - .5) * 2;   // 0 = 中心，1 = 边
      const top = (.82 - .3 * e - (i % 2 ? .07 * split : 0)) * (.5 + .5 * fan), bot = top * .5;
      const pA = [hx + Math.cos(a0 + gap) * rx, hy + Math.sin(a0 + gap) * ry], pB = [hx + Math.cos(a1 - gap) * rx, hy + Math.sin(a1 - gap) * ry];
      const gr = ix.createLinearGradient(0, apex[1], 0, hy + 30 * z);
      gr.addColorStop(0, `rgba(255,0,0,${top})`); gr.addColorStop(1, `rgba(255,0,0,${bot})`);
      ix.beginPath(); ix.moveTo(apex[0], apex[1] + 2);
      for (let k = 0; k <= 10; k++) { const a = a0 + gap + (a1 - a0 - 2 * gap) * k / 10; ix.lineTo(hx + Math.cos(a) * rx, hy + Math.sin(a) * ry); }
      ix.lineTo(pB[0], hy); ix.quadraticCurveTo((pA[0] + pB[0]) / 2, hy + 34 * z * fan, pA[0], hy);
      ix.closePath(); ix.fillStyle = gr; ix.fill();
    }
    ix.restore();
    // 伞顶轮廓：一笔饱墨弧（上浓下淡的"负笔"）
    const arcP = []; for (let k = 0; k <= 20; k++) { const a = Math.PI * 1.04 + Math.PI * .92 * k / 20; arcP.push([hx + Math.cos(a) * rx * .99, hy + Math.sin(a) * ry * .99]); }
    INK.stroke(arcP, { w: 16 * z, tone: .7, dry: .3, wet: true, prof: 'brush', seed: 420, darkSide: -1, draw: fan });
    // 伞沿：干笔飞白（每瓣一笔短扫）
    for (let i = 0; i < N; i++) { const xa = hx + Math.cos(Math.PI + i / N * Math.PI) * rx, xb = hx + Math.cos(Math.PI + (i + 1) / N * Math.PI) * rx; INK.stroke([[xa, hy - 6], [(xa + xb) / 2, hy + 22 * z * fan], [xb, hy - 6]], { w: 12 * z, tone: .6, dry: .72, prof: 'even', seed: 450 + i, draw: split }); }
    // 伞绳：干笔细线
    if (q > .7) for (let i = 0; i <= N; i++) { const a = Math.PI + i / N * Math.PI, x = hx + Math.cos(a) * rx; INK.stroke([[x, hy + 8], [tx + (i - N / 2) * 5, ty]], { w: 3 * z, tone: .6, dry: .4, prof: 'even', seed: 440 + i, draw: seg(q, .7, 1) }); }
  }
  // 喷出瞬间的甩墨点（只在前半段）
  if (q < .6) INK.splatter(cen[0], cen[1], Rz * 1.2, seg(q, .05, .5), 230, 18, .7);
  if (o.dust) INK.dust(...o.dust);
  INK.print(g, { layer: true });
}
// ───────── 蓝图返回舱（C = 世界→屏幕，z = 缩放）─────────
export function blueCapsule(g, cx, cy, s, o = {}) {
  const w0 = 90 * s, w1 = 150 * s, h = 170 * s;
  g.save();
  g.fillStyle = '#e9eef5';
  g.beginPath(); g.moveTo(cx - w0 - 10, cy - h / 2 - 10); g.lineTo(cx + w0 + 10, cy - h / 2 - 10); g.lineTo(cx + w1 + 12, cy + h / 2 + 6); g.quadraticCurveTo(cx, cy + h / 2 + 70 * s, cx - w1 - 12, cy + h / 2 + 6); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(cx - w0, cy - h / 2); g.lineTo(cx + w0, cy - h / 2); g.lineTo(cx + w1, cy + h / 2); g.quadraticCurveTo(cx, cy + h / 2 + 60 * s, cx - w1, cy + h / 2); g.closePath(); g.clip();
  BL.paper(g);
  g.restore();
  BL.setDraw(1);
  const L = BL.WT, k = Math.max(1, s / 1.35) * .9;
  BL.bl(g, [[cx - w0, cy - h / 2], [cx + w0, cy - h / 2], [cx + w1, cy + h / 2]], L.out * k);
  BL.bl(g, [[cx - w0, cy - h / 2], [cx - w1, cy + h / 2]], L.out * k);
  const shield = []; for (let i = 0; i <= 30; i++) { const u = i / 30; shield.push([lerp(cx - w1, cx + w1, u), cy + h / 2 + Math.sin(u * Math.PI) * 60 * s]); }
  BL.bl(g, shield, L.out * k); BL.bl(g, [[cx - w1, cy + h / 2], [cx + w1, cy + h / 2]], L.det * k);
  for (let i = 1; i < 9; i++) { const u = i / 9; BL.bl(g, [[lerp(cx - w1, cx + w1, u) - 12 * s / 1.35, cy + h / 2 + 4], [lerp(cx - w1, cx + w1, u) + 8 * s / 1.35, cy + h / 2 + Math.sin(u * Math.PI) * 56 * s]], L.hair * k); }
  BL.bl(g, [[cx, cy - h / 2 - 30 * s], [cx, cy + h / 2 + 80 * s]], L.hair * k, { dash: [24, 6, 5, 6] });
  BL.bl(g, BL.rectPts(cx - 36 * s, cy - h / 2 - 26 * s, 72 * s, 26 * s), L.det * k);
  BL.label(g, 'RE-ENTRY CAPSULE  SCALE 1:20', cx - w0 + 14 * s, cy - h / 2 + 20 * s, 15 * s);
  if (o.dims !== false) BL.dim(g, cx - w1, cy + h / 2 + 70 * s, cx + w1, cy + h / 2 + 70 * s, 'Ø 3.9 m', { off: 20 });
  // 舷窗 + Dot（"家"画风）
  const pr = 46 * s, px = cx, py = cy - 6 * s;
  g.save(); g.beginPath(); g.arc(px, py, pr, 0, TAU); g.fillStyle = '#10204a'; g.fill(); g.clip();
  const ps = K.s; setCtx(g);
  g.save(); g.translate(px, py + 12 * s); g.scale(s * .72, s * .72); g.translate(0, 172);
  K.s = s * .72; drawDot(0, 0, 1, { face: o.face || 'determined', look: o.look, view: 'front', pose: 'stand', ant: o.ant || 0 });
  g.restore(); K.s = ps;
  g.restore();
  BL.bl(g, BL.arcPts(px, py, pr), L.out * k); BL.bl(g, BL.arcPts(px, py, pr + 9 * s), L.thin * k);
  return { top: [cx, cy - h / 2 - 26 * s], port: [px, py], shieldY: cy + h / 2 + 60 * s };
}
// ───────── ASCII 高度表（小，右上角）─────────
export function asciiPanel(g, alt, t, o = {}) {
  AS.clearAscii();
  const c0 = 97, r0 = 1;
  AS.type('+--------------------+', c0, r0); for (let r = 1; r <= 3; r++) { AS.type('|', c0, r0 + r); AS.type('|', c0 + 21, r0 + r); } AS.type('+--------------------+', c0, r0 + 4);
  AS.type(`ALT ${String(Math.max(0, Math.round(alt))).padStart(6, '0')} m`, c0 + 2, r0 + 1);
  const n = Math.round(clamp(Math.log10(Math.max(1, alt)) / 5.1) * 16);
  AS.type('[' + '#'.repeat(n) + '.'.repeat(16 - n) + ']', c0 + 2, r0 + 3);
  if (o.warn && Math.floor(t * 4) % 2) AS.type(' CHUTE? ', c0 + 7, r0 + 2, { inv: true });
  const out = AS.render({ flat: true, time: t });
  const x = c0 * AS.CW - 16, y = r0 * AS.CH - 12, w = 22 * AS.CW + 32, h = 5 * AS.CH + 24;
  g.save(); g.fillStyle = '#1a1030'; g.beginPath(); g.roundRect(x - 10, y - 10, w + 20, h + 20, 18); g.fill();
  g.beginPath(); g.roundRect(x, y, w, h, 12); g.clip(); g.drawImage(out, 0, 0); g.restore();
}
