// Generic survey shaders adapted from LemoLab MIT styles/lidar-survey/demo/film.js.
// These are material primitives only; film state, data decode and scene are independently authored.
const EXT = /* glsl */`
  float extent(vec2 en){
    float e = smoothstep(240.0, 190.0, en.x) * smoothstep(-372.0, -320.0, en.x) * smoothstep(-500.0, -440.0, en.y) * smoothstep(500.0, 440.0, en.y);
    return e;
  }`;
const pointVS = (ghost) => /* glsl */`
  attribute float hag, cls, inten, rnd;
  uniform vec3 uOff, uSc, cLow, cMid, cHigh, cG, uFog, uScan;
  uniform float uF1, uF2, uCut, uPx, uProj, uGhost, uT;
  varying vec3 vCol;
  ${EXT}
  void main(){
    vec3 L = position * uSc + uOff;                  // east, north, up
    float h = hag / 8.0;
    bool veg = cls > 0.5 && cls < 1.5;
    float lift = 0.0, k = 1.0, hot = 0.0;
    k *= step(0.0, uF1 - L.x);                       // points exist behind the first scan line only
    hot += exp(-max(uF1 - L.x, 0.0) / 6.0) * step(0.0, uF1 - L.x) * step(uF1, 400.0);
    if (veg) {
      float above = h - uCut;                         // the cutting plane peels the canopy from the top
      lift = max(above, 0.0) * 2.2 + max(above, 0.0) * max(above, 0.0) * 0.35;
      k *= 1.0 - smoothstep(0.0, 5.0, above);
      hot += exp(-abs(above) / 0.7) * step(uCut, 40.0) * 0.9 * smoothstep(1.5, 5.0, h);
      ${ghost ? 'k = uGhost * (1.0 - smoothstep(0.0, 4.0, h - uCut)) * smoothstep(1.0, 3.0, h);' : 'k *= 1.0 - uGhost;'}
    } else {
      k *= 1.0 - smoothstep(-2.0, 10.0, uF2 - L.x) * ${ghost ? '1.0' : '1.0'};   // ground returns give way to the surface
      ${ghost ? 'k = 0.0;' : ''}
    }
    float ex = extent(L.xy);
    if (veg) k = mix(${ghost ? '0.0' : '1.0'} * step(0.0, uF1 - L.x), k, ex); else k = mix(step(0.0, uF1 - L.x), k, ex);
    vec3 P = vec3(L.x, L.z + lift, -L.y);
    vec4 mv = modelViewMatrix * vec4(P, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    gl_PointSize = clamp((veg ? ${ghost ? '.22' : '.15'} : .20) * uProj / dist, ${ghost ? '1.6' : '1.0'} * uPx, 5.0 * uPx) * k * (1.0 + 0.8 * hot);
    if (k < .02) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    vec3 c;
    if (veg) {
      float u = clamp(h / 28.0, 0.0, 1.0);
      c = u < .45 ? mix(cLow, cMid, u / .45) : mix(cMid, cHigh, (u - .45) / .55);
      c *= mix(.55, 1.2, inten);
    } else c = cG * mix(.6, 1.15, inten);
    c = mix(c, uScan * 1.8, clamp(hot, 0.0, 1.0));
    if (veg) c = mix(c, uScan * 1.3, smoothstep(0.0, 3.0, h - uCut) * step(uCut, 40.0) * smoothstep(1.5, 5.0, h));   // lifted returns glow as they go
    ${ghost ? 'c = uScan * (0.07 + 0.09 * inten);' : 'c *= mix(.45, 1.0, ex);'}
    float fog = 1.0 - exp(-dist / 1600.0);
    vCol = mix(c, uFog, fog * .7);
  }`;
const pointFS = /* glsl */`
  varying vec3 vCol;
  void main(){ vec2 p = gl_PointCoord * 2.0 - 1.0; float r2 = dot(p, p); if (r2 > 1.0) discard; gl_FragColor = vec4(vCol * (1.0 - .3 * r2), 1.0); }`;
const groundVS=`
    attribute vec3 nrm; attribute vec4 lt;
    varying vec3 vN, vW; varying vec4 vL; varying float vDist;
    void main(){ vN = nrm; vL = lt; vW = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vDist = -mv.z; gl_Position = projectionMatrix * mv; }`;
