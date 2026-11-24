/* Team Jura Atlas 31.0: bundled-source evidence, not pin or permission assertions. */
(()=>{'use strict';
const $=id=>document.getElementById(id),root=$('j310-evidence');if(!root)return;
const world=$('j310-world'),kind=$('j310-kind'),query=$('j310-search'),rows=$('j310-rows');
const status=$('j310-status'),exportButton=$('j310-export'),reset=$('j310-reset');
const definitions={
'projected-reference':'Map-space reference, gameplay placement not checked',
'slots-only':'Checklist slots; no coordinates in this index',
'provisional-landmarks':'Unverified GTA VI community landmarks',
'possible-not-daily':'Possible treasure locations, not confirmed today',
'schematic':'Illustrative source pixels, not game coordinates',
'landmark-reference':'Landmark research, not collectible spawns',
'numeric-source-xyz':'Sourced XYZ; gameplay alignment separately checked',
'approximate-projection':'Approximate source-to-vector projection',
'mixed-object-evidence':'61 directly checked objects, 39 transcription-only',
'trigger-zone-centers':'Airborne trigger centers, not approach ramps',
'source-projection':'Source radar alignment, not gameplay certified',
'edition-uncalibrated':'Separate edition; map overlay not calibrated',
'uncalibrated-presets':'Teleport presets, not collectible map pins',
'not-audited':'No calibrated source pack audited here'
};
const El=(tag,value)=>{const el=document.createElement(tag);if(value!==undefined)el.textContent=String(value);return el};
const fmt=n=>Number.isInteger(n)?n.toLocaleString('en-US'):'—';
const textNorm=s=>String(s||'').normalize('NFKD').toLowerCase();
const accepted=(r,k)=>k==='all'||(k==='coordinate'&&Number.isInteger(r.positioned)&&r.positioned>0)||
(k==='slots'&&Number.isInteger(r.slots))||
(k==='gap'&&['not-audited','uncalibrated-presets','edition-uncalibrated'].includes(r.evidence))||
(k==='provisional'&&r.evidence==='provisional-landmarks');
const options=new URLSearchParams(location.search);
const chosen=(name,valid,fallback)=>valid.includes(options.get(name))?options.get(name):fallback;
let inventory=null,visible=[];
function persistUrl(){
 const url=new URL(location.href);
 for(const [name,value,blank] of [['evidenceWorld',world.value,'all'],['evidenceKind',kind.value,'all'],['evidenceSearch',query.value.trim(),'']]){
  if(value===blank)url.searchParams.delete(name);else url.searchParams.set(name,value);
 }
 history.replaceState(history.state,'',url);
}
function render(){
 if(!inventory)return;
 const q=textNorm(query.value.trim());
 visible=inventory.rows.filter(r=>(world.value==='all'||r.world===world.value)&&accepted(r,kind.value)&&
 (!q||textNorm(r.worldName+' '+r.category+' '+r.note).includes(q)));
 const fragment=document.createDocumentFragment();rows.replaceChildren();
 for(const r of visible){
  const tr=El('tr');tr.dataset.world=r.world;tr.dataset.evidence=r.evidence;
  const heading=El('th');heading.scope='row';
  heading.append(El('strong',r.worldName),El('span',r.category));tr.append(heading);
  for(const key of ['sourceRows','positioned','objectives','slots'])tr.append(El('td',fmt(r[key])));
  const info=El('td');info.append(El('strong',definitions[r.evidence]),El('small',r.note));
  if(r.sourceFile)info.append(El('code',r.sourceFile));tr.append(info);
  const links=El('td'),app=El('a','Open workspace');app.href=r.href;links.append(app);
  if(r.sourceUrl&&/^https:\/\/[a-z0-9.-]+\//i.test(r.sourceUrl)){
   const origin=El('a','Pinned source');origin.href=r.sourceUrl;origin.target='_blank';origin.rel='noopener noreferrer';links.append(origin);
  }else links.append(El('small','No origin link in this indexed row'));
  if(r.license)links.append(El('small',r.license));tr.append(links);fragment.append(tr);
 }
 if(!visible.length){const tr=El('tr'),td=El('td','No matching evidence; reset filters to inspect the local source inventory.');td.colSpan=7;tr.append(td);fragment.append(tr)}
 rows.append(fragment);
 const missing=visible.filter(r=>['not-audited','edition-uncalibrated','uncalibrated-presets'].includes(r.evidence)).length;
 status.textContent='Showing '+visible.length+' of '+inventory.rows.length+' rows across '+new Set(visible.map(r=>r.world)).size+' destinations. '+missing+' rows require calibration or a new source. Snapshot '+inventory.dataAsOf+'. Never add overlapping source rows into a global collectible total.';
 exportButton.disabled=!visible.length;
}
function fail(reason){
 inventory=null;visible=[];rows.replaceChildren();
 const tr=El('tr'),td=El('td','No counts are assumed while the bundled evidence cannot be validated.');
 td.colSpan=7;tr.append(td);rows.append(tr);exportButton.disabled=true;
 status.textContent='Source inventory unavailable ('+String(reason)+'). Other map content and guest progress remain untouched.';
}
function csvCell(v){
 let s=String(v??'');if(/^\s*[=+\-@\t\r\n]/.test(s))s="'"+s;
 return '"'+s.replaceAll('"','""')+'"';
}
function exportCsv(){
 if(!inventory||!visible.length)return;
 const table=[['World','Source category','Records in indexed pack','Numeric source positions','Distinct objectives','Checklist reference slots','Evidence class','Limitations','Source path','Source URL','License']];
 for(const r of visible)table.push([r.worldName,r.category,r.sourceRows??'',r.positioned??'',r.objectives??'',r.slots??'',definitions[r.evidence],r.note,r.sourceFile||'',r.sourceUrl||'',r.license||'']);
 const blob=new Blob([table.map(line=>line.map(csvCell).join(',')).join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob),link=El('a');link.href=url;link.download='team-jura-coverage-'+(world.value==='all'?'all':world.value)+'.csv';
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
for(const control of [world,kind,query])control.addEventListener('input',()=>{render();persistUrl()});
reset.addEventListener('click',()=>{world.value='all';kind.value='all';query.value='';render();persistUrl();world.focus()});
exportButton.addEventListener('click',exportCsv);
fetch('./data/atlas310-coverage-matrix.json',{cache:'no-cache'})
 .then(resp=>{if(!resp.ok)throw Error('HTTP '+resp.status);return resp.json()})
 .then(data=>{
  if(data?.schema!==1||!Array.isArray(data.worlds)||data.worlds.length!==13||new Set(data.worlds).size!==13||
     !Array.isArray(data.rows)||data.rows.length<40)throw Error('schema mismatch');
  const identities=new Set();
  for(const r of data.rows){
   if(!r||!data.worlds.includes(r.world)||!definitions[r.evidence]||typeof r.category!=='string'||
      typeof r.worldName!=='string'||typeof r.note!=='string'||typeof r.id!=='string'||identities.has(r.id)||
      !/^\.[/][a-z0-9./?=&-]+$/i.test(r.href)||
      (r.sourceRows!==null&&(!Number.isInteger(r.sourceRows)||r.sourceRows<0))||
      (r.positioned!==null&&(!Number.isInteger(r.positioned)||r.positioned<0||r.positioned>r.sourceRows))||
      (r.slots!==null&&(!Number.isInteger(r.slots)||r.slots<1)))
    throw Error('invalid evidence row');
   identities.add(r.id);
  }
  inventory=data;
  for(const id of data.worlds){const row=data.rows.find(r=>r.world===id);const opt=El('option',row.worldName);opt.value=id;world.append(opt);}
  world.value=chosen('evidenceWorld',['all',...data.worlds],'all');
  kind.value=chosen('evidenceKind',[...kind.options].map(o=>o.value),'all');
  query.value=(options.get('evidenceSearch')||'').slice(0,100);
  render();
 }).catch(error=>fail(error?.message||'unknown error'));
})();