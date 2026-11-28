/* Atlas 13.1 optional account preparation + manual device-portable backup.
 * Never handles passwords/tokens; no cloud sync is claimed or simulated.
 * A strict allowlist prevents exporting unrelated origins' app data. */
(()=>{'use strict';
const APP='Elario Studios Team Jura Atlas';
const VERSION=1;
const MAX_BYTES=5_000_000;
const EXACT=new Set([
'jura3-progress','team-jura-passport-v74',
 'team-jura-my-crew-v1','team-jura-world-profiles-v2',
'team-jura-atlas81-hq-v1','team-jura-checklist-v54',
'team-jura-atlas90-collection-v1','team-jura-atlas96-parking-v1',
'team-jura-atlas97-last-workspace-v1','team-jura-atlas98-style-bookmarks-v1'
]);
const PREFIXES=['team-jura-atlas','team-jura-passport','team-jura-checklist','team-jura-garage','jura3-'];
const BLOCK=/(?:auth|session|token|secret|password|credential|private|api[-_]?key|oauth|access[-_]?key|refresh)/i;
const validKey=(key)=>typeof key==='string' && key.length<150 && !BLOCK.test(key) && (EXACT.has(key)||PREFIXES.some(x=>key.startsWith(x))||window.JuraVIBackup?.isKey(key)===true);
const msg=(s)=>{const el=document.getElementById('j131ProgressStatus');if(el)el.textContent=s};
function collect(){
 const saves={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!validKey(key))continue;const value=localStorage.getItem(key);if(typeof value!=='string')continue;if(value.length>1_500_000)continue;saves[key]=value}
 return saves;
}
function download(obj){
 const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});
 if(blob.size>MAX_BYTES){msg('Your progress exceeds this backup limit. Use individual tool exports for large images or collections.');return}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='team-jura-atlas-backup.json';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(a.href),5000);
 msg('Backup exported. Save the JSON in iCloud Drive or another location you control before clearing the device.');
}
function withLocks(keys,task){return navigator.locks?.request?keys.reduceRight((next,key)=>()=>navigator.locks.request(key,next),task)():task()}
async function restore(file){
 if(!file)return;try{
  if(file.size>MAX_BYTES)throw Error('Backup exceeds the 5 MB safety limit.');
  const parsed=JSON.parse(await file.text());
  if(!parsed||parsed.app!==APP||parsed.version!==VERSION||!parsed.saves||typeof parsed.saves!=='object'||Array.isArray(parsed.saves))throw Error('Not a compatible Team Jura Atlas backup.');
  let entries=Object.entries(parsed.saves);
  if(entries.length>300)throw Error('This backup contains too many entries.');
  if(entries.some(([k,v])=>!validKey(k)||typeof v!=='string'||v.length>1_500_000))throw Error('Backup contains an unsupported storage entry.');
  if(!entries.length){msg('The backup has no saved Atlas progress. Nothing was changed.');return}
  const crewKeys=new Set(['team-jura-my-crew-v1','team-jura-world-profiles-v2']);
  const hasCrew=entries.some(([key])=>crewKeys.has(key));
  if(!confirm('Restore '+entries.length+' Atlas progress records? Matching older records will be overwritten. Crew, Leonida journeys and Discovery records merge without replacing existing notes or profiles. Continue?')){msg('Restore cancelled. Nothing was changed.');return}
  const vi=window.JuraVIBackup,viKeys=vi?.locks(parsed.saves)||[];
  await withLocks(viKeys,()=>{
  const viPlan=viKeys.length?vi.plan(localStorage,parsed.saves):null;
  if(viPlan){entries=entries.filter(([key])=>!vi.isKey(key));entries.push(...viPlan.entries)}
  let crewPlan=null;
  if(hasCrew){
   if(!window.JuraCrewProfiles?.planBackupRestore)throw Error('Crew backup support is unavailable. No records were changed.');
   crewPlan=window.JuraCrewProfiles.planBackupRestore(localStorage,parsed.saves);
   entries=entries.filter(([key])=>!crewKeys.has(key));
   entries.push([crewPlan.key,crewPlan.value]);
  }
  // Validate all crew input before committing any records. Roll back if storage fails.
  if(viPlan&&[...viPlan.before].some(([key,value])=>localStorage.getItem(key)!==value))throw Error('Leonida progress changed while preparing the restore. No records changed.');
  const original=new Map(entries.map(([k])=>[k,localStorage.getItem(k)]));
  const written=[];
  try{for(const [k,v] of entries){localStorage.setItem(k,v);written.push(k)}}
  catch(err){for(const k of written){const old=original.get(k);try{if(old===null)localStorage.removeItem(k);else localStorage.setItem(k,old)}catch(_){}}throw Error('Device storage is full or unavailable. Existing progress was restored where possible.')}
  msg(entries.length+' Atlas records restored.'+(crewPlan?' Crew profiles merged; '+crewPlan.conflicts+' existing conflicts kept.':'')+(viPlan?' Leonida profiles and Discovery merged; '+(viPlan.journeyConflicts+viPlan.discoveryConflicts)+' existing conflicts kept.':'')+' Reload the dashboard and maps to see your saved progress.');
  });
 }catch(err){msg(err?.message||'Unable to read this backup.')}
}
function init(){
 const backup=document.getElementById('j131Export');
 backup?.addEventListener('click',()=>{try{const saves=collect();download({app:APP,version:VERSION,exportedAt:new Date().toISOString(),saves});if(!Object.keys(saves).length)msg('Backup exported, but no Atlas game progress was found in this browser yet.')}catch(_){msg('Could not read game progress from this browser.')}});
 document.getElementById('j131Import')?.addEventListener('change',async e=>{const input=e.target,file=input.files?.[0];input.disabled=true;try{await restore(file)}finally{input.value='';input.disabled=false}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
