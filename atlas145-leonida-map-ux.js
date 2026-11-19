/* Atlas 14.5 — Leonida map controls navigation repair, current Elario brand.
 * Moves existing VI map-view buttons into the left explorer, preserving the
 * original event handlers, layer selector, map canvas, coordinates and saved state.
 * Repairs mobile first-visit scroll when a hash points below the map.
 */
(()=>{'use strict';
const wasLinkedToHash=!!location.hash;
function init(){
 if(document.body?.dataset?.startWorld!=='6')return;
 const sidebar=document.getElementById('sidebar');
 const views=document.querySelector('.j86-mapviews');
 const map=document.querySelector('main.map-wrap');
 if(!sidebar||!views||!map)return;
 if(!sidebar.contains(views)){
  const anchor=sidebar.querySelector('.dataset')||sidebar.querySelector('.atlas-explorer-head');
  if(anchor)anchor.insertAdjacentElement('afterend',views);
  else sidebar.prepend(views);
 }
 views.classList.add('j145-docked-view');
 const existing=sidebar.querySelector('.j145-open-map');
 if(!existing){
  const open=document.createElement('a');
  open.className='j145-open-map';open.href='#atlasCanvas';
  open.textContent='▧ Open interactive Leonida map';
  open.setAttribute('aria-label','Jump to the interactive Leonida map');
  open.addEventListener('click',event=>{
   event.preventDefault();
   if(matchMedia('(max-width:700px)').matches)sidebar.classList.add('mobile-collapsed');
   map.scrollIntoView({block:'start',behavior:'smooth'});
  });
  (sidebar.querySelector('.worlds')||views).insertAdjacentElement('afterend',open);
 }
 // VI is a map-first destination. The map engine may update the URL fragment
 // to #game6; that must not make the mobile first screen jump into the sidebar.
 // Preserve incoming deep links or explicit coordinate navigation instead.
 if(matchMedia('(max-width:700px)').matches && !wasLinkedToHash &&
    !new URLSearchParams(location.search).has('x')){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(window.scrollY>0)window.scrollTo({top:0,behavior:'instant'});
  }));
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();