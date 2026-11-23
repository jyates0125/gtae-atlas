/* Atlas 36.3 — one-at-a-time GTADB community elevation reference.
 * GTADB.org per-point API is documented at https://api.gtadb.org/.
 * No bulk sampling, API secrets, background polling or coordinate collection.
 * This is NOT a proof of independent game accuracy or a heightfield download.
 */
(function(root){'use strict';
function finite(n){return typeof n==='number'&&Number.isFinite(n)}
function validate(game,x,y){
 if(String(game)!=='6')throw Error('Only GTA VI community elevation is supported');
 if(!finite(x)||!finite(y))throw Error('Map center must have finite X and Y');
 const d=root.JuraTerrain3D?.ELEVATIONS?.[6];
 if(!d)throw Error('GTA VI terrain coordinate definition unavailable');
 const px=d.zero[0]+x*d.scaleXY,py=d.zero[1]-y*d.scaleXY;
 if(px<0||py<0||px>=d.width-1||py>=d.height-1)
  throw Error('Map center is outside the reconstructed GTA VI heightfield');
 return{x:Math.round(x*100)/100,y:Math.round(y*100)/100};
}
function parse(data,x,y){
 if(!data||data.status!=='OK'||!Array.isArray(data.results)||!data.results.length)
  throw Error('No valid elevation result was returned');
 const obj=data.results[0],meters=obj?.elevation;
 if(!finite(meters)||meters < -1000||meters > 10000)
  throw Error('GTADB elevation value is not a finite plausible height');
 if(Array.isArray(obj.location)&&obj.location.length>=2&&
    finite(obj.location[0])&&finite(obj.location[1])&&
    (Math.abs(obj.location[0]-x)>1||Math.abs(obj.location[1]-y)>1))
  throw Error('GTADB elevation reply does not match the requested location');
 return{meters,x,y,source:'GTADB.org community elevation API',confidence:'experimental'};
}
async function check(game,x,y,request){
 const point=validate(game,x,y);
 const requester=request||root.fetch?.bind(root);
 if(typeof requester!=='function')throw Error('Network fetch is unavailable');
 const url='https://api.gtadb.org/elevation?gta=6&x='+encodeURIComponent(point.x)+
           '&y='+encodeURIComponent(point.y);
 const response=await requester(url,{
  method:'GET',mode:'cors',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'
 });
 if(!response?.ok)throw Error('GTADB elevation endpoint returned HTTP '+(response?.status||'error'));
 return parse(await response.json(),point.x,point.y);
}
function compare(localData,game,x,y,reference){
 if(!localData||!localData.bytes||localData.game!==String(game))return null;
 const d=root.JuraTerrain3D?.ELEVATIONS?.[game];
 const helper=root.JuraTerrainEvidence?.heightAt;
 if(!d||typeof helper!=='function')return null;
 const localMeters=helper(new DataView(localData.bytes),d,{x,y});
 if(!finite(localMeters))return null;
 return{localMeters,differenceMeters:localMeters-reference.meters};
}
const api=Object.freeze({check,compare,validate,parse});
root.JuraElevationPointProbe=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
