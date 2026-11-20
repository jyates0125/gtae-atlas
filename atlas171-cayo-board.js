/* Team Jura Atlas 17.1 — Cayo-only mission briefing.
   Source-informed categories, no exact coordinates, no changes to historic player saves. */
(()=>{'use strict';
if(document.body.dataset.heist!=='cayo-perico')return;
const focus=document.querySelector('#j167-heist-map');
if(!focus||document.querySelector('#j171-cayo-board'))return;
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const button=(label,cls,fn)=>{const e=el('button',cls,label);e.type='button';e.addEventListener('click',fn);return e;};
const groups={
'infiltration':{title:'Island infiltration',note:'Eight named approaches; availability depends on scoping and completed approach preps.',items:[
['Airstrip','Velum approach; northwest landing strip.','Airstrip'],['West Beach','Kosatka coastline approach.','West Beach'],['North Dock','Boat landing and potential exit area.','North Dock'],['Main Dock','Boat landing and potential exit area.','Main Dock'],['HALO Jump','Alkonost parachute insertion; no unique fixed ground pin.','HALO Jump'],['North Drop Zone','Annihilator Stealth parachute insertion.','North Drop Zone'],['South Drop Zone','Annihilator Stealth parachute insertion.','South Drop Zone'],['Drainage Tunnel','Kosatka underwater approach; scope tunnel and prepare Cutting Torch.','Drainage Tunnel']]},
'compound':{title:'Compound entrances',note:'Six entry choices are discoverable. The position of doors on our overview is illustrative, not a compound floor plan.',items:[
['Main Gate','Main entrance; check equipment requirements in the heist planning screen.','Compound Main Gate'],['North Gate','Entry requires the appropriate access method found during the finale.','Compound North Gate'],['South Gate','Entry requires the appropriate access method found during the finale.','Compound South Gate'],['North Wall','Grappling access after compatible equipment is found.','Compound North Wall'],['South Wall','Grappling access after compatible equipment is found.','Compound South Wall'],['Drainage Tunnel','Underwater route below the compound; Cutting Torch preparation.','Drainage Tunnel']]},
'escape':{title:'Escape choices',note:'Four planning-board exit choices. Your actual escape can change during the finale.',items:[
['Airstrip','Leave via the northern airstrip when the escape is available.','Airstrip'],['North Dock','Boat escape area on the island’s north side.','North Dock'],['Main Dock','Boat escape area nearer the south.','Main Dock'],['Kosatka','Submarine escape choice when using the Kosatka approach.','Kosatka Escape Area']]},
'intel':{title:'Scoping & loot',note:'Permanent landmarks are shown approximately. Loot, tools, guards and daily chests can change between runs; no false spawn pins.',items:[
['Communications / Control Tower','Use the communications tower to access security cameras; tower-related disruption objectives vary.','Control Tower'],['Power Station','Optional island power disruption; not a compound camera off-switch.','Power Station'],['Primary target','Review target through compound CCTV and confirm it for this attempt.','El Rubio Compound'],['Secondary loot','Check current locations and bag space; categories are not live loot spawns.','Secondary loot areas'],['Guards’ outfits & tools','Scope actual spawn locations during this run; plan disguises, bolt cutters and grappling equipment.','Equipment · scoping'],['Daily chests','Daily locations rotate; no currently active position is asserted.','']]},
};
const approaches={
'Kosatka':['West Beach','Drainage Tunnel'],'Longfin':['North Dock','Main Dock'],
'Velum':['Airstrip'],'RO-86 Alkonost':['HALO Jump'],
'Annihilator Stealth':['North Drop Zone','South Drop Zone'],
'Kurtz 31 Patrol Boat':['North Dock','Main Dock']
};
const storage='teamjura-cayo-mission-v1';
const defaults={approach:'Kosatka',infiltration:'Drainage Tunnel',compound:'Drainage Tunnel',escape:'Main Dock',target:'To be confirmed',crew:'1',notes:''};
let state={...defaults};
try{const stored=JSON.parse(localStorage.getItem(storage)||'null');if(stored&&typeof stored==='object')for(const key of Object.keys(defaults))if(typeof stored[key]==='string')state[key]=stored[key].slice(0,key==='notes'?500:80);}catch(_){}
const board=el('section','j171-board');board.id='j171-cayo-board';board.setAttribute('aria-labelledby','j171-title');
const headline=el('div','j171-heading');
const headText=el('div');headText.append(el('span','j171-kicker','ELARIO OPERATIONS / CAYO PERICO'),el('h3','','Scope. Prep. Infiltrate. Extract.'),el('p','','All mission planning in this one workspace. The island map and pins remain above the level of a verified georeferenced guide; use the game for exact positions and current targets.'));
headText.querySelector('h3').id='j171-title';
headline.append(headText,el('span','j171-version','CAYO · MISSION BOARD'));
board.append(headline);
const stats=el('div','j171-stats');
for(const [amount,name] of [['8','Infiltration'],['6','Compound entries'],['4','Escape choices'],['1–4','Players']]){
 const cell=el('div','j171-stat');cell.append(el('strong','',amount),el('span','',name));stats.append(cell);
}board.append(stats);
const boardGrid=el('div','j171-board-grid');
const intel=el('section','j171-group');intel.setAttribute('aria-label','Mission point categories');
const tabs=el('div','j171-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Cayo location categories');
const summary=el('p','j171-summary');const cards=el('div','j171-cards');cards.id='j171-cards';cards.setAttribute('role','tabpanel');cards.tabIndex=0;
const badge=el('span','j171-status','Approximate map pins · Source-informed mission names');
intel.append(tabs,summary,cards,badge);
const status=el('p','j171-feedback','Choose a location to highlight its named map pin.');status.setAttribute('role','status');status.setAttribute('aria-live','polite');intel.append(status);
let selectedGroup='infiltration';
function showPoint(term){
 if(!term){status.textContent='This is variable intel: confirm its location in your own current heist.';return;}
 const success=window.teamJuraHeistViews?.selectPOI(term);
 status.textContent=success?'Highlighted '+term+' on the main Cayo map.':'No matching active pin. Clear map search and enable its category, then try again.';
 if(success)focus.querySelector('.j167-viewport')?.scrollIntoView({block:'center',behavior:'smooth'});
}
function renderGroup(){
 const config=groups[selectedGroup];summary.textContent=config.note;cards.replaceChildren();
 for(const [name,desc,where] of config.items){
  const card=el('article','j171-card');card.append(el('strong','',name),el('p','',desc));
  const b=button(where?'Show on island map ↗':'Check in-game','j171-go',()=>showPoint(where));card.append(b);cards.append(card);
 }
 for(const tab of tabs.querySelectorAll('button')){const on=tab.dataset.group===selectedGroup;tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1;}
 cards.setAttribute('aria-label',config.title);
}
for(const [key,g] of Object.entries(groups)){
 const t=button(g.title,'j171-tab',()=>{selectedGroup=key;renderGroup()});t.dataset.group=key;t.setAttribute('role','tab');t.setAttribute('aria-controls','j171-cards');tabs.append(t);
}
tabs.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const keys=Object.keys(groups);let n=keys.indexOf(selectedGroup);n=e.key==='Home'?0:e.key==='End'?keys.length-1:(n+(e.key==='ArrowRight'?1:-1)+keys.length)%keys.length;selectedGroup=keys[n];renderGroup();tabs.querySelector('[aria-selected=true]')?.focus();});
renderGroup();
const planner=el('section','j171-planner');planner.setAttribute('aria-label','My Cayo finale plan');planner.append(el('h4','','Build my finale plan'),el('p','j171-muted','Personal selections save on this device only. They do not alter your GTA Online heist board.'));
const form=el('div','j171-form');
const fields=[
['approach','Approach vehicle',Object.keys(approaches)],
['infiltration','Island infiltration',groups.infiltration.items.map(x=>x[0])],
['compound','Compound entry',groups.compound.items.map(x=>x[0])],
['escape','Escape',groups.escape.items.map(x=>x[0])],
['target','Primary target',['To be confirmed','Madrazo Files (first run)','Sinsimito Tequila','Ruby Necklace','Bearer Bonds','Pink Diamond','Panther Statue (event only)']],
['crew','Crew size',['1','2','3','4']]
];
const controls={};
function persist(){try{localStorage.setItem(storage,JSON.stringify({schema:1,updatedAt:new Date().toISOString(),...state}));saveMsg.textContent='Saved on this device.'}catch(_){saveMsg.textContent='Local storage unavailable — export a copy of your plan.'}}
const saveMsg=el('span','j171-save','Personal planning only');
for(const [key,title,options] of fields){
 const label=el('label','j171-field');label.append(el('span','',title));
 const control=el('select');control.setAttribute('aria-label',title);
 for(const option of options){const o=el('option','',option);o.value=option;control.append(o)}
 control.value=options.includes(state[key])?state[key]:options[0];state[key]=control.value;
 control.addEventListener('change',()=>{state[key]=control.value;persist();renderCompatibility();});
 label.append(control);form.append(label);controls[key]=control;
}
const notes=el('label','j171-field j171-notes');notes.append(el('span','','Notes: targets, bags, equipment and route'));
const noteInput=el('textarea');noteInput.rows=3;noteInput.maxLength=500;noteInput.placeholder='Your own observations from this heist run';noteInput.value=state.notes;noteInput.addEventListener('input',()=>{state.notes=noteInput.value;persist()});notes.append(noteInput);form.append(notes);planner.append(form);
const compatibility=el('div','j171-compat');compatibility.setAttribute('role','status');
function renderCompatibility(){
 const suggestion=approaches[state.approach]||[];
 const good=suggestion.includes(state.infiltration);
 compatibility.textContent=good?'✓ '+state.approach+' is commonly paired with '+state.infiltration+'. Confirm completed preps before launch.':'Review combination: '+state.approach+' commonly uses '+suggestion.join(' or ')+'. Your selected '+state.infiltration+' may not appear on the finale board. Verify in-game.';
 if(state.compound==='Drainage Tunnel')compatibility.textContent+=' Cutting Torch prep is required for tunnel compound entry.';
}
planner.append(compatibility);
const routes=el('div','j171-routes');routes.append(el('strong','','Illustrative route templates'));
for(const [title,names,desc] of [
['Tunnel / stealth',['Drainage Tunnel','El Rubio Compound','Main Dock'],'Tunnel → objective → dock'],
['Dock / secondary loot',['North Dock','El Rubio Compound','Main Dock'],'Dock → objective → dock'],
['Airstrip approach',['Airstrip','El Rubio Compound','Airstrip'],'Airstrip → objective → exit']]){
 const b=button(title,'j171-route',()=>{const count=window.teamJuraCayoRoute?.setRoute(names);
  if(count){window.teamJuraHeistViews?.activate('original');status.textContent='Loaded '+title+' ('+count+' planning stops). Lines show chosen order, not traversable paths.';focus.querySelector('.j167-viewport')?.scrollIntoView({block:'center',behavior:'smooth'});}
  else status.textContent='Route controls are not available; use the map’s Add to route buttons.';
 });b.title=desc;routes.append(b);
}
planner.append(routes);
const actions=el('div','j171-actions');
const exportBtn=button('Export Cayo plan','j171-action',()=>{const data=JSON.stringify({schema:'teamjura-cayo-mission-v1',heist:'cayo-perico',positionQuality:'approximate',plan:state},null,2);const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const link=el('a');link.href=url;link.download='team-jura-cayo-plan.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);saveMsg.textContent='Plan exported.';});
const resetBtn=button('Reset selections','j171-action j171-reset',()=>{if(!confirm('Reset only the Cayo finale selections? Your map pins, main checklist and notes in other modules stay unchanged.'))return;state={...defaults};for(const [k,control] of Object.entries(controls))control.value=state[k];noteInput.value='';persist();renderCompatibility()});
actions.append(exportBtn,resetBtn);planner.append(actions,saveMsg);
const citations=el('p','j171-citations','Mission intel: ');
for(const [text,url] of [
 ['Rockstar','https://www.rockstargames.com/gta-online/heists/cayo-perico-heist'],
 ['GTABase','https://www.gtabase.com/gta-online/jobs/heists/the-cayo-perico-heist'],
 ['Sources & credits','./atlas-credits.html']
]){const a=el('a','',text);a.href=url;if(url.startsWith('http')){a.target='_blank';a.rel='noopener noreferrer'}citations.append(a)}
planner.append(citations);
boardGrid.append(intel,planner);board.append(boardGrid);
const nav=focus.querySelector('#j169-views');
if(nav)nav.insertAdjacentElement('afterend',board);else focus.querySelector('.j167-head')?.insertAdjacentElement('afterend',board);
renderCompatibility();
const heroCopy=document.querySelector('.hero p');
if(heroCopy)heroCopy.textContent='Cayo Perico mission command · interactive island pins, entry and exit intel, personal route planning, equipment notes and locally saved progress. Locations are approximate until verified against gameplay.';
window.teamJuraCayoBoard={version:'17.1',groupNames:Object.keys(groups),openGroup(key){if(groups[key]){selectedGroup=key;renderGroup();board.scrollIntoView({block:'start'})}}};
})();