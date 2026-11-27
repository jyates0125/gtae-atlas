#!/usr/bin/env node
/* Atlas 36.6: deterministic local terrain readiness. Synthetic bytes only.
 * No live GTADB requests and no test elevation is shipped or committed. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
require('../atlas-3d.js');
const definition=globalThis.JuraTerrain3D.ELEVATIONS['6'];
const cameraMatrix=globalThis.JuraTerrain3D.cameraMatrix;
function cameraRegression(){
 let n=0;
 for(const bearing of [0,Math.PI/4,Math.PI,Math.PI*1.5,Math.PI*2,NaN])
 for(const pitch of [.24,.83,1.05,1.43,NaN])
 for(const distance of [360,3200,19500,40000,NaN])
 for(const [w,h] of [[390,650],[1440,900],[844,390],[1,1],[0,0]]){
  const m=cameraMatrix(bearing,pitch,distance,w,h);
  assert.equal(m.length,16);assert(Array.from(m).every(Number.isFinite),'finite camera matrix');
  assert(m[15]>0,'target is in front of camera');
  assert(Math.abs(m[12]/m[15])<1e-5&&Math.abs(m[13]/m[15])<1e-5,'target projects to screen center');
  const z=m[14]/m[15];assert(z>=-1&&z<=1,'target inside near/far clip range');
  n++;
 }
 console.log('Atlas camera regression: '+n+' finite centered transformations PASS');
}
cameraRegression();
const size=definition.width*definition.height*2;
function samples(){
 const grid=new Uint16Array(definition.width*definition.height);
 grid.fill(28000);grid[0]=28111;grid[grid.length-1]=28333;
 return grid.buffer;
}
function engine(game='6'){
 return globalThis.JuraTerrain3D.create({
  canvas:{addEventListener(){},clientWidth:400,hidden:true,style:{}},
  status:{textContent:''},
  bridge:{game:()=>game}
 });
}
function validResponse(buffer){
 return{ok:true,status:200,headers:{get:k=>k.toLowerCase()==='content-length'?String(buffer.byteLength):null},arrayBuffer:async()=>buffer};
}
async function test(){
 assert.equal(samples().byteLength,size);
 const originalFetch=globalThis.fetch;
 try{
  const loaded=engine();let count=0;
  assert.equal(loaded.hasElevation(),false);
  globalThis.fetch=async(url,opts)=>{
   ++count;
   assert.equal(url,'./elevation-6.bin');
   assert.equal(opts.credentials,'same-origin');
   assert.equal(opts.cache,'force-cache');
   return validResponse(samples());
  };
  assert.equal(count,0,'no background terrain download');
  assert.equal(await loaded.prepareElevation('6'),true);
  assert.equal(loaded.hasElevation(),true);
  assert.equal(await loaded.prepareElevation('6'),true);
  assert.equal(count,1,'an installed heightfield must be reused, not re-downloaded');

  const missing=engine();
  globalThis.fetch=async()=>({ok:false,status:404});
  assert.equal(await missing.prepareElevation('6'),false);
  assert.match(missing.getError(),/No bundled/);
  assert.equal(missing.hasElevation(),false);

  const wrong=engine();
  let wrongFetch=0;
  globalThis.fetch=async()=>{wrongFetch++;return validResponse(samples())};
  assert.equal(await wrong.prepareElevation('5'),false);
  assert.equal(wrongFetch,0,'wrong-game file must never be requested');

  const tooSmall=engine();
  globalThis.fetch=async()=>validResponse(new ArrayBuffer(2));
  assert.equal(await tooSmall.prepareElevation('6'),false);
  assert.match(tooSmall.getError(),/size mismatch/);

  const uniform=engine();
  const flat=new Uint16Array(definition.width*definition.height);flat.fill(28000);
  globalThis.fetch=async()=>validResponse(flat.buffer);
  assert.equal(await uniform.prepareElevation('6'),false);
  assert.match(uniform.getError(),/identical/);

  // A file import while the same-origin request is pending must win.
  const racing=engine();let resolveRequest;
  globalThis.fetch=()=>new Promise(resolve=>{resolveRequest=resolve});
  const pending=racing.prepareElevation('6');
  assert.equal(typeof resolveRequest,'function');
  assert.equal(await racing.setElevationBinary(samples(),'6'),true);
  resolveRequest(validResponse(flat.buffer));
  assert.equal(await pending,false,'superseded response cannot overwrite an import');
  assert.equal(racing.hasElevation(),true);
  assert.equal(await racing.prepareElevation('6'),true);

  // The page must wait for this asynchronous preparation before true 3D.
  const nav=fs.readFileSync(path.join(__dirname,'../atlas-navigation.js'),'utf8');
  const map=fs.readFileSync(path.join(__dirname,'../atlas-vi.html'),'utf8');
  const renderer=fs.readFileSync(path.join(__dirname,'../atlas-3d.js'),'utf8');
  assert.match(nav,/prepareElevation\(target\)/);
  assert.match(nav,/epoch!==terrainViewToken/);
  assert.match(nav,/dimension='3d'/);
  assert.match(renderer,/function activate\(\)\{if\(!hasElevation\(\)&&!hasApproximate\(\)\)/);
  assert.match(map,/id="j362TerrainStatus"/);
  assert.match(map,/atlas-3d\.js\?v=4744"/);
  assert.match(map,/atlas-navigation\.js\?v=47301"/);
  console.log('Atlas 36.6: absent, valid, flat, mismatched, stale, cached and import-race heightfield cases PASS');
 }finally{
  globalThis.fetch=originalFetch;
 }
}
test().catch(e=>{console.error(e);process.exitCode=1});
