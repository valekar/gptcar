// Attributed LemoLab MIT isolated graphic/rig factories; no original shot execution.
import{canvas,W,H,TAU,LWK,rgba,mix,vgrad,airbrush,hash,rng,poly,path,cel,line,ribbon,flutter}from'./cel.js';import{PAL}from'./pal.js';import{head80}from'./head80.js';import{speedLines,flare}from'./fx.js';const f12=t=>Math.floor(t*12+1e-6),clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),seg=(t,a,b)=>clamp((t-a)/(b-a));
export function cassette(g, P, o = {}) {
  const ra = o.reel || 0;
  // 外壳（烟灰色半透明塑料）
  cel(g, poly([[0, 12], [12, 0], [388, 0], [400, 12], [400, 244], [388, 256], [12, 256], [0, 244]]), { f: '#2c2a3a', s: '#1a1824', so: [0, -18], h: '#5a5670', ho: [0, 4], l: '#0a0a12', lw: 3 });
  // 标签
  const lab = new Path2D(); lab.roundRect(22, 18, 356, 160, 8);
  cel(g, lab, { f: '#f4ead0', s: '#d8c9a4', so: [0, -10], l: '#6a5a40', lw: 2 });
  g.fillStyle = '#ff6a3c'; g.fillRect(22, 30, 356, 10); g.fillStyle = '#ffb33c'; g.fillRect(22, 44, 356, 6); g.fillStyle = '#35b8c8'; g.fillRect(22, 54, 356, 4);
  // 手写字
  g.save(); g.fillStyle = '#23306a'; g.font = 'italic 600 40px Kanit'; g.textBaseline = 'middle'; g.translate(78, 84); g.rotate(-.04); g.fillText('CITY LIGHTS', 0, 0);
  g.font = 'italic 600 20px Kanit'; g.fillText('for the pilot — play at T-0 ♪', 4, 30); g.restore();
  g.strokeStyle = '#23306a'; g.lineWidth = 3; g.beginPath(); g.arc(50, 84, 17, 0, TAU); g.stroke();
  g.fillStyle = '#23306a'; g.font = '700 24px "Barlow SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('A', 50, 85); g.textAlign = 'left';
  // 窗 + 磁带卷
  const win = new Path2D(); win.roundRect(118, 118, 164, 50, 22);
  g.fillStyle = '#120f1a'; g.fill(win);
  g.save(); g.clip(win);
  g.fillStyle = '#5a3424'; g.beginPath(); g.arc(158, 143, 38, 0, TAU); g.fill(); g.beginPath(); g.arc(242, 143, 24, 0, TAU); g.fill();
  g.restore();
  g.strokeStyle = '#6a6680'; g.lineWidth = 2.5; g.stroke(win);
  for (const [x, a] of [[158, ra], [242, ra * 1.4]]) {
    g.fillStyle = '#eeeef4'; g.beginPath(); g.arc(x, 143, 15, 0, TAU); g.fill();
    g.fillStyle = '#2c2a3a'; g.beginPath(); g.arc(x, 143, 7, 0, TAU); g.fill();
    g.fillStyle = '#eeeef4'; for (let k = 0; k < 6; k++) { const aa = a + k * TAU / 6; g.fillRect(x + Math.cos(aa) * 6 - 1.5, 143 + Math.sin(aa) * 6 - 1.5, 3, 3); }
  }
  // 底部磁头区
  cel(g, poly([[92, 256], [116, 196], [284, 196], [308, 256]]), { f: '#26242f', l: '#0a0a12', lw: 2 });
  g.fillStyle = '#0a0a12'; for (const x of [140, 176, 224, 260]) { g.beginPath(); g.arc(x, 226, 7, 0, TAU); g.fill(); }
  g.fillStyle = '#8a8698'; for (const [x, y] of [[14, 14], [386, 14], [14, 242], [386, 242], [200, 188]]) { g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); g.strokeStyle = '#2a2838'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + 3, y); g.stroke(); }
  // 塑料上的硬边高光（光带随时间滑过）
  if (o.shine != null) {
    g.save(); g.beginPath(); g.rect(0, 0, 400, 256); g.clip();
    const x = -200 + o.shine * 900;
    g.fillStyle = rgba('#ffffff', .22); g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 70, 0); g.lineTo(x - 30, 256); g.lineTo(x - 100, 256); g.fill();
    g.fillStyle = rgba(o.shineCol || '#ff8ad8', .28); g.beginPath(); g.moveTo(x + 90, 0); g.lineTo(x + 110, 0); g.lineTo(x + 10, 256); g.lineTo(x - 10, 256); g.fill();
    g.restore();
  }
}
export function titleCard(g, e, t0, lt, o = {}) {
  const on = o.static ? 1 : lt;
  // 背景：深蓝 + 横向光条 + 细星
  vgrad(g, 0, 0, W, H, [[0, '#03021a'], [.55, '#0d0a36'], [1, '#2a0d3a']]);
  const R = rng(91); for (let i = 0; i < 180; i++) { g.fillStyle = rgba('#ffffff', .2 + R() * .5); g.fillRect(R() * W, R() * H, 2, 2); }
  if (!o.static) speedLines(g, f12(t0), { type: 'h', n: 30, col: '#6a8aff', a: .35, hmax: 4, seed: 4 });
  // 地平线光（霓虹城市的剪影）
  vgrad(g, 0, 720, W, 360, [[0, rgba('#ff3fa4', 0)], [1, rgba('#ff3fa4', .35)]]);
  const R2 = rng(12); g.fillStyle = '#07041a';
  for (let x = 0; x < W;) { const w = 40 + R2() * 110, h = 60 + R2() * 220; g.fillRect(x, H - h, w, h); x += w; }
  // 字：CITY LIGHTS（铬金属渐变 + 粗描边），透过光：前几帧按 12fps 闪两下再稳定
  const flick = o.static ? 1 : (() => { const k = Math.floor(lt * 12); return k < 1 ? 0 : k === 2 ? .3 : k === 4 ? .6 : 1; })();
  const cy = 470;
  g.save(); g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = 'italic 900 230px Kanit';
  const gr = g.createLinearGradient(0, cy - 190, 0, cy + 10);
  gr.addColorStop(0, '#e8f6ff'); gr.addColorStop(.46, '#7fc8ff'); gr.addColorStop(.5, '#ffffff'); gr.addColorStop(.54, '#3a2a7a'); gr.addColorStop(.8, '#ff6aa0'); gr.addColorStop(1, '#ffd08a');
  g.lineJoin = 'round';
  g.strokeStyle = '#120830'; g.lineWidth = 26; g.strokeText('CITY LIGHTS', W / 2, cy);
  g.strokeStyle = '#ff3fa4'; g.lineWidth = 10; g.strokeText('CITY LIGHTS', W / 2, cy);
  g.fillStyle = gr; g.fillText('CITY LIGHTS', W / 2, cy);
  g.restore();
  // 发光层：字的轮廓透过光
  e.save(); e.textAlign = 'center'; e.font = 'italic 900 230px Kanit'; e.lineJoin = 'round';
  e.strokeStyle = rgba('#ff3fa4', .9 * flick); e.lineWidth = 16; e.strokeText('CITY LIGHTS', W / 2, cy);
  e.fillStyle = rgba('#9fd8ff', .35 * flick); e.fillText('CITY LIGHTS', W / 2, cy); e.restore();
  // 片假名 + 年份
  g.save(); g.textAlign = 'center'; g.font = '64px "Dela Gothic One"'; g.fillStyle = '#35e7ff';
  g.fillText('シティ・ライツ', W / 2, cy - 250);
  e.font = '64px "Dela Gothic One"'; e.textAlign = 'center'; e.fillStyle = rgba('#35e7ff', .7 * flick); e.fillText('シティ・ライツ', W / 2, cy - 250);
  g.font = 'italic 900 150px Kanit'; g.fillStyle = '#ff2a3a'; g.strokeStyle = '#1a0610'; g.lineWidth = 14; g.lineJoin = 'round';
  g.strokeText('1987', W / 2 + 470, cy + 170); g.fillText('1987', W / 2 + 470, cy + 170);
  e.font = 'italic 900 150px Kanit'; e.textAlign = 'center'; e.fillStyle = rgba('#ff2a3a', .8 * flick); e.fillText('1987', W / 2 + 470, cy + 170);
  g.font = '600 34px "Barlow SC"'; g.fillStyle = rgba('#e8e0ff', .85); g.letterSpacing = '12px';
  g.fillText('A  NIGHTBIRD  DELIVERY', W / 2 - 180, cy + 150); g.letterSpacing = '0px';
  g.restore();
  // 光扫过字（片名的"光の走り"）
  if (!o.static) {
    const sx = -300 + seg(lt, .15, 1.2) * 2600;
    e.save(); e.globalCompositeOperation = 'lighter';
    const sg = e.createLinearGradient(sx - 120, 0, sx + 120, 0); sg.addColorStop(0, rgba('#ffffff', 0)); sg.addColorStop(.5, rgba('#ffffff', .75)); sg.addColorStop(1, rgba('#ffffff', 0));
    e.fillStyle = sg; e.fillRect(sx - 120, cy - 200, 240, 220); e.restore();
    // 星芒：字头的闪光
    const gl = seg(lt, 1.1, 1.6), ga = Math.sin(gl * Math.PI);
    if (ga > 0) flare(e, W / 2 - 610, cy - 170, .6 * ga, '#bfe6ff', { ghosts: false, streak: 700 });
    // 开场白闪
    if (lt < 2 / 24) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); }
  }
}
export function riderRear(g, P, o = {}) {
  const ph = o.ph || 0, rim = o.rim;
  // 后轮
  cel(g, [[-34, -8], [-38, -120], [-30, -230], [30, -230], [38, -120], [34, -8], [0, 4]], { f: P.tire.f, s: P.tire.s, so: [8, 0], h: P.tire.h, ho: [-4, 0], l: P.tire.l, lw: 2.5 });
  // 排气管口（右侧）
  const mc = new Path2D(); mc.ellipse(78, -178, 24, 20, 0, 0, TAU); cel(g, mc, { f: P.chrome.f, s: P.chrome.s, so: [-4, -4], l: P.chrome.l, lw: 2 });
  g.fillStyle = '#0a0a10'; g.beginPath(); g.ellipse(78, -178, 13, 11, 0, 0, TAU); g.fill();
  // 腿（两侧，膝盖外张）+ 靴子踩在脚踏上
  for (const sx of [-1, 1]) {
    cel(g, [[sx * 50, -380], [sx * 140, -380], [sx * 150, -330], [sx * 120, -250], [sx * 86, -250], [sx * 70, -330]], { f: P.pants.f, s: P.pants.s, so: [-sx * 10, -8], l: P.pants.l, lw: 2.2, rim });
    cel(g, [[sx * 82, -262], [sx * 128, -262], [sx * 134, -214], [sx * 80, -214]], { f: P.boot.f, s: P.boot.s, so: [-sx * 6, -6], l: P.boot.l, lw: 2 });
  }
  // 尾段 + 尾灯 + 牌照
  cel(g, [[-86, -296], [86, -296], [60, -372], [-60, -372]], { f: P.white.f, s: P.white.s, so: [0, -14], h: P.white.h, ho: [0, 5], l: P.white.l, lw: 2.4, rim });
  cel(g, poly([[-56, -340], [56, -340], [50, -322], [-50, -322]]), { f: '#ff3848', l: '#5a0a14', lw: 1.8 });
  cel(g, poly([[-34, -296], [34, -296], [34, -262], [-34, -262]]), { f: '#e8e4d0', l: '#3a3a44', lw: 1.6 });
  g.fillStyle = '#2a2a44'; g.font = '700 20px "Barlow SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NB·87', 0, -279);
  // 围巾尾巴：朝镜头飘（左右各一条）
  for (const sx of [-1, 1]) {
    const sp = flutter(sx * 20, -520, Math.PI / 2 - sx * .9, 230, 12, 18, 1.2, ph * TAU + (sx > 0 ? 1.5 : 0), sx * 30);
    cel(g, ribbon(sp, u => 40 - u * 16), { f: sx > 0 ? P.scarf.s : P.scarf.f, s: P.scarf.s, so: [0, -8], l: P.scarf.l, lw: 2, rim });
  }
  // 背（夹克，前倾所以显得短）+ 手臂伸向两侧车把
  cel(g, [[-80, -372], [80, -372], [112, -470], [100, -540], [0, -556], [-100, -540], [-112, -470]], { f: P.jacket.f, s: P.jacket.s, so: [0, -20], h: P.jacket.h, ho: [0, 8], l: P.jacket.l, lw: 2.4, rim,
    clipFn: gg => { gg.fillStyle = P.stripe.f; gg.fillRect(-8, -560, 16, 190); } });
  for (const sx of [-1, 1]) {
    cel(g, [[sx * 90, -530], [sx * 196, -470], [sx * 204, -440], [sx * 110, -470]], { f: P.jacket.f, s: P.jacket.s, so: [0, -8], l: P.jacket.l, lw: 2.2, rim });
    cel(g, [[sx * 190, -480], [sx * 222, -474], [sx * 226, -440], [sx * 196, -432]], { f: P.glove.f, l: P.glove.l, lw: 2 });
  }
  // 头（后脑勺）+ 马尾（朝上后方飘）+ 耳机带、护目镜带
  // 马尾：被风吹向镜头，看起来是从后脑垂下、左右甩动的一大束
  for (let k = 0; k < 3; k++) {
    const sp = flutter(-10 + k * 12, -640, Math.PI / 2 - .35 + k * .25 + Math.sin(ph * TAU) * .15, 200 - k * 30, 12, 26, 1.1, ph * TAU + k, 20);
    cel(g, ribbon(sp, u => (1 - u) * (70 - k * 14) + 3), { f: k === 1 ? P.hair.s : P.hair.f, s: P.hair.s, so: [8, 0], h: P.hair.h, l: P.hair.l, lw: 2.2, rim });
  }
  const head = new Path2D(); head.ellipse(0, -600, 54, 60, 0, 0, TAU);
  cel(g, head, { f: P.hair.f, s: P.hair.s, so: [0, -16], h: P.hair.h, hi: [[[-30, -640], [20, -652], [36, -636], [-20, -628]]], l: P.hair.l, lw: 2.4, rim });
  // 两侧飘开的发梢（让后脑勺读作头发而不是头盔）
  for (const sx of [-1, 1]) { const sp2 = flutter(sx * 44, -590, sx > 0 ? .5 : Math.PI - .5, 80, 7, 8, 1, ph * TAU + (sx > 0 ? 2 : 0), sx * 10); cel(g, ribbon(sp2, u => (1 - u) * 26 + 2), { f: P.hair.f, s: P.hair.s, so: [0, -6], l: P.hair.l, lw: 2, rim }); }
  line(g, [[-20, -652], [-26, -600]], P.hair.l, 1.6); line(g, [[14, -656], [20, -604]], P.hair.l, 1.6);
  cel(g, [[-58, -612], [0, -600], [58, -612], [58, -596], [0, -584], [-58, -596]], { f: P.strap.f, l: P.strap.l, lw: 1.6 });
  for (const sx of [-1, 1]) { const c = new Path2D(); c.ellipse(sx * 56, -592, 10, 16, 0, 0, TAU); cel(g, c, { f: P.phone.f, l: P.phone.l, lw: 1.6 }); }
  cel(g, [[-26, -560], [26, -560], [20, -536], [-20, -536]], { f: P.scarf.f, l: P.scarf.l, lw: 1.8 });
}

