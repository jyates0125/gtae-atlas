/* Team Jura: affine projection from three control points plus an independent check. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.JuraMapCalibration=api})(typeof globalThis==='undefined'?null:globalThis,function(){
 'use strict';
 const valid=p=>p&&[p.x,p.y,p.u,p.v].every(Number.isFinite)&&p.u>=0&&p.u<=100&&p.v>=0&&p.v<=100;
 function fit(anchors){
  if(!Array.isArray(anchors)||anchors.length!==4||!anchors.every(valid))throw Error('Four finite control points required');
  const [a,b,c,d]=anchors;
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)if(Math.hypot(anchors[i].x-anchors[j].x,anchors[i].y-anchors[j].y)<100)throw Error('Choose widely separated control points');
  const bx=b.x-a.x,by=b.y-a.y,cx=c.x-a.x,cy=c.y-a.y,det=bx*cy-by*cx;
  if(Math.abs(det)<20000)throw Error('Choose three non-collinear control points');
  const coeff=k=>{const db=b[k]-a[k],dc=c[k]-a[k];return[(db*cy-dc*by)/det,(bx*dc-cx*db)/det]};
  const [ux,uy]=coeff('u'),[vx,vy]=coeff('v');
  if(Math.abs(ux*vy-uy*vx)<1e-7)throw Error('Degenerate image alignment');
  const project=p=>({u:a.u+ux*(p.x-a.x)+uy*(p.y-a.y),v:a.v+vx*(p.x-a.x)+vy*(p.y-a.y)});
  const check=project(d),error=Math.hypot(check.u-d.u,check.v-d.v);
  if(!Number.isFinite(error)||error>1)throw Error('Independent check differs by '+error.toFixed(2)+'% of image dimensions; choose more accurate anchors');
  return{project,error};
 }
 // Only restore a private calibration against the exact same image bytes and source revision.
 function restore(record,world,revision,fingerprint,rows){
  if(!record||record.schema!==1||record.world!==world||record.revision!==revision||!/^sha256:[a-f0-9]{64}$/.test(fingerprint)||record.fingerprint!==fingerprint||!Array.isArray(record.anchors)||record.anchors.length!==4)throw Error('Calibration image or source mismatch');
  const seen=new Set(),anchors=record.anchors.map(a=>{const row=rows.find(r=>r.id===a.id);if(!row||seen.has(a.id))throw Error('Unknown or duplicate alignment landmark');seen.add(a.id);return {...row,u:a.u,v:a.v}});
  return {anchors,transform:fit(anchors)};
 }
 return Object.freeze({fit,restore});
});
