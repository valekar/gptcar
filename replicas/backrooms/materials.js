// Isolated generic light-field, fog and material shader engine; LemoLab MIT. No original layout or scene builder.
import*as THREE from'three';import{lightTex}from'./lamp-grid.js';const H=2.7,LX=2.4,LZ=2.4,LOX=.1,LOZ=1.8,LN=128,LOFF=64,EXIT={x:8,z:-22.2};
export const U = {
  uLights: { value: lightTex }, uAmb: { value: 0.16 }, uI: { value: 2.2 },
  uExitPos: { value: new THREE.Vector3(EXIT.x - 0.12, 2.32, EXIT.z) }, uExitI: { value: 0.0 },
  uFogCol: { value: new THREE.Color(0.19, 0.16, 0.075) }, uFogD: { value: 0.032 }, uFogG: { value: 1 },
  uTime: { value: 0 },
};
const VS = `
varying vec3 vW; varying vec3 vN; varying vec2 vUv;
void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * w; }`;
const COMMON = `
uniform sampler2D uLights; uniform float uAmb, uI, uExitI, uFogD, uFogG, uTime; uniform vec3 uExitPos, uFogCol;
varying vec3 vW; varying vec3 vN; varying vec2 vUv;
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int k = 0; k < 5; k++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s; }
// 灯阵光照：周围 5×5 盏灯（每盏近似为朝下的面光源），外加一个随局部亮度走的"反弹光"
void lightAt(vec3 P, vec3 N, vec3 V, float shin, out vec3 dif, out vec3 spc, out vec3 amb){
  dif = vec3(0); spc = vec3(0); amb = vec3(0);
  float gi = floor((P.x - ${LOX.toFixed(2)}) / ${LX.toFixed(2)} + .5), gj = floor((P.z - ${LOZ.toFixed(2)}) / ${LZ.toFixed(2)} + .5);
  for (int di = -2; di <= 2; di++) for (int dj = -2; dj <= 2; dj++) {
    float i = gi + float(di), j = gj + float(dj);
    vec4 L = texture2D(uLights, (vec2(i, j) + ${LOFF}.5) / ${LN}.);
    if (L.a < .5) continue;
    vec3 lp = vec3(i * ${LX.toFixed(2)} + ${LOX.toFixed(2)}, ${(H - 0.02).toFixed(2)}, j * ${LZ.toFixed(2)} + ${LOZ.toFixed(2)});
    vec3 d = lp - P; float d2 = dot(d, d); vec3 l = d * inversesqrt(d2);
    float emit = .3 + .7 * max(l.y, 0.);
    float ndl = max(dot(N, l), 0.);
    dif += L.rgb * ndl * emit / (d2 + .3);
    if (shin > 0.) { vec3 hv = normalize(l + V); spc += L.rgb * pow(max(dot(N, hv), 0.), shin) * emit / (d2 + .3); }
    vec2 dh = d.xz; amb += L.rgb / (dot(dh, dh) + 3.);
  }
  dif *= uI; spc *= uI; amb *= uAmb;
  // 出口标志的红光
  if (uExitI > 0.) { vec3 d = uExitPos - P; float d2 = dot(d, d); vec3 l = d * inversesqrt(d2);
    dif += vec3(1., .08, .04) * uExitI * (max(dot(N, l), 0.) * .9 + .04) / (d2 + .15); }
}
vec3 fog(vec3 c, vec3 P){ float d = length(P - cameraPosition); float f = 1. - exp(-d * uFogD); return mix(c, uFogCol * uFogG, f); }
// 雾的颜色跟着当地的亮度走：灭灯的地方雾也暗（剪影才会是"光里的一个洞"）
vec3 fogA(vec3 c, vec3 P, vec3 a){ float d = length(P - cameraPosition); float f = 1. - exp(-d * uFogD);
  float k = clamp(dot(a, vec3(.333)) / (.2 * uAmb / .16), .15, 1.25); return mix(c, uFogCol * uFogG * k, f); }
`;
function mat(frag, extraU = {}, defs = {}) {
  return new THREE.ShaderMaterial({ uniforms: { ...U, ...extraU }, vertexShader: VS, fragmentShader: COMMON + frag, defines: defs });
}

