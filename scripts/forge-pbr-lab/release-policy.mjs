// Final Forge public asset contract. No generic or procedural substitute can pass.
// This registry contains only reviewed game identities, never laboratory stand-ins.
export const divisions=Object.freeze(['road','motorcycle','marine','aviation','utility','specialty','armory']);
const accepted=Object.freeze(Object.create(null));
const scopes=Object.freeze(['v-story','v-online','vi']);
const digest=/^[a-f0-9]{64}$/;
export function validReleaseAsset(record){
 if(!record||!scopes.includes(record.world)||!divisions.includes(record.division))return false;
 if(typeof record.model!=='string'||!record.model||record.kind!=='model-specific-glb'||record.identity!=='verified')return false;
 if(typeof record.assetPath!=='string'||!/^assets\/forge\/[a-z0-9/_-]+\.glb$/.test(record.assetPath)||record.assetPath.includes('..'))return false;
 if(!digest.test(record.sha256||'')||!record.sourceRevision||!record.license||!record.attribution)return false;
 return ['rightsReviewed','visualAccepted','mobilePassed','desktopPassed','controlsPassed','materialAuditPassed'].every(key=>record[key]===true);
}
export function selectFinalVisual(world,model,division){
 const key=JSON.stringify([world,model,division]);
 const asset=accepted[key];
 if(validReleaseAsset(asset)&&asset.world===world&&asset.model===model&&asset.division===division)return Object.freeze({mode:'interactive',asset});
 return Object.freeze({mode:'reference',asset:null,planning:true,reason:'Matching accepted detailed asset is not available.'});
}
