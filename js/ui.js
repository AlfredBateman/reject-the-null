import {$,$$,RM,FINE,root} from './render.js';
import {MAIL} from './content.js';

/* ---------- one shared tooltip (#tt) for skill tiles and heatmap cells ----------
   `owner` is the element it currently belongs to, so one widget hiding it never kills the other's.
   The owner gets .on, which gives a tile its hover look and is always removed again on hide. */
const tt=$('#tt');let owner=null,px=null,py=0;
/* x,y given: follow the pointer (heatmap with a mouse); otherwise centre above the element */
export function showTip(el,html,x,y){
  if(owner!==el){if(owner)owner.classList.remove('on');owner=el;el.classList.add('on')}
  px=x;py=y;tt.innerHTML=html;tt.classList.toggle('wrap',el.classList.contains('tile'));tt.style.opacity=1;place();
}
export function hideTip(el){
  if(!owner||el&&el!==owner)return;
  owner.classList.remove('on');owner=null;tt.style.opacity=0;
}
function place(){
  const w=tt.offsetWidth,h=tt.offsetHeight;let x,y;
  if(px!=null){x=px-w/2;y=py-42}
  else{const r=owner.getBoundingClientRect(),g=owner.classList.contains('tile')?14:8;x=r.left+r.width/2-w/2;y=r.top-h-g;if(y<$('.nav').getBoundingClientRect().bottom+4)y=r.bottom+g}
  tt.style.transform='translate('+Math.min(Math.max(x,8),root.clientWidth-w-8)+'px,'+Math.min(Math.max(y,8),root.clientHeight-h-8)+'px)';
}

/* ---------- interactions that work without anime ---------- */
export function initUi(){
if(!matchMedia('(hover:hover)').matches)$$('.hint').forEach(h=>{h.textContent='tap to flip'});
document.addEventListener('click',e=>{
  const f=e.target.closest('.flipc');
  if(f&&!matchMedia('(hover:hover)').matches&&!e.target.closest('a'))f.classList.toggle('on');
});
document.addEventListener('keydown',e=>{
  const f=e.target.closest&&e.target.closest('.flipc');
  if(f&&(e.key==='Enter'||e.key===' ')){e.preventDefault();f.classList.toggle('on')}
});
const copy=$('#copy'),go=$('.go',copy);
function said(m){go.textContent=m;setTimeout(()=>{go.textContent='copy'},2200)}
copy.addEventListener('click',()=>{
  const fb=()=>{const r=document.createRange();r.selectNodeContents($('.tx2',copy));const s=getSelection();s.removeAllRanges();s.addRange(r);said('ctrl+c')};
  try{navigator.clipboard.writeText(MAIL).then(()=>said('copied'),fb)}catch(_){fb()}
});

/* theme */
(function(){
  const lab=$('#themeLabel');
  const eff=()=>root.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  const sync=()=>{lab.textContent=eff()==='dark'?'light':'dark'};
  try{const s=localStorage.getItem('iv-theme');if(s)root.dataset.theme=s}catch(_){}
  sync();
  $('#theme').addEventListener('click',()=>{const n=eff()==='dark'?'light':'dark';root.dataset.theme=n;try{localStorage.setItem('iv-theme',n)}catch(_){}sync()});
})();

/* pointer-lit rim and tilt (mouse only) */
if(FINE){
document.addEventListener('pointermove',e=>{
  const l=e.target.closest&&e.target.closest('.lit');if(!l)return;
  const r=l.getBoundingClientRect();
  l.style.setProperty('--mx',(e.clientX-r.left)+'px');l.style.setProperty('--my',(e.clientY-r.top)+'px');
  if(l.classList.contains('shot')&&!RM){
    const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    l.style.transform='rotateY('+(x*12).toFixed(2)+'deg) rotateX('+(-y*10).toFixed(2)+'deg) scale(1.02)';
  }
},{passive:true});
$$('.shot').forEach(s=>s.addEventListener('pointerleave',()=>{s.style.transform=''}));
}

/* skill tiles: hover or keyboard focus shows the tooltip (a mouse click focuses too, but not :focus-visible) */
$$('.tile').forEach(t=>{
  t.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')showTip(t,t.dataset.tip)});
  t.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')hideTip(t)});
  t.addEventListener('focus',()=>{if(t.matches(':focus-visible'))showTip(t,t.dataset.tip)});
  t.addEventListener('blur',()=>hideTip(t));
});
if(!FINE)$('#stack .script').textContent='tap a tile for where I used it';
/* touch: a tap toggles a tile's tooltip (a heatmap cell's just shows), a tap anywhere else or a scroll hides it.
   pointer events, not click: iOS sends no click for taps on plain elements; a pan ends in pointercancel, not pointerup */
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.tile,.cell'))hideTip()});
document.addEventListener('pointerup',e=>{
  const t=e.pointerType==='touch'&&e.target.closest('.tile,.cell');if(!t)return;
  if(owner===t&&t.classList.contains('tile'))hideTip();else showTip(t,t.dataset.tip||t.dataset.t);
});
/* a keyboard-focused tile keeps its tooltip while focus scrolls it into view */
document.addEventListener('scroll',()=>{if(owner&&owner===document.activeElement)place();else hideTip()},{passive:true,capture:true});

/* scroll progress */
const bar=$('#progress');
addEventListener('scroll',()=>{
  const h=document.documentElement.scrollHeight-innerHeight;
  bar.style.transform='scaleX('+(h>0?scrollY/h:0)+')';
},{passive:true});

/* cursor */
if(FINE&&!RM){
  const cur=$('#cursor');let tx=0,ty=0,x=0,y=0;
  addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;cur.style.opacity=1},{passive:true});
  document.addEventListener('pointerover',e=>{
    const t=e.target.closest&&e.target.closest('[data-cursor],a,button,.flipc,.tile,.chip,.pill,.cell');
    cur.className='';cur.textContent='';
    if(!t)return;
    if(t.dataset.cursor){cur.classList.add('view');cur.textContent=t.dataset.cursor}else cur.classList.add('link');
  });
  document.addEventListener('pointerleave',()=>{cur.style.opacity=0});
  (function loop(){x+=(tx-x)*.22;y+=(ty-y)*.22;cur.style.transform='translate3d('+x+'px,'+y+'px,0)';requestAnimationFrame(loop)})();
}
}
