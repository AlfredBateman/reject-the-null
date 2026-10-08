import {$,anime,HAS,RM} from './render.js';

/* Project diagrams. viewBox 400x300, colours only through .bx .bx2 .acc .ln .route .tx .pulse so themes and hover-red work. */
const t=(x,y,s,c='',a='')=>'<text class="tx'+(c?' '+c:'')+'" x="'+x+'" y="'+y+'"'+a+'>'+s+'</text>';
const MID=' text-anchor="middle"',END=' text-anchor="end"',B=s=>' style="font-size:'+s+'px;font-weight:700;opacity:1"';
const rect=(c,x,y,w,h,a='')=>'<rect class="'+c+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4"'+a+'/>';
const line=(c,x1,y1,x2,y2)=>'<line class="'+c+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'"/>';
const dot=(c,x,y,r)=>'<circle class="'+c+'" cx="'+x+'" cy="'+y+'" r="'+r+'"/>';
const draw=(id,label,svg)=>{const el=$(id);el.setAttribute('aria-label',label);el.innerHTML=svg};

/* one-sided Fisher exact test: p of the baseline passing at least this often if both sides shared one pass rate */
export function fisher(a,b){
  const C=(n,k)=>{let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return r};
  const x=a.reduce((s,v)=>s+v,0),K=x+b.reduce((s,v)=>s+v,0);
  let p=0;for(let k=x;k<=Math.min(a.length,K);k++)p+=C(a.length,k)*C(b.length,K-k);
  return p/C(a.length+b.length,K);
}

function agentProbe(){
  const base=[1,1,1,1,1,1,1,1,0,1],cand=[1,0,0,1,0,0,0,1,0,0];
  const sb=base.reduce((s,v)=>s+v,0),sc=cand.reduce((s,v)=>s+v,0);
  const p=fisher(base,cand),drop=(sb-sc)*10,sig=p<0.025,reg=sig&&drop>=5;
  const ps=p<0.001?p.toExponential(1):p.toFixed(4);
  const row=(arr,cy)=>arr.map((v,i)=>dot(v?'bx2':'ln',24+i*22,cy,8)).join('');
  draw('#art1','Example, not a measured result: one test case run 10 times. Baseline passes '+sb+' of 10, candidate '+sc+' of 10. One-sided Fisher exact p = '+ps+'. Verdict: '+(reg?'regression':'no regression')+'.',
    rect('ln',16,12,74,22,' style="stroke-dasharray:4 3"')+t(53,27,'EXAMPLE','acc',MID+B(11))
   +t(100,27,'one case × 10 runs per side')
   +t(16,72,'baseline · '+sb+'/10 pass')+row(base,90)
   +t(16,134,'candidate · '+sc+'/10 pass')+row(cand,152)
   +'<g transform="translate(320 121) rotate(-8)">'+rect('route',-62,-30,124,60)
   +t(0,1,reg?'REGRESSION':'NO REGRESSION','acc',MID+B(reg?15:13))+t(0,19,'verdict','',MID)+'</g>'
   +line('ln',16,190,384,190)
   +t(16,214,'one-sided Fisher exact test')
   +t(16,239,'p = '+ps+(sig?' &lt; ':' ≥ ')+'0.025 per-case α','acc',B(13))
   +t(16,262,'drop '+drop+' pts '+(drop>=5?'≥':'&lt;')+' 5 pt minimum')
   +dot('bx2',312,210,6)+t(324,214,'pass')+dot('ln',312,234,6)+t(324,238,'fail'));
}

function stockPilot(){
  const tier=(y,n,q,why,ok)=>rect('bx',44,y,340,36)+line('ln',26,y+18,44,y+18)+t(54,y+14,n+' '+q)+t(54,y+29,why)+t(374,y+14,ok,'',END);
  let hatch='';for(let x=24;x<=384;x+=16)hatch+=line('ln',x,240,x-10,252);
  draw('#art2','StockPilot query tiers for the example query "undervalued banks": the rule parser runs first, then the answer cache, then the cloud LLM. If none answers, the rule parser result is returned, so search never fails.',
    rect('bx',16,10,330,30)+t(28,30,'query')+t(72,30,'“undervalued banks”','acc',B(12))
   +'<path class="route" d="M26 40 V212"/>'
   +tier(50,'1','rule parser · all words known?','“undervalued” unknown ↓','yes → done')
   +tier(96,'2','cache · seen this query?','first time → miss ↓','hit → done')
   +tier(142,'3','cloud LLM · valid zod reply?','8 s timeout · rate limit ↓','yes → done')
   +rect('bx2',16,192,368,42)+line('route',16,236,384,236)+hatch
   +dot('pulse',26,213,5)+'<circle class="pulse p2" cx="26" cy="213" r="5"/>'+dot('acc',26,213,5)
   +t(40,209,'floor · rule parser result','',B(12))+t(40,226,'offline · instant · cannot fail')+t(374,209,'answer','',END)
   +t(16,284,'every tier falls back to the rule parser'));
}

