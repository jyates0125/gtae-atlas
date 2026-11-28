/* Player-declared context, no inferred story paths or completion. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else if(root)api.start(root)})(typeof window==='undefined'?null:window,function(){'use strict';
const KEY='team-jura-vi-journeys-v1',SCHEMA='team-jura-vi-journeys-v1',ID=/^vj-[a-f0-9]{32}$/,FIELDS={name:60,chapter:80,character:80,goal:200,notes:4000};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function clean(raw){
 if(raw===null)return {schema:SCHEMA,scope:'vi-story',active:null,profiles:[]};
 if(!object(raw)||raw.schema!==SCHEMA||raw.scope!=='vi-story'||!Array.isArray(raw.profiles)||raw.profiles.length>100)throw Error('Invalid journey backup');
 const ids=new Set(),profiles=raw.profiles.map(p=>{if(!object(p)||typeof p.id!=='string'||!ID.test(p.id)||ids.has(p.id))throw Error('Invalid profile identity');ids.add(p.id);const next={id:p.id};for(const [k,n] of Object.entries(FIELDS)){if(typeof p[k]!=='string'||p[k].length>n||(k==='name'&&!p[k].trim()))throw Error('Invalid profile '+k);next[k]=p[k]}return next});
 if(raw.active!==null&&!ids.has(raw.active)||raw.active===null&&profiles.length)throw Error('Invalid active profile');
 return {schema:SCHEMA,scope:'vi-story',active:raw.active,profiles}
}
function read(store){const raw=store.getItem(KEY);return {raw,state:clean(raw===null?null:JSON.parse(raw))}}
function change(store,fn){const {raw,state}=read(store),next=clean(fn(state));if(store.getItem(KEY)!==raw)throw Error('Concurrent edit; retry');store.setItem(KEY,JSON.stringify(next));return next}
function add(store,id,name){return change(store,s=>{s.profiles.push({id,name:name.trim(),chapter:'',character:'',goal:'',notes:''});s.active=id;return s})}
function select(store,id){return change(store,s=>{if(!s.profiles.some(p=>p.id===id))throw Error('Unknown profile');s.active=id;return s})}
function update(store,id,fields){return change(store,s=>{const p=s.profiles.find(p=>p.id===id);if(!p||Object.keys(fields).some(k=>!Object.hasOwn(FIELDS,k)))throw Error('Invalid profile edit');Object.assign(p,fields);return s})}
function merge(store,backup){const incoming=clean(backup);let conflicts=0,added=0;const state=change(store,s=>{for(const p of incoming.profiles){const old=s.profiles.find(x=>x.id===p.id);if(old){if(JSON.stringify(old)!==JSON.stringify(p))conflicts++;continue}s.profiles.push(p);added++}if(!s.active&&s.profiles.length)s.active=incoming.active||s.profiles[0].id;return s});return {state,added,conflicts}}
function start(w){
 const d=w.document,$=id=>d.getElementById(id),root=$('viJourney');if(!root||new URLSearchParams(w.location.search).get('mode')!=='vi')return;root.hidden=false;
 const controls=['vj-select','vj-new','vj-add','vj-save','vj-export','vj-import','vj-spoilers',...Object.keys(FIELDS).map(k=>'vj-'+k)];
 let state=clean(null),blocked=false,busy=false,dirty=false,rawRecovery=null;
 const status=s=>{$('vj-status').textContent=s};
 function hideNotes(){$('vj-spoilers').checked=false;$('vj-notes').closest('label').hidden=true}
 function buttons(){const has=!!state.active;for(const id of controls)$(id).disabled=blocked||busy;for(const id of ['vj-select','vj-save','vj-spoilers',...Object.keys(FIELDS).map(k=>'vj-'+k)])$(id).disabled=blocked||busy||!has;$('vj-recover').hidden=rawRecovery===null}
 function render(){const select=$('vj-select');select.replaceChildren();for(const p of state.profiles){const o=d.createElement('option');o.value=p.id;o.textContent=p.name;select.append(o)}select.value=state.active||'';const p=state.profiles.find(p=>p.id===state.active);for(const k of Object.keys(FIELDS))$('vj-'+k).value=p?.[k]||'';dirty=false;hideNotes();buttons()}
 function reload(){try{state=read(w.localStorage).state;blocked=false;rawRecovery=null;render();return true}catch{blocked=true;try{rawRecovery=w.localStorage.getItem(KEY)}catch{rawRecovery=null}buttons();status('Saved journey unreadable or unavailable. Editing paused; original bytes preserved.');return false}}
 function download(content,name,type){const a=d.createElement('a'),url=w.URL.createObjectURL(new w.Blob([content],{type}));a.href=url;a.download=name;d.body.append(a);a.click();a.remove();w.setTimeout(()=>w.URL.revokeObjectURL(url),2000)}
 async function mutate(fn,success){if(blocked||busy)return;busy=true;buttons();try{const result=w.navigator.locks?.request?await w.navigator.locks.request(KEY,fn):fn();state=result.state||result;render();status(typeof success==='function'?success(result):success)}catch(e){status('Could not save: '+e.message+'. Existing data and current form retained.')}finally{busy=false;buttons()}}
 function canSwitch(){if(!dirty)return true;status('Save your current edits before switching or adding a playthrough.');$('vj-select').value=state.active||'';return false}
 $('vj-add').onclick=()=>{if(!canSwitch())return;const name=$('vj-new').value.trim();if(!name){status('Enter a playthrough name.');return}const id='vj-'+w.crypto.randomUUID().replace(/-/g,'');mutate(()=>add(w.localStorage,id,name),()=>{$('vj-new').value='';return 'New independent journey created.'})};
 $('vj-select').onchange=()=>{const id=$('vj-select').value;if(canSwitch())mutate(()=>select(w.localStorage,id),'Playthrough selected. Story notes hidden.')};
 for(const k of Object.keys(FIELDS))$('vj-'+k).oninput=()=>{dirty=true;status('Unsaved journey edits.')};
 $('vj-spoilers').onchange=()=>{$('vj-notes').closest('label').hidden=!$('vj-spoilers').checked};
 $('vj-form').onsubmit=e=>{e.preventDefault();const id=state.active,fields=Object.fromEntries(Object.keys(FIELDS).map(k=>[k,$('vj-'+k).value]));mutate(()=>update(w.localStorage,id,fields),'Journey saved on this device.')};
 $('vj-export').onclick=()=>{try{const latest=read(w.localStorage).state;download(JSON.stringify(latest,null,2),'gtae-leonida-journeys.json','application/json');status('Saved profiles exported; unsaved form edits are not included.')}catch(e){status('Export unavailable: '+e.message)}};
 $('vj-recover').onclick=()=>{if(rawRecovery!==null)download(rawRecovery,'gtae-leonida-journeys-original.txt','text/plain')};
 $('vj-import').onchange=async()=>{const file=$('vj-import').files?.[0];$('vj-import').value='';if(!file||!canSwitch())return;try{if(file.size>2000000)throw Error('Backup too large');const backup=JSON.parse(await file.text());await mutate(()=>merge(w.localStorage,backup),r=>r.added+' profile(s) added; '+r.conflicts+' conflict(s) kept local.')}catch(e){status('Restore refused: '+e.message)}};
 w.addEventListener('storage',e=>{if(e.key!==KEY&&e.key!==null)return;if(dirty||busy){status('Another tab changed saved journeys. Save carefully or reload; current form retained.');return}if(reload())status('Saved journeys refreshed.')});
 hideNotes();if(reload())status(state.active?'Choose or update your playthrough.':'Create a named playthrough to begin.');
}
return Object.freeze({KEY,SCHEMA,clean,read,add,select,update,merge,start});
});
