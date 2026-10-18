import{canvas,W,H}from'./cel.js';
const [LC, LG] = canvas(W, H), [MC, MG] = canvas(W, H);
export function celLayer(S, fn, o = {}) {
  LG.setTransform(1, 0, 0, 1, 0, 0); LG.clearRect(0, 0, W, H); LG.globalAlpha = 1; LG.filter = 'none';
  fn(LG);
  S.g.save(); if (o.alpha != null) S.g.globalAlpha = o.alpha; S.g.drawImage(LC, 0, 0); S.g.restore();
  if (o.occlude !== false) {
    MG.setTransform(1, 0, 0, 1, 0, 0); MG.globalCompositeOperation = 'source-over'; MG.clearRect(0, 0, W, H); MG.drawImage(LC, 0, 0);
    MG.globalCompositeOperation = 'source-in'; MG.fillStyle = o.occCol || '#000'; MG.fillRect(0, 0, W, H); MG.globalCompositeOperation = 'source-over';
    S.e.save(); S.e.globalAlpha = o.occA ?? 1; S.e.drawImage(MC, 0, 0); S.e.restore();
  }
  return LC;
}

