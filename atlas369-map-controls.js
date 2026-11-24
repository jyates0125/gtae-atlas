/* Owner acceptance: one panel, one map toolbar and inline site navigation. */
(()=>{'use strict';
function init(){
 const $=id=>document.getElementById(id),map=document.querySelector('main.map-wrap');
 if(!map)return;
 const hub=$('j217-vi-hub'),panel=$('juraNavPanel'),card=$('selectedCard');
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
