/* Team Jura Atlas 9.6 — original, dependency-free marker clustering.
 * Screen-space buckets; clustering never changes source records or positions. */
(function(root){'use strict';
function group(records,project,options){
 const width=Number(options?.width)||0,height=Number(options?.height)||0;
 const cell=Math.max(16,Math.min(120,Number(options?.cell)||42));
 const active=options?.active!==false,buckets=new Map(),out=[];
 if(!Array.isArray(records)||typeof project!=='function')return out;
 for(const record of records){if(!record||!Number.isFinite(record.x)||!Number.isFinite(record.y))continue;
  const p=project(record);if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x < -25||p.y < -25||p.x > width+25||p.y > height+25)continue;
  if(!active){out.push({records:[record],pixel:{x:p.x,y:p.y},world:{x:record.x,y:record.y},count:1});continue;}
  const key=Math.floor(p.x/cell)+','+Math.floor(p.y/cell);
  let bucket=buckets.get(key);
  if(!bucket){bucket={records:[],pixel:{x:0,y:0},world:{x:0,y:0},count:0};buckets.set(key,bucket)}
  bucket.records.push(record);bucket.pixel.x+=p.x;bucket.pixel.y+=p.y;
  bucket.world.x+=record.x;bucket.world.y+=record.y;bucket.count++;
 }
 for(const bucket of buckets.values()){
  bucket.pixel.x/=bucket.count;bucket.pixel.y/=bucket.count;
  bucket.world.x/=bucket.count;bucket.world.y/=bucket.count;
  out.push(bucket);
 }
 return out;
}
const api=Object.freeze({group});root.TeamJuraClusters96=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
