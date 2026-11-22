/* Heist HQ · original Elario archive and local-only mission resume.
   Read existing per-heist keys without migrating or rewriting player progress. */
(()=>{
 'use strict';
 const controls=document.querySelector('.heist-finder');
 if(!controls)return;
 const search=document.getElementById('heistSearch'),started=document.getElementById('heistStarted');
 const reset=document.getElementById('heistReset'),count=document.getElementById('heistCount');
 const cards=[...document.querySelectorAll('.cards article')].flatMap(card=>{
  const link=card.querySelector('a[href^="./heist-"]');
  const match=link?.getAttribute('href').match(/^\.\/heist-([\w-]+)\.html$/);
  if(!match)return [];
  const summary=document.createElement('small');
  const keywords=card.textContent.toLowerCase()+' '+match[1].replaceAll('-',' ');
  card.insertBefore(summary,link);
  return [{id:match[1],name:card.querySelector('h2')?.textContent?.trim()||match[1],
    href:link.getAttribute('href'),card,keywords,summary,key:'teamjura-heist-'+match[1]}];
 });
 const resume=document.createElement('section');resume.className='j296-heist-resume';resume.hidden=true;
 resume.setAttribute('aria-labelledby','j296-resume-title');
 const heading=document.createElement('div');heading.className='j296-resume-heading';
 const title=document.createElement('h2');title.id='j296-resume-title';title.textContent='Continue your missions';
 const help=document.createElement('p');help.textContent='Your saved checklists, notes and planning routes stay on this device. No account required.';
 heading.append(title,help);
 const savedLinks=document.createElement('div');savedLinks.className='j296-resume-list';
 resume.append(heading,savedLinks);controls.before(resume);
 const safeJson=key=>{
  try{
   const value=JSON.parse(localStorage.getItem(key)||'null');
   return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  }catch{return {}}
 };
 const fields=['approach','entry','exit','poi','crew'];
 function progress(item){
  const checked=Object.values(safeJson(item.key)).filter(v=>v===true).length;
  const notes=safeJson('teamjura-heist-plan-v1:'+item.id);
  const noteCount=fields.filter(k=>typeof notes[k]==='string'&&notes[k].trim()).length;
  const focus=safeJson('teamjura-heist-focus-v1:'+item.id);
  const scoped=Array.isArray(focus.scoped)?focus.scoped.filter(v=>typeof v==='string').length:0;
  const route=Array.isArray(focus.route)?focus.route.filter(v=>typeof v==='string').length:0;
  const awards=Array.isArray(focus.awards)?focus.awards.filter(v=>typeof v==='string').length:0;
  const updated=Math.max(Date.parse(notes.updatedAt||'')||0,Date.parse(focus.updatedAt||'')||0);
  return {checked,noteCount,scoped,route,awards,updated,hasProgress:!!(checked||noteCount||scoped||route||awards)};
 }
 const summaryText=p=>[
  p.checked?p.checked+' checklist step'+(p.checked===1?'':'s'):null,
  p.noteCount?p.noteCount+' note'+(p.noteCount===1?'':'s'):null,
  p.scoped?p.scoped+' scoped POI'+(p.scoped===1?'':'s'):null,
  p.route?p.route+' route stop'+(p.route===1?'':'s'):null,
  p.awards?p.awards+' challenge'+(p.awards===1?'':'s'):null
 ].filter(Boolean).join(' · ');
 const urlQuery=()=>new URL(location.href).searchParams.get('q')||'';
 search.value=urlQuery();
 function saveQuery(){
  const url=new URL(location.href),value=search.value.trim();
  if(value)url.searchParams.set('q',value);else url.searchParams.delete('q');
  history.replaceState(history.state,'',url);
 }
 function render(){
  const query=search.value.trim().toLowerCase(),resumable=[];let visible=0;
  for(const item of cards){
   const p=progress(item);
   item.summary.textContent=summaryText(p);
   item.summary.hidden=!p.hasProgress;
   item.card.hidden=!query.split(/\s+/).every(term=>item.keywords.includes(term))||(started.checked&&!p.hasProgress);
   if(p.hasProgress)resumable.push({...item,p});
   if(!item.card.hidden)visible++;
  }
  resumable.sort((a,b)=>b.p.updated-a.p.updated||a.name.localeCompare(b.name));
  savedLinks.replaceChildren();
  for(const item of resumable.slice(0,5)){
   const link=document.createElement('a');
   link.className='j296-resume-card';link.href=item.href;
   const strong=document.createElement('strong');strong.textContent=item.name;
   const meta=document.createElement('small');meta.textContent=summaryText(item.p);
   const action=document.createElement('span');action.textContent='Resume workspace';
   link.append(strong,meta,action);savedLinks.append(link);
  }
  resume.hidden=!resumable.length;
  count.textContent=visible+' of '+cards.length+' workspaces';
  reset.hidden=!query&&!started.checked;
 }
 search.addEventListener('input',()=>{saveQuery();render()});
 started.addEventListener('change',render);
 reset.onclick=()=>{search.value='';started.checked=false;saveQuery();render();search.focus()};
 window.addEventListener('pageshow',render);
 window.addEventListener('storage',e=>{if(!e.key||e.key.startsWith('teamjura-heist-'))render()});
 controls.hidden=false;render();
})();
