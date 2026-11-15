/* Shared route home for every pre-existing Team Jura Atlas page.
   Does not manipulate canvas, map coordinates, local storage, filters, or page event handlers. */
(()=>{'use strict';
 const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 const skip=new Set(['index.html','maps.html','map-hub.html','atlas98-style-lab.html']);if(skip.has(file))return;
 const TITLES={'atlas.html':'GTA V Story','atlas-online.html':'GTA Online','atlas-vi.html':'GTA VI Leonida','atlas-research.html':'VI Research','atlas-cayo.html':'Cayo Perico','atlas-iv.html':'GTA IV','atlas-sa.html':'San Andreas','atlas81-hq.html':'Collection HQ','heists.html':'Heist HQ','one-last-ride.html':'One Last Ride'};
 const get=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt)n.textContent=txt;return n};
 function init(){if(document.getElementById('j98-flow'))return;const dock=get('nav','j98-flow');dock.id='j98-flow';dock.setAttribute('aria-label','Team Jura quick navigation');
  const start=get('a','','⌂ Start Here');start.href='./index.html';const all=get('a','','◈ 13 Maps');all.href='./maps.html';dock.append(start,all);
  const details=get('details','j98-flow-worlds');const summary=get('summary','','Choose world');details.append(summary);
  const sub=get('div','j98-flow-sub');for(const [label,href] of [['GTA V','atlas.html'],['Online','atlas-online.html'],['GTA VI','atlas-vi.html'],['Cayo','atlas-cayo.html'],['GTA IV','atlas-iv.html'],['San Andreas','atlas-sa.html']]){const a=get('a','',label);a.href='./'+href;if(href===file)a.setAttribute('aria-current','page');sub.append(a)}details.append(sub);dock.append(details);
  const label=TITLES[file];if(label){const current=get('span','j98-flow-current',label);current.title='Current Atlas workspace';dock.append(current)}
  document.body.append(dock);
  // The original nav and tools stay available. This compact dock is a safe escape route.
  document.addEventListener('click',e=>{if(!details.contains(e.target))details.open=false});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')details.open=false});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