// 墙：墙纸（按法线选世界坐标 UV）+ 幅与幅之间的褪色差 + 水渍 + 踢脚线
const WALL_FS = `
uniform sampler2D map;
void main(){
  vec3 N = normalize(vN); vec3 V = normalize(cameraPosition - vW);
  float u = abs(N.x) > .5 ? vW.z * sign(N.x) : -vW.x * sign(N.z);
  float roll = floor(u / .53);
  vec3 alb = texture2D(map, vec2(u / .53, vW.y / .53)).rgb;
  alb *= .92 + .12 * h21(vec2(roll, 3.1));                       // 每幅墙纸褪色程度不同
  float st = fbm(vec2(u * .9, vW.y * 1.4) + 5.);               // 大块污渍
  alb *= mix(vec3(1.), vec3(.82, .74, .55), smoothstep(.55, .78, st) * .8);
  float wmask = smoothstep(.45, .65, fbm(vec2(u * .23, 7.)));   // 只有部分墙段有水渍
  float wet = (fbm(vec2(u * .8, 3.)) * .5 + .05) * wmask;       // 墙根水渍（高度不一的潮痕）
  float tide = smoothstep(wet + .05, wet - .06, vW.y) * wmask;
  alb *= mix(vec3(1.), vec3(.74, .63, .42), tide * .55);
  alb *= 1. - .2 * smoothstep(.04, 0., abs(vW.y - wet)) * step(.15, wet);   // 潮痕的深色边
  alb *= mix(vec3(1.), vec3(.86, .8, .62), smoothstep(${(H - 0.35).toFixed(2)}, ${H.toFixed(2)}, vW.y) * .6); // 吊顶下的烟黄
  // 接缝翘边：幅边一条细暗线 + 旁边一点亮
  float sx = fract(u / .53) * .53;
  alb *= 1. - .4 * smoothstep(.008, 0., sx) * step(.3, h21(vec2(roll, 7.)));
  alb *= 1. + .12 * smoothstep(.012, .004, abs(sx - .012)) * step(.3, h21(vec2(roll, 7.)));
  // 个别幅的接缝在上半段翘起：露出发白的纸背（三角）+ 下面一道阴影
  if (h21(vec2(roll, 11.)) > .93) {
    float y0 = ${(H - 0.3).toFixed(2)} - 1.1 * h21(vec2(roll, 13.)), k = clamp((vW.y - y0) / (${H.toFixed(2)} - y0), 0., 1.);
    float wpe = .075 * k * (vW.y > y0 ? 1. : 0.);
    float tri = step(sx, wpe);
    alb = mix(alb, vec3(.8, .75, .58), tri * .9);
    alb *= 1. - .4 * smoothstep(.025, 0., sx - wpe) * step(wpe, sx) * step(.001, wpe);
  }
  // 零星的小污渍（很少）
  float sp = vn(vec2(u * 3.1, vW.y * 3.1) + 40.);
  alb *= 1. - .22 * smoothstep(.86, .93, sp) * step(.6, h21(vec2(floor(u / 2.), 9.)));
  // 踢脚线
  if (vW.y < .1) alb = vec3(.30, .24, .15) * (.9 + .1 * vn(vec2(u * 30., 1.)));
  vec3 d, s, a; lightAt(vW + N * .02, N, V, 0., d, s, a);
  vec3 c = alb * (d + a);
  gl_FragColor = vec4(fogA(c, vW, a), 1.);
}`;
// 地毯：绒面 + 潮湿发暗的斑块（更暗更亮滑）+ 靠墙更脏
const FLOOR_FS = `
uniform sampler2D map;
void main(){
  vec3 N = vec3(0, 1, 0); vec3 V = normalize(cameraPosition - vW);
  vec3 alb = texture2D(map, vW.xz / .9).rgb;
  alb *= .9 + .2 * vn(vW.xz * 1.3);
  float damp = smoothstep(.5, .68, fbm(vW.xz * .45 + 3.));
  alb *= mix(1., .6, damp);
  alb = mix(alb, alb * vec3(.95, .9, .8), smoothstep(.6, .8, fbm(vW.xz * 1.1)) * .5);
  alb *= .88 + .24 * fbm(vW.xz * 7.);                                          // 近看的绒面斑驳
  alb *= 1. - .16 * smoothstep(.64, .72, fbm(vW.xz * 2.3 + 11.));                 // 小块湿印
  vec3 d, s, a; lightAt(vW, N, V, 22., d, s, a);
  vec3 c = alb * (d + a * .7) + s * (.012 + .09 * damp) * vec3(1., .95, .8);
  gl_FragColor = vec4(fogA(c, vW, a), 1.);
}`;
// 吊顶：矿棉板 + 龙骨 + 个别板子的黄褐水渍
const CEIL_FS = `
uniform sampler2D map;
void main(){
  vec3 N = vec3(0, -1, 0); vec3 V = normalize(cameraPosition - vW);
  vec2 q = vec2((vW.x + .2) / 1.2, (vW.z - 1.2) / 1.2);
  vec3 alb = texture2D(map, q).rgb;
  vec2 tile = floor(vec2((vW.x + .2) / .6, (vW.z - 1.2) / 1.2));
  float hs = h21(tile);
  alb *= .95 + .08 * hs;
  vec2 f0 = fract(vec2((vW.x + .2) / .6, (vW.z - 1.2) / 1.2));
  bool inner = f0.x > .03 && f0.x < .97 && f0.y > .015 && f0.y < .985;
  float kind = h21(tile + 71.);
  bool missing = kind > .992 && inner, vent = kind > .972 && kind <= .992, yell = kind > .93 && kind <= .972;
  if (yell) alb *= mix(vec3(.93, .86, .7), vec3(.8, .68, .45), smoothstep(.2, .5, length(f0 - .5)));   // 整块发黄的板
  if (vent) { vec2 g = (f0 - .5) * vec2(1., 2.); float sq = step(max(abs(g.x), abs(g.y)), .38);          // 回风口：方形格栅
    float slot = step(.5, fract(g.y * 11.)); alb = mix(alb, mix(vec3(.2, .19, .16), vec3(.78, .76, .7), slot), sq);
    alb *= 1. - .3 * sq * step(.34, max(abs(g.x), abs(g.y))); }
  if (hs > .93 && !vent && !missing) { vec2 f = fract(vec2((vW.x + .2) / .6, (vW.z - 1.2) / 1.2)) - .5; f.x *= .5;
    float r = length(f + (vec2(h21(tile + 3.), h21(tile + 5.)) - .5) * .3); float ring = smoothstep(.22, .19, r) * (.5 + .5 * smoothstep(.12, .2, r));
    alb *= mix(vec3(1.), vec3(.72, .58, .34), ring * .8); }
  vec3 d, s, a; lightAt(vW - vec3(0, .05, 0), N, V, 0., d, s, a);
  vec3 c = alb * (d * .55 + a * 1.05);
  if (missing) c = vec3(.012, .01, .008) * (1. + 2. * smoothstep(.3, .0, min(min(f0.x, 1. - f0.x), min(f0.y, 1. - f0.y) * 2.)));   // 缺了一块：黑洞，边缘有一点点光
  gl_FragColor = vec4(fogA(c, vW, a), 1.);
}`;
// 日光灯板：发光区 = 贴图亮度 × 每盏灯自己的颜色与亮度
const TROF_FS = `
uniform sampler2D map; uniform float uEmit;
void main(){
  vec2 cell = vec2(floor((vW.x - ${LOX.toFixed(2)}) / ${LX.toFixed(2)} + .5), floor((vW.z - ${LOZ.toFixed(2)}) / ${LZ.toFixed(2)} + .5));
  vec4 L = texture2D(uLights, (cell + ${LOFF}.5) / ${LN}.);
  vec3 tx = texture2D(map, vUv).rgb;
  float glow = smoothstep(.75, .95, dot(tx, vec3(.33)));
  vec3 c = mix(tx * .25 * (L.rgb * .3 + .05), tx * L.rgb * uEmit, glow);
  gl_FragColor = vec4(fog(c, vW), 1.);
}`;
// 通用：贴图或纯色的漫反射物体（告示、软木板、门、插座、鞋裤……）
const PAINT_FS = `
uniform sampler2D map; uniform vec3 color; uniform float useMap, shin, spec, emit;
void main(){
  vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N; vec3 V = normalize(cameraPosition - vW);
  vec3 alb = color; if (useMap > .5) alb *= texture2D(map, vUv).rgb;
  vec3 d, s, a; lightAt(vW + N * .02, N, V, shin, d, s, a);
  vec3 c = alb * (d + a) + s * spec + alb * emit;
  gl_FragColor = vec4(fogA(c, vW, a), 1.);
}`;
// 剪影：alpha 测试，几乎不受光（只吃一点点），吃雾
const SIL_FS = `
uniform sampler2D map;
void main(){
  vec4 tx = texture2D(map, vUv); if (tx.a < .5) discard;
  vec3 N = normalize(vN); vec3 V = normalize(cameraPosition - vW);
  vec3 d, s, a; lightAt(vW + N * .05, N, V, 0., d, s, a);
  vec3 c = vec3(.012, .011, .009) * (d + a);
  gl_FragColor = vec4(fogA(c, vW, a), 1.);
}`;
export function silhouetteMat(map) { const m = mat(SIL_FS, { map: { value: map } }); m.side = THREE.DoubleSide; return m; }
export function paint(o = {}) {
  return mat(PAINT_FS, {
    map: { value: o.map || null }, color: { value: new THREE.Color(o.color ?? '#ffffff') }, useMap: { value: o.map ? 1 : 0 },
    shin: { value: o.shin ?? 0 }, spec: { value: o.spec ?? 0 }, emit: { value: o.emit ?? 0 },
  });
}


export const surfaceMat=mat;export{WALL_FS,FLOOR_FS,CEIL_FS,TROF_FS};
