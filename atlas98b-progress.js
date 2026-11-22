/* Team Jura Atlas 9.8B: individual collectible checklist slots where a game total is sourced.
 * A numbered slot means a personal checklist entry, NOT a verified coordinate. */
(()=>{'use strict';
const $=s=>document.querySelector(s),E=(tag,cls,t)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(t!==undefined)x.textContent=t;return x};
const params=new URLSearchParams(location.search),aliases={'vice-city':'vc','gta-iii':'iii','vice-city-stories':'vcs','liberty-city-stories':'lcs','chinatown-wars':'ctw','lost-and-damned':'tlad','ballad-of-gay-tony':'tbogt'};
const raw=(params.get('game')||params.get('world')||'iii').toLowerCase(),game=aliases[raw]||raw;
const sets=window.TeamJuraClassicCollections?.[game];if(!sets)return;
const key='team-jura-atlas98b-items-'+game+'-v1';const schema='team-jura-atlas98b-items-v1';
function blank(){return {schema,game,done:{}}}
function sanitize(data){if(!data||data.schema!==schema||data.game!==game||!data.done||typeof data.done!=='object'||Array.isArray(data.done))throw Error('Wrong file or schema');const done={};for(const [name,info] of Object.entries(sets)){const n=data.done[name];if(!Array.isArray(n))continue;done[name]=[...new Set(n.filter(x=>Number.isInteger(x)&&x>0&&x<=info.count))].sort((a,b)=>a-b)}return {schema,game,done}}
let state;try{state=sanitize(JSON.parse(localStorage.getItem(key)||'null'))}catch{state=blank()}
let selected=Object.keys(sets)[0],offset=0,hideDone=false,query='';const PAGE=40;
function save(){try{localStorage.setItem(key,JSON.stringify(state));window.dispatchEvent(new CustomEvent('team-jura:classic-checklist-change',{detail:{game}}));return true}catch{$('#j98bStatus').textContent='Local storage unavailable; export a backup.';return false}}
function init(){const target=document.querySelector('.classic-rail');if(!target)return;const panel=E('section','j98b-progress');panel.id='j98b-progress';panel.innerHTML=`<p class="eyebrow">COLLECTIONS · PERSONAL CHECKLIST</p><h3>Track every individual item</h3><p>Numbered slots let you track progress without invented pins. Game-specific totals are source-cited below.</p><div class="j98b-collection-controls"><label>Collection set <select id="j98bSet"></select></label><label>Find slot number <input id="j98bQuery" type="search" inputmode="numeric" placeholder="e.g. 42"></label></div><div class="j98b-actions"><label class="j98b-check"><input id="j98bHide" type="checkbox"> Hide collected</label><span id="j98bCounter" class="j98b-counter"></span></div><div class="j98b-progressbar"><i id="j98bBar" style="width:0%"></i></div><div id="j98bGrid" class="j98b-number-grid" role="group" aria-label="Personal item completion slots"></div><div class="j98b-actions"><button id="j98bPrev" type="button">← Previous</button><span id="j98bPage" class="j98b-counter"></span><button id="j98bNext" type="button">Next →</button></div><p id="j98bNote"></p><p><a id="j98bSource" target="_blank" rel="noopener noreferrer">Check original source &amp; totals ↗</a></p><div class="j98b-actions"><button id="j98bExport" type="button">Export checklist</button><label class="classic-upload">Merge checklist backup <input type="file" id="j98bImport" accept=".json,application/json" aria-describedby="j228-checklist-help"></label></div><p id="j228-checklist-help">Adds completed slots for this game only; newer local completions are kept.</p><p id="j98bStatus" role="status" aria-live="polite">Ready. Your other Atlas progress keys remain untouched.</p>`;
 target.querySelector('.classic-accordions')?.insertAdjacentElement('afterend',panel);
 const select=$('#j98bSet');for(const [name,info] of Object.entries(sets)){const op=E('option','',name+' · '+info.count);op.value=name;select.append(op)}
 select.addEventListener('change',()=>{selected=select.value;offset=0;$('#j98bQuery').value='';query='';render()});
 $('#j98bQuery').addEventListener('input',e=>{query=e.target.value.trim();offset=0;render()});
 $('#j98bHide').addEventListener('change',e=>{hideDone=e.target.checked;offset=0;render()});
 $('#j98bPrev').addEventListener('click',()=>{offset=Math.max(0,offset-PAGE);render()});
 $('#j98bNext').addEventListener('click',()=>{offset+=PAGE;render()});
 $('#j98bExport').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=E('a');link.download='team-jura-'+game+'-collections.json';link.href=url;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#j98bStatus').textContent='Downloaded collection-only backup.'});
 window.addEventListener('team-jura:classic-change',e=>{if(e.detail?.world===game)render()});
 $('#j98bImport').addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{
   if(file.size>100000)throw Error('File too large');
   const clean=sanitize(JSON.parse(await file.text()));
   let latest;try{latest=sanitize(JSON.parse(localStorage.getItem(key)||'null'))}catch{latest=blank()}
   const merged=blank();let added=0;
   for(const name of Object.keys(sets)){
    const prior=new Set([...(state.done[name]||[]),...(latest.done[name]||[])]);
    for(const slot of clean.done[name]||[]){if(!prior.has(slot)){prior.add(slot);added++;}}
    if(prior.size)merged.done[name]=[...prior].sort((a,b)=>a-b);
   }
   state=merged;const ok=save();offset=0;render();
   $('#j98bStatus').textContent=added+' completed slot(s) added. Existing '+game+' progress kept.'+(ok?' Saved on this device.':' Storage unavailable; export your merged checklist.');
  }catch(error){$('#j98bStatus').textContent='Restore refused: wrong world, invalid format or oversized file.'}
  finally{e.target.value=''}
 });render()}
 function render(){const info=sets[selected];if(!info)return;const completed=state.done[selected]||[],found=new Set(completed);const all=Array.from({length:info.count},(_,i)=>i+1).filter(i=>(!hideDone||!found.has(i))&&(!query||String(i).includes(query)));const totalPages=Math.max(1,Math.ceil(all.length/PAGE));offset=Math.max(0,Math.min(offset,(totalPages-1)*PAGE));const grid=$('#j98bGrid');grid.replaceChildren();
 // Same-world, same-set personal location notes only: no imported third-party coordinates.
 let mapped=new Set();try{const own=JSON.parse(localStorage.getItem('team-jura-atlas98-classic-'+game+'-v1')||'null');if(own?.world===game&&Array.isArray(own.markers))mapped=new Set(own.markers.filter(m=>m.collectionSet===selected&&Number.isInteger(m.collectionSlot)).map(m=>m.collectionSlot))}catch{}
 for(const n of all.slice(offset,offset+PAGE)){const done=found.has(n),btn=E('button','',`${done?'✓ ':''}${n}`);btn.type='button';btn.dataset.done=String(done);btn.setAttribute('aria-pressed',String(done));btn.setAttribute('aria-label',`${selected} slot ${n} ${done?'completed':'not completed'}`);btn.addEventListener('click',()=>{const target=new Set(state.done[selected]||[]);if(target.has(n))target.delete(n);else target.add(n);state.done[selected]=[...target].sort((a,b)=>a-b);save();render()});
 const cell=E('span','j150-slot'),place=E('button','j150-place-pin',mapped.has(n)?'◆':'⌖');place.type='button';place.dataset.mapped=String(mapped.has(n));
 place.setAttribute('aria-label',(mapped.has(n)?'Edit map location for ':'Place personal map pin for ')+selected+' slot '+n);
 place.title=mapped.has(n)?'View your own map pin':'Place on map (personal position)';
 place.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('team-jura:classic-place-slot',{detail:{game,set:selected,slot:n}}));$('#j98bStatus').textContent=selected+' #'+n+' · tap the matching game map to place or edit your own pin.'});
 cell.append(btn,place);grid.append(cell)}
 if(!grid.children.length)grid.append(E('p','','No matching items. Change the filter.'));
 $('#j98bCounter').textContent=`${completed.length} / ${info.count} found`;
 $('#j98bBar').style.width=(completed.length/info.count*100).toFixed(2)+'%';
 $('#j98bPrev').disabled=offset===0;$('#j98bNext').disabled=offset+PAGE>=all.length;$('#j98bPage').textContent=`${Math.floor(offset/PAGE)+1} / ${totalPages}`;
 $('#j98bNote').textContent=(info.note?info.note+' ':'')+'These are personal sequential slots, not verified mapped locations. Editions and numbering may differ from external walkthroughs.';
 $('#j98bSource').href=info.url;
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
