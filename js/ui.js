import {$,$$,RM,FINE,root} from './render.js';
import {MAIL} from './content.js';

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

/* pointer-lit rim and tilt */
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