export function riderFront(g, P, o) {
  const ph = o.ph || 0, rim = o.rim;
  const hairSt = { f: P.hair.f, s: P.hair.s, h: P.hair.h, l: P.hair.l, lw: 2.2, rim };
  // 围巾两侧向后下方飘
  for (const sx of [-1, 1]) { const sp = flutter(sx * 40, -596, sx > 0 ? .55 : Math.PI - .55, 280, 12, 18, 1.2, ph * TAU + (sx > 0 ? 1.7 : 0), sx * 30); cel(g, ribbon(sp, u => 46 - u * 20), { f: P.scarf.f, s: P.scarf.s, so: [0, -8], l: P.scarf.l, lw: 2, rim }); }
  // 肩膀 + 手臂伸向车把
  cel(g, [[-150, -560], [0, -598], [150, -560], [250, -440], [210, -420], [120, -500], [-120, -500], [-210, -420], [-250, -440]], { f: P.jacket.f, s: P.jacket.s, so: [0, -16], h: P.jacket.h, ho: [0, 6], l: P.jacket.l, lw: 2.4, rim,
    clipFn: gg => { gg.fillStyle = P.stripe.f; gg.fill(poly([[-150, -560], [-138, -566], [-226, -436], [-240, -440]])); gg.fill(poly([[150, -560], [138, -566], [226, -436], [240, -440]])); } });
  for (const sx of [-1, 1]) cel(g, [[sx * 200, -450], [sx * 262, -452], [sx * 270, -404], [sx * 208, -400]], { f: P.glove.f, l: P.glove.l, lw: 2 });
  cel(g, poly([[-34, -612], [34, -612], [30, -584], [-30, -584]]), { f: P.skin.s, l: P.skin.l, lw: 1.8 });
  cel(g, [[-60, -600], [0, -586], [60, -600], [56, -574], [-56, -574]], { f: P.scarf.f, s: P.scarf.s, so: [0, -6], l: P.scarf.l, lw: 2 });
  // 头：新人设正面（眼睛越过风挡盯着前方）
  g.save(); g.translate(0, -738); g.scale(1.45, 1.45);
  head80(g, P, { view: 'front', expr: 'determined', ph, wind: 1, rim, body: false, neckEnd: 100 });
  g.restore();
  // 风挡 + 整流罩正面 + 大灯
  g.fillStyle = rgba('#3a5a8a', .82); g.beginPath(); g.moveTo(-130, -520); g.lineTo(-90, -640); g.lineTo(90, -640); g.lineTo(130, -520); g.fill();
  g.fillStyle = rgba('#ffffff', .35); g.beginPath(); g.moveTo(-80, -636); g.lineTo(-40, -636); g.lineTo(-90, -524); g.lineTo(-120, -524); g.fill();
  g.fillStyle = rgba('#ff9ad0', .3); g.beginPath(); g.moveTo(30, -636); g.lineTo(46, -636); g.lineTo(20, -524); g.lineTo(4, -524); g.fill();
  line(g, [[-130, -520], [-90, -640], [90, -640], [130, -520]], P.teal.l, 2.5);
  cel(g, [[-170, -520], [170, -520], [190, -420], [150, -330], [60, -290], [-60, -290], [-150, -330], [-190, -420]], { f: P.white.f, s: P.white.s, so: [-14, -14], h: P.white.h, ho: [6, 6], l: P.white.l, lw: 2.6, rim,
    clipFn: gg => { gg.fillStyle = P.teal.f; gg.fillRect(-200, -380, 400, 26); gg.fillStyle = P.magenta.f; gg.fillRect(-200, -392, 400, 7); } });
  const hl = new Path2D(); hl.arc(0, -430, 58, 0, TAU); cel(g, hl, { f: '#fff6d0', l: P.white.l, lw: 3 });
  for (const sx of [-1, 1]) cel(g, poly([[sx * 150, -470], [sx * 190, -470], [sx * 190, -448], [sx * 150, -448]]), { f: '#ffb030', l: P.white.l, lw: 1.5 });
  // 前叉 + 前轮 + 挡泥板
  for (const sx of [-1, 1]) cel(g, poly([[sx * 40 - 10, -300], [sx * 40 + 10, -300], [sx * 44 + 10, -60], [sx * 44 - 10, -60]]), { f: P.gold.f, s: P.gold.s, so: [-4, 0], l: P.gold.l, lw: 2 });
  cel(g, [[-28, -240], [-34, -120], [-26, 0], [26, 0], [34, -120], [28, -240]], { f: P.tire.f, s: P.tire.s, so: [6, 0], h: P.tire.h, ho: [-3, 0], l: P.tire.l, lw: 2.5 });
  cel(g, [[-50, -250], [0, -276], [50, -250], [44, -226], [-44, -226]], { f: P.white.f, s: P.white.s, so: [0, -6], l: P.white.l, lw: 2 });
  return [0, -430];
}

