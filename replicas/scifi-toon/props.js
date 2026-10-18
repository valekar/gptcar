// Isolated generic prop/creature/portal factories, LemoLab MIT. No original world set implementation.
// worlds.js — 每个平行宇宙一套配色的背景、客串外星人、传送门
// 舞台坐标：1920×1080，地平线/地面约 y=900；背景画得比舞台宽，给推拉摇留余量
import { clamp, lerp, hash, vnoise, TAU, ss } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, bands, S } from './toon.js';
import { eye, mouth, hand, vask, PAL } from './chars.js';

export function jellyRect(x, y, w, h, r, t, amp, ph) {
  const k = Math.sin(t * 5.2 + ph) * amp;
  return rr(x, y, w, h, r).map(([px, py]) => [px + k * (y + h - py) / h, py + Math.sin(t * 5.2 + ph + 1) * amp * .15 * (py - y - h) / h]);
}
export function portal(cx, cy, r, t, { open = 1, sx = .74, spin = 1 } = {}) {
  if (open <= .001) return;
  const R = r * open;
  push(); translate(cx, cy); scale(sx, 1);
  fillOnly(ell(0, 0, R * 1.55, R * 1.45, 48), 'rgba(140,255,90,.14)', { boil: .6 });
  fillOnly(ell(0, 0, R * 1.28, R * 1.22, 48), 'rgba(140,255,90,.18)', { boil: .6 });
  // 黏液外缘
  const rim = []; const N = 22;
  for (let i = 0; i < N; i++) { const a = i / N * TAU, k = 1 + .09 * (vnoise(i * 1.7 + t * 3) - .5) * 2 + .05 * Math.sin(a * 5 + t * 6); rim.push([Math.cos(a) * R * k, Math.sin(a) * R * k]); }
  const rimS = spline(rim);
  shape(rimS, {
    fill: '#3fd93a', lw: 8, shade: () => {
      fillOnly(ell(0, 0, R * .9, R * .9, 40), '#6ef24c', { boil: .3 });
      // 旋臂
      const arms = 5;
      for (let k = 0; k < arms; k++) {
        const pts = [], pts2 = [];
        for (let j = 0; j <= 22; j++) {
          const u = j / 22, rr_ = R * (1 - u) * .95, a = k / arms * TAU + u * 3.6 + t * 2.6 * spin;
          pts.push([Math.cos(a) * rr_, Math.sin(a) * rr_]);
          const a2 = a + .55 * (1 - u * .7); pts2.push([Math.cos(a2) * rr_, Math.sin(a2) * rr_]);
        }
        fillOnly([...pts, ...pts2.reverse()], k % 2 ? '#b8ff5a' : '#21b33c', { boil: .4 });
      }
      fillOnly(ell(0, 0, R * .3, R * .3, 24), '#dcffa8', { boil: .5 });
      fillOnly(ell(0, 0, R * .14, R * .14, 16), '#ffffff', { boil: .5 });
    }
  });
  // 火花
  for (let i = 0; i < 12; i++) {
    const a = hash(i) * TAU + t * (1.5 + hash(i + 4) * 2), d = R * (1.05 + .25 * ((t * .8 + hash(i + 9)) % 1));
    dot(Math.cos(a) * d, Math.sin(a) * d, 5 + hash(i + 2) * 4, i % 3 ? '#caff7a' : '#ffffff');
  }
  // 滴落
  if (open > .6) for (let i = 0; i < 3; i++) {
    const u = (t * .9 + i / 3) % 1, x = (-.4 + i * .4) * R, y0 = R * .92;
    shape(spline([[x - 10, y0], [x + 10, y0], [x + 7, y0 + 20 + u * 40], [x, y0 + 32 + u * 50], [x - 7, y0 + 20 + u * 40]]), { fill: '#3fd93a', lw: 6 });
  }
  pop();
}
export function jellyCounter(t) {
  shape(jellyRect(520, 700, 880, 220, 40, t, 6, 2), { fill: '#52e0e0', lw: 8, shade: () => { fillOnly(rect(520, 700, 880, 40), '#8ff2f2', { boil: .3 }); fillOnly(rect(1150, 700, 300, 300), 'rgba(0,80,100,.25)', { boil: .3 }); } });
}
export function blobby(x, y, s, t, { look = [0, 0], blink = false, o = 0, lean = 0 } = {}) {
  push(); translate(x, y); scale(s); rotate(lean);
  const w = Math.sin(t * 7) * 8;
  const body = spline([[-150, 0], [-160, -140], [-110, -250 + w], [0, -290 - w], [110, -250 + w], [160, -140], [150, 0], [0, 12]]);
  shape(body, {
    fill: '#ff7fd0', lw: 8, shade: () => {
      fillOnly(spline([[60, -280], [170, -150], [160, 20], [80, 20], [110, -150]]), '#e855b3', { boil: .3 });
      for (const [a, b, r] of [[-80, -120, 16], [-30, -60, 10], [70, -90, 13], [-100, -200, 9]]) fillOnly(ell(a, b, r, r, 12), '#c53d98', { boil: .3 });
      fillOnly(ell(-70, -220, 26, 14, 14), 'rgba(255,255,255,.7)', { boil: .2 });
    }
  });
  // 眼柄
  const top = [20 + w * 2, -430 - w];
  shape(noodle([0, -270], top, 30, 40, 26), { fill: '#ff7fd0', lw: 7 });
  eye(top[0], top[1], 58, 58, { look, lid: blink ? 1 : .1, skin: '#ff7fd0', pupil: 7 });
  // 嘴 + 口水
  mouth(-10, -140, 110, { o: .35 + o * .5 + Math.abs(Math.sin(t * 3)) * .1, sm: .6, lw: 7 });
  const dr = (t * 1.2) % 1;
  shape(spline([[-40, -120], [-28, -120], [-30, -90 + dr * 60], [-36, -80 + dr * 70], [-42, -90 + dr * 60]]), { fill: '#c9f7ff', lw: 5 });
  // 三只小手
  shape(noodle([-140, -120], [-230, -170 + Math.sin(t * 5) * 20], 30, 36, 26), { fill: '#ff7fd0', lw: 7 });
  shape(noodle([140, -120], [230, -60], -30, 36, 26), { fill: '#ff7fd0', lw: 7 });
  pop();
}
export function jellyCup(x, y, s, t, { blink = 0 } = {}) {
  push(); translate(x, y); scale(s);
  shape([[-110, -200], [110, -200], [85, 0], [-85, 0]], { fill: '#f7f3ea', lw: 8, shade: () => fillOnly([[40, -210], [120, -210], [95, 10], [30, 10]], '#d9d1c1', { boil: .3 }) });
  shape(ell(0, -200, 112, 26, 30), { fill: '#e8e0d0', lw: 8 });
  const k = Math.sin(t * 8) * 6;
  shape(jellyRect(-95, -330, 190, 150, 30, t * 1.5, 10, 0), { fill: '#7fe03a', lw: 8, shade: () => { fillOnly(rect(20, -340, 120, 200), 'rgba(30,110,20,.3)', { boil: .3 }); fillOnly(rr(-70, -310, 26, 70, 12), 'rgba(255,255,255,.65)', { boil: .2 }); } });
  eye(5 + k * .5, -262, 44, 44, { look: [.1, .15], lid: blink, skin: '#7fe03a', pupil: 9 });
  pop();
}
export function umbrella(x, y, s, col = '#ff5a5a') {
  push(); translate(x, y); scale(s);
  stroke([[0, -300], [0, 0]], 8);
  const top = [[-230, -300], ...arc(0, -300, 230, 110, Math.PI, TAU, 20).slice(1, -1), [230, -300]];
  shape([...top, [230, -300], [0, -300]], { fill: '#fff5e6', lw: 7, shade: () => { for (let k = -2; k <= 2; k += 2) fillOnly([[0, -410], [k * 60 - 50, -290], [k * 60 + 50, -290]], col, { boil: .3 }); } });
  pop();
}
export function table(x, y, s = 1) {
  push(); translate(x, y); scale(s);
  shape(rr(-12, -150, 24, 150, 6), { fill: '#e0d4c0', lw: 6 });
  shape(ell(0, -150, 150, 26, 30), { fill: '#fff5e6', lw: 7 });
  shape(ell(0, 0, 70, 12, 20), { fill: '#e0d4c0', lw: 6 });
  pop();
}
export function mugGuy(x, y, s, t, { col = '#e9e2f5', look = [0, 0], turn = 0, lick = 0, sip = 0, lid = .45, guyLevel = 1, page = 0 } = {}) {
  push(); translate(x, y); scale(s);
  // 把手
  shape(spline([[120, -260], [215, -250], [225, -130], [120, -110], [120, -150], [178, -160], [178, -225], [120, -222]]), { fill: col, lw: 8 });
  shape(rr(-130, -330, 260, 330, 36), { fill: col, lw: 8, shade: () => { fillOnly(rect(60, -340, 90, 360), 'rgba(0,0,0,.14)', { boil: .3 }); fillOnly(rect(-140, -290, 300, 26), '#ff7a2f', { boil: .3 }); } });
  shape(ell(0, -330, 130, 30, 30), { fill: '#6b3e26', lw: 8 });
  const fx = turn * 30;
  eye(-45 + fx, -200, 30, 32, { look, lid, pupil: 5, skin: col });
  eye(35 + fx, -200, 30, 32, { look, lid, pupil: 5, skin: col });
  stroke([[-78 + fx, -250], [-20 + fx, -240]], 7); stroke([[10 + fx, -240], [68 + fx, -250]], 7);
  mouth(-5 + fx, -120, 60, { o: sip ? .15 : lick * .4, sm: .5, lw: 6, tongue: true });
  if (lick > 0) shape(spline([[-5 + fx + 20 * lick, -110], [20 + fx + 20 * lick, -104], [10 + fx + 20 * lick, -86], [-12 + fx + 20 * lick, -92]]), { fill: '#e8637a', lw: 5 });
  pop();
}
export function glassGuy(x, y, s, t, { level = 1, page = 0, wave = 0 } = {}) {
  push(); translate(x, y); scale(s);
  const lv = -150 + (1 - level) * 90;
  shape([[-60, -180], [60, -180], [50, 0], [-50, 0]], { fill: 'rgba(210,240,255,.55)', lw: 7, shade: () => fillOnly(rect(-80, lv, 160, 200), '#9c5a32', { boil: .3 }) });
  // 小人：头、报纸
  push(); translate(0, lv - 4);
  shape(ell(0, -30, 20, 22, 18), { fill: '#f2c9a0', lw: 5 });
  dot(-6, -32, 2.5); dot(7, -32, 2.5); stroke([[-6, -20], [6, -20]], 3);
  stroke(arc(0, -44, 18, 10, Math.PI * 1.1, Math.PI * 1.9, 8), 4);
  const pg = page % 1;
  shape([[-50, -40], [0, -34], [0, 6], [-50, 0]], { fill: '#f4f1ea', lw: 4 });
  shape([[0, -34], [50 - pg * 60, -40 - Math.sin(pg * Math.PI) * 20], [50 - pg * 60, 0 - Math.sin(pg * Math.PI) * 20], [0, 6]], { fill: '#eae6dc', lw: 4 });
  for (let k = 0; k < 3; k++) stroke([[-44, -28 + k * 9], [-8, -26 + k * 9]], 2);
  if (wave) { shape(noodle([18, -10], [40, -50 - Math.sin(t * 16) * 8], -6, 8, 7), { fill: '#f2c9a0', lw: 4 }); }
  pop();
  pop();
}
export function tooth(x, y, s, col = '#fffaf2') {
  push(); translate(x, y); scale(s);
  shape(spline([[-90, -200], [-30, -220], [0, -195], [30, -220], [90, -200], [100, -110], [70, 0], [40, 0], [20, -60], [-20, -60], [-40, 0], [-70, 0], [-100, -110]]), { fill: col, lw: 8 });
  pop();
}
export function molar(x, y, s, t, { chomp = 0 } = {}) {
  push(); translate(x, y); scale(s);
  const hop = Math.abs(Math.sin(t * 9)) * 30;
  translate(0, -hop);
  const jaw = chomp * 40;
  shape(spline([[-160, -330], [-50, -370], [0, -330], [50, -370], [160, -330], [180, -160], [120, 0], [60, 0], [30, -90], [-30, -90], [-60, 0], [-120, 0], [-180, -160]]), { fill: '#fffaf2', lw: 9, shade: () => fillOnly(rect(80, -380, 140, 400), '#e9e0d6', { boil: .3 }) });
  eye(-55, -240, 34, 38, { look: [0, .2], pupil: 5, skin: '#fffaf2' });
  eye(45, -240, 34, 38, { look: [0, .2], pupil: 5, skin: '#fffaf2' });
  stroke([[-100, -300], [-25, -280]], 9); stroke([[15, -280], [90, -300]], 9);
  mouth(0, -150, 130, { o: .3 + jaw / 60, sm: -.2, lw: 8 });
  pop();
}
export function pigeon(x, y, s, t, { tie = true, coo = 0 } = {}) {
  push(); translate(x, y); scale(s);
  const bob = Math.floor(t * 6) % 2 ? 18 : -6;
  shape(spline([[-150, -60], [-110, -230], [60, -250], [150, -150], [120, -30], [0, 0]]), { fill: '#8c96ad', lw: 8, shade: () => { fillOnly(spline([[-140, -150], [-40, -120], [40, -60], [-80, -20]]), '#6c7690', { boil: .3 }); } });
  push(); translate(bob, 0);
  shape(spline([[40, -230], [70, -330], [150, -350], [190, -300], [160, -210], [90, -190]]), { fill: '#7a84a0', lw: 8, shade: () => fillOnly(rect(20, -250, 200, 50), '#4fb39a', { boil: .4 }) });
  shape([[185, -310], [245, -296], [186, -284]], { fill: '#e8b43c', lw: 6 });
  eye(150, -305, 18, 18, { look: [.6, 0], pupil: 4, skin: '#7a84a0', lid: .2 });
  pop();
  if (tie) { shape([[40, -190], [80, -190], [70, -110], [60, -60], [50, -110]], { fill: '#e8392b', lw: 6 }); }
  pop();
}
export function cafeCounter(t) {
  shape(rect(380, 600, 1160, 300), { fill: '#a8744a', lw: 8, shade: () => { for (let x = 380; x < 1540; x += 90) stroke([[x, 640], [x, 900]], 3, { line: '#8c5e3a' }); } });
  shape(rr(350, 580, 1220, 40, 8), { fill: '#e9dcc4', lw: 7 });
  // 咖啡机
  shape(rr(1180, 410, 260, 176, 14), { fill: '#c9ccd2', lw: 7, shade: () => fillOnly(rect(1360, 400, 100, 200), '#a9adb5', { boil: .3 }) });
  shape(rr(1230, 380, 160, 36, 8), { fill: '#8e939c', lw: 6 });
  dot(1250, 460, 10, '#3fb56b'); dot(1290, 460, 10, '#e8b43c');
}
export function barista(x, y, s, t, { arm = 0, o = 0 } = {}) {
  push(); translate(x, y); scale(s);
  shape(spline([[-120, 0], [-130, -180], [-90, -300], [90, -300], [130, -180], [120, 0]]), { fill: '#3f8a5e', lw: 8, shade: () => fillOnly(rr(-70, -260, 140, 260, 20), '#f4f1ea', { boil: .3 }) });
  shape(noodle([-20, -310], [-20, -350], 0, 40, 40), { fill: '#f0c19a', lw: 6 });
  shape(ell(0, -420, 90, 86, 40), { fill: '#f0c19a', lw: 8 });
  shape(spline([[-92, -440], [-60, -505], [0, -515], [60, -505], [92, -440], [60, -470], [0, -478], [-60, -470]]), { fill: '#7a4a2e', lw: 7 });
  shape(ell(0, -530, 40, 34, 24), { fill: '#7a4a2e', lw: 7 });   // 发髻
  stroke(arc(-32, -420, 16, 12, Math.PI * 1.1, Math.PI * 1.9, 8), 6); stroke(arc(32, -420, 16, 12, Math.PI * 1.1, Math.PI * 1.9, 8), 6);
  fillOnly(ell(-55, -385, 16, 8, 10), '#f59a8c', { boil: .3 }); fillOnly(ell(55, -385, 16, 8, 10), '#f59a8c', { boil: .3 });
  mouth(0, -372, 80, { o: .3 + o * .3, sm: 1.2, lw: 6, tongue: false });
  // 递咖啡的手
  const hx = lerp(80, 330, arm), hy = lerp(-150, -230, arm);
  shape(noodle([100, -270], [hx, hy], 20, 42, 34), { fill: '#3f8a5e', lw: 7 });
  hand(hx, hy, -.2, 20, '#f0c19a', { fist: true });
  pop();
  return [x + lerp(80, 330, arm) * s, y + lerp(-150, -230, arm) * s];
}


export function straw(a,b){shape(noodle(a,b,0,14,14),{fill:'#ff5a8a',lw:5})}
