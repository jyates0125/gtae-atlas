/* Team Jura 10.5 — source-credited SA 2D collector points. Preserves guest progress.
 * Original game script coordinates from MIT-licensed Flentric extractor.
 * Projection onto Toliak 6000px vector is APPROXIMATE and explicitly disclosed.
 * No change to GTA V, GTA Online, GTA VI engine or existing user save keys. */
(()=>{'use strict';let attempted=false;
async function load(){
 if(attempted||!window.TeamJuraSAArtwork?.isVectorReady?.())return;
 attempted=true;const status=document.getElementById('status');
 try{
  const resp=await fetch('./data/atlas-sa-approx-collectibles.json',{cache:'no-cache'});
  if(!resp.ok)throw Error('HTTP '+resp.status);
  const pack=await resp.json();
  if(!window.TeamJuraSAArtwork?.loadSourcedApproximate?.(pack))throw Error('Pack rejected or a different visitor map is in use');
  document.body.dataset.saApproxPins='loaded';
 }catch(e){attempted=false;document.body.dataset.saApproxPins='unavailable';if(status)status.textContent='Sourced approximate pins unavailable: '+e.message+'. Your checklist and imported maps still work.'}
}
window.addEventListener('jura-sa-vector-ready',load);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();