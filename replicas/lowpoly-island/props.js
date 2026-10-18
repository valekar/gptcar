// Generic geometric prop/material factories adapted from LemoLab MIT world.js.
// Excludes original layout, schedule, buildWorld and all original per-frame story animation.
import*as THREE from'three';import{clamp,TAU}from'/core/lib.js';
const MC = new Map();
export function mat(hex, o = {}) {
  const k = hex + JSON.stringify(o);
  if (!MC.has(k)) MC.set(k, new THREE.MeshStandardMaterial({ color: hex, flatShading: true, roughness: .88, metalness: 0, ...o }));
  return MC.get(k);
}
const jit = (hex, a) => { const c = new THREE.Color(hex), h = {}; c.getHSL(h); c.setHSL(h.h, h.s, clamp(h.l * (1 + a))); return '#' + c.getHexString(); };
const M = (g, m, cast = true) => { const x = new THREE.Mesh(g, m); x.castShadow = cast; x.receiveShadow = true; return x; };

export const PAL = {
  sandTop: '#f3dfab', sandSide: '#e2c68e', grassTop: '#93c96c', grassTop2: '#7fbd62', earth: '#c99c6e', earth2: '#b88a5e',
  rockTop: '#b4b8bd', rockSide: '#8f949c', stone: '#d9d5cc',
  walls: ['#fbf3e6', '#f5c2b0', '#b5dccb', '#a9cbe8', '#f7df8f', '#fbf3e6', '#e9c9e6', '#f5c2b0'],
  roofs: ['#d9644a', '#4f7fb8', '#e0874f', '#6a5a8e', '#c9504a', '#3f8f86', '#d9644a', '#4f7fb8'],
  pine: ['#3f8a5a', '#4f9c63'], leaf: ['#7fc36a', '#9ad06f', '#6fb35e'], trunk: '#8a5a3c',
  win: '#4d5c74', warm: '#ffc676', wood: '#a8764e', woodDark: '#7d5436',
};

function hexPrism(r, h, top, side, y0 = -2.4) {
  const g = new THREE.Group();
  const bt = h - .1;   // 侧面柱体顶面藏在草皮/沙皮帽里，避免 z-fighting
  const body = M(new THREE.CylinderGeometry(r * .985, r * .985, bt - y0, 6, 1), mat(side));
  body.position.y = (bt + y0) / 2; g.add(body);
  const cap = M(new THREE.CylinderGeometry(r, r, .16, 6, 1), mat(top)); cap.position.y = h - .08; g.add(cap);
  return g;
}
function gable(w, d, h, over = .08) {   // 双坡屋顶：沿 x 的三棱柱（坡面），两端山墙另做
  const W = w / 2 + over, D = d / 2 + over, g = new THREE.BufferGeometry();
  const v = [-W, 0, -D, W, 0, -D, W, h, 0, -W, 0, -D, W, h, 0, -W, h, 0, -W, 0, D, -W, h, 0, W, h, 0, -W, 0, D, W, h, 0, W, 0, D,
    -W, 0, -D, -W, 0, D, W, 0, D, -W, 0, -D, W, 0, D, W, 0, -D];
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
}
function gableEnds(w, d, h) {
  const W = w / 2, D = d / 2, g = new THREE.BufferGeometry();
  const v = [W, 0, -D, W, 0, D, W, h, 0, -W, 0, D, -W, 0, -D, -W, h, 0];
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
}

function makeHouse(i, floors, winMat) {
  const root = new THREE.Group(), parts = [];
  const wall = mat(PAL.walls[i % 8]), W = .92, FH = .62;
  for (let f = 0; f < floors; f++) {
    const fl = new THREE.Group();
    const body = M(new THREE.BoxGeometry(W, FH, W), wall); body.position.y = FH / 2; fl.add(body);
    const wg = new THREE.PlaneGeometry(.17, .23);
    for (let s = 0; s < 4; s++) {
      const a = s * Math.PI / 2, n = s === 0 && f === 0 ? 1 : 2;
      for (let j = 0; j < n; j++) {
        const wm = new THREE.Mesh(wg, winMat), off = n === 1 ? .2 : (j - .5) * .42;
        wm.position.set(Math.sin(a) * (W / 2 + .004) + Math.cos(a) * off, FH * .55, Math.cos(a) * (W / 2 + .004) - Math.sin(a) * off); wm.rotation.y = a; fl.add(wm);
      }
      if (s === 0 && f === 0) {   // 门
        const door = new THREE.Mesh(new THREE.PlaneGeometry(.2, .36), mat(PAL.woodDark)); door.position.set(Math.sin(a) * (W / 2 + .004) - .18 * Math.cos(a), .18, Math.cos(a) * (W / 2 + .004) + .18 * Math.sin(a)); door.rotation.y = a; fl.add(door);
      }
    }
    fl.position.y = f * FH; root.add(fl); parts.push({ obj: fl, y: f * FH, kind: 'floor' });
  }
  const roof = new THREE.Group();
  roof.add(M(gable(W, W, .5), mat(PAL.roofs[i % 8]))); roof.add(M(gableEnds(W - .01, W - .01, .5), wall));
  roof.position.y = floors * FH; root.add(roof); parts.push({ obj: roof, y: floors * FH, kind: 'roof' });
  return { root, parts, top: floors * FH + .5 };
}

