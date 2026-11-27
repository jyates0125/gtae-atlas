/* Atlas 18.0 — owner-approved Cayo flagship shell and dated chest overlay.
   Mission layout/overlay are original Elario UI; map artwork retains its cited game source.
   Coordinates from published references are projected APPROXIMATELY until calibrated.
   Guest keys from the 16.x/17.x planner are never rewritten. */
(()=>{'use strict';
if(document.body.dataset.heist!=='cayo-perico'||document.getElementById('j180-shell'))return;
const main=document.querySelector('main.wrap'),layout=main?.querySelector('.layout');
const focus=document.getElementById('j167-heist-map'),board=document.getElementById('j171-cayo-board');
if(!main||!layout||!focus||!board)return;
document.body.classList.add('j180-cayo');
const el=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=String(content);return n};
const btn=(label,cls,fn)=>{const b=el('button',cls,label);b.type='button';if(fn)b.addEventListener('click',fn);return b};
const shell=el('section','j180-shell');shell.id='j180-shell';shell.setAttribute('aria-label','Cayo Perico interactive heist map and planning workspace');
const rail=el('aside','j180-rail'),mapStage=el('section','j180-stage');
const hero=el('div','j180-hero');
hero.append(el('span','j180-breadcrumb','ISLAND / GTA ONLINE / THE CAYO PERICO HEIST'),el('h1','','The Cayo Perico Heist'),el('p','','Mission command · explore island markers, entry and exit points, equipment references and personal routes. Position estimates are research references, not verified pixel coordinates.'),el('span','j180-hero-tag','GTA ONLINE · HEIST PLANNING'));
rail.append(hero);
const overview=el('div','j180-overview');
overview.append(el('h2','','!  Mission overview'),el('p','','Plan your approach, scope points of interest, check variable equipment, collect daily chests and arrange your exit before the finale.'));
rail.append(overview);
const sections=el('nav','j180-menu');sections.setAttribute('aria-label','Cayo Perico heist tools');rail.append(sections);
const mapHeader=el('div','j180-map-header');
const mapName=el('div');mapName.append(el('span','j180-map-eyebrow','ELARIO STUDIOS · SINGLE ISLAND WORKSPACE'),el('h2','','Cayo Perico · Live Planning Map'));mapHeader.append(mapName);
const modes=el('div','j180-modes');
function activate(mode){
 window.teamJuraHeistViews?.activate(mode);
 modes.querySelectorAll('button[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 if(mode==='original'||mode==='enhanced')mapStatus.textContent=(mode==='original'?'Game-map island silhouette with approximate interactive mission pins.':'Original Elario enhanced map concept; game-space positions have not been calibrated.');
}
for(const [key,title] of [['original','Game map'],['enhanced','Enhanced'],['objective','Objectives'],['route','Route']]){
 const b=btn(title,'j180-mode',()=>activate(key));b.dataset.mode=key;b.setAttribute('aria-pressed',String(key==='original'));modes.append(b);
}
mapHeader.append(modes);mapStage.append(mapHeader);
const mapFrame=el('div','j180-map-frame');
const legend=el('div','j180-legend'),mapArea=el('div','j180-map-area');
legend.append(el('h3','','⌖ Map legend'),el('p','j180-legend-intro','Select a category to show or hide its mission markers. Variable spawn points are references, not current-run guarantees.'));
const legendRows=el('div','j180-legend-rows');legend.append(legendRows);
// Independent stash toggle survives the original 14-category hotspot renderer.
let stashShown=true,stashAll=true;
function stashIcon(){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('width','24');svg.setAttribute('height','24');
 const ring=document.createElementNS(svg.namespaceURI,'circle');ring.setAttribute('cx','12');ring.setAttribute('cy','12');ring.setAttribute('r','9');ring.setAttribute('fill','none');ring.setAttribute('stroke','currentColor');ring.setAttribute('stroke-width','2');ring.setAttribute('stroke-dasharray','3 2');svg.append(ring);
 const cross=document.createElementNS(svg.namespaceURI,'path');cross.setAttribute('d','M8 12h8M12 8v8');cross.setAttribute('stroke','currentColor');cross.setAttribute('stroke-width','2');svg.append(cross);return svg;
}
const stashToggle=btn('','j4740-stash-toggle',()=>{stashShown=!stashShown;paintStashes()});
stashToggle.setAttribute('aria-label','Toggle buried stash search areas');stashToggle.setAttribute('aria-pressed','true');
stashToggle.append(stashIcon(),el('span','','Buried stash search areas'));legend.append(stashToggle);
const legendEntries=[
['Infiltration point','📍','entry','Access and landing areas'],['Exit point','▲','exit','Finale extraction choices'],
['Drainage tunnel','⊞','entry','Underwater compound approach'],['Secondary target','●','loot','Possible loot locations; verify in-game'],
['Gated target','◉','ref-loot','Possible gated secondary loot'],['Bolt cutters','✂','ref-bolts','Possible equipment spawn zones'],
['Grappling equipment','⌁','ref-grapple','Possible grappling equipment'],['Guard clothing','♙','ref-clothes','Possible disguise spawn zones'],
['Supply truck','▣','ref-truck','Scopable supply vehicle'],['Control tower','⌁','intel','Island tower and air defenses'],
['Power station','ϟ','intel','Power disruption reference'],['Cutting powder','▤','ref-powder','Optional water sabotage equipment'],
['Water tower','♧','ref-water','Island water-system reference'],['Treasure chests','●','chest','19 possible · one land and one underwater daily']];
const categoryDefaults={'entry':true,'exit':true,'loot':true,'intel':true,'ref-loot':true,'ref-bolts':true,'ref-grapple':true,'ref-clothes':true,'ref-truck':true,'ref-powder':true,'ref-water':true,'chest':true};
const disabled=new Set();
function repaintLegend(){
 for(const b of legendRows.querySelectorAll('button:not([data-j181-cat])'))b.setAttribute('aria-pressed',String(!disabled.has(b.dataset.cat)));
 for(const b of refLayer.querySelectorAll('.j180-refpin'))b.hidden=disabled.has(b.dataset.cat)||focus.dataset.mapSource!=='original';
 for(const b of chestLayer.querySelectorAll('.j180-chest'))b.hidden=disabled.has('chest')||focus.dataset.mapSource!=='original'||(todayOnly&&Boolean(activeIds.length)&&!activeIds.includes(+b.dataset.chest));
}
legendEntries.forEach(([name,icon,key,description],index)=>{
 const b=btn('','j180-legend-row',()=>{
   const was=disabled.has(key);
   if(was)disabled.delete(key);else disabled.add(key);
   const native=focus.querySelector('.j167-chip[data-cat="'+key+'"]');
   if(native && native.getAttribute('aria-pressed')!==String(was))native.click();
   repaintLegend();
 });
 b.dataset.cat=key;b.setAttribute('aria-pressed','true');
 const glyph=el('span','j180-glyph '+(key==='chest'?'j180-glyph-chest':'j180-glyph-'+key),icon);
 const copy=el('span','j180-legend-copy');copy.append(el('strong','',name),el('small','',description));b.append(glyph,copy);legendRows.append(b);
});
const legendFoot=el('p','j180-legend-foot','Markers based on Cayo gameplay references. Variable loot/equipment and route lines are not confirmed active spawns.');
legend.append(legendFoot);mapFrame.append(legend);
const overlayTools=el('div','j180-overlay-tools');
const info=el('div','j180-pin-info');info.hidden=true;info.setAttribute('role','status');info.setAttribute('aria-live','polite');
const mapStatus=el('p','j180-map-status','Game-map island silhouette with approximate interactive mission pins.');
const miniBar=el('div','j180-map-controls');
const fit=btn('Fit','j180-tool',()=>focus.querySelectorAll('.j167-zoom button')[2]?.click());
const plus=btn('+','j180-tool',()=>focus.querySelectorAll('.j167-zoom button')[1]?.click());
const minus=btn('−','j180-tool',()=>focus.querySelectorAll('.j167-zoom button')[0]?.click());
const layers=btn('☷','j180-tool',()=>{legend.classList.toggle('j180-legend-closed');layers.setAttribute('aria-pressed',String(legend.classList.contains('j180-legend-closed')));});
layers.setAttribute('aria-label','Toggle map legend');layers.setAttribute('aria-pressed','false');
const full=btn('⛶','j180-tool',()=>{
 if(document.fullscreenElement){document.exitFullscreen?.();return;}
 if(mapFrame.requestFullscreen){const p=mapFrame.requestFullscreen();p?.catch?.(()=>mapFrame.classList.toggle('j180-expanded')); }
 else mapFrame.classList.toggle('j180-expanded');
});
full.setAttribute('aria-label','Expand map');
miniBar.append(plus,minus,fit,layers,full);
mapArea.append(miniBar,overlayTools,focus,info,mapStatus);
mapFrame.append(mapArea);mapStage.append(mapFrame);
const bottom=el('div','j180-bottom');
const daily=el('section','j180-daily');daily.setAttribute('aria-label','Cayo treasure-chest daily locations');
const dailyHead=el('div','j180-daily-head');
const dailyCopy=el('div');
dailyCopy.append(el('h3','','Daily treasure chests'),el('p','','One land, one underwater · 19 possible locations · daily reset 06:00 UTC'));
dailyHead.append(dailyCopy);
const dailyButtons=el('div','j180-daily-buttons');
const allBtn=btn('All 19 possible','j180-action',()=>{preference='all';todayOnly=false;allBtn.setAttribute('aria-pressed','true');todayBtn.setAttribute('aria-pressed','false');repaintLegend();renderDaily();});
const todayBtn=btn('Today’s two','j180-action',()=>{if(!activeIds.length){todayOnly=false;renderDaily();return;}preference='today';todayOnly=true;allBtn.setAttribute('aria-pressed','false');todayBtn.setAttribute('aria-pressed','true');repaintLegend();renderDaily();});
allBtn.setAttribute('aria-pressed','true');todayBtn.setAttribute('aria-pressed','false');
const checkLink=el('a','j180-action','Check current daily ↗');checkLink.href='https://gtamap.io/gta-online/daily/treasure-chests/';checkLink.target='_blank';checkLink.rel='noopener noreferrer';
dailyButtons.append(allBtn,todayBtn,checkLink);dailyHead.append(dailyButtons);daily.append(dailyHead);
const dailyStatus=el('p','j180-daily-status','Loading chest reference data…');dailyStatus.setAttribute('role','status');dailyStatus.setAttribute('aria-live','polite');daily.append(dailyStatus);
const dailyList=el('div','j180-chest-list');daily.append(dailyList);
const details=el('details','j180-manual');const summary=el('summary','','Set today’s two from a current source or your gameplay');details.append(summary);
details.append(el('p','','This is a personal override, NOT an officially verified live feed. Numbers clear automatically at the next 06:00 UTC reset.'));
const manual=el('div','j180-manual-inputs');
const landLabel=el('label','','Land chest (1–10)'),landSel=el('select');landSel.setAttribute('aria-label','Land chest number');
const waterLabel=el('label','','Underwater chest (11–19)'),waterSel=el('select');waterSel.setAttribute('aria-label','Underwater chest number');
for(let n=1;n<=10;n++){const opt=el('option','',n);opt.value=String(n);landSel.append(opt)}
for(let n=11;n<=19;n++){const opt=el('option','',n);opt.value=String(n);waterSel.append(opt)}
landLabel.append(landSel);waterLabel.append(waterSel);
manual.append(landLabel,waterLabel);
const apply=btn('Highlight my two','j180-action',()=>{const now=new Date();const key=dayKey(now);personal={day:key,land:+landSel.value,underwater:+waterSel.value};try{localStorage.setItem('teamjura-cayo-daily-choice-v1',JSON.stringify(personal))}catch(_){ } updateActive();});
const clear=btn('Clear my picks','j180-action',()=>{personal=null;try{localStorage.removeItem('teamjura-cayo-daily-choice-v1')}catch(_){}updateActive()});
manual.append(apply,clear);details.append(manual);daily.append(details);bottom.append(daily);
const stashPanel=el('section','j180-daily j4740-stash-panel');stashPanel.id='j4740-stashes';stashPanel.setAttribute('aria-label','Daily Cayo buried stash search areas');
stashPanel.append(el('h3','','Daily buried stashes'),el('p','','Find the Metal Detector first. Visit Cayo during Gather Intel; these are approximate search areas, not exact dig points. Two daily selections reset at 06:00 UTC.'));
const stashStatus=el('p','j4740-stash-status','Waiting for reviewed island data…');stashStatus.setAttribute('role','status');
const stashList=el('div','j180-chest-list');
const stashMode=btn('Show today’s selections','j180-action',()=>{stashAll=!stashAll;paintStashes()});stashMode.setAttribute('aria-pressed','true');
const stashSource=el('a','j180-action','Source map ↗');stashSource.href='https://gtamap.io/gta-online/daily/buried-stashes/';stashSource.target='_blank';stashSource.rel='noopener noreferrer';
stashPanel.append(stashStatus,stashMode,stashSource,stashList);bottom.append(stashPanel);
const drawer=el('section','j180-drawer');drawer.id='j180-drawer';drawer.hidden=true;drawer.setAttribute('aria-label','Selected Cayo mission tools');
const drawerHead=el('div','j180-drawer-head');const drawerTitle=el('h2','','Mission tools');
const close=btn('Close ×','j180-action',()=>{drawer.hidden=true;shell.scrollIntoView({block:'start',behavior:'smooth'});});
drawerHead.append(drawerTitle,close);drawer.append(drawerHead);
const panes=el('div','j180-drawer-content');drawer.append(panes);
main.insertBefore(shell,layout);shell.append(rail,mapStage);main.insertBefore(bottom,layout);main.insertBefore(drawer,layout);
// The content notice can mount before or after the dynamic mission renderer.
 // Keep the advisory accessible below the Cayo map in both timing orders.
 const relocateAdvisory=()=>{
  const notice=document.getElementById('j153-advisory');
  if(!notice)return false;
  notice.classList.add('j180-advisory-bottom');
  main.append(notice);
  return true;
 };
 if(!relocateAdvisory()){
  const advisoryWatch=new MutationObserver(()=>{if(relocateAdvisory())advisoryWatch.disconnect()});
  advisoryWatch.observe(main,{childList:true});
 }

const originalChecklist=layout.querySelector('aside.panel:not(.detail)'),sourcePanel=layout.querySelector('aside.panel.detail');
const notes=document.querySelector('.j164-notes');
const sectionsByName=new Map();
if(originalChecklist){originalChecklist.classList.add('j180-tool-pane');panes.append(originalChecklist);sectionsByName.set('checklist',originalChecklist)}
board.classList.add('j180-tool-pane');panes.append(board);sectionsByName.set('board',board);
if(notes){notes.classList.add('j180-tool-pane');panes.append(notes);sectionsByName.set('notes',notes)}
if(sourcePanel){sourcePanel.classList.add('j180-tool-pane');panes.append(sourcePanel);sectionsByName.set('sources',sourcePanel)}
function openTool(kind,group){
 drawer.hidden=false;panes.querySelectorAll('.j180-tool-pane').forEach(p=>p.hidden=true);
 const target=sectionsByName.get(kind==='intel'||kind==='entry'||kind==='gear'||kind==='vehicles'?'board':kind);
 if(target){target.hidden=false;if(group)window.teamJuraCayoBoard?.openGroup?.(group);}
 const titles={checklist:'Mission checklist',intel:'Intel & target locations',entry:'Entry & exit planning',gear:'Equipment & tools',vehicles:'Vehicles & logistics',notes:'Notes & strategy',sources:'Mission source references'};
 drawerTitle.textContent=titles[kind]||'Cayo planning';drawer.scrollIntoView({block:'start',behavior:'smooth'});
}
for(const [kind,symbol,title,group] of [
 ['checklist','☑','Mission checklist'],['intel','⌖','Intel & target locations','intel'],
 ['entry','♧','Entry & exit planning','infiltration'],['gear','◈','Equipment & tools','intel'],
 ['vehicles','▣','Vehicles & logistics','infiltration'],['notes','ⓘ','Notes & strategy']
]){
 const b=btn('','j180-menu-link',()=>openTool(kind,group));
 b.append(el('span','j180-menu-symbol',symbol),el('span','',title),el('span','j180-menu-arrow','›'));sections.append(b);
}
const optionalInfo=btn('Sources & credits','j180-sources',()=>openTool('sources'));rail.append(optionalInfo);
const refLayer=el('div','j180-ref-layer'),chestLayer=el('div','j180-chest-layer');
const stashLayer=el('div','j4740-stash-layer');
const world=focus.querySelector('.j167-world');if(world)world.append(refLayer,chestLayer,stashLayer);
const equipmentRef=[
 ['ref-loot','possible gated loot',37,16,'◉'],['ref-loot','possible secondary loot',44,18,'●'],
 ['ref-loot','possible secondary loot',67,47,'●'],['ref-loot','possible gated loot',70,51,'◉'],
 ['ref-loot','possible secondary loot',79,29,'●'],['ref-loot','possible secondary loot',51,88,'●'],
 ['ref-bolts','bolt cutters area',39,29,'✂'],['ref-bolts','bolt cutters area',65,51,'✂'],['ref-bolts','bolt cutters area',90,55,'✂'],
 ['ref-grapple','grappling spawn area',14,27,'⌁'],['ref-grapple','grappling spawn area',41,26,'⌁'],
 ['ref-grapple','grappling spawn area',63,22,'⌁'],['ref-grapple','grappling spawn area',76,53,'⌁'],
 ['ref-grapple','grappling spawn area',93,68,'⌁'],['ref-grapple','grappling spawn area',85,83,'⌁'],
 ['ref-clothes','guard clothing area',40,18,'♙'],['ref-clothes','guard clothing area',63,42,'♙'],
 ['ref-clothes','guard clothing area',66,55,'♙'],['ref-clothes','guard clothing area',81,43,'♙'],
 ['ref-clothes','guard clothing area',74,64,'♙'],['ref-truck','supply truck area',44,19,'▣'],
 ['ref-truck','supply truck area',65,49,'▣'],['ref-truck','supply truck area',85,75,'▣'],
 ['ref-powder','cutting powder reference',54,57,'▤'],['ref-water','water tower reference',80,33,'♧']
];
for(const [category,name,x,y,symbol] of equipmentRef){
 const p=btn(symbol,'j180-refpin',()=>showInfo(name,'Screenshot-referenced possible equipment/loot area. This is NOT a verified active spawn or exact coordinate. Use the game’s current Gather Intel results.'));
 p.dataset.cat=category;p.style.left=x+'%';p.style.top=y+'%';p.title=name+' · illustrative reference';p.setAttribute('aria-label',name+' (approximate)');refLayer.append(p);
}
let preference='all'; // All possible locations by default; Today is an explicit choice.
let chestData=null,dailyData=null,bundledDaily=null,reviewedDaily={schema:1,rotations:{}},dailyPending=false,activeIds=[],todayOnly=false,personal=null,activeLabel='';
try{const p=JSON.parse(localStorage.getItem('teamjura-cayo-daily-choice-v1')||'null');if(p&&typeof p==='object')personal=p;}catch(_){}
function dayKey(d){return new Date(d.getTime()-6*3600*1000).toISOString().slice(0,10)}
function showInfo(title,description,number){
 info.hidden=false;info.replaceChildren(el('strong','',title),el('p','',description));
 if(number){info.append(el('span','', 'Chest '+number+' · Location is projected onto the island image approximately.'));}
 const c=btn('×','j180-info-close',()=>{info.hidden=true});c.setAttribute('aria-label','Close marker details');info.prepend(c);
}
function project(spawn){
 // The screenshot underlay has no verified pixel transform; avoid pretending this is georeferenced.
 // Re-registered against the 19 yellow centers on the user's 1284×1262
 // in-game reference. GTA world coordinates are SOURCE data; the
 // raster-to-world conversion remains approximate (no perspective proof).
 const x=Math.max(2,Math.min(98, (68+(spawn.worldX-3900)*.698)/1284*100));
 const y=Math.max(2,Math.min(98, (38+(-4293-spawn.worldY)*.69)/1262*100));
 return [x,y];
}
function paintStashes(){
 const C=window.JuraConditions,now=Date.now(),rows=C?.safeCayoStashCatalog?.(reviewedDaily.islandCatalog)||[],feed=C?.rotationFeed(reviewedDaily,'cayo-stashes',now),active=feed?.active||new Set();
 stashToggle.setAttribute('aria-pressed',String(stashShown));
 stashMode.setAttribute('aria-pressed',String(stashAll));stashMode.textContent=stashAll?'Show today’s selections':'Show all known search areas';stashMode.disabled=!feed;
 stashStatus.textContent=feed?'2 current source-reported search areas highlighted in gold; other known areas dimmed and not active. Not gameplay verified.':'No current dated stash selection. Known areas are reference only; no active pins.';
 stashLayer.hidden=!stashShown||focus.dataset.mapSource!=='original';stashLayer.replaceChildren();stashList.replaceChildren();
 for(const row of rows){
  const selected=active.has(row.id),inactive=!!feed&&!selected,display=!feed||stashAll||selected;
  const [x,y]=project({worldX:row.x,worldY:row.y});
  const describe=()=>{showInfo(row.name,(selected?'Current source-reported search area. ':inactive?'Not active this cycle; reference only. ':'Possible search area; current selection unconfirmed. ')+'Approximate projection, not an exact dig point. Metal Detector and Gather Intel required.');const link=el('a','','Source reference ↗');link.href=row.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';info.append(link)};
  const pin=btn('','j4740-stash-pin'+(selected?' is-current':inactive?' is-inactive':''),describe);pin.dataset.stashId=row.id;pin.style.left=x+'%';pin.style.top=y+'%';pin.hidden=!display;pin.append(stashIcon());pin.setAttribute('aria-label',row.name+' · '+(selected?'current search area':inactive?'not active this cycle':'unconfirmed search area'));stashLayer.append(pin);
  const item=btn('','j4740-stash-row',()=>{if(!display){stashStatus.textContent=row.name+' is not selected today. Use Show all known search areas for reference.';return}stashShown=true;activate('original');stashLayer.hidden=false;stashToggle.setAttribute('aria-pressed','true');pin.focus({preventScroll:true});describe();mapArea.scrollIntoView({block:'center',behavior:'smooth'})});
  item.append(stashIcon(),el('span','',row.name),el('small','',selected?'TODAY':feed?'NOT ACTIVE':'UNCONFIRMED'));item.dataset.availability=selected?'active':inactive?'inactive':'unconfirmed';item.classList.toggle('j393-inactive',inactive);stashList.append(item);
 }
}
function paintChests(){
 chestLayer.replaceChildren();if(!chestData)return;
 for(const s of chestData.spawns){
  const [x,y]=project(s);const active=activeIds.includes(s.id),inactive=activeIds.length===2&&!active;
  const b=btn('','j180-chest'+(active?' j180-chest-active':inactive?' j4740-chest-inactive':''),()=>showInfo('Treasure chest #'+s.id+(active?' · today’s '+activeLabel:''),s.landmark+' · '+(s.kind==='land'?'Land':'Underwater')+'. '+(inactive?'Not selected this cycle; reference only. ':active?'Current selection. ':'Current selection unconfirmed. ')+'Only one chest of this type appears daily.',s.id));
  b.dataset.chest=String(s.id);b.style.left=x+'%';b.style.top=y+'%';b.textContent=active?'✦':'•';b.title='Chest #'+s.id+' · '+s.kind+(active?' · '+activeLabel:' · possible only');
  b.setAttribute('aria-label','Treasure chest '+s.id+', '+s.kind+', '+(active?'calculated or personally selected for current day':inactive?'not active this cycle':'possible spawn; current selection unconfirmed'));
  chestLayer.append(b);
 }
 repaintLegend();
}
function updateActive(){
 const now=new Date(),key=dayKey(now);dailyData=window.JuraConditions?.cayoChestSelection(reviewedDaily,now.getTime())||bundledDaily;
 const inWindow=dailyData&&Date.parse(dailyData.windowStartUTC)<=now.getTime()&&now.getTime()<Date.parse(dailyData.windowEndUTC);
 activeIds=[];activeLabel='';if(inWindow&&dailyData.confidence==='calculated_unconfirmed_in_game'&&Number.isInteger(dailyData.land)&&dailyData.land>=1&&dailyData.land<=10&&Number.isInteger(dailyData.underwater)&&dailyData.underwater>=11&&dailyData.underwater<=19){
  activeIds=[dailyData.land,dailyData.underwater];activeLabel='calculated / unverified';}
 if(personal?.day===key&&Number.isInteger(personal.land)&&Number.isInteger(personal.underwater)&&personal.land>=1&&personal.land<=10&&personal.underwater>=11&&personal.underwater<=19){
  activeIds=[personal.land,personal.underwater];activeLabel='player-selected / not verified';}
 todayOnly=activeIds.length===2&&preference==='today';
 allBtn.setAttribute('aria-pressed',String(!todayOnly));todayBtn.setAttribute('aria-pressed',String(todayOnly));
 paintChests();renderDaily();paintStashes();
}
function renderDaily(){
 const now=new Date();dailyList.replaceChildren();
 if(!chestData){dailyStatus.textContent='Reference locations unavailable. Check the source map for today’s two chests.';return;}
 const current=activeIds.length===2;
 dailyStatus.textContent=current?('Current 06:00 UTC cycle · land #'+activeIds[0]+' + underwater #'+activeIds[1]+' highlighted in cyan · '+activeLabel+'. Other locations are dimmed and unavailable this cycle; Today’s two hides reference pins. Check gameplay if a location differs.'):
  'No current dated chest selection available. All 19 possible locations are shown in yellow; none is falsely marked active. Check the live source or enter your own two.';
 todayBtn.disabled=!current;todayBtn.title=current?'Show only the two current selections':'Current daily selection unavailable; all 19 remain visible';
 const list=chestData.spawns; // retain every numbered legend/reference entry
 const chestLegend=legendRows.querySelector('[data-cat="chest"] .j180-legend-copy small');
 if(chestLegend)chestLegend.textContent=current?'2 active (cyan) · 17 unavailable today':'19 possible · current pair unconfirmed';
 for(const s of list){
  const inactive=current&&!activeIds.includes(s.id);
  const row=btn('','j180-chest-row',()=>{
   if(inactive&&todayOnly){dailyStatus.textContent='Chest #'+s.id+' · '+s.landmark+' is not selected this cycle. It may return on a later daily reset at 06:00 UTC. All 19 possible opens reference positions; today’s two remain highlighted.';return;}
   if(focus.dataset.mapSource!=='original')activate('original');
   const pin=chestLayer.querySelector('[data-chest="'+s.id+'"]');
   pin?.focus({preventScroll:true});pin?.click();
   mapArea.scrollIntoView({block:'center',behavior:'smooth'});
  });
  row.append(el('span','j180-chest-dot'+(activeIds.includes(s.id)?' is-active':''),'●'),
             el('span','', '#'+s.id+' · '+s.landmark),
             el('small','',(s.kind==='land'?'LAND':'UNDERWATER')+' · '+(activeIds.includes(s.id)?'TODAY':inactive?'NOT ACTIVE':'UNCONFIRMED')));
  row.classList.toggle('j393-inactive',inactive);row.setAttribute('data-availability',inactive?'inactive':activeIds.includes(s.id)?'active':'unconfirmed');
  row.title=inactive?'Not available this cycle; All 19 possible opens archived/reference locations':'Chest location reference';
  dailyList.append(row);
 }
}
const sync=()=>{repaintLegend();stashLayer.hidden=!stashShown||focus.dataset.mapSource!=='original';};
const observer=new MutationObserver(sync);observer.observe(focus,{attributes:true,attributeFilter:['data-map-source']});
Promise.all([
 fetch('./data/cayo-treasure-spots.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('spots unavailable');return r.json()}),
 fetch('./data/cayo-treasure-today.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)
]).then(([spots,d])=>{
 if(!Array.isArray(spots?.spawns)||spots.spawns.length!==19||spots.spawns.filter(p=>p.kind==='land').length!==10||spots.spawns.filter(p=>p.kind==='underwater').length!==9)throw Error('invalid Cayo treasure catalog');
 chestData=spots;bundledDaily=d;updateActive();void refreshDaily();
}).catch(()=>{renderDaily();paintStashes();void refreshDaily()});
async function refreshDaily(){
 const C=window.JuraConditions;if(!C||dailyPending)return;
 dailyPending=true;
 try{reviewedDaily=await C.refreshPublishedRotations(fetch,reviewedDaily,{onlyIds:['cayo-chests','cayo-stashes']});updateActive()}catch{}finally{dailyPending=false}
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){updateActive();void refreshDaily()}});
setInterval(()=>{updateActive();if(!document.hidden)void refreshDaily()},window.JuraConditions?.ROTATION_STATUS_MS||60000);
const smallMeta=el('p','j180-credit','Research: GTA Wiki, GTALens, GTAMap.io and Rockstar. Original Elario UI and pin styling; underlying in-game artwork © Rockstar Games / Take-Two. Daily predictions are not official confirmation. ');
const sourceLink=el('a','','Sources & licenses ↗');sourceLink.href='./atlas-credits.html';smallMeta.append(sourceLink);mapStage.append(smallMeta);
activate('original');
window.teamJuraCayoFlagship={version:'18.0',openTool,renderDaily,showChests:()=>{disabled.delete('chest');repaintLegend();}};
})();