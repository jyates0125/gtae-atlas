/* Team Jura Atlas 10.1 original vehicle idea builder. No licensed game meshes. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const VI=new URLSearchParams(location.search).get('world')==='vi';
const WORLD=VI?'vi':'v';
// External references stay on the source page; no mesh downloads, embeds or inferred rights.
const modelReferences=$('forgeModelReferences');
if(modelReferences){modelReferences.href='./atlas-credits.html#forge-model-references-'+(VI?'vi':'online');modelReferences.textContent=VI?'GTA VI vehicle model research':'GTA Online 3D model references';}
const KEY=VI?'team-jura-forge-vi-concept-presets-v1':'team-jura-atlas101-concept-presets-v1';
const VI_SOURCE='https://www.rockstargames.com/VI/media/screenshots';
// Official screenshot titles establish names and subject, not exact meshes or in-game specifications.
const VI_RECORDS=window.JuraForge?.viCatalog||Object.freeze({});
const CDN='https://cdn.jsdelivr.net/gh/Stuyk/gtav-image-archive@main/vehicles/';
const DEFAULT='#4473c2';
const COLORS=[['Night Blue','#4473c2'],['Arctic White','#d9e4f0'],['Sunset','#ef8b36'],['Racing Red','#d84443'],['Royal Violet','#8b54dd'],['Electric Lime','#92cf3b'],['Cyan','#29bad1'],['Graphite','#5c606a'],['Rose','#d8669e'],['Gold','#dbb14d']];
let intel={},models=[],visible=[],current='',paint=DEFAULT,design={},storage={schema:1,builds:{}};
const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function readStored(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&x.schema===1&&plain(x.builds)?x:null}catch{return null}}

/* Atlas 31.2 — fail-closed recovery for an unreadable, saved Forge world.
   Never delete storage merely because parsing failed; only after raw export,
   explicit user confirmation and another exact-byte concurrency check. */
let forgeRecoveryIssue=null,forgeRecoveryExported=false;
function inspectForgeRecovery(){
 const panel=$('j312-recovery'),exportButton=$('j312-export'),resetButton=$('j312-reset'),message=$('j312-recovery-message');
 if(!panel)return;
 let raw=null,bad=false;
 try{
  raw=localStorage.getItem(KEY);
  if(raw!==null){
   const value=JSON.parse(raw);
   bad=!plain(value)||value.schema!==1||!plain(value.builds)||
    (Object.hasOwn(value,'variants')&&!plain(value.variants));
  }
 }catch{bad=true}
 if(!bad){forgeRecoveryIssue=null;forgeRecoveryExported=false;panel.hidden=true;return}
 if(!forgeRecoveryIssue||forgeRecoveryIssue.raw!==raw){forgeRecoveryExported=false;forgeRecoveryIssue={raw}}
 panel.hidden=false;
 exportButton.disabled=raw===null;
 resetButton.disabled=!forgeRecoveryExported||raw===null;
 message.textContent=(VI?'Leonida':'GTA V / Online')+' Forge saved data cannot be read safely. Existing bytes were NOT rewritten. Download a raw recovery copy before considering a fresh file for this world. Other Forge worlds and My Garage are never reset by this tool.';
}
function downloadForgeRecovery(){
 inspectForgeRecovery();
 const issue=forgeRecoveryIssue;if(!issue||issue.raw===null){status('No readable original Forge bytes could be exported. No save was changed.');return}
 const backup={schema:'team-jura-forge-recovery-v1',world:WORLD,originalKey:KEY,recordedAt:new Date().toISOString(),unreadableRaw:issue.raw,
  warning:'Original saved bytes. Keep this file before a manual reset; this is not an importable standard Forge preset file.'};
 try{
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=VI?'team-jura-forge-vi-recovery.json':'team-jura-forge-v-recovery.json';
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  forgeRecoveryExported=true;
  $('j312-reset').disabled=false;
  status('Raw Forge recovery download started. Save and inspect the file before choosing a separate confirmed reset.');
 }catch(error){status('Raw recovery export failed. Original Forge storage remains unchanged.')}
}
function resetForgeAfterRecovery(){
 const issue=forgeRecoveryIssue;
 if(!issue||issue.raw===null||!forgeRecoveryExported){status('First export the original saved bytes for this Forge world.');return}
 try{
  if(localStorage.getItem(KEY)!==issue.raw){inspectForgeRecovery();status('A newer tab changed Forge data. Reset stopped; inspect or re-export its current bytes.');return}
  if(!window.confirm('Start fresh ONLY for '+(VI?'Leonida':'GTA V / Online')+' Forge? Keep your downloaded original raw recovery file. All current named and primary Forge designs in this world will be cleared; My Garage and the other world stay untouched.'))return;
  if(localStorage.getItem(KEY)!==issue.raw){inspectForgeRecovery();status('Forge changed in another tab while confirming. Reset canceled.');return}
  const empty={schema:1,builds:{},variants:{}};
  localStorage.setItem(KEY,JSON.stringify(empty));
  storage=empty;
  inspectForgeRecovery();
  refreshVariants();
  if(current&&models.includes(current))selectModel(current);
  status('Fresh '+(VI?'Leonida':'GTA V / Online')+' Forge file created after confirmation. Your other world, Garage and ownership were untouched.');
 }catch(error){status('Fresh Forge reset failed; existing storage was not intentionally replaced. '+String(error.message||error))}
}

