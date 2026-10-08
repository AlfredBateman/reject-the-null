import {$,$$,anime,RM,FINE} from './render.js';

/* id card swing, stamp wiggle */
export function swing(){anime.remove('.idcard');anime.set('.idcard',{opacity:1,translateY:0});anime({targets:'.idcard',rotate:[{value:7,duration:500},{value:-5,duration:700},{value:3,duration:700},{value:0,duration:900}],easing:'easeInOutSine'})}

/* reveal on scroll (elements start visible, animate from hidden only when they approach the viewport) */
function reveal(el){
  if(RM)return;
  const mode=el.dataset.reveal,ch=$$('.ch',el),d=+el.dataset.delay||0;
  if(ch.length)anime({targets:ch,opacity:[0,1],translateY:['55%','0%'],rotate:[6,0],duration:900,delay:anime.stagger(38,{start:d}),easing:'easeOutExpo'});
  else if(mode==='stagger')anime({targets:[...el.children],opacity:[0,1],translateY:[26,0],duration:800,delay:anime.stagger(70,{start:d}),easing:'easeOutExpo'});
  else anime({targets:el,opacity:[0,1],translateY:[28,0],duration:850,delay:d,easing:'easeOutExpo'});
}

/* ---------- anime.js layer ---------- */
export function initMotion(){
/* letter reactions on titles */
if(!RM)document.addEventListener('pointerover',e=>{
  const c=e.target.closest&&e.target.closest('.react .ch');
  if(!c||c._b)return;c._b=true;
  anime({targets:c,translateY:[{value:'-14%',duration:140,easing:'easeOutQuad'},{value:'0%',duration:700,easing:'easeOutElastic(1,.5)'}],
    rotate:[{value:(Math.random()*26-13),duration:140},{value:0,duration:700,easing:'easeOutElastic(1,.5)'}],complete:()=>{c._b=false}});
  c.classList.add('hot');setTimeout(()=>c.classList.remove('hot'),420);
});

/* magnetic things */
if(FINE&&!RM)$$('[data-magnet]').forEach(el=>{
  el.addEventListener('pointermove',e=>{
    const r=el.getBoundingClientRect();
    anime.remove(el);
    anime({targets:el,translateX:(e.clientX-r.left-r.width/2)*.28,translateY:(e.clientY-r.top-r.height/2)*.4,duration:260,easing:'easeOutQuad'});
  });
  el.addEventListener('pointerleave',()=>{anime.remove(el);anime({targets:el,translateX:0,translateY:0,duration:900,easing:'easeOutElastic(1,.45)'})});
});

if(!RM){
  $('.idcard').addEventListener('pointerenter',swing);
  $('.stamp').addEventListener('pointerenter',()=>{anime.remove('.stamp');anime({targets:'.stamp',rotate:[{value:-18,duration:150},{value:-4,duration:150},{value:-14,duration:150},{value:-10,duration:300}],scale:[{value:1.12,duration:200},{value:1,duration:400}],easing:'easeInOutSine'})});
}

const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){io.unobserve(en.target);reveal(en.target)}}),{rootMargin:'0px 0px 6% 0px'});
$$('[data-reveal]').forEach(el=>io.observe(el));

/* github: count-up for the stats, ripple-in for the graph cells */
function onView(el,fn,th){const o=new IntersectionObserver(es=>{if(es[0].isIntersecting){o.disconnect();fn()}},{threshold:th||.3});o.observe(el)}
if(!RM&&$('#gstats')&&$('.cell')){
  onView($('#gstats'),()=>$$('[data-count]').forEach(b=>{const v=+b.dataset.count,o={n:0};
    anime({targets:o,n:v,round:1,duration:1600,easing:'easeOutExpo',update:()=>{b.textContent=o.n.toLocaleString('en-US')}})}));
  /* only the cells visible inside the scroll box ripple (on phones that is the last ~13 weeks), centred on what is visible */
  onView($('#cells'),()=>{
    const box=$('.hm-scroll').getBoundingClientRect(),vis=$$('.cell').map((el,i)=>[el,i]).filter(([el])=>{const b=el.getBoundingClientRect();return b.right>box.left&&b.left<box.right});
    if(!vis.length)return;
    const c=(Math.floor(vis[0][1]/7)+Math.floor(vis.at(-1)[1]/7))/2;
    anime({targets:vis.map(v=>v[0]),scale:[0,1],opacity:[0,1],duration:500,easing:'easeOutBack',delay:(el,j)=>{const i=vis[j][1];return Math.hypot(Math.floor(i/7)-c,(i%7-3)*2.2)*16}});
  },.2);
}

/* marquee: scroll speeds it up, hover pauses it */
if(!RM){
  const tracks=$$('.mq-track').map((el,i)=>{
    const set=el.firstElementChild;const c=set.cloneNode(true);c.removeAttribute('id');c.setAttribute('aria-hidden','true');el.appendChild(c);
    const row=el.parentElement;const t={el,dir:i%2?1:-1,x:0,w:0,k:1,hover:false};
    row.addEventListener('pointerenter',()=>{t.hover=true});row.addEventListener('pointerleave',()=>{t.hover=false});return t});
  const measure=()=>tracks.forEach(t=>{t.w=t.el.firstElementChild.getBoundingClientRect().width;if(t.dir>0&&t.x===0)t.x=-t.w});
  measure();addEventListener('resize',measure);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
  let lastY=scrollY;
  let boost=0,vis=false,running=false;
  /* the loop only runs while the marquee is on screen (rAF itself already stops in hidden tabs) */
  new IntersectionObserver(([e])=>{vis=e.isIntersecting;if(vis&&!running){running=true;lastY=scrollY;requestAnimationFrame(tick)}}).observe($('.mq'));
  function tick(){
    if(!vis){running=false;return}
    const dy=Math.abs(scrollY-lastY);lastY=scrollY;boost+=(Math.min(dy*.5,14)-boost)*.12;
    tracks.forEach(t=>{
      t.k+=((t.hover?0:1)-t.k)*.08;
      t.x+=t.dir*(.7*t.k+boost);
      if(t.w){if(t.dir<0&&t.x<=-t.w)t.x+=t.w;if(t.dir>0&&t.x>=0)t.x-=t.w}
      t.el.style.transform='translate3d('+t.x.toFixed(1)+'px,0,0)';
    });
    requestAnimationFrame(tick);
  }
}
}
