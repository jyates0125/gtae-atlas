/* Atlas 29.9 · one-device heist bundle, safe append-only import.
 * Keep original three progress key families. No network requests or sign-in.
 */
(()=>{'use strict';
const id=String(document.body?.dataset?.heist||'');
const panel=document.querySelector('aside.panel.detail');
if(!/^[a-z0-9-]{3,36}$/.test(id)||!document.body.classList.contains('j120-heist-page')||!panel||document.getElementById('j299-heist-backup'))return;
const LABEL='teamjura-heist-bundle-v1';
const keys={
 checklist:'teamjura-heist-'+id,
 notes:'teamjura-heist-plan-v1:'+id,
 focus:'teamjura-heist-focus-v1:'+id
};
const stepIds=new Set([...document.querySelectorAll('[data-step]')].map(x=>x.dataset.step).filter(x=>typeof x==='string'&&x.length>0&&x.length<=120));
const NOTE_FIELDS=['approach','entry','exit','poi','crew'];
const make=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
const section=make('section','j299-heist-backup');section.id='j299-heist-backup';
const title=make('h3','','Your heist backup');
const intro=make('p','','Save this mission’s checklist, planning notes and route together. The file stays on your device until you choose where to save it.');
const actions=make('div','j299-actions');
const exportButton=make('button','j299-export','Download complete mission backup');exportButton.type='button';
const restore=make('label','j299-restore');
const restoreText=make('span','','Restore missing mission progress');
const file=make('input');file.type='file';file.accept='.json,application/json';file.setAttribute('aria-label','Choose one Team Jura heist backup to restore');
restore.append(restoreText,file);
actions.append(exportButton,restore);
const note=make('p','j299-status','Existing notes, completed steps and selected route remain yours. Imports only add missing progress.');
note.setAttribute('role','status');note.setAttribute('aria-live','polite');
section.append(title,intro,actions,note);panel.append(section);
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function read(key){
 const raw=localStorage.getItem(key);
 if(raw===null)return {raw,value:{}};
 let value;
 try{value=JSON.parse(raw)}catch{throw Error('Existing guest progress is unreadable; no saved data was overwritten.')}
 if(!object(value))throw Error('Existing guest progress has an unsupported shape; nothing was overwritten.');
 return {raw,value};
}
function state(){
 return {checklist:read(keys.checklist),notes:read(keys.notes),focus:read(keys.focus)};
}
const unique=(list,pattern,limit=100)=>{
 if(!Array.isArray(list))return [];
 const out=[],seen=new Set();
 for(const value of list){
  if(typeof value!=='string'||value.length>120||!pattern.test(value)||seen.has(value))continue;
  seen.add(value);out.push(value);
  if(out.length===limit)break;
 }
 return out;
};
const marker=/^m\d{1,3}$/;
const award=/^[\w: -]{1,120}$/;
function exportBundle(){
 try{
  const saved=state();
  const steps=Object.fromEntries([...stepIds].filter(k=>saved.checklist.value[k]===true).map(k=>[k,true]));
  const notes=Object.fromEntries(NOTE_FIELDS.filter(k=>typeof saved.notes.value[k]==='string'&&saved.notes.value[k].trim()).map(k=>[k,saved.notes.value[k].slice(0,700)]));
  const f=saved.focus.value;
  const payload={
   schema:LABEL,heist:id,createdAt:new Date().toISOString(),
   checklist:steps,notes,
   focus:{scoped:unique(f.scoped,marker),route:unique(f.route,marker),awards:unique(f.awards,award)}
  };
  const uri=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  const a=make('a');a.href=uri;a.download='team-jura-'+id+'-complete-backup.json';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(uri),1000);
  note.textContent='Mission backup exported. It contains only this heist’s device progress.';
 }catch(e){note.textContent='Export unavailable: '+String(e.message||e)}
}
exportButton.addEventListener('click',exportBundle);
async function importBundle(selected){
 if(!selected)return;
 if(selected.size>150000)throw Error('The selected file exceeds the 150 KB safety limit.');
 let incoming;
 try{incoming=JSON.parse(await selected.text())}catch{throw Error('That file is not valid JSON.')}
 if(!object(incoming)||incoming.schema!==LABEL||incoming.heist!==id||
   !object(incoming.checklist)||!object(incoming.notes)||!object(incoming.focus))
  throw Error('This is not a compatible backup for this exact heist.');
 const originals=state();
 const steps={...originals.checklist.value};
 const notes={...originals.notes.value};
 const focus={...originals.focus.value};
 let added=0;
 for(const step of stepIds){
  if(incoming.checklist[step]===true&&steps[step]!==true){steps[step]=true;added++}
 }
 for(const name of NOTE_FIELDS){
  const value=incoming.notes[name];
  if(typeof value!=='string'||!value.trim())continue;
  if(typeof notes[name]==='string'&&notes[name].trim())continue;
  notes[name]=value.slice(0,700);added++;
 }
 const oldScoped=unique(focus.scoped,marker),oldAwards=unique(focus.awards,award);
 const incomingScoped=unique(incoming.focus.scoped,marker);
 const incomingAwards=unique(incoming.focus.awards,award);
 const mergedScoped=unique([...oldScoped,...incomingScoped],marker);
 const mergedAwards=unique([...oldAwards,...incomingAwards],award);
 const oldRoute=unique(focus.route,marker);
 const incomingRoute=unique(incoming.focus.route,marker);
 const mergedRoute=oldRoute.length?oldRoute:incomingRoute;
 added+=Math.max(0,mergedScoped.length-oldScoped.length)+Math.max(0,mergedAwards.length-oldAwards.length);
 if(!oldRoute.length&&mergedRoute.length)added+=mergedRoute.length;
 if(!added){note.textContent='No missing progress found. Your existing mission save was preserved.';return}
 const changed={};
 if([...stepIds].some(k=>steps[k]!==originals.checklist.value[k]))changed.checklist=JSON.stringify(steps);
 if(NOTE_FIELDS.some(k=>notes[k]!==originals.notes.value[k]))
  changed.notes=JSON.stringify({...notes,version:1,heist:id,updatedAt:new Date().toISOString()});
 if(mergedScoped.length!==oldScoped.length||mergedAwards.length!==oldAwards.length||
    (!oldRoute.length&&mergedRoute.length))
  changed.focus=JSON.stringify({...focus,schema:1,scoped:mergedScoped,route:mergedRoute,awards:mergedAwards,updatedAt:new Date().toISOString()});
 // Another tab may write while the uploaded file is read. Never overwrite those edits.
 for(const field of Object.keys(keys))if(localStorage.getItem(keys[field])!==originals[field].raw)
  throw Error('Mission progress changed while importing. Nothing was overwritten; try again.');
 const applied=[];
 try{
  for(const [field,text] of Object.entries(changed)){
   localStorage.setItem(keys[field],text);applied.push(field);
  }
 }catch{
  // Local storage is not transactional. Best-effort rollback of only keys we touched.
  for(const field of applied.reverse()){
   try{const previous=originals[field].raw;
    if(previous===null)localStorage.removeItem(keys[field]);
    else localStorage.setItem(keys[field],previous);
   }catch{}
  }
  throw Error('Storage could not be updated. Existing progress was restored where possible.');
 }
 note.textContent='Added '+added+' missing progress item(s) for this mission; reloading the workspace.';
 location.reload();
}
file.addEventListener('change',async()=>{
 const selected=file.files?.[0];if(!selected)return;
 try{await importBundle(selected)}catch(e){note.textContent='Import rejected: '+String(e.message||e)}
 finally{file.value=''}
});
})();
