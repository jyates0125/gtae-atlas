/* Compact world-specific source index link; direct map fallbacks remain functional. */
(()=>{'use strict';const query=new URLSearchParams(location.search),alias={'vice-city':'vc','gta-iii':'iii','vice-city-stories':'vcs','liberty-city-stories':'lcs','chinatown-wars':'ctw','lost-and-damned':'tlad','ballad-of-gay-tony':'tbogt'},raw=(query.get('game')||query.get('world')||'iii').toLowerCase(),world=alias[raw]||raw;
const anchors={iii:'classic-iii-sources',vc:'classic-vc-sources',lcs:'classic-lcs-sources',vcs:'classic-vcs-sources',ctw:'ctw-camera-reference',tlad:'classic-episode-sources',tbogt:'classic-episode-sources'};
function init(){const link=document.getElementById('j98b-source-link');if(link&&Object.hasOwn(anchors,world))link.href='./atlas-credits.html#'+anchors[world]}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
