/* Team Jura 8.6: Cayo Perico reference bridge; never aligns uncalibrated schematic pins to screenshots. */
(()=>{'use strict';function init(){if(!document.getElementById('filters'))return;
 document.body.classList.add('j86-cayo');
 const main=document.querySelector('main');if(!main)return;
 const bar=document.createElement('nav');bar.className='j86-cayo-nav';bar.setAttribute('aria-label','Cayo Perico navigation');
 const links=[['⌂ Atlas HQ','./atlas81-hq.html'],['GTA Online map','./atlas-online.html'],['Heist HQ','./heist-cayo-perico.html'],['Map locations & photos ↗','https://gtadb.net/gta-online-map/interactive/']];
 for(const [name,href] of links){const a=document.createElement('a');a.href=href;a.textContent=name;if(href.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer'}bar.append(a)}
 main.prepend(bar);
 const note=document.createElement('section');note.className='j86-cayo-reference';const h=document.createElement('h2');h.textContent='Cayo Perico · artwork and sourced-location reference';
 const p=document.createElement('p');p.textContent='The current interactive island diagram is a planning schematic. Use the attributed external map for real island artwork and location references; do not interpret our schematic pins as verified game coordinates.';
 const a=document.createElement('a');a.href='https://gtadb.net/gta-online-map/interactive/';a.target='_blank';a.rel='noopener noreferrer';a.textContent='Open the source-backed Cayo Perico map ↗';note.append(h,p,a);
 const map=document.querySelector('.mapwrap');if(map){map.insertAdjacentElement('afterend',note)}else main.append(note);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();})();
