/* Atlas 21.7: VI world index behavior only. No map/route/local storage mutation. */
(()=>{'use strict';
const init=()=>{
 if(document.body?.dataset.startWorld!=='6')return;
 const hub=document.getElementById('j217-vi-hub');
 const side=document.getElementById('j217-vi-open-from-sidebar');
 const six=document.getElementById('game6');
 if(!hub)return;
 side?.addEventListener('click',e=>{
  e.preventDefault();
  hub.open=true;
  document.querySelector('main.map-wrap')?.scrollIntoView({block:'start',behavior:'smooth'});
  hub.querySelector('summary')?.focus();
 });
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&hub.open){hub.open=false;hub.querySelector('summary')?.focus()}
 });
 if(six){
  const sync=()=>{
   const notSix=six.getAttribute('aria-pressed')==='false'&&
    [...document.querySelectorAll('#game5,#gameOnline')].some(b=>b.getAttribute('aria-pressed')==='true');
   hub.hidden=notSix;
   if(notSix)hub.open=false;
  };
  const observer=new MutationObserver(sync);
  for(const b of [six,...document.querySelectorAll('#game5,#gameOnline')])
   observer.observe(b,{attributes:true,attributeFilter:['aria-pressed']});
  // Map initialization is deferred. Avoid suppressing the VI hub prematurely.
  requestAnimationFrame(()=>requestAnimationFrame(sync));
 }
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
