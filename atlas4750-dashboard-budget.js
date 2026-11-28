/* Dashboard rendering recovery: explicit opt-in, no storage mutation. */
(()=>{'use strict';
 const root=document.documentElement,lite=new URLSearchParams(location.search).get('lite')==='1';
 root.dataset.j4750Mode=lite?'lite':'full';
 function restore(){
  const link=document.getElementById('j4750-mode-link');
  if(lite){if(link){link.href='./atlas-dashboard.html';link.textContent='Restore full artwork'}return}
  for(const img of document.querySelectorAll('img[data-j4750-src]')){
   const src=img.dataset.j4750Src;
   if(/^\.\/art\/[a-z0-9-]+\.(?:webp|png|jpe?g)$/i.test(src)){img.decoding='async';img.src=src}
  }
 }
 window.JuraDashboardArt=Object.freeze({lite});
 document.addEventListener('DOMContentLoaded',restore,{once:true});
})();
