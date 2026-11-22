/* Atlas 29.0 · source-backed, personally positioned landmarks for the Rockstar poster.
 * Community coordinates are NEVER projected onto the official image without calibration.
 * The official image stays in the player's browser; this code stores only private map-relative pins.
 */
(()=>{'use strict';
const ROOT='./data/gtadb-6.json?v=290';
const MAX_PINS=500, MAX_RESULTS=30, KEY='team-jura-vi-official-poster-pins-v1:';
const ID=/^L[1-9]\d{0,6}$/i, SHA=/^[a-f0-9]{64}$/i, $=(x)=>document.querySelector(x);
if(document.body && document.body.dataset.startWorld!=='6')return;
let stage,poster,panel,ui,overlay,drawer,query,category,results,notice,meta,selected;
let dataset=[],records=new Map(),fingerprint='',placed={},picking='',visible=true,drag=null,mapHint;
function elt(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;}
function message(value){if(notice)notice.textContent=value;}
function pickup(id){picking=id||'';if(mapHint){mapHint.hidden=!picking;mapHint.textContent=picking?'Tap the poster to place '+labelOf(picking)+' · Escape to cancel':'';}}
function storageKey(){return KEY+fingerprint;}
function validCoordinate(p){return Array.isArray(p)&&p.length===2&&p.every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1);}
function safeMarks(input,strict){
 if(!input||input.schema!==1||input.game!=='6'||input.fingerprint!==fingerprint||typeof input.items!=='object'||Array.isArray(input.items)||!input.items)throw Error('Backup does not match this exact poster image.');
 const entries=Object.entries(input.items);
 if(entries.length>MAX_PINS)throw Error('Too many poster pins in backup.');
 const clean={};
 for(const [id,xy] of entries){
  if(!ID.test(id)||!records.has(id)||!validCoordinate(xy)){
   if(strict)throw Error('Backup includes invalid landmark ID or coordinates.');
   continue;
  }
  clean[id]=xy;
 }
 return clean;
}
function restore(){
 placed={};
 if(!fingerprint||!records.size)return;
 try{const raw=localStorage.getItem(storageKey());if(raw)placed=safeMarks(JSON.parse(raw),true);}
 catch{placed={};message('Saved placements could not be restored. Other Atlas progress was not changed.');}
}
function save(){
 try{localStorage.setItem(storageKey(),JSON.stringify({schema:1,game:'6',fingerprint:fingerprint,items:placed}));return true;}
 catch{message('Storage unavailable: these placements may last for this visit only. Use Export to keep a backup.');return false;}
}
function transformed(){
 const style=poster&&getComputedStyle(poster).transform;
 try{const m=new DOMMatrixReadOnly(style&&style!=='none'?style:undefined);
  return {scale:m.a||1,dx:m.m41||0,dy:m.m42||0};}catch{return {scale:1,dx:0,dy:0};}
}
function layout(){
 if(!stage||!poster||!poster.naturalWidth||!poster.naturalHeight)return;
 const w=stage.clientWidth,h=stage.clientHeight;
 if(!w||!h)return;
 const factor=Math.min(w/poster.naturalWidth,h/poster.naturalHeight);
 const pw=poster.naturalWidth*factor,ph=poster.naturalHeight*factor;
 Object.assign(overlay.style,{width:pw+'px',height:ph+'px',left:((w-pw)/2)+'px',top:((h-ph)/2)+'px'});
 overlay.style.transform=poster.style.transform||'none';
}
function pointAt(ev){
 const r=stage.getBoundingClientRect(),w=r.width,h=r.height;
 const m=transformed();
 const px=((ev.clientX-r.left-w/2-m.dx)/m.scale+w/2);
 const py=((ev.clientY-r.top-h/2-m.dy)/m.scale+h/2);
 const left=parseFloat(overlay.style.left),top=parseFloat(overlay.style.top);
 const ow=parseFloat(overlay.style.width),oh=parseFloat(overlay.style.height);
 const x=(px-left)/ow,y=(py-top)/oh;
 if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>1||y<0||y>1)return null;
 return [Math.round(x*1e5)/1e5,Math.round(y*1e5)/1e5];
}
function labelOf(id){const r=records.get(id);return r?r.label:id;}
function list(){
 results.replaceChildren();
 if(!dataset.length){results.append(elt('p','j290-muted','Waiting for source records…'));return;}
 const q=query.value.trim().toLowerCase().slice(0,120),tag=category.value;
 const matches=dataset.filter(r=>(!tag||r.tags.includes(tag))&&(!q||r.search.includes(q)));
 const status=elt('p','j290-muted',matches.length+' matching community records · first '+Math.min(matches.length,MAX_RESULTS)+' shown');
 results.append(status);
 for(const rec of matches.slice(0,MAX_RESULTS)){
  const line=elt('div','j290-result');
  const details=elt('div','j290-result-copy');
  details.append(elt('strong','',rec.label),elt('small','',rec.id+' · '+(rec.tags.join(', ')||'unclassified')+' · '+(rec.hasCoords?'community XY':'no source XY')));
  const action=elt('button','',Object.hasOwn(placed,rec.id)?'Move pin':'Place pin');
  action.type='button';action.dataset.placeId=rec.id;
  line.append(details,action);results.append(line);
 }
}
function render(){
 if(!overlay)return;
 overlay.replaceChildren();
 const keys=Object.keys(placed).filter(id=>records.has(id));
 for(const id of keys){
  if(!validCoordinate(placed[id]))continue;
  const pin=elt('button','j290-pin', '◆');
  pin.type='button';pin.dataset.pinId=id;pin.style.left=(placed[id][0]*100)+'%';pin.style.top=(placed[id][1]*100)+'%';
  pin.setAttribute('aria-label','Your personal poster pin: '+labelOf(id));
  pin.title='Personally positioned: '+labelOf(id);
  pin.addEventListener('pointerdown',e=>e.stopPropagation());
  pin.addEventListener('click',e=>{e.stopPropagation();select(id);});
  overlay.append(pin);
 }
 overlay.hidden=!visible||!fingerprint;
 meta.textContent=keys.length+' personally placed · '+dataset.length+' GTADB records searchable';
 const toggle=ui.querySelector('[data-j290="toggle-pins"]');
 toggle.textContent=visible?'Hide placed pins':'Show placed pins';
 toggle.setAttribute('aria-pressed',String(visible));
}
function select(id){
 if(!records.has(id))return;
 selected=id;
 const r=records.get(id);
 const detail=ui.querySelector('.j290-selected');detail.replaceChildren();
 detail.append(elt('strong','',r.label),elt('small','',id+' · '+r.tags.join(', ')+' · source status: community-provisional'));
 const controls=elt('div','j290-inline');
 const relocate=elt('button','','Place / move');relocate.type='button';relocate.dataset.placeId=id;controls.append(relocate);
 const cancel=elt('button','','Cancel placement');cancel.type='button';cancel.dataset.j290='cancel';cancel.hidden=!picking;controls.append(cancel);
 if(Object.hasOwn(placed,id)){
  const remove=elt('button','','Remove pin');remove.type='button';remove.dataset.removeId=id;controls.append(remove);
 }
 detail.append(controls);
 message('This pin is placed by you on the poster. It is not a verified in-game spawn.');
 drawer.hidden=false;ui.querySelector('.j290-open').setAttribute('aria-expanded','true');
}
async function loadRecords(){
 try{
  const response=await fetch(ROOT,{cache:'no-cache'});
  if(!response.ok)throw Error('Landmark source unavailable');
  const pack=await response.json();
  if(pack.schema!==2||pack.game!=='6'||pack.status!=='community-provisional'||!pack.records||typeof pack.records!=='object')throw Error('Unexpected source schema');
  dataset=[];records=new Map();
  for(const [id,raw] of Object.entries(pack.records)){
   if(!ID.test(id)||!Array.isArray(raw)||typeof raw[0]!=='string'||raw[0].length>300)continue;
   const tags=Array.isArray(raw[6])?raw[6].filter(t=>typeof t==='string'&&t.length<=70).slice(0,15):[];
   const r={id,label:raw[0],tags,hasCoords:validSourceXY(raw[1]),search:(id+' '+raw[0]+' '+tags.join(' ')).toLowerCase()};
   dataset.push(r);records.set(id,r);
  }
  dataset.sort((a,b)=>a.label.localeCompare(b.label)||a.id.localeCompare(b.id));
  const counts=new Map();for(const r of dataset)for(const tag of r.tags)counts.set(tag,(counts.get(tag)||0)+1);
  for(const [tag,count] of [...counts].sort((a,b)=>b[1]-a[1]).slice(0,35)){
   const o=elt('option','',tag+' ('+count+')');o.value=tag;category.append(o);
  }
  restore();list();render();
  // A source-index link may open a reference by ID, never auto-position it.
  const requested=new URLSearchParams(location.search).get('landmark')||'';
  if(ID.test(requested)&&records.has(requested)){
   query.value=requested;list();select(requested);
   message('Reference '+requested+' opened. Choose Place / move, then tap its actual position on your poster. No coordinates were inferred.');
  }else message('Loaded '+dataset.length+' source-backed community records. Choose one, then tap the corresponding place on the official map.');
 }catch(err){message('Source list unavailable. Existing poster view still works: '+err.message);}
}
function validSourceXY(x){return Array.isArray(x)&&x.length>=2&&x.slice(0,2).every(v=>typeof v==='number'&&Number.isFinite(v));}
function ready(event){
 const hash=event?.detail?.sha256||panel.dataset.j290Hash||'';
 if(!SHA.test(hash))return;
 fingerprint=hash.toLowerCase();
 ui.hidden=false;pickup('');selected='';
 ui.querySelector('.j290-selected').replaceChildren();
 restore();layout();render();list();
 if(!dataset.length)loadRecords();
}
function clear(){fingerprint='';placed={};pickup('');selected='';ui.hidden=true;overlay.replaceChildren();overlay.hidden=true;}
function exportBackup(){
 if(!fingerprint)return message('Open your poster image first.');
 if(!records.size)return message('Landmark index is still loading. Export your pins when the source list is ready.');
 const bytes=JSON.stringify({schema:1,game:'6',fingerprint,source:'GTADB CC BY 4.0; private user poster placement',items:placed},null,2)+'\n';
 const url=URL.createObjectURL(new Blob([bytes],{type:'application/json'}));
 const a=elt('a');a.href=url;a.download='team-jura-leonida-private-poster-pins.json';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),5000);
 message('Private poster placement backup downloaded. No map image or account information is included.');
}
async function importBackup(file){
 if(!records.size)throw Error('Landmark index is still loading. Retry once the source list is ready.');
 if(!file||file.size>1000000)throw Error('Choose a poster placement JSON under 1 MB.');
 const input=JSON.parse(await file.text()),fresh=safeMarks(input,true);
 const merged={...placed};
 for(const [id,xy] of Object.entries(fresh))if(!Object.hasOwn(merged,id))merged[id]=xy;
 if(Object.keys(merged).length>MAX_PINS)throw Error('Combined pin count exceeds '+MAX_PINS+'.');
 const added=Object.keys(merged).length-Object.keys(placed).length;
 placed=merged;save();render();list();
 message('Restored '+added+' additional private placements; existing pins were preserved.');
}
function mount(){
 if(document.body?.dataset.startWorld!=='6')return;
 panel=$('#j143-official-layer');stage=panel?.querySelector('.j143-stage');poster=panel?.querySelector('.j143-poster');
 if(!panel||!stage||!poster)return;
 overlay=elt('div','j290-pins');overlay.hidden=true;overlay.setAttribute('aria-label','Personally placed landmarks, not official Rockstar pin locations');
 stage.append(overlay);
 mapHint=elt('div','j290-map-hint');mapHint.hidden=true;mapHint.setAttribute('role','status');stage.append(mapHint);
 ui=elt('section','j290-ui');ui.hidden=true;ui.setAttribute('aria-label','GTADB landmark lookup for the personal Rockstar poster');
 ui.innerHTML='<button class="j290-open" type="button" aria-expanded="false">⌖ Landmarks · place community entries</button><div class="j290-drawer" hidden><p class="j290-warning">3,754 community landmarks are research references, NOT Rockstar pins. Select an entry and tap its correct spot on your private poster. Nothing is automatically projected or uploaded.</p><label>Find landmark<input class="j290-search" type="search" placeholder="Name, district or source ID" autocomplete="off"></label><label>Source category<select class="j290-category"><option value="">All source tags</option></select></label><div class="j290-meta" role="status"></div><div class="j290-results"></div><div class="j290-selected" aria-live="polite"></div><div class="j290-inline"><button type="button" data-j290="toggle-pins" aria-pressed="true">Hide placed pins</button><button type="button" data-j290="export">Export private pins</button><label class="j290-import">Merge backup<input type="file" accept=".json,application/json"></label></div><p class="j290-status" role="status" aria-live="polite">Open the poster image to begin.</p><p class="j290-warning">Data: <a href="https://github.com/rolux/gtadb.org/tree/main/map/data/6" target="_blank" rel="noopener noreferrer">GTADB contributors</a> (CC BY 4.0). Rockstar artwork remains © Rockstar Games. Your placement is a personal note, not source verification.</p></div>';
 panel.insertBefore(ui,panel.querySelector('.j143-foot'));
 drawer=ui.querySelector('.j290-drawer');query=ui.querySelector('.j290-search');category=ui.querySelector('.j290-category');
 results=ui.querySelector('.j290-results');notice=ui.querySelector('.j290-status');meta=ui.querySelector('.j290-meta');
 ui.addEventListener('pointerdown',e=>e.stopPropagation());
 ui.addEventListener('pointerup',e=>e.stopPropagation());
 ui.addEventListener('click',e=>{
  const open=e.target.closest('.j290-open');
  if(open){drawer.hidden=!drawer.hidden;open.setAttribute('aria-expanded',String(!drawer.hidden));return;}
  const id=e.target.closest('[data-place-id]')?.dataset.placeId;
  if(id&&records.has(id)){pickup(id);select(id);message('Tap the corresponding position on your official poster to place '+labelOf(id)+'. Press Escape or Cancel to exit placement.');return;}
  const remove=e.target.closest('[data-remove-id]')?.dataset.removeId;
  if(remove&&Object.hasOwn(placed,remove)){delete placed[remove];save();render();list();select(remove);return;}
  const action=e.target.closest('[data-j290]')?.dataset.j290;
  if(action==='cancel'){pickup('');select(selected);message('Placement cancelled. Your existing pins are unchanged.');return;}
  if(action==='toggle-pins'){visible=!visible;render();}
  if(action==='export')exportBackup();
 });
 query.addEventListener('input',list);category.addEventListener('change',list);
 ui.querySelector('input[type=file]').addEventListener('change',async ev=>{
  const f=ev.target.files?.[0];ev.target.value='';if(!f)return;
  try{await importBackup(f);}catch(err){message('Backup rejected: '+err.message);}
 });
 stage.addEventListener('pointerdown',ev=>{
  if(!fingerprint||!picking||ev.button!==0||ev.target.closest('.j290-pins button'))return;
  drag={id:ev.pointerId,x:ev.clientX,y:ev.clientY};
 },true);
 stage.addEventListener('pointerup',ev=>{
  if(!fingerprint||!picking||!drag||drag.id!==ev.pointerId)return;
  const movement=Math.hypot(ev.clientX-drag.x,ev.clientY-drag.y);drag=null;
  if(movement>12)return;
  const coords=pointAt(ev);if(!coords){message('Tap inside the actual poster image, not its margins.');return;}
  const id=picking;
  if(!Object.hasOwn(placed,id)&&Object.keys(placed).length>=MAX_PINS){message('Poster pin limit reached ('+MAX_PINS+'). Export or remove older pins first.');return;}
  placed[id]=coords;pickup('');save();render();list();select(id);
  message('Pin saved at your selected poster position. This placement is NOT verified gameplay data.');
 });
 stage.addEventListener('pointercancel',()=>{drag=null;},true);
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&picking){pickup('');ev.preventDefault();ev.stopImmediatePropagation();message('Placement cancelled; poster remains open.');}},true);
 const sync=new MutationObserver(layout);sync.observe(poster,{attributes:true,attributeFilter:['style','src','hidden']});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(layout).observe(stage);
 window.addEventListener('jura:poster:ready',ready);
 window.addEventListener('jura:poster:clear',clear);
 window.addEventListener('jura:poster:visibility',ev=>{
  if(ev.detail?.open===false){drag=null;if(picking){pickup('');message('Placement cancelled when poster closed; existing saved pins preserved.');}}
 });
 if(SHA.test(panel.dataset.j290Hash||''))ready();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();