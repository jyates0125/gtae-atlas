/* Atlas 23.9: source-backed jump zone centers, not ramp coordinates. */
(()=>{'use strict';
let promise;
const zone=z=>Array.isArray(z)&&z.length===6&&z.every(n=>Number.isFinite(n)&&Math.abs(n)<=3000)&&z.slice(0,3).every((n,i)=>n<=z[i+3]);
const center=z=>z.slice(0,3).map((n,i)=>(n+z[i+3])/2);
function load(){return promise||(promise=(async()=>{
 const response=await fetch('./data/atlas-sa-70-jump-zones.json',{cache:'no-cache'});if(!response.ok)throw Error('Jump source unavailable');
 const d=await response.json(),seen=new Set();
 if(d.schema!==1||d.game!=='san-andreas'||d.basis!=='image-pixels'||d.width!==6000||d.height!==6000||d.sourceRevision!=='6611e3cf21422bdd530a38743c1d15178d5d5df2'||d.records?.length!==70||d.sourceValidation?.checksum!==14857859)throw Error('Jump source mismatch');
 for(const p of d.records){
  if(p.set!=='jumps'||!Number.isInteger(p.slot)||p.slot<1||p.slot>70||seen.has(p.slot)||![p.x,p.y,p.worldX,p.worldY,p.worldZ].every(Number.isFinite)||p.x<0||p.x>6000||p.y<0||p.y>6000||!zone(p.startZone)||!zone(p.landingZone)||!Array.isArray(p.landingCenter)||p.landingCenter.length!==3||!p.landingCenter.every(Number.isFinite)||p.sourceUrl!==d.sourceUrl)throw Error('Invalid jump record');
  if(Math.abs(p.x-p.worldX-3000)>.001||Math.abs(p.y+p.worldY-3000)>.001||center(p.startZone).some((n,i)=>Math.abs(n-[p.worldX,p.worldY,p.worldZ][i])>.001)||center(p.landingZone).some((n,i)=>Math.abs(n-p.landingCenter[i])>.001))throw Error('Jump center mismatch');
  seen.add(p.slot);
 }
 return d.records;
})());}
window.TeamJuraSAJumps=Object.freeze({load});
})();
