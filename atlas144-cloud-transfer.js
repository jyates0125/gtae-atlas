/* Atlas 14.4 — consent-first, guest-preserving cloud transfer foundation.
 * STAGING ONLY: No page imports this yet. Public login remains disabled.
 * Uses an authenticated AtlasCloudSaves repository. Browser keys are an explicit
 * allowlist; unknown keys, passwords and tokens cannot be transferred.
 * Does not automatically upload, download, log in, store tokens or merge local saves.
 */
(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else if(root)root.AtlasCloudTransfer=factory();
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const MAPPING=Object.freeze({
  story_progress:'jura3-progress',
  passport:'team-jura-passport-v74',
  collection_hq:'team-jura-atlas81-hq-v1',
  collectible_checklist:'team-jura-checklist-v54',
  owned_vehicles:'team-jura-atlas90-collection-v1',
  parking_ledger:'team-jura-atlas96-parking-v1',
  garage_details:'team-jura-atlas93-garage-v1',
  map_routes:'jura-atlas-routes',
  map_favorites:'jura-atlas-favorites'
 });
 const FORMAT='team-jura-local-progress-v1',MAX_BYTES=110000;
 class TransferError extends Error{
  constructor(message,code){super(message);this.name='TransferError';this.code=code}
 }
 function keyFor(namespace){
  if(typeof namespace!=='string'||!Object.prototype.hasOwnProperty.call(MAPPING,namespace))
   throw new TransferError('This progress category is not available for cloud transfer.','UNSUPPORTED_NAMESPACE');
  return MAPPING[namespace];
 }
 function bytes(s){return new TextEncoder().encode(s).byteLength}
 function parseLocal(value){
  if(typeof value!=='string'||!value.length)throw new TransferError('No valid local progress available.','NO_LOCAL_PROGRESS');
  try{JSON.parse(value)}catch{throw new TransferError('This saved record is not valid JSON. Export a manual backup before repairing it.','INVALID_LOCAL_PROGRESS')}
  return value;
 }
 function payload(namespace,value){
  const data={format:FORMAT,localKey:keyFor(namespace),value:parseLocal(value)};
  if(bytes(JSON.stringify(data))>MAX_BYTES)throw new TransferError('This record exceeds the safe cloud size limit. Export it manually instead.','TOO_LARGE');
  return data;
 }
 function verifyRemote(namespace,cloud){
  if(!cloud)return null;
  const data=cloud.payload;
  if(!data||typeof data!=='object'||Array.isArray(data)||data.format!==FORMAT||
     data.localKey!==keyFor(namespace)||typeof data.value!=='string'){
   throw new TransferError('The cloud record has an unfamiliar format. No local data was changed.','REMOTE_FORMAT');
  }
  // Check syntax and size before ever copying remote data into the browser.
  payload(namespace,data.value);
  if(!Number.isSafeInteger(cloud.revision)||cloud.revision<1)
   throw new TransferError('Cloud record revision is invalid.','REMOTE_FORMAT');
  return cloud;
 }
 function requireConsent(options){
  if(options?.consent!==true)throw new TransferError('Explicit confirmation is required before transferring progress.','CONSENT_REQUIRED');
 }
 function createTransfer({repository,storage}={}){
  if(!repository||typeof repository.read!=='function'||typeof repository.create!=='function'||typeof repository.update!=='function')
   throw new TransferError('Authenticated cloud save repository required.','CONFIG_REQUIRED');
  if(!storage){if(typeof window==='undefined'||!window.localStorage)throw new TransferError('Local progress storage required.','CONFIG_REQUIRED');storage=window.localStorage}
  if(typeof storage.getItem!=='function'||typeof storage.setItem!=='function')throw new TransferError('Unsupported progress storage.','CONFIG_REQUIRED');
  function local(name){
   const key=keyFor(name);
   try{return storage.getItem(key)}
   catch{throw new TransferError('Cannot read browser storage. Your progress was not changed.','STORAGE_ERROR')}
  }
  async function remote(name){keyFor(name);return verifyRemote(name,await repository.read(name))}
  async function inspect(name){
   keyFor(name);const raw=local(name),cloud=await remote(name);
   return Object.freeze({namespace:name,localExists:raw!==null,cloudExists:!!cloud,
    cloudRevision:cloud?.revision??null,same:!!cloud&&raw===cloud.payload.value,
    needsDecision:!!cloud&&raw!==null&&raw!==cloud.payload.value});
  }
  async function upload(name,options={}){
   requireConsent(options);const raw=local(name),data=payload(name,raw),cloud=await remote(name);
   if(options.mode==='create'){
    if(cloud)throw new TransferError('Cloud progress already exists. Review both versions before replacing it.','CONFLICT');
    return Object.freeze({status:'created',record:await repository.create(name,data)});
   }
   if(options.mode==='replace'){
    if(!cloud)throw new TransferError('No existing cloud version to replace.','CONFLICT');
    if(!Number.isSafeInteger(options.expectedRevision)||options.expectedRevision!==cloud.revision)
     throw new TransferError('The cloud version has changed. Review again before overwriting.','CONFLICT');
    if(cloud.payload.value===raw)return Object.freeze({status:'unchanged',record:cloud});
    return Object.freeze({status:'updated',record:await repository.update(name,data,options.expectedRevision)});
   }
   throw new TransferError('Choose create or explicitly replace a reviewed revision.','MODE_REQUIRED');
  }
  async function download(name,options={}){
   requireConsent(options);
   const cloud=await remote(name);
   if(!cloud)throw new TransferError('No cloud progress exists for this category.','NO_CLOUD_PROGRESS');
   const old=local(name);
   if(old===cloud.payload.value)return Object.freeze({status:'unchanged',revision:cloud.revision});
   if(old!==null&&options.overwriteLocal!==true)
    throw new TransferError('Local progress already exists. Review it and choose whether to overwrite it.','LOCAL_CONFLICT');
   // Validate entirely before first write. One atomic localStorage key; preserve the
   // previous value on browsers where quota/storage errors can occur.
   const key=keyFor(name);
   try{storage.setItem(key,cloud.payload.value)}
   catch{
    try{if(old===null)storage.removeItem?.(key);else storage.setItem(key,old)}catch{}
    throw new TransferError('Browser storage failed. Original progress was retained where possible.','STORAGE_ERROR');
   }
   return Object.freeze({status:old===null?'restored':'replaced',revision:cloud.revision});
  }
  return Object.freeze({namespaces:()=>Object.freeze(Object.keys(MAPPING)),inspect,upload,download});
 }
 return Object.freeze({createTransfer,TransferError,progressKeys:MAPPING});
});
