/* Atlas 36.0: synthetic touch camera regression, no game imagery or heightfield. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
require('../atlas-3d.js');
const {solveGesture,terrainExtent}=globalThis.JuraTerrain3D;
function near(a,b){assert.ok(Math.abs(a-b)<0.00001, a+' !== '+b)}
const initial={bearing:0,pitch:.83,distance:1000,centerX:0,centerY:0};
const orbit=solveGesture([{x:100,y:100,shift:false}],[{x:150,y:120,shift:false}],initial,1000,400);
near(orbit.bearing,.35);near(orbit.pitch,.73);near(orbit.distance,1000);
near(orbit.centerX,0);near(orbit.centerY,0);
const mousePan=solveGesture([{x:100,y:100,shift:true}],[{x:130,y:80,shift:true}],initial,1000,400);
near(mousePan.centerX,-90);near(mousePan.centerY,-60);near(mousePan.bearing,0);
const rotated=solveGesture([{x:100,y:100,shift:true}],[{x:130,y:100,shift:true}],{...initial,bearing:Math.PI/2},1000,400);
near(rotated.centerX,0);near(rotated.centerY,90);
const padded=solveGesture([{x:100,y:100,shift:true}],[{x:130,y:80,shift:true}],initial,8000,400);
near(padded.centerX,mousePan.centerX);near(padded.centerY,mousePan.centerY);
const pinch=solveGesture([{x:100,y:100},{x:200,y:100}],
  [{x:120,y:80},{x:240,y:80}],initial,1000,400);
near(pinch.distance,1000*100/120);near(pinch.centerX,-90);near(pinch.centerY,-60);
near(pinch.pitch,.83);near(pinch.bearing,0);
const pinchedIn=solveGesture([{x:100,y:100},{x:200,y:100}],
  [{x:125,y:100},{x:175,y:100}],initial,1000,400);
near(pinchedIn.distance,2000);
const max=solveGesture([{x:100,y:100},{x:101,y:100}],
  [{x:100,y:100},{x:100.001,y:100}],initial,1000,400);
assert.ok(max.distance<=40000);
const min=solveGesture([{x:100,y:100},{x:200,y:100}],
  [{x:0,y:0},{x:4000,y:0}],initial,1000,400);
assert.equal(min.distance,360);
const clampPitch=solveGesture([{x:100,y:100}],[{x:100,y:-10000}],initial,1000,400);
assert.equal(clampPitch.pitch,1.43);
const empty=solveGesture([],[],initial,1000,400);
near(empty.distance,1000);
assert(terrainExtent(30000,1)>terrainExtent(1000,1),'zoom out grows terrain mesh');
assert(terrainExtent(30000,1)<=65536,'bounded world mesh');
assert(terrainExtent(2000,2)>=terrainExtent(2000,.5),'landscape extent handles wider view');
const source=fs.readFileSync(path.join(__dirname,'..','atlas-3d.js'),'utf8');
assert.match(source,/canvas\.style\.touchAction='none'/);
assert.match(source,/pointercancel/);
assert.match(source,/lostpointercapture/);
assert.match(source,/requestAnimationFrame/);
assert.match(source,/Math\.min\(70,Math\.round\(canvas\.clientWidth\/10\)\)/);
assert.match(source,/canvas\.clientWidth<600\?512:768/);
console.log('Atlas 36.0 iPhone gesture core, bounded camera, adaptive mesh/texture: PASS');
