/* Atlas 12.1: original Cayo game image and separate planning schematic.
   Does not reproject or silently change any saved heist route/marker positions. */
(()=>{'use strict';
const original=document.getElementById('j121Original'),planner=document.getElementById('j121Planner'),holder=document.querySelector('.mapwrap'),figure=document.getElementById('j121OriginalImage');
if(!original||!planner||!holder||!figure)return;
function select(view){
 const showing=view==='original';
 holder.classList.toggle('j121-original',showing);
 original.setAttribute('aria-pressed',String(showing));
 planner.setAttribute('aria-pressed',String(!showing));
 const map=document.getElementById('map');
 if(map)map.setAttribute('aria-hidden',String(showing));
 figure.setAttribute('aria-hidden',String(!showing));
}
original.addEventListener('click',()=>select('original'));
planner.addEventListener('click',()=>select('planner'));
const image=figure.querySelector('img');
if(image){image.addEventListener('error',()=>{
 select('planner');original.disabled=true;original.title='Original map image host unavailable; interactive planning map remains usable';
});}
select('original');
})();