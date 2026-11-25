// Final Forge public asset contract. No generic or procedural substitute can pass.
// This registry contains only reviewed game identities, never laboratory stand-ins.
export const divisions=Object.freeze(['road','motorcycle','marine','aviation','utility','specialty','armory']);
const accepted=Object.freeze(Object.create(null));
const scopes=Object.freeze(['v-story','v-online','vi']);
const digest=/^[a-f0-9]{64}$/;
// Accepted assets may be a single complete mesh. Do not require detachable parts.
export const visualMethods=Object.freeze(['fixed','material','mesh-toggle','assembly','whole-model','nonvisual']);
const safeName=v=>typeof v==='string'&&v.trim().length>0&&v.length<=180;
const localAsset=v=>typeof v==='string'&&/^assets\/forge\/[a-z0-9/_-]+\.glb$/.test(v)&&!v.includes('..');
function names(v){return Array.isArray(v)&&v.length>0&&v.every(safeName)&&new Set(v).size===v.length}
export function validOptionMapping(mapping,asset){
 if(!mapping||!safeName(mapping.optionId)||!safeName(mapping.category)||!safeName(mapping.evidence)||!visualMethods.includes(mapping.method))return false;
 if(mapping.reviewed!==true)return false;
 switch(mapping.method){
 case 'fixed':case 'nonvisual':
  return !mapping.materialNames&&!mapping.nodeNames&&!mapping.variantPath;
 case 'material':return names(mapping.materialNames)&&!mapping.nodeNames&&!mapping.variantPath;
 case 'mesh-toggle':return names(mapping.nodeNames)&&!mapping.materialNames&&!mapping.variantPath;
 case 'assembly':return names(mapping.nodeNames)&&(!mapping.materialNames||names(mapping.materialNames))&&!mapping.variantPath;
 case 'whole-model':return localAsset(mapping.variantPath)&&mapping.variantPath!==asset.assetPath&&digest.test(mapping.variantSha256||'')&&mapping.variantIdentityVerified===true&&mapping.variantRightsReviewed===true&&mapping.variantVisualAccepted===true&&mapping.variantMobilePassed===true&&mapping.variantDesktopPassed===true;
 default:return false;
 }
}
export function validCustomizationCoverage(record){
 if(!record||!['collection-only','fixed-model','documented-options'].includes(record.customizationMode)||!Array.isArray(record.optionMappings))return false;
 if(!record.optionMappings.every(m=>validOptionMapping(m,record)))return false;
 const ids=record.optionMappings.map(m=>JSON.stringify([m.category,m.optionId]));
 if(new Set(ids).size!==ids.length)return false;
 if(record.customizationMode==='collection-only')return ids.length===0;
 if(record.customizationMode==='fixed-model')return record.optionMappings.every(m=>['fixed','nonvisual','material'].includes(m.method));
 return true;
}
// A declaration is not proof: exact reviewed GLB metadata must bind to the pinned bytes.
function auditedNames(actual, requested) {
 return Array.isArray(actual)&&requested.every(name=>actual.filter(n=>n===name).length===1);
}
export function validAssetAudit(record,audit,variantAudits={}){
 if(!record||!audit||audit.sha256!==record.sha256||audit.selfContained!==true||
    !Array.isArray(audit.activeNodeNames)||!Array.isArray(audit.usedMaterialNames)||
    !Number.isInteger(audit.activeMeshCount)||audit.activeMeshCount<1||
    !validCustomizationCoverage(record))return false;
 for(const mapping of record.optionMappings){
  if(mapping.nodeNames&&!auditedNames(audit.activeNodeNames,mapping.nodeNames))return false;
  if(mapping.materialNames&&!auditedNames(audit.usedMaterialNames,mapping.materialNames))return false;
  if(mapping.method==='whole-model'){
   const variant=variantAudits&&typeof variantAudits==='object'&&Object.prototype.hasOwnProperty.call(variantAudits,mapping.variantPath)?variantAudits[mapping.variantPath]:null;
   if(!variant||variant.sha256!==mapping.variantSha256||variant.selfContained!==true||
      !Number.isInteger(variant.activeMeshCount)||variant.activeMeshCount<1)return false;
  }
 }
 return true;
}
export function validReleaseAsset(record){
 if(!record||!scopes.includes(record.world)||!divisions.includes(record.division))return false;
 if(typeof record.model!=='string'||!record.model||record.kind!=='model-specific-glb'||record.identity!=='verified')return false;
 if(typeof record.assetPath!=='string'||!/^assets\/forge\/[a-z0-9/_-]+\.glb$/.test(record.assetPath)||record.assetPath.includes('..'))return false;
 if(!digest.test(record.sha256||'')||!record.sourceRevision||!record.license||!record.attribution)return false;
 if(!validAssetAudit(record,record.assetAudit,record.variantAudits))return false;
 return ['rightsReviewed','visualAccepted','mobilePassed','desktopPassed','controlsPassed','materialAuditPassed'].every(key=>record[key]===true);
}
export function selectFinalVisual(world,model,division){
 const key=JSON.stringify([world,model,division]);
 const asset=accepted[key];
 if(validReleaseAsset(asset)&&asset.world===world&&asset.model===model&&asset.division===division)return Object.freeze({mode:'interactive',asset});
 return Object.freeze({mode:'reference',asset:null,planning:true,reason:'Matching accepted detailed asset is not available.'});
}
