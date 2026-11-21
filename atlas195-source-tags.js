/* Atlas 19.5: local GTADB source-tag audit, not verified gameplay category parity. */
(()=>{'use strict';
const root=document.getElementById('j195-source-tags');if(!root)return;
const world=document.getElementById('j195-world'),search=document.getElementById('j195-search'),rows=document.getElementById('j195-rows'),status=document.getElementById('j195-status'),context=document.getElementById('j195-context'),exportButton=document.getElementById('j195-export');
let snapshot=null,current=null,filtered=[];
const n=(tag,text)=>{const el=document.createElement(tag);el.textContent=String(text);return el;};
const number=v=>Number(v).toLocaleString('en-US');
function render(){
 if(!snapshot)return;
 current=snapshot.sources.find(x=>x.game===world.value)||snapshot.sources[0];
 const q=search.value.trim().toLowerCase();
 filtered=current.tags.filter(x=>x.label.toLowerCase().includes(q));
 rows.replaceChildren();
 for(const item of filtered){
  const tr=document.createElement('tr');
  for(const value of [item.label,number(item.tagged),number(item.mapped),number(item.searchOnly)])tr.append(n('td',value));
  rows.append(tr);
 }
 if(!filtered.length){const tr=document.createElement('tr'),cell=n('td','No matching source labels. Clear the tag search.');cell.colSpan=4;tr.append(cell);rows.append(tr)}
 status.textContent=current.title+': '+number(current.records)+' unique landmark research entries; '+number(current.mapped)+' have coordinates, '+number(current.searchOnly)+' are search-only. '+number(filtered.length)+' source-tag labels shown.';
 context.textContent=current.scope+'. '+current.license+' · snapshot '+current.sourceUpdated+'. Records can have multiple labels, and tags such as “enterable”, “L4” or “unconfirmed” are upstream research notation, not confirmed GTA gameplay features.';
}
function quoteCsv(value){
 const s=String(value??'');
 const safe=/^[=+\-@]/.test(s)?"'"+s:s;
 return '"'+safe.replaceAll('"','""')+'"';
}
function download(){
 if(!current)return;
 const lines=[['Game','Source label','Tagged records','Mapped coordinates','Search-only records','Snapshot status','Source updated'],...filtered.map(x=>[current.game,x.label,x.tagged,x.mapped,x.searchOnly,current.scope,current.sourceUpdated])].map(r=>r.map(quoteCsv).join(','));
 const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='team-jura-'+current.game+'-source-tags.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);
}
world.addEventListener('change',render);search.addEventListener('input',render);exportButton.addEventListener('click',download);
fetch('./data/atlas195-source-tags.json',{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{
 if(data.schema!==1||!Array.isArray(data.sources)||data.sources.length!==3)throw Error('Unrecognized bundled tag audit');
 for(const src of data.sources){
  if(!['4','5','6'].includes(src.game)||!Number.isInteger(src.records)||src.mapped+src.searchOnly!==src.records||!Array.isArray(src.tags))throw Error('Source game/count mismatch');
 }
 snapshot=data;render();
}).catch(err=>{status.textContent='Local source-tag audit unavailable: '+err.message;context.textContent='The map workspaces remain available. Verify the bundled data files.'});
})();