function investorLens(){
  const quote=(y,s)=>rect('bx',18,y-13,180,18)+'<rect class="acc" x="12" y="'+(y-13)+'" width="3" height="18"/>'+t(22,y,s);
  const bar=(y,w)=>rect('bx',22,y-8,w,6);
  const link=(y1,y2)=>'<path class="ln" d="M200 '+(y1-4)+' C218 '+(y1-4)+' 218 '+y2+' 236 '+y2+'"/>';
  const card=(y,title,meta,ok)=>(ok?rect('bx',236,y,152,54):rect('bx',236,y,152,54)+rect('route',236,y,152,54,' style="stroke-dasharray:6 5;stroke-width:2.5"'))
    +t(246,y+17,title,'',B(12))+t(246,y+33,meta)+t(246,y+48,ok?'✓ approved':'needs approval',ok?'':'acc',ok?'':B(11));
  draw('#art3','InvestorLens, with example data: three verbatim quotes highlighted in an interview transcript, each linked to a suggested finding. Two are approved, one still needs human approval.',
    t(16,26,'example transcript')+t(236,26,'example findings')+line('ln',8,40,8,236)
   +t(18,56,'I: How was sign-up?')+t(18,76,'P: Fine at first, but')
   +quote(98,'“I gave up at KYC.”')+bar(120,140)
   +quote(142,'“What even is P/E?”')+bar(164,110)+t(18,186,'P: the PAN upload…')
   +quote(208,'“I uploaded it 3 times.”')+bar(230,150)
   +link(98,85)+link(142,149)+link(208,215)
   +card(58,'KYC drop-off','supports F-12 · high',1)
   +card(122,'jargon confusion','supports F-07 · med',1)
   +card(188,'repeat PAN upload','new finding · med',0)
   +t(16,264,'Gemini suggests, a person approves')
   +t(16,284,'quotes are checked word for word'));
}

const CX=200,CY=114,HEAD=300;
function canvasLint(){
  let ticks='';
  for(let i=0;i<100;i++){const a=i/100*2*Math.PI,s=Math.sin(a),c=-Math.cos(a),r=i%10?70:62;
    ticks+='M'+(CX+s*r).toFixed(1)+' '+(CY+c*r).toFixed(1)+'L'+(CX+s*82).toFixed(1)+' '+(CY+c*82).toFixed(1)}
  draw('#art4','CanvasLint: Canvas 2D calls are batched per frame into a 10,000-slot ring buffer with a write head that wraps and overwrites the oldest command. A timeline slider scrubs the recorded history for replay.',
    '<path class="ln" d="'+ticks+'"/>'
   +t(CX,CY-2,'10,000 slots','',MID+B(13))+t(CX,CY+15,'1 tick = 100','',MID)
   +'<g class="head" transform="rotate('+HEAD+' '+CX+' '+CY+')">'+line('route',CX,CY-34,CX,CY-58)
   +dot('pulse',CX,CY-76,5)+'<circle class="pulse p2" cx="'+CX+'" cy="'+(CY-76)+'" r="5"/>'+dot('acc',CX,CY-76,6)+'</g>'
   +t(16,46,'Canvas 2D calls')+t(16,68,'arc()')+t(16,86,'fill()')+t(16,104,'stroke()')+t(16,122,'drawImage()')
   +'<path class="ln" d="M96 96 H112"/><path class="ln" d="M106 91 L112 96 L106 101"/>'
   +t(16,150,'batched per')+t(16,166,'frame')
   +dot('acc',300,98,5)+t(310,102,'write head')+t(296,128,'wraps and')+t(296,144,'overwrites')+t(296,160,'the oldest')
   +t(296,184,'in the')+t(296,200,'service worker')
   +t(16,216,'timeline · scrub the history')
   +line('route',40,236,268,236)+line('ln',268,236,360,236)
   +rect('acc',262,225,12,22)+t(268,216,'#7,412','',MID)
   +t(40,260,'0','',MID)+t(360,260,'9,999','',MID)
   +t(16,286,'replays the command log, not pixels'));
  /* hover only: spin the write head around the ring */
  if(!HAS||RM)return;
  const g=$('#art4 .head'),proj=g.closest('.project'),o={a:HEAD};let spin=null;
  proj.addEventListener('pointerenter',()=>{if(spin)spin.play();else spin=anime({targets:o,a:HEAD+360,duration:6000,easing:'linear',loop:true,
    update:()=>g.setAttribute('transform','rotate('+o.a.toFixed(1)+' '+CX+' '+CY+')')})});
  proj.addEventListener('pointerleave',()=>{if(spin)spin.pause()});
}

export function diagrams(){agentProbe();stockPilot();investorLens();canvasLint()}
