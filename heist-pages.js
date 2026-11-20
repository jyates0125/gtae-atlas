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
 scene.decoding='async';
}
const key='teamjura-heist-'+(document.body.dataset.heist||'unknown');const checks=[...document.querySelectorAll('[data-step]')];let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')}catch(e){}const update=()=>{const done=checks.filter(x=>x.checked).length;const p=document.getElementById('progress');if(p)p.textContent=done+' / '+checks.length+' tracked';const b=document.getElementById('progressBar');if(b)b.style.width=(checks.length?done/checks.length*100:0)+'%';try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(checks.map(x=>[x.dataset.step,x.checked]))))}catch(e){}};checks.forEach(x=>{x.checked=!!saved[x.dataset.step];x.addEventListener('change',update)});update();document.getElementById('resetProgress')?.addEventListener('click',()=>{if(!confirm('Clear this heist checklist?'))return;checks.forEach(x=>x.checked=false);update()});document.getElementById('exportProgress')?.addEventListener('click',()=>{const payload=JSON.stringify({heist:document.body.dataset.heist,steps:Object.fromEntries(checks.map(x=>[x.dataset.step,x.checked]))},null,2);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([payload],{type:'application/json'}));a.download='team-jura-'+document.body.dataset.heist+'-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});const search=document.getElementById('stepSearch');search?.addEventListener('input',()=>{const q=search.value.toLowerCase();checks.forEach(x=>x.closest('.step').classList.toggle('hide',!x.dataset.step.toLowerCase().includes(q)))});// The approved cinematic scenes remain in this page. Add the real map and notes
// as a separate opt-in enhancement so checklist keys and art never change.
if(document.body.classList.contains('j120-heist-page')){
 const style=document.createElement('link');style.rel='stylesheet';style.href='./atlas164-heist-workspace.css?v=164';document.head.append(style);
 const planner=document.createElement('script');planner.src='./atlas164-heist-workspace.js?v=164';document.body.append(planner);
 // Mission-specific mapped POIs and challenges appear ABOVE the optional regional map.
 const focusStyle=document.createElement('link');focusStyle.rel='stylesheet';focusStyle.href='./atlas167-heist-focus.css?v=167';document.head.append(focusStyle);
 const focus=document.createElement('script');focus.src='./atlas167-heist-focus.js?v=167';document.body.append(focus);
}
})();