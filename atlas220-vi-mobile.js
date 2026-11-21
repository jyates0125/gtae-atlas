/* Team Jura Atlas 22.0 — Leonida phone marker-detail lifecycle.
   Enhances the existing Atlas map engine; does not mutate records, routes or saves. */
(()=>{'use strict';
if(document.body?.dataset?.startWorld!=='6')return;
function init(){
 const card=document.getElementById('selectedCard');
 const close=document.getElementById('closeSelected');
 const canvas=document.getElementById('atlasCanvas');
 if(!card||!close||!canvas)return;
 close.textContent='Close details ×';
 close.setAttribute('aria-label','Close selected map marker details');
 close.title='Return to the interactive map';
 const isOpen=()=>!card.classList.contains('hidden');
 const signature=()=>[
  document.getElementById('selectedName')?.textContent||'',
  document.getElementById('selectedInfo')?.textContent||''
 ].join('|');
 const sync=()=>{
  card.setAttribute('aria-hidden',String(!isOpen()));
  close.tabIndex=isOpen()?0:-1;
 };
 new MutationObserver(sync).observe(card,{attributes:true,attributeFilter:['class']});
 const name=document.getElementById('selectedName');
 if(name)new MutationObserver(()=>{card.scrollTop=0;}).observe(name,{childList:true,characterData:true,subtree:true});
 close.addEventListener('click',()=>{
  if(!isOpen()&&document.activeElement===close)canvas.focus({preventScroll:true});
 });
 // The engine already handles Escape and the close button. Reuse its close
 // handler, rather than creating a second copy of its selected-location state.
 const dismiss=()=>{if(isOpen())close.click()};
 document.addEventListener('pointerdown',e=>{
  if(!isOpen()||card.contains(e.target)||e.target===canvas)return;
  dismiss();
 },{passive:true});
 // On canvas, the engine processes pin selection on pointerup. Run AFTER its
 // handler: a short tap on blank space (or the same pin) closes the card,
 // while a new pin remains selected. Dragging and pinching never dismiss it.
 const pointers=new Map();
 canvas.addEventListener('pointerdown',e=>{
  const point={x:e.clientX,y:e.clientY,wasOpen:isOpen(),before:signature(),multi:pointers.size>0};
  if(pointers.size)for(const p of pointers.values())p.multi=true;
  pointers.set(e.pointerId,point);
 },{passive:true});
 canvas.addEventListener('pointerup',e=>{
  const p=pointers.get(e.pointerId);
  pointers.delete(e.pointerId);
  if(!p||!p.wasOpen||p.multi||pointers.size||Math.hypot(e.clientX-p.x,e.clientY-p.y)>9)return;
  queueMicrotask(()=>{if(isOpen()&&signature()===p.before)dismiss();});
 },{passive:true});
 canvas.addEventListener('pointercancel',e=>pointers.delete(e.pointerId),{passive:true});
 window.addEventListener('blur',()=>pointers.clear());
 sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
