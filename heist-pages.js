(()=>{'use strict';
// Use the completed original Elario/Team Jura heist illustrations, not a
// repeated generic skyline. These are not calibrated map baselayers.
const heistId=String(document.body.dataset.heist||'');
const scene=document.querySelector('.mapbox > img');
if(scene && /^[a-z0-9-]+$/.test(heistId)){
 // Never overwrite owner-approved cinematic art with legacy SVG content.
 const premium='./art/jura159-heist-'+heistId+'.webp';
 if(scene.getAttribute('src')!==premium)scene.setAttribute('src',premium);
 scene.alt='Original cinematic Elario mission concept; not an in-game map or route';
 scene.loading='eager';
 scene.fetchPriority='high'; // Prioritize the approved local cinematic cover over deferred accessories.
 scene.decoding='async';
}
const key='teamjura-heist-'+(document.body.dataset.heist||'unknown');const checks=[...document.querySelectorAll('[data-step]')];let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')}catch(e){}const update=()=>{const done=checks.filter(x=>x.checked).length;const p=document.getElementById('progress');if(p)p.textContent=done+' / '+checks.length+' tracked';const b=document.getElementById('progressBar');if(b)b.style.width=(checks.length?done/checks.length*100:0)+'%';try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(checks.map(x=>[x.dataset.step,x.checked]))))}catch(e){}};checks.forEach(x=>{x.checked=!!saved[x.dataset.step];x.addEventListener('change',update)});update();document.getElementById('resetProgress')?.addEventListener('click',()=>{if(!confirm('Clear this heist checklist?'))return;checks.forEach(x=>x.checked=false);update()});document.getElementById('exportProgress')?.addEventListener('click',()=>{const payload=JSON.stringify({heist:document.body.dataset.heist,steps:Object.fromEntries(checks.map(x=>[x.dataset.step,x.checked]))},null,2);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([payload],{type:'application/json'}));a.download='team-jura-'+document.body.dataset.heist+'-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});const search=document.getElementById('stepSearch');search?.addEventListener('input',()=>{const q=search.value.toLowerCase();checks.forEach(x=>x.closest('.step').classList.toggle('hide',!x.dataset.step.toLowerCase().includes(q)))});// The approved cinematic scenes remain in this page. Add the real map and notes
// as a separate opt-in enhancement so checklist keys and art never change.
if(document.body.classList.contains('j120-heist-page')){
 const style=document.createElement('link');style.rel='stylesheet';style.href='./atlas164-heist-workspace.css?v=164';document.head.append(style);
 const planner=document.createElement('script');planner.async=false;planner.src='./atlas164-heist-workspace.js?v=164';document.body.append(planner);
 // Mission-specific mapped POIs and challenges appear ABOVE the optional regional map.
 const focusStyle=document.createElement('link');focusStyle.rel='stylesheet';focusStyle.href='./atlas167-heist-focus.css?v=167';document.head.append(focusStyle);
 const focus=document.createElement('script');focus.async=false;focus.src='./atlas167-heist-focus.js?v=191';document.body.append(focus);
 const guideStyle=document.createElement('link');guideStyle.rel='stylesheet';guideStyle.href='./atlas168-heist-guides.css?v=168';document.head.append(guideStyle);
 const guide=document.createElement('script');guide.async=false;guide.src='./atlas168-heist-guides.js?v=168';document.body.append(guide);
 const viewsStyle=document.createElement('link');viewsStyle.rel='stylesheet';viewsStyle.href='./atlas169-heist-views.css?v=169';document.head.append(viewsStyle);
 const views=document.createElement('script');views.async=false;views.src='./atlas169-heist-views.js?v=169';document.body.append(views);
 if(heistId!=='cayo-perico'){
  const phasesStyle=document.createElement('link');phasesStyle.rel='stylesheet';phasesStyle.href='./atlas298-heist-map-kit.css?v=298';document.head.append(phasesStyle);
  const phases=document.createElement('script');phases.async=false;phases.src='./atlas298-heist-map-kit.js?v=298';document.body.append(phases);
 }
 if(heistId==='cayo-perico'){
  const cayoStyle=document.createElement('link');cayoStyle.rel='stylesheet';cayoStyle.href='./atlas171-cayo-board.css?v=171';document.head.append(cayoStyle);
  const cayo=document.createElement('script');cayo.async=false;cayo.src='./atlas171-cayo-board.js?v=171';document.body.append(cayo);
  // Nov 20 owner-approved Cayo flagship: map-first purple/gold layout with dated chests.
  const flagshipStyle=document.createElement('link');flagshipStyle.rel='stylesheet';flagshipStyle.href='./atlas180-cayo-flagship.css?v=180';document.head.append(flagshipStyle);
  const flagship=document.createElement('script');flagship.async=false;flagship.src='./atlas180-cayo-flagship.js?v=180';document.body.append(flagship);
  const iconsStyle=document.createElement('link');iconsStyle.rel='stylesheet';iconsStyle.href='./atlas181-cayo-hotspots.css?v=202';document.head.append(iconsStyle);
  const icons=document.createElement('script');icons.async=false;icons.src='./atlas181-cayo-hotspots.js?v=191';document.body.append(icons);
  // The Cayo page loads its map geometry before deferred scripts initialize.
  // Retain support for older cached page shells and failed stylesheet requests.
  const sheet=document.querySelector('link[href*="atlas185-cayo-polish.css"]');
  if(!sheet?.sheet){
   const polishCSS=document.createElement('link');
   polishCSS.rel='stylesheet';polishCSS.href='./atlas185-cayo-polish.css?v=185';
   document.head.append(polishCSS);
  }
  const polish=document.createElement('script');polish.async=false;polish.src='./atlas185-cayo-polish.js?v=185';document.body.append(polish);
  const routeStyle=document.createElement('link');routeStyle.rel='stylesheet';routeStyle.href='./atlas186-cayo-route.css?v=187';document.head.append(routeStyle);
  const routePlanner=document.createElement('script');routePlanner.async=false;routePlanner.src='./atlas186-cayo-route.js?v=191';document.body.append(routePlanner);
  // Atlas 18.8: one user-facing filter selection shared by Cayo icons + personal route.
  const quickStyle=document.createElement('link');quickStyle.rel='stylesheet';quickStyle.href='./atlas188-cayo-flow.css?v=1882';document.head.append(quickStyle);
  const quick=document.createElement('script');quick.async=false;quick.src='./atlas188-cayo-flow.js?v=1883';document.body.append(quick);
 }
}
})();