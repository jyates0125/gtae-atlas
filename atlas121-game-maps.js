/* Team Jura Atlas 12.1 — game-specific sourced flat-map imagery.
 * Original game map artwork © Rockstar Games / Take-Two Interactive.
 * Original source records: atlas-credits.html. No third-party rendered
 * GTAMap.io layers or landmark databases are mirrored. */
(function(root){'use strict';
const w='https://gta.fandom.com/wiki/Special:FilePath/';
const entries={
 iii:{name:'GTA III · Liberty City',urls:[w+'LibertyCity-GTAIII-MapFull-ExceptUpstate.png','https://steamuserimages-a.akamaihd.net/ugc/576744021337529637/BC8EE7AF9B0FEB82789BD6F4B5C16CFF358B5488/']},
 vc:{name:'GTA Vice City',urls:['./art/maps/gta-vice-city-original.png','https://raw.githubusercontent.com/denizariyan/GTA-Vice-City-Interactive-Map/master/gtavc-map/map.png',w+'ViceCity-GTAVC-MapHD.jpg']},
 vcs:{name:'Vice City Stories',urls:['https://www.gtabase.com/igallery/maps/gta-vice-city-stories-map-1920.jpg',w+'ViceCity-GTAVCS-MapFull.png']},
 lcs:{name:'Liberty City Stories',urls:[w+'LibertyCity-GTALCS-MapFull-ExceptUpstate.png','https://cdn.mobygames.com/covers/1683327-grand-theft-auto-liberty-city-stories-map.jpg']},
 ctw:{name:'Chinatown Wars',urls:['https://www.igrandtheftauto.com/content/images/1934-gtacw-full-map.jpg?etag=4aa78663',w+'LibertyCity-GTACW-FullMap.png']},
 tlad:{name:'The Lost and Damned',urls:['./art/maps/gta-iv-liberty-reference.jpg','https://www.gtavision.com/images/content/iv_map/gtaiv_map_hq.jpg',w+'LibertyCity-GTAIV-MapwithStreetNames.jpg']},
 tbogt:{name:'The Ballad of Gay Tony',urls:['./art/maps/gta-iv-liberty-reference.jpg','https://www.gtavision.com/images/content/iv_map/gtaiv_map_hq.jpg',w+'LibertyCity-GTAIV-MapwithStreetNames.jpg']}
};
const cache=new Map();
function load(id){
 if(!Object.prototype.hasOwnProperty.call(entries,id))return Promise.resolve(null);
 if(cache.has(id))return cache.get(id);
 const e=entries[id];
 const task=new Promise(resolve=>{
  let i=0,settled=false;
  function tryNext(){
   if(settled)return;
   if(i>=e.urls.length){settled=true;resolve(null);return}
   const url=e.urls[i++],img=new Image();
   const timer=setTimeout(()=>{img.onload=null;img.onerror=null;tryNext()},6000);
   img.onload=()=>{clearTimeout(timer);if(settled)return;
      if(img.naturalWidth<300||img.naturalHeight<200){tryNext();return}
      settled=true;resolve({url,width:img.naturalWidth,height:img.naturalHeight,name:e.name})};
   img.onerror=()=>{clearTimeout(timer);tryNext()};
   img.src=url;
  }tryNext();
 });
 cache.set(id,task);return task;
}
root.TeamJuraGameMaps=Object.freeze({entries:Object.freeze(entries),load});
})(window);
