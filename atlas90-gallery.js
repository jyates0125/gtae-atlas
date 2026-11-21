/* Team Jura Atlas 9.0: image-first collection gallery, original UI and progress model.
 * Models GTA V archive imagery as reference art; GTA VI reference photos are NEVER presented as verified VI screenshots.
 * Browser loads existing Team Jura catalogs when present; avoids overwriting existing inventory keys.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);const game=document.body.dataset.gallery||'weapons';
// GTA V Story and GTA Online retain separate collection choices. Older
// weapons:<model> saves remain assigned to GTA Online; no destructive migration.
const weaponWorld=game==='weapons'&&new URLSearchParams(location.search).get('world')==='story'?'story':'online';

const ROOT='https://cdn.jsdelivr.net/gh/Stuyk/gtav-image-archive@main/';
const ARCHIVE='https://api.github.com/repos/Stuyk/gtav-image-archive/git/trees/main?recursive=1';
const CATEGORY={weapons:'WEAPON ARMORY',vehicles5:'GTA V + ONLINE MOTORPOOL',vehicles6:'GTA VI VEHICLE INTELLIGENCE'};
const STORE='team-jura-atlas90-collection-v1';const STATE={owned:{},wishlist:{},note:{}};
try{let old=JSON.parse(localStorage.getItem(STORE)||'null');if(old&&old.schema===1){for(const key of Object.keys(STATE))if(old[key]&&typeof old[key]==='object'&&!Array.isArray(old[key]))STATE[key]=old[key]}}catch{}
let data=[],needle='',klass='all',ownership='all',page=0,view='grid',compare=[],sourcesReady=false;
const PAGE=60;
let vehicleFacts={};
function safe(s){return String(s||'').slice(0,120)}
function store(){try{localStorage.setItem(STORE,JSON.stringify({schema:1,...STATE,updated:new Date().toISOString()}))}catch{message('Browser storage unavailable; export your progress now.')}}
function message(s){$('galleryStatus').textContent=s}
function titleCase(s){return s.replace(/_mk(\d+)/g,' Mk $1').replace(/_([a-z])/g,(_,a)=>' '+a.toUpperCase()).replace(/([a-z])([0-9])/g,'$1 $2').replace(/\b[a-z]/g,c=>c.toUpperCase())}
const weaponNames={advancedrifle:'Advanced Rifle',assaultrifle:'Assault Rifle',assaultrifle_mk2:'Assault Rifle Mk II',assaultshotgun:'Assault Shotgun',assaultsmg:'Assault SMG',autoshotgun:'Auto Shotgun',battlerifle:'Battle Rifle',bullpuprifle:'Bullpup Rifle',bullpuprifle_mk2:'Bullpup Rifle Mk II',bullpupshotgun:'Bullpup Shotgun',carbinerifle:'Carbine Rifle',carbinerifle_mk2:'Carbine Rifle Mk II',combatmg:'Combat MG',combatmg_mk2:'Combat MG Mk II',combatpistol:'Combat Pistol',combatshotgun:'Combat Shotgun',compactlauncher:'Compact Grenade Launcher',compactrifle:'Compact Rifle',heavypistol:'Heavy Pistol',heavyrifle:'Heavy Rifle',heavyshotgun:'Heavy Shotgun',hominglauncher:'Homing Launcher',machinepistol:'Machine Pistol',marksmanpistol:'Marksman Pistol',marksmanrifle:'Marksman Rifle',marksmanrifle_mk2:'Marksman Rifle Mk II',microsmg:'Micro SMG',militaryrifle:'Military Rifle',pumpshotgun:'Pump Shotgun',pumpshotgun_mk2:'Pump Shotgun Mk II',specialcarbine:'Special Carbine',specialcarbine_mk2:'Special Carbine Mk II',sniperrifle:'Sniper Rifle',sawnoffshotgun:'Sawed-Off Shotgun',snspistol:'SNS Pistol',snspistol_mk2:'SNS Pistol Mk II',tecpistol:'Tactical SMG',vintagepistol:'Vintage Pistol',ceramicpistol:'Ceramic Pistol',doubleaction:'Double-Action Revolver',navyrevolver:'Navy Revolver',precisionrifle:'Precision Rifle',stungun:'Stun Gun',widowsmaker:'Widowmaker',unholyhellbringer:'Unholy Hellbringer',nightstick:'Nightstick',firework:'Firework Launcher',flaregun:'Flare Gun',gadgetpistol:'Perico Pistol',combatpdw:'Combat PDW',gusenberg:'Gusenberg Sweeper',dbshotgun:'Double Barrel Shotgun',emplauncher:'Compact EMP Launcher',gadgetpistol:'Perico Pistol',heavysniper:'Heavy Sniper',heavysniper_mk2:'Heavy Sniper Mk II',minigun:'Minigun',rpg:'RPG',sns_pistol:'SNS Pistol',sns_pistol_mk2:'SNS Pistol Mk II',petrolcan:'Jerry Can',battleaxe:'Battle Axe',pistol50:'Pistol .50',gunshot:'Gunshot'};
function weaponType(k){if(/knife|bat$|battleaxe|bottle|crowbar|dagger|golfclub|hammer|hatchet|knuckle|machete|nightstick|poolcue|switchblade|wrench|flashlight/.test(k))return 'Melee';if(/grenade|molotov|snowball|sticky|proximity|pipebomb|tear|smoke|petrol|hazard|fireextinguisher/.test(k))return 'Throwable';if(/launcher|rpg|railgun|minigun|widowsmaker|unholy|firework|ray/.test(k))return 'Heavy';if(/sniper|marksmanrifle|precisionrifle/.test(k))return 'Sniper';if(/shotgun|musket/.test(k))return 'Shotgun';if(/rifle|carbine/.test(k))return 'Rifle';if(/mg$|smg|pdw|gusenberg|machinepistol/.test(k))return 'Machine Gun / SMG';if(/pistol|revolver|stungun|flaregun/.test(k))return 'Pistol';return 'Other'}
function carType(k){if(/heli|buzzard|akula|annihilator|seasparrow/.test(k))return 'Helicopters';if(/lazer|hydra|alkonost|blimp|cuban|avenger|^jet$|dodo|velum|mammatus|nimbus/.test(k))return 'Aircraft';if(/squalo|dinghy|tropic|marquis|tug|jetmax|seashark|avisa/.test(k))return 'Boats';if(/bati|akuma|faggio|bagger|vader|daemon|sovereign|ruffian|hakuchou|chimera|vortex|avarus/.test(k))return 'Motorcycles';if(/police|ambulance|firetruk|rhino|barracks|apc|insurgent|technical/.test(k))return 'Emergency / Military';if(/banshee|coquette|jester|kuruma|elegy|rapidgt|sultan|feltzer|alpha|schlagen/.test(k))return 'Sports';if(/adder|zentorno|emerus|entity|thrax|autarch|tezeract|t20|osiris|infernus|prototipo|deveste/.test(k))return 'Super';if(/dominator|gauntlet|buffalo|ruiner|tampa|phoenix|deviant|sabregt/.test(k))return 'Muscle';if(/bus$|mule|benson|barracks|trailer|boxville|flatbed|burrito|rumpo|speedo/.test(k))return 'Commercial';return 'Other Vehicles'}
function make(key,kind,name='',group='',archive=key,confidence='GTA V archive',brand=''){
 return {id:(kind==='weapons'&&weaponWorld==='story'?'weapons-story':kind)+':'+key,name:name||titleCase(key),group:group||((kind==='weapons')?weaponType(key):carType(key)),kind,archive,confidence,brand,image:archive?ROOT+(kind==='weapons'?'weapons/weapon_':'vehicles/')+encodeURIComponent(archive)+'.webp':'',source:kind==='weapons'?'https://gtadb.net/weapons/':kind==='vehicles6'?'https://gtadb.net/gta-6/vehicles/':'https://gtadb.net/vehicles/'};
}
function key(r){return r.id}
function unique(rows){const used=new Set();return rows.filter(r=>r&&r.id&&!used.has(r.id)&&used.add(r.id))}
function backup(){const a=document.createElement('a'),blob=new Blob([JSON.stringify({schema:1,...STATE,exported:new Date().toISOString()},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);a.href=url;a.download='team-jura-'+game+'-collection.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function imageFallback(r){
 if(r.kind==='vehicles5'&&r.group==='Boats')return './art/elario-watercraft-showroom.webp';
 return './art/'+({weapons:'jura161-weapons.webp',vehicles5:'jura161-vehicles.webp',vehicles6:'jura161-vehicles6.webp'})[r.kind];
}
function formatState(id){return STATE.owned[id]?'Collected':STATE.wishlist[id]?'Wishlisted':'Not tracked'}
function setFlag(id,field,value){if(value)STATE[field][id]=true;else delete STATE[field][id];if(field==='owned'&&value)delete STATE.wishlist[id];if(field==='wishlist'&&value)delete STATE.owned[id];store();render()}
function el(t,c,v){const n=document.createElement(t);if(c)n.className=c;if(v!==undefined)n.textContent=v;return n}
function card(r){const root=el('article','j90-card'),photo=el('div','j90-photo');const img=document.createElement('img');const flags=el('div','j90-flags');
 flags.append(el('span','',r.kind==='vehicles6'?'VI RESEARCH':r.kind==='weapons'?'WEAPON':'VEHICLE'));
 img.loading='lazy';
 function showConcept(){
  img.alt='Original Elario '+(r.group==='Boats'?'watercraft':r.kind==='weapons'?'weapon showcase':'vehicle showcase')+' concept art; not an exact game render of '+r.name;
  img.onerror=()=>{
   img.onerror=null;img.remove();photo.classList.add('j90-image-unavailable');
   const warning=el('span','j90-image-warning','Artwork unavailable · '+r.name);
   warning.setAttribute('role','status');photo.append(warning);
  };
  img.src=imageFallback(r);
  photo.classList.add('j90-fallback');flags.append(el('span','','Original Elario concept · illustrative'));
 }
 if(r.image&&r.kind!=='vehicles6'){
  img.alt='Archive reference for '+r.name;img.onerror=showConcept;img.src=r.image;
 }else showConcept();
 photo.append(img);if(STATE.owned[r.id])flags.append(el('span','j90-flag-done','✓ COLLECTED'));photo.append(flags);root.append(photo);
 const body=el('div','j90-card-body');body.append(el('div','j90-micro',r.brand?(r.brand+' · '+r.group):r.group),el('h3','',r.name));body.append(el('p','j90-caption',r.kind==='vehicles6'?r.confidence:r.kind==='weapons'?(weaponWorld==='story'?'GTA V archive reference; availability in Story Mode needs per-item checking. ':'GTA Online archive reference; availability may depend on update and edition. ')+ 'Model ID '+r.archive:'Archive reference image · game-model ID '+r.archive));const actions=el('div','j90-actions');const own=el('button','',STATE.owned[r.id]?'✓ Collected':'+ Collect');own.type='button';own.setAttribute('aria-pressed',String(!!STATE.owned[r.id]));own.onclick=()=>setFlag(r.id,'owned',!STATE.owned[r.id]);const wish=el('button','',STATE.wishlist[r.id]?'★ Wanted':'☆ Wishlist');wish.type='button';wish.setAttribute('aria-pressed',String(!!STATE.wishlist[r.id]));wish.onclick=()=>setFlag(r.id,'wishlist',!STATE.wishlist[r.id]);const cmp=el('button','',compare.includes(r.id)?'✓ Compare':'+ Compare');cmp.type='button';cmp.setAttribute('aria-pressed',String(compare.includes(r.id)));cmp.disabled=compare.length>=3&&!compare.includes(r.id);cmp.onclick=()=>{compare=compare.includes(r.id)?compare.filter(i=>i!==r.id):compare.length<3?[...compare,r.id]:compare;render()};actions.append(own,wish,cmp);if(r.kind==='vehicles5'&&/^[a-z0-9_]{1,65}$/.test(r.archive||'')){
 const park=el('a','j96-park-link','▣ Park in My Garage');
 park.href='./atlas93-garage.html?addModel='+encodeURIComponent(r.archive);
 actions.append(park);
} body.append(actions);const links=el('div','j90-card-links');const source=el('a','','Research source ↗');source.href=r.source;source.target='_blank';source.rel='noopener noreferrer';links.append(source);if(r.image&&r.kind!=='vehicles6'){const archive=el('a','','Artwork source ↗');archive.href='https://github.com/Stuyk/gtav-image-archive';archive.target='_blank';archive.rel='noopener noreferrer';links.append(archive)}body.append(links);root.append(body);return root}
function renderComparison(){
 const panel=$('j90Compare');panel.replaceChildren();panel.hidden=!compare.length;
 for(const id of compare){
  const r=data.find(row=>row.id===id);if(!r)continue;
  const card=el('article','jura-compare-model');
  card.append(el('h3','',r.name));
  const details=el('dl','');
  function field(label,value){details.append(el('dt','',label),el('dd','',value))}
  field('Catalog class',r.group);
  const facts=game==='vehicles5'?vehicleFacts[r.archive]:null;
  if(facts?.game==='GTA Online'){
   field('GTA Online class',facts.category);
   if(facts.manufacturer)field('Manufacturer',facts.manufacturer);
   if(Number.isFinite(facts.seats))field('Seats',String(facts.seats));
   if(Number.isFinite(facts.topSpeedMph))field('Tested top speed',facts.topSpeedMph+' mph');
   if(facts.drive)field('Drive',facts.drive);
   if(Number.isFinite(facts.priceUSD))field('Recorded price','GTA$'+facts.priceUSD.toLocaleString('en-US'));
  }else if(game==='vehicles5'){field('GTA Online specs','No reviewed profile')}
  else if(game==='vehicles6'){field('Evidence',r.confidence);if(r.brand)field('Brand',r.brand)}
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
function filtered(){return data.filter(r=>(klass==='all'||r.group===klass)&&(ownership==='all'||(ownership==='owned'?STATE.owned[r.id]:STATE.wishlist[r.id]))&&(!needle||[r.name,r.group,r.brand,r.archive].join(' ').toLowerCase().includes(needle)))}
function render(){const rows=filtered();page=Math.min(page,Math.max(0,Math.ceil(rows.length/PAGE)-1));const categories=[...new Set(data.map(r=>r.group))].sort();const select=$('j90Class');if(select.dataset.signature!==categories.join('|')){const prev=klass;select.replaceChildren(new Option('All classes','all'));categories.forEach(c=>select.add(new Option(c,c)));select.value=categories.includes(prev)?prev:'all';klass=select.value;select.dataset.signature=categories.join('|')}
 $('j90Total').textContent=data.length.toLocaleString();$('j90Owned').textContent=data.filter(r=>STATE.owned[r.id]).length.toLocaleString();$('j90Wish').textContent=data.filter(r=>STATE.wishlist[r.id]).length.toLocaleString();$('j90Results').textContent=rows.length.toLocaleString()+' visible · '+(page+1)+' / '+Math.max(1,Math.ceil(rows.length/PAGE))+' pages';const root=$('j90Cards');root.replaceChildren();rows.slice(page*PAGE,(page+1)*PAGE).forEach(r=>root.append(card(r)));if(!rows.length)root.append(el('p','j90-empty','No records match. Try clearing a filter.'));$('j90Prev').disabled=page===0;$('j90Next').disabled=(page+1)*PAGE>=rows.length;renderComparison();
}
function initialize(seed){if(game==='weapons')data=seed.weapons.map(k=>make(k,'weapons',weaponNames[k]||''));else if(game==='vehicles5')data=seed.vehicles.map(k=>make(k,'vehicles5'));else data=seed.vi.map(x=>make(x.name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),'vehicles6',x.name,x.type,x.archive,x.confidence,x.brand));data=unique(data);render();message(game==='vehicles6'?'Research catalog with original Leonida concept art. The known GTA VI roster is incomplete.':game==='weapons'?'GTA '+(weaponWorld==='story'?'V Story':'Online')+' image reference catalog loaded. Weapons are scoped by world for your saved progress; per-item availability still needs verification.':'Picture catalog loaded. Optional archive discovery can add supported image IDs.');}
async function discover(){if(game==='vehicles6'){message('GTA VI records require individual evidence; the GTA V image archive cannot prove GTA VI inclusion.');return}const btn=$('j90Discover');btn.disabled=true;message('Checking source archive for additional images and model IDs…');try{const c=new AbortController(),timer=setTimeout(()=>c.abort(),14000);let r=await fetch(ARCHIVE,{signal:c.signal});clearTimeout(timer);if(!r.ok)throw Error('Archive request HTTP '+r.status);let j=await r.json();if(!Array.isArray(j.tree))throw Error('Archive format changed');const folder=game==='weapons'?'weapons/':'vehicles/',re=game==='weapons'?/^weapons\/weapon_([a-z0-9_]+)\.webp$/:/^vehicles\/([a-z0-9_]+)\.webp$/;const imported=[];for(const f of j.tree){const m=f.path?.match(re);if(m)imported.push(make(m[1],game,game==='weapons'?(weaponNames[m[1]]||''):''))}data=unique([...data,...imported]);sourcesReady=true;page=0;render();message('Source archive indexed: '+imported.length+' picture files. These are image IDs, not a verified complete official vehicle/weapon roster.');}catch(err){message('Archive discovery unavailable ('+err.message+'). Curated starting catalog remains usable.')}finally{btn.disabled=false}}
function init(){
 if(game==='vehicles5')fetch('./data/atlas-vehicle-intel.json').then(response=>{
  if(!response.ok)throw Error('Vehicle facts unavailable');
  return response.json();
 }).then(pack=>{vehicleFacts=pack.vehicles||{};renderComparison()}).catch(()=>{});
 document.title=(game==='weapons'?(weaponWorld==='story'?'GTA V Story Weapon References':'GTA Online Weapon Armory'):CATEGORY[game])+' · Team Jura Atlas';$('j90Header').textContent=game==='weapons'?(weaponWorld==='story'?'GTA V Story Armory':'GTA Online Armory'):CATEGORY[game];$('j90Intro').textContent=game==='weapons'?(weaponWorld==='story'?'GTA V Story weapon image references with separate local review progress. GTA Online-only equipment is NOT confirmed as a Story weapon without game-specific evidence.':'GTA Online weapon image references, searches, collection and wishlist. GTA V Story progress stays in its own world.') :game==='vehicles5'?'Pictured GTA V/Online vehicle archive, searchable by class with a private garage collection and wishlist.':'Explore Leonida vehicle research. Cards show evidence for each entry with original catalog concept art.';if(game==='weapons'){document.body.dataset.activeWorld=weaponWorld;document.querySelectorAll('.j192-world-link').forEach(a=>a.setAttribute('aria-current',String(a.dataset.world===weaponWorld)));}$('j90Search').addEventListener('input',e=>{needle=e.target.value.trim().toLowerCase();page=0;render()});$('j90Class').addEventListener('change',e=>{klass=e.target.value;page=0;render()});$('j90Ownership').addEventListener('change',e=>{ownership=e.target.value;page=0;render()});$('j90Prev').onclick=()=>{page--;render();window.scrollTo({top:100,behavior:'smooth'})};$('j90Next').onclick=()=>{page++;render();window.scrollTo({top:100,behavior:'smooth'})};$('j90Export').onclick=backup;$('j90Discover').onclick=discover;if(game==='vehicles6')$('j90Discover').hidden=true;fetch('./atlas90-seed.json').then(r=>{if(!r.ok)throw Error('Seed data unavailable ('+r.status+')');return r.json()}).then(initialize).catch(e=>{message(e.message)});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
