const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const s=fs.readFileSync('atlas-navigation.js','utf8');
const start=s.indexOf('function setMapCenter(endpoint)'),end=s.indexOf('\nfunction open()',start);assert.ok(start>=0&&end>start);
const context={terrain:null,bridge:{camera:()=>({x:123.25,y:-456.5})},waypoints:[null,{name:'keep'},{name:'old'}],invalidate:()=>{context.invalidated++},open:()=>{context.opened++},status:m=>{context.message=m},invalidated:0,opened:0};
vm.createContext(context);vm.runInContext(s.slice(start,end)+';setMapCenter("start");',context);
assert.equal(context.waypoints[0].x,123.25);assert.equal(context.waypoints[1].name,'keep');assert.equal(context.waypoints[2].name,'old');
vm.runInContext('setMapCenter("end")',context);assert.equal(context.waypoints[2].y,-456.5);assert.equal(context.invalidated,2);assert.equal(context.opened,2);
context.terrain={isActive:()=>true,getView:()=>({center:{x:77,y:88}})};vm.runInContext('setMapCenter("start")',context);assert.equal(context.waypoints[0].x,77);assert.equal(context.invalidated,3);context.terrain=null;context.bridge.camera=()=>({x:NaN,y:0});vm.runInContext('setMapCenter("start")',context);assert.equal(context.invalidated,3);assert.match(context.message,/unavailable/);
for(const p of ['atlas.html','atlas-online.html','atlas-vi.html']){const h=fs.readFileSync(p,'utf8');assert.equal((h.match(/id="juraNavCenterStart"/g)||[]).length,1);assert.equal((h.match(/id="juraNavCenterEnd"/g)||[]).length,1);assert.match(h,(p==='atlas-vi.html' ? /atlas-navigation\.js\?v=382"/ : /atlas-navigation\.js\?v=47301"/))}
console.log('Map center waypoint regression passed');