/* Atlas 15.4. Actual map engines retain all camera, map tile, and player-state logic. */
(()=>{'use strict';
 function init(){
   const canvas=document.querySelector('#atlasCanvas');
   const map=canvas?.closest('.map-wrap');
   if(!canvas||!map)return;
   const zoom=map.querySelector('.zoom');
   const plus=map.querySelector('#zoomIn');
   const minus=map.querySelector('#zoomOut');
   const reset=map.querySelector('#resetView');
   if(!zoom||!plus||!minus||!reset)return;
   plus.title='Zoom in · map';minus.title='Zoom out · map';
   // Keep Fit beside zoom so a panned/zoomed-offscreen map is always recoverable.
   if(!map.querySelector('#j154ZoomFit')){
     const fit=document.createElement('button');
     fit.type='button';fit.id='j154ZoomFit';fit.textContent='FIT';
     fit.title='Show the whole map';fit.setAttribute('aria-label','Fit entire map in view');
     fit.addEventListener('click',()=>reset.click());
     zoom.append(fit);
   }
   // The 2D and WebGL 3D cameras have distinct controllers. The SAME
   // visible +/- buttons correctly delegate in 3D without double-zooming 2D.
   for(const [button,id] of [[plus,'jura3dZoomIn'],[minus,'jura3dZoomOut']]){
     button.addEventListener('click',e=>{
       if(!document.body.classList.contains('jura-in-3d')||document.body.classList.contains('jura-perspective-fallback'))return;
       const three=document.getElementById(id);
       if(!three)return;
       e.preventDefault();e.stopImmediatePropagation();three.click();
     },true);
   }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
