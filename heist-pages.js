(()=>{'use strict';
// Use the completed original Elario/Team Jura heist illustrations, not a
// repeated generic skyline. These are not calibrated map baselayers.
const heistId=String(document.body.dataset.heist||'');
const scene=document.querySelector('.mapbox > img');
if(scene && /^[a-z0-9-]+$/.test(heistId)){
 // Never overwrite owner-approved cinematic art with legacy SVG content.
 const premium='./art/jura159-heist-'+heistId+'.webp';
 if(scene.getAttribute('src')!==premium)scene.setAttribute('src',premium);
 scene.alt='Original cinematic Elario mission concept; not an in-game map or route';
 scene.loading='eager';
 scene.fetchPriority='high'; // Prioritize the approved local cinematic cover over deferred accessories.
 scene.decoding='async';
}
// Atlas 30.1 — keep guest checklist loads read-only and isolate step edits.
// The other two progress keys (mission notes and schematic route) are untouched.
const key='teamjura-heist-'+(document.body.dataset.heist||'unknown');
const checks=[...document.querySelectorAll('[data-step]')];
const valid=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const reset=document.getElementById('resetProgress');
const exportProgress=document.getElementById('exportProgress');
const progress=document.getElementById('progress');
const bar=document.getElementById('progressBar');
const status=document.createElement('p');status.id='j301-checklist-status';
status.className='j301-checklist-status';status.setAttribute('role','status');
status.textContent='Checklist updates save locally; simply opening a page never rewrites saved steps.';
const rescue=document.createElement('div');rescue.className='j301-rescue';rescue.hidden=true;
const downloadRaw=document.createElement('button');downloadRaw.type='button';
downloadRaw.id='j301-rescue-download';downloadRaw.textContent='Download raw rescue copy';
const repair=document.createElement('button');repair.type='button';repair.id='j301-rescue-reset';
repair.textContent='Reset damaged checklist';repair.disabled=true;
rescue.append(downloadRaw,repair);
(bar?.parentElement||progress)?.after(status,rescue);
const style=document.createElement('link');style.rel='stylesheet';style.href='./atlas301-heist-checklist.css?v=301';document.head.append(style);
const readChecklist=()=>{
 const raw=localStorage.getItem(key);
 if(raw===null)return{raw:null,value:{}};
 const value=JSON.parse(raw);
 if(!valid(value))throw Error('Saved checklist has an unsupported shape');
 return{raw,value};
};
let badRaw=null,downloaded=false,locked=false;
function draw(){
 const done=checks.filter(x=>x.checked).length;
 if(progress)progress.textContent=done+' / '+checks.length+' tracked';
 if(bar)bar.style.width=(checks.length?done/checks.length*100:0)+'%';
}
function unlock(){
 locked=false;badRaw=null;downloaded=false;
 checks.forEach(x=>x.disabled=false);
 if(reset)reset.disabled=false;
 if(exportProgress)exportProgress.disabled=false;
 rescue.hidden=true;repair.disabled=true;
}
function lock(message){
 locked=true;
 checks.forEach(x=>x.disabled=true);
 if(reset)reset.disabled=true;
 if(exportProgress)exportProgress.disabled=true;
 rescue.hidden=badRaw===null;
 repair.disabled=!downloaded;
 status.textContent=message||'Saved checklist is unreadable. Nothing has been overwritten. Download a raw copy before choosing an explicit reset.';
}
function loadReadOnly(){
 try{
  const state=readChecklist().value;
  unlock();
  for(const item of checks)item.checked=state[item.dataset.step]===true;
 }catch(error){
  try{badRaw=localStorage.getItem(key)}catch{badRaw=null}
  lock('Saved checklist cannot be read. Your original bytes are preserved; download the raw rescue copy before resetting this checklist.');
 }
 draw();
}
for(const item of checks){
 item.addEventListener('change',()=>{
  if(locked)return;
  const requested=item.checked;
  try{
   // Re-read the newest per-heist record; preserve unknown and concurrent steps.
   const latest=readChecklist().value;
   const next={...latest,[item.dataset.step]:requested};
   localStorage.setItem(key,JSON.stringify(next));
   for(const other of checks)other.checked=next[other.dataset.step]===true;
   status.textContent='Saved only this mission’s checklist change on this device.';
  }catch(error){
   try{badRaw=localStorage.getItem(key)}catch{badRaw=null}
   lock('Checklist save blocked; existing storage was not overwritten. Reload or recover the saved checklist before editing.');
  }
  draw();
 });
}
loadReadOnly();
window.addEventListener('storage',event=>{
 if(event.key!==key&&event.key!==null)return;
 loadReadOnly();
 if(!locked)status.textContent='Checklist synchronized with another tab without rewriting saved data.';
});
reset?.addEventListener('click',()=>{
 if(locked)return;
 if(!confirm('Clear this heist checklist? Your notes, route and other mission progress will remain saved.'))return;
 try{
  const latest=readChecklist().value;
  const next={...latest};
  for(const item of checks)next[item.dataset.step]=false;
  localStorage.setItem(key,JSON.stringify(next));
  checks.forEach(item=>item.checked=false);
  status.textContent='Checklist cleared. Your other heist notes and routes were preserved.';
 }catch(error){
  try{badRaw=localStorage.getItem(key)}catch{badRaw=null}
  lock('Checklist reset blocked; no existing progress was replaced.');
 }
 draw();
});
exportProgress?.addEventListener('click',()=>{
 if(locked)return;
 try{
  const latest=readChecklist().value;
  const steps=Object.fromEntries(checks.map(x=>[x.dataset.step,latest[x.dataset.step]===true]));
  const payload=JSON.stringify({heist:heistId,steps},null,2);
  const url=URL.createObjectURL(new Blob([payload],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='team-jura-'+heistId+'-progress.json';
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.textContent='Exported current saved checklist, including newer changes from other tabs.';
 }catch(error){
  try{badRaw=localStorage.getItem(key)}catch{badRaw=null}
  lock('Checklist export blocked; no saved progress was modified.');
 }
});
downloadRaw.addEventListener('click',()=>{
 if(badRaw===null)return;
 const url=URL.createObjectURL(new Blob([badRaw],{type:'text/plain;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='team-jura-'+heistId+'-raw-checklist-recovery.txt';
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 downloaded=true;repair.disabled=false;
 status.textContent='Raw recovery copy downloaded. An optional reset will only affect this mission’s damaged checklist, after confirmation.';
});
repair.addEventListener('click',()=>{
 if(!locked||!downloaded||badRaw===null)return;
 if(!confirm('Replace this heist’s unreadable checklist with an empty checklist? Your raw rescue copy is saved; notes, routes and other heists stay intact.'))return;
 try{
  if(localStorage.getItem(key)!==badRaw)throw Error('Changed since backup');
  localStorage.setItem(key,'{}');
  loadReadOnly();
  status.textContent='Damaged checklist reset after your confirmation. Other heist progress was preserved.';
 }catch(error){
  status.textContent='Repair blocked: the saved record changed or storage is unavailable. No reset completed.';
 }
});
const search=document.getElementById('stepSearch');search?.addEventListener('input',()=>{const q=search.value.toLowerCase();checks.forEach(x=>x.closest('.step').classList.toggle('hide',!x.dataset.step.toLowerCase().includes(q)))});// The approved cinematic scenes remain in this page. Add the real map and notes
// as a separate opt-in enhancement so checklist keys and art never change.
if(document.body.classList.contains('j120-heist-page')){
 // One file for guest checklist, notes and personal route; older saves stay in place.
 const backupStyle=document.createElement('link');backupStyle.rel='stylesheet';backupStyle.href='./atlas299-heist-backup.css?v=299';document.head.append(backupStyle);
 const backup=document.createElement('script');backup.async=false;backup.src='./atlas299-heist-backup.js?v=299';document.body.append(backup);
 const style=document.createElement('link');style.rel='stylesheet';style.href='./atlas164-heist-workspace.css?v=164';document.head.append(style);
 const planner=document.createElement('script');planner.async=false;planner.src='./atlas164-heist-workspace.js?v=164';document.body.append(planner);
 // Mission-specific mapped POIs and challenges appear ABOVE the optional regional map.
 const focusStyle=document.createElement('link');focusStyle.rel='stylesheet';focusStyle.href='./atlas167-heist-focus.css?v=167';document.head.append(focusStyle);
 const focus=document.createElement('script');focus.async=false;focus.src='./atlas167-heist-focus.js?v=191';document.body.append(focus);
 const guideStyle=document.createElement('link');guideStyle.rel='stylesheet';guideStyle.href='./atlas168-heist-guides.css?v=168';document.head.append(guideStyle);
 const guide=document.createElement('script');guide.async=false;guide.src='./atlas168-heist-guides.js?v=168';document.body.append(guide);
 const viewsStyle=document.createElement('link');viewsStyle.rel='stylesheet';viewsStyle.href='./atlas169-heist-views.css?v=169';document.head.append(viewsStyle);
 const views=document.createElement('script');views.async=false;views.src='./atlas169-heist-views.js?v=169';document.body.append(views);
 // Atlas 29.8 phases coexist with the independent Atlas 29.9 complete backup.
 // The Cayo flagship keeps its own island-view workflow and is intentionally excluded.
 if(heistId!=='cayo-perico'){
  const phasesStyle=document.createElement('link');phasesStyle.rel='stylesheet';phasesStyle.href='./atlas298-heist-map-kit.css?v=298';document.head.append(phasesStyle);
  const phases=document.createElement('script');phases.async=false;phases.src='./atlas298-heist-map-kit.js?v=298';document.body.append(phases);
 }
 if(heistId!=='cayo-perico'){
  const phasesStyle=document.createElement('link');phasesStyle.rel='stylesheet';phasesStyle.href='./atlas298-heist-map-kit.css?v=298';document.head.append(phasesStyle);
  const phases=document.createElement('script');phases.async=false;phases.src='./atlas298-heist-map-kit.js?v=298';document.body.append(phases);
 }
 if(heistId==='cayo-perico'){
  const cayoStyle=document.createElement('link');cayoStyle.rel='stylesheet';cayoStyle.href='./atlas171-cayo-board.css?v=171';document.head.append(cayoStyle);
  const cayo=document.createElement('script');cayo.async=false;cayo.src='./atlas171-cayo-board.js?v=171';document.body.append(cayo);
  // Nov 20 owner-approved Cayo flagship: map-first purple/gold layout with dated chests.
  const flagshipStyle=document.createElement('link');flagshipStyle.rel='stylesheet';flagshipStyle.href='./atlas180-cayo-flagship.css?v=180';document.head.append(flagshipStyle);
  const flagship=document.createElement('script');flagship.async=false;flagship.src='./atlas180-cayo-flagship.js?v=180';document.body.append(flagship);
  const iconsStyle=document.createElement('link');iconsStyle.rel='stylesheet';iconsStyle.href='./atlas181-cayo-hotspots.css?v=202';document.head.append(iconsStyle);
  const icons=document.createElement('script');icons.async=false;icons.src='./atlas181-cayo-hotspots.js?v=191';document.body.append(icons);
  // The Cayo page loads its map geometry before deferred scripts initialize.
  // Retain support for older cached page shells and failed stylesheet requests.
  const sheet=document.querySelector('link[href*="atlas185-cayo-polish.css"]');
  if(!sheet?.sheet){
   const polishCSS=document.createElement('link');
   polishCSS.rel='stylesheet';polishCSS.href='./atlas185-cayo-polish.css?v=185';
   document.head.append(polishCSS);
  }
  const polish=document.createElement('script');polish.async=false;polish.src='./atlas185-cayo-polish.js?v=185';document.body.append(polish);
  const routeStyle=document.createElement('link');routeStyle.rel='stylesheet';routeStyle.href='./atlas186-cayo-route.css?v=187';document.head.append(routeStyle);
  const routePlanner=document.createElement('script');routePlanner.async=false;routePlanner.src='./atlas186-cayo-route.js?v=191';document.body.append(routePlanner);
  // Atlas 18.8: one user-facing filter selection shared by Cayo icons + personal route.
  const quickStyle=document.createElement('link');quickStyle.rel='stylesheet';quickStyle.href='./atlas188-cayo-flow.css?v=1882';document.head.append(quickStyle);
  const quick=document.createElement('script');quick.async=false;quick.src='./atlas188-cayo-flow.js?v=1883';document.body.append(quick);
 }
}
})();