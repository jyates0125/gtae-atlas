/* Team Jura Atlas: non-destructive garage backup merge. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.JuraGarageMerge=api})(typeof globalThis==='undefined'?null:globalThis,function(){
 'use strict';
 const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const str=(x,n)=>typeof x==='string'?x.trim().slice(0,n):'';
 const safeId=x=>typeof x==='string'&&/^[a-z0-9_]{1,65}$/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
 const paintNames=['Midnight','Pearl White','Metallic Orange','Sunburst Yellow','Racing Red','Electric Blue','Emerald','Neon Purple','Hot Pink','Graphite'];
 const design=x=>{if(!plain(x))return{};return{finish:['metallic','satin','stealth'].includes(x.finish)?x.finish:'metallic',accent:typeof x.accent==='string'&&/^#[a-f0-9]{6}$/i.test(x.accent)?x.accent.toLowerCase():'#eab56a',stance:['street','low','raised'].includes(x.stance)?x.stance:'street',kit:['clean','sport','track'].includes(x.kit)?x.kit:'sport',lights:typeof x.lights==='boolean'?x.lights:true,environment:['auto','signature','marina','hangar','workshop'].includes(x.environment)?x.environment:'auto'}};
 const color=x=>typeof x==='string'&&(/^#[0-9a-f]{6}$/i.test(x)||paintNames.includes(x))?x:'Graphite';
 function merge(payload,meta,gallery,allowed){
  if(!plain(payload)||payload.schema!==1||payload.app!=='team-jura-atlas93-garage'||!plain(payload.garage)||!Array.isArray(payload.garage.garages)||!plain(payload.garage.vehicles)||!(allowed instanceof Set))throw Error('Invalid Garage backup');
  const vehicles={...meta.vehicles},garages=[...new Set(meta.garages)],nextGallery={...gallery,owned:{...gallery.owned},wishlist:{...gallery.wishlist}};
  let added=0,kept=0,skipped=0,addedGarages=0,marks=0;
  for(const item of payload.garage.garages){const name=str(item,56);if(name&&!garages.includes(name)&&garages.length<40){garages.push(name);addedGarages++}}
  for(const [id,v] of Object.entries(payload.garage.vehicles)){
   if(!safeId(id)||!allowed.has(id)||!plain(v)){skipped++;continue}
   if(Object.hasOwn(vehicles,id)){kept++;continue}
   const place=str(v.garage,56);
   if(place&&!garages.includes(place)){if(garages.length>=40){skipped++;continue}garages.push(place);addedGarages++}
   vehicles[id]={garage:place,paint:color(v.paint),secondary:color(v.secondary),note:str(v.note,1200),plate:str(v.plate,20),favorite:v.favorite===true,studioDesign:design(v.studioDesign),
    ...(['auto','sports','truck','standard'].includes(v.studioBody)?{studioBody:v.studioBody}:{}),...(typeof v.studioName==='string'?{studioName:str(v.studioName,72)}:{})};
   added++;
  }
  for(const list of ['owned','wishlist']){const incoming=payload.collection?.[list];if(!plain(incoming))continue;
   for(const [key,marked] of Object.entries(incoming)){const id=key.slice('vehicles5:'.length);if(marked===true&&key.startsWith('vehicles5:')&&safeId(id)&&allowed.has(id)&&nextGallery[list][key]!==true){nextGallery[list][key]=true;marks++}}
  }
  return{meta:{...meta,schema:1,garages,vehicles},gallery:nextGallery,added,kept,skipped,addedGarages,marks};
 }
 return Object.freeze({merge});
});
