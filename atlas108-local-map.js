/* Elario Studios / Team Jura Atlas 10.8
   Local high-resolution classic map artwork. The player's image never uploads to Atlas.
   IndexedDB stores a browser-local Blob separately from versioned marker JSON. */
(()=>{'use strict';
 const DB='team-jura-classic-local-maps-v1',STORE='raster',MAX_BYTES=18*1024*1024,MAX_PIXELS=100000000;
 const TYPES=new Set(['image/png','image/jpeg','image/webp']);
 function database(){
  return new Promise((resolve,reject)=>{
   if(!('indexedDB' in window)){reject(new Error('IndexedDB is unavailable'));return}
   const req=indexedDB.open(DB,1);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'world'})};
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||new Error('Could not open local image storage'));
   req.onblocked=()=>reject(new Error('Image database is blocked by another tab'));
  });
 }
 async function transaction(mode,method,arg){
  const db=await database();
  return new Promise((resolve,reject)=>{
   let done=false,result;
   const finish=(err,value)=>{if(done)return;done=true;db.close();if(err)reject(err);else resolve(value)};
   try{
    const tx=db.transaction(STORE,mode);
    const req=tx.objectStore(STORE)[method](arg);
    req.onsuccess=()=>{result=req.result};
    req.onerror=()=>finish(req.error||new Error('Map image storage failed'));
    tx.oncomplete=()=>finish(null,result);
    tx.onerror=()=>finish(tx.error||new Error('Map image transaction failed'));
    tx.onabort=()=>finish(tx.error||new Error('Map image transaction was aborted'));
   }catch(error){finish(error)}
  });
 }
 function inspect(file){
  if(!(file instanceof Blob)||!TYPES.has(file.type))return Promise.reject(new Error('Choose a PNG, JPEG or WebP map image'));
  if(file.size===0||file.size>MAX_BYTES)return Promise.reject(new Error('Map image must be under 18 MB'));
  return new Promise((resolve,reject)=>{
   const url=URL.createObjectURL(file),img=new Image();
   const release=()=>URL.revokeObjectURL(url);
   img.onload=()=>{
    const width=img.naturalWidth,height=img.naturalHeight;release();
    if(!width||!height||width>20000||height>20000||width*height>MAX_PIXELS)reject(new Error('Map is too large to display safely; resize it first'));
    else resolve({width,height});
   };
   img.onerror=()=>{release();reject(new Error('Image could not be decoded'))};
   img.src=url;
  });
 }
 async function save(world,file,dimensions){
  if(!/^(iii|vc|vcs|lcs|ctw|tlad|tbogt)$/.test(world))throw new Error('Unknown GTA world');
  const dims=dimensions||await inspect(file);
  await transaction('readwrite','put',{world,blob:file,width:dims.width,height:dims.height,savedAt:new Date().toISOString()});
  return dims;
 }
 async function restore(world){
  const record=await transaction('readonly','get',world);
  if(!record||!record.blob||!TYPES.has(record.blob.type)||record.blob.size>MAX_BYTES||record.blob.size===0)return null;
  const width=Number(record.width),height=Number(record.height);
  if(width>0&&height>0&&width<=20000&&height<=20000&&width*height<=MAX_PIXELS)return{blob:record.blob,width,height};
  const dims=await inspect(record.blob);
  return{blob:record.blob,...dims};
 }
 async function remove(world){await transaction('readwrite','delete',world)}
 window.TeamJuraLocalMap=Object.freeze({inspect,save,restore,remove});
})();