/* Team Jura Atlas 29.0 — source ledger for the complete GTA VI landmark snapshot.
 * Indexed locally from the attributed GTADB CC BY 4.0 source snapshot.
 * No missing coordinate is invented; records without position never become map pins.
 */
(()=>{'use strict';
const box=document.getElementById('j290-vi-ledger');if(!box)return;
const $=id=>document.getElementById(id);
const status=$('j290-status'),stats=$('j290-count'),search=$('j290-search'),kind=$('j290-kind'),tagSelect=$('j290-tag');
const list=$('j290-list'),pager=$('j290-pages'),prev=$('j290-prev'),next=$('j290-next');
const LIMIT=24;
let source=null,rows=[],filtered=[],page=0,loaded=false,loading=false;
const validPosition=p=>Array.isArray(p)&&p.length===2&&p.every(n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=16384);
const validId=id=>/^L[1-9][0-9]{0,7}$/.test(id);
const tagsOf=row=>Array.isArray(row[6])?row[6].filter(t=>typeof t==='string'&&t.length<80):[];
function el(tag,className,textValue){
 const node=document.createElement(tag);if(className)node.className=className;
 if(textValue!==undefined)node.textContent=String(textValue);
 return node;
}
function link(href,label){
 const a=el('a','j290-link',label);a.href=href;return a;
}
function render(){
 if(!loaded)return;
 const q=search.value.trim().toLocaleLowerCase(),which=kind.value,tag=tagSelect.value;
 filtered=rows.filter(item=>{
  if(which==='mapped'&&!item.mapped||which==='search-only'&&item.mapped)return false;
  if(tag!=='all'&&!item.tags.includes(tag))return false;
  return !q||item.needle.includes(q);
 });
 const max=Math.max(1,Math.ceil(filtered.length/LIMIT));
 page=Math.min(Math.max(0,page),max-1);
 const part=filtered.slice(page*LIMIT,(page+1)*LIMIT);
 list.replaceChildren();
 for(const item of part){
  const card=el('article','j290-entry');
  const title=el('strong','j290-name',item.name);
  const note=el('small','j290-state',item.mapped?'Community X/Y · provisional':'Search-only · no verified map point');
  const detail=el('p','j290-detail',item.address||'Location details not supplied');
  const badges=el('div','j290-tags');
  for(const t of item.tags.slice(0,5))badges.append(el('span','j290-tag',t));
  const actions=el('div','j290-actions');
  if(item.mapped){
   const a=link('./atlas-vi.html?place=gtadb-6-'+encodeURIComponent(item.id),'Find approximate pin on map');
   a.title='Community map coordinate, not a verified GTA VI gameplay position';
   actions.append(a);
  }else actions.append(el('span','j290-not-positioned','Not mapped · use the source notes'));
  actions.append(link('https://github.com/rolux/gtadb.org/blob/main/map/data/6/landmarks.json','GTADB source'));
  card.append(title,note,detail,badges,actions);list.append(card);
 }
 if(!part.length)list.append(el('p','j290-empty','No indexed places match. Clear the search or adjust the source filters.'));
 pager.textContent=filtered.length.toLocaleString()+' matching · page '+(page+1)+' of '+max;
 prev.disabled=page===0;next.disabled=page>=max-1;
}
function indexRows(data){
 if(!data||data.schema!==2||data.game!=='6'||!data.records||typeof data.records!=='object'||Array.isArray(data.records))throw Error('Unexpected GTA VI source data');
 const entries=Object.entries(data.records);
 if(entries.length<500||entries.length>25000)throw Error('Unexpected source size');
 const values=[];const tagCounts=new Map();
 for(const [id,row] of entries){
  if(!validId(id)||!Array.isArray(row)||typeof row[0]!=='string'||!row[0].trim())continue;
  const name=row[0].trim().slice(0,180),address=typeof row[3]==='string'?row[3].trim().slice(0,220):'';
  const tags=tagsOf(row);
  for(const t of new Set(tags))tagCounts.set(t,(tagCounts.get(t)||0)+1);
  values.push({id,name,address,tags,mapped:validPosition(row[1]),needle:[id,name,address,...tags].join(' ').toLocaleLowerCase()});
 }
 if(values.length!==entries.length)throw Error('Source contains invalid index records');
 rows=values;
 const counts={all:values.length,mapped:values.filter(v=>v.mapped).length};
 counts.searchOnly=counts.all-counts.mapped;
 if(typeof data.count==='number'&&data.count!==counts.all)throw Error('Snapshot total does not match indexed rows');
 if(typeof data.mappedCount==='number'&&data.mappedCount!==counts.mapped)throw Error('Snapshot positioned count does not match indexed rows');
 const current=tagSelect.value;
 const options=[new Option('All publisher tags','all')];
 for(const [name,count] of [...tagCounts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))){
  options.push(new Option(name+' ('+count.toLocaleString()+')',name));
 }
 tagSelect.replaceChildren(...options);tagSelect.value=options.some(o=>o.value===current)?current:'all';
 stats.textContent=counts.all.toLocaleString()+' records · '+counts.mapped.toLocaleString()+' provisional X/Y · '+counts.searchOnly.toLocaleString()+' unpositioned';
 status.textContent='Current local GTADB snapshot · '+String(data.sourceUpdated||'date not recorded').slice(0,10)+' · CC BY 4.0. These are research landmarks, not a complete GTA VI collectible or business-spawn list.';
 loaded=true;render();
}
async function load(){
 if(loaded||loading)return;
 loading=true;status.textContent='Loading complete, attributed Leonida source index…';
 try{
  const response=await fetch('./data/gtadb-6.json',{cache:'no-cache'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();indexRows(data);
 }catch{
  status.textContent='The source index is unavailable. The main map and existing saved progress are unchanged. Try reopening this panel while connected.';
 }finally{loading=false}
}
function followActiveWorld(){
 // The VI page can temporarily switch its shared Atlas engine into V/Online.
 // Keep this VI-only index out of those worlds without resetting private data.
 const active=window.JuraDualLegendAPI?.state?.()?.game;
 if(active)box.hidden=active!=='6';
}
document.addEventListener('jura:legend-updated',followActiveWorld);
box.addEventListener('toggle',()=>{if(box.open&&!box.hidden)load()});
followActiveWorld();
for(const input of [search,kind,tagSelect])input.addEventListener(input===search?'input':'change',()=>{page=0;render()});
prev.addEventListener('click',()=>{if(page>0){page--;render()}});
next.addEventListener('click',()=>{if((page+1)*LIMIT<filtered.length){page++;render()}});
const preview=$('j290-preview');
if(preview)preview.textContent='Complete GTADB landmark index · open for mapped and unpositioned entries';
})();