export function rocket(g, e, x, y, s, t) {
  const P = PAL.dawn;
  g.save(); g.translate(x, y); g.scale(s, s);
  // 火焰（12fps 三张循环）
  const k = f12(t) % 3, fl = [1, 1.15, .92][k];
  for (const [ctx, col, w, L] of [[e, '#ffb040', 70, 520], [g, '#ff8a2a', 56, 460], [g, '#fff0a0', 34, 330], [g, '#ffffff', 18, 200]]) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-w, 0); ctx.quadraticCurveTo(-w * .6, L * .5 * fl, 0, L * fl); ctx.quadraticCurveTo(w * .6, L * .5 * fl, w, 0); ctx.fill();
  }
  for (const sx of [-1, 1]) {   // 助推器
    g.save(); g.translate(sx * 70, 0);
    for (const [col, w, L] of [['#ff8a2a', 30, 260], ['#fff0a0', 18, 170]]) { g.fillStyle = col; g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(-w * .5, L * .5 * fl, 0, L * fl); g.quadraticCurveTo(w * .5, L * .5 * fl, w, 0); g.fill(); }
    cel(g, [[-26, 0], [-26, -380], [0, -440, 1], [26, -380], [26, 0]], { f: P.white.f, s: P.white.s, so: [-10 * sx, 0], h: P.white.h, ho: [4 * sx, 0], l: P.white.l, lw: 3 });
    g.restore();
  }
  cel(g, [[-44, 0], [-44, -760], [-30, -860], [0, -930, 1], [30, -860], [44, -760], [44, 0]], { f: P.white.f, s: P.white.s, so: [-16, 0], h: P.white.h, ho: [6, 0], l: P.white.l, lw: 3,
    clipFn: gg => { gg.fillStyle = '#ff7a3c'; gg.fillRect(-50, -520, 100, 40); gg.fillStyle = '#1fc4b2'; gg.fillRect(-50, -860, 100, 110); gg.fillStyle = '#2a2a3a'; gg.fillRect(-50, -120, 100, 26); gg.fillStyle = '#ff4fa8'; gg.fillRect(-50, -470, 100, 10); } });
  e.fillStyle = rgba('#fff0c0', .9); e.beginPath(); e.arc(0, 30, 80, 0, TAU); e.fill();
  g.restore();
}
export function billow(g, x, y, r, seed, grow, col = ['#f4e8f0', '#b89ab8', '#ffffff']) {   // 赛璐璐烟云：一团团圆 + 硬边阴影
  const R = rng(seed);
  for (let i = 0; i < 9; i++) {
    const a = R() * TAU, d = R() * r * grow, rr = r * (.5 + R() * .6) * grow, cx = x + Math.cos(a) * d * 1.6, cy = y - Math.abs(Math.sin(a)) * d * .7;
    const c0 = new Path2D(); c0.arc(cx, cy, rr, 0, TAU);
    cel(g, c0, { f: col[0], s: col[1], so: [-rr * .25, -rr * .3], h: col[2], ho: [rr * .15, rr * .2], l: '#6a4a6a', lw: 2.5 });
  }
}
