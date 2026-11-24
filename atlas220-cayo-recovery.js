/* Team Jura Atlas 22.0 — self-healing Cayo-only module bootstrap.
 * Heist map modules are injected dynamically by heist-pages.js. Some Edge
 * sessions can miss an earlier local script without a JS exception, leaving
 * every dependent map panel absent. Restore them in dependency order.
 * Preserve original artwork, sources, coordinates and all saved guest keys.
 */
(()=>{'use strict';
if(document.body.dataset.heist!=='cayo-perico')return;
const ORDER=[
 ['atlas164-heist-workspace.js','164','j164-mission-map'],
 ['atlas167-heist-focus.js','191','j167-heist-map'],
 ['atlas168-heist-guides.js','168','j168-heist-guide'],
 ['atlas169-heist-views.js','169','j169-views'],
 ['atlas171-cayo-board.js','171','j171-cayo-board'],
 ['atlas180-cayo-flagship.js','383','j180-shell'],
 ['atlas181-cayo-hotspots.js','191','j181-hotspots'],
 ['atlas185-cayo-polish.js','185','j185-polish'],
 ['atlas186-cayo-route.js','191','j186-route'],
 ['atlas188-cayo-flow.js','1883','j188-quickbar']
];
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function loadOnce(file,version,attempt){
 return new Promise(resolve=>{
  const script=document.createElement('script');
  script.async=false;
  script.dataset.j220Retry=file;
  script.src='./'+file+'?v='+version+'&j220retry='+attempt;
  let settled=false;
  const complete=success=>{
   if(settled)return;
   settled=true;clearTimeout(timeout);resolve(success);
  };
  const timeout=setTimeout(()=>complete(false),6500);
  script.addEventListener('load',()=>complete(true),{once:true});
  script.addEventListener('error',()=>complete(false),{once:true});
  document.body.append(script);
 });
}
function showFailure(file){
 const root=document.querySelector('main.wrap');
 if(!root||document.getElementById('j220-cayo-recovery-warning'))return;
 const note=document.createElement('p');
 note.id='j220-cayo-recovery-warning';
 note.setAttribute('role','alert');
 note.style.cssText='border:1px solid #e6b878;background:#2c183e;color:#ffe2ab;padding:12px;border-radius:10px;font:700 13px/1.4 system-ui';
 note.textContent='Some Cayo map tools could not finish loading. Refresh to retry; your local heist notes and route progress are preserved.';
 root.prepend(note);
 console.warn('Team Jura Cayo dependency unavailable:',file);
}
async function repair(){
 document.body.dataset.j220CayoRecovery='checking';
 const recovered=[];
 // Let the original fast path finish. Recovery is a safety net, not a
 // competing map renderer or a second owner of marker/route state.
 await delay(900);
 for(const [file,version,id] of ORDER){
  if(document.getElementById(id))continue;
  for(let n=1;n<=2&&!document.getElementById(id);n++){
   await loadOnce(file,version,n);
   await delay(120);
  }
  if(!document.getElementById(id)){
   document.body.dataset.j220CayoRecovery='failed';
   document.body.dataset.j220CayoMissing=file;
   showFailure(file);return;
  }
  recovered.push(file);
 }
 document.body.dataset.j220CayoRecovery='ready';
 document.body.dataset.j220Recovered=recovered.join(',');
 if(recovered.length)document.dispatchEvent(new Event('jura:cayo-recovered'));
}
repair().catch(error=>{
 document.body.dataset.j220CayoRecovery='failed';
 console.warn('Team Jura Cayo recovery failed:',error);
 showFailure('recovery');
});
})();