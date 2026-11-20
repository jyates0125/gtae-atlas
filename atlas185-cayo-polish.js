/* Team Jura Atlas 18.5 — Cayo final usability pass.
   No new map data, no copied marker art, and no changes to historic saves.
   This enhancement is scoped to the owner-approved Cayo map workspace. */
(()=>{'use strict';
if(document.body.dataset.heist!=='cayo-perico'||document.querySelector('#j185-polish'))return;
const focus=document.querySelector('#j167-heist-map');
const controls=document.querySelector('.j180-map-controls');
const frame=document.querySelector('.j180-map-frame');
const viewport=focus?.querySelector('.j167-viewport');
const moveNative=focus?.querySelector('.j167-toolbar > .j167-tool');
const legend=document.querySelector('.j180-legend');
const rows=legend?.querySelector('.j180-legend-rows');
const info=document.querySelector('.j180-pin-info');
if(!focus||!controls||!frame||!viewport||!moveNative||!legend||!rows||!info)return;
document.body.classList.add('j185-cayo-polished');
const marker=document.createElement('span');marker.id='j185-polish';marker.hidden=true;frame.append(marker);
const makeButton=(cls,name,handler)=>{
 const b=document.createElement('button');b.type='button';b.className=cls;
 b.textContent=name;b.addEventListener('click',handler);return b;
};
// Reuse the ORIGINAL panning engine. It handles pointer drag on the
// transformed map world, so hotspot icons move with their island locations.
const pan=makeButton('j180-tool j185-pan','✥',()=>{
 moveNative.click();syncPan();
});
pan.setAttribute('aria-label','Move map: off');
pan.title='Move map · drag the island after zooming';
pan.setAttribute('aria-pressed','false');
function syncPan(){
 const active=moveNative.getAttribute('aria-pressed')==='true';
 pan.setAttribute('aria-pressed',String(active));
 pan.setAttribute('aria-label',active?'Move map: on':'Move map: off');
 pan.title=active?'Move map is on · drag the island, tap again to turn off':'Move map is off · tap to pan the zoomed island';
}
controls.append(pan);syncPan();
moveNative.addEventListener('click',()=>queueMicrotask(syncPan));
// A compact mobile legend makes the ISLAND visible straight after the hero.
// It does not change the state of any category: categories are still filtered
// using the legend's existing working buttons.
const toggle=makeButton('j185-legend-toggle','Show marker filters',()=>{
 const isOpen=!legend.classList.contains('j185-open');
 legend.classList.toggle('j185-open',isOpen);
 toggle.setAttribute('aria-expanded',String(isOpen));
 toggle.textContent=isOpen?'Hide marker filters':'Show marker filters';
});
toggle.setAttribute('aria-controls','j180-legend-rows');
toggle.setAttribute('aria-expanded','false');
if(!rows.id)rows.id='j180-legend-rows';
legend.insertBefore(toggle,rows);
const subtitle=legend.querySelector('.j180-legend-intro');
if(subtitle)subtitle.textContent='Tap any map icon for its details. Filter icons by category; positions are approximate.';
const mapWindow=window.matchMedia?.('(max-width: 590px)');
function syncLegend(){
 if(!mapWindow?.matches){
  legend.classList.remove('j185-open');
  toggle.setAttribute('aria-expanded','false');
  toggle.textContent='Show marker filters';
 }
}
mapWindow?.addEventListener?.('change',syncLegend);syncLegend();
// Expose map-source provenance where players need it, without suggesting
// that the backup reconstruction is an original game export.
const status=document.querySelector('.j180-map-status');
const source=document.createElement('span');source.className='j185-source-status';
source.setAttribute('aria-live','polite');
source.textContent='Loading island artwork';status?.prepend(source);
function syncSource(){
 // The existing map-view module updates status.textContent when changing maps.
 // Reinsert our source label so it stays visible after every switch.
 if(status && source.parentNode!==status)status.prepend(source);
 const type=focus.dataset.mapSource,asset=focus.dataset.mapAsset;
 if(type==='original'&&asset==='gta-wiki')source.textContent='Game-map source';
 else if(type==='original'&&asset==='local-trace')source.textContent='Local road-map fallback';
 else if(type==='enhanced')source.textContent='Enhanced illustration';
 else source.textContent='Loading map';
}
syncSource();new MutationObserver(syncSource).observe(focus,{attributes:true,attributeFilter:['data-map-source','data-map-asset']});
// Marker detail was anchored at the TOP of the map. For low-down island
// locations that placed the panel outside the visible phone viewport.
info.tabIndex=-1;
function fromMarker(event){
 if(event.target.closest('.j181-hotspot,.j180-chest')){
  requestAnimationFrame(()=>{
   if(!info.hidden)info.focus({preventScroll:true});
  });
 }
}
focus.addEventListener('click',fromMarker);
info.addEventListener('keydown',event=>{
 if(event.key!=='Escape')return;
 const close=info.querySelector('.j180-info-close');
 if(close){event.preventDefault();close.click();}
});
// Keep fullscreen and its backup CSS mode easy to exit on mobile.
document.addEventListener('keydown',event=>{
 if(event.key!=='Escape')return;
 // Also close details when the event originated outside the card, e.g. after
 // pressing an existing route/zoom control; do not trap keyboard navigation.
 if(!info.hidden){event.preventDefault();info.querySelector('.j180-info-close')?.click();}
 if(frame.classList.contains('j180-expanded'))frame.classList.remove('j180-expanded');
});
})();
