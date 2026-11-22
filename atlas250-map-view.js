/* Atlas 25.0 — high-detail publisher view, separate from private Atlas notes. */
(()=>{'use strict';
const p=new URLSearchParams(location.search),raw=(p.get('game')||p.get('world')||'iii').toLowerCase(),id=({'vice-city-stories':'vcs','liberty-city-stories':'lcs','chinatown-wars':'ctw','lost-and-damned':'tlad','ballad-of-gay-tony':'tbogt'})[raw]||raw;
const sources={lcs:'https://gtamap.io/gta-liberty-city-stories-map/',vcs:'https://gtamap.io/gta-vice-city-stories-map/',ctw:'https://gtamap.io/gta-chinatown-wars-map/',tlad:'./atlas-iv.html?scope=tlad',tbogt:'./atlas-iv.html?scope=tbogt'};
if(!sources[id])return;
const viewport=document.getElementById('classicViewport');if(!viewport)return;
const own=['tlad','tbogt'].includes(id),E=(tag,value)=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=value;return n};
const box=E('section');box.id='j250-map-view';box.className='j240-source-index';
const h=E('h3',own?'Explore the interactive episode map':'High-detail interactive map');const ptext=E('p',own?'Use our native GTA IV tile engine with edition-specific collectible filters. The saved personal image notebook remains available below.':'GTAMap.io · source-published high-detail viewer. Open the publisher view alongside our private route and coordinate tools. External markers retain the publisher design; Atlas markers remain our original violet and gold.');
const link=E('a',own?'Open native episode map ↗':'Open publisher map in a new tab ↗');link.href=sources[id];link.target=own?'_self':'_blank';link.rel='noopener noreferrer';link.id='j250-source-link';
box.append(h,ptext);
if(!own){
 const b=E('button','Open high-detail viewer here');b.type='button';b.id='j250-open';b.setAttribute('aria-expanded','false');
 const host=E('div');host.hidden=true;host.id='j250-external';const note=E('p','External site · no Atlas account or private marker data is sent. If the publisher blocks embedded viewing, use the direct source link instead.');
 b.onclick=()=>{if(!host.hidden){host.hidden=true;host.replaceChildren();b.textContent='Open high-detail viewer here';b.setAttribute('aria-expanded','false');return}
  const iframe=E('iframe');iframe.title='GTAMap.io '+id+' source viewer';iframe.referrerPolicy='no-referrer';iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-popups');iframe.src=sources[id];iframe.loading='lazy';host.append(note,iframe);host.hidden=false;b.setAttribute('aria-expanded','true');b.textContent='Close publisher viewer';};
 box.append(b,link,host);
}else box.append(link);
viewport.before(box);
})();
