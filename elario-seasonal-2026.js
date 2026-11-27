/* The full artwork is shown only after successful loading. Archive stays after season. */
(()=>{'use strict';
 const expires=Date.parse('2026-12-01T06:00:00Z');
 const starts=Date.parse('2026-11-26T06:00:00Z');
 const now=Date.now();
 for(const figure of document.querySelectorAll('[data-elario-seasonal-card]')){
   const welcome=figure.dataset.elarioSeasonalCard==='welcome';
   if(welcome&&(now<starts||now>=expires))continue;
   const img=figure.querySelector('img');
   if(!img||!img.dataset.src)continue;
   const reveal=()=>{if(!img.naturalWidth)return;figure.hidden=false;
     if(welcome){const hero=figure.closest('.j130-public-hero');if(hero)hero.dataset.elarioSeasonal='active';}
     else{const archive=figure.closest('.elario-creative-archive');if(archive)archive.hidden=false;}
   };
   img.addEventListener('load',reveal,{once:true});
   img.addEventListener('error',()=>{figure.hidden=true;},{once:true});
   img.src=img.dataset.src;
   if(img.complete&&img.naturalWidth)reveal();
 }
})();
