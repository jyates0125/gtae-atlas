/* Atlas 36.4: one transparent credit band shared by Story, Online and Leonida.
 * The visible GTADB/CC BY 4.0 links remain present for every selected map view.
 * This file never downloads source media, saves visitor data or relabels gameplay truth.
 */
(function(root){
 'use strict';
 const LAYERS=Object.freeze({
   radar:'GTA V radar', satellite:'GTA V satellite', terrain:'GTA V terrain',
   roadmap:'GTA V roads', hybrid:'GTA V hybrid',
   day:'GTA VI in-game Day · Rockstar artwork',
   'scaly,view':'YANIS V18 · Scaly view',
   'yanis,18':'YANIS V18',
   'yanis,15':'YANIS V15 archive',
   'dupzor,51':'DUPZOR V51 · Loki view',
   'loki,view':'DUPZOR V51 · Loki view',
   'research,view':'YANIS V18 research'
 });
 function sourceForStyle(style){return LAYERS[String(style||'')]||'GTADB community tiles';}
 function init(){
   const layer=document.getElementById('layer');
   const note=document.getElementById('j364MapViewCredit');
   if(!layer||!note)return;
   const render=()=>{note.textContent=' · '+sourceForStyle(layer.value);};
   layer.addEventListener('change',render);
   // Atlas populates the layer select after startup. Watch options without polling.
   if(typeof MutationObserver==='function'){
     new MutationObserver(render).observe(layer,{childList:true,subtree:true});
   }
   root.addEventListener('pageshow',render);
   render();
 }
 root.JuraMapCredit=Object.freeze({sourceForStyle});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})(window);
