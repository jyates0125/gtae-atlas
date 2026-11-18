/* Team Jura Atlas 8.6 — approved Designed Brand interface bridge.
 * Original interface code. Existing engine owns map positions, routes and saves.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const defs=[
 ['story-spaceship-parts','Spaceship Parts','🛸',/spaceship|ufo/i],
 ['story-letter-scraps','Letter Scraps','✉️',/letter scrap/i],
 ['story-nuclear-waste','Nuclear Waste','☢️',/nuclear waste/i],
 ['story-submarine-pieces','Submarine Pieces','⚓',/submarine piece/i],
 ['story-monkey-mosaics','Monkey Mosaics','🐒',/monkey mosaic/i],
 ['story-peyote','Peyote Plants','🌵',/peyote/i],
 ['story-epsilon-tracts','Epsilon Tracts','📜',/epsilon/i],
 ['story-hidden-packages','Hidden Packages','🎁',/hidden package/i],
 ['story-stunt-jumps','Stunt Jumps','🏍️',/stunt jump/i],
 ['story-under-bridges','Under the Bridge','🌉',/under the bridge/i],
 ['story-knife-flights','Knife Flights','✈️',/knife flight/i],
 ['online-playing-cards','Playing Cards','🃏',/playing card/i],
 ['online-action-figures','Action Figures','🤖',/action figure/i],
 ['online-signal-jammers','Signal Jammers','📡',/signal jammer/i],
 ['online-ld-organics','LD Organics Products','🍃',/ld organics/i],
 ['online-movie-props','Movie Props','🎬',/movie prop/i],
 ['online-media-sticks','Media Sticks','💿',/media stick/i],
 ['online-snowmen','Snowmen','☃️',/snowman|snowmen/i],
 ['online-jack-o-lanterns','Jack O’ Lanterns','🎃',/jack.?o.?lantern|pumpkin/i],
 ['online-ls-tags','LS Tags','🎨',/ls tags|ls tag|graffiti|spray tag/i],
 ['sa-tags','Graffiti Tags','🎨',/graffiti tags/i],
 ['sa-snapshots','Snapshots','📷',/snapshot/i],
 ['sa-horseshoes','Horseshoes','🧲',/horseshoe/i],
 ['sa-oysters','Oysters','🦪',/oyster/i]
];
const iconById=new Map(defs.map(([id,,icon])=>[id,icon]));
const iconForText=(text)=>defs.find(([id,name,icon,re])=>re.test(String(text)))?.[2]||'📍';
const iconForSet=(id,name)=>iconById.get(id)||iconForText(name);
const iconForRecord=(record)=>record?.collectionType?iconForText(record.collectionType):record?.category==='collectible'?iconForText(record.name):null;
window.TeamJuraIcon86=Object.freeze({forSet:iconForSet,forRecord:iconForRecord,definitions:defs.map(([id,name,icon])=>({id,name,icon}))});
const page=(location.pathname.split('/').pop()||'').toLowerCase();
const vi=page==='atlas-vi.html';const mapPage=['atlas.html','atlas-online.html','atlas-vi.html'].includes(page);
const created=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el};
const decorateSelect=()=>{
 const sel=$('j83-set');if(!sel)return;
 for(const option of sel.options){if(!option.value)continue;
 const base=defs.find(d=>d[0]===option.value)?.[1]||option.textContent.replace(/^\s*[^a-zA-Z0-9]+\s*/,'');
 const amount=option.textContent.match(/(?:·|\/)\s*(\d+)/)?.[1];
 const desired=iconForSet(option.value,base)+' '+base+(amount?' · '+amount:'');
 if(option.textContent!==desired)option.textContent=desired;
 }
};
function decorateRows(){
 const list=$('j83-items'),sel=$('j83-set');if(!list||!sel)return;
 const icon=iconForSet(sel.value,sel.selectedOptions[0]?.textContent);
 for(const row of list.querySelectorAll('.j83-item')){
 const label=row.querySelector('.j83-item-label');if(!label)continue;
 let mark=row.querySelector('.j86-mark');if(!mark){mark=created('span','j86-mark');mark.setAttribute('aria-hidden','true');label.prepend(mark)}
 mark.textContent=icon;
 }
}
function decorateNamedLayers(){
 for(const root of [$('namedLayers'),$('juraMapLegendRows')]){
  if(!root)continue;
  for(const button of root.querySelectorAll('button')){
   const txt=button.textContent||'';const kind=defs.find(d=>d[3].test(txt));
   if(!kind)continue;
   // Never replace the real label, just set a semantic icon as an independent element.
   let badge=button.querySelector('.j86-mark');if(!badge){badge=created('span','j86-mark');badge.setAttribute('aria-hidden','true');button.prepend(badge)}
   badge.textContent=kind[2];
  }
 }
}
function setUpCollectionBridge(){
 const select=$('j83-set'),list=$('j83-items');if(!select||!list)return;
 let queued=false;const refresh=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;decorateSelect();decorateRows()})};
 const observe=(node)=>{const observer=new MutationObserver(refresh);observer.observe(node,{childList:true,subtree:false});};
 observe(select);observe(list);select.addEventListener('change',refresh);
 refresh();
 document.addEventListener('jura:progress-updated',refresh);
}
function makeVIButtons(){
 const select=$('layer');if(!select)return;
 const root=created('div','j86-mapviews');root.setAttribute('role','group');root.setAttribute('aria-label','Leonida illustration styles');
 const label=created('div','j86-view-title','MAP ARTWORK · CHOOSE VIEW');root.append(label);
 const bar=created('div','j86-view-row');root.append(bar);
 const viewNames={'scaly,view':'Scaly · YANIS','yanis,17':'Original YANIS','dupzor,51':'Original DUPZOR','uv2':'Illustrated UV','yanis,15':'Archive'};
 let observed='';
 function sync(){if(!select.options.length)return;const signature=[...select.options].map(o=>o.value).join('|');if(signature!==observed){observed=signature;bar.replaceChildren();for(const opt of select.options){const btn=created('button','j86-view-btn',viewNames[opt.value]||opt.textContent);btn.type='button';btn.dataset.view=opt.value;btn.onclick=()=>{select.value=opt.value;select.dispatchEvent(new Event('change',{bubbles:true}));sync()};bar.append(btn)}}
 for(const btn of bar.children){const active=btn.dataset.view===select.value;btn.setAttribute('aria-pressed',String(active))}
 }
 const control=select.closest('.mapcontrols');if(control){control.classList.add('j86-hide-original-view');control.insertAdjacentElement('afterend',root)}
 sync();select.addEventListener('change',sync);
 new MutationObserver(sync).observe(select,{childList:true});
}
function sidePanelArt(){
 const aside=$('sidebar');if(!aside)return;
 const wrapper=created('section','j86-crew');wrapper.setAttribute('aria-label','Team Jura original character art');
 wrapper.append(created('h2','', 'TEAM JURA · THE CREW'));
 const grid=created('div','j86-crew-grid');
 for(const [who,src,caption] of [['Scaly','./art/atlas86-scaly-approved.webp','Illustrated original'],['Loki','./art/atlas86-loki-approved.webp','Illustrated original']]){
 const tile=created('div','j86-crew-tile');const im=created('img');im.src=src;im.alt=who+' from the Team Jura original approved artwork';im.loading='lazy';const text=created('span','',who);const small=created('small','',caption);tile.append(im,text,small);grid.append(tile)}wrapper.append(grid);
 // Crew images remain in the approved design, but informational artwork comes
 // AFTER real map filters so the legend stays the first usable mobile control.
 wrapper.setAttribute('role','group');aside.append(wrapper);
}
function moveLegends(){
 const left=$('juraMapLegend'),right=$('juraTrailerLegend'),aside=$('sidebar');if(!left||!right||!aside)return;
 const stack=created('section','j86-legend-stack');stack.setAttribute('aria-label','Leonida layers and trailer research');
 const head=created('div','j86-stack-heading','LEONIDA · LAYERS & RESEARCH');stack.append(head);
 for(const [legend,heading] of [[left,'Map categories & locations'],[right,'Trailer research & locations']]){
   legend.classList.remove('jura-floating-left','jura-floating-right');legend.classList.add('j86-docked-legend');
   // Keep each native toggle and source hook. Docking must not duplicate or replace the legend.
   legend.open=true;legend.querySelector('summary')?.replaceChildren(document.createTextNode(heading));stack.append(legend);
 }
 const crew=$('.j86-crew');if(crew)crew.insertAdjacentElement('afterend',stack);else aside.append(stack);
 function visible(){const state=window.JuraDualLegendAPI?.state?.();const supported=state?.game==='6'&&['scaly,view','loki,view','research,view'].includes(state.style);stack.hidden=!supported;}
 document.addEventListener('jura:legend-updated',()=>{visible();decorateNamedLayers()});
 $('layer')?.addEventListener('change',visible);visible();
}
function betterMapNav(){
 // Keep existing map links; add direct HQ to the primary header and keep its label explicit.
 const header=document.querySelector('header.topbar nav');if(!header)return;
 if(!header.querySelector('[data-j86-home]')){const a=created('a','j86-home-link','⌂ Atlas HQ');a.href='./atlas81-hq.html';a.dataset.j86Home='true';header.prepend(a)}
}
function init(){
 document.body.classList.add('jura86-designed-brand');
 if(mapPage){betterMapNav();setUpCollectionBridge();document.addEventListener('jura:legend-updated',decorateNamedLayers)}
 if(vi){document.body.classList.add('jura86-leonida');sidePanelArt();moveLegends();makeVIButtons()}
 if(page==='atlas81-hq.html')document.body.classList.add('jura86-hq');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
