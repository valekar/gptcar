import{state}from'./motion.js';import{optics}from'./optics.js';import{overlay}from'./hud.js';
await Promise.all(['400 20px SC','500 20px SC','600 20px SC','600 20px SS','400 20px PM','500 20px PM','400 20px PS','500 20px PS'].map(s=>document.fonts.load(s,'差两秒档案索引57')));
let view=await optics(document.querySelector('#image')),subs=await(await fetch('./subtitles.json')).json(),draw=overlay(document.querySelector('#marks').getContext('2d'),view.images,subs);
function render(t){let s=state(Math.max(0,Math.min(40,t)));view.render(t,s);draw(t,s)}window.render=render;window.DUR=40;render(0);window.READY=true;
