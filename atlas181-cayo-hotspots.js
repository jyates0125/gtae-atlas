/* Atlas 18.1 · Cayo screenshot-marker interaction layer.
   Owner reference: IMG_2782/2783 and approved IMG_2785. The colored
   pictograms are already in the map art. Hotspots overlay those pictograms
   WITHOUT adding another visible pin. Positions are visually approximate;
   no stolen site icon sprites, false game XYZ, or fake daily-live claims. */
(()=>{'use strict';
if(document.body.dataset.heist!=='cayo-perico'||document.getElementById('j181-hotspots'))return;
const focus=document.getElementById('j167-heist-map');
const world=focus?.querySelector('.j167-world'),mapArea=document.querySelector('.j180-map-area');
const legend=document.querySelector('.j180-legend-rows'),info=mapArea?.querySelector('.j180-pin-info');
if(!focus||!world||!mapArea||!legend||!info)return;
document.body.classList.add('j181-map-hotspots');
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n};
const button=(label,cls,handler)=>{const e=el('button',cls,label);e.type='button';e.addEventListener('click',handler);return e};
const categories=[
 ['entry','Infiltration points','📍','Possible island approach locations'],
 ['exit','Exit points','▲','Finale exit options (enhanced reference)'],
 ['drainage','Drainage tunnel','▦','Underwater compound entrance'],
 ['secondary','Secondary targets','●','Possible loot areas · contents vary'],
 ['gated','Gated secondary targets','◉','Loot behind a locked access area'],
 ['bolts','Bolt cutters','✂','Possible equipment pickup areas'],
 ['grapple','Grappling equipment','⌁','Possible grappling pickup areas'],
 ['clothes','Guard clothing','♟','Possible disguises for this run'],
 ['truck','Supply truck','▣','Possible supply-truck observation'],
 ['control','Control tower','⌁','Air defense control tower'],
 ['power','Power station','ϟ','Island power control reference'],
 ['powder','Cutting powder','▤','Possible optional sabotage equipment'],
 ['water','Water tower','💧','Water tower reference'],
 ['chest','Treasure chests','●','19 possible; daily two shown separately']
];
/* Map-display percentages read manually against the user's colored-marker
   screenshot (1284 × 1262). They point to EXISTING icons in the artwork,
   not newly invented colored map pins. Some crowded icon clusters are approximate.
   If an item does not appear on the game-map image, do not invent its visual. */
const records=[
 // category, X%, Y%, region or recognizable point name, linked heist POI (optional), view
 ['entry',37.3,12.6,'Airstrip infiltration','Airstrip'],
 ['entry',54.6,2.7,'North drop-zone infiltration','North Drop Zone'],
 ['entry',73.4,25.8,'North Dock infiltration','North Dock'],
 ['entry',59.6,48.9,'Main Dock infiltration','Main Dock'],
 ['entry',68.4,84,'Compound coast reference','El Rubio Compound'],
 ['entry',90.7,87.1,'South coast infiltration','South Drop Zone'],
 ['exit',28.4,22.4,'Airstrip exit','Airstrip','enhanced'],
 ['exit',75,29,'North Dock exit','North Dock','enhanced'],
 ['exit',57.1,51,'Main Dock exit','Main Dock','enhanced'],
 ['exit',90.5,87.5,'South coast exit','South Drop Zone','enhanced'],
 ['drainage',68.4,83.3,'Drainage tunnel','Drainage Tunnel','enhanced'],
 ['secondary',34,11.8,'Airstrip northern storage','Secondary loot areas'],
 ['secondary',35.3,11.5,'Airstrip hangars','Secondary loot areas'],
 ['secondary',35.9,16.9,'Airstrip storage','Secondary loot areas'],
 ['secondary',67.3,18.8,'North Dock storage','Secondary loot areas'],
 ['secondary',69.4,19.7,'North Dock eastern storage','Secondary loot areas'],
 ['secondary',71.6,19.6,'North Dock warehouse','Secondary loot areas'],
 ['secondary',69.3,23.7,'North Dock pier','Secondary loot areas'],
 ['secondary',62.5,46,'Main Dock upper yard','Secondary loot areas'],
 ['secondary',65.1,48.8,'Main Dock south yard','Secondary loot areas'],
 ['secondary',60.9,51.8,'Main Dock western storage','Secondary loot areas'],
 ['secondary',59.7,54,'Main Dock storage','Secondary loot areas'],
 ['secondary',73,47.4,'Eastern farm storage','Secondary loot areas'],
 ['secondary',75.1,54.8,'Eastern farm warehouses','Secondary loot areas'],
 ['secondary',82.2,56.7,'Southern eastern storage','Secondary loot areas'],
 ['gated',34.8,11.8,'Airstrip gated storage','Secondary loot areas'],
 ['gated',68.3,20,'North Dock gated storage','Secondary loot areas'],
 ['gated',65.6,48.8,'Main Dock gated storage','Secondary loot areas'],
 ['gated',60.1,47.4,'Main Dock checkpoint loot','Secondary loot areas'],
 ['gated',74.2,54.7,'Eastern farm gated storage','Secondary loot areas'],
 ['bolts',39.1,15.5,'Airstrip chain-link cutters'],
 ['bolts',40.3,25.4,'West shore cutters'],
 ['bolts',58.2,51.4,'Main Dock cutters'],
 ['bolts',63.8,49,'Main Dock eastern cutters'],
 ['bolts',73.3,54.5,'Eastern work-yard cutters'],
 ['bolts',89.7,52.5,'East shore cutters'],
 ['grapple',5.7,24.4,'Western runway coastline'],
 ['grapple',37.4,26.2,'Western airstrip coast'],
 ['grapple',40.2,24,'Central northwest coast'],
 ['grapple',58.1,21.6,'North central ridge'],
 ['grapple',69.6,18.2,'North Dock ridge'],
 ['grapple',69.9,23.5,'North Dock hillside'],
 ['grapple',58.2,58.9,'Main Dock southern slope'],
 ['grapple',85.6,51,'Eastern shore'],
 ['grapple',78.4,64.7,'Southeast ridge'],
 ['grapple',94.6,74.3,'Southern east coast'],
 ['clothes',37.5,15.1,'Airstrip guards’ clothing'],
 ['clothes',52.1,29.2,'Central island guard clothing'],
 ['clothes',65.2,46.8,'Main Dock guard clothing'],
 ['clothes',62.5,51.1,'Dock checkpoint guard clothing'],
 ['clothes',58.3,54,'Dock jetty guard clothing'],
 ['clothes',73.9,41.9,'Eastern lane guard clothing'],
 ['clothes',58.1,65.2,'Southern road guard clothing'],
 ['clothes',70,69.4,'Roadside guard clothing'],
 ['truck',39.6,15.1,'Airstrip supply truck'],
 ['truck',72.1,20.1,'North Dock supply truck'],
 ['truck',73,47.7,'Eastern farm supply truck'],
 ['truck',59.1,51,'Main Dock supply truck'],
 ['truck',61.9,79.1,'Compound approach truck'],
 ['control',37.5,14.7,'Airstrip control tower','Control Tower'],
 ['power',40.1,19.5,'Airstrip power station','Power Station'],
 ['powder',55.1,57.1,'Cutting powder equipment area',null,'enhanced'],
 ['water',78.9,54,'Water tower',null,'enhanced']
];
const descriptions={
 entry:'Approach point. Access and availability depend on what you scope and prepare for this run.',
 exit:'Escape options must be chosen or confirmed on your current heist planning board.',
 drainage:'Scope the underwater entrance and complete the Cutting Torch preparation before relying on this approach.',
 secondary:'Loot type and whether this location is occupied can vary between heists. Do not treat this hotspot as a guaranteed spawn.',
 gated:'Possible secondary loot behind a restricted gate; check available access and actual contents during your run.',
 bolts:'Bolt cutters are a variable equipment spawn; check this area while scoping your current heist.',
 grapple:'Grappling equipment is variable between runs; check this area in-game before planning a wall entry.',
 clothes:'Guard clothing can move between runs; verify the disguise is present.',
 truck:'Truck appearance and access vary with the current heist. Verify before adding it to your plan.',
 control:'The air-defense control tower is distinct from the communications tower used for cameras.',
 power:'Power disruption reference for the island; verify the relevant finale interaction.',
 powder:'Optional cutting powder spawn reference; no fixed current spawn is asserted.',
 water:'Water tower reference, not a guaranteed active equipment location.'
};
const layer=el('div','j181-hotspots');layer.id='j181-hotspots';layer.setAttribute('aria-label','Clickable Cayo Perico colored map icons');world.append(layer);
const hiddenCats=new Set();const allItems=[];
const visitKey='teamjura-cayo-map-references-v1';let visited=new Set();
try{const a=JSON.parse(localStorage.getItem(visitKey)||'[]');if(Array.isArray(a))visited=new Set(a.filter(x=>typeof x==='string').slice(0,200));}catch(_){}
const persist=()=>{try{localStorage.setItem(visitKey,JSON.stringify([...visited]))}catch(_){}};
function popup(title,detail,record){
 info.hidden=false;info.replaceChildren();
 const close=button('×','j180-info-close',()=>{info.hidden=true});close.setAttribute('aria-label','Close Cayo location details');
 info.append(close,el('strong','',title),el('p','',detail));
 info.append(el('p','j181-qualifier','Colorful symbol shown by the source map. Interactive hotspot is manually aligned from reference imagery; position not independently georeferenced.'));
 if(record){
  const actions=el('div','j181-actions');
  const mark=button(visited.has(record.key)?'✓ Noted in my plan':'Mark as noted','j181-action',()=>{
   if(visited.has(record.key))visited.delete(record.key);else visited.add(record.key);
   persist();record.button.classList.toggle('j181-noted',visited.has(record.key));
   mark.textContent=visited.has(record.key)?'✓ Noted in my plan':'Mark as noted';
  });
  actions.append(mark);
  if(record.poi){
   const link=button('Show in route planner','j181-action',()=>{
    const found=window.teamJuraHeistViews?.selectPOI(record.poi);
    if(found){const a=focus.querySelector('.j167-detail-actions button:last-child');if(a&&a.textContent.includes('Add to route'))a.click();
      info.querySelector('.j181-qualifier').textContent='Linked to your personal planning route. Route paths are not game-verified travel directions.';
    }else{info.querySelector('.j181-qualifier').textContent='This marker has no confirmed match in the existing planner; it remains an approximate map reference.';}
   });actions.append(link);
  }
  info.append(actions);
 }
}
function update(){
 const query=String(focus.querySelector('.j167-search')?.value||'').trim().toLowerCase();
 const mapSource=focus.dataset.mapSource;
 for(const item of allItems){
  const modeOk=mapSource!=='loading'&&(!item.view||item.view===mapSource);
  const matches=!query||(item.name+' '+item.cat+' '+(descriptions[item.cat]||'')).toLowerCase().includes(query);
  item.button.hidden=!modeOk||hiddenCats.has(item.cat)||!matches;
  item.button.classList.toggle('j181-noted',visited.has(item.key));
 }
 for(const button of legend.querySelectorAll('.j180-legend-row')){
  const key=button.dataset.j181Cat;
  if(!key)continue;
  const intended=!hiddenCats.has(key);
  if(button.getAttribute('aria-pressed')!==String(intended))button.setAttribute('aria-pressed',String(intended));
 }
 focus.classList.toggle('j181-hide-chests',hiddenCats.has('chest'));
 const nativeChestLayer=focus.querySelector('.j180-chest-layer');
 if(nativeChestLayer)nativeChestLayer.style.pointerEvents=hiddenCats.has('chest')?'none':'';
}
records.forEach(([cat,x,y,name,poi,view],i)=>{
 const key=cat+'-'+i;
 const glyph=categories.find(c=>c[0]===cat)?.[2]||'●';
 const b=button(glyph,'j181-hotspot',()=>popup(name,descriptions[cat],allItems[i]));
 b.dataset.category=cat;b.dataset.markerId=key;b.style.left=x+'%';b.style.top=y+'%';
 b.setAttribute('aria-label',categories.find(c=>c[0]===cat)?.[1]+': '+name+' (approximate)');
 b.title=name+' · '+(view==='enhanced'?'enhanced visual reference':'click map symbol for details');
 const item={key,name,cat,poi,view,button:b};allItems.push(item);layer.append(b);
});
legend.replaceChildren();
for(const [cat,name,icon,description] of categories){
 const count=records.filter(x=>x[0]===cat).length;
 const b=button('','j180-legend-row j181-legend-row',()=>{
  if(hiddenCats.has(cat))hiddenCats.delete(cat);else hiddenCats.add(cat);
  update();
 });
 b.dataset.j181Cat=cat;b.dataset.cat=cat;b.setAttribute('aria-pressed','true');
 b.title='Toggle '+name.toLowerCase();
 const glyph=el('span','j180-glyph j181-glyph-'+cat,icon);
 const label=el('span','j180-legend-copy');label.append(el('strong','',name),el('small','',cat==='chest'?'19 possible · 2 daily':description+(count?' · '+count+' reference spots':'')));
 b.append(glyph,label);legend.append(b);
}
const nativeSearch=focus.querySelector('.j167-search');
nativeSearch?.addEventListener('input',update);
const monitor=new MutationObserver(update);
monitor.observe(focus,{attributes:true,attributeFilter:['data-map-source']});
const chestLayer=focus.querySelector('.j180-chest-layer');
if(chestLayer){
 // JS 18 replaces these nodes for each reset; observe to preserve the exact
 // daily highlighting state without recreating visible, generic chest dots.
 const chestMonitor=new MutationObserver(()=>{
  focus.classList.toggle('j181-no-daily-selection',!chestLayer.querySelector('.j180-chest-active'));
 });
 chestMonitor.observe(chestLayer,{childList:true});
}
const notice=document.querySelector('.j180-legend-foot');
if(notice)notice.textContent='Tap the Team Jura marker symbols on the map for details. Positions approximate and based on source/owner references; yellow means possible treasure chest, cyan means dated calculated or personal selection.';
const status=document.querySelector('.j180-map-status');
const updateSourceCaption=()=>{
 const source=focus.dataset.mapSource;
 if(source==='original'||source==='enhanced'){
  const modes=document.querySelectorAll('.j180-mode[data-mode]');
  modes.forEach(m=>{if(m.dataset.mode==='original'||m.dataset.mode==='enhanced')m.setAttribute('aria-pressed',String(m.dataset.mode===source));});
  const locallyTraced=focus.dataset.mapAsset==='local-trace';
  if(status)status.textContent=source==='original'?
   (locallyTraced?'Offline Elario Cayo road-map reconstruction based on the owner reference. Symbols clickable, positions approximate; not an in-game map export.':'GTA Wiki in-game island base map with original Team Jura clickable reference markers, approximate positions.'):
   'Original Elario enhanced concept map · illustrative marker positions and no verified travel routing.';
 }
};
updateSourceCaption();
new MutationObserver(updateSourceCaption).observe(focus,{attributes:true,attributeFilter:['data-map-source','data-map-asset']});
update();
window.teamJuraCayoHotspots={count:allItems.length,categories:categories.map(c=>c[0]),refresh:update,openMarker:key=>{const r=allItems.find(x=>x.key===key);r?.button.click();return !!r}};
})();