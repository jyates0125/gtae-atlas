/* Atlas 19.0 — San Andreas source-backed personal collectible routing.
 * Does not alter existing saved collection progress or player-supplied images.
 * Lines indicate 2D nearest-neighbor order, NOT drivable roads, gameplay
 * travel times, exact icon alignment or a verified shortest game-world route.
 */
(()=>{'use strict';
const host=document.querySelector('.stage'),map=document.getElementById('mapContents');
const pinLayer=document.getElementById('pinLayer'),mapFrame=document.getElementById('mapContainer');
if(!host||!map||!pinLayer||!mapFrame||document.getElementById('j190-sa-route'))return;
const E=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n};
const B=(txt,fn)=>{const b=E('button','',txt);b.type='button';b.addEventListener('click',fn);return b};
const key='team-jura-sa-map-route-v1',progressKey='team-jura-sa-v1';
const TYPES=['snapshots','horseshoes','oysters','tags','jumps'],LIMITS=[5,10,15,25,50,100];
const safePoint=id=>typeof id==='string'&&(/^(snapshots|horseshoes|oysters):([1-9]|[1-4][0-9]|50)$/.test(id)||/^tags:([1-9]|[1-9][0-9]|100)$/.test(id)||/^jumps:([1-9]|[1-6][0-9]|70)$/.test(id));
let state={schema:1,set:'snapshots',start:null,finish:null,limit:15,skipCollected:true};
try{const v=JSON.parse(localStorage.getItem(key)||'null');if(v?.schema===1){
 if(TYPES.includes(v.set))state.set=v.set;
 if(safePoint(v.start))state.start=v.start;
 if(safePoint(v.finish)&&v.finish!==state.start)state.finish=v.finish;
 if(LIMITS.includes(v.limit))state.limit=v.limit;
 if(typeof v.skipCollected==='boolean')state.skipCollected=v.skipCollected;
}}catch(_){}
const persist=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch(_){}};
let points=[],byId=new Map(),selectingOnMap=false,lastRoute=[],waiting=false,ready=false;
const panel=E('section','j190-sa-panel');panel.id='j190-sa-route';panel.setAttribute('aria-label','San Andreas personal collectible route planner');
const top=E('div','j190-sa-head');
top.append(E('strong','','COLLECTIBLE ROUTES · SAN ANDREAS'),E('p','','Start at any sourced map pin and visit the nearest remaining locations in this collection. The gold line is a planning diagram across approximately aligned symbols—not a road route or travel-time prediction.'));
panel.append(top);
const controls=E('div','j190-sa-controls');
const startLabel=E('label','','Start at a source-backed pin');
const startPick=E('select');startPick.id='j190-sa-start';startPick.setAttribute('aria-label','Choose starting collectible');
startLabel.append(startPick);controls.append(startLabel);
const finishLabel=E('label','','Finish at (optional)');
const finishPick=E('select');finishPick.id='j190-sa-finish';finishPick.setAttribute('aria-label','Choose final collectible');
finishLabel.append(finishPick);controls.append(finishLabel);
const limitLabel=E('label','','Maximum route stops');
const limitPick=E('select');limitPick.id='j190-sa-limit';
for(const n of LIMITS){const o=E('option','',n===50?'Up to 50':'Up to '+n);o.value=String(n);limitPick.append(o)}
limitPick.value=String(state.limit);limitLabel.append(limitPick);controls.append(limitLabel);
const checkLabel=E('label','j190-sa-check');
const check=E('input');check.type='checkbox';check.checked=state.skipCollected;check.id='j190-sa-skip';
checkLabel.append(check,E('span','','Skip items already collected'));controls.append(checkLabel);
panel.append(controls);
const actions=E('div','j190-sa-actions');
const pickOnMap=B('Pick start on map',()=>{selectingOnMap=!selectingOnMap;
 pickOnMap.setAttribute('aria-pressed',String(selectingOnMap));
 pickOnMap.textContent=selectingOnMap?'Tap a collectible symbol…':'Pick start on map';
 status.textContent=selectingOnMap?'Tap a source-backed pin to choose your route origin.':'Map selection canceled.';
 if(selectingOnMap)mapFrame.scrollIntoView({block:'center',behavior:'smooth'});
});
pickOnMap.id='j190-sa-pick';
pickOnMap.setAttribute('aria-pressed','false');
const recalc=B('Build nearest route',()=>render('Route rebuilt from the selected starting pin.'));
const clear=B('Clear route',()=>{state.start=null;state.finish=null;persist();render('Route cleared. Pick a new starting pin.')});
const copy=B('Copy route list',async()=>{
 if(!lastRoute.length){status.textContent='Choose a starting pin first.';return}
 const rows=lastRoute.map((p,i)=>(i+1)+'. '+p.label+' · X '+p.worldX.toFixed(1)+' · Y '+p.worldY.toFixed(1));
 const msg='Team Jura San Andreas reference route (straight-line planning only)\n'+rows.join('\n');
 try{await navigator.clipboard.writeText(msg);status.textContent='Source-backed route list copied without personal notes or progress.';}
 catch(_){window.prompt('Copy your route list',msg);status.textContent='Route list ready to copy.'}
});
actions.append(pickOnMap,recalc,clear,copy);panel.append(actions);
const status=E('p','j190-sa-status','Waiting for the bundled source map and collectible positions…');
status.id='j190-sa-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');panel.append(status);
const list=E('ol','j190-sa-list');list.id='j190-sa-list';panel.append(list);
const foot=E('small','j190-sa-foot','Sourced locations: Flentric/SA.MapCollectibles (MIT), San Andreas 1.0 US script. Base art: Toliak vector (Apache-2.0). The 6000px 2D projection is approximate. Graffiti tag positions: Prineside DevTools / therainycat, attributed coordinate transcription. Jump zones: GTA:SA Savegame Editor reference save. Route lines are not launch trajectories.');
panel.append(foot);
host.insertBefore(panel,mapFrame);
const ns='http://www.w3.org/2000/svg';
const node=(tag,attrs)=>{const n=document.createElementNS(ns,tag);for(const k of Object.keys(attrs||{}))n.setAttribute(k,String(attrs[k]));return n};
const overlay=node('svg',{class:'j190-sa-overlay',viewBox:'0 0 6000 6000',preserveAspectRatio:'none','aria-hidden':'true'});
overlay.id='j190-sa-overlay';
map.append(overlay);
function sourceReady(){
 const im=document.querySelector('#mapBackground img.j86-san-map');
 return !!(im&&im.complete&&im.naturalWidth===6000&&im.naturalHeight===6000&&im.alt.includes('Toliak')&&pinLayer.querySelector('.pin-source-projected'));
}
function activeSet(){
 const set=document.body.dataset.juraSaSet;
 return TYPES.includes(set)?set:null;
}
function collected(id){
 try{const data=JSON.parse(localStorage.getItem(progressKey)||'null');return !!data?.items?.[id]?.done}catch(_){return false}
}
const safeChoice=(id,set)=>safePoint(id)&&id.startsWith(set+':')&&byId.has(id);
function syncControls(set){
 if(!set)return;
 if(state.set!==set){state.set=set;state.start=null;state.finish=null;persist()}
 const options=points.filter(p=>p.set===set);
 const first=startPick.value,second=finishPick.value;
 startPick.replaceChildren(E('option','','Choose a starting pin…'));
 finishPick.replaceChildren(E('option','','No required ending pin'));
 startPick.firstChild.value='';finishPick.firstChild.value='';
 for(const p of options){
  const a=E('option','',p.label),b=E('option','',p.label);a.value=b.value=p.id;
  startPick.append(a);finishPick.append(b);
 }
 startPick.value=safeChoice(state.start,set)?state.start:'';
 finishPick.value=safeChoice(state.finish,set)&&state.finish!==state.start?state.finish:'';
 if(first!==startPick.value||second!==finishPick.value)persist();
}
function nearest(){
 const start=byId.get(state.start),end=byId.get(state.finish),set=activeSet();
 if(!start||start.set!==set)return [];
 const remain=points.filter(p=>p.set===set&&p.id!==state.start&&p.id!==state.finish&&(!state.skipCollected||!collected(p.id)));
 let here=start;const out=[start];
 const budget=Math.max(1,state.limit-(end?1:0));
 while(remain.length&&out.length<budget){
  remain.sort((a,b)=>{
   const dist=p=>(p.x-here.x)**2+(p.y-here.y)**2;
   return dist(a)-dist(b)||a.slot-b.slot;
  });
  here=remain.shift();out.push(here);
 }
 if(end&&end.id!==start.id)out.push(end);
 return out;
}
function draw(route){
 overlay.replaceChildren();
 if(route.length>1)overlay.append(node('polyline',{class:'j190-sa-line',points:route.map(p=>p.x.toFixed(2)+','+p.y.toFixed(2)).join(' ')}));
 route.forEach((p,i)=>{
  const x=Math.min(5890,p.x+125),y=Math.max(95,p.y-115);
  const mark=node('g',{class:'j190-sa-step'+(!i?' j190-sa-first':p.id===state.finish?' j190-sa-last':'')});
  mark.append(node('circle',{cx:x,cy:y,r:66}));
  const txt=node('text',{x,y:y+17,'text-anchor':'middle'});txt.textContent=String(i+1);mark.append(txt);overlay.append(mark);
 });
 for(const b of pinLayer.querySelectorAll('.pin-source-projected')){
  b.classList.toggle('j190-sa-start',b.dataset.juraSaPoint===state.start);
  b.classList.toggle('j190-sa-finish',b.dataset.juraSaPoint===state.finish);
 }
}
function render(message){
 const set=activeSet();ready=sourceReady()&&points.filter(p=>p.set===set).length===({tags:100,snapshots:50,horseshoes:50,oysters:50,jumps:70}[set]||-1);
 const legitimate=!!set&&TYPES.includes(set);
 syncControls(legitimate?set:null);
 const usable=ready&&legitimate;
 [startPick,finishPick,limitPick,check,pickOnMap,recalc,copy].forEach(c=>{c.disabled=!usable});
 clear.disabled=!state.start&&!state.finish;
 if(!usable){lastRoute=[];overlay.replaceChildren();list.replaceChildren();
  status.textContent='Route unavailable until the bundled Toliak map and the selected sourced collection load. Personal images are never overlaid with unmatched coordinates.';return}
 if(!safeChoice(state.start,set))state.start=null;
 if(!safeChoice(state.finish,set)||state.finish===state.start)state.finish=null;
 startPick.value=state.start||'';finishPick.value=state.finish||'';
 lastRoute=nearest();draw(lastRoute);
 list.replaceChildren();
 if(!state.start)list.append(E('li','j190-sa-empty','Choose any sourced marker above, or tap Pick start on map.'));
 for(const [i,p] of lastRoute.entries()){
  const row=E('li','j190-sa-stop');
  row.classList.toggle('j190-sa-collected',collected(p.id));
  const badge=E('strong','j190-sa-index',i===0?'START':p.id===state.finish?'FINISH':String(i+1));
  const button=B(p.label,()=>{
   const existing=pinLayer.querySelector('[data-jura-sa-point="'+p.id+'"]');
   mapFrame.scrollIntoView({block:'center',behavior:'smooth'});
   if(existing){existing.focus({preventScroll:true});existing.click()}
   else status.textContent='Switch to '+p.set+' to show that source marker on the current map.';
  });
  button.className='j190-sa-locate';
  const detail=E('small','',collected(p.id)?'✓ Collected · ':'Not yet collected · ');
  detail.append('X '+p.worldX.toFixed(0)+' · Y '+p.worldY.toFixed(0));
  row.append(badge,button,detail);list.append(row);
 }
 const label=state.start?(byId.get(state.start)?.label||'selected pin'):'No starting marker';
 status.textContent=message||(state.start?
  'Starting at '+label+' · '+Math.max(0,lastRoute.length-1)+' reference stops'+(state.finish?' · finish selected':'')+' · '+set+' collection.':
  'Select a source marker to build a route through '+set+' locations.');
 recalc.disabled=!state.start;copy.disabled=!lastRoute.length;
}
function setStart(id){
 const set=activeSet();if(!set||!safeChoice(id,set))return false;
 state.start=id;if(state.finish===id)state.finish=null;
 selectingOnMap=false;pickOnMap.setAttribute('aria-pressed','false');pickOnMap.textContent='Pick start on map';
 persist();render();return true;
}
startPick.addEventListener('change',()=>{if(startPick.value)setStart(startPick.value);else{state.start=null;persist();render()}});
finishPick.addEventListener('change',()=>{state.finish=safeChoice(finishPick.value,activeSet())&&finishPick.value!==state.start?finishPick.value:null;persist();render()});
limitPick.addEventListener('change',()=>{state.limit=LIMITS.includes(+limitPick.value)?+limitPick.value:15;persist();render()});
check.addEventListener('change',()=>{state.skipCollected=check.checked;persist();render()});
pinLayer.addEventListener('click',e=>{
 if(!selectingOnMap)return;
 const b=e.target.closest('.pin-source-projected[data-jura-sa-point]');
 if(!b)return;
 if(setStart(b.dataset.juraSaPoint))status.textContent='Starting at '+byId.get(b.dataset.juraSaPoint).label+'. Route recalculated.';
},true);
document.getElementById('items')?.addEventListener('change',e=>{
 if(e.target.matches('input[type=checkbox]'))queueMicrotask(()=>render('Collection progress changed. Route updated.'))
});
document.getElementById('categories')?.addEventListener('click',()=>queueMicrotask(()=>render()));
const observer=new MutationObserver(()=>{if(waiting)return;waiting=true;requestAnimationFrame(()=>{waiting=false;render()})});
observer.observe(pinLayer,{childList:true});
async function load(){
 try{
  const response=await fetch('./data/atlas-sa-150-sourced-pins.json');
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  if(data?.schema!==1||data.game!=='san-andreas'||data.width!==6000||data.height!==6000||
     data.records?.length!==150||!String(data.sourceUrl).startsWith('https://github.com/Flentric/'))throw Error('Untrusted source or mismatched map dimensions');
  const unique=new Set();
  points=data.records.map(p=>{
   const id=p.set+':'+p.slot;
   if(!TYPES.includes(p.set)||!Number.isInteger(p.slot)||p.slot<1||p.slot>50||unique.has(id)||
      ![p.x,p.y,p.worldX,p.worldY].every(Number.isFinite)||p.x<0||p.y<0||p.x>6000||p.y>6000)throw Error('Invalid location pack item');
   unique.add(id);
   return{id,set:p.set,slot:p.slot,label:String(p.label||id).slice(0,120),x:p.x,y:p.y,worldX:p.worldX,worldY:p.worldY};
  });
  const extra=await Promise.allSettled([window.TeamJuraSATags?.load()||[],window.TeamJuraSAJumps?.load()||[]]);
  if(extra[0].status==='fulfilled')points.push(...extra[0].value.map(p=>({...p,id:'tags:'+p.slot})));
  if(extra[1].status==='fulfilled')points.push(...extra[1].value.map(p=>({...p,id:'jumps:'+p.slot})));
  byId=new Map(points.map(p=>[p.id,p]));
  render();
 }catch(err){status.textContent='Source-backed routes unavailable: '+err.message;overlay.replaceChildren();}
}
window.TeamJuraSARoute=Object.freeze({getState:()=>({...state}),getRoute:()=>lastRoute.map(p=>p.id),setStart,render});
load();
})();
