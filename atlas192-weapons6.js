/* Atlas 19.2 · GTA VI-only weapon evidence workspace.
 * No GTA V model images, no invented spawn coordinates or performance stats.
 * Source records are separate from private browser-only observation notes.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const KEY='teamjura-vi-weapon-notes-v1';
const make=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
const state={seen:Object.create(null),notes:Object.create(null)};const COLLECTION='team-jura-vi-weapon-collected-v1';let collected=Object.create(null),collectionBlocked=false;let rows=[],query='',group='all',onlySeen=false,onlyCollected=false,variantFilter='all',visualFilter='all';
function readCollected(){const raw=localStorage.getItem(COLLECTION);if(raw===null)return Object.create(null);const v=JSON.parse(raw);if(!v||v.schema!==1||!v.collected||typeof v.collected!=='object'||Array.isArray(v.collected)||Object.values(v.collected).some(x=>x!==true))throw Error('Invalid collection save');return Object.assign(Object.create(null),v.collected)}
function refreshCollected(){try{collected=readCollected();collectionBlocked=false}catch{collectionBlocked=true}}
function writeCollected(next){localStorage.setItem(COLLECTION,JSON.stringify({schema:1,collected:next}));collected=next;collectionBlocked=false}
function toggleCollected(id){try{const next=readCollected();if(next[id])delete next[id];else next[id]=true;writeCollected(next);render();announce('Private GTA VI collection updated.')}catch{collectionBlocked=true;render();announce('Collection storage unavailable or damaged. Existing data was not replaced.')}}
refreshCollected();
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&saved.schema===1){
 for(const field of ['seen','notes'])if(saved[field]&&typeof saved[field]==='object'&&!Array.isArray(saved[field]))Object.assign(state[field],saved[field]);
}}catch(_){}
function announce(msg){if($('viWeaponStatus'))$('viWeaponStatus').textContent=msg}
function save(){try{localStorage.setItem(KEY,JSON.stringify({schema:1,seen:state.seen,notes:state.notes,updated:new Date().toISOString()}));return true}catch(_){announce('Saving is unavailable on this device. Export your research notes.');return false}}
function mediaChoices(r){
 const result=[];
 const m=r.officialMedia;
 if(m?.source==='https://www.rockstargames.com/VI/media/screenshots'&&typeof m.caption==='string'){
  try{const u=new URL(m.url);if(u.origin==='https://www.rockstargames.com'&&/^\/VI\/_next\/static\/media\/ULTIMATE_EDITION_(?:WEAPON_VARIANTS_01|HAWK_AND_LITTLE_MORGAN_REVOLVERS_01)\.[a-zA-Z0-9_~.-]+\.jpg$/.test(u.pathname))result.push({url:u.href,label:m.caption,kind:'official',source:m.source})}catch{}
 }
 const base=r.variantOf?rows.find(x=>x.id===r.variantOf):r;
 const v=base?.visualReference;
 if(v?.provider==='gtax'&&v.source==='https://vi.gtax.dev/weapons'){
  try{const u=new URL(v.image);if(u.origin==='https://vi.gtax.dev'&&/^\/images\/weapons\/[a-z0-9-]+\.webp$/.test(u.pathname)&&!u.search&&!u.hash){
   const family=!!r.variantOf||v.relation==='family';
   result.push({url:u.href,kind:family?'family':'model',label:family?'Base-family image · '+base.name+' · exact variant appearance not verified':'GTA VI community model reference · '+r.name,source:v.source});
  }}catch{}
 }
 return result;
}
// Missing images get a cinematic exhibition, never a mislabeled exact model.
function categoryExample(r){
 const candidate=rows.find(x=>x.id===r.illustrativeExampleOf);
 if(!candidate)return null;
 const m=mediaChoices(candidate).find(x=>x.kind!=='official');
 return m?{...m,kind:'example',label:'Illustrative class reference · '+candidate.name+' · not this exact item'}:null;
}
function classPlate(r){
 const plate=make('div','viweapon-plate');
 plate.dataset.group=r.group.toLowerCase();plate.setAttribute('aria-label','Original Elario Armory exhibition artwork; not an exact GTA VI model');
 const art=make('img','viweapon-concept-art');art.src='./art/jura161-weapons.webp';art.alt='Original Elario Armory exhibition';art.loading='lazy';art.decoding='async';
 const overlay=make('div','viweapon-plate-overlay');overlay.append(make('span','viweapon-plate-kicker','ELARIO / LEONIDA'),make('strong','',r.group),make('small','','Original exhibit artwork · model pending'));
 plate.append(art,overlay);return plate;
}
function visualCard(r){
 const options=mediaChoices(r),example=categoryExample(r);
 const f=make('figure','viweapon-media'),stage=make('div','viweapon-stage'),plate=classPlate(r),cap=make('figcaption','',''),label=make('span','viweapon-media-label','');
 cap.append(label);stage.append(plate);f.append(stage,cap);
 f.dataset.visual='class';f.dataset.hasReference=String(options.length>0);
 const candidates=example?[...options,example]:options;
 let idx=0;function next(){
  const m=candidates[idx++];if(!m){label.textContent=options.length?'Linked image unavailable · original exhibition artwork':'Item-specific image pending · original exhibition artwork';return}
  label.textContent=m.label;const img=make('img','viweapon-linked-image');img.alt=m.label;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
  img.addEventListener('load',()=>{plate.hidden=true;img.classList.add('is-loaded');f.dataset.visual=m.kind;label.textContent=m.label;},{once:true});
  img.addEventListener('error',()=>{img.remove();plate.hidden=false;f.dataset.visual='class';next()},{once:true});
  stage.append(img);img.src=m.url;
 }
 next();return f;
}
function render(){
 const found=rows.filter(r=>(group==='all'||r.group===group)&&(variantFilter==='all'||(variantFilter==='variants'?!!r.variantOf:!r.variantOf))&&(visualFilter==='all'||(visualFilter==='linked'?mediaChoices(r).length>0:mediaChoices(r).length===0))&&(!onlySeen||state.seen[r.id])&&(!onlyCollected||collected[r.id])&&(!query||[r.name,r.group,r.evidence,r.description].join(' ').toLowerCase().includes(query)));
 $('viWeaponCount').textContent=found.length+' of '+rows.length+' referenced items';
 $('viWeaponNoted').textContent=rows.filter(r=>state.seen[r.id]).length+' noted on this device';$('viWeaponCollected').textContent=collectionBlocked?'Collection unavailable':rows.filter(r=>collected[r.id]).length+' collected';
 const root=$('viWeaponCards');root.replaceChildren();
 if(!found.length)root.append(make('p','viweapon-empty','No matching evidence records. Try All classes or remove the search filter.'));
 for(const r of found){
  const card=make('article','viweapon-card');card.dataset.weaponId=r.id;
  const top=make('div','viweapon-card-top');
  const mark=make('span','viweapon-type',r.group);
  const evidence=make('span','viweapon-grade '+(r.grade.includes('Named')?'viweapon-official':'viweapon-observed'),r.grade);
  card.dataset.collected=String(!!collected[r.id]);const ownership=make('span','viweapon-ownership',collectionBlocked?'Collection unavailable':collected[r.id]?'✓ Collected':'Not collected');ownership.dataset.collected=String(!!collected[r.id]);top.append(mark,evidence,ownership);card.append(top);
  const h=make('h3','',r.name);card.append(h);if(r.variantOf){const base=rows.find(x=>x.id===r.variantOf);if(base)card.append(make('p','viweapon-evidence','Named variant · '+base.name));}card.append(visualCard(r));card.append(make('p','viweapon-copy',r.description));
  const disclosure=make('p','viweapon-evidence',r.evidence);card.append(disclosure);
  const actions=make('div','viweapon-actions');
  const noted=make('button','viweapon-note',state.seen[r.id]?'✓ Added to my notes':'+ Mark reviewed');
  noted.type='button';noted.setAttribute('aria-pressed',String(!!state.seen[r.id]));
  noted.addEventListener('click',()=>{state.seen[r.id]=!state.seen[r.id];if(!state.seen[r.id])delete state.seen[r.id];const ok=save();render();if(ok)announce('Personal review updated.');});
  const collect=make('button','viweapon-collect',collected[r.id]?'✓ Collected':'+ Collect');collect.type='button';collect.setAttribute('aria-pressed',String(!!collected[r.id]));collect.disabled=collectionBlocked;collect.onclick=()=>toggleCollected(r.id);actions.append(collect,noted);
  if(r.officialEdition?.source==='https://www.rockstargames.com/VI/editions/ultimate-edition'&&typeof r.officialEdition.label==='string'){
   card.append(make('p','viweapon-evidence',r.officialEdition.label));
  }
  card.append(actions);
  const d=make('details','viweapon-notes');d.append(make('summary','','My research notes'));
  const input=make('textarea','');input.rows=3;input.maxLength=900;input.value=String(state.notes[r.id]||'').slice(0,900);
  input.setAttribute('aria-label','Private research notes for '+r.name);input.placeholder='What did you verify in your own gameplay? No public edits are made.';
  const saveButton=make('button','viweapon-note-save','Save note');saveButton.type='button';
  saveButton.addEventListener('click',()=>{const value=input.value.trim().slice(0,900);if(value)state.notes[r.id]=value;else delete state.notes[r.id];if(save())announce('Saved your note for '+r.name+'.')});
  d.append(input,saveButton);card.append(d);root.append(card);
 }
}
async function importNotes(event){
 const file=event.target.files?.[0];if(!file)return;
 try{
  if(!rows.length)throw Error('Wait for the Leonida evidence catalog');
  if(file.size>1000000)throw Error('Backup exceeds 1 MB');
  const payload=JSON.parse(await file.text());
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  if(!object(payload)||payload.schema!==1||payload.app!=='team-jura-vi-weapons'||payload.scope!=='vi'||!object(payload.notes)||!object(payload.seen))throw Error('Not a GTA VI weapon notes backup');
  let latest;try{latest=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
  const known=new Set(rows.map(r=>r.id));
  const merged={seen:Object.create(null),notes:Object.create(null)};
  let restored=0,kept=0,skipped=0;
  for(const r of rows){
   const id=r.id,priorNote=typeof latest?.notes?.[id]==='string'?latest.notes[id]:state.notes[id];
   if(typeof priorNote==='string'&&priorNote.trim())merged.notes[id]=priorNote.slice(0,900);
   if(latest?.seen?.[id]===true||state.seen[id]===true)merged.seen[id]=true;
  }
  for(const [id,note] of Object.entries(payload.notes)){
   if(!known.has(id)||typeof note!=='string'){skipped++;continue}
   if(!note.trim())continue;
   if(merged.notes[id]){if(merged.notes[id]!==note)kept++;continue}
   merged.notes[id]=note.slice(0,900);restored++;
  }
  for(const [id,seen] of Object.entries(payload.seen)){
   if(!known.has(id)||typeof seen!=='boolean'){skipped++;continue}
   if(seen&&!merged.seen[id]){merged.seen[id]=true;restored++}
  }
  const previous={seen:state.seen,notes:state.notes};state.seen=merged.seen;state.notes=merged.notes;
  if(!save()){state.seen=previous.seen;state.notes=previous.notes;throw Error('Storage unavailable; existing stored notes left unchanged')}
  let collectionResult='';if(payload.collected!==undefined){try{if(!object(payload.collected)||Object.values(payload.collected).some(v=>typeof v!=='boolean'))throw Error('Invalid collection backup');const next=readCollected();let count=0;for(const [id,value] of Object.entries(payload.collected))if(value===true&&known.has(id)&&!next[id]){next[id]=true;count++}writeCollected(next);collectionResult=' '+count+' missing collected marks restored.'}catch{collectionResult=' Collection marks were not changed; review collection storage.'}}
  render();announce(restored+' note/review value(s) restored; '+kept+' note conflict(s) kept; '+skipped+' invalid entries skipped. Existing research preserved.'+collectionResult);
 }catch(error){announce('Import rejected: '+error.message)}
 finally{event.target.value=''}
}
function exportNotes(){
 const payload={schema:1,app:'team-jura-vi-weapons',scope:'vi',exportedAt:new Date().toISOString(),notes:{...state.notes},seen:{...state.seen},collected:{...collected}};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='team-jura-gta-vi-weapon-research.json';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 announce('Exported this device’s GTA VI research notes.');
}
async function start(){
 try{
  const response=await fetch('./data/atlas192-vi-weapons.json',{cache:'no-cache'});
  if(!response.ok)throw Error('Source catalog HTTP '+response.status);
  const raw=await response.json();
  if(raw.schema!==1||raw.scope!=='vi'||raw.kind!=='weapon'||!Array.isArray(raw.records))throw Error('Wrong weapon dataset');
  const seen=new Set();
  rows=raw.records.filter(r=>r&&/^[a-z0-9-]+$/.test(r.id)&&r.name&&r.group&&r.sourceUrl?.startsWith('https://')&&!seen.has(r.id)&&seen.add(r.id));
  const select=$('viWeaponClass');const categories=[...new Set(rows.map(r=>r.group))].sort();
  for(const cls of categories)select.add(new Option(cls,cls));
  $('viWeaponReviewed').textContent='Research snapshot reviewed '+String(raw.reviewedAt||'date not recorded');const benchmark=raw.completenessBenchmark;if(benchmark?.reportedTotal===196){$('viWeaponBenchmark').textContent=rows.length+' catalog references · '+rows.filter(r=>r.variantOf).length+' named variant references. Reported game Progress Database benchmark: 196 items (66 standard, 130 variants). Counts are not yet reconciled one-to-one.';}
  $('viWeaponDisclaimer').textContent=String(raw.disclaimer||'GTA VI sources must be checked per item.');
  const requested=new URLSearchParams(location.search).get('q');if(requested){$('viWeaponSearch').value=requested.slice(0,120);query=$('viWeaponSearch').value.trim().toLowerCase();}
  render();announce('GTA VI source-qualified research loaded. This is not a complete game arsenal.');
 }catch(err){announce('Research catalog unavailable: '+String(err.message).slice(0,120));$('viWeaponCards').replaceChildren(make('p','viweapon-empty','GTA VI records could not load. GTA V records will not be substituted.'))}
 $('viWeaponSearch').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase().slice(0,120);render()});
 $('viWeaponClass').addEventListener('change',e=>{group=e.target.value;render()});
 $('viWeaponVisual').addEventListener('change',e=>{visualFilter=e.target.value;render()});
 $('viWeaponVariant').addEventListener('change',e=>{variantFilter=e.target.value;render()});
 $('viWeaponMine').addEventListener('change',e=>{onlySeen=e.target.checked;render()});$('viWeaponOnlyCollected').addEventListener('change',e=>{onlyCollected=e.target.checked;render()});window.addEventListener('storage',e=>{if(e.key===COLLECTION||e.key===null){refreshCollected();render()}});
 $('viWeaponClear').addEventListener('click',()=>{$('viWeaponSearch').value='';$('viWeaponClass').value='all';$('viWeaponMine').checked=false;$('viWeaponOnlyCollected').checked=false;$('viWeaponVariant').value='all';$('viWeaponVisual').value='all';query='';group='all';onlySeen=false;onlyCollected=false;variantFilter='all';visualFilter='all';render();});
 $('viWeaponExport').addEventListener('click',exportNotes);
 $('viWeaponImport').addEventListener('change',importNotes);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
