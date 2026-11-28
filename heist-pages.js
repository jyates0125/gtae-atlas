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
// Atlas 30.1: current heist checkboxes are a view of private saved data.
// Opening a page must never rewrite historical steps or a corrupt stored record.
const key='teamjura-heist-'+heistId;
const checks=[...document.querySelectorAll('[data-step]')];
const notice=document.createElement('p');
notice.id='j301-checklist-notice';
notice.className='j301-checklist-notice';
notice.setAttribute('role','status');
notice.setAttribute('aria-live','polite');
notice.hidden=true;
document.getElementById('progress')?.insertAdjacentElement('afterend',notice);
const showNotice=(message,error=false)=>{
 notice.textContent=message;notice.hidden=!message;notice.dataset.error=String(error);
};
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
let lastGood={};
function readChecklist(){
 let raw=null;
 try{
  raw=localStorage.getItem(key);
  if(raw===null)return {ok:true,raw,value:{}};
  const value=JSON.parse(raw);
  if(!object(value))throw Error('Unsupported checklist save format');
  return {ok:true,raw,value};
 }catch(error){return {ok:false,raw,value:null,error};}
}
function paintProgress(){
 const done=checks.filter(c=>c.checked).length;
 const progress=document.getElementById('progress');
 if(progress)progress.textContent=done+' / '+checks.length+' tracked';
 const bar=document.getElementById('progressBar');
 if(bar)bar.style.width=(checks.length?done/checks.length*100:0)+'%';
}
function applyChecklist(value){
 for(const check of checks)check.checked=value[check.dataset.step]===true;
 paintProgress();
}
function refreshChecklist(){
 const current=readChecklist();
 if(current.ok){
  lastGood=current.value;
  applyChecklist(current.value);
  showNotice('');
 }else{
  // Preserve the last visible good state; prevent a damaged record being
  // silently transformed into an empty, valid record on next click.
  applyChecklist(lastGood);
  showNotice('Saved checklist cannot be read. Export a safety copy before retrying; existing data has NOT been changed.',true);
 }
}
function saveOneStep(step,wanted){
 const latest=readChecklist();
 if(!latest.ok){
  applyChecklist(lastGood);
  showNotice('Checklist not saved: stored data is unreadable. Export a safety copy before recovery.',true);
  return false;
 }
 const next={...latest.value,[step]:wanted};
 try{
  localStorage.setItem(key,JSON.stringify(next));
 }catch(error){
  applyChecklist(latest.value);
  showNotice('Checklist could not be saved in this browser. Export your progress before leaving.',true);
  return false;
 }
 lastGood=next;
 applyChecklist(next);
 showNotice('Checklist saved on this device.');
 return true;
}
for(const check of checks){
 check.addEventListener('change',()=>saveOneStep(check.dataset.step,check.checked));
}
refreshChecklist(); // read only; never write during initial page load
window.addEventListener('storage',event=>{
 if(event.key===key||event.key===null)refreshChecklist();
});
document.getElementById('resetProgress')?.addEventListener('click',()=>{
 if(!window.confirm('Clear this heist checklist? Personal notes and planning routes are kept.'))return;
 const latest=readChecklist();
 if(!latest.ok){
  applyChecklist(lastGood);
  showNotice('Reset blocked: checklist data needs recovery. No saved progress was erased.',true);
  return;
 }
 const next={...latest.value};
 let changed=false;
 // Only current displayed steps are reset. Historical/unknown saved keys
 // remain untouched for old backups and future mission editions.
 for(const check of checks){
  if(next[check.dataset.step]!==false)changed=true;
  next[check.dataset.step]=false;
 }
 if(changed){
  try{localStorage.setItem(key,JSON.stringify(next));}
  catch(error){applyChecklist(latest.value);showNotice('Reset failed: saved data was preserved.',true);return;}
 }
 lastGood=next;applyChecklist(next);showNotice('Current checklist reset; other heist data is preserved.');
});
document.getElementById('exportProgress')?.addEventListener('click',()=>{
 const latest=readChecklist();
 const payload=latest.ok
  ? {heist:heistId,steps:latest.value}
  : {heist:heistId,steps:null,unreadableRaw:latest.raw,warning:'Raw record for recovery only; original bytes were not modified'};
 const a=document.createElement('a');
 let url;
 try{
  url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  a.href=url;a.download='team-jura-'+heistId+'-progress.json';
  document.body.append(a);a.click();a.remove();
  showNotice(latest.ok?'Checklist backup exported.':'Unreadable checklist copied to a recovery JSON file. Existing storage remains untouched.',!latest.ok);
 }catch(error){
  showNotice('Unable to export checklist in this browser.',true);
 }finally{
  if(url)setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
});
const stepSearch=document.getElementById('stepSearch');
stepSearch?.addEventListener('input',()=>{
 const text=stepSearch.value.toLowerCase();
 for(const check of checks)check.closest('.step')?.classList.toggle('hide',!check.dataset.step.toLowerCase().includes(text));
});
// The approved cinematic scenes remain in this page. Add the real map and notes
// as a separate opt-in enhancement so checklist keys and art never change.
if(document.body.classList.contains('j120-heist-page')){
 // One file for guest checklist, notes and personal route; older saves stay in place.
 const backupStyle=document.createElement('link');backupStyle.rel='stylesheet';backupStyle.href='./atlas299-heist-backup.css?v=299';document.head.append(backupStyle);
 const backup=document.createElement('script');backup.async=false;backup.src='./atlas299-heist-backup.js?v=299';document.body.append(backup);
 const style=document.createElement('link');style.rel='stylesheet';style.href='./atlas164-heist-workspace.css?v=164';document.head.append(style);
 const planner=document.createElement('script');planner.async=false;planner.src='./atlas164-heist-workspace.js?v=164';document.body.append(planner);
 // Mission-specific mapped POIs and challenges appear ABOVE the optional regional map.
 const focusStyle=document.createElement('link');focusStyle.rel='stylesheet';focusStyle.href='./atlas167-heist-focus.css?v=4743';document.head.append(focusStyle);
 const focus=document.createElement('script');focus.async=false;focus.src='./atlas167-heist-focus.js?v=4743';document.body.append(focus);
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
 if(heistId==='cayo-perico'){
  const cayoStyle=document.createElement('link');cayoStyle.rel='stylesheet';cayoStyle.href='./atlas171-cayo-board.css?v=171';document.head.append(cayoStyle);
  const cayo=document.createElement('script');cayo.async=false;cayo.src='./atlas171-cayo-board.js?v=171';document.body.append(cayo);
  // Nov 20 owner-approved Cayo flagship: map-first purple/gold layout with dated chests.
  const flagshipStyle=document.createElement('link');flagshipStyle.rel='stylesheet';flagshipStyle.href='./atlas180-cayo-flagship.css?v=4740';document.head.append(flagshipStyle);
  const flagship=document.createElement('script');flagship.async=false;flagship.src='./atlas180-cayo-flagship.js?v=4742';document.body.append(flagship);
  const iconsStyle=document.createElement('link');iconsStyle.rel='stylesheet';iconsStyle.href='./atlas181-cayo-hotspots.css?v=202';document.head.append(iconsStyle);
  const icons=document.createElement('script');icons.async=false;icons.src='./atlas181-cayo-hotspots.js?v=191';document.body.append(icons);
  // The Cayo page loads its map geometry before deferred scripts initialize.
  // Retain support for older cached page shells and failed stylesheet requests.
  const sheet=document.querySelector('link[href*="atlas185-cayo-polish.css"]');
  if(!sheet?.sheet){
   const polishCSS=document.createElement('link');
   polishCSS.rel='stylesheet';polishCSS.href='./atlas185-cayo-polish.css?v=185-mobilefit1';
   document.head.append(polishCSS);
  }
  const polish=document.createElement('script');polish.async=false;polish.src='./atlas185-cayo-polish.js?v=4742';document.body.append(polish);
  const routeStyle=document.createElement('link');routeStyle.rel='stylesheet';routeStyle.href='./atlas186-cayo-route.css?v=187';document.head.append(routeStyle);
  const routePlanner=document.createElement('script');routePlanner.async=false;routePlanner.src='./atlas186-cayo-route.js?v=4742';document.body.append(routePlanner);
  // Atlas 18.8: one user-facing filter selection shared by Cayo icons + personal route.
  const quickStyle=document.createElement('link');quickStyle.rel='stylesheet';quickStyle.href='./atlas188-cayo-flow.css?v=1882';document.head.append(quickStyle);
  const quick=document.createElement('script');quick.async=false;quick.src='./atlas188-cayo-flow.js?v=4741';document.body.append(quick);
 }
}
})();