/* Team Jura Atlas 16.7 — distinct heist-first, locally saved schematic map workspaces.
 * No unverified game coordinates. Premium cinematic mission cover and legacy checklist remain untouched.
 * The site-specific diagrams are original Canvas artwork; they do not depict exact Rockstar geometry.
 */
(()=>{'use strict';
const data={"fleeca":{"title":"Fleeca · bank block","kind":"urban","scope":"The bank and its immediate approach streets. Not an exact street plan.","source":"https://www.rockstargames.com/newswire/article/k4478o452k7ko3/run-back-the-classics-with-bonuses-on-original-heist-finales","points":[["Bank frontage","entry",39,51,"Finale approach toward the bank; illustrated placement"],["Security room","objective",50,41,"Bank interior planning reference, not an accurate floor plan"],["Vault","loot",59,39,"Finale drilling objective"],["Scope Out","intel",22,27,"Heist reconnaissance/setup"],["Kuruma setup","prep",22,72,"Armored getaway vehicle setup"],["Getaway lane","exit",73,74,"Personal route choice; no verified path asserted"]]},"prison-break":{"title":"Prison Break · facility & airfield","kind":"prison","scope":"Multiple mission areas represented together; schematic positions only.","source":"https://www.rockstargames.com/newswire/article/k4478o452k7ko3/run-back-the-classics-with-bonuses-on-original-heist-finales","points":[["Prison perimeter","entry",46,38,"Bolingbroke Penitentiary finale destination"],["Prisoner extraction","objective",58,45,"Extract Rashkovsky; interior not georeferenced"],["Airfield","prep",20,20,"Plane setup/approach planning zone"],["Prison bus","prep",28,72,"Prison Break bus setup"],["Police station","intel",76,21,"Station mission reference"],["Aircraft escape","exit",79,72,"Air escape and regroup reference"]]},"humane-labs":{"title":"Humane Labs · coastal facility","kind":"coast","scope":"Lab complex and shoreline, conceptual site plan.","source":"https://www.rockstargames.com/newswire/article/k4478o452k7ko3/run-back-the-classics-with-bonuses-on-original-heist-finales","points":[["Lab compound","entry",49,40,"Humane Labs facility"],["Lab interior","objective",54,51,"Finale objective area; not real rooms"],["EMP delivery","prep",32,70,"Deliver EMP setup"],["Insurgent vehicles","prep",27,24,"Insurgents setup"],["Valkyrie support","prep",73,24,"Helicopter setup"],["Coastal exit","exit",72,76,"Escape area, illustrative"]]},"series-a":{"title":"Series A · multi-setup operation","kind":"industrial","scope":"Mission-board schematic, not one actual geographic location.","source":"https://thegta.wiki/wiki/heist-setups/","points":[["Coke","prep",18,26,"Coke setup mission"],["Trash Truck","prep",37,23,"Trash Truck setup mission"],["Bikers","prep",72,28,"Bikers setup mission"],["Weed","prep",25,70,"Weed setup mission"],["Meth","prep",56,72,"Meth setup mission"],["Finale","objective",79,61,"Series A Funding finale"]]},"pacific-standard":{"title":"Pacific Standard · bank & escape","kind":"urban","scope":"Bank district and escape decision zones; schematic only.","source":"https://www.rockstargames.com/newswire/article/k4478o452k7ko3/run-back-the-classics-with-bonuses-on-original-heist-finales","points":[["Bank frontage","entry",44,45,"Pacific Standard bank entrance"],["Bank objective","loot",52,37,"Finale objective"],["Vans","prep",23,26,"Vans setup"],["Signal / hack","intel",72,24,"Signal and hacking setups"],["Convoy","prep",27,74,"Convoy setup"],["Bikes","exit",68,69,"Getaway bikes; route is player-defined"]]},"doomsday-act-1":{"title":"Doomsday I · data breaches","kind":"regional","scope":"Regional operation areas and facility, not exact game coordinates.","source":"https://www.gtabase.com/gta-online/jobs/heists/","points":[["Facility hub","entry",50,48,"Act planning facility"],["Server Farm","objective",75,25,"Server Farm setup mission"],["Dead Courier","prep",25,31,"Setup mission"],["Signal Intercepts","prep",22,70,"Setup mission"],["Data Breaches finale","objective",73,70,"Act I finale area, illustrative"]]},"doomsday-act-2":{"title":"Doomsday II · Bogdan Problem","kind":"coast","scope":"Submarine and coastal operations need separate mission areas.","source":"https://www.gtabase.com/gta-online/jobs/heists/","points":[["Submarine","objective",69,43,"Bogdan Problem finale objective"],["Submarine access","entry",48,53,"Illustrative marine approach"],["ULP / rescue","prep",24,26,"Rescue ULP setup"],["Hard drives","prep",78,26,"Salvage Hard Drives setup"],["Aircraft support","exit",24,77,"Air support / return plan"]]},"doomsday-act-3":{"title":"Doomsday III · scenario","kind":"desert","scope":"Act III regional setup destinations and finale zone.","source":"https://www.gtabase.com/gta-online/jobs/heists/","points":[["Facility / prep","entry",36,50,"Facility preparation"],["Barrage","prep",19,28,"Barrage setup"],["Khanjali","prep",70,27,"Khanjali setup"],["Air Defenses","prep",79,74,"Air Defenses setup"],["Scenario finale","objective",53,64,"Act III finale zone; schematic"]]},"diamond-casino":{"title":"Diamond Casino · access & vault","kind":"casino","scope":"Exterior access choices and interior references—not a real casino floor plan.","source":"https://www.gtabase.com/gta-online/jobs/heists/the-diamond-casino-heist","points":[["Main entrance","entry",52,76,"Required scoping reference"],["Staff lobby","entry",28,44,"Casino heist access option"],["Waste disposal","entry",75,57,"Optional access approach"],["Security tunnel","entry",21,76,"Optional vehicle/security approach"],["Roof & helipad","entry",51,18,"Roof access options"],["Sewer access","entry",83,76,"Tunnel approach for applicable setup"],["Vault camera","intel",48,43,"Vault contents scoping objective"],["Exit planning","exit",71,26,"Choose exit during planning"]]},"cayo-perico":{"title":"Cayo Perico · island & compound","kind":"island","scope":"Dedicated Cayo island; reference original in-game map for exact geography. Diagram pins are illustrative.","source":"https://www.rockstargames.com/gta-online/heists/cayo-perico-heist","points":[["Airstrip","entry",22,20,"Northwest island airport"],["North Dock","entry",72,28,"Dock approach and escape"],["HALO Jump","entry",49,17,"Alkonost parachute insertion choice, not a fixed on-ground location; position illustrative."],["Main Dock","entry",55,50,"Island approach and escape"],["Control Tower","intel",32,31,"Air-defense disruption intel"],["Power Station","intel",43,41,"Power-station disruption intel"],["Compound Gate","entry",66,72,"Compound access; not an exact map pin"],["Drainage Tunnel","entry",66,83,"Underwater approach unlock"],["El Rubio Compound","objective",75,75,"Primary objective compound"],["Secondary loot areas","loot",32,57,"Locations and types vary per run"],["Daily chests","loot",25,77,"Two daily locations rotate; point shown is a category reminder, not today's location"]]},"cluckin-bell":{"title":"Cluckin' Bell · farm raid","kind":"farm","scope":"Farm/industrial facility and mission staging, not a floor-accurate map.","source":"https://www.gtabase.com/gta-online/jobs/heists/","points":[["Farm perimeter","entry",34,54,"Finale approach planning"],["Production buildings","objective",56,43,"Raid objective zone, illustrative"],["Staging / intel","intel",25,28,"Investigation setup"],["Vehicle prep","prep",77,25,"Getaway preparation"],["Extraction lane","exit",77,74,"Player-defined route, not verified"]]},"salvage-yard":{"title":"Salvage Yard · robbery board","kind":"industrial","scope":"Contract destinations vary: a reusable schematic, not a fixed heist location.","source":"https://www.gtabase.com/gta-online/jobs/heists/","points":[["Yard HQ","entry",34,38,"Start from salvage yard"],["Robbery selection","intel",60,30,"Select the active robbery"],["Mission staging","prep",25,75,"Contract prep references"],["Target vehicle","objective",70,55,"Location changes by robbery"],["Vehicle delivery","exit",70,79,"Extraction / handoff, varies"]]},"auto-shop":{"title":"Auto Shop · contract board","kind":"urban","scope":"Active contracts use different sites; plan each contract independently.","source":"https://www.gtabase.com/gta-online/jobs/heists/","points":[["Auto Shop","entry",27,34,"Contract base"],["Contract board","intel",42,30,"Choose mission contract"],["Setup area","prep",68,27,"Contract-specific setup"],["Finale zone","objective",55,65,"Varies by selected contract"],["Return / escape","exit",75,77,"Personal escape plan"]]},"agency-vip":{"title":"Agency · VIP contract","kind":"urban","scope":"Agency/recording missions span multiple locations; conceptual operation plan.","source":"https://www.gtabase.com/gta-online/jobs/heists/","points":[["Agency office","entry",35,43,"VIP Contract operations base"],["Investigation","intel",65,25,"Gather leads during contract"],["Security mission","prep",19,74,"Preparation reference"],["Finale objective","objective",64,63,"Finale mission zone; varies"],["Exit & regroup","exit",76,82,"Player-defined plan"]]},"kortz-center":{"title":"Kortz Center · localized site","kind":"cultural","scope":"Focused Kortz Center concept; exact interior/exterior pins require verification.","source":"https://www.gtabase.com/gta-online/jobs/heists/","points":[["Museum frontage","entry",50,77,"Kortz Center exterior reference"],["Approach perimeter","entry",29,59,"Conceptual approach, not verified entrance"],["Gallery zone","objective",52,38,"Research placeholder for interior objective"],["Planning intel","intel",24,30,"Record source-verified details as available"],["Exit plan","exit",74,74,"Player-defined escape route"]]}};
const id=String(document.body.dataset.heist||'');
const config=data[id];
if(!config||!document.body.classList.contains('j120-heist-page')||document.getElementById('j167-heist-map'))return;
const box=document.querySelector('.mapbox');
if(!box)return;
const kinds={
 entry:{label:'Entry / access',color:'#ffd18b',symbol:'↪'},
 intel:{label:'Intel / scoping',color:'#88e2cb',symbol:'⌕'},
 prep:{label:'Setup / prep',color:'#c69afc',symbol:'◆'},
 objective:{label:'Mission objective',color:'#fb859c',symbol:'★'},
 loot:{label:'Loot / treasures',color:'#ffe38d',symbol:'◇'},
 exit:{label:'Escape / return',color:'#86d9ff',symbol:'↗'}
};
let points=config.points.map((p,i)=>({id:'m'+i,name:p[0],cat:p[1],x:p[2],y:p[3],description:p[4]}));
const storage='teamjura-heist-focus-v1:'+id;
let saved={scoped:[],route:[],awards:[]};
try{const s=JSON.parse(localStorage.getItem(storage)||'{}');if(s&&typeof s==='object'){
 for(const k of ['scoped','route','awards'])if(Array.isArray(s[k]))saved[k]=s[k].filter(v=>typeof v==='string').slice(0,100);
}}catch(_){}
const persist=()=>{try{localStorage.setItem(storage,JSON.stringify({schema:1,updatedAt:new Date().toISOString(),...saved}))}catch(_){}};
const el=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=content;return n;};
const sec=el('section','j167-focus');sec.id='j167-heist-map';sec.setAttribute('aria-labelledby','j167-title');
const head=el('header','j167-head');
const intro=el('div');intro.append(el('div','j167-eyebrow','YOUR MISSION · DEDICATED MAP'),el('h2','j167-title',config.title),el('p','j167-desc',config.scope));
intro.querySelector('h2').id='j167-title';
const status=el('span','j167-label','ILLUSTRATIVE POSITIONS · NOT GEOREFERENCED');head.append(intro,status);sec.append(head);
const bar=el('div','j167-toolbar');bar.setAttribute('aria-label','Map and category tools');
const search=el('input','j167-search');search.type='search';search.placeholder='Search this heist’s POIs';search.setAttribute('aria-label','Search mission points of interest');
bar.append(search);
const zoomBtns=el('div','j167-zoom');const btn=(label,cls,handler)=>{const b=el('button',cls,label);b.type='button';b.addEventListener('click',handler);return b};
let zoom=1,dx=0,dy=0;
// These are EDITORIALLY APPROXIMATE relative landmarks on the in-game map.
// No conversion from the custom schematic is implied; unknown rotating loot is hidden.
let juraMapMode='enhanced';
const juraOriginalMap="https://wikiassets.net/gta-wiki-aef1ab/images/3a038f45d60d9b4ebb65f4f0260b3ff7.webp";
const juraLocalRoadPlan='./art/jura182-cayo-local-road-plan.svg';
let juraLocalFallback=false,juraSourceTimeout=null;
const islandLandmarks={
'airstrip':[23,34],'north dock':[69,43],'main dock':[60,62],'halo jump':[46,18],
'control tower':[32,35],'power station':[38,46],
'compound gate':[75,74],'el rubio compound':[76,78],
'drainage tunnel':[79,85],'west beach':[19,44],
'north drop zone':[50,30],'south drop zone':[62,70],
'compound main gate':[74,73],'compound north gate':[77,73],
'compound south gate':[79,82],'compound north wall':[77,76],
'compound south wall':[80,80],'kosatka escape area':[24,28]
};
const juraCoord=p=>juraMapMode==='original'&&id==='cayo-perico'?(islandLandmarks[p.name.toLowerCase()]||null):[p.x,p.y];
let redraw=()=>{};
function setView(){const world=sec.querySelector('.j167-world');if(world)world.style.transform='translate('+dx+'px,'+dy+'px) scale('+zoom+')'; const t=sec.querySelector('.j167-scale');if(t)t.textContent=zoom.toFixed(1)+'×';}
zoomBtns.append(
 btn('−','j167-tool',()=>{zoom=Math.max(1,Math.round((zoom-.2)*10)/10);setView()}),
 btn('+','j167-tool',()=>{zoom=Math.min(2.8,Math.round((zoom+.2)*10)/10);setView()}),
 btn('Fit','j167-tool',()=>{zoom=1;dx=dy=0;setView()}));
zoomBtns.append(el('strong','j167-scale','1.0×'));
bar.append(zoomBtns);
const move=btn('Move map: Off','j167-tool',()=>{moveMode=!moveMode;move.textContent='Move map: '+(moveMode?'On':'Off');move.setAttribute('aria-pressed',String(moveMode));zone.style.touchAction=moveMode?'none':'pan-y'});
move.setAttribute('aria-pressed','false');
bar.append(move);
sec.append(bar);
const chips=el('div','j167-chips');chips.setAttribute('aria-label','Toggle point categories');
const enabled=new Set(Object.keys(kinds));
for(const [key,val] of Object.entries(kinds)){const c=btn(val.symbol+' '+val.label,'j167-chip',()=>{enabled.has(key)?enabled.delete(key):enabled.add(key);c.setAttribute('aria-pressed',String(enabled.has(key)));paint()});c.dataset.cat=key;c.setAttribute('aria-pressed','true');chips.append(c)}
sec.append(chips);
let moveMode=false,drag=null;
const zone=el('div','j167-viewport');zone.setAttribute('aria-label','Illustrative mission-area map with selectable points of interest');
zone.style.touchAction='pan-y';
zone.addEventListener('pointerdown',e=>{if(!moveMode||e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY,dx,dy};zone.setPointerCapture?.(e.pointerId)});
zone.addEventListener('pointermove',e=>{if(!drag||!moveMode)return;dx=drag.dx+e.clientX-drag.x;dy=drag.dy+e.clientY-drag.y;setView()});
zone.addEventListener('pointerup',()=>{drag=null});
zone.addEventListener('pointercancel',()=>{drag=null});
const world=el('div','j167-world');const canvas=el('canvas','j167-canvas');canvas.width=1100;canvas.height=660;canvas.setAttribute('aria-hidden','true');
world.append(canvas);const pinLayer=el('div','j167-pins');world.append(pinLayer);zone.append(world);
const hint=el('span','j167-map-hint','Original Team Jura site-plan concept · Exact game positions are not asserted');zone.append(hint);
sec.append(zone);
const detail=el('article','j167-detail');detail.setAttribute('aria-live','polite');
const list=el('div','j167-list');const listTitle=el('h3','','Mission points of interest');list.append(listTitle);
const note=el('p','j167-note','Choose a marker on the map or a row below. Mark it scoped and assemble a personal route. Route lines are planning order only, not real travel paths.');
list.append(note);
const itemList=el('div','j167-items');list.append(itemList);
const side=el('aside','j167-side');const routeTitle=el('h3','','My planning route');side.append(routeTitle);
const routeList=el('ol','j167-route');side.append(routeList);
const clearRoute=btn('Clear route','j167-secondary',()=>{saved.route=[];persist();paint()});side.append(clearRoute);
const challengeHeading=el('h3','','Challenges & progress');side.append(challengeHeading);
const challengeText=el('p','j167-note','Personal tracking only. Career Progress tiers and exact Elite conditions must be checked in the current game menu; this is not linked to Rockstar progress.');
side.append(challengeText);
const originalHeists=new Set(['fleeca','prison-break','humane-labs','series-a','pacific-standard']);
const doomsdayActs=new Set(['doomsday-act-1','doomsday-act-2','doomsday-act-3']);
let awardNames;
if(id==='cayo-perico'){
 awardNames=['Elite: under 15 minutes','Elite: zero failed hacks','Elite: full loot bags','Elite: no team deaths','Elite: avoid compound detection',
             'Cayo Career Progress category · Tier 1','Cayo Career Progress category · Tier 2','Cayo Career Progress category · Tier 3','Cayo Career Progress category · Tier 4'];
}else if(id==='diamond-casino'){
 awardNames=['Elite finale reviewed','Casino Heist Career category · Tier 1','Casino Heist Career category · Tier 2','Casino Heist Career category · Tier 3','Casino Heist Career category · Tier 4'];
}else if(doomsdayActs.has(id)||originalHeists.has(id)){
 const shared=doomsdayActs.has(id)?'Doomsday':'Original Heists';
 awardNames=['Elite finale reviewed',shared+' Career category · Tier 1',shared+' Career category · Tier 2',shared+' Career category · Tier 3',shared+' Career category · Tier 4'];
}else{
 awardNames=['Personal optional challenge goal 1','Personal optional challenge goal 2','Personal optional challenge goal 3','Personal optional challenge goal 4'];
}
const awardBox=el('div','j167-awards');
for(const [i,label] of awardNames.entries()){
 const line=el('label','j167-award');const input=el('input');input.type='checkbox';input.checked=saved.awards.includes('a'+i);
 input.addEventListener('change',()=>{saved.awards=input.checked?[...new Set([...saved.awards,'a'+i])]:saved.awards.filter(x=>x!=='a'+i);persist()});
 line.append(input,el('span','',label));awardBox.append(line);
}
side.append(awardBox);
const sourceWrap=el('div','j167-sources');
sourceWrap.append(el('p','j167-note','Mission/POI names are research references. Pins and routes on this custom map are illustrative; variable loot, entrances and daily chests must be checked in-game.'));
const source=el('a','','Mission information source ↗');source.href=config.source;source.target='_blank';source.rel='noopener noreferrer';
sourceWrap.append(source);
if(id==='cayo-perico'){const elite=el('a','','Cayo Elite criteria and rewards (GTABase) ↗');elite.href='https://www.gtabase.com/gta-online/jobs/heists/the-cayo-perico-heist';elite.target='_blank';elite.rel='noopener noreferrer';sourceWrap.append(elite);}
const career=el('a','','Official GTA Online Career Progress ↗');career.href='https://www.rockstargames.com/gta-online';career.target='_blank';career.rel='noopener noreferrer';sourceWrap.append(career);
side.append(sourceWrap);
const panels=el('div','j167-panels');panels.append(list,side);sec.append(detail,panels);
if(id==='cayo-perico'){
 const island=el('div','j167-island-note');
 island.append(el('strong','','Original island map available'));
 island.append(el('p','','The separate Cayo Perico Explorer has the original game-island view and an individual interactive scoping layer. Pins in this focused overview remain illustrative.'));
 const a=el('a','','Open Cayo’s original island map and scoping tools ↗');a.href='./atlas-cayo.html';island.append(a);
 const daily=el('p','','Daily chests: two locations rotate. These overview markers are not today’s chest positions; verify daily data before setting a route.');
 island.append(daily);sec.append(island);
}
const tertiary=el('div','j167-footer');tertiary.append(el('span','','Need a wider setup route? The regional GTA Online map remains below as an optional tool.'));sec.append(tertiary);
const cover=box.querySelector(':scope > img');
if(cover)cover.insertAdjacentElement('afterend',sec);else box.prepend(sec);
// Preserve the working regional fallback, but rename legacy text to match the new
// dedicated heist-first map presentation. Do not duplicate empty world-map invites.
const oldTitle=box.querySelector(':scope > h2');
const oldDesc=box.querySelector(':scope > p');
const oldLink=box.querySelector(':scope > a.btn');
const oldNote=box.querySelector(':scope > .small');
if(oldTitle)oldTitle.textContent=id==='cayo-perico'?'Original Cayo island map · source reference':'Regional support map · optional';
if(oldDesc)oldDesc.textContent=id==='cayo-perico'?'The complete Cayo explorer offers the original island image and separate interactive schematic. Your mission-specific POIs and personal route are above.':'Use the regional GTA Online map for wider setups and long-distance routes. The localized mission diagram, pin list and progress tools are above.';
if(oldLink)oldLink.textContent=id==='cayo-perico'?'Open original Cayo island explorer ↗':'Open GTA Online regional map ↗';
if(oldNote)oldNote.textContent='The mission map above is an original illustration, not verified game geography.';
function seed(s){let h=2166136261;for(const ch of s)h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0}
let randSeed=seed(id),rando=()=>{randSeed=(Math.imul(randSeed,1664525)+1013904223)>>>0;return randSeed/4294967296};
const ctx=canvas.getContext('2d');const w=1100,h=660;
let photoReady=false;
const photo=new Image();
// The museum-like Kortz site receives a detailed original overhead raster.
// It is a concept derived from reference study, not in-game image geometry.
const photoAsset=id==='kortz-center'?'./art/jura168-kortz-center-aerial.webp':'./art/jura167-map-'+id+'.webp';
photo.onload=()=>{photoReady=true;if(juraMapMode!=='original'){world.style.backgroundImage='linear-gradient(180deg,rgba(6,12,34,.14),rgba(6,7,24,.26)),url("'+photoAsset+'")';world.style.backgroundSize='cover';world.style.backgroundPosition='center';paint()}};
photo.onerror=()=>{photoReady=false;if(juraMapMode!=='original')world.style.backgroundImage='none';paint()};
photo.decoding='async';photo.src=photoAsset;
const scheme={urban:['#1f2847','#3b324b','#586171'],prison:['#1b283b','#314758','#586578'],coast:['#11394b','#315864','#61706b'],industrial:['#302f42','#48465b','#77727d'],regional:['#282f47','#405272','#6e6681'],desert:['#403447','#735c67','#a68c72'],island:['#093950','#24766b','#497c56'],farm:['#343b35','#647051','#9f8a60'],casino:['#2d213e','#6d376d','#b27391'],cultural:['#302741','#574566','#95817c']};
const pal=scheme[config.kind]||scheme.urban;
function line(x1,y1,x2,y2,width,color){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function rect(x,y,bw,bh,color,stroke){ctx.fillStyle=color;ctx.fillRect(x,y,bw,bh);if(stroke){ctx.lineWidth=3;ctx.strokeStyle=stroke;ctx.strokeRect(x,y,bw,bh)}}
function drawTerrain(){if(juraMapMode==='original'&&id==='cayo-perico'){ctx.clearRect(0,0,w,h);return}
 if(photoReady){
  ctx.clearRect(0,0,w,h);
  for(let i=0;i<=11;i++){line(i*100,0,i*100,h,1,'#f8e8f433');}
  for(let i=0;i<=10;i++){line(0,i*66,w,i*66,1,'#f8e8f427');}
  ctx.font='800 18px system-ui';ctx.fillStyle='#ffe2a9';ctx.fillText('ORIGINAL ELARIO CONCEPT · GAME GEOGRAPHY UNVERIFIED',23,35);
  ctx.font='600 14px system-ui';ctx.fillText('PERSONAL ROUTE PLANNING · APPROXIMATE PIN POSITIONS',23,628);
  return;
 }
 const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,pal[0]);bg.addColorStop(.58,pal[1]);bg.addColorStop(1,pal[0]);ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 randSeed=seed(id);ctx.save();
 // Distinct site plan types, illustrated only. No false real-world coordinates.
 for(let i=0;i<38;i++){const x=45+rando()*1000,y=30+rando()*580,bw=22+rando()*76,bh=16+rando()*46;ctx.globalAlpha=.21+rando()*.12;rect(x,y,bw,bh,pal[2],null)}
 ctx.globalAlpha=1;
 if(config.kind==='island'||config.kind==='coast'){
  ctx.fillStyle='#07506d';ctx.beginPath();ctx.moveTo(0,500);ctx.bezierCurveTo(160,320,280,540,390,180);ctx.bezierCurveTo(600,60,820,260,1100,40);ctx.lineTo(1100,0);ctx.lineTo(0,0);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#d4c28b';ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(115,500);ctx.bezierCurveTo(300,510,280,220,465,195);ctx.bezierCurveTo(680,155,830,240,1040,90);ctx.stroke();
 }
 if(config.kind==='island'){
  ctx.fillStyle='#2f6252';ctx.beginPath();ctx.ellipse(580,360,335,235,.24,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#d5c287';ctx.lineWidth=23;ctx.stroke();
 }
 if(config.kind==='urban'||config.kind==='casino'||config.kind==='cultural'){
  line(100,0,390,660,62,'#1b1e2f');line(100,0,390,660,3,'#b9a4af55');
  line(0,480,1100,205,65,'#1b1d2d');line(0,480,1100,205,4,'#e0b38366');
 }
 if(config.kind==='industrial'||config.kind==='farm'||config.kind==='regional'){
  line(0,505,1100,405,70,'#292c3a');line(0,505,1100,405,4,'#c7ac9a55');
  line(470,0,615,660,45,'#252634');
 }
 if(config.kind==='prison'||config.kind==='desert'||config.kind==='casino'||config.kind==='cultural'){
  ctx.strokeStyle='#f3d2a5aa';ctx.lineWidth=10;ctx.strokeRect(250,150,590,370);
  rect(320,205,240,120,'#19283cdd','#dfc2a280');rect(595,240,155,190,'#222c47cc','#edc2a180');
 }
 for(let i=0;i<12;i++){line(i*100,0,i*100,660,1,'#e3d3e41f');line(0,i*60,1100,i*60,1,'#e3d3e41a')}
 const shade=ctx.createLinearGradient(0,0,0,660);shade.addColorStop(0,'#05081530');shade.addColorStop(.5,'#05060c00');shade.addColorStop(1,'#06071c8f');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
 ctx.font='800 19px system-ui';ctx.letterSpacing='4px';ctx.fillStyle='#ffdaa4dc';ctx.fillText('ELARIO STUDIOS  /  PERSONAL MISSION MAP',27,35);
 ctx.font='12px system-ui';ctx.fillStyle='#fff0d6bb';ctx.fillText('SCHEMATIC · NOT AN ACTUAL IN-GAME MAP · FOR PLANNING ONLY',29,634);
 ctx.restore();
}
let current=null;
function detailFor(p){
 detail.replaceChildren();
 if(!p){detail.append(el('strong','','Select an accessible map pin or POI below to inspect its details.'));return}
 const header=el('div','j167-detail-header');
 const tag=el('span','j167-cat',kinds[p.cat]?.label||'Mission');tag.style.borderColor=kinds[p.cat]?.color||'#fff';header.append(tag,el('h3','',p.name));detail.append(header,el('p','',p.description));
 const actions=el('div','j167-detail-actions');
 actions.append(btn(saved.scoped.includes(p.id)?'✓ Marked scoped':'Mark scoped','j167-secondary',()=>{saved.scoped=saved.scoped.includes(p.id)?saved.scoped.filter(x=>x!==p.id):[...saved.scoped,p.id];persist();paint();detailFor(p)}));
 actions.append(btn(saved.route.includes(p.id)?'Remove from route':'+ Add to route','j167-primary',()=>{saved.route=saved.route.includes(p.id)?saved.route.filter(x=>x!==p.id):[...saved.route,p.id];persist();paint();detailFor(p)}));
 detail.append(actions);
}
function paint(){
 const q=search.value.toLowerCase().trim();
 const visible=points.filter(p=>enabled.has(p.cat)&&juraCoord(p)&&(!q||(p.name+' '+p.description).toLowerCase().includes(q)));
 drawTerrain();ctx.save();
 if(saved.route.length>1){let order=saved.route.map(key=>points.find(p=>p.id===key)).filter(p=>p&&juraCoord(p));if(order.length>1){ctx.beginPath();order.forEach((p,i)=>{const coord=juraCoord(p);const x=coord[0]/100*w,y=coord[1]/100*h;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle='#ffe4ab';ctx.lineWidth=7;ctx.setLineDash([12,9]);ctx.stroke();ctx.setLineDash([])}}
 ctx.restore();
 pinLayer.replaceChildren();itemList.replaceChildren();
 for(const p of visible){
  const marker=btn(kinds[p.cat].symbol,'j167-pin',()=>{current=p.id;detailFor(p);pinLayer.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.point===p.id)))});
  const pos=juraCoord(p);marker.style.left=pos[0]+'%';marker.style.top=pos[1]+'%';marker.style.setProperty('--pin-color',kinds[p.cat].color);
  marker.dataset.point=p.id;marker.setAttribute('aria-label',p.name+' ('+kinds[p.cat].label+')');
  marker.setAttribute('aria-pressed',String(current===p.id));marker.title=p.name+' · illustrative';
  if(saved.scoped.includes(p.id))marker.classList.add('j167-scoped');pinLayer.append(marker);
  const row=btn(p.name,'j167-item',()=>{current=p.id;detailFor(p);pinLayer.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.point===p.id)))});
  const c=el('small','',kinds[p.cat].label+(saved.scoped.includes(p.id)?' · ✓ scoped':''));row.append(c);itemList.append(row);
 }
 if(!visible.length)itemList.append(el('p','j167-note','No points match those filters.'));
 routeList.replaceChildren();
 for(const [i,pointid] of saved.route.entries()){const p=points.find(x=>x.id===pointid);if(!p)continue;
  const row=el('li','',p.name);const b=btn('×','j167-route-remove',()=>{saved.route=saved.route.filter(x=>x!==p.id);persist();paint()});b.setAttribute('aria-label','Remove '+p.name+' from route');row.append(b);routeList.append(row)}
 if(!saved.route.length)routeList.append(el('li','j167-route-empty','Select a marker to create your route.'));
}
search.addEventListener('input',paint);
const juraSource=new Image();
 let juraSourceReady=false;
 juraSource.onload=()=>{juraSourceReady=true;if(juraSourceTimeout)clearTimeout(juraSourceTimeout);if(juraMapMode==='original')juraShowSource()};
 juraSource.onerror=()=>{juraSourceReady=false;if(juraMapMode!=='original')return;
  if(!juraLocalFallback){juraLocalFallback=true;sec.dataset.mapAsset='local-trace';juraSource.src=juraLocalRoadPlan;}
  else{juraSwitchMap('enhanced');window.teamJuraHeistViews?.activate('enhanced');}
 };
 function juraShowSource(){
 if(!juraSourceReady)return;
 world.style.backgroundImage='url("'+(juraLocalFallback?juraLocalRoadPlan:juraOriginalMap)+'")';
 world.style.backgroundSize='100% 100%';world.style.backgroundPosition='center';
 zone.style.aspectRatio=juraSource.naturalWidth+'/'+juraSource.naturalHeight;
 zone.style.minHeight='0';sec.dataset.mapSource='original';sec.dataset.mapAsset=juraLocalFallback?'local-trace':'gta-wiki';
 hint.textContent=juraLocalFallback?'Local Elario island road-plan reconstructed from the owner’s reference; not game-exact. Pins and routes are approximate.':'GTA Online Cayo island map © Rockstar Games / Take-Two via GTA Wiki. Team Jura pins and routes are approximate.';
 paint();
}
function juraSwitchMap(mode){
 if(id!=='cayo-perico')return false;
 juraMapMode=mode==='original'?'original':'enhanced';
 zoom=1;dx=dy=0;setView();detailFor(null);
 if(juraMapMode==='original'){
  if(juraSourceReady)juraShowSource();
  else{sec.dataset.mapSource='loading';sec.dataset.mapAsset='local-trace';
   // Show the bundled offline Elario road-map surface immediately while
   // attempting the external original image: marker users never see a blank map.
   world.style.backgroundImage='url("'+juraLocalRoadPlan+'")';
   world.style.backgroundSize='100% 100%';world.style.backgroundPosition='center';
   hint.textContent='Local island road-map fallback visible while checking the game-map source. Pins approximate; routes schematic.';
   juraSource.src=juraLocalFallback?juraLocalRoadPlan:juraOriginalMap;
  if(juraSourceTimeout)clearTimeout(juraSourceTimeout);
  if(!juraLocalFallback)juraSourceTimeout=setTimeout(()=>{if(!juraSourceReady&&juraMapMode==='original'&&!juraLocalFallback){juraLocalFallback=true;sec.dataset.mapAsset='local-trace';juraSource.src=juraLocalRoadPlan;}},6500);
 }
 }else{
  sec.dataset.mapSource='enhanced';sec.dataset.mapAsset='elario-concept';zone.style.aspectRatio='';zone.style.minHeight='';
  world.style.backgroundImage=photoReady?'linear-gradient(180deg,rgba(6,12,34,.14),rgba(6,7,24,.26)),url("'+photoAsset+'")':'none';
  world.style.backgroundSize='cover';
  hint.textContent='Original Elario enhanced concept map · illustrative pin positions.';
  paint();
 }return true;
}
window.teamJuraHeistBaseMap={setSource:juraSwitchMap,getSource:()=>juraMapMode};
if(id==='cayo-perico')window.teamJuraCayoRoute={setRoute(names){
 if(!Array.isArray(names))return 0;
 const order=names.map(name=>points.find(p=>p.name.toLowerCase()===String(name).toLowerCase())).filter(Boolean);
 saved.route=[...new Set(order.map(p=>p.id))];persist();paint();return saved.route.length;
},getRoute(){return saved.route.slice()}};
detailFor(null);paint();setView();
if(id==='cayo-perico'){
 // Extend the focused overview with the locally maintained Cayo named scoping data.
 // This file explicitly marks every coordinate as schematic, not Rockstar game-space.
 fetch('./data/cayo-schematic.json').then(r=>{if(!r.ok)throw Error('Cayo notes unavailable');return r.json()}).then(d=>{
  const categories={infiltration:'entry',compound:'entry',intel:'intel',escape:'exit',research:'loot'};
  if(!Array.isArray(d.locations))return;
  const known=new Set(points.map(p=>p.name.toLowerCase()));
  let added=0;
  for(const p of d.locations){
   if(!p||typeof p.name!=='string'||known.has(p.name.toLowerCase())||!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;
   if(p.positionQuality!=='schematic')continue;
   points.push({id:'source-'+p.id,name:p.name,cat:categories[p.category]||'intel',x:Math.max(7,Math.min(93,p.x/10)),y:Math.max(8,Math.min(92,p.y/10.8)),description:p.description+' · Schematic location only.'});
   known.add(p.name.toLowerCase());added++;
  }
  if(added){paint();const n=el('p','j167-note','Added '+added+' extra locally catalogued Cayo scoping references. All positions remain schematic, not verified in-game coordinates.');sec.querySelector('.j167-island-note')?.append(n);}
 }).catch(()=>{/* The initial source-backed overview is still usable offline. */});
}
})();