/* Atlas 14.5 — map-first mobile entry for GTA V Story, Online and GTA VI.
 * Keeps existing desktop layouts, map canvases, world-specific data and routes.
 * No view data, storage keys or game-specific marker logic is altered.
 */
(()=>{'use strict';
const initialHash=location.hash,initialQuery=new URLSearchParams(location.search);
const page=location.pathname.split('/').pop()?.toLowerCase();
if(!['atlas.html','atlas-online.html','atlas-vi.html'].includes(page))return;
function init(){
 const sidebar=document.getElementById('sidebar'),map=document.querySelector('main.map-wrap');
 if(!sidebar||!map)return;
 if(!sidebar.querySelector('.j145-open-map')){
  const link=document.createElement('a');link.href='#atlasCanvas';link.className='j145-open-map';
  link.setAttribute('aria-label','Jump to the interactive map');
  link.textContent='▧ Open interactive map';
  link.addEventListener('click',e=>{
   e.preventDefault();
   if(matchMedia('(max-width:700px)').matches)sidebar.classList.add('mobile-collapsed');
   map.scrollIntoView({block:'start',behavior:'smooth'});
  });
  // The collectibles module inserts a second game-nav after .worlds.
  // Place our shortcut before the heading so both navigation rows precede it.
  const heading=sidebar.querySelector('.atlas-explorer-head');
  if(heading)heading.insertAdjacentElement('beforebegin',link);
  else (sidebar.querySelector('.j83-worldnav')||sidebar.querySelector('.worlds')||sidebar.firstElementChild)?.insertAdjacentElement('afterend',link);
 }
 // Browser fragment navigation can scroll into the filters on a first visit;
 // first-time mobile visitors should begin with the actual interactive map.
 // Explicit deep links and coordinate destinations retain their own navigation.
 if(matchMedia('(max-width:700px)').matches&&!initialHash&&!initialQuery.has('x')){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(window.scrollY>0)window.scrollTo({top:0,behavior:'instant'});
  }));
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();