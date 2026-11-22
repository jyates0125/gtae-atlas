/* Team Jura Atlas 22.0 — Leonida phone marker-detail lifecycle.
   Enhances the existing Atlas map engine; does not mutate records, routes or saves. */
(()=>{'use strict';
if(document.body?.dataset?.startWorld!=='6')return;
function init(){
 const card=document.getElementById('selectedCard');
 const close=document.getElementById('closeSelected');
 const canvas=document.getElementById('atlasCanvas');
 if(!card||!close||!canvas)return;
 // Preserve official poster access, with a short phone label so the
 // adjacent map controls do not wrap to three lines.
 const official=document.getElementById('j143-official-button');
 if(official){
  const small=window.matchMedia('(max-width:700px)');
  const syncOfficial=()=>{
   official.textContent=small.matches?'▧ Rockstar map':'▧ Rockstar · Official Map';
   official.setAttribute('aria-label',
    official.getAttribute('aria-expanded')==='true'
     ?'Close Rockstar map and return to interactive Leonida map'
     :'Open Rockstar official Leonida map');
  };
  new MutationObserver(syncOfficial).observe(official,{attributes:true,attributeFilter:['aria-expanded']});
  small.addEventListener?.('change',syncOfficial);
  syncOfficial();
 }
 close.textContent='Close details ×';
 close.setAttribute('aria-label','Close selected map marker details');
 close.title='Return to the interactive map';
 // Persistent mobile escape hatch: the canvas consumes touch gestures, so
 // users must never need to swipe to the page bottom to leave the workspace.
 const back=document.createElement('button');
 back.type='button';back.id='j220-map-back';back.className='j220-map-back';
 back.textContent='← Back';back.setAttribute('aria-label','Back out of the GTA VI map or close the current panel');
 document.body.append(back);
 back.addEventListener('click',()=>{
  const siteDrawer=document.getElementById('j132-nav-drawer');
  if(siteDrawer&&!siteDrawer.hidden){siteDrawer.querySelector('.j132-close')?.click();return}
  if(!card.classList.contains('hidden')){close.click();return}
  const nav=document.getElementById('juraNavPanel');
  if(nav&&!nav.hidden){document.getElementById('juraCloseNav')?.click();return}
  const hub=document.getElementById('j217-vi-hub');
  if(hub?.open){hub.open=false;return}
  const official=document.getElementById('j143-official-button');
  if(official?.getAttribute('aria-expanded')==='true'){official.click();return}
  window.location.assign('./maps.html');
 });
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
