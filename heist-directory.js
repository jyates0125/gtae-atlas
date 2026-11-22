/* The directory reads the same device checklist displayed inside each job. */
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
  return [{card,keywords,summary,key:'teamjura-heist-'+match[1]}];
 });
 const urlQuery=()=>new URL(location.href).searchParams.get('q')||'';
 search.value=urlQuery();
 function saveQuery(){
  const url=new URL(location.href);
  const value=search.value.trim();
  if(value)url.searchParams.set('q',value);else url.searchParams.delete('q');
  history.replaceState(history.state,'',url);
 }
 function render(){
  const query=search.value.trim().toLowerCase();
  let visible=0;
  for(const item of cards){
   let checked=0;
   try{const saved=JSON.parse(localStorage.getItem(item.key)||'{}');checked=Object.values(saved).filter(v=>v===true).length}catch{}
   item.summary.textContent=checked===1?'1 checklist step marked':checked+' checklist steps marked';
   item.summary.hidden=!checked;
   item.card.hidden=!query.split(/\s+/).every(term=>item.keywords.includes(term))||(started.checked&&!checked);
   if(!item.card.hidden)visible++;
  }
  count.textContent=visible+' of '+cards.length+' workspaces';reset.hidden=!query&&!started.checked;
 }
 search.addEventListener('input',()=>{saveQuery();render()});started.addEventListener('change',render);
 reset.onclick=()=>{search.value='';started.checked=false;saveQuery();render();search.focus()};
 window.addEventListener('pageshow',render);
 window.addEventListener('storage',e=>{if(!e.key||e.key.startsWith('teamjura-heist-'))render()});
 controls.hidden=false;render();
})();
