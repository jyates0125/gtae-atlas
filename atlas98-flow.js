/* Shared route home for every pre-existing Team Jura Atlas page.
   Does not manipulate canvas, map coordinates, local storage, filters, or page event handlers. */
(()=>{'use strict';
 const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 const skip=new Set(['index.html','maps.html','atlas98-style-lab.html']);if(skip.has(file))return;
 const TITLES={'atlas.html':'GTA V Story','atlas-online.html':'GTA Online','atlas-vi.html':'GTA VI Leonida','atlas-research.html':'VI Research','heist-cayo-perico.html':'Cayo Perico','atlas-iv.html':'GTA IV','atlas-sa.html':'San Andreas','atlas81-hq.html':'Collection HQ','heists.html':'Heist HQ','one-last-ride.html':'One Last Ride'};
 const get=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt)n.textContent=txt;return n};
 function init(){if(document.getElementById('j98-flow'))return;const dock=get('nav','j98-flow');dock.id='j98-flow';dock.setAttribute('aria-label','Team Jura quick navigation');
  const start=get('a','','✦ Start Here');start.href='./atlas97-journey.html';const all=get('a','','◈ 13 Maps');all.href='./maps.html';dock.append(start,all);
  const details=get('details','j98-flow-worlds');const summary=get('summary','','Choose 13 worlds');details.append(summary);
  const sub=get('div','j98-flow-sub');for(const [label,href] of [
  ['GTA V Story','atlas.html'],['GTA Online','atlas-online.html'],
  ['GTA VI','atlas-vi.html'],['Cayo Perico','heist-cayo-perico.html'],
  ['GTA IV','atlas-iv.html'],['San Andreas','atlas-sa.html'],
  ['Vice City','map-hub.html?game=vc'],['GTA III','map-hub.html?game=iii'],
  ['Vice City Stories','map-hub.html?game=vcs'],
  ['Liberty City Stories','map-hub.html?game=lcs'],
  ['Chinatown Wars','map-hub.html?game=ctw'],
  ['Lost and Damned','atlas-iv.html?scope=tlad'],
  ['Ballad of Gay Tony','atlas-iv.html?scope=tbogt']
 ]){const a=get('a','',label);a.href='./'+href;if(href===(file+location.search))a.setAttribute('aria-current','page');else if(href===file)a.setAttribute('aria-current','page');sub.append(a)}details.append(sub);dock.append(details);
  const NEXT={
  'atlas.html':['Collectibles','atlas81-hq.html#collections'],
  'atlas-online.html':['Today’s Events','atlas87-daily.html'],
  'atlas-vi.html':['VI Research','atlas-research.html'],
  'atlas-research.html':['VI Map','atlas-vi.html'],
  'atlas-iv.html':['IV Landmarks','atlas98-landmarks.html?game=4'],
  'atlas81-hq.html':['Story Map','atlas.html'],
  'atlas93-garage.html':['Vehicles','atlas90-vehicles5.html'],
  'atlas90-vehicles5.html':['My Garage','atlas-forge-collections.html'],
  'atlas90-weapons.html':['Online Map','atlas-online.html'],
  'atlas87-daily.html':['Online Map','atlas-online.html'],
  'heists.html':['Cayo Map','heist-cayo-perico.html']
 };
 const next=NEXT[file];if(next){const jump=get('a','j98-flow-next','↗ '+next[0]);jump.href='./'+next[1];jump.title='Open related Atlas workspace';dock.append(jump)}
 const label=TITLES[file];if(label){const current=get('span','j98-flow-current',label);current.title='Current Atlas workspace';dock.append(current)}
  document.body.append(dock);
  // The original nav and tools stay available. This compact dock is a safe escape route.
  document.addEventListener('click',e=>{if(!details.contains(e.target))details.open=false});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')details.open=false});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
