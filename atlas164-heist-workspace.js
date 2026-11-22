/* Team Jura Atlas 16.4 — real mission map + guest-only plan. No invented coordinates. */
(()=>{'use strict';
const id=(document.body.dataset.heist||'').trim();
const valid=new Set(['fleeca','prison-break','humane-labs','series-a','pacific-standard','doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino','cayo-perico','cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center']);
if(!valid.has(id)||!document.body.classList.contains('j120-heist-page'))return;
const box=document.querySelector('.mapbox');if(!box||document.getElementById('j164-mission-map'))return;
const node=(tag,cl,txt)=>{const x=document.createElement(tag);if(cl)x.className=cl;if(txt!==undefined)x.textContent=txt;return x};
const map=id==='cayo-perico'?'./atlas-cayo.html':'./atlas-online.html';
const section=node('section','j164-mission-map');section.id='j164-mission-map';section.setAttribute('aria-label','Live Atlas map and personal mission plan');
section.append(node('span','j164-kicker','OPTIONAL REGIONAL MAP · FULL-SIZE ENGINE'),node('h3','j164-title',id==='cayo-perico'?'Original Cayo island & scoping layers':'Wider GTA route-planning map'));
section.append(node('p','j164-desc','Your dedicated mission-specific map and POI tracker are above. Open the wider map here when a setup spans multiple locations. This does not assert verified heist entrances, exits or loot coordinates. Your notes stay in your browser.'));
const bar=node('div','j164-buttons');
const load=node('button','j164-main','Load interactive map');load.type='button';load.setAttribute('aria-expanded','false');load.setAttribute('aria-controls','j164-map-frame');
const open=node('a','j164-other','Open full-size map ↗');open.href=map;
bar.append(load,open);section.append(bar);
const frame=node('iframe','j164-frame');frame.id='j164-map-frame';frame.hidden=true;frame.loading='lazy';frame.title='Atlas '+(id==='cayo-perico'?'Cayo Perico':'GTA Online')+' interactive game map';frame.referrerPolicy='same-origin';section.append(frame);
const feedback=node('p','j164-msg','Map is off until you request it; saves data and memory on phones.');feedback.setAttribute('role','status');section.append(feedback);
load.addEventListener('click',()=>{
 const visible=frame.hidden;
 frame.hidden=!visible;
 if(visible){frame.src=map;load.textContent='Close embedded map';feedback.textContent='Map loaded. Use its existing layers, pins, zoom and routes.';}
 else{frame.removeAttribute('src');load.textContent='Load interactive map';feedback.textContent='Map closed. Your mission notes are still available.';}
 load.setAttribute('aria-expanded',String(visible));
});
const key='teamjura-heist-plan-v1:'+id;
const data=Object.create(null);
try{const old=JSON.parse(localStorage.getItem(key)||'{}');if(old&&typeof old==='object'){for(const k of ['approach','entry','exit','poi','crew'])if(typeof old[k]==='string')data[k]=old[k].slice(0,700)}}catch(_){}
const form=node('section','j164-notes');form.append(node('h4','','My mission plan'));
const fields=[['approach','Approach and setup'],['entry','Entry point'],['exit','Exit route'],['poi','Points of interest and optional loot'],['crew','Crew, vehicles and loadout']];
const used=[];
const saveMsg=node('p','j164-msg','Saved only on this device; no login required.');saveMsg.setAttribute('role','status');
function save(){try{localStorage.setItem(key,JSON.stringify(Object.assign({version:1,heist:id,updatedAt:new Date().toISOString()},data)));saveMsg.textContent='Saved on this device.'}catch(_){saveMsg.textContent='Could not save locally. Use Export plan for a copy.'}}
for(const [k,label] of fields){
 const row=node('label','j164-field');const text=node('textarea');text.rows=2;text.maxLength=700;text.placeholder='Your own gameplay observations';text.value=data[k]||'';
 text.addEventListener('input',()=>{data[k]=text.value;save()});row.append(node('span','',label),text);form.append(row);used.push([k,text]);
}
const actions=node('div','j164-buttons');
const exp=node('button','j164-other','Export plan');exp.type='button';
exp.addEventListener('click',()=>{
 const raw=JSON.stringify({schema:'teamjura-heist-plan-v1',heist:id,notes:Object.fromEntries(used.map(x=>[x[0],x[1].value])),coordinates:'No official or verified coordinates asserted'},null,2);
 const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const link=node('a');link.href=url;link.download='team-jura-'+id+'-plan.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1400);
});
const clear=node('button','j164-other','Clear mission notes');clear.type='button';
clear.addEventListener('click',()=>{if(!confirm('Clear these personal notes? Your existing checklist will be preserved.'))return;for(const [k,t] of used){t.value='';data[k]=''}try{localStorage.removeItem(key)}catch(_){}saveMsg.textContent='Notes cleared. Your mission checklist was not changed.'});
actions.append(exp,clear);
if(id!=='cayo-perico'){
 const restore=node('label','j228-import');restore.append(node('span','','Restore missing notes from a mission backup'));
 const file=node('input');file.type='file';file.accept='.json,application/json';file.setAttribute('aria-describedby','j228-restore-help');
 const help=node('small','','Only imports notes for this mission into empty fields. Existing notes, scoped points, routes and checklists are preserved.');help.id='j228-restore-help';
 restore.append(file,help);
 file.addEventListener('change',async()=>{
  const selected=file.files?.[0];if(!selected)return;
  try{
   if(selected.size>100000)throw Error('Backup exceeds 100 KB');
   const incoming=JSON.parse(await selected.text());
   if(!incoming||incoming.schema!=='teamjura-heist-plan-v1'||incoming.heist!==id||!incoming.notes||typeof incoming.notes!=='object'||Array.isArray(incoming.notes))throw Error('Not a backup for this mission');
   let restored=0,preserved=0;
   // Read the latest values again after file I/O; never overwrite nonempty notes.
   const changes=[];
   for(const [k,t] of used){
    const value=incoming.notes[k];if(typeof value!=='string'||!value.trim())continue;
    if(t.value.trim()){preserved++;continue}
    changes.push([k,t,value.slice(0,700)]);
   }
   for(const [k,t,value] of changes){t.value=value;data[k]=value;restored++}
   if(restored)save();
   const persistFailed=restored&&saveMsg.textContent.startsWith('Could not save');
   saveMsg.textContent=restored+' field(s) restored; '+preserved+' existing kept.'+(persistFailed?' Storage unavailable; export a copy before leaving.':restored?' Saved on this device.':' No changes made.');
  }catch(error){saveMsg.textContent='Import rejected: '+error.message}
  finally{file.value=''}
 });
  form.append(actions,restore,saveMsg);
}else form.append(actions,saveMsg);
section.append(form);box.append(section);
})();