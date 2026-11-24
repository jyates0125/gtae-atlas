/* Team Jura Atlas 16.9 — source-aware heist workspace views and original interactive pins.
 * No borrowed Rockstar/icon graphics, unlicensed basemap copies or invented coordinates.
 * Keeps existing 16.7/16.8 POIs, progress keys and cinematic heist art unchanged.
 */
(()=>{'use strict';
const id=String(document.body.dataset.heist||'');
const focus=document.getElementById('j167-heist-map');
if(!focus||!document.body.classList.contains('j120-heist-page')||document.getElementById('j169-views'))return;
const $=(sel,root=focus)=>root.querySelector(sel);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const div=()=>el('div');
const more=$('.j167-head'),toolbar=$('.j167-toolbar'),chips=$('.j167-chips'),viewport=$('.j167-viewport'),detail=$('.j167-detail'),panels=$('.j167-panels');
if(!more||!toolbar||!chips||!viewport||!detail||!panels)return;
const nav=el('div','j169-views');nav.id='j169-views';nav.setAttribute('role','group');nav.setAttribute('aria-label','Switch mission map and detail views');
const notice=el('p','j169-view-caption');
const available=[['enhanced','Enhanced map'],['objective',id==='diamond-casino'?'Vault & objectives':id==='cayo-perico'?'Compound & objectives':id==='kortz-center'?'Museum & objectives':'Objective details'],['route','Route planning']];
if(id==='cayo-perico')available.splice(0,0,['original','Game map + pins']);
const buttons=new Map();
const makeButton=(label,cls,cb)=>{const b=el('button',cls,label);b.type='button';b.addEventListener('click',cb);return b;};
let mode='enhanced';
for(const [key,title] of available){
 const b=makeButton(title,'j169-view',()=>activate(key));
 b.dataset.view=key;b.setAttribute('aria-pressed','false');
 buttons.set(key,b);nav.append(b);
}
more.insertAdjacentElement('afterend',nav);
nav.insertAdjacentElement('afterend',notice);
const objective=el('section','j169-objective j169-surface');
objective.id='j169-objective';objective.hidden=true;objective.setAttribute('aria-labelledby','j169-objective-title');
const objectiveHead=el('h3','j169-title',id==='diamond-casino'?'Vault contents & access planning':id==='cayo-perico'?'Compound & loot objectives':id==='kortz-center'?'Kortz galleries & objectives':'Site objectives & reconnaissance');
objectiveHead.id='j169-objective-title';
objective.append(objectiveHead);
const imageCaption=el('p','j169-small','Mission reference: these are source-described objectives on a conceptual map, not verified floor locations, vault contents, or fixed loot spawns.');
objective.append(imageCaption);
const objectiveGrid=el('div','j169-objective-grid');
const input=el('input','j169-objective-search');input.type='search';input.placeholder='Filter objective and entry references…';input.setAttribute('aria-label','Search mission objective references');
objective.append(input,objectiveGrid);
input.addEventListener('input',()=>renderObjectives());
const feature=el('div','j169-context');
feature.append(el('strong','','Original Team Jura mission-context artwork'));
const picture=el('img');picture.src='./art/jura159-heist-'+id+'.webp';picture.alt='Original cinematic Elario Studios context artwork for '+id.replace(/-/g,' ')+'; not a verified heist floor plan';picture.loading='lazy';picture.decoding='async';
feature.append(picture,el('p','','The cinematic image is context only. Select a labeled POI below to inspect an actual named mission reference and return to its conceptual pin. Use the live game for exact interior geometry.'));
objective.append(feature);
viewport.insertAdjacentElement('afterend',objective);
const original=el('section','j169-original j169-surface');original.id='j169-original';original.hidden=true;
original.append(el('h3','j169-title','Cayo original game-island explorer'));
original.append(el('p','j169-small','Use the primary interactive Cayo island workspace above, with source-labeled approximate positions and daily chest filters.'));
const controls=el('div','j169-controls');
const load=makeButton('Load island explorer','j169-load',()=>{const expanded=!originalFrame.hidden;if(!expanded){
 document.getElementById('j180-shell')?.scrollIntoView({block:'start',behavior:'smooth'});return;
}else{
 originalFrame.removeAttribute('src');originalFrame.hidden=true;load.textContent='Load island explorer';load.setAttribute('aria-expanded','false');
}});
load.setAttribute('aria-expanded','false');load.setAttribute('aria-controls','j169-cayo-frame');
const open=el('a','j169-open','Open original island explorer full screen ↗');open.href='#j180-shell';
controls.append(load,open);original.append(controls);
const originalFrame=el('iframe','j169-frame');originalFrame.id='j169-cayo-frame';originalFrame.title='Cayo Perico original map and separate schematic scoping explorer';originalFrame.loading='lazy';originalFrame.referrerPolicy='same-origin';originalFrame.hidden=true;
original.append(originalFrame);
objective.insertAdjacentElement('afterend',original);
const routeHelp=el('div','j169-route-help');
routeHelp.hidden=true;routeHelp.append(el('strong','','Route planning view'));
routeHelp.append(el('p','','Choose POIs, add them to My planning route below, then follow the dashed line in your selected order. This is a PERSONAL planning sequence on illustrative pins, not a driveable, walkable or in-game-verified route.'));
original.insertAdjacentElement('afterend',routeHelp);
const primary=[toolbar,chips,viewport,detail,panels];
const display=(node,on)=>{node.classList.toggle('j169-hidden',!on);node.setAttribute('aria-hidden',String(!on));};
function activate(next){
 if(!buttons.has(next))next='enhanced';
 mode=next;const mapMode=next==='enhanced'||next==='route'||next==='original';
 if(id==='cayo-perico')window.teamJuraHeistBaseMap?.setSource(next==='original'?'original':'enhanced');
 for(const [key,b] of buttons)b.setAttribute('aria-pressed',String(key===mode));
 primary.forEach(n=>display(n,mapMode));
 objective.hidden=next!=='objective';
 original.hidden=true; // no second map window: the game map is inside the single interactive viewport
 routeHelp.hidden=next!=='route';
 if(next==='objective'){renderObjectives();notice.textContent='Objective and interior references · one-tap return to map POIs. Images are concepts, not exact floor plans.';}
 else if(next==='original'){notice.textContent='Cayo in-game island map with Team Jura pins, search, layer toggles, zoom and routes together. Static POI positions are approximate; rotating loot has no invented fixed pin.';}
 else if(next==='route'){notice.textContent=(id==='cayo-perico'?'Enhanced route planner · select pins and use the Cayo route list below.':'Enhanced route planner · choose your start, move stops, reverse or sort by schematic distance using the route list below.');}
 else notice.textContent='Original Elario enhanced overhead art · interactive category pins · schematic positions.';
 focus.dataset.j169View=mode;
}
function selectPOI(term){
 activate(id==='cayo-perico'?'original':'enhanced');const query=$('.j167-search');
 if(!query)return false;
 const termLower=String(term||'').toLowerCase().trim();
 if(!termLower)return false;
 const current=$$('.j167-item');
 let rows=current.filter(row=>row.textContent.toLowerCase().includes(termLower));
 if(!rows.length){
  query.value=term;query.dispatchEvent(new Event('input',{bubbles:true}));
  rows=$$('.j167-item');
 }
 if(!rows.length){query.value='';query.dispatchEvent(new Event('input',{bubbles:true}));rows=$$('.j167-item').filter(row=>row.textContent.toLowerCase().includes(termLower));}
 if(rows.length){rows[0].click();return true;}
 return false;
}
function $$(sel,root=focus){return Array.from(root.querySelectorAll(sel));}
function renderObjectives(){
 objectiveGrid.replaceChildren();
 const items=$$('.j167-items .j167-item');
 const keyword=input.value.toLowerCase().trim();
 let count=0;
 for(const sourceRow of items){
  const name=sourceRow.childNodes[0]?.textContent?.trim()||sourceRow.textContent.trim();
  const tag=sourceRow.querySelector('small')?.textContent||'Mission POI';
  if(keyword&&!(name+' '+tag).toLowerCase().includes(keyword))continue;
  const card=makeButton('','j169-objective-card',()=>{selectPOI(name);viewport.scrollIntoView({block:'start',behavior:'smooth'});});
  card.append(el('span','j169-obj-glyph',tag.includes('Entry')?'↪':tag.includes('Loot')?'◇':tag.includes('Escape')?'↗':tag.includes('Intel')?'⌕':'◆'),el('strong','',name),el('small','',tag),el('span','j169-show','Highlight on map ↗'));
  objectiveGrid.append(card);count++;
 }
 if(!count)objectiveGrid.append(el('p','j169-small',keyword?'No matching visible points. Clear the filter or re-enable POI categories on Enhanced map.':'No visible POIs; switch to Enhanced map to enable categories.'));
}
document.addEventListener('click',e=>{
 const guide=e.target.closest('#j168-heist-guide .j168-map');
 if(!guide)return;
 // Use the existing guide's source-informed POI search after returning to map.
 activate(id==='cayo-perico'?'original':'enhanced');
 // Guide handler fills search on click; select its matching result immediately after.
 queueMicrotask(()=>{
  const term=$('.j167-search')?.value||'';
  if(term)selectPOI(term);
 });
},true);
const oldLink=$('.j167-island-note a');
if(oldLink&&id==='cayo-perico'){const sourceBtn=makeButton('Open original island view here','j169-open-view',()=>{activate('original');viewport.scrollIntoView({block:'start',behavior:'smooth'})});oldLink.replaceWith(sourceBtn)}
// Use original custom HTML/CSS pin geometry; no copied Rockstar or third-party marker artwork.
// Existing .j167-pin classes retain color, selectability and saved-point IDs.
activate(id==='cayo-perico'?'original':'enhanced');
window.teamJuraHeistViews={activate,selectPOI}; // Non-destructive API for linked prep cards.
})();
