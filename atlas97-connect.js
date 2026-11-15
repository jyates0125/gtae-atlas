/* Atlas 9.7: consistent next-step navigation while respecting legacy pages and native map controls.
 * Additive, no generated pins, no migrations, no existing saved-state key changes. */
(()=>{'use strict';
const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const n=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e};
const legacy={
 'atlas8-preview.html':['an earlier Designed Brand preview','atlas97-journey.html'],
 'directory.html':['the earlier discovery directory','atlas97-journey.html'],
 'discovery.html':['an earlier discovery deck','atlas97-journey.html'],
 'explorer.html':['a legacy map workspace','atlas.html'],
 'online-explorer.html':['a legacy online map workspace','atlas-online.html'],
 'legacy-explorer.html':['a legacy Leonida map workspace','atlas-research.html'],
 'hunt-hq.html':['a legacy collection workspace','atlas81-hq.html'],
 'leonida-hq.html':['an earlier Leonida landing page','atlas-research.html']
};
const resume={'atlas.html':1,'atlas-online.html':1,'atlas-vi.html':1,'atlas-research.html':1,'atlas-cayo.html':1,'atlas93-garage.html':1,'atlas81-hq.html':1,'heists.html':1,'atlas90-vehicles5.html':1,'atlas90-vehicles6.html':1,'atlas87-daily.html':1,'atlas93-dispatch.html':1};
function addMenu(){const menu=document.getElementById('j89-menu');if(!menu||menu.querySelector('[data-j97-start]'))return;
 const a=n('a','j97-menu-start','✦ Start here · Choose your adventure');a.href='./atlas97-journey.html';a.dataset.j97Start='true';
 const top=menu.querySelector('.j89-panel-head');if(top)top.insertAdjacentElement('afterend',a);else menu.prepend(a);
}
function onHomepage(){if(!['index.html','atlas81-hq.html'].includes(page))return;
 const main=document.querySelector('main');if(!main||main.querySelector('.j97-entry'))return;
 const box=n('section','j97-entry');box.setAttribute('aria-label','Start exploring with Team Jura Atlas');
 const copy=n('div');copy.append(n('small','','ELARIO STUDIOS · TEAM JURA · START HERE'),n('h2','','One clear place to begin.'),n('p','','Choose GTA V, Online, Leonida research, collectibles, garage, or heist tools — with your progress linked to the same browser.'));
 const button=n('a','j97-entry-action','✦ Open Atlas Start Here');button.href='./atlas97-journey.html';box.append(copy,button);
 const hero=main.querySelector('.page-hero,.hero,.j81-hero');if(hero&&hero.parentElement===main)hero.insertAdjacentElement('afterend',box);else main.prepend(box);
}
function oldPage(){const hint=legacy[page];if(!hint||document.getElementById('j97-legacy-note'))return;
 const block=n('aside','j97-legacy-note');block.id='j97-legacy-note';block.setAttribute('aria-label','Current Atlas workspace');block.append(n('strong','','Earlier workspace preserved'),n('span','','You are viewing '+hint[0]+'. Its original tools remain available. The current Atlas experience is linked here.'));
 const link=n('a','','Open current Atlas workspace');link.href='./'+hint[1];block.append(link);
 const target=document.querySelector('main')||document.querySelector('.shell')||document.body;
 target.prepend(block);
}
function catalog(){if(page!=='atlas-catalog.html')return;
 const main=document.querySelector('main');if(!main||main.querySelector('.j97-catalog-bridge'))return;
 const box=n('section','j97-catalog-bridge');box.append(n('b','','Looking for pictured vehicles or your actual saved garage?'));
 for(const [label,href] of [['◆ Browse GTA V vehicles','atlas90-vehicles5.html'],['▣ My Garage & parking','atlas93-garage.html']]){const a=n('a','',label);a.href='./'+href;box.append(a)}main.prepend(box);
}
function init(){if(resume[page]){try{localStorage.setItem('team-jura-atlas97-last-workspace-v1',JSON.stringify({page,visitedAt:new Date().toISOString()}))}catch{}}
 addMenu();onHomepage();oldPage();catalog();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* Atlas 9.8 forward-only navigation bridge. The original 9.7 functions above remain unchanged. */
(()=>{'use strict';
 if(document.querySelector('script[data-team-jura-flow]'))return;
 const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='./atlas98-flow.css?v=98a';sheet.dataset.teamJuraFlow='true';document.head.append(sheet);
 const script=document.createElement('script');script.defer=true;script.src='./atlas98-flow.js?v=98a';script.dataset.teamJuraFlow='true';document.head.append(script);
})();
