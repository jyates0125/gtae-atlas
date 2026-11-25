// Build-time allowlist, not a substitute for model-specific visual and rights review.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {approvedReleaseRecords,validReleaseAsset} from './release-policy.mjs';
const demand=(ok,reason)=>{if(!ok)throw Error('Forge model boundary: '+reason)};
const files=JSON.parse(readFileSync(0,'utf8'));
demand(Array.isArray(files)&&files.every(p=>typeof p==='string'),'invalid build file list');
const present=new Set(files),approved=new Map(),identities=new Set();
function register(p,sha){
 demand(/^assets\/forge\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\.glb$/.test(p),'invalid model path');
 demand(!approved.has(p)||approved.get(p)===sha,'conflicting file hashes');
 approved.set(p,sha);
}
for(const r of approvedReleaseRecords){
 demand(validReleaseAsset(r),'incomplete review record');
 const key=JSON.stringify([r.world,r.model,r.division]);
 demand(!identities.has(key),'duplicate identity');identities.add(key);
 register(r.assetPath,r.sha256);
 for(const m of r.optionMappings)if(m.method==='whole-model')register(m.variantPath,m.variantSha256);
}
for(const p of present)demand(approved.has(p),'unapproved asset '+p);
for(const [p,sha] of approved){
 demand(present.has(p),'missing approved asset '+p);
 const bytes=readFileSync(resolve(p));
 demand(bytes.length>=28&&bytes.length<=25_000_000,'invalid model size '+p);
 demand(createHash('sha256').update(bytes).digest('hex')===sha,'digest mismatch '+p);
 demand(bytes.toString('ascii',0,4)==='glTF'&&bytes.readUInt32LE(4)===2&&bytes.readUInt32LE(8)===bytes.length,'invalid GLB header');
 let offset=12;const chunks=[];
 while(offset<bytes.length){
  demand(offset+8<=bytes.length,'truncated chunk header');
  const n=bytes.readUInt32LE(offset),type=bytes.readUInt32LE(offset+4);offset+=8;
  demand(n>0&&n%4===0&&offset+n<=bytes.length,'invalid GLB chunk');
  chunks.push({n,type,offset});offset+=n;
 }
 demand(chunks.length===2&&chunks[0].type===0x4e4f534a&&chunks[1].type===0x004e4942,'self-contained binary required');
 const c=chunks[0],doc=JSON.parse(bytes.toString('utf8',c.offset,c.offset+c.n));
 demand(doc.asset?.version==='2.0'&&Array.isArray(doc.meshes)&&doc.meshes.length>0,'missing geometry');
 demand(doc.extras?.releaseEligible!==false&&doc.asset?.extras?.releaseEligible!==false,'research-only asset');
 for(const n of doc.nodes||[])demand(n.extras?.releaseEligible!==false,'research-only node');
 demand(Array.isArray(doc.buffers)&&doc.buffers.length>0&&doc.buffers.every(b=>!Object.hasOwn(b,'uri')),'external buffer');
 demand((doc.images||[]).every(i=>!Object.hasOwn(i,'uri')&&Number.isInteger(i.bufferView)),'external image');
 const n=doc.buffers[0].byteLength;
 demand(Number.isInteger(n)&&n>0&&n<=chunks[1].n&&chunks[1].n-n<=3,'invalid buffer length');
}
console.log('Forge model boundary: '+identities.size+' approved identities / '+approved.size+' verified files');
