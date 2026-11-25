/* Team Jura Atlas 9.3: personal pictured GTA V/Online garage.
   Respects existing Atlas 9.0 owned/wishlist localStorage; custom build data separate.
   Neutral archive renders are NOT recolored into fabricated official screenshots. */
(()=>{'use strict';
const $=id=>document.getElementById(id),S='team-jura-atlas90-collection-v1',META='team-jura-atlas93-garage-v1',CACHE='team-jura-atlas93-archive-v1';
const BASE='https://cdn.jsdelivr.net/gh/Stuyk/gtav-image-archive@main/vehicles/';
const TREE='https://api.github.com/repos/Stuyk/gtav-image-archive/git/trees/main?recursive=1';
const PAINTS=[['Midnight','#121727'],['Pearl White','#eaeef2'],['Metallic Orange','#f58b26'],['Sunburst Yellow','#ffce38'],['Racing Red','#e44145'],['Electric Blue','#249de5'],['Emerald','#36a06a'],['Neon Purple','#8b40e9'],['Hot Pink','#df4c9b'],['Graphite','#5b6270']];
const safeParse=(key,def)=>{try{const x=JSON.parse(localStorage.getItem(key)||'null');return x&&typeof x==='object'&&!Array.isArray(x)?x:def}catch{return def}};
let gallery=safeParse(S,{schema:1,owned:{},wishlist:{},note:{}});
for(const k of ['owned','wishlist','note'])if(!gallery[k]||typeof gallery[k]!=='object')gallery[k]={};
let meta=safeParse(META,{schema:1,garages:['Main Garage','Nightclub','Office Garage'],vehicles:{}});
if(!Array.isArray(meta.garages))meta.garages=['Main Garage'];if(!meta.vehicles||typeof meta.vehicles!=='object')meta.vehicles={};
meta.garages=[...new Set(meta.garages.filter(x=>typeof x==='string').map(x=>x.trim()).filter(Boolean))].slice(0,40);
let records=[],shown=[],selected='',page=0,intel={};const PER_PAGE=24;
const f=x=>String(x??'').trim();const text=(id,value)=>{if($(id))$(id).textContent=value};
// Keep independently edited Garage metadata and Atlas ownership in separate saves.
const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function readChecked(key,fallback,valid){
 const raw=localStorage.getItem(key);
 if(raw===null)return fallback;
 const value=JSON.parse(raw);
 if(!valid(value))throw Error('Invalid saved collection');
 return value;
}
// Older guest saves may omit optional fields; preserve them without accepting
// malformed arrays, nulls or corrupt JSON as an empty collection.
function readLiveMeta(){
 const latest=readChecked(META,{schema:1,garages:['Main Garage'],vehicles:{}},x=>
  plain(x)&&(x.garages===undefined||Array.isArray(x.garages))&&
  (x.vehicles===undefined||plain(x.vehicles)&&Object.values(x.vehicles).every(plain)));
 return {...latest,garages:latest.garages??['Main Garage'],vehicles:latest.vehicles??{}};
}
function readLiveGallery(){
 const latest=readChecked(S,{schema:1,owned:{},wishlist:{},note:{}},x=>
  plain(x)&&(x.owned===undefined||plain(x.owned))&&
  (x.wishlist===undefined||plain(x.wishlist))&&(x.note===undefined||plain(x.note)));
 return {...latest,owned:latest.owned??{},wishlist:latest.wishlist??{},note:latest.note??{}};
}
function saveOwnedMark(id,shouldOwn){
 try{
  const latest=readLiveGallery();
  const owned={...latest.owned},key='vehicles5:'+id;
  if(shouldOwn)owned[key]=true;else delete owned[key];
  const next={...latest,owned,schema:1,updated:new Date().toISOString()};
  localStorage.setItem(S,JSON.stringify(next));
  gallery=next;
  return true;
 }catch(e){
  notice('Ownership not saved: collection data could not be read safely. Export a backup before retrying.');
  return false;
 }
}
function saveGarageName(name,remove=false){
 try{
  const latest=readLiveMeta();
  if(Object.values(latest.vehicles).some(v=>!plain(v)))throw Error('Malformed vehicle entry');
  let names=[...new Set(latest.garages.filter(x=>typeof x==='string').map(x=>x.trim()).filter(Boolean))];
  if(remove){
   if(name==='Main Garage')throw Error('Main Garage cannot be removed');
   if(Object.values(latest.vehicles).some(v=>v.garage===name)){
    notice('Move vehicles out of this garage before removing it.');return false;
   }
   names=names.filter(x=>x!==name);
  }else{
   if(names.includes(name)){notice('This garage already exists.');return false}
   if(names.length>=40){notice('Maximum 40 garage names.');return false}
   names.push(name);
  }
  const next={...latest,garages:names,schema:1,updated:new Date().toISOString()};
  localStorage.setItem(META,JSON.stringify(next));
  meta=next;
  return true;
 }catch(e){
  notice('Garage locations not saved: stored data could not be read safely. Export a backup before retrying.');
  return false;
 }
}
function notice(msg){const e=$('garageNotice');if(e)e.textContent=msg;else console.info('[Team Jura Garage]',msg)}
function nice(s){return String(s).replace(/([a-z])([0-9])/g,'$1 $2').replace(/_/g,' ').replace(/\b[a-z]/g,x=>x.toUpperCase())}
function kind(id){
 const known=intel[id]?.category;if(known)return known;
 if(/^(bati|hakuchou|sanchez|vader|hexer|faggio|akuma|vortex|oppressor|daemon|ruffian|sovereign|bagger|avarus)/.test(id))return 'Motorcycles';
 if(/^(buzzard|akula|hunter|annihilator|frogger|valkyrie|maverick|cargobob|seasparrow|sparrow)/.test(id))return 'Helicopters';
 if(/^(alkonost|lazer|hydra|avenger|luxor|velum|jet$|besra|cargoplane|blimp|dodo|cuban|nimbus|mammatus|titan)/.test(id))return 'Planes & Aircraft';
 if(/^(dinghy|squalo|marquis|tropic|tug|speeder|seashark|avisa|kosatka|submersible|kraken|jetmax|suntrap)/.test(id))return 'Boats & Watercraft';
 if(/^(bison|guardian|sadler|sandking|rebel|bobcatxl|burrito|mule|rumpo|speedo|slamvan|yosemite|technical|flatbed|benson)/.test(id))return 'Trucks & Utility';
 if(/^(dubsta|mesa|patriot|riata|habanero|rocoto|baller|granger|landstalker|serrano|fq2|radius|gresley|huntley|cavalcade|aleutian|astron)/.test(id))return 'SUVs & Off-Road';
 if(/^(rhino|apc|insurgent|ambulance|firetruk|barracks|halftrack|lazer|police)/.test(id))return 'Emergency & Military';
 if(/^(adder|zentorno|emerus|entity|t20|osiris|infernus|autarch|nero|cyclone|tyrant|thrax|tezeract|deveste|prototipo|tempesta)/.test(id))return 'Super';
 if(/^(banshee|jester|coquette|kuruma|sultan|elegy|feltzer|alpha|paragon|schlagen|schafter|buffalo|rapidgt|seven70|massacro)/.test(id))return 'Sports & Coupes';
 if(/^(dominator|gauntlet|ruiner|tampa|phoenix|vigero|sabregt|dukes|hotknife)/.test(id))return 'Muscle';
 return 'Unclassified model';
}
function saveOwners(id,shouldOwn){const ok=saveOwnedMark(id,shouldOwn);if(ok)text('ownedCount',Object.keys(gallery.owned).filter(x=>x.startsWith('vehicles5:')&&gallery.owned[x]).length);return ok}
function vehicle(id){return meta.vehicles[id]||{garage:'',paint:'Graphite',secondary:'Midnight',note:'',favorite:false,plate:''}}
function setVehicle(id,v){
 // Forge and Garage may be open in different tabs. Merge the newest saved model
 // rather than writing the stale Garage tab's entire collection back to storage.
 try{
  const latest=readLiveMeta();
  if(!latest||typeof latest!=='object'||Array.isArray(latest)||!latest.vehicles||typeof latest.vehicles!=='object'||Array.isArray(latest.vehicles))throw Error('Invalid Garage storage');
  const previous=latest.vehicles[id];
  if(previous!==undefined&&(!previous||typeof previous!=='object'||Array.isArray(previous)))throw Error('Invalid saved vehicle');
  const next={...latest,vehicles:{...latest.vehicles,[id]:{...(previous||vehicle(id)),...v}},schema:1,updated:new Date().toISOString()};
  localStorage.setItem(META,JSON.stringify(next));
  meta=next;
  return true;
 }catch(e){notice('Garage save blocked: stored data could not be read safely. Export your backup before retrying.');return false}
}
function modelInfo(id){const stat=intel[id];return {id,name:stat?.displayName||window.JuraForge?.specialtyName?.(id)||nice(id),type:kind(id),spec:stat||null,image:BASE+encodeURIComponent(id)+'.webp'}}
function getPhoto(r){const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.alt='GTA V archive reference render: '+r.name;img.src=r.image;img.onerror=()=>{img.onerror=null;img.src=r.type==='Boats & Watercraft'?'./art/elario-watercraft-showroom.webp':'./art/jura161-vehicles.webp';img.alt='Original Elario vehicle-showroom concept; a verified model-specific reference render is not available for '+r.name};return img}
function paintColor(name){return typeof name==='string'&&/^#[0-9a-f]{6}$/i.test(name)?name:PAINTS.find(([n])=>n===name)?.[1]||'#5b6270'}
function garages(){const select=$('garageLocation');const prior=select.value;select.replaceChildren(new Option('All locations',''));for(const g of meta.garages)select.add(new Option(g,g));select.value=meta.garages.includes(prior)?prior:'';
 const root=$('garageList');root.replaceChildren();for(const g of meta.garages){const row=document.createElement('div');row.className='location-row';const label=document.createElement('span');const count=Object.values(meta.vehicles).filter(x=>x.garage===g).length;label.textContent=g+' · '+count;row.append(label);if(g!=='Main Garage'){const del=document.createElement('button');del.textContent='×';del.title='Remove empty garage';del.setAttribute('aria-label','Remove empty garage '+g);del.type='button';del.onclick=()=>{if(saveGarageName(g,true)){garages();paint()}};row.append(del)}root.append(row)} }
function card(r){const saved=vehicle(r.id),owned=!!gallery.owned['vehicles5:'+r.id];const c=document.createElement('article');c.className='card'+(owned?' owned':'');const photo=document.createElement('div');photo.className='photo';photo.style.setProperty('--paint',paintColor(saved.paint));photo.append(getPhoto(r));const flag=document.createElement('small');flag.textContent=owned?'✓ OWNED':'MODEL REFERENCE';photo.append(flag);c.append(photo);const body=document.createElement('div');body.className='body';const k=document.createElement('span');k.className='kind';k.textContent=r.type+' · '+(saved.garage||'Not assigned');const h=document.createElement('h3');h.textContent=r.name;let quick=null;if(r.spec){quick=document.createElement('p');quick.className='j104-quick';quick.textContent=[r.spec.manufacturer,r.spec.seats!==null?r.spec.seats+' seats':null,r.spec.topSpeedMph!==null?r.spec.topSpeedMph+' mph tested':null].filter(Boolean).join(' · ')}const acts=document.createElement('div');acts.className='actions';const details=document.createElement('button');details.className='primary';details.type='button';details.textContent='View vehicle';details.onclick=()=>choose(r.id);const own=document.createElement('button');own.type='button';own.textContent=owned?'✓ Owned':'+ Own';own.setAttribute('aria-pressed',String(owned));own.onclick=()=>{if(saveOwners(r.id,!owned))paint()};acts.append(details,own);body.append(k,h);if(quick)body.append(quick);body.append(acts);c.append(body);return c}
function hasSavedBuild(v){return !!(v.note||v.plate||v.studioName||v.studioBody||v.garage||v.favorite||v.paint&&v.paint!=='Graphite'||v.secondary&&v.secondary!=='Midnight'||v.studioDesign&&Object.keys(v.studioDesign).length)}
function paint(){const query=$('garageSearch').value.toLowerCase().trim(),type=$('garageFilter').value,where=$('garageLocation').value;
shown=records.filter(r=>{const v=vehicle(r.id),owned=!!gallery.owned['vehicles5:'+r.id];const cls=$('garageClassFilter')?.value||'all';return (!query||r.name.toLowerCase().includes(query)||r.id.includes(query))&&(cls==='all'||r.type===cls)&&(!where||v.garage===where)&&(type==='all'||type==='owned'&&owned||type==='unowned'&&!owned||type==='assigned'&&!!v.garage||type==='favorites'&&!!v.favorite||type==='saved'&&hasSavedBuild(v))});
const pages=Math.max(1,Math.ceil(shown.length/PER_PAGE));page=Math.min(page,pages-1);const root=$('garageCards');root.replaceChildren();for(const r of shown.slice(page*PER_PAGE,(page+1)*PER_PAGE))root.append(card(r));if(!shown.length){const wrap=document.createElement('div');wrap.className='j192-garage-empty';const heading=document.createElement('h3');heading.textContent=type==='owned'?'Your garage is ready for its first ride':'No vehicles match these filters';const info=document.createElement('p');info.textContent=type==='owned'?'You can build your private collection without signing in. Browse models, mark owned, then assign a garage and save your build notes. Boats, motorcycles and aircraft are supported too.':'Try clearing your search or browse every vehicle class; no existing garage notes will be changed.';const browse=document.createElement('button');browse.type='button';browse.textContent='Explore all GTA V / Online vehicles';browse.addEventListener('click',()=>{$('garageFilter').value='all';$('garageLocation').value='';$('garageClassFilter').value='all';$('garageSearch').value='';page=0;paint()});wrap.append(heading,info,browse);root.append(wrap)}text('visibleCount',shown.length+' matching models');text('pageCount',(page+1)+' / '+pages);$('prevPage').disabled=page===0;$('nextPage').disabled=page===pages-1;stats();if(selected)drawDetails()}
function stats(){text('catalogCount',records.length.toLocaleString());text('ownedCount',Object.keys(gallery.owned).filter(x=>x.startsWith('vehicles5:')&&gallery.owned[x]).length);text('assignedCount',Object.values(meta.vehicles).filter(v=>v.garage).length);text('buildCount',Object.values(meta.vehicles).filter(hasSavedBuild).length)}
function choose(id){selected=id;drawDetails();if(window.matchMedia('(max-width:1250px)').matches){$('garageDetails').scrollIntoView({behavior:'smooth',block:'start'});$('garageDetails').querySelector('.j226-garage-back')?.focus({preventScroll:true})}}
function drawDetails(){const r=records.find(x=>x.id===selected);if(!r)return;const v=vehicle(r.id),el=$('garageDetails');el.replaceChildren();function part(tag,cls,str){const e=document.createElement(tag);if(cls)e.className=cls;if(str!==undefined)e.textContent=str;el.append(e);return e}
const back=part('button','j226-garage-back','← Back to showroom');back.type='button';back.onclick=()=>{window.TeamJuraGarage3D?.dispose();selected='';el.replaceChildren();part('h2','','Choose a vehicle');part('p','','Select View vehicle to manage ownership and review its build.');$('garageCards').scrollIntoView({block:'start'});const trigger=[...$('garageCards').querySelectorAll('article.card')].find(x=>x.querySelector('h3')?.textContent===r.name)?.querySelector('button.primary');(trigger||$('garageSearch')).focus({preventScroll:true});};
const shareRow=part('div','j293-share-actions');
const share= document.createElement('a');share.className='j293-share-link';share.href='./atlas93-garage.html?addModel='+encodeURIComponent(r.id);share.textContent='↗ Share this model';share.title='Opens the same model, not your private collection or saved modifications';shareRow.append(share);
const copy=document.createElement('button');copy.type='button';copy.className='j293-share-link';copy.textContent='Copy model link';copy.onclick=async()=>{const url=new URL(share.href,location.href).href;try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(url);notice('Model link copied. Your private build and ownership are not shared.')}catch{notice('Copy unavailable; use the Share this model link instead.')}};shareRow.append(copy);
const bg=part('div','preview');bg.style.setProperty('--paint',paintColor(v.paint));bg.append(getPhoto(r));part('span','pill','GTA ONLINE · '+r.type.toUpperCase()+' · REFERENCE');part('h2','',r.name);part('small','', 'Model ID: '+r.id+' · Archive image if available, otherwise Elario original concept art (not this exact vehicle). Display colors are personal themes and cannot change the in-game craft.');
 const data=r.spec;const craft=window.JuraForge?.craftCustomization?.('v-online',r.id);const panel=part('section','j104-intelligence');const heading=document.createElement('div');heading.className='j104-intel-heading';heading.innerHTML='<span class="j104-beacon" aria-hidden="true">◈</span><div><small>ATLAS VEHICLE INTELLIGENCE / SOURCE-CHECKED FIELDS</small><h3>Vehicle technical profile</h3></div>';panel.append(heading);
 const grid=document.createElement('dl');grid.className='j104-facts';const fact=(label,value)=>{const cell=document.createElement('div');const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value===null||value===undefined||value===''?'Not independently verified':String(value);cell.append(dt,dd);grid.append(cell)};
 fact('Vehicle / craft type',r.type);fact('Manufacturer',data?.manufacturer);fact('Passenger seats',data?.seats);fact('Purchase price in GTA currency',Number.isFinite(data?.priceUSD)?'GTA$'+data.priceUSD.toLocaleString('en-US'):null);
 if(data?.purchaseSite)fact('Purchase website',data.purchaseSite);
 if(data?.storage)fact('Ownership / storage',data.storage);
 if(data?.delivery)fact('Delivery service',data.delivery);
 fact('Tested top speed',Number.isFinite(data?.topSpeedMph)?data.topSpeedMph+' mph':null);
 fact('Drive / propulsion',data?.drive||(['Boats & Watercraft','Helicopters','Planes & Aircraft'].includes(r.type)?'Craft-specific · not a road drivetrain':null));
 fact('Design inspiration, not real-world specs',data?.visualInspiration);
 fact('Customizable in GTA Online',craft&&craft.mode!=='unknown'?craft.label:typeof data?.customizable==='boolean'?(data.customizable?'Yes — individual options require verification':'No'):null);
 if(craft?.location)fact('Craft workshop / service location',craft.location);
 fact('Model ID',r.id);panel.append(grid);
 if(craft&&craft.mode!=='unknown'){const hint=document.createElement('p');hint.className='j104-context';hint.textContent=craft.mode==='collection'?'Ownership, storage, favorites and private notes remain available. Any saved personal color concept is not an in-game modification.':'Only documented model-specific game options apply. Existing design notes remain private.';const ref=document.createElement('a');ref.href='./atlas-credits.html#forge-craft-customization';ref.textContent=' Craft customization sources';hint.append(ref);panel.append(hint)}
 const detail=document.createElement('p');detail.className='j104-context';detail.textContent=data?data.description+' · These are GTA Online game statistics, not real-world performance, and prices may change with game updates.':'No independent purchase price, speed, maker or seating specs verified yet. Nothing is inferred from an archive image.';panel.append(detail);
 const source=document.createElement('p');source.className='j104-provenance';if(data?.sourceUrl?.startsWith('https://gtadb.net/')){const a=document.createElement('a');a.href=data.sourceUrl;a.target='_blank';a.rel='noopener noreferrer';a.textContent='View individual GTADB vehicle facts & methodology ↗';source.append(a,document.createTextNode(' · reviewed '+data.checkedAt))}else source.textContent='Source photo is not proof of game specs or an exact 3D mesh';panel.append(source);
const preset=safeParse('team-jura-atlas101-concept-presets-v1',{builds:{}}).builds?.[r.id];if(preset&&/^#[0-9a-f]{6}$/i.test(preset.paint||'')){const preview=part('section','j104-intelligence');const heading=document.createElement('h3');heading.textContent='Saved studio concept';const desc=document.createElement('p');desc.textContent=(preset.name||'Untitled concept')+' · '+preset.paint+' · '+(preset.note||'No notes');preview.append(heading,desc);}
window.TeamJuraGarage3D?.dispose();let studioDesign=window.JuraForge?.normalize(v.studioDesign,r.id)||{};
const previewOpts={name:r.name,model:r.id,type:r.type,paint:paintColor(v.paint),design:studioDesign,onDesign:d=>{studioDesign=d}};
const showroom=part('section','j99-showroom');window.TeamJuraGarage3D?.mountReference(showroom,previewOpts);
function labelText(label,node){const wrap=part('label','',label);wrap.append(node);return node}
const studio=document.createElement('a');studio.href='./atlas-vehicle-configurator.html?model='+encodeURIComponent(r.id)+'&source=garage';studio.textContent='◈ Open this vehicle in Forge Workshop';studio.className='j99-studio-link';studio.style.cssText='display:inline-flex;align-items:center;min-height:44px;margin:12px 0;padding:10px 15px;border:1px solid #f5c98c;border-radius:11px;color:#ffe2aa;text-decoration:none;font-weight:750';showroom.after(studio);
const owned=document.createElement('input');owned.type='checkbox';owned.checked=!!gallery.owned['vehicles5:'+r.id];labelText('Owned / collected',owned);owned.onchange=()=>{if(!saveOwners(r.id,owned.checked))owned.checked=!!gallery.owned['vehicles5:'+r.id];paint()};
const place=document.createElement('select');place.add(new Option('Unassigned',''));for(const g of meta.garages)place.add(new Option(g,g));place.value=v.garage;labelText('Garage location',place);
const primary=document.createElement('select');const secondary=document.createElement('select');for(const [n] of PAINTS){primary.add(new Option(n,n));secondary.add(new Option(n,n))}function addCustom(select,value){if(typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)&&![...select.options].some(o=>o.value===value))select.add(new Option('Custom concept color · '+value,value))}
addCustom(primary,v.paint);addCustom(secondary,v.secondary);primary.id='j255-primary';secondary.id='j255-secondary';primary.value=v.paint||'Graphite';secondary.value=v.secondary||'Midnight';
let studioBody=v.studioBody,studioName=v.studioName;labelText(craft?.mode==='collection'||data?.customizable===false?'Personal display color · NOT an in-game customization':'Primary paint · planned build / concept color',primary);labelText(craft?.mode==='collection'||data?.customizable===false?'Display accent only':'Secondary paint · planned concept',secondary);
const sw=part('div','swatches');for(const [n,color] of PAINTS){const b=document.createElement('button');b.type='button';b.style.setProperty('--swatch',color);b.title=n;b.setAttribute('aria-label','Use '+n+' as primary paint');b.setAttribute('aria-pressed',String(n===primary.value));b.onclick=()=>{primary.value=n;primary.dispatchEvent(new Event('change'))};sw.append(b)}primary.onchange=()=>{bg.style.setProperty('--paint',paintColor(primary.value));window.TeamJuraGarage3D?.paint(paintColor(primary.value));sw.querySelectorAll('button').forEach((x,i)=>x.setAttribute('aria-pressed',String(PAINTS[i][0]===primary.value)))};
const exact=document.createElement('input');exact.type='color';exact.id='j255-rgb';exact.value=paintColor(primary.value);labelText('Custom concept RGB · personal preview only',exact);
exact.oninput=()=>{addCustom(primary,exact.value);primary.value=exact.value;primary.dispatchEvent(new Event('change'))};
primary.addEventListener('change',()=>{exact.value=paintColor(primary.value)});
const plate=document.createElement('input');plate.maxLength=20;plate.value=v.plate||'';labelText('License plate / build label (personal notes)',plate);
const note=document.createElement('textarea');note.maxLength=1200;note.value=v.note||'';note.placeholder=r.type==='Boats & Watercraft'?'Dock, delivery, favorite routes, and crew memories…':'Upgrades, armor, wheels, performance, where you stored this ride…';labelText('Vehicle build notes',note);
if(preset&&/^#[0-9a-f]{6}$/i.test(preset.paint||'')){const apply=part('button','j226-apply-preset','Use studio concept in build editor');apply.type='button';apply.onclick=()=>{addCustom(primary,preset.paint);primary.value=preset.paint;primary.dispatchEvent(new Event('change'));studioBody=['auto','sports','truck','standard'].includes(preset.body)?preset.body:'auto';studioName=f(preset.name).slice(0,72);studioDesign=window.JuraForge?.normalize(preset.design,r.id)||{};const host=showroom.querySelector('.j256-forge')||(showroom.classList.contains('j256-forge')?showroom:null);if(host){previewOpts.paint=preset.paint;previewOpts.design=studioDesign;window.TeamJuraGarage3D?.mountReference(host,previewOpts)}const add=[preset.name,preset.note,'Studio concept RGB: '+preset.paint].filter(Boolean).join('\n');if(!note.value.includes(add)&&note.value.length+add.length+2<=1200)note.value=[note.value,add].filter(Boolean).join('\n\n');notice('Exact concept RGB loaded. Existing notes preserved; review and press Save custom build. Personal concept color is not a verified GTA paint option.');};}

// Atlas 30.5 — named Forge concepts are private working copies, never writes on load.
// Recheck the latest Forge store at the moment of selection, so another tab's
// changes are not silently replaced by a stale named build.
{
 const variantsKey='team-jura-atlas101-concept-presets-v1';
 const source=part('section','j305-variants');
 const header=document.createElement('h3');header.textContent='Saved Forge versions for this vehicle';
 const description=document.createElement('p');description.textContent='Load one of up to eight named Forge designs into this working editor. Paint and concept shape preview only; Garage location, ownership, plate, favorites, other builds and Forge presets are not modified until you explicitly save the Garage build.';
 source.append(header,description);
 const read=()=>window.JuraGarageVariants?.list(localStorage.getItem(variantsKey),r.id);
 const available=read();
 const status=document.createElement('p');status.className='j305-variant-status';status.setAttribute('role','status');
 if(available===null){status.textContent='Saved Forge data cannot be read safely. Your existing files are untouched; export or recover them in Forge.';source.append(status)}
 else if(!available?.length){status.textContent='No additional named Forge designs saved for this vehicle yet.';source.append(status)}
 else {
  const select=document.createElement('select');select.id='j305-variant-choice';select.setAttribute('aria-label','Saved named Forge design');
  for(const entry of available)select.add(new Option(entry.name+' · '+entry.paint,entry.name));
  const action=document.createElement('button');action.type='button';action.id='j305-load-variant';action.textContent='Load named design · working copy';
  action.onclick=()=>{
   const fresh=read();
   if(fresh===null){status.textContent='Forge data is unreadable; the current editor was not changed.';return}
   const item=fresh?.find(x=>x.name===select.value);
   if(!item){status.textContent='That named design changed in another tab. Reopen this vehicle to refresh the list.';return}
   addCustom(primary,item.paint);primary.value=item.paint;primary.dispatchEvent(new Event('change'));
   studioBody=item.body;studioName=item.name;
   studioDesign=window.JuraForge?.normalize(item.design,r.id)||{};
   const host=showroom.querySelector('.j256-forge')||(showroom.classList.contains('j256-forge')?showroom:null);
   if(host){previewOpts.paint=item.paint;previewOpts.design=studioDesign;window.TeamJuraGarage3D?.mountReference(host,previewOpts)}
   status.textContent='Working copy loaded: '+item.name+' ('+item.paint+'). Forge originals and saved Garage data are unchanged. Press Save custom build only if you want this version applied in My Garage.';
  };
  source.append(select,action,status);
 }
 const forgeLink=document.createElement('a');forgeLink.href='./atlas-vehicle-configurator.html?model='+encodeURIComponent(r.id);
 forgeLink.textContent='Open named Forge collection for this model';
 source.append(forgeLink);
}
const fav=document.createElement('input');fav.type='checkbox';fav.checked=!!v.favorite;labelText('★ Favorite ride',fav);
const save=part('button','save','Save custom build');save.type='button';save.onclick=()=>{const saved=setVehicle(r.id,{garage:place.value,paint:primary.value,secondary:secondary.value,plate:f(plate.value),note:f(note.value),favorite:fav.checked,studioDesign:window.JuraForge?.normalize(studioDesign,r.id)||{},...(studioBody?{studioBody}:{}),...(studioName?{studioName}:{})});garages();paint();if(saved)notice('Saved '+r.name+' on this device.')};
const link=part('a','','↗ Research vehicle info at GTADB');link.href=data?.sourceUrl?.startsWith('https://gtadb.net/')?data.sourceUrl:'https://gtadb.net/vehicles/';link.target='_blank';link.rel='noopener noreferrer';part('p','status','Save notes to keep these settings after refreshing.');}
function download(obj,name){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),800)}
// Retry only same-origin, read-only catalog requests after transient failures.
// Do not change local saves, source IDs, or ownership on connection failure.
async function readGarageCatalog(url,validate){
 let error;
 for(let attempt=0;attempt<3;attempt++){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
  try{
   const response=await fetch(url,{cache:attempt?'reload':'default',signal:controller.signal});
   if(!response.ok)throw Error('Catalog HTTP '+response.status);
   const data=await response.json();
   if(!validate(data))throw Error('Invalid catalog data');
   return data;
  }catch(e){error=e;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)))}
  finally{clearTimeout(timer)}
 }
 throw error;
}
function install(){ $('garageSearch').addEventListener('input',()=>{page=0;paint()});for(const id of ['garageFilter','garageLocation','garageClassFilter'])$(id).addEventListener('change',()=>{page=0;paint()});
$('showAll').onclick=()=>{$('garageFilter').value='all';$('garageLocation').value='';page=0;paint()};$('showOwned').onclick=()=>{$('garageFilter').value='owned';$('garageLocation').value='';page=0;paint()};$('prevPage').onclick=()=>{page--;paint()};$('nextPage').onclick=()=>{page++;paint()};
$('addGarage').onclick=()=>{const name=f($('newGarage').value).slice(0,56);if(!name){notice('Enter a garage name.');return}if(meta.garages.includes(name)){notice('This garage already exists.');return}if(saveGarageName(name)){$('newGarage').value='';garages();paint()}};
$('exportGarage').onclick=()=>{
 try{
  // A Forge tab may have written a newer design before this Garage tab repaints.
  const liveMeta=readLiveMeta(),liveGallery=readLiveGallery();
  download({schema:1,app:'team-jura-atlas93-garage',exported:new Date().toISOString(),garage:liveMeta,collection:{owned:liveGallery.owned,wishlist:liveGallery.wishlist}},'team-jura-my-garage-backup.json');
 }catch(e){notice('Garage backup not exported: saved data needs recovery before exporting.')}
};
$('importGarage').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{
 if(file.size>2000000)throw Error('Backup exceeds 2 MB');
 if(!records.length)throw Error('Wait for the vehicle catalog before importing');
 const payload=JSON.parse(await file.text()),allowed=new Set(records.map(r=>r.id));
 // Re-read both keys to preserve updates made in another tab.
 const latestMeta=readLiveMeta(),latestGallery=readLiveGallery();
 const result=window.JuraGarageMerge.merge(payload,latestMeta,latestGallery,allowed);
 if(!result.added&&!result.addedGarages&&!result.marks){notice('No new Garage data: '+result.kept+' existing builds retained; '+result.skipped+' skipped.');return}
 const originalMeta=localStorage.getItem(META),originalGallery=localStorage.getItem(S);
 const stamp=new Date().toISOString();
 try{localStorage.setItem(META,JSON.stringify({...result.meta,updated:stamp}));localStorage.setItem(S,JSON.stringify({...result.gallery,schema:1,updated:stamp}))}
 catch(err){try{if(originalMeta===null)localStorage.removeItem(META);else localStorage.setItem(META,originalMeta);if(originalGallery===null)localStorage.removeItem(S);else localStorage.setItem(S,originalGallery)}catch{}throw Error('Storage unavailable; keep your original backup and check saved builds.')}
 meta=result.meta;gallery=result.gallery;garages();paint();if(selected&&records.some(r=>r.id===selected))choose(selected);
 notice('Merged '+result.added+' new builds, '+result.addedGarages+' garages and '+result.marks+' collection marks. '+result.kept+' existing builds kept; '+result.skipped+' invalid/unknown skipped. Keep the original file for conflicting builds.');
 }catch(err){notice('Import rejected: '+err.message)}finally{e.target.value=''}};
