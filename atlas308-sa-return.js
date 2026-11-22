/* Atlas 30.8 · safe return to the exact San Andreas map from collector cards.
   Additive UI only: never change collectible progress, camera, or map data. */
(()=>{'use strict';
function start(){
 const toolbar=document.querySelector('.itemToolbar'),map=document.getElementById('mapContainer'),
       items=document.getElementById('items'),pins=document.getElementById('pinLayer');
 if(!toolbar||!map||!items||!pins||document.getElementById('j308-back-map'))return;
 const back=document.createElement('button');back.type='button';back.id='j308-back-map';
 back.textContent='↑ Back to map';back.setAttribute('aria-label','Return to San Andreas map at the same zoom and position');
 toolbar.append(back);
 let selectedPoint='';
 // A map pin's own action opens the matching collector card; remember it only
 // for focus restoration, never send the selected point to local storage.
 pins.addEventListener('click',e=>{
  const pin=e.target.closest('.pin[data-jura-sa-point]');
  if(pin)selectedPoint=pin.dataset.juraSaPoint;
 });
 function goBack(){
  map.scrollIntoView({block:'center',behavior:'auto'});
  const point=selectedPoint?Array.from(pins.querySelectorAll('.pin[data-jura-sa-point]')).find(el=>el.dataset.juraSaPoint===selectedPoint):null;
  const focusTarget=point&&!point.hidden&&point.offsetParent!==null?point:map;
  focusTarget.focus({preventScroll:true});
 }
 back.addEventListener('click',goBack);
 items.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||event.defaultPrevented||event.isComposing||
     document.querySelector('dialog[open]'))return;
  event.preventDefault();goBack();
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();