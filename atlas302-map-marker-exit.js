/* Atlas 30.2 · visible exit for GTA V/Online/VI map marker details.
 * Additive view affordance only; existing map selection, coordinates, history
 * and local guest saves remain controlled by atlas.js.
 */
(()=>{'use strict';
const pages=new Set(['atlas.html','atlas-online.html','atlas-vi.html']);
if(!pages.has(location.pathname.split('/').pop()?.toLowerCase()))return;
function init(){
 const card=document.getElementById('selectedCard');
 const close=document.getElementById('closeSelected');
 const canvas=document.getElementById('atlasCanvas');
 if(!card||!close||!canvas||card.querySelector('#j302-back-to-map'))return;
 const bar=document.createElement('div');bar.className='j302-return-bar';
 const back=document.createElement('button');
 back.id='j302-back-to-map';back.type='button';back.textContent='‹ Back to map';
 back.setAttribute('aria-label','Close location details and return to interactive map');
 bar.append(back);
 const name=card.querySelector('#selectedName');
 if(name)card.insertBefore(bar,name);else card.prepend(bar);
 // Use the same tested close handler as the original ×; do not manipulate
 // selection state or push a browser-history entry.
 function exit(){close.click();}
 back.addEventListener('click',exit);
 close.addEventListener('click',()=>{
  requestAnimationFrame(()=>{
   if(card.classList.contains('hidden'))canvas.focus({preventScroll:true});
  });
 });
 card.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!card.classList.contains('hidden')){
   event.preventDefault();event.stopPropagation();exit();
  }
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
