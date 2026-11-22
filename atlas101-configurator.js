/* Team Jura Atlas 10.1 original vehicle idea builder. No licensed game meshes. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const VI=new URLSearchParams(location.search).get('world')==='vi';
const KEY=VI?'team-jura-forge-vi-concept-presets-v1':'team-jura-atlas101-concept-presets-v1';
const VI_SOURCE='https://www.rockstargames.com/VI/media/screenshots';
// Official screenshot titles establish names and subject, not exact meshes or in-game specifications.
const VI_RECORDS=Object.freeze({
 vi_cheetah95:{name:'’95 Grotti Cheetah',category:'Sports Classics'},
 vi_stanier55:{name:'’55 Vapid Stanier',category:'Sedans'},
 vi_dominator67_buggy:{name:'’67 Vapid Dominator Buggy',category:'Off-Road'},
 vi_squalo:{name:'Shitzu Squalo',category:'Boats & Watercraft'},
 vi_enduro:{name:'Dinka Enduro Motorcycle',category:'Motorcycles'},
 vi_crest_kayak:{name:'Crest Kayak',category:'Boats & Watercraft'},
 vi_ganado_retro:{name:'Ganado Retro Build',category:'Reference only'}
});
const CDN='https://cdn.jsdelivr.net/gh/Stuyk/gtav-image-archive@main/vehicles/';
const DEFAULT='#4473c2';
const COLORS=[['Night Blue','#4473c2'],['Arctic White','#d9e4f0'],['Sunset','#ef8b36'],['Racing Red','#d84443'],['Royal Violet','#8b54dd'],['Electric Lime','#92cf3b'],['Cyan','#29bad1'],['Graphite','#5c606a'],['Rose','#d8669e'],['Gold','#dbb14d']];
let intel={},models=[],visible=[],current='',paint=DEFAULT,design={},storage={schema:1,builds:{}};
const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function readStored(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&x.schema===1&&plain(x.builds)?x:null}catch{return null}}
function load(){const x=readStored();if(x)storage=x}
function mergeLatest(){const latest=readStored();if(latest)storage={...storage,...latest,builds:{...storage.builds,...latest.builds},variants:mergeVariants(storage.variants,latest.variants,null).merged}}
const allowedBody=['auto','sports','truck','standard'];
function normalizedPreset(id,entry){
 if(!plain(entry)||entry.model!==id||!/^#[0-9a-f]{6}$/i.test(entry.paint||'')||
    !allowedBody.includes(entry.body)||typeof entry.name!=='string'||typeof entry.note!=='string')return null;
 return {model:id,paint:entry.paint.toLowerCase(),body:entry.body,name:entry.name.slice(0,72),note:entry.note.slice(0,800),updated:typeof entry.updated==='string'?entry.updated.slice(0,40):'',design:window.JuraForge?.normalize(entry.design)||{}};
}
const VARIANT_LIMIT=8;
function variantName(entry){return entry.name.trim().toLowerCase()}
function mergeVariants(existing,incoming,known){
 const merged=Object.create(null);let added=0;
 for(const source of [existing,incoming]){
  if(!plain(source))continue;
  for(const [id,entries] of Object.entries(source)){
   if(!/^[a-z0-9_]{2,75}$/.test(id)||['__proto__','prototype','constructor'].includes(id)||(known&&!known.has(id))||!Array.isArray(entries))continue;
   const dest=merged[id]||(merged[id]=[]);
   for(const raw of entries){const entry=normalizedPreset(id,raw);if(!entry||!variantName(entry)||dest.length>=VARIANT_LIMIT||dest.some(x=>variantName(x)===variantName(entry)))continue;dest.push(entry);if(source===incoming)added++}
  }
 }
 return {merged,added};
}
function variantsFor(id){return mergeVariants(storage.variants,null,null).merged[id]||[]}
function refreshVariants(){const select=$('forgeVariant');if(!select)return;const previous=select.value;select.replaceChildren(new Option('Choose a named build',''));for(const item of variantsFor(current))select.add(new Option(item.name,item.name));if([...select.options].some(o=>o.value===previous))select.value=previous;$('loadVariant').disabled=!current||!variantsFor(current).length}
function saveVariant(){if(!current){status('Choose a vehicle first.');return}mergeLatest();const name=$('buildName').value.trim().slice(0,72);if(!name){status('Enter a design name before saving a named build.');return}const items=variantsFor(current);if(items.some(x=>variantName(x)===name.toLowerCase())){status('That build name already exists. Choose a different name to preserve it.');return}if(items.length>=VARIANT_LIMIT){status('Eight named builds already saved for this vehicle. Export your collection before managing further builds.');return}const entry={model:current,paint,body:$('bodyStyle').value,name,note:$('buildNote').value.trim().slice(0,800),design:window.JuraForge?.normalize(design)||{},updated:new Date().toISOString()};storage.variants=mergeVariants(storage.variants,{[current]:[entry]},new Set(models)).merged;refreshVariants();$('forgeVariant').value=name;status(persist()?'Named build saved. Your primary design is unchanged.':'Storage unavailable. Export your working collection before closing.')}
function loadVariant(){mergeLatest();const name=$('forgeVariant').value;const entry=variantsFor(current).find(x=>x.name===name);if(!entry){status('Choose a named build first.');return}loadWorking(entry);status('Loaded named concept '+entry.name+'. Saved designs are unchanged.')}
function prepareImport(payload,existing,known){
 if(!plain(payload)||payload.schema!==1||!plain(payload.builds))throw Error('Not an Atlas concept preset backup');
 const merged={...existing};let added=0,kept=0,skipped=0;
 for(const [id,value] of Object.entries(payload.builds)){
  if(!known.has(id)||['__proto__','prototype','constructor'].includes(id)){skipped++;continue}
  const entry=normalizedPreset(id,value);
  if(!entry){skipped++;continue}
  if(Object.hasOwn(merged,id)){kept++;continue}
  merged[id]=entry;added++;
 }
 return {merged,added,kept,skipped};
}

function persist(){try{localStorage.setItem(KEY,JSON.stringify(storage));return true}catch{return false}}
function title(id){if(VI&&Object.hasOwn(VI_RECORDS,id))return VI_RECORDS[id].name;return String(id).replace(/_mk([0-9]+)/g,' Mk $1').replace(/_/g,' ').replace(/([a-z])([0-9])/g,'$1 $2').replace(/\b[a-z]/g,x=>x.toUpperCase())}
function sceneType(id=current,selected=$('bodyStyle').value){const model=String(id).toLowerCase();const category=intel[id]?.category;if(category==='Helicopters')return 'Helicopter concept';if(category==='Planes & Aircraft')return 'Aircraft / Plane concept';if(category==='Boats & Watercraft')return 'Boat / Watercraft concept';if(/helicopter|chopper|buzzard|annihilator|frogger|maverick|swift|volatus|akula|hunter|savage|valkyrie|cargobob|sparrow/.test(model))return 'Helicopter concept';if(/dinghy|squalo|speeder|jetmax|marquis|tropic|suntrap|seashark|tug|boat|submarine|kosatka|longfin|patrolboat|avisa|kraken/.test(model))return 'Boat / Watercraft concept';if(/alkonost|velum|hydra|lazer|^jet$|plane|aircraft|bombushka|titan|miljet|luxor|shamal|dodo|cuban800|besra|pyro|molotok|starling|nokota|seabreeze|mogul|tula|volatol|avenger/.test(model))return 'Aircraft / Plane concept';if(selected==='sports')return'Sports / Coupe concept';if(selected==='truck')return'Truck / Utility concept';if(selected==='standard')return'Sedan / Touring concept';if(/SUV|Off-Road|Trucks & Utility/.test(category||''))return 'Truck / Utility concept';if(/Super|Sports/.test(category||''))return 'Sports concept';if(/^(bfinjection|bifta|bodhi|cavalcade|dune2?|granger|gresley|guardian|habanero|huntley|journey|landstalker|liberator|mesa|patriot|rancherxl|riata|rocoto|sadler|sandking|serrano|slamvan|technical|yosemite|baller|beejayxl|benson|boxville|fq2|minivan|moonbeam|picador|radius|rumpo|speedo|astron|aleutian)$/.test(model)||/truck|pickup|bison|dubsta|rebel|bobcat|burrito|mule|van/.test(model))return 'Pickup / Truck';return /adder|infernus|zentorno|thrax|osiris|t20|sports|cheetah|comet|jester|turismo|banshee|autarch|bullet|coquette|cyclone|deveste|elegy|emerus|entityxf|fmj|lm87|massacro|nero|ninef|prototipo|rapidgt|specter|tempesta|tezeract|tyrant|tyrus|vacca|visione|x80proto|xa21|zorrusso|zr350/.test(model)?'Sports concept':'Touring concept'}
// Divisions describe Elario concept display coverage, not a complete official class taxonomy.
function referenceOnly(id){if(VI&&['vi_crest_kayak','vi_ganado_retro'].includes(id))return true;return /Motorcycles|Emergency & Military/.test(intel[id]?.category||'')||/^(akuma|avarus|bagger|bati|chimera|cruiser|daemon|defiler|diablous|hakuchou|hexer|policeb|ruffian|sanches|sanchez|sovereign|vader|verus|vortex|faggio|oppressor|ambulance|apc|barracks|bus|coach|firetruk|flatbed|halftrack|insurgent|rhino|blimp|raptor)$/.test(id)}
function divisionFor(id){if(referenceOnly(id))return 'reference';const type=sceneType(id,'auto');if(/Watercraft/.test(type))return 'marine';if(/Aircraft|Helicopter/.test(type))return 'aviation';if(/Utility|Truck/.test(type))return 'utility';if(/Sports/.test(type))return 'performance';return 'touring'}
function initDivisions(){const label=document.createElement('label');label.textContent='Forge showroom division';const select=document.createElement('select');select.id='forgeDivision';for(const [id,name] of [['all','All vehicle references'],['performance','Performance · sports concepts'],['marine','Marine · watercraft concepts'],['aviation','Aviation · aircraft concepts'],['utility','Utility · off-road concepts'],['touring','Touring · other road concepts'],['reference','Reference-only · no suitable 3D body']])select.add(new Option(name,id));label.append(select);$('modelSearch').closest('label').before(label);select.addEventListener('change',showModels)}
function status(message){$('builderStatus').textContent=message}
function chooseColor(c){if(!/^#[0-9a-f]{6}$/i.test(c))return;paint=c.toLowerCase();$('paintColor').value=paint;for(const button of $('paintSwatches').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.paint===paint));window.TeamJuraGarage3D?.paint(paint)}
function repaint(){
 const stage=$('concept3d'),style=$('bodyStyle'),hint=$('bodyStyleHint');
 if(!current){window.TeamJuraGarage3D?.dispose();style.disabled=true;hint.textContent='Choose a model to see its available original concept.';stage.textContent='Choose a model to begin.';return}
 const type=sceneType();
 const unsupported=referenceOnly(current);
 const classLocked=/Aircraft|Watercraft|Helicopter/.test(type);
 style.disabled=unsupported||classLocked;
 hint.textContent=unsupported?'No suitable original mesh yet. The reference and notes remain available.':classLocked?'Class-specific original '+type.toLowerCase()+'; road body styles do not apply.':'Choose a road body concept. It is not an exact in-game vehicle model.';
 if(unsupported){window.TeamJuraGarage3D?.dispose();stage.replaceChildren();stage.textContent='A matching original 3D body is not available for this vehicle class. Reference image and private build notes remain usable.';return}
 if(!window.TeamJuraGarage3D?.mount){stage.textContent='Interactive WebGL module unavailable; vehicle reference and notes remain usable.';return}
 window.TeamJuraGarage3D.mount(stage,{name:title(current||'vehicle'),model:current,type,paint,design,onDesign:value=>{design=value}});
}
const GARAGE_PAINTS={'Midnight':'#121727','Pearl White':'#eaeef2','Metallic Orange':'#f58b26','Sunburst Yellow':'#ffce38','Racing Red':'#e44145','Electric Blue':'#249de5','Emerald':'#36a06a','Neon Purple':'#8b40e9','Hot Pink':'#df4c9b','Graphite':'#5b6270'};
function garagePreset(){if(VI)return null;try{const v=JSON.parse(localStorage.getItem('team-jura-atlas93-garage-v1')||'null')?.vehicles?.[current];return v&&typeof v==='object'?{paint:typeof v.paint==='string'&&/^#[0-9a-f]{6}$/i.test(v.paint)?v.paint:GARAGE_PAINTS[v.paint]||DEFAULT,name:v.studioName||v.plate||'',note:v.note||'',body:['auto','sports','truck','standard'].includes(v.studioBody)?v.studioBody:'auto',design:v.studioDesign||{}}:null}catch{return null}}
function loadWorking(existing){
 design=window.JuraForge?.normalize(existing?.design)||{};
 $('paintColor').value=paint=typeof existing?.paint==='string'&&/^#[0-9a-f]{6}$/i.test(existing.paint)?existing.paint.toLowerCase():DEFAULT;
 $('bodyStyle').value=allowedBody.includes(existing?.body)?existing.body:'auto';
 $('buildName').value=String(existing?.name||'').slice(0,72);$('buildNote').value=String(existing?.note||'').slice(0,800);repaint();
 for(const button of $('paintSwatches').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.paint===paint));
}
function loadGarageWorking(){
 const build=current?garagePreset():null;
 if(!build){status('No saved Garage build for this model. Your working editor is unchanged.');return}
 loadWorking(build);status('Garage build loaded into the working editor. Your saved Studio idea and Garage record are unchanged until you choose Save this idea.');
}
function selectedPreset(){const x=storage.builds[current];return x&&typeof x==='object'&&!Array.isArray(x)?x:null}
function selectModel(model){if(!models.includes(model))return;current=model;$('modelSelect').value=current;$('stageModel').textContent=title(model)+' · concept study';$('referenceTitle').textContent=title(model);$('referenceNote').textContent='GTA V archive reference render, where available. The interactive 3D silhouette is an original vehicle-class concept, not the exact pictured game vehicle.';const img=$('referenceImage');img.alt='GTA V archive reference render for '+title(model);img.onerror=()=>{img.onerror=null;const marine=/Watercraft/.test(sceneType());img.src=marine?'./art/elario-watercraft-showroom.webp':'./art/jura161-vehicles.webp';img.alt='Original Elario '+(marine?'marine':'vehicle')+' showroom concept, not a reference render of '+title(model);$('referenceNote').textContent='No matching archive photo. Showing original Elario showroom illustration, not this exact model.'};if(VI){img.onerror=null;img.src=/Watercraft/.test(sceneType(model,'auto'))?'./art/elario-watercraft-showroom.webp':'./art/jura161-vehicles.webp';img.alt='Original Elario showroom concept, not a GTA VI vehicle image';$('referenceNote').textContent='Official Rockstar screenshot title. This image is an Elario showroom illustration, not the named vehicle. Geometry is a class-based concept; exact appearance and modifications are not verified.';const source=document.createElement('a');source.href=VI_SOURCE;source.target='_blank';source.rel='noopener noreferrer';source.textContent=' View official screenshot gallery.';$('referenceNote').append(source);$('addToGarage').hidden=true;}else{img.src=CDN+encodeURIComponent(model)+'.webp';$('addToGarage').href='./atlas93-garage.html?addModel='+encodeURIComponent(model);}const saved=selectedPreset(),fromGarage=!saved?garagePreset():null;const existing=saved||fromGarage;loadWorking(existing);refreshVariants();$('loadGarageBuild').disabled=!garagePreset();status(fromGarage?'Loaded saved Garage build as a working concept. Your Garage record is unchanged.':existing?'Restored your private concept notes for '+title(model):'New concept for '+title(model)+'. Choose a paint color and save your idea.');try{const url=new URL(location.href);url.searchParams.set('model',model);history.replaceState(null,'',url)}catch{}}
function paintButtons(){const root=$('paintSwatches');root.replaceChildren();for(const [name,value]of COLORS){const b=document.createElement('button');b.type='button';b.title=name;b.setAttribute('aria-label','Preview '+name+' concept color');b.style.setProperty('--swatch',value);b.dataset.paint=value;b.setAttribute('aria-pressed',String(value===paint));b.onclick=()=>chooseColor(value);root.append(b)}}
function showModels(){const input=$('modelSearch').value.trim().toLowerCase();const division=$('forgeDivision')?.value||'all';visible=models.filter(x=>(division==='all'||divisionFor(x)===division)&&(title(x).toLowerCase().includes(input)||x.includes(input)));const sel=$('modelSelect'),prior=current;sel.replaceChildren();if(!visible.length){sel.add(new Option('No matching models',''));current='';refreshVariants();$('loadGarageBuild').disabled=true;$('addToGarage').href='./atlas93-garage.html';$('stageModel').textContent='Choose a vehicle';$('referenceTitle').textContent='No matching vehicle';$('referenceImage').onerror=null;$('referenceImage').alt='Original Elario vehicle showroom illustration';$('referenceImage').src='./art/jura161-vehicles.webp';$('referenceNote').textContent='Original showroom illustration, not a vehicle reference.';repaint();status('No models match this division and search. Choose another division or clear the search.');return}for(const m of visible)sel.add(new Option(title(m),m));if(visible.includes(prior))sel.value=prior;else selectModel(visible[0]);}
function save(){if(!current){status('Choose a vehicle first.');return}mergeLatest();const entry={model:current,paint,body:$('bodyStyle').value,name:$('buildName').value.trim().slice(0,72),note:$('buildNote').value.trim().slice(0,800),design:window.JuraForge?.normalize(design)||{},updated:new Date().toISOString()};storage.builds[current]=entry;if(persist())status('Concept saved locally. Export your presets to back them up.');else status('Storage unavailable. Export your work before closing this page.')}
function reset(){if(!current)return;design=window.JuraForge?.normalize({})||{};paint=DEFAULT;$('paintColor').value=DEFAULT;$('bodyStyle').value='auto';$('buildName').value='';$('buildNote').value='';repaint();for(const b of $('paintSwatches').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.paint===DEFAULT));status('Working concept reset. Your previously saved preset is still stored until you overwrite it.')}
function exportBuilds(){mergeLatest();const blob=new Blob([JSON.stringify({...storage,exported:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=VI?'team-jura-forge-vi-concepts.json':'team-jura-vehicle-concepts.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Concept file exported. Keep your backup somewhere safe.')}
async function importBuilds(event){
 const file=event.target.files?.[0];if(!file)return;
 try{
  if(!models.length)throw Error('Wait for the vehicle catalog before importing');
  if(file.size>2000000)throw Error('Backup exceeds 2 MB');
  const payload=JSON.parse(await file.text());
  mergeLatest();
  const known=new Set(models);const result=prepareImport(payload,storage.builds,known);const variants=mergeVariants(storage.variants,payload.variants,known);
  if(!result.added&&!variants.added){status('No new presets imported. '+result.kept+' existing kept; '+result.skipped+' invalid or unknown skipped.');return}
  const prior=storage;
  storage={...storage,schema:1,builds:result.merged,variants:variants.merged};
  if(!persist()){storage=prior;throw Error('Browser storage unavailable; existing presets left unchanged')}
  refreshVariants();status(result.added+' new preset(s), '+variants.added+' named build(s) imported; '+result.kept+' existing kept; '+result.skipped+' invalid or unknown skipped. Choose Load saved idea to open the current model’s stored preset.');
 }catch(error){status('Import rejected: '+error.message)}
 finally{event.target.value=''}
}
function loadSelected(){mergeLatest();if(!current||!selectedPreset()){status('No saved idea for the selected model. Your working editor is unchanged.');return}selectModel(current)}
async function init(){load();paintButtons();initDivisions();$('saveVariant').addEventListener('click',saveVariant);$('loadVariant').addEventListener('click',loadVariant);if(VI){$('addToGarage').hidden=true;$('addToGarage').style.display='none';$('loadGarageBuild').hidden=true;$('modelSearch').placeholder='Cheetah, Squalo, Stanier…';$('builderStatus').textContent='Loading GTA VI official visual reference names…';}$('importBuilds').addEventListener('change',importBuilds);$('loadBuild').addEventListener('click',loadSelected);$('loadGarageBuild').addEventListener('click',loadGarageWorking);window.addEventListener('storage',e=>{if(e.key==='team-jura-atlas93-garage-v1')$('loadGarageBuild').disabled=!current||!garagePreset()});$('modelSearch').addEventListener('input',showModels);$('modelSelect').addEventListener('change',e=>selectModel(e.target.value));$('paintColor').addEventListener('input',e=>chooseColor(e.target.value));$('bodyStyle').addEventListener('change',repaint);$('saveBuild').addEventListener('click',save);$('resetBuild').addEventListener('click',reset);$('resetCamera').addEventListener('click',()=>window.TeamJuraGarage3D?.reset());$('exportBuilds').addEventListener('click',exportBuilds);
 try{const source=await fetch('./data/atlas-vehicle-intel.json').then(r=>r.ok?r.json():{}).catch(()=>({}));intel=source.vehicles||{};const response=await fetch('./atlas90-seed.json',{cache:'no-cache'});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();if(VI){intel=VI_RECORDS;models=Object.keys(VI_RECORDS).sort((a,b)=>title(a).localeCompare(title(b)))}else models=[...new Set((data.vehicles||[]).filter(m=>typeof m==='string'&&/^[a-z0-9_]{2,75}$/.test(m)))].sort((a,b)=>title(a).localeCompare(title(b)));if(!models.length)throw Error('No suitable vehicle IDs');const selected=new URLSearchParams(location.search).get('model');$('modelSelect').replaceChildren();for(const m of models)$('modelSelect').add(new Option(title(m),m));selectModel(models.includes(selected)?selected:models[0]);if(!selectedPreset()&&!garagePreset())status(models.length+(VI?' official GTA VI screenshot-title references.':' community GTA V model references available.')+' Viewer uses original concept geometry, not exact GTA meshes.')}
 catch(e){status('Vehicle source catalog unavailable: '+e.message+'. You can still use My Garage.');$('concept3d').textContent='Catalog unavailable: no source model to show.'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();