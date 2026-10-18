// Attributed MIT generic medium engine and character/isolated prop models. Complete original game scene excluded.
// 瑞士排版画风（向 swiss-motion 学：12 栏网格、单字族、左齐右不齐、黑白 + 一个信号红、大留白、不加阴影/颗粒）——自写简化版
const TAU = Math.PI * 2;
export const SW = { page: '#eae9e5', paper: '#ffffff', ink: '#111111', red: '#e30613', grid: '#cfcec9' };
export const GRID = { cols: 12, m: 96, gut: 24, col: (1920 - 96 * 2 - 24 * 11) / 12 };
export const colX = i => GRID.m + i * (GRID.col + GRID.gut);
export function page(g, o = {}) {
  g.fillStyle = SW.page; g.fillRect(0, 0, 1920, 1080);
  if (o.grid !== false) {
    g.save(); g.strokeStyle = SW.grid; g.lineWidth = 1;
    for (let i = 0; i < 12; i++) { const x = colX(i); g.strokeRect(x + .5, 60.5, GRID.col, 960); }
    for (let y = 60; y <= 1020; y += 24) { g.globalAlpha = .35; g.beginPath(); g.moveTo(GRID.m, y + .5); g.lineTo(1920 - GRID.m, y + .5); g.stroke(); }
    g.restore();
  }
}
export function text(g, t, x, y, size, w = 700, col = SW.ink, o = {}) {
  g.save(); g.font = `${w} ${size}px Inter`; g.fillStyle = col; g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  g.letterSpacing = (size >= 90 ? -size * .03 : 0) + 'px'; g.fillText(t, x, y); g.restore();
}
// ───────── 瑞士版 Dot：黑圆（头盔）+ 黑矩形（身体）+ 红圆（天线球）；arm = 敬礼臂角度（弧度，0 = 下垂）─────────
// (x,y) = 身体底边中心，u = 模块单位（px）
export function cadetSwiss(g, x, y, u = 40, o = {}) {
  const arm = o.arm ?? 0, ball = o.ball, show = o.ballShow ?? true;
  g.save(); g.translate(x, y);
  g.fillStyle = SW.ink;
  g.fillRect(-2 * u, -5 * u, 4 * u, 5 * u);                 // 身体：4×5 模块
  g.beginPath(); g.arc(0, -7.5 * u, 2.5 * u, 0, TAU); g.fill();   // 头盔：直径 5 模块
  const lk = o.look ?? 1;   // 1 = 朝右，-1 = 朝左
  g.fillStyle = SW.page; g.beginPath(); g.arc(.6 * u * lk, -7.3 * u, 1.35 * u, 0, TAU); g.fill();   // 面罩：纸色圆（偏向 = 朝向）
  g.fillStyle = SW.ink; g.beginPath(); g.arc(1.05 * u * lk, -7.4 * u, .28 * u, 0, TAU); g.fill();    // 一只眼
  // 天线：细线 + 红圆
  const aw = o.antBend || 0;
  g.save(); g.translate(0, -10 * u); g.rotate(aw); g.fillRect(-.06 * u, -1.5 * u, .12 * u, 1.5 * u); g.restore();
  if (show) { g.fillStyle = SW.red; g.beginPath(); const [bx, by] = ball || [0, -12.2 * u]; g.arc(bx, by, .75 * u, 0, TAU); g.fill(); }
  // 手臂：一根矩形，绕肩点旋转
  g.save(); g.translate(1.6 * u, -4.4 * u); g.rotate(-arm); g.fillStyle = SW.ink; g.fillRect(-.45 * u, 0, .9 * u, (o.armLen ?? 3.6) * u); g.restore();
  // 腿：两根短矩形
  g.fillStyle = SW.ink; g.fillRect(-1.6 * u, 0, 1.1 * u, 1.6 * u); g.fillRect(.5 * u, 0, 1.1 * u, 1.6 * u);
  // 05：白字压在身体上
  text(g, '05', -1.6 * u, -1.3 * u, 1.5 * u, 800, SW.paper);
  g.restore();
}
export function testCadet(g, t) {
  page(g);
  text(g, 'salute.', colX(0), 300, 200, 800);
  text(g, 'cadet 05 — rule 7: arm 90°, hand to brow', colX(0), 360, 26, 500);
  cadetSwiss(g, colX(8) + GRID.col / 2, 900, 44, { arm: 1.3 });
}

