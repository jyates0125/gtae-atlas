/* Synthetic-only regression tests; no actual GTA map data is generated or imported. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {webcrypto}=require('node:crypto');
require('../atlas-3d.js');
const validate=require('../atlas-terrain-evidence.js');
async function run(){
 const game='6',def=globalThis.JuraTerrain3D.ELEVATIONS[game];
 const samples=new Uint16Array(def.width*def.height);
 for(let y=0;y<def.height;y++)for(let x=0;x<def.width;x++)
  samples[y*def.width+x]=28000+Math.floor(y/9)+Math.floor(x/10);
 const bytes=samples.buffer,view=new DataView(bytes);
 const hash=Buffer.from(await webcrypto.subtle.digest('SHA-256',bytes)).toString('hex');
 const coordinates=[[-5000,-4000],[3000,3500],[3400,-3200],[-3200,2700]];
 const controlPoints=coordinates.map(([x,y],i)=>({
  x,y,zMeters:validate.heightAt(view,def,{x,y}),toleranceMeters:0.01,
  label:'Synthetic-'+i,basis:'independent',evidenceUrl:'https://example.org/fixture'+i
 }));
 const proof={schema:'team-jura-terrain-proof-v1',game:6,encoding:'uint16-le',
  coordinateSystem:'gtadb-game-xy',grid:{width:def.width,height:def.height},sha256:hash,
  source:{url:'https://example.org/synthetic',license:'Test fixture only',
   revision:'fixture-rev-123',redistributionPermission:true,rightsEvidenceUrl:'https://example.org/fixture-rights'},
  controlPoints};
 assert.equal((await validate.verify(bytes,proof,def,game,webcrypto)).pointsChecked,4);
 async function rejects(change,expected){let p=structuredClone(proof);change(p);
  await assert.rejects(validate.verify(bytes,p,def,game,webcrypto),expected)}
 await rejects(p=>p.sha256='0'.repeat(64),/digest/);
 await rejects(p=>p.source.redistributionPermission=false,/rights/);
 await rejects(p=>p.controlPoints[0].zMeters+=1,/alignment mismatch/);
 await rejects(p=>p.controlPoints[1].basis='guessed',/independent/);
 await rejects(p=>p.controlPoints[2].evidenceUrl='javascript:alert(1)',/HTTPS/);
 await rejects(p=>p.grid.width=1,/dimensions/);
 await rejects(p=>p.game=5,/game/);
 await rejects(p=>p.controlPoints=p.controlPoints.slice(0,2),/three independent/);
 await rejects(p=>p.controlPoints=p.controlPoints.map((v,i)=>({...v,x:-5000+i*1000,y:-4000+i*1000,zMeters:0})),/collinear/);
 await assert.rejects(validate.verify(new ArrayBuffer(2),proof,def,game,webcrypto),/size/);
 const root=path.resolve(__dirname,'..');
 const html=fs.readFileSync(path.join(root,'atlas-vi.html'),'utf8');
 const nav=fs.readFileSync(path.join(root,'atlas-navigation.js'),'utf8');
 assert.match(html,/id="juraElevationFile"/);
 assert.match(html,/id="juraElevationProofFile"/);
 assert.match(html,/atlas-terrain-evidence\.js\?v=359/);
 assert.match(nav,/JuraTerrainEvidence\.verify/);
 for(const p of ['atlas.html','atlas-online.html'])
  assert.doesNotMatch(fs.readFileSync(path.join(root,p),'utf8'),/id="juraElevationFile"/);
 console.log('Atlas 35.9 synthetic terrain integrity, alignment and VI import exposure: PASS');
}
run().catch(e=>{console.error(e);process.exitCode=1});
