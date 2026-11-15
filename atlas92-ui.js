/* Team Jura Atlas 9.2 — forward-only interface polish. No source-data mutation. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const mapPage=['atlas.html','atlas-online.html','atlas-vi.html'].includes(page);
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
function init(){
 document.body.classList.add('jura92');
 if(page==='maps.html'){
  const hero=document.querySelector('.j87-hero > img');
  if(hero){hero.src='./art/atlas92-map-directory.webp';hero.alt='Team Jura original cinematic neon-coast map directory artwork';hero.decoding='async';}
 }
 if(mapPage){
  const aside=$('sidebar');if(!aside)return;
  // Existing map engine remains the only owner of filters, map positions and state.
  const named=aside.querySelector('.named-layer-section');
  const drawer=$('atlasFilterDrawer');
  const research=$('j86-legend-stack')||aside.querySelector('.j86-legend-stack');
  if(named&&!named.querySelector('.j92-title')){
   const title=el('div','j92-title','📍 MAP LOCATIONS · CLICK TO TOGGLE');named.prepend(title);
  }
  if(drawer){drawer.classList.add('j92-filter-drawer');drawer.open=true;}
  // VI research view buttons belong in the same left control area as VI legends.
  if(page==='atlas-vi.html'){
    const mapViews=document.querySelector('.j86-mapviews');
    if(mapViews&&aside&&!aside.contains(mapViews)){
      const anchor=named||drawer||aside.firstElementChild;
      anchor?.insertAdjacentElement('beforebegin',mapViews);
    }
    const hint=el('p','j92-confidence','LEONIDA RESEARCH · map coordinates and collectible candidates remain provisional. No positions are invented.');
    (named||aside).insertAdjacentElement('afterend',hint);
    const researchLink=el('a','j92-source-link','↗ Compare GTADB Leonida research');
    researchLink.href='https://gtadb.net/gta-6-map/interactive/';researchLink.target='_blank';researchLink.rel='noopener noreferrer';
    hint.append(document.createTextNode(' '),researchLink);
    if(research)research.classList.add('j92-research-stack');
  }
  // Clear mobile route into the existing sidebar, no overlapping floating menu.
  const shortcut=$('mobileTools');if(shortcut)shortcut.title='Open map filters and collection controls';
 }
 // Avoid stale brand versions in page headers without renaming source files.
 for(const node of document.querySelectorAll('header .brand, header .mast-title')){
   for(const text of [...node.childNodes]){
      if(text.nodeType===Node.TEXT_NODE && /ATLAS\s+7(?:\.\d+)?\s*Preview/i.test(text.nodeValue||''))text.nodeValue=text.nodeValue.replace(/ATLAS\s+7(?:\.\d+)?\s*Preview/ig,'ATLAS · COMMUNITY RESEARCH');
   }
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
