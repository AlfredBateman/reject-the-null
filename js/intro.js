import {$,anime,RM,root} from './render.js';
import {swing} from './motion.js';

/* ---------- intro ---------- */
const I=$('#intro'),cntEl=$('#cnt');
let heroPlayed=false,introTl=null,finished=false;
const heroEls='[data-hero]';
function heroIn(){
  if(heroPlayed)return;heroPlayed=true;
  anime({targets:'.mega .ch',opacity:[0,1],translateY:['70%','0%'],rotate:[8,0],duration:1000,delay:anime.stagger(55),easing:'easeOutExpo'});
  anime({targets:heroEls,opacity:[0,1],translateY:[24,0],duration:900,delay:anime.stagger(90,{start:250}),easing:'easeOutExpo'});
  anime({targets:'.stamp',opacity:[0,1],scale:[0,1],rotate:[-40,-10],duration:900,delay:900,easing:'easeOutElastic(1,.6)'});
  setTimeout(swing,1100);
}
function finish(){
  if(finished)return;finished=true;
  I.hidden=true;root.classList.remove('lock');heroIn();
}
function playIntro(){
  if(RM){I.hidden=true;return}
  finished=false;heroPlayed=false;
  I.hidden=false;I.style.animation='none';root.classList.add('lock');
  anime.remove('.i-paper,.i-red,.i-top > *,.i-script,.i-word .ch,.i-badge,.i-bar i,.i-center,.skip');
  anime.set('.i-paper,.i-red',{translateY:'0%'});
  anime.set('.i-top > *,.i-script,.i-word .ch,.i-badge,.skip',{opacity:0});
  anime.set('.i-center',{opacity:1});anime.set('.i-bar i',{scaleX:0});
  anime.set(heroEls,{opacity:0});anime.set('.mega .ch',{opacity:0});anime.set('.stamp',{opacity:0});
  cntEl.textContent='000';
  const c={v:0};
  anime({targets:c,v:100,round:1,duration:2400,delay:300,easing:'easeInOutCubic',update:()=>{cntEl.textContent=String(c.v).padStart(3,'0')}});
  anime({targets:'.i-bar i',scaleX:[0,1],duration:2400,delay:300,easing:'easeInOutCubic'});
  introTl=anime.timeline({easing:'easeOutExpo',complete:finish});
  introTl
    .add({targets:'.i-top > *',opacity:[0,1],translateY:[-10,0],duration:600,delay:anime.stagger(90)})
    .add({targets:'.i-script',opacity:[0,1],translateY:[16,0],duration:700},'-=300')
    .add({targets:'.i-word .ch',opacity:[0,1],translateY:['115%','0%'],rotate:[10,0],duration:1000,delay:anime.stagger(60)},'-=400')
    .add({targets:'.i-badge',opacity:[0,1],scale:[0,1],rotate:[-200,0],duration:1200,easing:'easeOutElastic(1,.7)'},'-=900')
    .add({targets:'.skip',opacity:[0,1],duration:400},'-=1000')
    .add({duration:450})
    .add({targets:'.i-center,.i-bottom',opacity:0,translateY:-14,duration:300,easing:'easeInQuad'})
    .add({targets:'.i-paper',translateY:['0%','-100%'],duration:950,easing:'easeInOutExpo'})
    .add({targets:'.i-red',translateY:['0%','-100%'],duration:950,easing:'easeInOutExpo',begin:()=>{root.classList.remove('lock');heroIn()}},'-=650');
}
export function initIntro(){
$('#skip').addEventListener('click',()=>{
  if(introTl)introTl.pause();anime.remove('.i-paper,.i-red');
  anime({targets:I,opacity:[1,0],duration:350,easing:'linear',complete:()=>{I.style.opacity='';finish()}});heroIn();
});
$('#replay').addEventListener('click',()=>{scrollTo({top:0,behavior:'auto'});playIntro()});
/* safety net if anything stalls */
setTimeout(()=>{if(!I.hidden&&!finished){anime.set(heroEls,{opacity:1});anime.set('.mega .ch',{opacity:1});anime.set('.stamp',{opacity:1});finish()}},9500);
/* ?intro=0 or an earlier visit in this tab skips the first play; the replay button still works */
let seen=false;try{seen=!!sessionStorage.getItem('iv-intro');sessionStorage.setItem('iv-intro','1')}catch(_){}
if(seen||new URLSearchParams(location.search).get('intro')==='0')I.hidden=true;else playIntro();
}
