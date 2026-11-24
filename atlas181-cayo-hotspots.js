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
/* Original Team Jura symbol family — a SINGLE source of truth for both
   the legend and clickable map locations. Symbols are SVG, not emoji-font
   stand-ins or generic dark pin badges. */
const SVG_NS='http://www.w3.org/2000/svg';
const svg=(tag,attrs={})=>{const e=document.createElementNS(SVG_NS,tag);for(const [key,val] of Object.entries(attrs))e.setAttribute(key,String(val));return e};
const markerIcons={
 entry:[['path',{d:'M12 22S4.7 14.6 4.7 9a7.3 7.3 0 0 1 14.6 0C19.3 14.6 12 22 12 22Z',fill:'currentColor',stroke:'currentColor'}],['circle',{cx:12,cy:9,r:3,fill:'#191127',stroke:'#fff5cf','stroke-width':1.3}]],
 exit:[['path',{d:'M12 2 23 22H1L12 2Z',fill:'currentColor',stroke:'#f5ffc6','stroke-width':.7}]],
 drainage:[['circle',{cx:12,cy:12,r:10,fill:'#181824',stroke:'currentColor','stroke-width':2}],['path',{d:'M7 3v18M12 2v20M17 3v18M3 7h18M2 12h20M3 17h18',stroke:'currentColor','stroke-width':1.2,fill:'none'}]],
 secondary:[['circle',{cx:12,cy:12,r:8.2,fill:'currentColor',stroke:'#f2ffff','stroke-width':1}]],
 gated:[['circle',{cx:12,cy:12,r:8.9,fill:'none',stroke:'currentColor','stroke-width':2.6}],['circle',{cx:12,cy:12,r:4.7,fill:'currentColor',stroke:'#142137','stroke-width':1.2}]],
 bolts:[['path',{d:'M7 3 16 18M17 3 8 18M5 3l7 10M19 3l-7 10',fill:'none',stroke:'currentColor','stroke-width':2.5,'stroke-linecap':'round'}],['circle',{cx:7,cy:19,r:3,fill:'none',stroke:'currentColor','stroke-width':1.8}],['circle',{cx:17,cy:19,r:3,fill:'none',stroke:'currentColor','stroke-width':1.8}]],
 grapple:[['path',{d:'M3 19 14 7c3-3 8-2 8 2 0 3-3 5-5 3-2-2-1-5 2-5M9 12l5 5M13 18l-3 3',fill:'none',stroke:'currentColor','stroke-width':2.5,'stroke-linecap':'round','stroke-linejoin':'round'}]],
 clothes:[['path',{d:'m7 3 5 2 5-2 5 5-4 4-2-2v11H8V10l-2 2-4-4 5-5Z',fill:'currentColor',stroke:'#26192f','stroke-width':1}]],
 truck:[['rect',{x:2,y:6,width:14,height:12,rx:2,fill:'currentColor'}],['path',{d:'M16 9h4l2 4v5h-6V9Z',fill:'currentColor'}],['circle',{cx:7,cy:19,r:2,fill:'#182433',stroke:'currentColor','stroke-width':1.2}],['circle',{cx:19,cy:19,r:2,fill:'#182433',stroke:'currentColor','stroke-width':1.2}]],
 control:[['path',{d:'M12 7 8 22h8L12 7Zm0 0v-4M9 13h6M8 18h8M5 7c-2 2-2 7 0 9M19 7c2 2 2 7 0 9M2 5c-3 4-3 9 0 13M22 5c3 4 3 9 0 13',fill:'none',stroke:'currentColor','stroke-width':1.7,'stroke-linecap':'round'}]],
 power:[['path',{d:'m14 1-9 13h7l-2 9 10-14h-7l1-8Z',fill:'currentColor',stroke:'#18202b','stroke-width':.9}]],
 powder:[['path',{d:'M6 3h12l2 18H4L6 3Z',fill:'currentColor',stroke:'#f0d5aa','stroke-width':1.2}],['path',{d:'M7 9h10M8 13h8',fill:'none',stroke:'#312138','stroke-width':1.5}]],
 water:[['path',{d:'M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z',fill:'currentColor',stroke:'#ceffff','stroke-width':1}],['path',{d:'M8 16c0 2 1 3 3 3',fill:'none',stroke:'#0e5872','stroke-width':1.5,'stroke-linecap':'round'}]],
 chest:[['circle',{cx:12,cy:12,r:6,fill:'currentColor',stroke:'#202025','stroke-width':1.2}]]
};
const makeMarkerIcon=cat=>{
 const image=svg('svg',{viewBox:'0 0 24 24',width:22,height:22,'aria-hidden':'true',focusable:'false',class:'j183-svg'});
 for(const [tag,attrs] of markerIcons[cat]||markerIcons.secondary)image.append(svg(tag,attrs));
 return image;
};
const button=(label,cls,handler)=>{const e=el('button',cls,label);e.type='button';e.addEventListener('click',handler);return e};
const categories=[
 ['entry','Infiltration points','📍','Possible island approach locations'],
 ['exit','Exit points','▲','Possible finale escape locations'],
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
  // All reference categories are available on the flat game map and its
  // local fallback. Map pixel positions are visually approximate in both.
  // The offline road-map trace is visible during source-image loading. Preserve
  // its clickable markers instead of leaving the island blank for offline users.
  const modeOk=mapSource!=='loading'||focus.dataset.mapAsset==='local-trace';
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
 const b=button('','j181-hotspot',()=>popup(name,descriptions[cat],allItems[i]));
 b.append(makeMarkerIcon(cat));
 b.dataset.category=cat;b.dataset.markerId=key;b.style.left=x+'%';b.style.top=y+'%';b.dataset.glyph=categories.find(c=>c[0]===cat)?.[2]||'•';
 b.setAttribute('aria-label',categories.find(c=>c[0]===cat)?.[1]+': '+name+' (approximate)');
 b.title=name+' · select this colorful map symbol for details';
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
 const glyph=el('span','j180-glyph j181-glyph-'+cat);glyph.append(makeMarkerIcon(cat));
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
 const syncChestLegend=()=>{
  const current=chestLayer.querySelectorAll('.j180-chest-active').length===2;
  focus.classList.toggle('j181-no-daily-selection',!current);
  const row=legend.querySelector('[data-j181-cat="chest"] .j180-legend-copy small');
  if(row)row.textContent=current?'2 active (cyan) · 17 unavailable today':'19 possible · current pair unconfirmed';
 };
 const chestMonitor=new MutationObserver(syncChestLegend);syncChestLegend();
 chestMonitor.observe(chestLayer,{childList:true});
}
const notice=document.querySelector('.j180-legend-foot');
if(notice)notice.textContent='Colorful icons share the exact same categories as the legend. Tap a symbol for its details; tap its legend row to show or hide that category. Positions approximate. Cyan chests are today’s dated/player-selected pair; yellow locations are reference-only when the current pair is unavailable or All 19 is selected.';
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
// Apply one authoritative category selection to actual hotspot visibility.
// aria-pressed is a presentation attribute, not the internal filter state.
function setVisibleCategories(values){
 if(!Array.isArray(values))return false;
 const known=new Set(categories.map(item=>item[0]));
 const selected=new Set(values.filter(x=>known.has(x)));
 for(const cat of known){
  if(selected.has(cat))hiddenCats.delete(cat);
  else hiddenCats.add(cat);
 }
 update();
 return true;
}
window.teamJuraCayoHotspots={count:allItems.length,categories:categories.map(c=>c[0]),refresh:update,setVisibleCategories,openMarker:key=>{const r=allItems.find(x=>x.key===key);r?.button.click();return !!r}};
})();