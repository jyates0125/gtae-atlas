/* Atlas 23.8 — attributed San Andreas gang-tag numeric positions. */
(()=>{'use strict';
let promise;
function load(){return promise||(promise=(async()=>{
 const response=await fetch('./data/atlas-sa-100-tag-placements.json',{cache:'no-cache'});if(!response.ok)throw Error('Tag source unavailable');
 const d=await response.json(),seen=new Set();
 if(d.schema!==1||d.game!=='san-andreas'||d.basis!=='image-pixels'||d.width!==6000||d.height!==6000||d.sourceUrl!=='https://dev.prineside.com/en/'||d.records?.length!==100)throw Error('Tag source mismatch');
 for(const p of d.records){
  if(p.set!=='tags'||!Number.isInteger(p.slot)||p.slot<1||p.slot>100||seen.has(p.slot)||![p.x,p.y,p.worldX,p.worldY,p.worldZ].every(Number.isFinite)||p.x<0||p.y<0||p.x>6000||p.y>6000||Math.abs(p.x-(p.worldX+3000))>.001||Math.abs(p.y-(3000-p.worldY))>.001||!p.sourceUrl?.startsWith('https://dev.prineside.com/en/gtasa_samp_model_id/model/'))throw Error('Invalid tag placement');
  seen.add(p.slot);
 }
 return d.records;
})());}
window.TeamJuraSATags=Object.freeze({load});
})();
