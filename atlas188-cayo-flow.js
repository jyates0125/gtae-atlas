/* Atlas 18.8 — one-map Cayo quick flow.
 * Map legend visibility and route categories share one selection.
 * Reuses the 14 existing colorful source-map symbols, their selected locations,
 * the single 18.7 route engine and all historical guest progress keys.
 * No inferred roads, rights, coordinates, or guaranteed current spawns.
 */
(()=>{'use strict';
if(document.body.dataset.heist!=='cayo-perico'||document.getElementById('j188-quickbar'))return;
const route=window.teamJuraCayoPinRoute;
const stage=document.querySelector('.j180-stage'),frame=stage?.querySelector('.j180-map-frame');
const legend=frame?.querySelector('.j180-legend-rows'),focus=frame?.querySelector('#j167-heist-map');
const details=document.getElementById('j186-route'),picker=document.getElementById('j186-pick-start');
if(!route||!stage||!frame||!legend||!focus||!details||!picker)return;
const make=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
const btn=(text,fn,cls='')=>{const n=make('button','j188-button '+cls,text);n.type='button';n.addEventListener('click',fn);return n};
const rows=()=>[...legend.querySelectorAll('.j180-legend-row[data-cat]')];
const allTypes=rows().map(row=>row.dataset.cat);
const presets=[
 {id:'all',title:'All markers',categories:allTypes},
 {id:'loot',title:'Loot',categories:['secondary','gated']},
 {id:'equipment',title:'Equipment',categories:['bolts','grapple','clothes','truck','powder']},
 {id:'entry',title:'Entry / Exit',categories:['entry','exit','drainage']},
 {id:'intel',title:'Island intel',categories:['control','power','water']},
 {id:'chests',title:'Chests',categories:['chest']}
];
const bar=make('section','j188-quickbar');bar.id='j188-quickbar';
bar.setAttribute('aria-label','Cayo island map quick start and filters');
const header=make('div','j188-intro');
const title=make('div','j188-intro-copy');
title.append(make('strong','','EXPLORE THE ISLAND'),make('p','','Choose what to find. The colorful map symbols, legend and route will stay in sync.'));
const start=btn('Pick starting pin',()=>{picker.click();updateStatus();if(picker.getAttribute('aria-pressed')==='true')frame.scrollIntoView({block:'start',behavior:'smooth'});},'j188-primary');
start.id='j188-start';
start.setAttribute('aria-pressed','false');
header.append(title,start);bar.append(header);
const choices=make('div','j188-choices');choices.setAttribute('role','group');
choices.setAttribute('aria-label','Show island marker types and use them for routing');
const buttons=new Map();
let syncing=false;
function selectMapCategories(categories){
 const selected=new Set(categories);
 syncing=true;
 try{
  for(const row of rows()){
   const show=selected.has(row.dataset.cat);
   if((row.getAttribute('aria-pressed')==='true')!==show)row.click();
  }
 }finally{syncing=false}
 route.setCategories([...selected]);
 updateStatus();
}
for(const preset of presets){
 const b=btn(preset.title,()=>selectMapCategories(preset.categories),'j188-preset');
 b.dataset.preset=preset.id;b.setAttribute('aria-pressed','false');
 choices.append(b);buttons.set(preset.id,b);
}
bar.append(choices);
const status=make('p','j188-summary','Loading island markers…');status.id='j188-status';
status.setAttribute('role','status');status.setAttribute('aria-live','polite');
bar.append(status);
const provenance=make('details','j188-provenance');
provenance.append(make('summary','','Map accuracy, sources & credits'));
const sourceNote=make('p','','Map icons are original Elario symbols aligned approximately with the selected island image. Loot and equipment vary by heist. All 19 possible treasure chest positions remain available; yellow means possible, and dated/player-selected cyan highlights are not official live confirmation. The gold route follows map-image positions, not drivable paths.');
provenance.append(sourceNote);
const links=make('p','j188-source-links');
for(const [name,url] of [
 ['Our credits','./atlas-credits.html'],
 ['Cayo scoping guide','https://gta.wiki/w/Heist_Prep%3A_Gather_Intel'],
 ['GTALens references','https://gtalens.com/map/cayo-perico-heist']
]){
 if(links.childNodes.length)links.append(document.createTextNode(' · '));
 const a=make('a','',name);a.href=url;
 if(url.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer'}
 links.append(a);
}
provenance.append(links);bar.append(provenance);
stage.insertBefore(bar,frame);
document.body.classList.add('j188-cayo-smooth');

function getShown(){
 return [...focus.querySelectorAll('.j181-hotspot[data-marker-id],.j180-chest[data-chest]')]
   .filter(node=>!node.hidden&&getComputedStyle(node).display!=='none').length;
}
function updateStatus(){
 const selected=rows().filter(row=>row.getAttribute('aria-pressed')==='true').map(row=>row.dataset.cat);
 const current=route.getState();
 const same=(a,b)=>a.length===b.length&&a.every(x=>b.includes(x));
 let chosen='Custom';
 for(const preset of presets){
  const pressed=same(selected,preset.categories);
  buttons.get(preset.id)?.setAttribute('aria-pressed',String(pressed));
  if(pressed)chosen=preset.title;
 }
 const count=getShown();
 const markerName=id=>route.getNodes().find(x=>x.id===id)?.label||'a selected map marker';
 const selecting=picker.getAttribute('aria-pressed')==='true';
 start.setAttribute('aria-pressed',String(selecting));
 start.textContent=selecting?'Tap a map marker…':current.start?'Change starting pin':'Pick starting pin';
 const routePart=current.start
   ? ' · Start: '+markerName(current.start)+(current.finish?' · Finish: '+markerName(current.finish):'')+' · '+Math.max(0,current.order.length-1)+' planned stops'
   : selecting?' · Tap a visible symbol to start your route':' · Tap a marker to see details or pick your starting point';
 status.textContent=count+' visible marker'+(count===1?'':'s')+' · '+chosen+routePart;
}
function mirrorRouteToLegend(){
 if(syncing)return;
 const selected=new Set(route.getState().categories);
 syncing=true;
 try{
  for(const row of rows()){
   if((row.getAttribute('aria-pressed')==='true')!==selected.has(row.dataset.cat))row.click();
  }
 }finally{syncing=false}
 updateStatus();
}
function mirrorLegendToRoute(){
 if(syncing)return;
 const selected=rows().filter(row=>row.getAttribute('aria-pressed')==='true').map(row=>row.dataset.cat);
 syncing=true;
 try{route.setCategories(selected)}finally{syncing=false}
 updateStatus();
}
legend.addEventListener('click',event=>{
 if(!event.target.closest?.('.j180-legend-row[data-cat]')||syncing)return;
 queueMicrotask(mirrorLegendToRoute);
});
window.addEventListener('teamjura:cayo:route-categories',mirrorRouteToLegend);
window.addEventListener('teamjura:cayo:route-updated',updateStatus);
picker.addEventListener('click',()=>queueMicrotask(updateStatus));
focus.querySelector('.j167-search')?.addEventListener('input',()=>queueMicrotask(updateStatus));
new MutationObserver(updateStatus).observe(focus,{attributes:true,attributeFilter:['data-map-source']});
new MutationObserver(updateStatus).observe(focus.querySelector('.j180-chest-layer'),{childList:true});
mirrorRouteToLegend();
window.teamJuraCayoQuickFlow={version:'18.8',selectPreset:id=>{
 const p=presets.find(x=>x.id===id);if(!p)return false;selectMapCategories(p.categories);return true;
},getVisibleCount:getShown,refresh:updateStatus};
})();