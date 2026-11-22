/* Atlas 22.9: distinct reference categories, numbered collection slots and coordinate evidence. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),E=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=String(text);if(cls)el.className=cls;return el};
const normalize=value=>String(value??'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const phrase=(text,alias)=>(' '+text+' ').includes(' '+alias+' ');
const scopeOf=row=>['story','online','vi'].includes(row?.mode)?row.mode:row?.game==='6'||row?.mode==='pre-release'?'vi':null;
const hasPosition=row=>Number.isFinite(row?.x)&&Number.isFinite(row?.y);
const isReferenceMatch=(row,category)=>{
 if(scopeOf(row)!==category.scope)return false;
 const text=normalize([row.name,row.category,row.collectionType,row.kind,row.group,...(Array.isArray(row.tags)?row.tags:[])].filter(Boolean).join(' '));
 return (category.aliases||[]).some(a=>normalize(a)&&phrase(text,normalize(a)));
};
const format=n=>n.toLocaleString('en-US');
let types=[],catalog=[],collections=[],catalogReady=false,collectionReady=false,storyCounts={};
const storyTypes={'story-spaceship-parts':'Spaceship Part','story-letter-scraps':'Letter Scrap','story-nuclear-waste':'Nuclear Waste','story-stunt-jumps':'Stunt Jump','story-under-bridges':'Under the Bridge','story-knife-flights':'Knife Flight','story-epsilon-tracts':'Epsilon Tract'};
const matched=category=>catalog.filter(row=>isReferenceMatch(row,category));
function quoteCsv(value){const str=String(value??''),safe=/^[=+\-@\t\r\n]/.test(str)?"'"+str:str;return '"'+safe.replaceAll('"','""')+'"'}
function download(filename,rows){const url=URL.createObjectURL(new Blob([rows.map(row=>row.map(quoteCsv).join(',')).join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'}));const a=E('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500)}
async function json(path){const response=await fetch(path,{cache:'no-cache'});if(!response.ok)throw Error('HTTP '+response.status);return response.json()}
function render(){
 const q=normalize($('q').value),family=$('family').value,only=$('only').value;
 const counts=types.map(type=>({type,records:matched(type)}));
 const visible=counts.filter(({type,records})=>(!q||normalize(type.name+' '+type.family).includes(q))&&(!family||family===type.family)&&(!only||(only==='mapped'?records.length>0:records.length===0)));
 $('summary').textContent=types.length+' online comparison categories · '+counts.filter(x=>x.records.length).length+' with same-world reference matches · '+visible.length+' shown';
 const root=$('items');root.replaceChildren();
 for(const {type,records} of visible){
  const node=E('article',undefined,'item'),head=E('div',undefined,'row');
  head.append(E('strong',type.name),E('span',catalogReady?(records.length?records.length+' reference match(es)':'No reference match'):'Source unavailable','chip '+(records.length?'ok':'warn')));
  node.append(head,E('small',type.family+' · GTA Online'));
  const positioned=records.filter(hasPosition).length;
  node.append(E('p',catalogReady?(positioned+' coordinate-bearing catalog row(s). Reference matches are not verified gameplay pins or complete coverage.'):'No count is assumed while the reference catalog is unavailable.'));
  if(/^https:\/\//.test(type.sourceReference||'')){const link=E('a','Comparison source ↗');link.href=type.sourceReference;link.target='_blank';link.rel='noopener noreferrer';node.append(link)}
  root.append(node);
 }
 if(!visible.length)root.append(E('p','No categories match these filters.'));
}
function renderCollections(){
 const root=$('j229-collection-rows'),world=$('j229-collection-world').value,query=normalize($('j229-collection-search').value);
 root.replaceChildren();
 if(!collectionReady){$('j229-collection-status').textContent='Collection index unavailable. No totals or coordinates assumed.';return}
 const filtered=collections.filter(x=>(world==='all'||x.mode===world)&&(!query||normalize(x.name).includes(query)));
 const totals=filtered.reduce((sum,row)=>sum+row.total,0);
 $('j229-collection-status').textContent=filtered.length+' of '+collections.length+' collection sets shown · '+format(totals)+' numbered reference slots. These are not verified map locations or active daily events.';
 for(const row of filtered){
  const tr=E('tr');tr.dataset.set=row.id;
  const title=E('th',row.name);title.scope='row';
  const scope=E('td',row.mode==='story'?'Story':'Online');
  const total=E('td',format(row.total));
  const required=E('td',row.mode==='story'&&Number.isInteger(row.requiredFor100Percent)?String(row.requiredFor100Percent):'—');
  const mapped=storyCounts[storyTypes[row.id]];
  const evidence=E('td',Number.isInteger(mapped)?mapped+' bundled community-mapped records; not independently gameplay verified':row.locationVerification==='not-imported'?'No individual coordinates in this index':'Review source status');
  const action=E('td');const link=E('a','Open checklist ↗');link.href='./atlas81-hq.html?collection='+encodeURIComponent(row.id)+'#collections';action.append(link);
  if(Number.isInteger(mapped)){const map=E('a','Mapped Story records ↗');map.href='./atlas-completion.html';action.append(map)}
  if(/^https:\/\//.test(row.sourceUrl||'')){const source=E('a','Source ↗');source.href=row.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';action.append(source)}
  tr.append(title,scope,total,required,evidence,action);root.append(tr);
 }
 if(!filtered.length){const tr=E('tr'),td=E('td','No matching collection sets.');td.colSpan=6;tr.append(td);root.append(tr)}
}
$('export').addEventListener('click',()=>{
 if(!catalogReady)return;
 download('team-jura-online-category-reference.csv',[['World','Group','Marker type','Reference matches','Coordinate-bearing catalog rows','Evidence limitation'],...types.map(t=>{const rows=matched(t);return[t.scope,t.family,t.name,rows.length,rows.filter(hasPosition).length,'Reference matches only; not verified gameplay pins']})]);
});
$('j229-collection-export').addEventListener('click',()=>{
 if(!collectionReady)return;
 const world=$('j229-collection-world').value,q=normalize($('j229-collection-search').value);
 const rows=collections.filter(r=>(world==='all'||r.mode===world)&&(!q||normalize(r.name).includes(q)));
 download('team-jura-collection-evidence.csv',[['World','Collection','Reference slots','Story required','Location status','Source URL'],...rows.map(r=>[r.mode,r.name,r.total,r.mode==='story'?r.requiredFor100Percent??'':'',r.locationVerification,r.sourceUrl])]);
});
for(const key of ['q','family','only'])$(key).addEventListener('input',render);
for(const key of ['j229-collection-world','j229-collection-search'])$(key).addEventListener('input',renderCollections);
$('export').disabled=true;$('j229-collection-export').disabled=true;
Promise.allSettled([json('./data/atlas-coverage-67.json'),json('./atlas-catalog.json'),json('./atlas-collections.json'),json('./atlas81-collections.json'),json('./data/atlas-story-source-snapshot.json')]).then(result=>{
 const [blueprint,reference,sets,hq,story]=result;
 if(story.status==='fulfilled'&&story.value.schema===1&&story.value.scope==='story'&&story.value.sourceCommit==='584f2f1d2d1b33dd8a9e1dd8c0c55f37f002c4c3'&&Array.isArray(story.value.records)&&story.value.records.length===275){
  for(const r of story.value.records)if(typeof r.type==='string')storyCounts[r.type]=(storyCounts[r.type]||0)+1;
 }
 if(blueprint.status==='fulfilled'&&Array.isArray(blueprint.value.categories)){
  types=blueprint.value.categories.filter(t=>t.scope==='online'&&typeof t.name==='string'&&Array.isArray(t.aliases));
  for(const family of [...new Set(types.map(t=>t.family))]){const o=E('option',family);o.value=family;$('family').append(o)}
 }
 if(reference.status==='fulfilled'&&Array.isArray(reference.value.records)){
  catalog=reference.value.records.filter(r=>r&&typeof r.id==='string');catalogReady=true;$('export').disabled=false;
 }
 if(sets.status==='fulfilled'&&hq.status==='fulfilled'&&Array.isArray(sets.value.sets)&&Array.isArray(hq.value.sets)){
  const hqById=new Map(hq.value.sets.map(r=>[r.id,r]));
  const seen=new Set();
  collections=sets.value.sets.filter(r=>{const match=hqById.get(r.id);if(!r||!['story','online'].includes(r.mode)||!/^[-a-z0-9]+$/.test(r.id)||seen.has(r.id)||!Number.isInteger(r.total)||r.total<1||!match||match.mode!==r.mode||match.total!==r.total)return false;seen.add(r.id);return true});
  collectionReady=collections.length===sets.value.sets.length;
  $('j229-collection-export').disabled=!collectionReady;
 }
 $('sourceStatus').textContent=catalogReady?'Audited '+format(catalog.filter(r=>scopeOf(r)==='online').length)+' explicitly Online catalog references. Unscoped landmark starter samples, Story and Leonida records are excluded. Actual bundled coordinate packs are listed separately above.':'Reference catalog unavailable; no coverage inferred.';
 render();renderCollections();
});
})();