const groundFS=`
    uniform vec3 uSun, cClay, cShade, uFog, uBg, uScan, uAmber; uniform vec2 uSecP, uSecD;
    uniform float uF2, uW, uSec, uT, uGround;
    varying vec3 vN, vW; varying vec4 vL; varying float vDist;
    ${EXT}
    void main(){
      vec2 en = vec2(vW.x, -vW.z);
      float behind = uF2 - en.x;
      if (behind < 0.0) discard;
      float ext = extent(en);
      if (ext < .005) discard;
      vec3 n = normalize(vN);
      float ao = vL.x, wd = vL.y * 6.0, wv = vL.z, lr = (vL.w - .5) * 2.0;
      float ndl = max(dot(n, uSun), 0.0);
      vec3 col = cClay * (1.25 * ndl + .22 * (.4 + .6 * ao)) + cShade * .25 * (1.0 - ndl);
      col *= .88 + .5 * lr;                               // relief enhancement on crests
      col *= .55 + .45 * ao;
      // survey contours every 2 m, stronger every 10 m
      float cy = vW.y / 2.0, cw = fwidth(cy);
      float ct = 1.0 - smoothstep(cw * .6, cw * 1.6, min(fract(cy), 1.0 - fract(cy)));
      float c10 = 1.0 - smoothstep(cw * .2, cw * 1.0, min(fract(vW.y / 10.0), 1.0 - fract(vW.y / 10.0)) * 5.0);
      col = mix(col, col * .72, ct * .35 * smoothstep(900.0, 250.0, vDist)) ;
      col = mix(col, col * .62, c10 * .5);
      // condensing behind the second scan: a bright seam, then the surface fills in
      float fill = smoothstep(2.0, 60.0, behind);
      col = mix(uScan * .12, col, fill);
      col += uScan * 1.6 * exp(-behind / 0.9);
      // walls: amber on the crest, lit in order along the network
      float on = smoothstep(uW - .002, uW - .03, wv) * step(.001, uW);
      float head = exp(-abs(uW - wv) / .006) * step(wv, uW) * step(.001, uW) * (1.0 - step(1.0, uW));
      float px = fwidth(en.x) + fwidth(en.y);                 // keep the crest line a hairline at any distance
      float line = 1.0 - smoothstep(.15 + px * .5, .55 + px * 1.2, wd);
      col = mix(col, uAmber * 1.05, line * on * .75);
      col += uAmber * (line * head * 1.8 + smoothstep(4.0, .5, wd) * on * .06);
      // section plane through one wall
      vec2 r = en - uSecP; float al = dot(r, uSecD), pe = dot(r, vec2(-uSecD.y, uSecD.x));
      float sec = uSec * exp(-abs(al) / .22) * smoothstep(16.0, 13.0, abs(pe));
      col += uAmber * sec * 2.2;
      float fog = 1.0 - exp(-vDist / 1500.0);
      col = mix(col, uFog, fog * .75);
      col = mix(uBg, col, ext * uGround);
      gl_FragColor = vec4(col, 1.0);
    }`;
const photoVS=`varying vec3 vW; varying float vDist; void main(){ vW = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vDist = -mv.z; gl_Position = projectionMatrix * mv; }`;
const photoFS=`
    uniform sampler2D tPhoto; uniform vec4 uBox; uniform vec3 uScan, uBg; uniform float uF1, uPhoto;
    varying vec3 vW; varying float vDist;
    void main(){
      vec2 en = vec2(vW.x, -vW.z);
      float ahead = en.x - uF1;
      if (ahead < 0.0 || uPhoto < .01) discard;
      vec2 uv = vec2((en.x - uBox.x) / (uBox.z - uBox.x), (en.y - uBox.y) / (uBox.w - uBox.y));
      vec3 c = texture2D(tPhoto, uv).rgb;
      c = pow(c, vec3(2.2)) * 1.15;
      c += uScan * 2.4 * exp(-ahead / 1.8) * step(uF1, 400.0);
      gl_FragColor = vec4(mix(uBg, c, uPhoto), 1.0);
    }`;
export {pointVS,pointFS,groundVS,groundFS,photoVS,photoFS};
