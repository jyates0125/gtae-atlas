/* Source-only item index. No third-party image loads or script execution. */
(()=>{'use strict';
const root=document.getElementById('viArmorySources');if(!root)return;
const filter=document.getElementById('viArmorySourceFilter'),status=document.getElementById('viArmorySourceCount');
const el=(tag,value)=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=value;return n};
function link(parent,label,url){
 if(typeof url!=='string')return;
 try{const u=new URL(url);if(u.protocol!=='https:')return;const a=el('a',label);a.href=u.href;a.rel='noopener noreferrer';a.target='_blank';const li=el('li');li.append(a);parent.append(li)}catch{}
}
fetch('./data/atlas192-vi-weapons.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('catalog HTTP '+r.status);return r.json()}).then(data=>{
 if(data.scope!=='vi'||data.kind!=='weapon'||!Array.isArray(data.records))throw Error('Invalid source catalog');
 const rows=data.records,by=new Map(rows.map(r=>[r.id,r]));
 function render(){
  const q=filter.value.trim().toLowerCase(),matches=rows.filter(r=>[r.name,r.group,r.id].some(v=>String(v).toLowerCase().includes(q)));
  status.textContent=matches.length+' of '+rows.length+' item sources';const fragment=document.createDocumentFragment();
  for(const r of matches){
   const detail=el('details'),title=el('summary',r.name+' · '+r.group),grade=el('p',r.grade+' — '+r.evidence),description=el('p',r.description),list=el('ul');detail.append(title,grade,description,list);
   link(list,r.sourceName||'Identity source',r.sourceUrl);
   for(const c of (r.corroboration||[]))link(list,c.name||'Corroborating source',c.url);
   if(r.officialEdition)link(list,r.officialEdition.label,r.officialEdition.source);
   if(r.officialMedia){link(list,'Rockstar Games official media library',r.officialMedia.source);link(list,'Original publisher image',r.officialMedia.url)}
   const base=by.get(r.variantOf)||r,visual=base.visualReference;
   if(visual){link(list,'GTAX model catalog — '+base.name,visual.source);link(list,'Rockstar game image via GTAX'+(r.variantOf?' (related family)':''),visual.image)}
   const example=by.get(r.illustrativeExampleOf);
   if(example?.visualReference){link(list,'Illustrative category example only: '+example.name,example.visualReference.image)}
   if(!r.officialMedia&&!visual)detail.append(el('p','Exact item image not established. Original Elario exhibition artwork or a labeled related category example may be displayed.'));
   fragment.append(detail);
  }
  root.replaceChildren(fragment);
 }
 filter.addEventListener('input',render);render();
}).catch(()=>{status.textContent='Item source index unavailable. The source links above remain available.'});
})();
