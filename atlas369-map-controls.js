/* Owner acceptance: one panel, one map toolbar and inline site navigation. */
(()=>{'use strict';
function init(){
 const $=id=>document.getElementById(id),map=document.querySelector('main.map-wrap');
 if(!map)return;
 const hub=$('j217-vi-hub'),panel=$('juraNavPanel'),card=$('selectedCard');
 // Measure the real wrapping toolbar, not a guessed fixed Y offset. This
 // handles iPhone text size, laptop browser zoom and coverage being revealed.
 if(document.body.dataset.startWorld==='6'){
  const top=map.querySelector('.maptop'),nav=map.querySelector('.jura-nav-bar'),legend=$('j368CoverageLegend');
  let frame=0;
  const layout=()=>{
   frame=0;if(!top||!nav)return;
   const rect=map.getBoundingClientRect(),t=top.getBoundingClientRect(),n=nav.getBoundingClientRect();
   if(!rect.width||!rect.height)return;
   const navTop=Math.max(72,Math.ceil(t.bottom-rect.top+8));
   const navHeight=n.height;
   const legendHeight=legend&&!legend.hidden?legend.getBoundingClientRect().height+8:0;
   const nextTop=Math.ceil(navTop+navHeight+legendHeight+10);
   map.style.setProperty('--j369-toolbar-top',navTop+'px');
   map.style.setProperty('--j369-next-top',nextTop+'px');
  };
  const requestLayout=()=>{if(!frame)frame=requestAnimationFrame(layout)};
  if(typeof ResizeObserver==='function'){
   const ro=new ResizeObserver(requestLayout);
   for(const node of [map,top,nav,legend])if(node)ro.observe(node);
  }
  window.addEventListener('resize',requestLayout,{passive:true});
  document.addEventListener('jura:legend-updated',requestLayout);
  requestLayout();
 }
 const closeCard=()=>{if(card&&!card.classList.contains('hidden'))$('closeSelected')?.click()};
 const closeRoute=()=>{if(panel&&!panel.hidden)$('juraCloseNav')?.click()};
 const closeHub=()=>{if(hub)hub.open=false};
 hub?.addEventListener('toggle',()=>{if(hub.open){closeRoute();closeCard()}});
 const observe=(el,attribute,fn)=>{if(el)new MutationObserver(fn).observe(el,{attributes:true,attributeFilter:[attribute]})};
 observe(panel,'hidden',()=>{if(!panel.hidden){closeHub();closeCard()}});
 observe(card,'class',()=>{if(!card.classList.contains('hidden')){closeHub();closeRoute()}});
 const official=$('j143-official-layer');
 observe(official,'hidden',()=>{if(!official.hidden){closeHub();closeRoute();closeCard()}});
 if(document.body.dataset.startWorld==='6'&&new URLSearchParams(location.search).get('dimension')==='3d'){
  const open=()=>{if(window.teamJuraNav?.getDimension&&official?.hidden!==false){window.teamJuraNav.setDimension('3d');return true}return false};
  if(!open()){let tries=0;const timer=setInterval(()=>{if(open()||++tries>=50)clearInterval(timer)},100)}
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
