/* Atlas 17.1: map-first Leonida research controls, no data or saved progress changes. */
(()=>{'use strict';
function init(){
 if(document.body.dataset.startWorld!=='6')return;
 const map=document.querySelector('main.map-wrap');
 const canvas=document.getElementById('atlasCanvas');
 if(!map||!canvas||map.querySelector('#j171-map-tools'))return;
 const bar=document.createElement('div');bar.id='j171-map-tools';bar.className='j171-tools';
 bar.setAttribute('role','group');bar.setAttribute('aria-label','Research map visibility controls');
 const create=(text,id)=>{const b=document.createElement('button');b.type='button';b.id=id;b.textContent=text;b.setAttribute('aria-pressed','false');return b};
 const size=create('⛶ Expand map','j171-expand-map'),bright=create('☀ Brighten map','j171-bright-map');
 bar.append(size,bright);map.append(bar);
 const redraw=()=>window.dispatchEvent(new Event('resize'));
 size.addEventListener('click',()=>{
  const active=map.classList.toggle('j171-full-map');
  document.body.classList.toggle('j171-map-expanded',active);
  size.textContent=active?'✕ Close large map':'⛶ Expand map';
  size.setAttribute('aria-pressed',String(active));
  redraw();requestAnimationFrame(redraw);
 });
 bright.addEventListener('click',()=>{
  const active=map.classList.toggle('j171-bright-map');
  bright.textContent=active?'◐ Default brightness':'☀ Brighten map';
  bright.setAttribute('aria-pressed',String(active));
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&map.classList.contains('j171-full-map')){size.click();size.focus()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();