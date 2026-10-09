import {stack,concepts,courses,edu,whyItMatters,links,MAIL,badgeSVG,mqA,mqB} from './content.js';
import {ICONS} from './icons.js';

export const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>[...(r||document).querySelectorAll(s)];
export const anime=window.anime;
export const HAS=typeof anime!=='undefined';
export const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
export const FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
export const root=document.documentElement;

/* Phosphor icon, regular and fill stacked in one box (the tile hover cross-fades them) */
export const icon=n=>'<span class="ico" aria-hidden="true">'+ICONS[n].map((d,i)=>'<svg class="'+(i?'i-fill':'i-reg')+'" viewBox="0 0 256 256" fill="currentColor" focusable="false">'+d+'</svg>').join('')+'</span>';

export function split(el){
  if(el.classList.contains('is-split'))return;
  el.classList.add('is-split');
  const t=el.textContent.trim();if(/^H\d$/.test(el.tagName))el.setAttribute('aria-label',t);
  el.innerHTML=t.split(' ').map(w=>'<span class="word" aria-hidden="true">'+[...w].map(c=>'<span class="ch">'+c+'</span>').join('')+'</span>').join(' ');
}

/* ---------- build dynamic markup ---------- */
export function render(){
$$('[data-badge]').forEach(el=>{el.innerHTML=badgeSVG});
(function star(){const n=12,R=48,r=38;let p='';for(let i=0;i<n*2;i++){const a=Math.PI*i/n,d=i%2?r:R;p+=(50+Math.cos(a)*d).toFixed(1)+','+(50+Math.sin(a)*d).toFixed(1)+' '}$('#star').setAttribute('points',p)})();

$$('[data-split]').forEach(split);

(function mq(){
  const a=mqA;
  const b=mqB;
  const f=(arr,id)=>{$(id).innerHTML=arr.map(w=>'<span>'+w+'</span><i></i>').join('')};
  f(a,'#mqa');f(b,'#mqb');
})();
$('#chips').innerHTML=courses.map(c=>'<span class="chip">'+c+'</span>').join('');
$('#xp').innerHTML=edu.map(j=>'<div class="row" data-reveal><div><h3>'+j[0]+'</h3><span class="org">'+j[1]+'</span></div><p class="what">'+j[2]+'</p>'+(j[3]?'<span class="when">'+j[3]+'</span>':'')+'</div>').join('');
$('#stackbox').innerHTML=stack.map(g=>'<div class="group"><h3 class="sub">'+g[0]+'</h3><div class="tiles" data-reveal="stagger">'+g[1].map(t=>
  '<div class="tile" tabindex="0" role="img" aria-label="'+esc(t[0]+', '+t[2])+'" data-tip="'+esc((t[3]?'<b>'+t[0]+'</b><br>':'')+t[2])+'"><div class="box">'+icon(t[1])+'</div><div class="name">'+esc(t[3]||t[0])+'</div></div>').join('')+'</div></div>').join('');
$('#pills').innerHTML=concepts.map(t=>'<span class="pill">'+t+'</span>').join('');
$('#connect').innerHTML=links.map(l=>'<a href="'+l[3]+'" target="_blank" rel="noopener" class="clink lit" data-magnet><span class="ic">'+l[0]+'</span><span class="tx2">'+l[2]+'</span><span class="go">&#8599;</span></a>').join('')
  +'<button type="button" id="copy" class="clink lit" data-magnet><span class="ic">@</span><span class="tx2">'+MAIL.replace('@','@<wbr>')+'</span><span class="go" aria-live="polite">copy</span></button>'
  +'<a href="assets/Ishan-Sharma-Resume.pdf" download="Ishan-Sharma-Resume.pdf" type="application/pdf" class="clink dl lit" data-magnet><span class="ic">cv</span><span class="tx2">resume (pdf)</span><span class="go" aria-hidden="true">&#8595;</span></a>';
}

/* ---------- github section (data comes from js/github.js) ---------- */
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const L=n=>n.toLocaleString('en-US');
const utc=(o,t)=>new Intl.DateTimeFormat('en-US',{...o,timeZone:'UTC'}).format(t);

export function renderStats(stats){
  $('#gstats').innerHTML=stats.map(s=>'<div class="gs lit"><b data-count="'+s[0]+'">'+L(s[0])+'</b><span>'+s[1]+'</span></div>').join('');
}

export function renderGraph(cells,start,total,generatedAt){
  const DAY=864e5,dow=new Date(start).getUTCDay();
  $('#cells').innerHTML=cells.map((c,i)=>'<i class="cell l'+c.lv+'" data-t="'+c.t+'"'+(i?'':' style="grid-row-start:'+(dow+1)+'"')+'></i>').join('');
  const weeks=Math.ceil((cells.length+dow)/7),sun=start-dow*DAY;let ml='',prev=-1;
  for(let w=0;w<weeks;w++){const m=new Date(sun+w*7*DAY).getUTCMonth();
    if(m!==prev&&w<weeks-1)ml+='<span style="left:'+(w*20)+'px">'+utc({month:'short'},sun+w*7*DAY).toLowerCase()+'</span>';prev=m}
  $('#months').innerHTML=ml;$('#months').style.width=(weeks*20)+'px';
  $('#hmtotal').textContent=L(total)+' contributions in the last year';
  $('#hm').setAttribute('aria-label','Contribution graph: '+L(total)+' contributions in the last year');
  $('#hmupdated').textContent='updated '+utc({month:'short',day:'numeric',year:'numeric'},Date.parse(generatedAt));
}

export function renderLangs(langs){
  $('#langbar').innerHTML=langs.map(l=>'<div class="seg" style="flex:'+l.percent+';background:'+(l.color||'var(--ink)')+'" title="'+esc(l.name)+' '+l.percent+'%"></div>').join('');
  $('#llist').innerHTML=langs.map(l=>'<span><i style="background:'+(l.color||'var(--ink)')+'"></i>'+esc(l.name)+' '+l.percent+'%</span>').join('');
}

export function renderRepos(pinned){
  $('#also').hidden=!pinned.length;
  $('#repos').innerHTML=pinned.map(r=>{
    const why=whyItMatters[r.name.toLowerCase()]||r.description;
    return '<article class="flipc" tabindex="0" aria-label="'+esc(r.name)+' repository card. Press Enter to flip."><div class="fin"><div class="face front lit"><span class="hint">hover to flip</span><div class="rn">'+esc(r.name)+'</div><p>'+esc(r.description)+'</p><div class="rm">'
      +(r.language?'<span><i class="ld" style="background:'+(r.color||'var(--ink)')+'"></i> '+esc(r.language)+'</span>':'')
      +(r.stars?'<span>&#9733; '+r.stars+'</span>':'')+(r.forks?'<span>forks '+r.forks+'</span>':'')
      +'</div></div><div class="face back"><p>'+esc(why)+'</p><a href="'+esc(r.url)+'" target="_blank" rel="noopener">open repo &#8599;</a></div></div></article>';
  }).join('');
}

export function renderEvents(events){
  $('#act').innerHTML=events.map(e=>'<a href="'+esc(e.url)+'" target="_blank" rel="noopener"><span><b>'+esc(e.repo.split('/')[1])+'</b> '+(e.type==='push'?'':'<em>'+e.type+'</em> ')+'<small>'+esc(e.detail)+'</small></span><small>'+utc({month:'short',day:'numeric'},Date.parse(e.at))+'</small></a>').join('');
}
