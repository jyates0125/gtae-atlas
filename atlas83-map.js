(()=>{'use strict';
/* Atlas 8.3 map-sidebar collectible bridge. No fabricated coordinates. */
const path=(location.pathname.split('/').pop()||'').toLowerCase();
if(!['atlas.html','atlas-online.html','atlas-vi.html'].includes(path))return;
const mode=path==='atlas-online.html'?'online':path==='atlas-vi.html'?'vi':'story';
const $=id=>document.getElementById(id), SKEY='team-jura-checklist-v54',HQKEY='team-jura-atlas81-hq-v1',MPKEY='jura3-progress';
const names={'Spaceship Part':'story-spaceship-parts','Letter Scrap':'story-letter-scraps','Nuclear Waste':'story-nuclear-waste','Stunt Jump':'story-stunt-jumps','Under the Bridge':'story-under-bridges','Knife Flight':'story-knife-flights','Epsilon Tract':'story-epsilon-tracts'};
let sets=[],mapped=new Map(),setId='',onlyPending=false,search='',loading=false;
function read(k,f){try{return JSON.parse(localStorage.getItem(k)||'null')||f}catch{return f}}
function save(k,o){try{localStorage.setItem(k,JSON.stringify(o));return true}catch{return false}}
function elt(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function feedback(t){const e=$('j83-message');if(e)e.textContent=t}
function current(){return sets.find(s=>s.id===setId)}
function rawStatus(s,i){const key=s.id+':'+i, rec=mapped.get(key),hq=read(HQKEY,{items:{}}),h=hq.items?.[key];const legacy=read(SKEY,{checked:{}});const p=read(MPKEY,{});
return {done:rec&&typeof p[rec.id]==='boolean'?p[rec.id]:typeof h?.done==='boolean'?h.done:!!legacy.checked?.[key],queue:!!h?.queue,note:typeof h?.note==='string'?h.note:'',rec};}
function update(s,i,done){const key=s.id+':'+i,rec=mapped.get(key);
const legacy=read(SKEY,{schema:1,checked:{}});legacy.checked=legacy.checked||{};if(done)legacy.checked[key]=true;else delete legacy.checked[key];legacy.schema=1;legacy.updated=new Date().toISOString();
const h=read(HQKEY,{schema:1,items:{}});h.schema=1;h.items=h.items||{};h.items[key]={...h.items[key],done};h.updated=new Date().toISOString();
const a=save(SKEY,legacy),b=save(HQKEY,h);
if(rec){const p=read(MPKEY,{});p[rec.id]=done;save(MPKEY,p)}
if(!(a&&b))feedback('Cannot store progress on this device; export a backup from Atlas HQ.');
// The existing map engine owns its canvas and reads progress at startup. Reload to
// keep pins and list honest instead of painting a fake marker state on top of it.
if(rec){sessionStorage.setItem('j83-selection',s.id);location.reload()}else render();}
function openRecord(rec){if(!rec)return;location.href='./atlas.html?world=5&place='+encodeURIComponent(rec.id)}
function percent(s){let n=0;for(let i=1;i<=s.total;i++)if(rawStatus(s,i).done)n++;return n}
function render(){const select=$('j83-set');if(!select)return;const list=$('j83-items');list.replaceChildren();const s=current();if(!s)return;
const completed=percent(s),mappedCount=Array.from({length:s.total},(_,i)=>mapped.has(s.id+':'+(i+1))).filter(Boolean).length;
$('j83-count').textContent=completed+' / '+s.total+' collected · '+mappedCount+' mapped';
$('j83-summary').textContent=mode==='online'?'GTA Online collectible sets only · map coordinates shown only where sourced.':mode==='vi'?'GTA VI research is provisional; no confirmed collectible locations.':'GTA V Story · individual records where the community source provides positions.';
let shown=0;for(let i=1;i<=s.total;i++){
 const st=rawStatus(s,i);if(onlyPending&&st.done)continue;
 const label=(st.rec?.name||'Item '+String(i).padStart(2,'0'));if(search&&!(`${label} ${i} ${st.note}`).toLowerCase().includes(search))continue;
 const row=elt('div','j83-item'),head=elt('div','j83-item-head');
 const cb=elt('input');cb.type='checkbox';cb.checked=st.done;cb.setAttribute('aria-label','Collected '+s.name+' '+i);cb.addEventListener('change',()=>update(s,i,cb.checked));
 const title=elt('span','j83-item-label',label);head.append(cb,title);row.append(head);
 const detail=elt('small','j83-quality',st.rec?'● Community mapped · select to view pin':'○ Position not imported');row.append(detail);
 if(st.rec){const pin=elt('button','j83-pin','Show pin on map ↗');pin.type='button';pin.onclick=()=>openRecord(st.rec);row.append(pin)}
 else{const source=elt('a','j83-source','View collection guide ↗');source.href=s.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';row.append(source)}
 list.append(row);shown++;
 if(shown>=120){list.append(elt('p','j83-caption','Showing 120 results. Refine search to find another item.'));break;}
 }
 if(!shown)list.append(elt('p','j83-caption','No items match. Clear search or show collected.'));
 const hide=$('hideFound');$('j83-hide').checked=!!hide?.checked;
 $('j83-mapped').hidden=mode!=='story';}
function showSetOnMap(){
 const s=current(),query=$('search');if(!s||!query)return;
 const rec=Array.from(mapped.entries()).find(([key])=>key.startsWith(s.id+':'))?.[1];
 if(!rec){feedback('No verified map records are imported for this set yet. The collection guide is still available.');return}
 // Native Atlas map search uses collectionType for marker filtering.
 query.value=rec.collectionType||rec.name;query.dispatchEvent(new Event('input',{bubbles:true}));
 const all=$('allOn');if(all)all.click();
 const drawer=$('atlasFilterDrawer');if(drawer)drawer.open=true;
 feedback('Filtering map to '+s.name+'. Click a pin to mark it found or add it to a route.');
}
function clearSetOnMap(){const q=$('search');if(q){q.value='';q.dispatchEvent(new Event('input',{bubbles:true}))}feedback('Map collection filter cleared.');}
function setOptions(){const sel=$('j83-set');sel.replaceChildren();for(const s of sets){const o=new Option(s.name+' · '+s.total,s.id);sel.add(o)}if(sets.some(s=>s.id===setId))sel.value=setId;else setId=sel.value;render()}
function install(){const drawer=$('atlasFilterDrawer'),side=$('sidebar');if(!drawer||!side)return;
 document.body.classList.add('jura83-map','jura83-'+mode);
 const b=elt('section','j83-panel');b.id='jura83-panel';b.setAttribute('aria-label','Map collectible legend and progress');
 b.innerHTML=`<div class="j83-top"><span>ELARIO STUDIOS · TEAM JURA ATLAS</span><a href="./atlas81-hq.html">⌂ ATLAS HQ</a></div>
 <div class="j83-heading"><h2>Collectibles · map legend</h2><a href="./atlas81-hq.html#collections">Full tracker ↗</a></div>
 <p class="j83-caption" id="j83-summary">Loading collection sets…</p>
 <label class="j83-label" for="j83-set">Collection</label><select id="j83-set"></select>
 <div class="j83-progress" id="j83-count">Loading…</div><div class="j83-mapbuttons"><button id="j83-showset" type="button">Show set pins on map</button><button id="j83-clearset" type="button">Clear map filter</button></div>
 <label class="j83-label" for="j83-search">Search item or note</label><input id="j83-search" type="search" placeholder="Find collection item…">
 <div class="j83-actions"><label><input type="checkbox" id="j83-unfinished"> List unfinished only</label><label><input type="checkbox" id="j83-hide"> Hide collected pins</label></div>
 <div class="j83-list" id="j83-items"></div><p class="j83-caption" id="j83-message" aria-live="polite"></p>
 <div id="j83-mapped" class="j83-footer"><a href="./atlas-completion.html">Mapped Story route planner ↗</a></div>`;
 drawer.parentNode.insertBefore(b,drawer);
 const banner=elt('nav','j83-worldnav');banner.setAttribute('aria-label','Game maps');
 for(const [name,target,k] of [['GTA V Story','atlas.html','story'],['GTA Online','atlas-online.html','online'],['Leonida Research','atlas-vi.html','vi']]){
 const a=elt('a',k===mode?'current':'',name);a.href='./'+target;if(k===mode)a.setAttribute('aria-current','page');banner.append(a)}
 const top=side.querySelector('.worlds');if(top)top.insertAdjacentElement('afterend',banner);else side.prepend(banner);
 $('j83-set').onchange=e=>{setId=e.target.value;render()};$('j83-showset').onclick=showSetOnMap;$('j83-clearset').onclick=clearSetOnMap;$('j83-search').oninput=e=>{search=e.target.value.trim().toLowerCase();render()};
 $('j83-unfinished').onchange=e=>{onlyPending=e.target.checked;render()};$('j83-hide').onchange=e=>{const native=$('hideFound');if(native){native.checked=e.target.checked;native.dispatchEvent(new Event('change',{bubbles:true}))}else feedback('Native map Hide collected control was not found.')};
 $('j83-set').add(new Option('Loading…',''));
 if(mode==='vi'){$('j83-set').replaceChildren();$('j83-summary').textContent='GTA VI collectible positions cannot be confirmed; use the research map and provenance tools.';$('j83-count').textContent='No confirmed GTA VI collectible sets';$('j83-hide').disabled=true;$('j83-showset').disabled=true;return;}
 load();}
async function load(){if(loading)return;loading=true;try{
 const r=await fetch('./atlas-collections.json',{cache:'no-cache'});if(!r.ok)throw Error('collections HTTP '+r.status);const d=await r.json();sets=d.sets.filter(s=>s.mode===mode);
 // No cross-game sharing: Online never inherits Story pins.
 if(mode==='story' && window.JuraSources?.load){try{const result=await window.JuraSources.load('story');for(const rec of result.records){const id=names[rec.collectionType];if(id&&Number.isInteger(rec.collectionSlot)&&rec.collectionSlot>0)mapped.set(id+':'+rec.collectionSlot,rec)}}catch(err){feedback('Community coordinate feed unavailable. Counts and guides still work.')}}
 const preferred=sessionStorage.getItem('j83-selection');if(preferred){setId=preferred;sessionStorage.removeItem('j83-selection')}setOptions();
 }catch(err){feedback('Cannot load collection database: '+err.message);$('j83-summary').textContent='Collection source unavailable';$('j83-set').replaceChildren()}
 finally{loading=false}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
// Native map controls can update the shared progress store without cross-tab events.
// Listen for actual user clicks and repaint after map's own handler has finished.
document.addEventListener('click',e=>{if(!e.target.closest('#jura83-panel')&&document.getElementById('jura83-panel'))setTimeout(()=>{try{render()}catch{}},150)},{capture:false});
window.addEventListener('storage',e=>{if([SKEY,MPKEY,HQKEY].includes(e.key))render()});
})();