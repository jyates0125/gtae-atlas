/* Atlas 30.6 · visible return from GTA IV/TLAD/TBOGT source location details.
   Additive only: original detail close controls URL, zoom, selected item and data. */
(()=>{'use strict';
if(location.pathname.split('/').pop()?.toLowerCase()!=='atlas-iv.html')return;
function install(){
 const detail=document.getElementById('classicDetail');
 const content=document.getElementById('detailContent');
 const head=detail?.querySelector('.detail-head');
 const close=document.getElementById('closeDetail');
 const shell=document.getElementById('classicMapShell');
 const canvas=document.getElementById('classicCanvas');
 if(!detail||!head||!content||!close||!shell||!canvas||document.getElementById('j306-return-map'))return;
 const back=document.createElement('button');
 back.type='button';back.id='j306-return-map';
 back.textContent='← Back to map';
 back.setAttribute('aria-label','Close GTA IV location details and return to same map view');
 head.insertBefore(back,close);
 const sync=()=>{back.hidden=content.hidden};
 new MutationObserver(sync).observe(content,{attributes:true,attributeFilter:['hidden']});
 sync();
 const returnToMap=()=>{
  close.click(); // Preserve original scope, history and source data handling.
  shell.scrollIntoView({behavior:'auto',block:'center'});
  canvas.focus({preventScroll:true});
 };
 back.addEventListener('click',returnToMap);
 detail.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||content.hidden)return;
  event.preventDefault();event.stopPropagation();returnToMap();
 });
 close.addEventListener('click',()=>{
  if(!content.hidden)return;
  canvas.focus({preventScroll:true});
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
