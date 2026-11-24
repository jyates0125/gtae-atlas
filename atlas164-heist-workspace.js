/* Team Jura Atlas 16.4 — real mission map + guest-only plan. No invented coordinates. */
(()=>{'use strict';
const id=(document.body.dataset.heist||'').trim();
const valid=new Set(['fleeca','prison-break','humane-labs','series-a','pacific-standard','doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino','cayo-perico','cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center']);
if(!valid.has(id)||!document.body.classList.contains('j120-heist-page'))return;
const box=document.querySelector('.mapbox');if(!box||document.getElementById('j164-mission-map'))return;
const node=(tag,cl,txt)=>{const x=document.createElement(tag);if(cl)x.className=cl;if(txt!==undefined)x.textContent=txt;return x};
const map='./atlas-online.html'; // Mainland support for setups; native Cayo already lives on this page.
const section=node('section','j164-mission-map');section.id='j164-mission-map';section.setAttribute('aria-label','Live Atlas map and personal mission plan');
section.append(node('span','j164-kicker','OPTIONAL REGIONAL MAP · FULL-SIZE ENGINE'),node('h3','j164-title',id==='cayo-perico'?'Mainland setup map':'Wider GTA route-planning map'));
section.append(node('p','j164-desc','Your dedicated mission-specific map and POI tracker are above. Open the wider map here when a setup spans multiple locations. This does not assert verified heist entrances, exits or loot coordinates. Your notes stay in your browser.'));
const bar=node('div','j164-buttons');
const load=node('button','j164-main','Load interactive map');load.type='button';load.setAttribute('aria-expanded','false');load.setAttribute('aria-controls','j164-map-frame');
const open=node('a','j164-other','Open full-size map ↗');open.href=map;
bar.append(load,open);section.append(bar);
// Source-graded GTADB.org V landmarks, NOT heist entrance/loot positions.
// IDs below are verified against our attributed local data/gtadb-5.json.
// No x/y duplicated and no false claim of exact finale position.
const atlasSites={
 'fleeca':[['Fleeca Bank · Chumash','L697']],
 'prison-break':[['Bolingbroke Penitentiary','L508']],
 'humane-labs':[['Humane Labs and Research','L553']],
 'pacific-standard':[['Pacific Standard bank','L2013']],
 'cluckin-bell':[['Cluckin’ Bell Farms factory','L1596']],
 'kortz-center':[['Kortz Center','L139']]
};
if(atlasSites[id]){
 const sites=node('div','j298-mission-sites');sites.id='j298-mission-sites';
 sites.append(node('h4','','Find this mission site on the live Los Santos map'));
 const links=node('div','j298-site-links');
 for(const [label,record] of atlasSites[id]){
  const u=new URL(map,document.baseURI);u.searchParams.set('place','gtadb-5-'+record);
  const a=node('a','j298-site-link','◎ '+label+' · inspect source pin');a.href=u.href;
  a.setAttribute('aria-label','Open '+label+' in the interactive GTA Online map');
  links.append(a);
 }
 sites.append(links,node('p','j298-source-note','GTADB.org community landmarks · CC BY 4.0. These are named site references only: pin locations, photos, entrances, mission routes and objectives are not automatically verified heist positions.'));
 section.append(sites);
}
const frame=node('iframe','j164-frame');frame.id='j164-map-frame';frame.hidden=true;frame.loading='lazy';frame.title='Atlas '+(id==='cayo-perico'?'Cayo Perico':'GTA Online')+' interactive game map';frame.referrerPolicy='same-origin';section.append(frame);
const feedback=node('p','j164-msg','Map is off until you request it; saves data and memory on phones.');feedback.setAttribute('role','status');section.append(feedback);
load.addEventListener('click',()=>{
 const visible=frame.hidden;
 frame.hidden=!visible;
 if(visible){frame.src=map;load.textContent='Close embedded map';feedback.textContent='Map loaded. Use its existing layers, pins, zoom and routes.';}
 else{frame.removeAttribute('src');load.textContent='Load interactive map';feedback.textContent='Map closed. Your mission notes are still available.';}
 load.setAttribute('aria-expanded',String(visible));
});
/* Atlas 33.0 · fail-closed guest notes: never write over unreadable storage.
 * Re-read the latest same-heist JSON before EVERY mutation, so stale tabs
 * update only their own field. Export exact corrupt bytes for recovery. */
const key='teamjura-heist-plan-v1:'+id;
const noteFields=[['approach','Approach and setup'],['entry','Entry point'],['exit','Exit route'],['poi','Points of interest and optional loot'],['crew','Crew, vehicles and loadout']];
const knownFields=new Set(noteFields.map(f=>f[0]));
const isPlain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function readNotes(){
 let raw=null;
 try{
  raw=localStorage.getItem(key);
  if(raw===null)return{ok:true,raw,value:{}};
  const value=JSON.parse(raw);
  if(!isPlain(value)||(value.heist!==undefined&&value.heist!==id)||
    noteFields.some(([field])=>value[field]!==undefined&&typeof value[field]!=='string'))
    throw Error('Stored notes have an unsupported format or heist identity');
  return{ok:true,raw,value};
 }catch(error){return{ok:false,raw,error};}
}
function downloadText(text,name){
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
 const link=node('a');link.href=url;link.download=name;
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1400);
}
const form=node('section','j164-notes');form.append(node('h4','','My mission plan'));
const recovery=node('section','j330-notes-recovery');
recovery.id='j330-notes-recovery';recovery.hidden=true;
recovery.setAttribute('role','alert');
const recoveryHeading=node('strong','','Your saved mission notes need recovery');
const recoveryBody=node('p','','The original saved text is unreadable or belongs to another heist. Edits, clearing and importing are disabled. Download the exact stored bytes before attempting repair; nothing has been overwritten.');
const rawButton=node('button','j164-other','Download original unreadable notes');
rawButton.type='button';rawButton.id='j330-raw-notes';
recovery.append(recoveryHeading,recoveryBody,rawButton);
form.append(recovery);
const used=[];
let importFile=null;
const saveMsg=node('p','j164-msg','Saved only on this device; no login required.');
saveMsg.id='j330-notes-status';saveMsg.setAttribute('role','status');saveMsg.setAttribute('aria-live','polite');
const actions=node('div','j164-buttons');
const exp=node('button','j164-other','Export plan');exp.type='button';
const clear=node('button','j164-other','Clear mission notes');clear.type='button';
actions.append(exp,clear);
function setSafety(current,announce=false){
 const unsafe=!current.ok;
 recovery.hidden=!unsafe;
 for(const [,input]of used)input.disabled=unsafe;
 clear.disabled=unsafe;
 if(importFile)importFile.disabled=unsafe;
 if(unsafe||announce)
  saveMsg.textContent=unsafe?'Notes are not writable. Download the exact original for recovery; this browser has not changed it.':'The saved notes are readable again. Changes may be saved.';
 return !unsafe;
}
function hydrate(current,force=false){
 if(!setSafety(current))return;
 for(const [name,input]of used){
  if(force||document.activeElement!==input)input.value=String(current.value[name]||'').slice(0,700);
 }
}
function commitNotes(next,expectedRaw){
 try{
  if(localStorage.getItem(key)!==expectedRaw)throw Error('Notes changed in another tab. Review the latest values and try again.');
  localStorage.setItem(key,JSON.stringify(next));return true;
 }catch(error){
  saveMsg.textContent='Not saved: '+String(error.message||error)+'. Your other saved data is untouched.';
  return false;
 }
}
for(const [name,label]of noteFields){
 const row=node('label','j164-field'),input=node('textarea');
 input.rows=2;input.maxLength=700;input.placeholder='Your own gameplay observations';
 input.addEventListener('input',()=>{
  const latest=readNotes();
  if(!setSafety(latest))return;
  // Change this field only; keep new work in other fields and unknown metadata.
  const next={...latest.value,version:1,heist:id,updatedAt:new Date().toISOString(),[name]:input.value.slice(0,700)};
  if(commitNotes(next,latest.raw))saveMsg.textContent='Saved this field on this device; other mission notes preserved.';
 });
 row.append(node('span','',label),input);form.append(row);used.push([name,input]);
}
rawButton.addEventListener('click',()=>{
 let raw;
 try{raw=localStorage.getItem(key);}
 catch{saveMsg.textContent='Browser storage cannot be accessed; no data was changed.';return;}
 if(raw===null){saveMsg.textContent='No stored bytes are available; nothing was changed.';return;}
 try{
  downloadText(raw,'team-jura-'+id+'-unreadable-notes-raw.txt');
  saveMsg.textContent='Downloaded the exact original saved text. Stored notes remain unchanged.';
 }catch{saveMsg.textContent='Raw export failed; saved bytes were not changed.';}
});
exp.addEventListener('click',()=>{
 const latest=readNotes();
 if(!setSafety(latest)){saveMsg.textContent='Plan export blocked by unreadable stored notes. Use the exact raw download above.';return;}
 const payload={schema:'teamjura-heist-plan-v1',heist:id,
  notes:Object.fromEntries(noteFields.map(([name])=>[name,String(latest.value[name]||'').slice(0,700)])),
  coordinates:'No official or verified coordinates asserted'};
 try{
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  const link=node('a');link.href=url;link.download='team-jura-'+id+'-plan.json';
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1400);
  saveMsg.textContent='Exported the latest device notes for this mission only.';
 }catch{saveMsg.textContent='Plan export unavailable; stored data was not changed.';}
});
clear.addEventListener('click',()=>{
 const latest=readNotes();
 if(!setSafety(latest))return;
 if(!confirm('Clear this mission’s five notes? Your checklist, route and unknown saved metadata will be preserved.'))return;
 const refreshed=readNotes();
 if(!setSafety(refreshed))return;
 const next={...refreshed.value};
 for(const [name]of noteFields)delete next[name];
 const hasOther=Object.keys(next).length>0;
 try{
  if(localStorage.getItem(key)!==refreshed.raw)throw Error('Other-tab changes detected; clear cancelled');
  if(hasOther)localStorage.setItem(key,JSON.stringify({...next,updatedAt:new Date().toISOString()}));
  else localStorage.removeItem(key);
 }catch(error){saveMsg.textContent='Notes not cleared: '+String(error.message||error);return;}
 for(const [,input]of used)input.value='';
 saveMsg.textContent='Only these five notes cleared; checklist, route and other saved fields kept.';
});
if(id!=='cayo-perico'){
 const restore=node('label','j228-import');restore.append(node('span','','Restore missing notes from a mission backup'));
 const file=node('input');file.type='file';file.accept='.json,application/json';file.setAttribute('aria-describedby','j228-restore-help');importFile=file;
 const help=node('small','','Only imports notes for this mission into empty fields. Existing notes, scoped points, routes and checklists are preserved.');help.id='j228-restore-help';
 restore.append(file,help);
 file.addEventListener('change',async()=>{
  const selected=file.files?.[0];if(!selected)return;
  try{
   if(selected.size>100000)throw Error('Backup exceeds 100 KB');
   const incoming=JSON.parse(await selected.text());
   if(!isPlain(incoming)||incoming.schema!=='teamjura-heist-plan-v1'||incoming.heist!==id||!isPlain(incoming.notes))
    throw Error('Not a compatible backup for this mission');
   // Read AFTER file I/O. Never use a stale DOM value as evidence that a
   // currently populated saved field is empty.
   const latest=readNotes();
   if(!setSafety(latest))throw Error('Unreadable saved notes; use raw recovery first');
   const next={...latest.value};let restored=0,preserved=0;
   for(const [name]of noteFields){
    const incomingValue=incoming.notes[name];
    if(typeof incomingValue!=='string'||!incomingValue.trim())continue;
    if(typeof next[name]==='string'&&next[name].trim()){preserved++;continue;}
    next[name]=incomingValue.slice(0,700);restored++;
   }
   if(restored){
    if(!commitNotes({...next,version:1,heist:id,updatedAt:new Date().toISOString()},latest.raw))return;
    hydrate(readNotes(),true);
   }
   saveMsg.textContent=restored+' field(s) restored; '+preserved+' saved field(s) preserved.'+(restored?' Saved on this device.':' No changes made.');
  }catch(error){saveMsg.textContent='Import rejected: '+String(error.message||error)}
  finally{file.value='';}
 });
 form.append(actions,restore,saveMsg);
}else form.append(actions,saveMsg);
window.addEventListener('storage',event=>{
 if(event.key===key||event.key===null)hydrate(readNotes());
});
window.addEventListener('pageshow',()=>hydrate(readNotes()));
section.append(form);box.append(section);
hydrate(readNotes(),true);
})();