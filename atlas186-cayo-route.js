/* Atlas 18.6 · Elario Cayo pin-first route planner.
 * Routes follow the selected colorful symbols on the existing island map.
 * The greedy nearest-neighbor algorithm uses screenshot-projected positions,
 * NOT verified roads, actual distances, accessible entrances or travel time.
 * Never modifies the older Cayo checklist, 16.7 route, mission selections,
 * globally shared maps or content data. Guest progress is private/local.
 */
(()=>{'use strict';
if(document.body.dataset.heist!=='cayo-perico'||document.getElementById('j186-route'))return;
const focus=document.getElementById('j167-heist-map');
const world=focus?.querySelector('.j167-world'),hotspots=world?.querySelector('#j181-hotspots');
const chests=world?.querySelector('.j180-chest-layer'),stage=document.querySelector('.j180-stage');
const frame=document.querySelector('.j180-map-frame');
if(!focus||!world||!hotspots||!chests||!stage||!frame)return;
document.body.classList.add('j186-cayo-routing');
const SVG_NS='http://www.w3.org/2000/svg';
const ns=(tag,attrs={})=>{const n=document.createElementNS(SVG_NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n};
const button=(txt,cls,cb)=>{const b=el('button',cls,txt);b.type='button';b.addEventListener('click',cb);return b};
const storage='teamjura-cayo-pinroute-v1';
const DEFAULT=['secondary','gated'];
const ALL_CATS=['entry','exit','drainage','secondary','gated','bolts','grapple','clothes','truck','control','power','powder','water','chest'];
const presets={
 'Loot':['secondary','gated'],
 'Equipment':['bolts','grapple','clothes','truck','powder'],
 'Entry & exit':['entry','exit','drainage'],
 'Island intel':['control','power','water'],
 'Chests':['chest']
};
const defaultState=()=>({start:null,order:[],categories:[...DEFAULT],limit:10,mode:'nearest',chestMode:'active',completed:[]});
let state=defaultState();
try{
 const v=JSON.parse(localStorage.getItem(storage)||'null');
 if(v&&typeof v==='object'){
  const safeId=x=>typeof x==='string'&&/^(?:entry|exit|drainage|secondary|gated|bolts|grapple|clothes|truck|control|power|powder|water)-\d+$|^chest-(?:[1-9]|1[0-9])$/.test(x);
  state.start=safeId(v.start)?v.start:null;
  state.order=Array.isArray(v.order)?[...new Set(v.order.filter(safeId))].slice(0,110):[];
  state.categories=Array.isArray(v.categories)?[...new Set(v.categories.filter(x=>ALL_CATS.includes(x)))]:[...DEFAULT];
  state.limit=[5,10,20,50,100].includes(v.limit)?v.limit:10;
  state.mode=v.mode==='manual'?'manual':'nearest';
  state.chestMode=v.chestMode==='all'?'all':'active';
  state.completed=Array.isArray(v.completed)?[...new Set(v.completed.filter(safeId))].slice(0,110):[];
 }
}catch(_){}
const persist=()=>{try{localStorage.setItem(storage,JSON.stringify({schema:1,updatedAt:new Date().toISOString(),...state}))}catch(_){}};
const shared=new URLSearchParams(location.search).get('cayoRoute');
if(shared&&shared.length<3500){
 try{
  const v=JSON.parse(shared);
  const safe=id=>typeof id==='string'&&/^(?:entry|exit|drainage|secondary|gated|bolts|grapple|clothes|truck|control|power|powder|water)-\d+$|^chest-(?:[1-9]|1[0-9])$/.test(id);
  if(v?.version===1&&safe(v.start)){
   state.start=v.start;
   state.order=Array.isArray(v.order)?[...new Set(v.order.filter(safe))].slice(0,100):[v.start];
   if(state.order[0]!==v.start)state.order=[v.start,...state.order.filter(x=>x!==v.start)];
   state.categories=Array.isArray(v.categories)?[...new Set(v.categories.filter(x=>ALL_CATS.includes(x)))]:[...DEFAULT];
   state.mode='manual';state.chestMode=v.chestMode==='all'?'all':'active';
   state.limit=[5,10,20,50,100].includes(v.limit)?v.limit:10;
   persist();
  }
 }catch(_){}
}
function nodes(){
 const out=[];
 for(const b of hotspots.querySelectorAll('.j181-hotspot[data-marker-id]')){
  const x=parseFloat(b.style.left),y=parseFloat(b.style.top);
  if(!Number.isFinite(x)||!Number.isFinite(y))continue;
  const label=(b.getAttribute('aria-label')||b.title||'Cayo location').replace(/\s*\(approximate\)\s*$/i,'').replace(/^[^:]+:\s*/,'');
  out.push({id:b.dataset.markerId,cat:b.dataset.category,label,x,y,
    active:true,element:b,shown:!b.hidden&&getComputedStyle(b).display!=='none'});
 }
 for(const b of chests.querySelectorAll('.j180-chest[data-chest]')){
  const x=parseFloat(b.style.left),y=parseFloat(b.style.top);
  const n=+b.dataset.chest;if(!Number.isFinite(x)||!Number.isFinite(y)||n<1||n>19)continue;
  out.push({id:'chest-'+n,cat:'chest',label:'Treasure chest #'+n+(n<=10?' · land':' · underwater'),x,y,
    active:b.classList.contains('j180-chest-active'),element:b,shown:!b.hidden&&getComputedStyle(b).display!=='none'});
 }
 return out;
}
const byId=()=>new Map(nodes().map(n=>[n.id,n]));
const distance=(a,b)=>{const dx=(a.x-b.x)*1.0174,dy=a.y-b.y;return dx*dx+dy*dy};
const panel=el('section','j186-panel');panel.id='j186-route';panel.setAttribute('aria-label','Build a Cayo route from a selected map marker');
const head=el('div','j186-head');
const heading=el('div');heading.append(el('span','j186-eyebrow','PERSONAL ROUTE · ON THE ISLAND MAP'),el('h3','','Choose a starting pin and build a route'));
const helper=el('p','','Tap any colorful pin or chest, choose “Start route here”, then select the categories you want to visit. The line orders nearby reference markers; it is not a verified in-game road, path, speed or travel-time calculation.');
head.append(heading,helper);panel.append(head);
const status=el('p','j186-status','Choose any colorful marker on the island to begin.');
status.setAttribute('role','status');status.setAttribute('aria-live','polite');panel.append(status);
const presetsBox=el('div','j186-presets');
presetsBox.append(el('strong','','What are you looking for?'));
const choices=el('div','j186-preset-buttons');
for(const [name,cats] of Object.entries(presets)){
 const b=button(name,'j186-preset',()=>{
  state.categories=[...cats];persist();refreshFilters();
  if(state.start&&state.mode==='nearest')autoRoute();
  else render();
 });
 choices.append(b);
}
const allCategories=button('All types','j186-preset',()=>{
 state.categories=[...ALL_CATS];persist();refreshFilters();
 if(state.start&&state.mode==='nearest')autoRoute();else render();
});
choices.append(allCategories);presetsBox.append(choices);
const filters=el('div','j186-categories');filters.setAttribute('role','group');filters.setAttribute('aria-label','Choose marker types for your personal route');
const filterChecks=new Map();
for(const b of document.querySelectorAll('.j180-legend-row[data-cat]')){
 const cat=b.dataset.cat;
 if(!ALL_CATS.includes(cat)||filterChecks.has(cat))continue;
 const caption=b.querySelector('.j180-legend-copy strong')?.textContent||cat;
 const label=el('label','j186-filter');
 const check=el('input');check.type='checkbox';check.value=cat;check.checked=state.categories.includes(cat);check.setAttribute('aria-label','Route category '+caption);
 check.addEventListener('change',()=>{
  if(check.checked&&!state.categories.includes(cat))state.categories.push(cat);
  else if(!check.checked)state.categories=state.categories.filter(x=>x!==cat);
  persist();if(state.start&&state.mode==='nearest')autoRoute();else render();
 });
 const icon=b.querySelector('.j180-glyph')?.cloneNode(true);
 if(icon)label.append(icon);
 label.append(check,el('span','',caption));filters.append(label);filterChecks.set(cat,check);
}
function refreshFilters(){for(const [cat,check] of filterChecks)check.checked=state.categories.includes(cat);}
presetsBox.append(filters);panel.append(presetsBox);
const controls=el('div','j186-controls');
const modeLabel=el('label','j186-select-label','Routing style');
const mode=el('select');mode.setAttribute('aria-label','Routing style');
for(const [value,text] of [['nearest','Nearest next marker'],['manual','My chosen stop order']]){
 const option=el('option','',text);option.value=value;mode.append(option);
}
mode.value=state.mode;mode.addEventListener('change',()=>{
 state.mode=mode.value;persist();if(state.start&&state.mode==='nearest')autoRoute();else render();
});modeLabel.append(mode);controls.append(modeLabel);
const limitLabel=el('label','j186-select-label','Maximum stops');
const limitSelect=el('select');limitSelect.setAttribute('aria-label','Maximum route stops');
for(const n of [5,10,20,50,100]){
 const o=el('option','',n===100?'All available':'Up to '+n);o.value=String(n);limitSelect.append(o);
}
limitSelect.value=String(state.limit);limitSelect.addEventListener('change',()=>{
 state.limit=+limitSelect.value;persist();if(state.start&&state.mode==='nearest')autoRoute();else render();
});limitLabel.append(limitSelect);controls.append(limitLabel);
const chestLabel=el('label','j186-select-label','Treasure chests');
const chestMode=el('select');chestMode.setAttribute('aria-label','Treasure chest route eligibility');
for(const [value,text] of [['active','Highlighted daily two only'],['all','All 19 possible spots']]){
 const o=el('option','',text);o.value=value;chestMode.append(o);
}
chestMode.value=state.chestMode;chestMode.addEventListener('change',()=>{
 state.chestMode=chestMode.value;persist();if(state.start&&state.mode==='nearest')autoRoute();else render();
});chestLabel.append(chestMode);controls.append(chestLabel);
panel.append(controls);
const actions=el('div','j186-actions');
const buildBtn=button('Build nearest route','j186-action j186-primary',()=>autoRoute());
const nextBtn=button('Add next nearest','j186-action',()=>appendNearest());
const reverseBtn=button('Reverse stops','j186-action',()=>{
 if(state.order.length<3)return;
 state.mode='manual';mode.value='manual';
 const first=state.order[0];state.order=[first,...state.order.slice(1).reverse()];persist();render();
});
const clearBtn=button('Clear my route','j186-action',()=>{
 state.start=null;state.order=[];persist();render();
});
const shareBtn=button('Share this route','j186-action',async()=>{
 if(!state.start||!state.order.length){render('Choose a starting pin before sharing a route.');return;}
 const url=new URL(location.href);
 url.searchParams.set('cayoRoute',JSON.stringify({version:1,start:state.start,order:state.order.slice(0,100),categories:state.categories,mode:'manual',chestMode:state.chestMode,limit:state.limit}));
 url.hash='j186-route';
 try{await navigator.clipboard.writeText(url.href);status.textContent='Personal route link copied. The link shares only map stops and chosen categories—never notes or saved progress.';}
 catch(_){if(navigator.share){try{await navigator.share({title:'Team Jura Cayo route',url:url.href});}catch(__){status.textContent='Sharing was canceled. Your personal route is still saved on this device.';}}
 else{window.prompt('Copy your Cayo route link:',url.href);status.textContent='Route link ready to copy.';}}
});
actions.append(buildBtn,nextBtn,reverseBtn,clearBtn,shareBtn);panel.append(actions);
const list=el('ol','j186-stops');panel.append(list);
const caveat=el('p','j186-caveat','Source map and equipment positions are reference-aligned, not exact Rockstar world coordinates. Nearest means shortest straight-line separation between map symbols, not fastest or safely traversable travel. Hidden or unavailable daily chests are excluded in daily-only mode.');
panel.append(caveat);
const credit=stage.querySelector('.j180-credit');
stage.insertBefore(panel,credit||null);
const svg=ns('svg',{class:'j186-route-layer',viewBox:'0 0 100 100',preserveAspectRatio:'none','aria-hidden':'true'});
svg.setAttribute('focusable','false');world.append(svg);
function clearLayer(){svg.replaceChildren()}
function drawLine(){
 clearLayer();
 const map=byId();
 const route=state.order.map(x=>map.get(x)).filter(Boolean);
 if(route.length>1){
  const line=ns('polyline',{points:route.map(n=>n.x.toFixed(3)+','+n.y.toFixed(3)).join(' '),class:'j186-route-line'});
  svg.append(line);
 }
 for(const [i,n] of route.entries()){
  const mark=ns('g',{class:'j186-stop'+(i===0?' j186-first':'')});
  mark.append(ns('circle',{cx:n.x,cy:n.y,r:i===0?'2.5':'1.9'}));
  const text=ns('text',{x:n.x,y:n.y+.64,'text-anchor':'middle'});
  text.textContent=String(i+1);mark.append(text);svg.append(mark);
 }
 for(const node of world.querySelectorAll('.j181-hotspot,.j180-chest')){
  node.classList.toggle('j186-start',state.start===node.dataset.markerId||state.start==='chest-'+node.dataset.chest);
 }
}
function sourceFor(id){return byId().get(id)}
function availableTargets(map=byId()){
 return [...map.values()].filter(n=>{
  if(n.id===state.start||state.completed.includes(n.id)||!state.categories.includes(n.cat)||!n.shown)return false;
  return n.cat!=='chest'||state.chestMode==='all'||n.active;
 });
}
function autoRoute(){
 const map=byId(),start=map.get(state.start);
 if(!start){state.order=[];render('Choose a starting marker on the map first.');return}
 state.mode='nearest';mode.value='nearest';
 const remaining=availableTargets(map);let here=start;
 const order=[state.start];
 while(remaining.length&&order.length<state.limit){
  remaining.sort((a,b)=>distance(here,a)-distance(here,b)||(a.id.localeCompare(b.id)));
  here=remaining.shift();order.push(here.id);
 }
 state.order=order;persist();
 const count=order.length-1;
 render(count?'Built a route from '+start.label+' through '+count+' nearby references.':'Starting at '+start.label+'. Select matching target categories or display more map pins.');
}
function appendNearest(){
 const map=byId();if(!map.has(state.start)){render('Tap a starting pin first.');return}
 if(!state.order.length)state.order=[state.start];
 const last=map.get(state.order.at(-1))||map.get(state.start);
 const candidates=availableTargets(map).filter(n=>!state.order.includes(n.id));
 if(!candidates.length){render('No more eligible locations for the selected categories.');return}
 candidates.sort((a,b)=>distance(last,a)-distance(last,b)||a.id.localeCompare(b.id));
 if(state.order.length>=100){render('Maximum 100 stops reached.');return}
 state.order.push(candidates[0].id);
 state.mode='manual';mode.value='manual';persist();render('Added '+candidates[0].label+' as the nearest available next stop.');
}
function startFrom(id){
 const marker=sourceFor(id);if(!marker)return false;
 state.start=id;state.order=[id];persist();
 if(state.mode==='nearest')autoRoute();
 else render('Starting pin: '+marker.label+'. Tap another marker and choose “Add as stop”, or use “Add next nearest”.');
 return true;
}
function addStop(id){
 const target=sourceFor(id);if(!target)return false;
 if(!state.start)return startFrom(id);
 if(state.order.includes(id)){render('This location is already in your route.');return true}
 if(state.order.length>=100){render('Maximum of 100 manually chosen stops reached.');return false}
 state.mode='manual';mode.value='manual';state.order.push(id);persist();render('Added '+target.label+' to your route.');
 return true;
}
function shift(id,delta){
 const index=state.order.indexOf(id),dest=index+delta;
 if(index<1||dest<1||dest>=state.order.length)return;
 [state.order[index],state.order[dest]]=[state.order[dest],state.order[index]];
 state.mode='manual';mode.value='manual';persist();render();
}
function selectStop(id){
 const n=sourceFor(id);if(!n)return;
 if(focus.dataset.mapSource==='loading')return;
 n.element.focus({preventScroll:true});
 n.element.click();frame.scrollIntoView({block:'start',behavior:'smooth'});
}
function render(message){
 const map=byId();
 state.order=[...new Set(state.order)].filter(id=>map.has(id));
 if(state.start&&!map.has(state.start)){state.start=null;state.order=[]}
 if(state.start&&state.order[0]!==state.start){
  state.order=[state.start,...state.order.filter(x=>x!==state.start)];
 }
 const start=map.get(state.start);
 status.textContent=message||(start?
  'Start: '+start.label+' · '+Math.max(0,state.order.length-1)+' stops in personal route.':
  'Select a colorful island marker, tap “Start route here”, and choose your destination types.');
 buildBtn.disabled=!start;nextBtn.disabled=!start;
 reverseBtn.disabled=state.order.length<3;clearBtn.disabled=!start&&!state.order.length;
 list.replaceChildren();
 if(!state.order.length)list.append(el('li','j186-empty','Tap any island marker to select your starting point.'));
 else for(const [i,id] of state.order.entries()){
  const node=map.get(id);if(!node)continue;
  const row=el('li','j186-stop-item');
  const ordinal=el('span','j186-ordinal',i?'Stop '+i:'START');
  const show=button(node.label,'j186-stop-name',()=>selectStop(id));
  const category=el('span','j186-stop-category',node.cat==='chest'?'Treasure chest':node.cat);
  const controls=el('div','j186-stop-controls');
  if(i>0){
   const done=button(state.completed.includes(id)?'✓':'○','j186-mini j186-done',()=>{
    if(state.completed.includes(id))state.completed=state.completed.filter(x=>x!==id);
    else state.completed.push(id);
    persist();render();
   });
   done.setAttribute('aria-label',(state.completed.includes(id)?'Mark not visited: ':'Mark visited: ')+node.label);
   done.title=state.completed.includes(id)?'Unmark visited':'Mark as visited';
   controls.append(done);
   row.classList.toggle('j186-visited',state.completed.includes(id));
  }
  if(i>1){const up=button('↑','j186-mini',()=>shift(id,-1));up.setAttribute('aria-label','Move '+node.label+' earlier');controls.append(up);}
  if(i>0&&i<state.order.length-1){const down=button('↓','j186-mini',()=>shift(id,1));down.setAttribute('aria-label','Move '+node.label+' later');controls.append(down);}
  if(i>0){const del=button('×','j186-mini',()=>{state.order=state.order.filter(x=>x!==id);state.mode='manual';mode.value='manual';persist();render();});del.setAttribute('aria-label','Remove '+node.label+' from route');controls.append(del);}
  row.append(ordinal,show,category,controls);list.append(row);
 }
 drawLine();
}
const watcher=new MutationObserver(()=>{
 // The daily chest module replaces buttons after each 06:00 UTC reset;
 // re-bind the route line to the refreshed button positions, not old nodes.
 if(state.order.some(id=>id.startsWith('chest-'))||state.start?.startsWith('chest-'))render();
});
watcher.observe(chests,{childList:true});
const manualStart=()=>{panel.scrollIntoView({block:'nearest',behavior:'smooth'})};
const jump=button('Build a route','j186-map-jump',manualStart);
const headToolbar=stage.querySelector('.j180-map-header .j180-modes');
headToolbar?.append(jump);
// Integrate with BOTH map marker systems. The original colorful hotspot
// and chest scripts build the popup first; we append route actions afterward.
// In crowded areas, the 18.5 chooser invokes the chosen marker's click, so
// the same controls appear for each individual, close-together reference.
world.addEventListener('click',event=>{
 const marker=event.target.closest?.('.j181-hotspot[data-marker-id],.j180-chest[data-chest]');
 if(!marker)return;
 const id=marker.dataset.markerId||('chest-'+marker.dataset.chest);
 queueMicrotask(()=>{
  const info=document.querySelector('.j180-pin-info');
  if(!info||info.hidden||!sourceFor(id)||info.querySelector('.j186-pin-actions'))return;
  const row=el('div','j186-pin-actions');
  row.append(
   button('Start route here','',()=>{startFrom(id);info.hidden=true;}),
   button(state.start?'Add as next stop':'Select as start','',()=>{if(state.start)addStop(id);else startFrom(id);info.hidden=true;})
  );
  info.append(row);
 });
});
window.teamJuraCayoPinRoute={startFrom,addStop,autoRoute,appendNearest,render,
 getState:()=>JSON.parse(JSON.stringify(state)),
 getStops:()=>state.order.slice(),
 getNodes:()=>nodes().map(n=>({id:n.id,cat:n.cat,label:n.label,x:n.x,y:n.y,active:n.active})),
 reset:()=>{state=defaultState();refreshFilters();mode.value=state.mode;limitSelect.value=String(state.limit);chestMode.value=state.chestMode;persist();render()},
 selectCategory:(cat)=>{if(!ALL_CATS.includes(cat))return false;state.categories=[cat];refreshFilters();persist();if(state.start)autoRoute();else render();return true}};
refreshFilters();render();
})();