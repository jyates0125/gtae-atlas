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
const HANDOFF='team-jura-forge-private-handoff-v1';
function vehicleLink(world,id,variant){return './atlas-vehicle-configurator.html?'+(world==='vi'?'world=vi&':'')+'model='+encodeURIComponent(id)+(variant?'&source=collection':'')}
function modelOK(world,id){return safeId(id)&&(world==='vi'?Object.hasOwn(viNames,id):!id.startsWith('vi_'))}
/* Atlas 32.0: display-only descriptors. Nothing from the comparison enters URLs
 * or browser storage. The source builds remain owned by their original tools. */
const savedText=(value,allowed)=>typeof value==='string'&&allowed.includes(value)?value:'Not saved';
const themeName=value=>typeof value==='string'&&/^[a-z0-9_-]{1,36}$/.test(value)?value:'Not saved';
function summarize(world,model,kind,entry,name){
 const d=object(entry.design)?entry.design:{};
 return Object.freeze({
  key:world+':'+model+':'+kind+(kind==='named'?':'+name.toLocaleLowerCase():''),
  world,model,kind,title:name,modelName:world==='vi'?viNames[model]:nice(model),
  paint:color(entry.paint),
  body:savedText(entry.body,['auto','sports','truck','standard']),
  environment:themeName(d.environment),
  finish:savedText(d.finish,['metallic','satin','stealth']),
  accent:typeof d.accent==='string'&&/^#[a-f0-9]{6}$/i.test(d.accent)?d.accent.toLowerCase():'Not saved',
  stance:savedText(d.stance,['street','low','raised']),
  kit:savedText(d.kit,['clean','sport','track']),
  wheels:savedText(d.wheels,['classic','mesh','deepdish']),rim:savedText(d.rim,['silver','gold','black']),stripe:savedText(d.stripe,['none','single','dual']),
  lights:typeof d.lights==='boolean'?(d.lights?'On':'Off'):'Not saved'
 });
}
function compareFields(a,b){
 if(!a||!b||a.key===b.key||a.world!==b.world||a.model!==b.model)return null;
 const fields=[['Body', 'body'],['Showroom environment','environment'],['Surface finish','finish'],['Accent','accent'],['Ride height','stance'],['Aero / deck styling','kit'],['Wheel design','wheels'],['Wheel finish','rim'],['Racing stripe','stripe'],['Concept lighting','lights']];
 return [['Paint','paint',a.paint,b.paint],...fields.map(([label,key])=>[label,key,a[key],b[key]])]
  .filter(([label,key,left,right])=>label==='Paint'||left!=='Not saved'||right!=='Not saved');
}

