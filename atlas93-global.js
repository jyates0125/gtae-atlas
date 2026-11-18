/* Team Jura 9.3 additive navigation + source hygiene. Does not mutate maps/data or saves. */
(()=>{'use strict';const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
function link(label,href){const a=document.createElement('a');a.textContent=label;a.href='./'+href;a.dataset.jura93='true';return a}
function addLink(root,label,target){if(!root||root.querySelector('a[href$="'+target+'"]'))return;const a=link(label,target);root.append(a)}
function init(){document.body.classList.add('jura93-designed-brand');
 // Existing universal dock is the only sitewide navigation owner; append, don't duplicate.
 if(/^heist-[a-z0-9-]+\.html$/.test(page)){document.body.dataset.j93World='heist';const slug=page.slice(0,-5);document.body.style.setProperty('--j93-banner-image',"url('./art/atlas93-"+slug+".svg')");}
 const worlds={'atlas.html':'story','atlas-online.html':'online','atlas-vi.html':'vi','atlas-cayo.html':'cayo','atlas-sa.html':'sa','atlas-iv.html':'iv','heists.html':'heists'};if(worlds[page])document.body.dataset.j93World=worlds[page];
 const nav=document.getElementById('j89-menu');if(nav){addLink(nav,'◆ My Garage','atlas93-garage.html');addLink(nav,'⚡ Atlas Dispatch','atlas93-dispatch.html');}
 // Add discoverable shortcuts to existing primary navigation while respecting old links.
 const primary=document.querySelector('header nav:not(#j89-shell)');if(primary&&window.matchMedia('(min-width:1200px)').matches&&!['atlas93-garage.html','atlas93-dispatch.html'].includes(page)){
  addLink(primary,'◆ Garage','atlas93-garage.html');addLink(primary,'⚡ Dispatch','atlas93-dispatch.html')
 }
 // Legacy version text is a presentation label, not an instruction to revert files.
 const branded=document.querySelectorAll('header .brand,header .mast-title,.sitebar .brand');
 for(const root of branded){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){
   if(/\bATLAS\s*7(?:\.[0-9.]+)?(?:\s*Preview)?\b/i.test(node.nodeValue||''))node.nodeValue=node.nodeValue.replace(/\bATLAS\s*7(?:\.[0-9.]+)?(?:\s*Preview)?\b/ig,'ATLAS 9.3');
 }}
 // A named view is not a license to pretend one artwork style is a new geographic map.
 if(page==='atlas-vi.html'){
   const pane=document.getElementById('sidebar');
   const stack=pane?.querySelector('.j86-legend-stack');
   if(stack){stack.hidden=false;stack.setAttribute('aria-label','GTA VI research map and trailer legends (provisional)')}
   const view=document.querySelector('.j86-mapviews');if(view&&pane&&!pane.contains(view))pane.insertBefore(view,pane.querySelector('.named-layer-section')||pane.firstElementChild);
   const note=document.createElement('p');note.className='j93-source-note';note.textContent='LEONIDA RESEARCH: existing Yanis, Scaly and Dupzor research views remain available. Community positions are provisional. Items without coordinates remain searchable, not fictional pins.';
   if(pane&&!pane.querySelector('.j93-source-note')){const anchor=pane.querySelector('.named-layer-section')||pane.firstElementChild;anchor?.insertAdjacentElement('beforebegin',note)}
 }
 // On maps: preserve actual engine and toggle handlers; make nested filter drawers easier to find.
 if(['atlas.html','atlas-online.html','atlas-vi.html'].includes(page)){
 const legend=document.querySelector('#atlasFilterDrawer');if(legend)legend.open=true;
 const named=document.querySelector('.named-layer-section');if(named&&!named.querySelector('.j93-legend-help')){
  const p=document.createElement('p');p.className='j93-legend-help';p.textContent='Every location category is a real map toggle. Select a label to show/hide its pins. Source-qualified research stays labeled.';named.prepend(p);
 }
 }
 // Dynamic category landing cards and utility links, without altering collection-engine data.
 const quick=document.querySelector('.j87-tools > div');if(page==='maps.html'&&quick){addLink(quick,'◆ My Garage','atlas93-garage.html');addLink(quick,'⚡ Atlas Dispatch','atlas93-dispatch.html')}
 const heistNav=document.querySelector('.sitebar nav');if(/^heist-.+\.html$/.test(page)&&heistNav)addLink(heistNav,'⚡ Dispatch','atlas93-dispatch.html');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* Heist-only cinematic mission planner; kept outside global map engines and save keys. */
(()=>{const page=location.pathname.split('/').pop()||'';if(page==='heists.html'||/^heist-[a-z0-9-]+\.html$/.test(page)){const script=document.createElement('script');script.src='./atlas104-heist-experience.js?v=104';script.defer=true;document.head.append(script)}})();
