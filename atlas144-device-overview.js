/* Atlas 14.4 — read-only local progress inventory for the Account page.
 * No network, login, token access, account creation, upload or local writes.
 * Uses the exact same cloud-transfer allowlist as the future consent gate.
 */
(()=>{'use strict';
function init(){
 const review=document.getElementById('j144Review'),summary=document.getElementById('j144Summary'),list=document.getElementById('j144Entries');
 if(!review||!summary||!list)return;
 const shared=window.AtlasCloudTransfer;
 if(!shared?.progressKeys){review.disabled=true;summary.textContent='Progress inventory is unavailable on this page.';return}
 const LABELS=Object.freeze({
  story_progress:'GTA V Story discoveries',
  passport:'Atlas Passport',
  collection_hq:'Collectibles headquarters',
  collectible_checklist:'Collection checklist',
  owned_vehicles:'Owned vehicle catalog',
  parking_ledger:'Garage parking ledger',
  garage_details:'Garage assignments and notes',
  map_routes:'Saved Atlas map routes',
  map_favorites:'Favorite map locations'
 });
 review.addEventListener('click',()=>{
  list.replaceChildren();let found=0,bytes=0;
  for(const [namespace,key] of Object.entries(shared.progressKeys)){
   let value;
   try{value=localStorage.getItem(key)}
   catch{summary.textContent='Browser storage could not be read. Nothing was changed.';list.replaceChildren();return}
   const present=value!==null&&value!=='';
   if(present){found++;bytes+=new TextEncoder().encode(value).length}
   const row=document.createElement('li');row.className=present?'j144-present':'j144-missing';
   const title=document.createElement('strong');title.textContent=LABELS[namespace]||namespace;
   const state=document.createElement('span');state.textContent=present?'Saved on this device':'No local record';
   row.append(title,state);list.append(row);
  }
  summary.textContent=found+' of '+Object.keys(shared.progressKeys).length+' reviewed progress categories have local records ('+Math.round(bytes/1024)+' KB). No data was uploaded or changed.';
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();