function collect(stores,weaponNames={}){
 const rows=[];
 for(const world of ['v','vi']){
  const data=stores[world];if(!object(data)||data.schema!==1)continue;
  for(const [kind,source] of [['primary',data.builds],['named',data.variants]]){
   if(!object(source))continue;
   for(const [id,raw] of Object.entries(source)){
    if(!modelOK(world,id))continue;
    const entries=kind==='named'?(Array.isArray(raw)?raw.slice(0,8):[]):[raw],seen=new Set();
    for(const entry of entries){if(!object(entry)||entry.model!==id||!/^#[a-f0-9]{6}$/i.test(entry.paint||''))continue;const name=label(entry.name,kind==='primary'?'Primary design':'');if(!name||seen.has(name.toLowerCase()))continue;seen.add(name.toLowerCase());rows.push({world,kind:'vehicle',model:id,title:name,subtitle:world==='vi'?viNames[id]:nice(id),detail:kind==='primary'?'Primary design':'Named build',paint:color(entry.paint),href:vehicleLink(world,id,kind==='named'?name:''),privateVariant:kind==='named'?{world,model:id,name}:null,preview:{body:entry.body,design:object(entry.design)?entry.design:{}},compare:summarize(world,id,kind,entry,name)})}
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
 const params=new URL(w.location.href).searchParams;
 if([...world.options].some(o=>o.value===params.get('world')))world.value=params.get('world');
 if([...kind.options].some(o=>o.value===params.get('kind')))kind.value=params.get('kind');
 let names={},rows=[],unavailable=false,selected=[],comparisonHint='';
 const preview=make('section',undefined,'fc-live-preview');preview.hidden=true;
 const previewTitle=make('h3','Saved 3D design'),previewNote=make('p','Preview uses your stored design. Changes here are temporary; open Forge Studio to save changes.'),previewClose=make('button','Close 3D preview'),previewHost=make('div');
 previewClose.type='button';preview.append(previewTitle,previewNote,previewClose,previewHost);root.before(preview);
 let previewTrigger=null;
 function closePreview(restoreFocus=false){w.TeamJuraGarage3D?.dispose();previewHost.replaceChildren();preview.hidden=true;if(restoreFocus&&previewTrigger?.isConnected)previewTrigger.focus();previewTrigger=null}
 previewClose.onclick=()=>closePreview(true);
 function previewType(row){
  if(!row.preview||!w.JuraForge?.modelProfile)return null;
  const types=['Sports concept','Touring concept','Pickup / Truck','Boat / Watercraft concept'];
  const original=types.find(type=>w.JuraForge.modelProfile(type,row.model));
  if(!original)return null;
  if(original.includes('Watercraft'))return original;
  const chosen={sports:'Sports concept',standard:'Touring concept',truck:'Pickup / Truck'}[row.preview.body];
  return chosen||original;
 }
 function openPreview(row,button,type){
  closePreview();previewTrigger=button;previewTitle.textContent=row.title+' · '+row.subtitle;preview.hidden=false;
  w.TeamJuraGarage3D.mount(previewHost,{name:row.subtitle,model:row.model,type,paint:row.paint,design:row.preview.design});
  previewClose.focus();preview.scrollIntoView({block:'nearest',behavior:'auto'});
 }
 const comparePanel=d.getElementById('forgeComparePanel'),compareStatus=d.getElementById('forgeCompareStatus'),compareBody=d.getElementById('forgeCompareBody'),compareClear=d.getElementById('forgeCompareClear');
 const read=key=>{try{return JSON.parse(w.localStorage.getItem(key)||'null')}catch{unavailable=true;return null}};
 try{const res=await w.fetch('./data/atlas192-vi-weapons.json');if(res.ok){const data=await res.json();if(data.scope==='vi'&&data.kind==='weapon'&&Array.isArray(data.records))for(const item of data.records)if(safeId(item.id)&&typeof item.name==='string')names[item.id]=item.name}}catch{}
 function drawComparison(){
  const active=selected.map(key=>rows.find(x=>x.compare?.key===key)?.compare).filter(Boolean);
  selected=active.map(x=>x.key);
  comparePanel.hidden=active.length===0;
  compareBody.replaceChildren();
  compareClear.disabled=active.length===0;
  if(!active.length){compareStatus.textContent='Choose two saved Forge vehicle designs for the same model to compare their recorded concept settings.';return}
  if(active.length===1){
   compareStatus.textContent='1 of 2 designs selected · '+active[0].modelName+'. Choose another saved design of this model.';
   compareBody.append(make('p','Only saved fields are compared; missing values are never invented.'));
   return;
  }
  const fields=compareFields(active[0],active[1]);
  if(!fields){selected=[active[1].key];drawComparison();return}
  compareStatus.textContent='Comparing 2 local designs for '+active[0].modelName+' · '+worldNames[active[0].world]+'. No save data was changed.';
  const scroll=make('div',undefined,'fc-compare-scroll'),table=make('table',undefined,'fc-compare-table'),thead=make('thead'),heading=make('tr');
  for(const value of ['Recorded setting',active[0].title,active[1].title]){
   const th=make('th',value);th.scope='col';heading.append(th)
  }
  thead.append(heading);table.append(thead);
  const body=make('tbody');
  for(const [name,key,left,right] of fields){
   const tr=make('tr'),head=make('th',name);head.scope='row';tr.append(head);
   for(const value of [left,right]){
    const cell=make('td');
    if((key==='paint'||key==='accent')&&/^#[0-9a-f]{6}$/i.test(value)){
     const chip=make('span',undefined,'fc-mini-paint');chip.style.setProperty('--fc-paint',value);chip.setAttribute('aria-hidden','true');cell.append(chip);
    }
    cell.append(make('span',value));tr.append(cell);
   }
   body.append(tr);
  }
  table.append(body);scroll.append(table);compareBody.append(scroll);
 }
 function render(){
  const term=search.value.trim().toLowerCase();
  const matches=rows.filter(x=>(world.value==='all'||x.world===world.value)&&(kind.value==='all'||x.kind===kind.value)&&(!term||[x.title,x.subtitle,x.detail,x.model].join(' ').toLowerCase().includes(term)));
  count.textContent=matches.length+' of '+rows.length+' saved entries'+(unavailable?' · Some local data unavailable':'');
  closePreview();root.replaceChildren();
  for(const row of matches){
   const card=make('article',undefined,'fc-entry'),swatch=make('span',undefined,'fc-swatch');
   swatch.style.setProperty('--fc-paint',row.paint);swatch.setAttribute('aria-hidden','true');
   card.append(swatch,make('p',worldNames[row.world]+' · '+row.detail,'eyebrow'),make('h3',row.title),make('p',row.subtitle));
   const a=make('a','Open in '+(row.kind==='armory'?'Armory':row.kind==='garage'?'My Garage':'Forge Studio'));a.href=row.href;
   if(row.privateVariant){
    a.addEventListener('click',event=>{
     try{w.sessionStorage.setItem(HANDOFF,JSON.stringify(row.privateVariant))}
     catch{
      event.preventDefault();
      count.textContent='Private browser handoff unavailable. Open Forge Studio and load the named design manually; your saved builds are unchanged.';
     }
    });
   }
   card.append(a);
   const type=previewType(row);
   if(type&&w.TeamJuraGarage3D?.mount){const live=make('button','View saved 3D model','fc-live-model');live.type='button';live.onclick=()=>openPreview(row,live,type);card.append(live)}
   if(row.compare){
    const chosen=selected.includes(row.compare.key);
    const button=make('button',chosen?'Remove from comparison':'Compare saved design','fc-compare-toggle');
    button.type='button';button.setAttribute('aria-pressed',String(chosen));
    button.setAttribute('aria-label',(chosen?'Remove ':'Compare ')+row.title+' · '+row.compare.modelName);
    button.addEventListener('click',()=>{
     const key=row.compare.key;
     if(selected.includes(key))selected=selected.filter(x=>x!==key);
     else{
      const previous=rows.find(x=>x.compare?.key===selected[0])?.compare;
      if(previous&&(previous.world!==row.compare.world||previous.model!==row.compare.model)){
       selected=[key];comparisonHint='Comparison is restricted to the same vehicle and world. ';
      }else if(selected.length>=2)selected=[selected[1],key];
      else selected.push(key);
     }
     render();
     if(comparisonHint){compareStatus.textContent=comparisonHint+compareStatus.textContent;comparisonHint=''}
    });
    card.append(button);
   }
   root.append(card);
  }
  if(!matches.length)root.append(make('p',rows.length?'No saved entries match these filters.':'Your collection is ready. Save a vehicle concept or display a virtual item in Armory to see it here.','fc-empty'));
  drawComparison();
 }
 function refresh(){unavailable=false;const stores={};for(const [name,key] of Object.entries(keys))stores[name]=read(key);rows=collect(stores,names);render()}
 compareClear.addEventListener('click',()=>{selected=[];render();compareStatus.textContent='Comparison cleared. Your stored designs were not changed.'});
 search.addEventListener('input',render);world.addEventListener('change',render);kind.addEventListener('change',render);d.getElementById('forgeCollectionRefresh').addEventListener('click',refresh);w.addEventListener('storage',e=>{if(!e.key||Object.values(keys).includes(e.key))refresh()});w.addEventListener('pageshow',refresh);refresh();
 }if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init()}
return Object.freeze({collect,compareFields,vehicleLink,keys,start});
});