function makeTree(kind, s) {
  const g = new THREE.Group();
  if (kind === 'pine') {
    const tr = M(new THREE.CylinderGeometry(.06, .08, .3, 5), mat(PAL.trunk)); tr.position.y = .15; g.add(tr);
    const c1 = M(new THREE.ConeGeometry(.36, .62, 6), mat(PAL.pine[0])); c1.position.y = .55; g.add(c1);
    const c2 = M(new THREE.ConeGeometry(.26, .5, 6), mat(PAL.pine[1])); c2.position.y = .92; c2.rotation.y = .5; g.add(c2);
  } else if (kind === 'palm') {
    const tr = M(new THREE.CylinderGeometry(.045, .07, .9, 5), mat('#b98b5e')); tr.position.set(.08, .45, 0); tr.rotation.z = -.18; g.add(tr);
    for (let k = 0; k < 5; k++) {
      const lf = M(new THREE.ConeGeometry(.09, .6, 3), mat(PAL.leaf[k % 3])); const a = k / 5 * TAU;
      lf.position.set(.16 + Math.cos(a) * .22, .92, Math.sin(a) * .22); lf.rotation.set(Math.sin(a) * 1.25, 0, -Math.cos(a) * 1.25); g.add(lf);
    }
  } else {
    const tr = M(new THREE.CylinderGeometry(.06, .08, .34, 5), mat(PAL.trunk)); tr.position.y = .17; g.add(tr);
    const c = M(new THREE.IcosahedronGeometry(.36, 0), mat(PAL.leaf[Math.floor(s * 3) % 3])); c.position.y = .6; c.rotation.set(s * 3, s * 5, 0); g.add(c);
  }
  return g;
}

function makeMill() {
  const g = new THREE.Group();
  const tower = M(new THREE.CylinderGeometry(.24, .36, 1.2, 6), mat('#f4efe4')); tower.position.y = .6;
  const cap = M(new THREE.ConeGeometry(.33, .4, 6), mat('#c9504a')); cap.position.y = 1.4;
  const win = new THREE.Mesh(new THREE.PlaneGeometry(.12, .16), null);
  const hub = new THREE.Group(); hub.position.set(0, 1.18, .34);
  const hubC = M(new THREE.CylinderGeometry(.06, .06, .1, 6), mat(PAL.woodDark)); hubC.rotation.x = Math.PI / 2; hub.add(hubC);
  for (let k = 0; k < 4; k++) {
    const b = new THREE.Group(); b.rotation.z = k * Math.PI / 2;
    const spar = M(new THREE.BoxGeometry(.04, .78, .03), mat(PAL.wood)); spar.position.y = .4; b.add(spar);
    const sail = M(new THREE.BoxGeometry(.18, .5, .015), mat('#fbf6ea')); sail.position.set(.1, .48, 0); b.add(sail);
    hub.add(b);
  }
  g.add(tower, cap, hub);
  return { g, tower, cap, hub, win };
}

function makeBoat() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const hg = new THREE.BoxGeometry(.95, .24, .42, 2, 1, 1), p = hg.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i); if (x > .3) p.setZ(i, p.getZ(i) * .15); if (p.getY(i) < 0) p.setZ(i, p.getZ(i) * .7); }
  hg.computeVertexNormals();
  const hull = M(hg, mat('#d9644a')); hull.position.y = .1; body.add(hull);
  const rim = M(new THREE.BoxGeometry(.7, .04, .36), mat('#f4efe4')); rim.position.set(-.08, .23, 0); body.add(rim);
  const mast = M(new THREE.CylinderGeometry(.018, .022, .9, 5), mat(PAL.woodDark)); mast.position.set(-.02, .66, 0); body.add(mast);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -.5, 0, 0, 0, .72, 0, 0, 0, 0, 0, .72, 0, -.5, 0, 0], 3)); sg.computeVertexNormals();
  const sail = M(sg, mat('#fbf6ea', { side: THREE.DoubleSide })); sail.position.set(-.04, .3, 0); body.add(sail);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(.07, .09, .07), new THREE.MeshStandardMaterial({ color: '#ffe6a8', emissive: '#ffc676', emissiveIntensity: 0, flatShading: true }));
  lamp.position.set(.3, .32, 0); body.add(lamp);
  return { g, body, sail, lamp };
}

