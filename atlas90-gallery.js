/* Team Jura Atlas 9.0: image-first collection gallery, original UI and progress model.
 * Models GTA V archive imagery as reference art; GTA VI reference photos are NEVER presented as verified VI screenshots.
 * Browser loads existing Team Jura catalogs when present; avoids overwriting existing inventory keys.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);const game=document.body.dataset.gallery||'weapons';
// GTA V Story and GTA Online retain separate collection choices. Older
// weapons:<model> saves remain assigned to GTA Online; no destructive migration.
const weaponWorld=game==='weapons'&&new URLSearchParams(location.search).get('world')==='story'?'story':'online';
const vehicleWorld=game==='vehicles5'&&new URLSearchParams(location.search).get('world')==='story'?'story':'online';

const ROOT='https://cdn.jsdelivr.net/gh/Stuyk/gtav-image-archive@main/';
const ARCHIVE='https://api.github.com/repos/Stuyk/gtav-image-archive/git/trees/main?recursive=1';
const CATEGORY={weapons:'WEAPON ARMORY',vehicles5:'GTA V + ONLINE MOTORPOOL',vehicles6:'GTA VI VEHICLE INTELLIGENCE'};
const STORE='team-jura-atlas90-collection-v1';const STATE={owned:{},wishlist:{},note:{}};
// Retain legacy vehicles5:<id> as Online progress. Story gets its own IDs,
// without changing the existing shared backup key or deleting old choices.
function readCollection(){
 const raw=localStorage.getItem(STORE);
 if(raw===null)return {schema:1,owned:{},wishlist:{},note:{}};
 const saved=JSON.parse(raw);
 if(!saved||saved.schema!==1||typeof saved!=='object'||Array.isArray(saved))throw Error('Unsupported collection save');
 for(const key of Object.keys(STATE))if(saved[key]!==undefined&&(!saved[key]||typeof saved[key]!=='object'||Array.isArray(saved[key])))throw Error('Invalid collection '+key);
 return {...saved,owned:{...(saved.owned||{})},wishlist:{...(saved.wishlist||{})},note:{...(saved.note||{})}};
}
function adopt(saved){for(const key of Object.keys(STATE))STATE[key]=saved[key]}
let saveBlocked=false;
try{adopt(readCollection())}catch{saveBlocked=true}
let data=[],needle='',klass='all',ownership='all',evidence='all',acquisition='all',page=0,view='grid',compare=[],sourcesReady=false;
const PAGE=60;
let vehicleFacts={};
let resetFilters;
function applyLocation(){
 const params=new URL(location.href).searchParams;
 needle=(params.get('q')||'').slice(0,120).trim().toLowerCase();
 klass=(params.get('class')||'all').slice(0,100);
 const requested=params.get('collection');
 ownership=['owned','wanted'].includes(requested)?requested:'all';
 const requestedEvidence=params.get('evidence');
 evidence=game==='vehicles6'&&Object.hasOwn(window.JuraForge?.viEvidenceLabels||{},requestedEvidence)?requestedEvidence:'all';
 const requestedAcquisition=params.get('acquisition');
 acquisition=game==='vehicles6'&&Object.hasOwn(window.JuraForge?.viAcquisitionLabels||{},requestedAcquisition)?requestedAcquisition:'all';
 const requestedPage=Number(params.get('page')||1);
 page=Number.isSafeInteger(requestedPage)&&requestedPage>0?requestedPage-1:0;
 $('j90Search').value=needle;
 $('j90Ownership').value=ownership;
 if($('j90Evidence'))$('j90Evidence').value=evidence;
 if($('j90Acquisition'))$('j90Acquisition').value=acquisition;
}
function syncLocation(){
 const url=new URL(location.href);
 for(const [key,value] of [['q',needle],['class',klass==='all'?'':klass],['collection',ownership==='all'?'':ownership],['page',page?String(page+1):'']]){
  if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);
 }
 if(game==='vehicles6'){for(const [key,value] of [['evidence',evidence],['acquisition',acquisition]]){if(value==='all')url.searchParams.delete(key);else url.searchParams.set(key,value)}}
 if(url.href!==location.href)history.replaceState(history.state,'',url);
 if(resetFilters)resetFilters.hidden=!needle&&klass==='all'&&ownership==='all'&&evidence==='all'&&acquisition==='all'&&!page;
}
function clearFilters(){
 needle='';klass='all';ownership='all';evidence='all';acquisition='all';page=0;
 $('j90Search').value='';$('j90Class').value='all';$('j90Ownership').value='all';if($('j90Evidence'))$('j90Evidence').value='all';if($('j90Acquisition'))$('j90Acquisition').value='all';
 render();$('j90Search').focus();
}
function safe(s){return String(s||'').slice(0,120)}
function storageWarning(){return 'Saved collection data cannot be read safely. Changes are blocked to preserve your existing records. Use Export collection for an exact raw recovery copy.'}
function exportCollection(){
 let raw;
 try{raw=localStorage.getItem(STORE)}catch{message('Storage access is unavailable; this device cannot export a saved collection.');return}
 if(raw===null)raw=JSON.stringify({schema:1,...STATE,exported:new Date().toISOString()},null,2);
 let extension='json';
 try{JSON.parse(raw);readCollection()}catch{extension='txt'}
 const a=document.createElement('a'),url=URL.createObjectURL(new Blob([raw],{type:'text/plain;charset=utf-8'}));
 a.href=url;a.download='team-jura-collection-'+(game==='vehicles5'?vehicleWorld:game==='weapons'?weaponWorld:'vi')+(extension==='txt'?'-raw-recovery':'')+'.'+extension;
 a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 if(extension==='txt')message('Exact unreadable raw collection saved for recovery. No records were overwritten.');
}
function updateFlag(id,field,value){
 try{
  // Re-read just before each change so independent tabs/worlds retain newer rows.
  const latest=readCollection();
  if(value)latest[field][id]=true;else delete latest[field][id];
  if(value)delete latest[field==='owned'?'wishlist':'owned'][id];
  localStorage.setItem(STORE,JSON.stringify({...latest,updated:new Date().toISOString()}));
  adopt(latest);saveBlocked=false;render();
 }catch{saveBlocked=true;message(storageWarning())}
}
function message(s){$('galleryStatus').textContent=s}
function titleCase(s){return s.replace(/_mk(\d+)/g,' Mk $1').replace(/_([a-z])/g,(_,a)=>' '+a.toUpperCase()).replace(/([a-z])([0-9])/g,'$1 $2').replace(/\b[a-z]/g,c=>c.toUpperCase())}
const weaponNames={advancedrifle:'Advanced Rifle',assaultrifle:'Assault Rifle',assaultrifle_mk2:'Assault Rifle Mk II',assaultshotgun:'Assault Shotgun',assaultsmg:'Assault SMG',autoshotgun:'Auto Shotgun',battlerifle:'Battle Rifle',bullpuprifle:'Bullpup Rifle',bullpuprifle_mk2:'Bullpup Rifle Mk II',bullpupshotgun:'Bullpup Shotgun',carbinerifle:'Carbine Rifle',carbinerifle_mk2:'Carbine Rifle Mk II',combatmg:'Combat MG',combatmg_mk2:'Combat MG Mk II',combatpistol:'Combat Pistol',combatshotgun:'Combat Shotgun',compactlauncher:'Compact Grenade Launcher',compactrifle:'Compact Rifle',heavypistol:'Heavy Pistol',heavyrifle:'Heavy Rifle',heavyshotgun:'Heavy Shotgun',hominglauncher:'Homing Launcher',machinepistol:'Machine Pistol',marksmanpistol:'Marksman Pistol',marksmanrifle:'Marksman Rifle',marksmanrifle_mk2:'Marksman Rifle Mk II',microsmg:'Micro SMG',militaryrifle:'Military Rifle',pumpshotgun:'Pump Shotgun',pumpshotgun_mk2:'Pump Shotgun Mk II',specialcarbine:'Special Carbine',specialcarbine_mk2:'Special Carbine Mk II',sniperrifle:'Sniper Rifle',sawnoffshotgun:'Sawed-Off Shotgun',snspistol:'SNS Pistol',snspistol_mk2:'SNS Pistol Mk II',tecpistol:'Tactical SMG',vintagepistol:'Vintage Pistol',ceramicpistol:'Ceramic Pistol',doubleaction:'Double-Action Revolver',navyrevolver:'Navy Revolver',precisionrifle:'Precision Rifle',stungun:'Stun Gun',widowsmaker:'Widowmaker',unholyhellbringer:'Unholy Hellbringer',nightstick:'Nightstick',firework:'Firework Launcher',flaregun:'Flare Gun',gadgetpistol:'Perico Pistol',combatpdw:'Combat PDW',gusenberg:'Gusenberg Sweeper',dbshotgun:'Double Barrel Shotgun',emplauncher:'Compact EMP Launcher',gadgetpistol:'Perico Pistol',heavysniper:'Heavy Sniper',heavysniper_mk2:'Heavy Sniper Mk II',minigun:'Minigun',rpg:'RPG',sns_pistol:'SNS Pistol',sns_pistol_mk2:'SNS Pistol Mk II',petrolcan:'Jerry Can',battleaxe:'Battle Axe',pistol50:'Pistol .50',gunshot:'Gunshot'};
function weaponType(k){if(/knife|bat$|battleaxe|bottle|crowbar|dagger|golfclub|hammer|hatchet|knuckle|machete|nightstick|poolcue|switchblade|wrench|flashlight/.test(k))return 'Melee';if(/grenade|molotov|snowball|sticky|proximity|pipebomb|tear|smoke|petrol|hazard|fireextinguisher/.test(k))return 'Throwable';if(/launcher|rpg|railgun|minigun|widowsmaker|unholy|firework|ray/.test(k))return 'Heavy';if(/sniper|marksmanrifle|precisionrifle/.test(k))return 'Sniper';if(/shotgun|musket/.test(k))return 'Shotgun';if(/rifle|carbine/.test(k))return 'Rifle';if(/mg$|smg|pdw|gusenberg|machinepistol/.test(k))return 'Machine Gun / SMG';if(/pistol|revolver|stungun|flaregun/.test(k))return 'Pistol';return 'Other'}
function carType(k){const bike=window.JuraForge?.bikeDivision?.(vehicleWorld==='story'?'v-story':'v-online',k);if(bike==='bicycles')return 'Bicycles';if(bike==='scooters')return 'Scooters';if(/heli|buzzard|akula|annihilator|seasparrow|maverick|swift/.test(k))return 'Helicopters';if(/lazer|hydra|alkonost|blimp|cuban|avenger|^jet$|dodo|velum|mammatus|nimbus|luxor|shamal/.test(k))return 'Aircraft';if(/squalo|dinghy|tropic|marquis|tug|jetmax|seashark|avisa|speeder/.test(k))return 'Boats';if(/bati|akuma|faggio|bagger|vader|daemon|sovereign|ruffian|hakuchou|chimera|vortex|avarus/.test(k))return 'Motorcycles';if(/police|ambulance|firetruk|rhino|barracks|apc|insurgent|technical/.test(k))return 'Emergency / Military';if(/banshee|coquette|jester|kuruma|elegy|rapidgt|sultan|feltzer|alpha|schlagen/.test(k))return 'Sports';if(/adder|zentorno|emerus|entity|thrax|autarch|tezeract|t20|osiris|infernus|prototipo|deveste/.test(k))return 'Super';if(/dominator|gauntlet|buffalo|ruiner|tampa|phoenix|deviant|sabregt/.test(k))return 'Muscle';if(/bus$|mule|benson|barracks|trailer|boxville|flatbed|burrito|rumpo|speedo/.test(k))return 'Commercial';return 'Other Vehicles'}
function make(key,kind,name='',group='',archive=key,confidence='GTA V archive',brand=''){
 return {id:(kind==='weapons'&&weaponWorld==='story'?'weapons-story':kind==='vehicles5'&&vehicleWorld==='story'?'vehicles5-story':kind)+':'+key,name:name||titleCase(key),group:group||((kind==='weapons')?weaponType(key):carType(key)),kind,archive,confidence,brand,image:archive?ROOT+(kind==='weapons'?'weapons/weapon_':'vehicles/')+encodeURIComponent(archive)+'.webp':'',source:kind==='weapons'?'https://gtadb.net/weapons/':kind==='vehicles6'?'https://gtadb.net/gta-6/vehicles/':'https://gtadb.net/vehicles/'};
}
function key(r){return r.id}
function unique(rows){const used=new Set();return rows.filter(r=>r&&r.id&&!used.has(r.id)&&used.add(r.id))}
function backup(){exportCollection()}
function imageFallback(r){
 if(r.kind==='vehicles5'&&r.group==='Boats')return './art/elario-watercraft-showroom.webp';
 return './art/'+({weapons:'jura161-weapons.webp',vehicles5:'jura161-vehicles.webp',vehicles6:'jura161-vehicles6.webp'})[r.kind];
}
function formatState(id){return STATE.owned[id]?'Collected':STATE.wishlist[id]?'Wishlisted':'Not tracked'}
function setFlag(id,field,value){updateFlag(id,field,value)}
function el(t,c,v){const n=document.createElement(t);if(c)n.className=c;if(v!==undefined)n.textContent=v;return n}
function card(r){const root=el('article','j90-card'),photo=el('div','j90-photo');const img=document.createElement('img');const flags=el('div','j90-flags');let caption,photoStatus='Checking archive image…';
 root.dataset.recordId=r.id;
 if(r.kind==='vehicles6'){root.dataset.evidence=r.evidence;if(r.acquisition)root.dataset.acquisition=r.acquisition.kind;}
 flags.append(el('span','',r.kind==='vehicles6'?(window.JuraForge?.viEvidenceLabels?.[r.evidence]||'Community reference'):r.kind==='weapons'?'WEAPON':'VEHICLE'));
 img.loading='lazy';
 const captionText=()=>r.kind==='vehicles6'?r.confidence+(r.benefit?' · '+r.benefit.label:''):r.kind==='weapons'?(weaponWorld==='story'?'GTA V archive reference; availability in Story Mode needs per-item checking. ':'GTA Online archive ID; availability may vary by update and edition. ')+'Model ID '+r.archive:'Archive model ID '+r.archive+' · availability is not confirmed by an image.';
 function setPhotoState(state,text){
  root.dataset.imageState=state;photoStatus=text;
  if(caption)caption.textContent=captionText()+' · '+text;
 }
 function showConcept(){
  img.onload=null;
  setPhotoState('concept','Illustrative concept · exact archive image unavailable');
  img.alt='Original Elario '+(r.group==='Boats'?'watercraft':r.kind==='weapons'?'weapon showcase':'vehicle showcase')+' concept art; not an exact game render of '+r.name;
  img.onerror=()=>{
   img.onerror=null;img.remove();photo.classList.add('j90-image-unavailable');setPhotoState('unavailable','Image unavailable');
   const warning=el('span','j90-image-warning','Artwork unavailable · '+r.name);
   warning.setAttribute('role','status');photo.append(warning);
  };
  img.src=imageFallback(r);
  photo.classList.add('j90-fallback');flags.append(el('span','','Original Elario concept · illustrative'));
 }
 if(r.image&&r.kind!=='vehicles6'){
  img.alt='Archive reference for '+r.name;setPhotoState('pending','Checking archive image…');img.onload=()=>setPhotoState('archive','Archive reference image');img.onerror=showConcept;img.src=r.image;
 }else {showConcept();if(r.kind==='vehicles6')setPhotoState('concept','Original Leonida concept · not a game screenshot');}
 photo.append(img);if(STATE.owned[r.id])flags.append(el('span','j90-flag-done','✓ COLLECTED'));photo.append(flags);root.append(photo);
 const body=el('div','j90-card-body');body.append(el('div','j90-micro',r.brand?(r.brand+' · '+r.group):r.group),el('h3','',r.name));caption=el('p','j90-caption',captionText()+' · '+photoStatus);body.append(caption);if(r.acquisition)body.append(el('p','j90-acquisition',r.acquisition.label));const actions=el('div','j90-actions');const own=el('button','',STATE.owned[r.id]?'✓ Collected':'+ Collect');own.type='button';own.setAttribute('aria-pressed',String(!!STATE.owned[r.id]));own.onclick=()=>setFlag(r.id,'owned',!STATE.owned[r.id]);const wish=el('button','',STATE.wishlist[r.id]?'★ Wanted':'☆ Wishlist');wish.type='button';wish.setAttribute('aria-pressed',String(!!STATE.wishlist[r.id]));wish.onclick=()=>setFlag(r.id,'wishlist',!STATE.wishlist[r.id]);const cmp=el('button','',compare.includes(r.id)?'✓ Compare':'+ Compare');cmp.type='button';cmp.setAttribute('aria-pressed',String(compare.includes(r.id)));cmp.disabled=compare.length>=3&&!compare.includes(r.id);cmp.onclick=()=>{compare=compare.includes(r.id)?compare.filter(i=>i!==r.id):compare.length<3?[...compare,r.id]:compare;render()};actions.append(own,wish,cmp);if(r.kind==='vehicles5'&&/^[a-z0-9_]{1,65}$/.test(r.archive||'')){
 const park=el('a','j96-park-link',vehicleWorld==='story'?'▣ Explore Online Garage concept':'▣ Park in My Garage');
 park.href='./atlas93-garage.html?addModel='+encodeURIComponent(r.archive);
 actions.append(park);
} 
 if(r.kind==='vehicles5'&&/^[a-z0-9_]{1,65}$/.test(r.archive||'')){
  const forge=el('a','j96-park-link','◈ Customize virtual concept');
  forge.href='./atlas-vehicle-configurator.html?model='+encodeURIComponent(r.archive);actions.append(forge);
 }
 if(r.kind==='vehicles6'){
  const model=window.JuraForge?.viModelFromOwnership?.(r.id);
  if(model){const forge=el('a','j96-park-link','◈ Open Leonida Forge');forge.href='./atlas-vehicle-configurator.html?world=vi&model='+encodeURIComponent(model);actions.append(forge)}
 }
 body.append(actions);const links=el('div','j90-card-links');const source=el('a','','Research source ↗');source.href=r.source;source.target='_blank';source.rel='noopener noreferrer';links.append(source);if(r.image&&r.kind!=='vehicles6'){const archive=el('a','','Artwork source ↗');archive.href='https://github.com/Stuyk/gtav-image-archive';archive.target='_blank';archive.rel='noopener noreferrer';links.append(archive)}body.append(links);root.append(body);return root}
function renderComparison(){
 const panel=$('j90Compare');panel.replaceChildren();panel.hidden=!compare.length;
 for(const id of compare){
  const r=data.find(row=>row.id===id);if(!r)continue;
  const card=el('article','jura-compare-model');
  card.append(el('h3','',r.name));
  const details=el('dl','');
  function field(label,value){details.append(el('dt','',label),el('dd','',value))}
  field('Catalog class',r.group);
  const facts=game==='vehicles5'&&vehicleWorld==='online'?vehicleFacts[r.archive]:null;
  if(facts?.game==='GTA Online'){
   field('GTA Online class',facts.category);
   if(facts.manufacturer)field('Manufacturer',facts.manufacturer);
   if(Number.isFinite(facts.seats))field('Seats',String(facts.seats));
   if(Number.isFinite(facts.topSpeedMph))field('Tested top speed',facts.topSpeedMph+' mph');
   if(facts.drive)field('Drive',facts.drive);
   if(Number.isFinite(facts.priceUSD))field('Recorded price','GTA$'+facts.priceUSD.toLocaleString('en-US'));
  }else if(game==='vehicles5'){if(vehicleWorld==='story')field('Story availability','Individual gameplay verification needed');else field('GTA Online specs','No reviewed profile')}
  else if(game==='vehicles6'){field('Evidence',r.confidence);if(r.brand)field('Brand',r.brand);if(r.benefit)field('Edition / membership',r.benefit.label);if(r.acquisition)field('Registration',r.acquisition.label)}
  else{field('World',weaponWorld==='story'?'GTA V Story references':'GTA Online references');field('Model ID',r.archive)}
  card.append(details);
  if(facts?.sourceUrl?.startsWith('https://gtadb.net/')){
   const source=el('a','','GTA Online profile · '+facts.checkedAt);
   source.href=facts.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';card.append(source);
  }
  const remove=el('button','','Remove');remove.type='button';remove.setAttribute('aria-label','Remove '+r.name+' from comparison');
  remove.onclick=()=>{compare=compare.filter(x=>x!==id);render();
   const next=panel.querySelector('button')||$('j90Search');next.focus()};
  card.append(remove);panel.append(card);
 }
}
function filtered(){
 const terms=needle.split(/\s+/).filter(Boolean);
 return data.filter(r=>{
  const facts=game==='vehicles5'&&vehicleWorld==='online'?vehicleFacts[r.archive]:null;
  const haystack=[r.name,r.group,r.brand,r.archive,r.id,facts?.manufacturer,facts?.displayName,facts?.category,r.benefit?.label,r.confidence].join(' ').toLowerCase();
  return (acquisition==='all'||r.acquisition?.kind===acquisition)&&(evidence==='all'||r.evidence===evidence)&&(klass==='all'||r.group===klass)&&(ownership==='all'||(ownership==='owned'?STATE.owned[r.id]:STATE.wishlist[r.id]))&&terms.every(term=>haystack.includes(term));
 });
}
function render(){const categories=[...new Set(data.map(r=>r.group))].sort();const select=$('j90Class');if(select.dataset.signature!==categories.join('|')){select.replaceChildren(new Option('All classes','all'));categories.forEach(c=>select.add(new Option(c,c)));select.dataset.signature=categories.join('|')}klass=categories.includes(klass)?klass:'all';select.value=klass;const rows=filtered();page=Math.min(page,Math.max(0,Math.ceil(rows.length/PAGE)-1));
 $('j90Total').textContent=data.length.toLocaleString();$('j90Owned').textContent=data.filter(r=>STATE.owned[r.id]).length.toLocaleString();$('j90Wish').textContent=data.filter(r=>STATE.wishlist[r.id]).length.toLocaleString();$('j90Results').textContent=rows.length.toLocaleString()+' visible · '+(page+1)+' / '+Math.max(1,Math.ceil(rows.length/PAGE))+' pages';const root=$('j90Cards');root.replaceChildren();rows.slice(page*PAGE,(page+1)*PAGE).forEach(r=>root.append(card(r)));if(!rows.length)root.append(el('p','j90-empty','No records match. Try clearing a filter.'));$('j90Prev').disabled=page===0;$('j90Next').disabled=(page+1)*PAGE>=rows.length;renderComparison();syncLocation();
}
function initialize(seed){if(game==='weapons')data=seed.weapons.map(k=>make(k,'weapons',weaponNames[k]||''));else if(game==='vehicles5')data=seed.vehicles.filter(k=>vehicleWorld!=='story'||!(seed.onlineWorkshopVehicles||[]).includes(k)).map(k=>make(k,'vehicles5',vehicleWorld==='story'?'':window.JuraForge?.specialtyName?.(k)||''));else data=seed.vi.map(x=>{
  const id=x.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const vehicle=make(id,'vehicles6',x.displayName||x.name,x.type,x.archive,x.confidence,x.brand);
  if(typeof x.sourceUrl==='string'&&(x.sourceUrl==='https://fullsweepmap.com/wiki/gta6-vehicle-list/'||x.sourceUrl==='https://gtascoop.com/wiki/vehicles/'||(/^(https:\/\/www\.rockstargames\.com\/VI\/|https:\/\/gtadb\.net\/gta-6\/vehicles\/|https:\/\/gta6motors\.com\/(?:guides\/car-customization\/|vehicles\/)|https:\/\/www\.gtabase\.com\/gta-6\/vehicles\/|https:\/\/gta6wiki\.eu\/vehicles\/|https:\/\/www\.gta6map\.net\/wiki\/gta-6\/vehicles\/)/).test(x.sourceUrl)))vehicle.source=x.sourceUrl;
  vehicle.benefit=window.JuraForge?.viBenefit?.('vi',x.forgeId)||null;
  vehicle.acquisition=window.JuraForge?.viAcquisition?.('vi',x.forgeId)||null;
  vehicle.evidence=window.JuraForge?.viEvidence?.('vi',x.forgeId)||'community';
  return vehicle;
 });data=unique(data);render();if(saveBlocked){message(storageWarning());return}message(game==='vehicles6'?'Research catalog with original Leonida concept art. The known GTA VI roster is incomplete.':game==='weapons'?'GTA '+(weaponWorld==='story'?'V Story':'Online')+' image reference catalog loaded. Weapons are scoped by world for your saved progress; per-item availability still needs verification.':'GTA '+(vehicleWorld==='story'?'V Story':'Online')+' reference gallery loaded. Personal vehicle flags are separate by world; existing shared flags remain in Online.');}
async function discover(){if(game==='vehicles5'&&vehicleWorld==='story'){message('Story vehicle additions require individual evidence; the shared image archive cannot establish Story availability.');return}if(game==='vehicles6'){message('GTA VI records require individual evidence; the GTA V image archive cannot prove GTA VI inclusion.');return}const btn=$('j90Discover');btn.disabled=true;message('Checking source archive for additional images and model IDs…');try{const c=new AbortController(),timer=setTimeout(()=>c.abort(),14000);let r=await fetch(ARCHIVE,{signal:c.signal});clearTimeout(timer);if(!r.ok)throw Error('Archive request HTTP '+r.status);let j=await r.json();if(!Array.isArray(j.tree))throw Error('Archive format changed');const folder=game==='weapons'?'weapons/':'vehicles/',re=game==='weapons'?/^weapons\/weapon_([a-z0-9_]+)\.webp$/:/^vehicles\/([a-z0-9_]+)\.webp$/;const imported=[];for(const f of j.tree){const m=f.path?.match(re);if(m)imported.push(make(m[1],game,game==='weapons'?(weaponNames[m[1]]||''):''))}data=unique([...data,...imported]);sourcesReady=true;page=0;render();message('Source archive indexed: '+imported.length+' picture files. These are image IDs, not a verified complete official vehicle/weapon roster.');}catch(err){message('Archive discovery unavailable ('+err.message+'). Curated starting catalog remains usable.')}finally{btn.disabled=false}}
function init(){
 applyLocation();
 $('j90Search').maxLength=120;
 resetFilters=el('button','','Clear filters');resetFilters.type='button';resetFilters.id='j408ClearFilters';resetFilters.hidden=true;resetFilters.onclick=clearFilters;
 $('j90Export').before(resetFilters);
 if($('j90Evidence'))$('j90Evidence').addEventListener('change',event=>{evidence=Object.hasOwn(window.JuraForge?.viEvidenceLabels||{},event.target.value)?event.target.value:'all';page=0;if(data.length)render()});
 if($('j90Acquisition'))$('j90Acquisition').addEventListener('change',event=>{acquisition=Object.hasOwn(window.JuraForge?.viAcquisitionLabels||{},event.target.value)?event.target.value:'all';page=0;if(data.length)render()});
 window.addEventListener('popstate',()=>{applyLocation();if(data.length)render()});
 if(game==='vehicles5')fetch('./data/atlas-vehicle-intel.json').then(response=>{
  if(!response.ok)throw Error('Vehicle facts unavailable');
  return response.json();
 }).then(pack=>{vehicleFacts=pack.vehicles||{};if(data.length)render()}).catch(()=>{});
 document.title=(game==='weapons'?(weaponWorld==='story'?'GTA V Story Weapon References':'GTA Online Weapon Armory'):game==='vehicles5'?(vehicleWorld==='story'?'GTA V Story Vehicle Archive':'GTA Online Vehicle Archive'):CATEGORY[game])+' · GTAE';$('j90Header').textContent=game==='weapons'?(weaponWorld==='story'?'GTA V Story Armory':'GTA Online Armory'):game==='vehicles5'?(vehicleWorld==='story'?'GTA V STORY MOTORPOOL':'GTA ONLINE MOTORPOOL'):CATEGORY[game];$('j90Intro').textContent=game==='weapons'?(weaponWorld==='story'?'GTA V Story weapon image references with separate local review progress. GTA Online-only equipment is NOT confirmed as a Story weapon without game-specific evidence.':'GTA Online weapon image references, searches, collection and wishlist. GTA V Story progress stays in its own world.') :game==='vehicles5'?'GTA '+(vehicleWorld==='story'?'V Story':'Online')+' image archive. Search by class; this world keeps its own private collected and wishlist flags. Image presence never proves edition availability.':'Explore Leonida vehicle research. Cards show evidence for each entry with original catalog concept art.';if(game==='weapons'||game==='vehicles5'){const active=game==='weapons'?weaponWorld:vehicleWorld;document.body.dataset.activeWorld=active;document.querySelectorAll('.j192-world-link').forEach(a=>a.setAttribute('aria-current',String(a.dataset.world===active)));}$('j90Search').addEventListener('input',e=>{needle=e.target.value.slice(0,120).trim().toLowerCase();page=0;if(data.length)render()});$('j90Class').addEventListener('change',e=>{klass=e.target.value;page=0;if(data.length)render()});$('j90Ownership').addEventListener('change',e=>{ownership=e.target.value;page=0;if(data.length)render()});$('j90Prev').onclick=()=>{page--;render();window.scrollTo({top:100,behavior:'smooth'})};$('j90Next').onclick=()=>{page++;render();window.scrollTo({top:100,behavior:'smooth'})};$('j90Export').onclick=backup;window.addEventListener('storage',event=>{if(event.key!==STORE)return;try{adopt(readCollection());saveBlocked=false;render();message('Collection progress refreshed from another tab.')}catch{saveBlocked=true;message(storageWarning())}});$('j90Discover').onclick=discover;if(game==='vehicles6'||(game==='vehicles5'&&vehicleWorld==='story'))$('j90Discover').hidden=true;fetch('./atlas90-seed.json').then(r=>{if(!r.ok)throw Error('Seed data unavailable ('+r.status+')');return r.json()}).then(initialize).catch(e=>{message(e.message)});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
