/* Elario Forge collection hub. Read-only projection of existing local stores. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else if(root)api.start(root)})(typeof window==='undefined'?null:window,function(){'use strict';
const keys={v:'team-jura-atlas101-concept-presets-v1',vi:'team-jura-forge-vi-concept-presets-v1',garage:'team-jura-atlas93-garage-v1',owned:'team-jura-atlas90-collection-v1',story:'team-jura-forge-armory-story-v1',online:'team-jura-forge-armory-online-v1',viArmory:'team-jura-forge-armory-vi-v1'};
const viNames={vi_cheetah95:'’95 Grotti Cheetah',vi_stanier55:'’55 Vapid Stanier',vi_dominator67_buggy:'’67 Vapid Dominator Buggy',vi_squalo:'Shitzu Squalo',vi_enduro:'Dinka Enduro Motorcycle',vi_crest_kayak:'Crest Kayak',vi_ganado_retro:'Ganado Retro Build'};
const worldNames={v:'GTA V / Online',vi:'GTA VI · Leonida',story:'GTA V Story',online:'GTA Online'};
const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
const safeId=id=>typeof id==='string'&&/^[a-z0-9_-]{2,75}$/.test(id)&&!['__proto__','prototype','constructor'].includes(id);
const nice=id=>id.replace(/_mk(\d+)/g,' Mk $1').replace(/[_-]/g,' ').replace(/([a-z])([0-9])/g,'$1 $2').replace(/\b[a-z]/g,c=>c.toUpperCase());
const label=(value,fallback)=>typeof value==='string'&&value.trim()?value.trim().slice(0,72):fallback;
const color=value=>typeof value==='string'&&/^#[a-f0-9]{6}$/i.test(value)?value:'#b99ad5';
function vehicleLink(world,id,variant){return './atlas-vehicle-configurator.html?'+(world==='vi'?'world=vi&':'')+'model='+encodeURIComponent(id)+(variant?'#variant='+encodeURIComponent(variant):'')}
function modelOK(world,id){return safeId(id)&&(world==='vi'?Object.hasOwn(viNames,id):!id.startsWith('vi_'))}
function collect(stores,weaponNames={}){
 const rows=[];
 for(const world of ['v','vi']){
  const data=stores[world];if(!object(data)||data.schema!==1)continue;
  for(const [kind,source] of [['primary',data.builds],['named',data.variants]]){
   if(!object(source))continue;
   for(const [id,raw] of Object.entries(source)){
    if(!modelOK(world,id))continue;
    const entries=kind==='named'?(Array.isArray(raw)?raw.slice(0,8):[]):[raw],seen=new Set();
    for(const entry of entries){if(!object(entry)||entry.model!==id||!/^#[a-f0-9]{6}$/i.test(entry.paint||''))continue;const name=label(entry.name,kind==='primary'?'Primary design':'');if(!name||seen.has(name.toLowerCase()))continue;seen.add(name.toLowerCase());rows.push({world,kind:'vehicle',model:id,title:name,subtitle:world==='vi'?viNames[id]:nice(id),detail:kind==='primary'?'Primary design':'Named build',paint:color(entry.paint),href:vehicleLink(world,id,kind==='named'?name:'')})}
   }
  }
 }
 const garage=stores.garage,owned=stores.owned;
 const ownedMarks=object(owned)&&owned.schema===1&&object(owned.owned)?owned.owned:{};
 const savedVehicles=object(garage)&&(garage.schema===1||garage.schema===undefined)&&object(garage.vehicles)?garage.vehicles:{};
 // Ownership and a saved Garage idea are independent. Show a saved concept even
 // when the visitor has not purchased/marked the model in GTA Online.
 const hasGarageBuild=v=>object(v)&&!!(
  v.note||v.plate||v.studioName||v.studioBody||v.garage||v.favorite||
  v.paint&&v.paint!=='Graphite'||v.secondary&&v.secondary!=='Midnight'||
  object(v.studioDesign)&&Object.keys(v.studioDesign).length
 );
 const garageIds=new Set(Object.keys(savedVehicles));
 for(const [key,mark] of Object.entries(ownedMarks)){
  if(mark===true&&key.startsWith('vehicles5:'))garageIds.add(key.slice('vehicles5:'.length));
 }
 for(const id of garageIds){
  if(!modelOK('v',id))continue;
  const meta=object(savedVehicles[id])?savedVehicles[id]:null;
  const isOwned=ownedMarks['vehicles5:'+id]===true;
  const isSaved=hasGarageBuild(meta);
  if(!isOwned&&!isSaved)continue;
  rows.push({world:'v',kind:'garage',model:id,
   title:label(meta?.studioName,nice(id)),
   subtitle:label(meta?.garage,'Unassigned'),
   detail:isSaved?(isOwned?'Saved Garage build · marked owned':'Saved Garage build · not marked owned'):'Marked owned in My Garage',
   paint:color(meta?.paint),href:'./atlas93-garage.html?addModel='+encodeURIComponent(id)});
 }
 for(const [world,store] of [['story',stores.story],['online',stores.online],['vi',stores.viArmory]]){
  if(!object(store)||store.schema!==1||!Array.isArray(store.items))continue;
  for(const id of [...new Set(store.items)].slice(0,8)){
   if(!safeId(id)||(world==='vi'&&!Object.hasOwn(weaponNames,id)))continue;
   const style=object(store.styles)&&Object.hasOwn(store.styles,id)?store.styles[id]:null;
   rows.push({world,kind:'armory',model:id,title:label(style?.label,world==='vi'?weaponNames[id]:nice(id)),subtitle:world==='vi'?weaponNames[id]:nice(id),detail:label(store.name,'Private exhibition'),paint:'#d8a66d',href:world==='vi'?'./atlas90-weapons6.html#forgeArmory':'./atlas90-weapons.html?world='+world+'#forgeArmory'});
  }
 }
 return rows;
}
function start(w){const d=w.document;async function init(){
 const root=d.getElementById('forgeCollectionRows');if(!root)return;
 const make=(tag,txt,cls)=>{const n=d.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;return n};
 const search=d.getElementById('forgeCollectionSearch'),world=d.getElementById('forgeCollectionWorld'),kind=d.getElementById('forgeCollectionKind'),count=d.getElementById('forgeCollectionCount');
 let names={},rows=[],unavailable=false;
 const read=key=>{try{return JSON.parse(w.localStorage.getItem(key)||'null')}catch{unavailable=true;return null}};
 try{const res=await w.fetch('./data/atlas192-vi-weapons.json');if(res.ok){const data=await res.json();if(data.scope==='vi'&&data.kind==='weapon'&&Array.isArray(data.records))for(const item of data.records)if(safeId(item.id)&&typeof item.name==='string')names[item.id]=item.name}}catch{}
 function render(){const term=search.value.trim().toLowerCase();const matches=rows.filter(x=>(world.value==='all'||x.world===world.value)&&(kind.value==='all'||x.kind===kind.value)&&(!term||[x.title,x.subtitle,x.detail,x.model].join(' ').toLowerCase().includes(term)));count.textContent=matches.length+' of '+rows.length+' saved entries'+(unavailable?' · Some local data unavailable':'');root.replaceChildren();for(const row of matches){const card=make('article',undefined,'fc-entry'),swatch=make('span',undefined,'fc-swatch');swatch.style.setProperty('--fc-paint',row.paint);swatch.setAttribute('aria-hidden','true');card.append(swatch,make('p',worldNames[row.world]+' · '+row.detail,'eyebrow'),make('h3',row.title),make('p',row.subtitle));const a=make('a','Open in '+(row.kind==='armory'?'Armory':row.kind==='garage'?'My Garage':'Forge Studio'));a.href=row.href;card.append(a);root.append(card)}if(!matches.length)root.append(make('p',rows.length?'No saved entries match these filters.':'Your collection is ready. Save a vehicle concept or display a virtual item in Armory to see it here.','fc-empty'))}
 function refresh(){unavailable=false;const stores={};for(const [name,key] of Object.entries(keys))stores[name]=read(key);rows=collect(stores,names);render()}
 search.addEventListener('input',render);world.addEventListener('change',render);kind.addEventListener('change',render);d.getElementById('forgeCollectionRefresh').addEventListener('click',refresh);w.addEventListener('storage',e=>{if(!e.key||Object.values(keys).includes(e.key))refresh()});w.addEventListener('pageshow',refresh);refresh();
 }if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init()}
return Object.freeze({collect,vehicleLink,keys,start});
});