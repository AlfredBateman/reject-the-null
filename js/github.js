import {$,FINE,renderStats,renderGraph,renderLangs,renderRepos,renderEvents} from './render.js';

/* Loads the build-time snapshot (scripts/fetch-github.mjs). No token, no numbers made up here. */
export async function github(){
  let d;
  try{
    const r=await fetch('./data/github.json',{signal:AbortSignal.timeout(5000)});
    if(!r.ok)throw new Error(r.status);
    d=await r.json();
    if(!d.days||!d.days.length)throw new Error('empty');
  }catch(_){
    $('#gh').innerHTML='<p class="note">GitHub activity could not be loaded right now. See <a href="https://github.com/AlfredBateman" target="_blank" rel="noopener">github.com/AlfredBateman</a>.</p>';
    return;
  }
  const {cells,total,cur,longest,best,start}=analyse(d.days);
  renderStats([[total,'contributions this year'],[cur,'day current streak'],[longest,'day longest streak'],[best.n,'best day, '+best.label]]);
  renderGraph(cells,start,total,d.generatedAt);
  $('.hm-scroll').scrollLeft=1e5;
  renderLangs(d.languages);
  renderRepos(d.pinned);
  renderEvents(d.events);
  tooltip();
}

const DAY=864e5,fmt=new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}),
  short=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'});

function analyse(days){
  const counts=days.map(d=>d.count),t0=Date.parse(days[0].date);
  // colour levels = quartiles of the non-zero days, so the scale fits the real distribution
  const nz=counts.filter(n=>n).sort((a,b)=>a-b),q=p=>nz[Math.min(nz.length-1,Math.floor(p*nz.length))];
  const [q1,q2,q3]=[q(.25),q(.5),q(.75)];
  const level=n=>!n?0:n<=q1?1:n<=q2?2:n<=q3?3:4;
  let run=0,longest=0,bi=0;
  counts.forEach((n,i)=>{run=n?run+1:0;longest=Math.max(longest,run);if(n>counts[bi])bi=i});
  // today may still be empty without breaking the streak
  let k=counts.length-1,cur=0;if(!counts[k])k--;
  while(k>=0&&counts[k]){cur++;k--}
  return{
    cells:days.map(d=>({n:d.count,lv:level(d.count),t:d.count+' contribution'+(d.count===1?'':'s')+' &middot; '+fmt.format(Date.parse(d.date))})),
    total:counts.reduce((a,b)=>a+b,0),cur,longest,start:t0,
    best:{n:counts[bi],label:short.format(t0+bi*DAY)}
  };
}

/* mouse only; touch taps go through js/ui.js */
function tooltip(){
  if(!FINE)return;
  const tt=$('#tt');
  document.addEventListener('pointermove',e=>{
    const c=e.target.closest&&e.target.closest('.cell');
    if(!c){tt.style.opacity=0;return}
    tt.innerHTML=c.dataset.t;tt.style.opacity=1;
    const w=tt.offsetWidth,x=Math.min(Math.max(e.clientX-w/2,8),innerWidth-w-8);
    tt.style.transform='translate('+x+'px,'+(e.clientY-42)+'px)';
  },{passive:true});
}