function makeLighthouse() {
  const g = new THREE.Group(), rings = [];
  const R = [[.5, .45], [.45, .41], [.41, .37], [.37, .34]], H = .44;
  R.forEach(([rb, rt], i) => { const m = M(new THREE.CylinderGeometry(rt, rb, H, 8), mat(i % 2 ? '#d9544a' : '#f6f2ea')); m.position.y = H / 2; const w = new THREE.Group(); w.add(m); w.position.y = i * H; g.add(w); rings.push({ obj: w, y: i * H }); });
  const top = new THREE.Group(); top.position.y = 4 * H;
  const gal = M(new THREE.CylinderGeometry(.46, .46, .06, 8), mat('#3d4250')); gal.position.y = .03; top.add(gal);
  const glassM = new THREE.MeshStandardMaterial({ color: '#fff3cf', emissive: '#ffe2a0', emissiveIntensity: 0, flatShading: true, roughness: .3 });
  const glass = M(new THREE.CylinderGeometry(.26, .26, .34, 8), glassM, false); glass.position.y = .23; top.add(glass);
  const cap = M(new THREE.ConeGeometry(.36, .34, 8), mat('#d9544a')); cap.position.y = .57; top.add(cap);
  const ball = M(new THREE.IcosahedronGeometry(.05, 0), mat('#3d4250')); ball.position.y = .76; top.add(ball);
  g.add(top); rings.push({ obj: top, y: 4 * H, top: true });
  return { g, rings, glassM, lampY: 4 * H + .23 };
}

// 光束：水平锥体（加色、沿长度衰减）+ 海面上的扇形光斑
function beamMats() {
  const vs = `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
  const cone = new THREE.ShaderMaterial({   // 朝向相机的柔边光带：横向高斯 × 纵向衰减
    uniforms: { amt: { value: 0 }, len: { value: 60 }, soft: { value: 4.5 }, gain: { value: 1 }, col: { value: new THREE.Color('#fff1c8') } },
    vertexShader: `attribute float across; varying float vA; varying float vX; void main(){ vA = across; vX = position.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `varying float vA; varying float vX; uniform float amt, len, soft, gain; uniform vec3 col; void main(){ float s = clamp(vX / len, 0., 1.);
      float core = pow(1. - s, 1.7) * .42 + exp(-s * 10.) * .75;   // 根部亮、远端淡
      float dust = .86 + .14 * sin(vX * 1.3) * sin(vX * .37 + 1.7);
      float a = exp(-vA * vA * soft) * core * dust * gain * amt * smoothstep(0., .012, s); gl_FragColor = vec4(col * a, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const pool = new THREE.ShaderMaterial({
    uniforms: { amt: { value: 0 }, len: { value: 60 }, hw: { value: .12 }, col: { value: new THREE.Color('#ffe9b8') } }, vertexShader: vs,
    fragmentShader: `varying vec3 vP; uniform float amt, len, hw; uniform vec3 col; void main(){ float r = length(vP.xz); float s = r / len; float a0 = abs(atan(vP.z, vP.x));
      float edge = smoothstep(hw, hw * .45, a0); float a = edge * pow(1. - clamp(s, 0., 1.), 1.3) * smoothstep(.02, .08, s) * .5 * amt; gl_FragColor = vec4(col * a, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  return { cone, pool };
}

function makeBuoy() {
  const g = new THREE.Group();
  const base = M(new THREE.CylinderGeometry(.34, .4, .2, 8), mat('#d9544a')); base.position.y = .05; g.add(base);
  const band = M(new THREE.CylinderGeometry(.2, .3, .3, 8), mat('#f6f2ea')); band.position.y = .3; g.add(band);
  const top = M(new THREE.CylinderGeometry(.06, .2, .34, 8), mat('#d9544a')); top.position.y = .62; g.add(top);
  const lm = new THREE.MeshStandardMaterial({ color: '#ffe8b0', emissive: '#ffcf7a', emissiveIntensity: 0, flatShading: true });
  const light = M(new THREE.IcosahedronGeometry(.085, 0), lm, false); light.position.y = .84; g.add(light);
  return { g, lm };
}
export{hexPrism,makeHouse,makeTree,makeMill,makeBoat,makeLighthouse,makeBuoy,beamMats,M,jit};
