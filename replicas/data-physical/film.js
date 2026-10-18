import * as T from 'three';
import {makePost} from '/core/three/post.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {FXAAShader} from 'three/addons/shaders/FXAAShader.js';
import {track,clamp} from '/core/lib.js';
import {sculpture} from './sculpture.js';
import {hud} from './hud.js';
const W=1920,H=1080,film=document.querySelector('#film'),ov=document.querySelector('#overlay'),g=ov.getContext('2d');await Promise.all(['500 30px NotoSC','400 21px NotoSC','600 84px NotoSerifSC','200 150px Inter','300 50px Inter','500 24px JBMono'].map(f=>document.fonts.load(f)));await document.fonts.ready;
const renderer=new T.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});renderer.setPixelRatio(2);renderer.setSize(W,H);renderer.domElement.style.width=renderer.domElement.style.height='100%';renderer.domElement.style.zIndex=0;ov.style.zIndex=1;film.prepend(renderer.domElement);renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1.08;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#c4beb4');scene.fog=new T.Fog('#c4beb4',30,64);const camera=new T.PerspectiveCamera(22,W/H,.05,80),post=makePost(renderer,scene,camera,W,H,{ssaa:2,ao:true,aoRadius:.12,aoThickness:.4,aoScale:1.6,aoAmt:.75});post.bloom.strength=.08;post.bloom.threshold=1.6;post.vig.uniforms.amt.value=.28;post.vig.uniforms.warm.value=.22;post.vig.uniforms.contrast.value=.18;
const aa=new ShaderPass(FXAAShader);aa.material.uniforms.resolution.value.set(1/1920,1/1080);post.composer.addPass(aa);
const data=await(await fetch('./data.json')).json(),narration=await(await fetch('./narration.json')).json(),set=await sculpture(scene,data),cam=track(await(await fetch('./camera.json')).json()),cyl=(a,r,y)=>new T.Vector3(r*Math.sin(a),y,r*Math.cos(a)),forward=new T.Vector3();
function render(t){t=clamp(t,0,39.375);set.update(t);const c=cam(t);camera.position.copy(cyl(c[0],c[1],c[2]));camera.lookAt(cyl(c[3],c[4],c[5]));camera.updateMatrixWorld();camera.getWorldDirection(forward);post.dof.focus=Math.max(.2,cyl(c[6],c[7],c[8]).sub(camera.position).dot(forward));post.dof.aper=c[9];post.dof.maxCoc=16;scene.updateMatrixWorld(true);post.composer.render();hud(g,t,camera,set,narration)}
window.render=render;window.DUR=39.375;window.render(0);window.READY=true;
