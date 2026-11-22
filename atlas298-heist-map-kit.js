/* Atlas 29.8 — mission-specific phase map and portable, non-destructive POI planning.
 * Uses original locally authored schematic points; does not invent GPS coordinates.
 * Non-Cayo only: the original Cayo island workspace has its own dedicated workflow.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root&&root.document)api.start(root);
})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const schema='teamjura-heist-map-transfer-v1';
 const categories=Object.freeze({
  all:['entry','intel','prep','objective','loot','exit'],
  recon:['intel','prep'],
  finale:['entry','objective','loot','exit']
 });
 const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const unique=(items,allowed)=>{
  const result=[],seen=new Set(),options=new Set(allowed);
  for(const raw of items){
   if(!options.has(raw)||seen.has(raw))continue;
   seen.add(raw);result.push(raw);
  }
  return result;
 };
 function readState(raw){
  if(raw===null)return {schema:1,scoped:[],route:[],awards:[]};
  const parsed=JSON.parse(raw);
  if(!plain(parsed))throw Error('Existing mission map data is damaged');
  for(const key of ['route','scoped','awards'])
   if(parsed[key]!==undefined&&(!Array.isArray(parsed[key])||parsed[key].length>150||!parsed[key].every(x=>typeof x==='string')))throw Error('Existing '+key+' data is damaged');
  return {...parsed,route:parsed.route||[],scoped:parsed.scoped||[],awards:parsed.awards||[]};
 }
 function makeTransfer(heist,state,points,awards){
  const allowed=new Set(points.map(p=>p.id));
  const awardSet=Array.from({length:awards},(_,i)=>'a'+i);
  return {schema,version:1,heist,quality:'illustrative, not georeferenced',
   createdAt:new Date().toISOString(),
   route:unique(state.route,allowed),scoped:unique(state.scoped,allowed),
   awards:unique(state.awards,awardSet),
   poiReferences:points.map(p=>({id:p.id,name:p.name,category:p.category}))};
 }
 function mergeTransfer(existing,incoming,heist,points,awardCount){
  if(!plain(incoming)||incoming.schema!==schema||incoming.version!==1||incoming.heist!==heist)
   throw Error('This file is not a mission map backup for '+heist);
  if(!['route','scoped','awards'].every(k=>Array.isArray(incoming[k])&&incoming[k].length<=150&&incoming[k].every(v=>typeof v==='string')))
   throw Error('Mission map backup has invalid lists');
  const ids=points.map(p=>p.id),awardIds=Array.from({length:awardCount},(_,i)=>'a'+i);
  const merged={...existing};
  const added={};let skipped=0;
  for(const [field,allowed] of [['route',ids],['scoped',ids],['awards',awardIds]]){
   const old=unique(existing[field],allowed);
   const input=unique(incoming[field],allowed);
   const next=unique([...old,...input],allowed);
   added[field]=next.length-old.length;
   skipped+=incoming[field].length-input.length;
   merged[field]=next;
  }
  const changed=Object.values(added).some(Boolean);
  if(changed){merged.schema=1;merged.updatedAt=new Date().toISOString();}
  return {record:merged,added,skipped,changed};
 }
 function start(w){
  const d=w.document;
  const init=()=>{
   const id=String(d.body?.dataset.heist||'');
   if(!id||id==='cayo-perico'||!d.body.classList.contains('j120-heist-page'))return;
   const focus=d.getElementById('j167-heist-map'),manifest=w.teamJuraHeistManifest;
   if(!focus||!manifest||manifest.heist!==id||focus.querySelector('#j298-mission-map-kit'))return;
   const chipBar=focus.querySelector('.j167-chips'),list=focus.querySelector('.j167-items'),search=focus.querySelector('.j167-search');
   if(!chipBar||!list||!search)return;
   const points=manifest.points();
   if(!points.length)return;
   const make=(tag,cls,content)=>{const n=d.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=content;return n;};
   const section=make('section','j298-kit');section.id='j298-mission-map-kit';
   section.setAttribute('aria-label','Mission map briefing and portable route');
   const heading=make('h3','j298-heading','Mission map briefing');
   const help=make('p','j298-help','Switch setup and finale points on this original schematic. Your saved route, scoped points, mission checklist and notes are not changed by filters.');
   const tabs=make('div','j298-phases');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Mission-map phase filters');
   let phase='all';
   const buttons=new Map();
   const status=make('p','j298-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
   function update(){
    const enabled=[...chipBar.querySelectorAll('[data-cat][aria-pressed=true]')].map(c=>c.dataset.cat);
    const known=Object.keys(categories);
    const actual=known.find(key=>categories[key].length===enabled.length&&categories[key].every(cat=>enabled.includes(cat)));
    phase=actual||'custom';
    for(const [key,button] of buttons)button.setAttribute('aria-pressed',String(key===phase));
    const markers=focus.querySelectorAll('.j167-pin').length;
    const route=focus.querySelectorAll('.j167-route [data-route-point]').length;
    status.textContent=markers+' of '+points.length+' schematic POI'+(points.length===1?'':'s')+' visible · '+route+' saved route stop'+(route===1?'':'s')+' · '+(phase==='custom'?'Custom categories':phase==='recon'?'Recon & setup':phase==='finale'?'Finale & escape':'All mission phases')+'.';
   }
   function setPhase(next){
    if(!Object.hasOwn(categories,next))return;
    const target=new Set(categories[next]);
    for(const chip of chipBar.querySelectorAll('[data-cat]')){
     if(chip.getAttribute('aria-pressed')===(target.has(chip.dataset.cat)?'true':'false'))continue;
     chip.click();
    }
    w.teamJuraHeistViews?.activate('enhanced');
    update();
   }
   for(const [key,name] of [['all','All mission points'],['recon','Recon & setup'],['finale','Finale & escape']]){
    const button=make('button','j298-phase',name);button.type='button';button.dataset.j298Phase=key;
    button.setAttribute('aria-pressed',String(key==='all'));
    button.addEventListener('click',()=>setPhase(key));tabs.append(button);buttons.set(key,button);
   }
   const transfer=make('div','j298-transfer');
   const download=make('button','j298-action','Export mission map');download.type='button';
   const restore=make('label','j298-import','Restore missing points');
   const file=make('input');file.type='file';file.accept='.json,application/json';
   file.setAttribute('aria-label','Choose mission map JSON backup');restore.append(file);
   const message=make('p','j298-message','Backups contain only POI IDs, route order and personal scoped/challenge marks — never map coordinates or free-text notes.');
   message.setAttribute('role','status');
   const key='teamjura-heist-focus-v1:'+id;
   download.addEventListener('click',()=>{
    try{
     const state=readState(w.localStorage.getItem(key));
     const payload=makeTransfer(id,state,points,focus.querySelectorAll('.j167-award input').length);
     const url=w.URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
     const a=make('a');a.href=url;a.download='team-jura-'+id+'-mission-map.json';d.body.append(a);a.click();a.remove();
     w.setTimeout(()=>w.URL.revokeObjectURL(url),1200);
     message.textContent='Mission-specific map backup exported. This does not include notes or GPS coordinates.';
    }catch(e){message.textContent='Export blocked: existing map progress needs recovery. '+e.message}
   });
   file.addEventListener('change',async()=>{
    const chosen=file.files?.[0];if(!chosen)return;
    try{
     if(chosen.size>128000)throw Error('Map backup exceeds 128 KB');
     const input=JSON.parse(await chosen.text());
     // Re-read after file I/O. Import never overwrites existing route order or marks.
     const raw=w.localStorage.getItem(key);
     const existing=readState(raw);
     const merged=mergeTransfer(existing,input,id,points,focus.querySelectorAll('.j167-award input').length);
     if(!merged.changed){
      message.textContent='No missing map progress to restore. Existing route and marks remain unchanged.';return;
     }
     w.localStorage.setItem(key,JSON.stringify(merged.record));
     message.textContent='Restored '+merged.added.route+' route stop(s), '+merged.added.scoped+' scoped POI(s) and '+merged.added.awards+' challenge(s). Reload to show the refreshed mission map.';
     const reload=make('button','j298-action','Show restored map');reload.type='button';reload.id='j298-reload';
     reload.addEventListener('click',()=>w.location.reload());
     const old=section.querySelector('#j298-reload');if(old)old.remove();
     message.after(reload);
    }catch(e){message.textContent='Import rejected; existing progress preserved. '+e.message}
    finally{file.value=''}
   });
   transfer.append(download,restore);
   section.append(heading,help,tabs,status,transfer,message);
   chipBar.before(section);
   chipBar.addEventListener('click',()=>w.queueMicrotask(update));
   search.addEventListener('input',()=>w.queueMicrotask(update));
   focus.addEventListener('click',event=>{
    if(event.target.closest('.j167-detail-actions, .j227-route-tools, .j227-route-actions'))w.queueMicrotask(update);
   });
   update();
  };
  if(d.getElementById('j167-heist-map'))init();
  else w.addEventListener('load',init,{once:true});
 }
 return Object.freeze({schema,categories,readState,makeTransfer,mergeTransfer,start});
});
