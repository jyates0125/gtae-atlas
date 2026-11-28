/* Stable objective identities: separate from map source IDs, slot numbers and manual counters. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else if(root)root.JuraObjectives=api})(typeof window==='undefined'?null:window,function(){'use strict';
const SCHEMA='team-jura-objectives-v1',SAVE='team-jura-objective-progress-v1';
const KEY=SAVE+':vi-story',ID=/^vi-o-[0-9a-f]{12}$/,ALIAS=/^[a-z0-9][a-z0-9-]{0,79}$/;
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function fail(s){throw Error(s)}
function registry(raw,previous){
 if(!object(raw)||raw.schema!==SCHEMA||raw.scope!=='vi-story'||!Number.isInteger(raw.revision)||raw.revision<1||!Array.isArray(raw.rows))fail('Invalid objective registry');
 const ids=new Map(),aliases=new Map();
 for(const row of raw.rows){
  if(!object(row)||typeof row.id!=='string'||!ID.test(row.id)||ids.has(row.id)||!['visit','play','collect','complete'].includes(row.action)||typeof row.name!=='string'||!row.name.trim()||typeof row.category!=='string'||!ALIAS.test(row.category)||!['active','retired'].includes(row.status)||!Array.isArray(row.aliases)||!row.aliases.length)fail('Invalid or duplicate objective');
  if(row.status==='active'&&(!Array.isArray(row.sources)||!row.sources.length||row.sources.some(s=>typeof s!=='string'||!/^https:\/\/[^\s]+$/.test(s))))fail('Missing source evidence');
  for(const a of row.aliases){if(typeof a!=='string'||!ALIAS.test(a)||aliases.has(a))fail('Invalid or duplicate alias');aliases.set(a,row.id)}
  ids.set(row.id,row);
 }
 if(previous){
  const old=registry(previous);
  if(raw.revision<=previous.revision)fail('Registry revision must advance');
  for(const [id,row] of old.ids){const next=ids.get(id);if(!next||next.action!==row.action||(row.status==='retired'&&next.status!=='retired'))fail('Identity removed, repurposed or resurrected');}
  for(const [a,id] of old.aliases){if(aliases.get(a)!==id)fail('Historical alias removed or reassigned')}
 }
 return {ids,aliases};
}
function empty(){return {schema:SAVE,scope:'vi-story',items:{}}}
function clean(raw){
 if(raw===null)return empty();
 if(!object(raw)||raw.schema!==SAVE||raw.scope!=='vi-story'||!object(raw.items))fail('Invalid saved progress');
 const result=empty();
 for(const [id,v] of Object.entries(raw.items)){
  if(!ID.test(id)||!object(v)||typeof v.done!=='boolean'||typeof v.queued!=='boolean'||typeof v.note!=='string'||v.note.length>1000)fail('Invalid saved objective');
  result.items[id]={done:v.done,queued:v.queued,note:v.note};
 }
 return result;
}
function read(store){const raw=store.getItem(KEY);return {raw,state:clean(raw===null?null:JSON.parse(raw))}}
function write(store,before,state){if(store.getItem(KEY)!==before)fail('Concurrent change; reload and retry');store.setItem(KEY,JSON.stringify(clean(state)));return state}
function update(store,index,id,patch){
 if(index.ids.get(id)?.status!=='active'||!object(patch)||Object.keys(patch).some(k=>!['done','queued','note'].includes(k)))fail('Unknown, retired or invalid objective');
 const {raw,state}=read(store);const old=state.items[id]||{done:false,queued:false,note:''};
 state.items[id]={...old,...patch};return write(store,raw,state);
}
function merge(store,incoming){
 const source=clean(incoming),{raw,state}=read(store);let conflicts=0;
 for(const [id,v] of Object.entries(source.items)){
  const prior=state.items[id]||{done:false,queued:false,note:''};
  if(prior.note&&v.note&&prior.note!==v.note)conflicts++;
  state.items[id]={done:prior.done||v.done,queued:prior.queued||v.queued,note:prior.note||v.note};
 }
 return {state:write(store,raw,state),conflicts};
}
function stats(index,state){
 state=clean(state);const categories={},result={active:0,done:0,queued:0,retained:0,categories};
 for(const [id,row] of index.ids){
  if(row.status!=='active')continue;
  const c=categories[row.category]||(categories[row.category]={total:0,done:0,queued:0}),v=state.items[id];result.active++;c.total++;
  if(v?.done){result.done++;c.done++}if(v?.queued&&!v.done){result.queued++;c.queued++}
 }
 for(const id of Object.keys(state.items))if(index.ids.get(id)?.status!=='active')result.retained++;
 return result;
}
return Object.freeze({SCHEMA,SAVE,KEY,registry,empty,clean,read,update,merge,stats});
});