function load(){const x=readStored();if(x)storage=x}
function mergeLatest(){
 try{
  const raw=localStorage.getItem(KEY);
  if(raw===null){storage={schema:1,builds:{},variants:{}};return true}
  const latest=JSON.parse(raw);
  if(!plain(latest)||latest.schema!==1||!plain(latest.builds)||
     (Object.hasOwn(latest,'variants')&&!plain(latest.variants)))return false;
  // Latest saved versions are authoritative: stale tabs must not resurrect
  // an explicitly deleted or renamed named variant through a union merge.
  storage={...latest,builds:{...latest.builds},variants:plain(latest.variants)?latest.variants:{}};
  return true;
 }catch{return false}
}
const allowedBody=['auto','sports','truck','standard'];
function normalizedPreset(id,entry){
 if(!plain(entry)||entry.model!==id||!/^#[0-9a-f]{6}$/i.test(entry.paint||'')||
    !allowedBody.includes(entry.body)||typeof entry.name!=='string'||typeof entry.note!=='string')return null;
 return {model:id,paint:entry.paint.toLowerCase(),body:entry.body,name:entry.name.slice(0,72),note:entry.note.slice(0,800),updated:typeof entry.updated==='string'?entry.updated.slice(0,40):'',design:window.JuraForge?.normalize(entry.design,id)||{}};
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
function refreshVariants(){const select=$('forgeVariant');if(!select)return;const previous=select.value;select.replaceChildren(new Option('Choose a named build',''));for(const item of variantsFor(current))select.add(new Option(item.name,item.name));if([...select.options].some(o=>o.value===previous))select.value=previous;$('loadVariant').disabled=!current||!variantsFor(current).length;updateNamedManager()}

/* Atlas 31.1: irreversible actions only after re-reading the exact local key.
   Never normalize/merge and rewrite other vehicles or owners during rename/delete. */
function updateNamedManager(){
 const selected=$('forgeVariant').value;
 const exists=!!current&&variantsFor(current).some(x=>x.name===selected);
 for(const id of ['j311-rename','j311-delete']){const button=$(id);if(button)button.disabled=!exists}
 const input=$('j311-new-name');if(input)input.value=exists?selected:'';
}
function manageNamed(action){
 if(!current||!models.includes(current)){status('Choose a valid vehicle before managing saved versions.');return}
 const selected=$('forgeVariant').value;
 const expected=variantsFor(current).find(v=>v.name===selected);
 if(!expected){status('Select an existing named version first. No saved design was changed.');return}
 const newName=action==='rename'?$('j311-new-name').value.trim().slice(0,72):'';
 if(action==='rename'&&!newName){status('Enter a new non-empty name for this version.');return}
 if(action==='rename'&&newName===selected){status('This version already has that name.');return}
 if(action==='delete'&&!window.confirm('Delete the named design "'+selected+'" for '+title(current)+'? This cannot be undone without an exported backup. Other builds, primary ideas, Garage records and ownership remain unchanged.'))return;
 try{
  const raw=localStorage.getItem(KEY);
  if(raw===null)throw Error('No saved Forge record is available');
  const latest=JSON.parse(raw);
  if(!plain(latest)||latest.schema!==1||!plain(latest.builds)||!plain(latest.variants)||
     !Array.isArray(latest.variants[current])||latest.variants[current].length>VARIANT_LIMIT)
   throw Error('Forge storage needs recovery');
  const array=latest.variants[current];
  if(array.some(v=>!normalizedPreset(current,v)||!variantName(v))||
     new Set(array.map(v=>variantName(v))).size!==array.length)
   throw Error('The selected vehicle has invalid or duplicate saved versions');
  const index=array.findIndex(v=>v.name===selected);
  if(index<0)throw Error('This version no longer exists; reopen the model');
  const currentValue=normalizedPreset(current,array[index]);
  if(JSON.stringify(currentValue)!==JSON.stringify(expected))
   throw Error('Another tab changed this design; reopen the model before editing it');
  if(action==='rename'&&array.some((v,i)=>i!==index&&variantName(v)===newName.toLowerCase()))
   throw Error('Another version already uses that name');
  if(localStorage.getItem(KEY)!==raw)throw Error('A newer Forge save arrived; no change made');
  const nextArray=action==='delete'?array.filter((_,i)=>i!==index):
    array.map((v,i)=>i===index?{...v,name:newName,updated:new Date().toISOString()}:v);
  const next={...latest,variants:{...latest.variants,[current]:nextArray}};
  localStorage.setItem(KEY,JSON.stringify(next));
  storage=next;
  refreshVariants();
  $('forgeVariant').value=action==='rename'?newName:'';
  updateNamedManager();
  updateConceptUrl(current);
  status(action==='rename'?'Renamed '+selected+' to '+newName+'. Paint, concept, notes, other models and Garage remain unchanged.':
   'Deleted only the selected named build '+selected+'. Your primary design, Garage and other saved versions remain unchanged.');
 }catch(error){
  status('Named design NOT changed: '+String(error.message||error)+'. Your stored Forge bytes were preserved.');
 }
}

function saveVariant(){if(!current){status('Choose a vehicle first.');return}if(!mergeLatest()){status('Forge storage needs recovery. No named design was saved; export your original data before retrying.');return}const name=$('buildName').value.trim().slice(0,72);if(!name){status('Enter a design name before saving a named build.');return}const items=variantsFor(current);if(items.some(x=>variantName(x)===name.toLowerCase())){status('That build name already exists. Choose a different name to preserve it.');return}if(items.length>=VARIANT_LIMIT){status('Eight named builds already saved for this vehicle. Export your collection before managing further builds.');return}const entry={model:current,paint,body:$('bodyStyle').value,name,note:$('buildNote').value.trim().slice(0,800),design:window.JuraForge?.normalize(design,current)||{},updated:new Date().toISOString()};storage.variants=mergeVariants(storage.variants,{[current]:[entry]},new Set(models)).merged;refreshVariants();$('forgeVariant').value=name;updateNamedManager();status(persist()?'Named build saved. Your primary design is unchanged.':'Storage unavailable. Export your working collection before closing.')}
function updateConceptUrl(model){try{const url=new URL(location.href);url.searchParams.set('model',model);url.searchParams.delete('variant');if(url.hash.startsWith('#variant='))url.hash='';history.replaceState(null,'',url)}catch{}}
function requestedConceptVariant(model){
 const params=new URLSearchParams(location.search);
 if(params.get('source')==='collection'){
  try{
   const key='team-jura-forge-private-handoff-v1';
   const text=sessionStorage.getItem(key);
   sessionStorage.removeItem(key);
   if(!text)return null;
   const saved=JSON.parse(text);
   return saved&&saved.world===WORLD&&saved.model===model&&
     typeof saved.name==='string'&&saved.name.length<=72?saved.name:null;
  }catch{return null}
 }
 // Old bookmarks can still open a saved name, but new navigation strips the
 // private name from URLs before sharing or further browsing.
 const hash=location.hash||'';
 if(hash.startsWith('#variant=')){try{return decodeURIComponent(hash.slice(9))}catch{return null}}
 return params.get('variant');
}
function loadVariant(){if(!mergeLatest()){status('Saved Forge data is unreadable; no named build was loaded.');return}const name=$('forgeVariant').value;const entry=variantsFor(current).find(x=>x.name===name);if(!entry){status('Choose a named build first.');return}loadWorking(entry);updateConceptUrl(current);status('Loaded named concept '+entry.name+'. Saved designs are unchanged.')}
function prepareImport(payload,existing,known){
 if(!plain(payload)||payload.schema!==1||!plain(payload.builds))throw Error('Not an Atlas concept preset backup');
 if(Object.hasOwn(payload,'world')&&payload.world!==WORLD)throw Error('Backup belongs to a different game world');
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
function title(id){if(VI&&Object.hasOwn(VI_RECORDS,id))return VI_RECORDS[id].name;if(!VI&&id==='ellie')return 'Vapid Ellie';if(!VI){const special=window.JuraForge?.specialtyName?.(id);if(special)return special;}return String(id).replace(/_mk([0-9]+)/g,' Mk $1').replace(/_/g,' ').replace(/([a-z])([0-9])/g,'$1 $2').replace(/\b[a-z]/g,x=>x.toUpperCase())}
function sceneType(id=current,selected=$('bodyStyle').value){const model=String(id).toLowerCase();const category=intel[id]?.category;if(category==='Helicopters')return 'Helicopter concept';if(category==='Planes & Aircraft')return 'Aircraft / Plane concept';if(category==='Boats & Watercraft')return 'Boat / Watercraft concept';if(/helicopter|chopper|buzzard|annihilator|frogger|maverick|swift|volatus|akula|hunter|savage|valkyrie|cargobob|sparrow/.test(model))return 'Helicopter concept';if(/dinghy|squalo|speeder|jetmax|marquis|tropic|suntrap|seashark|tug|boat|submarine|kosatka|longfin|patrolboat|avisa|kraken/.test(model))return 'Boat / Watercraft concept';if(/alkonost|velum|hydra|lazer|^jet$|plane|aircraft|bombushka|titan|miljet|luxor|shamal|dodo|cuban800|besra|pyro|molotok|starling|nokota|seabreeze|mogul|tula|volatol|avenger/.test(model))return 'Aircraft / Plane concept';if(selected==='sports')return'Sports / Coupe concept';if(selected==='truck')return'Truck / Utility concept';if(selected==='standard')return'Sedan / Touring concept';if(/SUV|Off-Road|Trucks & Utility/.test(category||''))return 'Truck / Utility concept';if(/Super|Sports/.test(category||''))return 'Sports concept';if(/^(bfinjection|bifta|bodhi|cavalcade|dune2?|granger|gresley|guardian|habanero|huntley|journey|landstalker|liberator|mesa|patriot|rancherxl|riata|rocoto|sadler|sandking|serrano|slamvan|technical|yosemite|baller|beejayxl|benson|boxville|fq2|minivan|moonbeam|picador|radius|rumpo|speedo|astron|aleutian)$/.test(model)||/truck|pickup|bison|dubsta|rebel|bobcat|burrito|mule|van/.test(model))return 'Pickup / Truck';return /adder|infernus|zentorno|thrax|osiris|t20|sports|cheetah|comet|jester|turismo|banshee|autarch|bullet|coquette|cyclone|deveste|elegy|emerus|entityxf|fmj|lm87|massacro|nero|ninef|prototipo|rapidgt|specter|tempesta|tezeract|tyrant|tyrus|vacca|visione|x80proto|xa21|zorrusso|zr350/.test(model)?'Sports concept':'Touring concept'}
// Divisions describe Elario concept display coverage, not a complete official class taxonomy.
function referenceOnly(id){if(window.JuraForge?.bikeDivision?.(VI?'vi':'v-online',id))return true;if(VI&&VI_RECORDS[id]?.referenceOnly)return true;if(VI&&['vi_crest_kayak','vi_ganado_retro'].includes(id))return true;return /Motorcycles|Emergency & Military/.test(intel[id]?.category||'')||/^(akuma|avarus|bagger|bati|chimera|cruiser|daemon|defiler|diablous|hakuchou|hexer|policeb|ruffian|sanches|sanchez|sovereign|vader|verus|vortex|faggio|oppressor|ambulance|apc|barracks|bus|coach|firetruk|flatbed|halftrack|insurgent|rhino|blimp|raptor)$/.test(id)}
function divisionFor(id){const bike=window.JuraForge?.bikeDivision?.(VI?'vi':'v-online',id);if(bike)return bike;const category=intel[id]?.category||VI_RECORDS[id]?.category||'';if(/Motorcycles/.test(category)||/^(akuma|avarus|bagger|bati2?|chimera|cruiser|daemon2?|defiler|diablous2?|hakuchou2?|hexer|policeb|ruffian|sanchez2?|sovereign|vader|verus|vortex|faggio[23]?|oppressor2?)$/.test(id))return 'motorcycles';if(/Emergency|Military|Service|Commercial|Industrial/.test(category)||/^(ambulance|apc|barracks[23]?|bus|coach|firetruk|flatbed|halftrack|insurgent[23]?|rhino|raptor)$/.test(id))return 'specialty';const type=sceneType(id,'auto');if(/Watercraft/.test(type))return 'marine';if(/Aircraft|Helicopter|Planes/.test(category)||/Aircraft|Helicopter/.test(type))return 'aviation';if(/Utility|Truck/.test(type))return 'utility';if(/Sports/.test(type))return 'performance';return 'touring'}
function matchesDivision(id,division){if(division==='pictured')return VI&&!!window.JuraViVehicleVisuals?.get(id);if(division.startsWith('acquisition-'))return VI&&!!window.JuraForge?.viAcquisitionModels?.('vi',division.slice(12)).includes(id);if(division==='documented-workshops')return !!window.JuraForge?.detailedWorkshopModels?.(VI?'vi':'v-online').includes(id);if(division.startsWith('evidence-'))return VI&&!!window.JuraForge?.viEvidenceModels?.('vi',division.slice(9)).includes(id);if(division==='returning')return !!window.JuraForge?.returningModels?.(VI?'vi':'v-online').includes(id);if(division.startsWith('vi-benefit-'))return VI&&!!window.JuraForge?.viBenefitModels?.('vi',division.slice(11)).includes(id);if(division==='warehouse')return !VI&&!!window.JuraForge?.warehouseModels?.('v-online').includes(id);if(division.startsWith('dealer-'))return !VI&&!!window.JuraForge?.dealershipModels?.('v-online',division.slice(7)).includes(id);if(division==='pegasus')return !VI&&!!window.JuraForge?.pegasusModels?.('v-online').includes(id);if(division==='hsw'||division==='bennys')return !VI&&!!window.JuraForge?.specialtyModels?.(division).includes(id);return division==='all'||(division==='reference'?referenceOnly(id):divisionFor(id)===division)}
function syncDivisionUrl(){try{const url=new URL(location.href),value=$('forgeDivision')?.value||'all';if(value==='all')url.searchParams.delete('division');else url.searchParams.set('division',value);if(!current){url.searchParams.delete('model');url.searchParams.delete('variant');if(url.hash.startsWith('#variant='))url.hash=''}history.replaceState(null,'',url)}catch{}}
function initDivisions(){const label=document.createElement('label');label.textContent='Forge showroom division';const select=document.createElement('select');select.id='forgeDivision';for(const [id,name] of [['all','All vehicle references'],['returning','Returning names & families'],['documented-workshops','Documented model-specific workshops'],['performance','Cars & supercars · performance'],['motorcycles','Motorcycles'],['bicycles','Bicycles & electric bikes'],['scooters','Mopeds & scooters'],['marine','Marine · boats & watercraft'],['aviation','Aviation · aircraft & helicopters'],['utility','Utility · off-road vehicles'],['specialty','Specialty · emergency & military'],['touring','Cars · touring & other road vehicles'],['reference','Reference-only · no suitable 3D body']])select.add(new Option(name,id));if(VI){select.add(new Option('Vehicles with linked pictures','pictured'));for(const [id,label] of Object.entries(window.JuraForge?.viAcquisitionLabels||{}))select.add(new Option('Acquisition · '+label,'acquisition-'+id));for(const [id,label] of Object.entries(window.JuraForge?.viEvidenceLabels||{}))select.add(new Option('Evidence · '+label,'evidence-'+id));for(const [id,label] of [['ultimate','Ultimate Edition / Upgrade references'],['vintage','Vintage Vice City Pack'],['member','GTA+ Story benefits']])select.add(new Option(label,'vi-benefit-'+id))}if(!VI){select.add(new Option('Import/Export · Special Vehicles','warehouse'));for(const [id,name] of Object.entries(window.JuraForge?.dealershipLabels||{})){if(window.JuraForge.dealershipModels('v-online',id).length)select.add(new Option('Purchase source · '+name,'dealer-'+id))}select.add(new Option('Pegasus · ownership only','pegasus'));select.add(new Option("Hao's Special Works · HSW",'hsw'));select.add(new Option("Benny's · base & custom variants",'bennys'))}if(VI){const buckets={primary:document.createElement('optgroup'),special:document.createElement('optgroup'),evidence:document.createElement('optgroup')};buckets.primary.label='Vehicle types';buckets.special.label='Collections and acquisition';buckets.evidence.label='Research and evidence';for(const option of [...select.options]){option.dataset.label=option.textContent;const v=option.value;const target=/^(evidence-|reference$|documented-workshops$)/.test(v)?buckets.evidence:/^(returning$|acquisition-|vi-benefit-|warehouse$|dealer-|pegasus$|hsw$|bennys$)/.test(v)?buckets.special:buckets.primary;target.append(option)}for(const group of Object.values(buckets))if(group.children.length)select.append(group);}const count=document.createElement('p');count.id='forgeModelCount';count.className='c-note';count.setAttribute('role','status');$('modelSearch').closest('label').after(count);const requested=new URLSearchParams(location.search).get('division');select.value=[...select.options].some(o=>o.value===requested)?requested:'all';label.append(select);if(VI){const explanation=document.createElement('small');explanation.textContent='Choose a vehicle type or pictured vehicles. Optional collection and evidence filters are grouped separately.';label.append(explanation);}$('modelSearch').closest('label').before(label);select.addEventListener('change',()=>{if(VI)$('modelSearch').value='';showModels();syncDivisionUrl()})}
function refreshOwnership(){const button=$('forgeOwned'),hint=$('forgeOwnedStatus'),api=window.JuraForge;const key=api?.ownershipKey(VI?'vi':'v-online',current);button.disabled=true;button.setAttribute('aria-pressed','false');button.textContent='Mark owned';if(!key){hint.textContent='Choose a catalog vehicle to track ownership.';return}try{const owned=api.readVehicleCollection(localStorage).data.owned[key]===true;button.disabled=false;button.setAttribute('aria-pressed',String(owned));button.textContent=owned?'✓ Owned — remove mark':'Mark owned';hint.textContent=owned?'Marked owned in your private '+(VI?'GTA VI':'GTA Online')+' collection.':'Not marked owned. Saving a design does not change ownership.'}catch{hint.textContent='Collection data cannot be read safely. Use the vehicle catalog’s Export collection recovery before editing.'}}
function toggleOwnership(){const api=window.JuraForge;try{const world=VI?'vi':'v-online',key=api.ownershipKey(world,current);if(!key)return;const owned=api.readVehicleCollection(localStorage).data.owned[key]===true;api.setVehicleOwned(localStorage,world,current,!owned);refreshOwnership()}catch{refreshOwnership();$('forgeOwnedStatus').textContent='Ownership change blocked; existing data preserved. Retry or export the collection recovery copy.'}}
function status(message){$('builderStatus').textContent=message}
function chooseColor(c){if(!/^#[0-9a-f]{6}$/i.test(c))return;paint=c.toLowerCase();$('paintColor').value=paint;for(const button of $('paintSwatches').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.paint===paint));window.TeamJuraGarage3D?.paint(paint)}
function repaint(){
 refreshOwnership();
 const stage=$('concept3d'),style=$('bodyStyle'),hint=$('bodyStyleHint');
 if(!current){window.TeamJuraGarage3D?.dispose();style.disabled=true;hint.textContent='Choose a model to see its available original concept.';stage.textContent='Choose a model to begin.';return}
 const type=sceneType(current,'auto');
 const craft=window.JuraForge?.craftCustomization?.(VI?'vi':'v-online',current);
 style.disabled=true;
 hint.textContent='Existing vehicle identity is fixed. Only documented model-specific modifications are offered. Legacy body settings are preserved in backups, not applied.';
 if(/Aircraft|Watercraft|Helicopter/.test(type)&&craft){hint.textContent+=' '+craft.label+'.';const ref=document.createElement('a');ref.href='./atlas-credits.html#forge-craft-customization';ref.textContent=' Sources';hint.append(ref)}
 if(!window.TeamJuraGarage3D?.mountReference){stage.textContent='Workshop preview unavailable; vehicle reference and notes remain usable.';return}
 window.TeamJuraGarage3D.mountReference(stage,{name:title(current||'vehicle'),model:current,type,paint,design,onDesign:value=>{design=value}});
}
const GARAGE_PAINTS={'Midnight':'#121727','Pearl White':'#eaeef2','Metallic Orange':'#f58b26','Sunburst Yellow':'#ffce38','Racing Red':'#e44145','Electric Blue':'#249de5','Emerald':'#36a06a','Neon Purple':'#8b40e9','Hot Pink':'#df4c9b','Graphite':'#5b6270'};
function garagePreset(){if(VI)return null;try{const v=JSON.parse(localStorage.getItem('team-jura-atlas93-garage-v1')||'null')?.vehicles?.[current];return v&&typeof v==='object'?{paint:typeof v.paint==='string'&&/^#[0-9a-f]{6}$/i.test(v.paint)?v.paint:GARAGE_PAINTS[v.paint]||DEFAULT,name:v.studioName||v.plate||'',note:v.note||'',body:['auto','sports','truck','standard'].includes(v.studioBody)?v.studioBody:'auto',design:v.studioDesign||{}}:null}catch{return null}}
function loadWorking(existing){
 design=window.JuraForge?.normalize(existing?.design,current)||{};
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
function selectModel(model){if(!models.includes(model))return;current=model;$('modelSelect').value=current;$('stageModel').textContent=title(model)+' · vehicle workshop';$('referenceTitle').textContent=title(model);$('referenceNote').textContent='GTA V archive reference render, where available. A detailed interactive model is pending; documented workshop options are listed separately.';const img=$('referenceImage');img.alt='GTA V archive reference render for '+title(model);img.onerror=()=>{img.onerror=null;const marine=/Watercraft/.test(sceneType());img.src=marine?'./art/elario-watercraft-showroom.webp':'./art/jura161-vehicles.webp';img.alt='Original Elario '+(marine?'marine':'vehicle')+' showroom concept, not a reference render of '+title(model);$('referenceNote').textContent='No matching archive photo. Showing original Elario showroom illustration, not this exact model.'};if(VI){
 const visual=window.JuraViVehicleVisuals?.get(model),div=divisionFor(model);
 const fallback=div==='marine'?'./art/elario-watercraft-showroom.webp':div==='aviation'?'./art/jura155-vi.webp':'./art/jura161-vehicles6.webp';
 const note=$('referenceNote');
 function explain(text){note.textContent=text;const source=document.createElement('a');source.href=VI_RECORDS[model]?.sourceUrl||VI_SOURCE;source.target='_blank';source.rel='noopener noreferrer';source.textContent=VI_RECORDS[model]?.sourceUrl?' View model-specific evidence.':' View official screenshot gallery.';note.append(source);}
 function missing(){if(current!==model)return;img.onload=null;img.onerror=null;img.dataset.referenceKind='concept';img.src=fallback;img.alt='Original Elario '+div+' exhibition scene, not the exact '+title(model);explain('Exact vehicle image unavailable. Original Elario exhibition artwork, not this vehicle. Detailed interactive asset pending; only documented in-game workshop options are offered.');}
 img.onload=null;img.onerror=null;
 if(visual){img.dataset.referenceKind='pending';img.alt=visual.label+' for '+title(model);img.onload=()=>{if(current!==model)return;img.dataset.referenceKind=visual.kind;explain(visual.label+' for '+title(model)+'. Static image, not an editable 3D model. Model image and identity credits are on Sources & Credits.');};img.onerror=missing;img.src=visual.url;explain('Loading a model-specific visual reference…');}else missing();
 $('addToGarage').hidden=true;
}else{img.src=CDN+encodeURIComponent(model)+'.webp';$('addToGarage').href='./atlas93-garage.html?addModel='+encodeURIComponent(model);}const saved=selectedPreset(),fromGarage=!saved?garagePreset():null;const existing=saved||fromGarage;loadWorking(existing);refreshVariants();$('loadGarageBuild').disabled=!garagePreset();status(fromGarage?'Loaded saved Garage build as a working concept. Your Garage record is unchanged.':existing?'Restored your private concept notes for '+title(model):'New concept for '+title(model)+'. Choose a paint color and save your idea.');updateConceptUrl(model)}
function paintButtons(){const root=$('paintSwatches');root.replaceChildren();for(const [name,value]of COLORS){const b=document.createElement('button');b.type='button';b.title=name;b.setAttribute('aria-label','Preview '+name+' concept color');b.style.setProperty('--swatch',value);b.dataset.paint=value;b.setAttribute('aria-pressed',String(value===paint));b.onclick=()=>chooseColor(value);root.append(b)}}
function divisionCounts(){if(!VI)return;const select=$('forgeDivision');if(!select)return;for(const option of select.options){const n=models.filter(id=>matchesDivision(id,option.value)).length;option.dataset.count=String(n);option.textContent=(option.dataset.label||option.textContent)+' ('+n+')';option.disabled=n===0;option.hidden=n===0;}if(select.selectedOptions[0]?.disabled)select.value='all';}
function modelCount(){const node=$('forgeModelCount');if(node)node.textContent=visible.length+' matching vehicle'+(visible.length===1?'':'s')+' · '+models.length+' total references';}
function showModels(){const input=$('modelSearch').value.trim().toLowerCase();const division=$('forgeDivision')?.value||'all';visible=models.filter(x=>matchesDivision(x,division)&&(title(x).toLowerCase().includes(input)||x.includes(input)));modelCount();const sel=$('modelSelect'),prior=current;sel.replaceChildren();if(!visible.length){sel.add(new Option('No matching models',''));current='';refreshVariants();$('loadGarageBuild').disabled=true;$('addToGarage').href='./atlas93-garage.html';$('stageModel').textContent='Choose a vehicle';$('referenceTitle').textContent='No matching vehicle';$('referenceImage').onerror=null;$('referenceImage').alt='Original Elario vehicle showroom illustration';$('referenceImage').src='./art/jura161-vehicles.webp';$('referenceNote').textContent='Original showroom illustration, not a vehicle reference.';repaint();syncDivisionUrl();status('No models match this division and search. Choose another division or clear the search.');return}for(const m of visible)sel.add(new Option(title(m),m));if(visible.includes(prior))sel.value=prior;else selectModel(visible[0]);}
function save(){if(!current){status('Choose a vehicle first.');return}if(!mergeLatest()){status('Forge storage is unreadable; primary design save blocked.');return}const entry={model:current,paint,body:$('bodyStyle').value,name:$('buildName').value.trim().slice(0,72),note:$('buildNote').value.trim().slice(0,800),design:window.JuraForge?.normalize(design,current)||{},updated:new Date().toISOString()};storage.builds[current]=entry;updateConceptUrl(current);if(persist())status('Concept saved locally. Export your presets to back them up.');else status('Storage unavailable. Export your work before closing this page.')}
function saveToGarage(){
 if(VI){status('GTA VI concepts remain separate from the GTA V Garage. Export this concept instead.');return}
 if(!current||!models.includes(current)){status('Choose a catalogued GTA V vehicle before saving to Garage.');return}
 const key='team-jura-atlas93-garage-v1';
 try{
  // Read the latest Garage snapshot, not a copy from page initialization: other tabs may have updated it.
  const raw=localStorage.getItem(key);
  const previous=raw?JSON.parse(raw):{schema:1,garages:[],vehicles:{}};
  if(!previous||typeof previous!=='object'||Array.isArray(previous)||!previous.vehicles||typeof previous.vehicles!=='object'||Array.isArray(previous.vehicles))throw Error('Garage data needs repair or export before updating');
  const existing=previous.vehicles[current];
  if(existing!==undefined&&(!existing||typeof existing!=='object'||Array.isArray(existing)))throw Error('Existing vehicle record is invalid; no changes saved');
  const body=$('bodyStyle').value;
  const updated={...(existing||{}),paint,studioBody:allowedBody.includes(body)?body:'auto',
   studioName:$('buildName').value.trim().slice(0,72),
   note:$('buildNote').value.trim().slice(0,800),
   studioDesign:window.JuraForge?.normalize(design,current)||{}};
  const next={...previous,vehicles:{...previous.vehicles,[current]:updated},updated:new Date().toISOString()};
  localStorage.setItem(key,JSON.stringify(next));
  $('loadGarageBuild').disabled=false;
  status('Saved '+title(current)+' concept to My Garage on this device. Ownership, location, plate, favorites and other vehicles were preserved.');
 }catch(error){status('Garage was not changed: '+error.message+'. Export a backup before retrying.')}
}
function reset(){if(!current)return;updateConceptUrl(current);design=window.JuraForge?.normalize({})||{};paint=DEFAULT;$('paintColor').value=DEFAULT;$('bodyStyle').value='auto';$('buildName').value='';$('buildNote').value='';repaint();for(const b of $('paintSwatches').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.paint===DEFAULT));status('Working concept reset. Your previously saved preset is still stored until you overwrite it.')}
function exportBuilds(){if(!mergeLatest()){status('Forge storage is unreadable; export it through recovery before managing designs.');return}const blob=new Blob([JSON.stringify({...storage,world:WORLD,exported:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=VI?'team-jura-forge-vi-concepts.json':'team-jura-vehicle-concepts.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Concept file exported. Keep your backup somewhere safe.')}
async function importBuilds(event){
 const file=event.target.files?.[0];if(!file)return;
 try{
  if(!models.length)throw Error('Wait for the vehicle catalog before importing');
  if(file.size>2000000)throw Error('Backup exceeds 2 MB');
  const payload=JSON.parse(await file.text());
  if(!mergeLatest())throw Error('Current Forge storage is unreadable; import blocked to preserve it');
  const known=new Set(models);const result=prepareImport(payload,storage.builds,known);const variants=mergeVariants(storage.variants,payload.variants,known);
  if(!result.added&&!variants.added){status('No new presets imported. '+result.kept+' existing kept; '+result.skipped+' invalid or unknown skipped.');return}
  const prior=storage;
  storage={...storage,schema:1,builds:result.merged,variants:variants.merged};
  if(!persist()){storage=prior;throw Error('Browser storage unavailable; existing presets left unchanged')}
  refreshVariants();status(result.added+' new preset(s), '+variants.added+' named build(s) imported; '+result.kept+' existing kept; '+result.skipped+' invalid or unknown skipped. Choose Load saved idea to open the current model’s stored preset.');
 }catch(error){status('Import rejected: '+error.message)}
 finally{event.target.value=''}
}
function loadSelected(){if(!mergeLatest()){status('Forge storage is unreadable; no primary design was loaded.');return}if(!current||!selectedPreset()){status('No saved idea for the selected model. Your working editor is unchanged.');return}selectModel(current)}
async function init(){$('forgeOwned').addEventListener('click',toggleOwnership);window.addEventListener('storage',e=>{if(!e.key||e.key===window.JuraForge?.collectionKey)refreshOwnership()});window.addEventListener('pageshow',refreshOwnership);load();inspectForgeRecovery();paintButtons();$('j312-export').addEventListener('click',downloadForgeRecovery);$('j312-reset').addEventListener('click',resetForgeAfterRecovery);initDivisions();$('saveVariant').addEventListener('click',saveVariant);$('loadVariant').addEventListener('click',loadVariant);$('forgeVariant').addEventListener('change',updateNamedManager);$('j311-rename').addEventListener('click',()=>manageNamed('rename'));$('j311-delete').addEventListener('click',()=>manageNamed('delete'));if(VI){$('j409ViGarage').hidden=false;$('saveBuild').textContent='Save design to My Garage VI';$('addToGarage').hidden=true;$('addToGarage').style.display='none';$('loadGarageBuild').hidden=true;$('saveToGarage').hidden=true;$('modelSearch').placeholder='Cheetah, Squalo, Stanier…';$('builderStatus').textContent='Loading GTA VI official visual reference names…';}$('importBuilds').addEventListener('change',importBuilds);$('loadBuild').addEventListener('click',loadSelected);$('loadGarageBuild').addEventListener('click',loadGarageWorking);$('saveToGarage').addEventListener('click',saveToGarage);window.addEventListener('storage',e=>{if(e.key==='team-jura-atlas93-garage-v1')$('loadGarageBuild').disabled=!current||!garagePreset();if(e.key===KEY)inspectForgeRecovery()});$('modelSearch').addEventListener('input',showModels);$('modelSelect').addEventListener('change',e=>selectModel(e.target.value));$('paintColor').addEventListener('input',e=>chooseColor(e.target.value));$('bodyStyle').addEventListener('change',repaint);$('saveBuild').addEventListener('click',save);$('resetBuild').addEventListener('click',reset);$('resetCamera').addEventListener('click',()=>window.TeamJuraGarage3D?.reset());$('exportBuilds').addEventListener('click',exportBuilds);
 try{if(VI){intel=VI_RECORDS;models=Object.keys(VI_RECORDS).sort((a,b)=>title(a).localeCompare(title(b)))}else{const source=await fetch('./data/atlas-vehicle-intel.json').then(r=>r.ok?r.json():{}).catch(()=>({}));intel=source.vehicles||{};const response=await fetch('./atlas90-seed.json',{cache:'no-cache'});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();models=[...new Set((data.vehicles||[]).filter(m=>typeof m==='string'&&/^[a-z0-9_]{2,75}$/.test(m)))].sort((a,b)=>title(a).localeCompare(title(b)))}if(!models.length)throw Error('No suitable vehicle IDs');divisionCounts();const selected=new URLSearchParams(location.search).get('model');const requestedVariant=requestedConceptVariant(selected);const divisionControl=$('forgeDivision');if(VI&&!selected&&!new URLSearchParams(location.search).has('division')&&[...divisionControl.options].some(o=>o.value==='pictured'&&!o.disabled))divisionControl.value='pictured';if(models.includes(selected)&&!matchesDivision(selected,divisionControl.value)){divisionControl.value='all';syncDivisionUrl()}visible=models.filter(id=>matchesDivision(id,divisionControl.value));modelCount();if(!visible.length){showModels();syncDivisionUrl();return}$('modelSelect').replaceChildren();for(const m of visible)$('modelSelect').add(new Option(title(m),m));const garageHandoff=!VI&&new URLSearchParams(location.search).get('source')==='garage'&&models.includes(selected);selectModel(visible.includes(selected)?selected:visible[0]);if(garageHandoff){const incoming=garagePreset();if(incoming){loadWorking(incoming);status('Opened the saved Garage build as a private Forge working copy. Existing named Forge presets and Garage records are unchanged until you explicitly save.')}else status('This model has no saved Garage build yet. The Forge editor is ready for a new concept.');}const named=models.includes(selected)&&requestedVariant&&variantsFor(current).find(x=>x.name===requestedVariant);if(named&&!garageHandoff){$('forgeVariant').value=named.name;loadWorking(named);updateConceptUrl(current);status('Opened saved named concept '+named.name+'. Existing saved designs are unchanged.')}else if(!garageHandoff&&!selectedPreset()&&!garagePreset())status(models.length+(VI?' official GTA VI screenshot-title references.':' community GTA V model references available.')+' Matching detailed interactive models remain pending; recorded workshop options are available where documented.')}
 catch(e){status('Vehicle source catalog unavailable: '+e.message+'. You can still use My Garage.');$('concept3d').textContent='Catalog unavailable: no source model to show.'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();