$('discoverArchive').onclick=async()=>{const btn=$('discoverArchive');btn.disabled=true;btn.textContent='Checking archive…';try{const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000),r=await fetch(TREE,{signal:controller.signal});clearTimeout(timeout);if(!r.ok)throw Error('Archive HTTP '+r.status);const data=await r.json();const models=(data.tree||[]).map(x=>/^vehicles\/([a-z0-9_]+)\.webp$/.exec(x.path||'')?.[1]).filter(Boolean);if(!models.length)throw Error('No image IDs available');const ids=new Set(records.map(x=>x.id));for(const id of models)if(!ids.has(id))records.push(modelInfo(id));records.sort((a,b)=>a.name.localeCompare(b.name));localStorage.setItem(CACHE,JSON.stringify({ids:[...new Set(models)],checkedAt:new Date().toISOString()}));paint();notice('Indexed '+models.length+' archive model IDs. These prove image availability, not complete verified game-model coverage.')}catch(err){notice('Archive discovery unavailable: '+err.message)}finally{btn.disabled=false;btn.textContent='Discover more pictured model IDs'}};
Promise.all([readGarageCatalog('./atlas90-seed.json',data=>Array.isArray(data?.vehicles)&&data.vehicles.some(id=>typeof id==='string'&&/^[a-z0-9_]{1,65}$/.test(id))),readGarageCatalog('./data/atlas-vehicle-intel.json',data=>plain(data?.vehicles)).catch(()=>({vehicles:{}}))]).then(([data,sources])=>{intel=sources?.vehicles&&typeof sources.vehicles==='object'?sources.vehicles:{};const ids=[...new Set([...(data.vehicles||[]),...(safeParse(CACHE,{ids:[]}).ids||[])])].filter(x=>/^[a-z0-9_]{1,65}$/.test(x));records=ids.map(modelInfo).sort((a,b)=>a.name.localeCompare(b.name));const classes=[...new Set(records.map(x=>x.type))].sort();const classFilter=$('garageClassFilter');if(classFilter){const current=classFilter.value;classFilter.replaceChildren(new Option('All vehicle classes','all'));for(const cls of classes)classFilter.add(new Option(cls,cls));classFilter.value=classes.includes(current)?current:'all'}garages();paint();
 // Preview exactly the requested model. Do not alter previously stored ownership or builds.
 const requested=new URLSearchParams(location.search).get('addModel');
 if(requested){
  if(/^[a-z0-9_]{1,65}$/.test(requested)&&records.some(r=>r.id===requested)){
   $('garageFilter').value='all';$('garageLocation').value='';$('garageClassFilter').value='all';
   $('garageSearch').value=requested;page=0;paint();choose(requested);
   notice('Viewing '+nice(requested)+' from the gallery. Ownership and saved builds unchanged.');
  }else notice('Requested model is not in the indexed catalog. Browse available models instead.');
 }
 }).catch(err=>{ $('garageCards').textContent='Catalog unavailable: '+err.message;notice('Vehicle catalog unavailable after retries. Your saved builds are unchanged. Reload this page to retry.');});
window.addEventListener('storage',e=>{if(e.key===S){gallery=safeParse(S,gallery);paint()}if(e.key===META){meta=safeParse(META,meta);garages();paint()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();