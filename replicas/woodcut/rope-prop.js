// Attributed isolated articulated rope-hand model, LemoLab MIT; no original scene renderer.
import*as WC from'./engine/index.js';import{lerp}from'/core/lib.js';import{part,drawPart}from'./rig.js';const PI=Math.PI;
export function ropeFist(m, rx, cy, k, who, close) {
    const L = WC.light(.6, -.5, .45), sk = { white: true, outline: 4.5 * k, sp: 4.5, R: 26 * k, amb: who === 'B' ? .22 : .08, lo: .45, halo: 6, light: L };
    // sleeve + back of the hand, left of the rope
    drawPart(m, part('rs' + who, { poly: [[rx - 900 * k, cy - 170 * k], [rx - 330 * k, cy - 150 * k], [rx - 300 * k, cy + 150 * k], [rx - 900 * k, cy + 190 * k]], light: WC.light(.6, -.3, .3), R: 30, sp: 8, dir: PI / 2 + .15, halo: 6, seed: who.charCodeAt(0), lo: .35, feats: [{ cp: [[rx - 340 * k, cy - 140 * k], [rx - 312 * k, cy + 140 * k]], w: 5 }] }));
    drawPart(m, part('rb' + who, { poly: WC.spline([[rx - 340 * k, cy - 140 * k], [rx - 150 * k, cy - 150 * k], [rx - 40 * k, cy - 120 * k], [rx - 30 * k, cy + 110 * k], [rx - 160 * k, cy + 150 * k], [rx - 330 * k, cy + 140 * k]], 6, true), ...sk, seed: 80 + who.charCodeAt(0),
      feats: who === 'F' ? [{ cp: [[rx - 300 * k, cy - 60 * k], [rx - 200 * k, cy - 70 * k], [rx - 90 * k, cy - 50 * k]], w: 3 }, { cp: [[rx - 290 * k, cy + 10 * k], [rx - 190 * k, cy], [rx - 90 * k, cy + 15 * k]], w: 3 }, { cp: [[rx - 250 * k, cy - 110 * k], [rx - 240 * k, cy + 100 * k]], w: 2.2 }] : [] }));
    // four fingers wrapping across the rope, stacked
    for (let i = 0; i < 4; i++) {
      const y = cy - 105 * k + i * 70 * k, ext = lerp(60, 150, close) * k;
      drawPart(m, part('rf' + who + i + (close > .5 ? 1 : 0), { poly: WC.spline([[rx - 60 * k, y - 30 * k], [rx + ext * .7, y - 32 * k], [rx + ext, y - 12 * k], [rx + ext, y + 14 * k], [rx + ext * .7, y + 32 * k], [rx - 60 * k, y + 30 * k]], 5, true), ...sk, seed: 90 + i,
        feats: [{ cp: [[rx + 20 * k, y - 26 * k], [rx + 28 * k, y], [rx + 20 * k, y + 26 * k]], w: 2.6 * k }, { cp: [[rx + ext * .75, y - 22 * k], [rx + ext * .8, y + 22 * k]], w: 2 * k }] }));
    }
    // the thumb over the top finger
    drawPart(m, part('rt' + who, { poly: WC.spline([[rx - 150 * k, cy - 150 * k], [rx - 20 * k, cy - 185 * k], [rx + 90 * k, cy - 170 * k], [rx + 100 * k, cy - 130 * k], [rx - 10 * k, cy - 110 * k], [rx - 140 * k, cy - 100 * k]], 5, true), ...sk, seed: 99 }));
  }