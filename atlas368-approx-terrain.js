/* Atlas 36.8 · source-derived approximate terrain. NOT a dense DEM.
 * Numerical source: rolux/gtamaplib; coastline source: GTADB and contributors,
 * YANIS v18 CC BY 4.0. No live third-party requests. */
(function(root){'use strict';
const MAP_REV='d406fea099e1df2bce42fd6b87eed04bce646629';
const POINT_REV='73b847330b6741b0214515178829d0335249df07';
const POINT_BLOB='bd3f7f50e8548a74ff8394011693d425fedf8b45';
const PATH='./data/atlas368-approx-terrain.json';
const WIDTH=96,HEIGHT=110,COUNT=WIDTH*HEIGHT;
function fail(message){throw Error('Approximate relief: '+message)}
function bytes(s,n){
 if(typeof s!=='string'||s.length!==Math.ceil(n/3)*4||!/^[A-Za-z0-9+/]*={0,2}$/.test(s))fail('invalid encoded grid');
 let raw;
 if(typeof root.atob==='function')raw=root.atob(s);
 else if(typeof Buffer!=='undefined')raw=Buffer.from(s,'base64').toString('latin1');
 else fail('base64 decoding is unavailable');
 if(raw.length!==n)fail('wrong decoded length');
 return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
function decode(data,definition=root.JuraTerrain3D?.ELEVATIONS?.['6']){
 if(!data||data.schema!=='team-jura-approximate-relief-v1'||data.game!==6||
 data.coordinateSystem!=='gtadb-game-xy'||data.status!=='approximate-community-reconstruction-unverified')fail('wrong world or source status');
 const source=data.source,grid=data.grid;
 if(!definition||!source||source.mapRevision!==MAP_REV||source.pointRevision!==POINT_REV||source.pointBlob!==POINT_BLOB)fail('unreviewed source revision');
 if(!grid||grid.width!==WIDTH||grid.height!==HEIGHT)fail('wrong grid dimensions');
 const expected=[-definition.zero[0]/definition.scaleXY,(definition.zero[1]-definition.height+1)/definition.scaleXY,(definition.width-1-definition.zero[0])/definition.scaleXY,definition.zero[1]/definition.scaleXY];
 if(!Array.isArray(data.bounds)||data.bounds.length!==4||data.bounds.some((v,i)=>!Number.isFinite(v)||Math.abs(v-expected[i])>.05))fail('incompatible coordinate bounds');
 const heightBytes=bytes(grid.heightDmLE,COUNT*2),support=bytes(grid.supportU8,COUNT);
 const view=new DataView(heightBytes.buffer,heightBytes.byteOffset,heightBytes.byteLength),heights=new Uint16Array(COUNT);
 let max=0;const counts=[0,0,0,0];
 for(let i=0;i<COUNT;i++){
  const height=view.getUint16(i*2,true),coverage=support[i];
  if(coverage>3||height>4050||(coverage===0&&height!==0))fail('invalid elevation or coverage cell');
  heights[i]=height;max=Math.max(max,height);counts[coverage]++;
 }
 if(max<500||counts[0]<COUNT*.1||counts[2]+counts[3]<100)fail('empty or unsupported relief');
 if(!data.stats||counts.some((v,i)=>v!==data.stats.coverageCells?.[String(i)]))fail('coverage totals do not match');
 const [west,south,east,north]=data.bounds;
 function sample(x,y){
  const epsilon=1e-7;
  if(!Number.isFinite(x)||!Number.isFinite(y)||x<west-epsilon||x>east+epsilon||y<south-epsilon||y>north+epsilon)return{height:0,coverage:1};
  const gx=Math.max(0,Math.min(WIDTH-1,(x-west)/(east-west)*(WIDTH-1))),gy=Math.max(0,Math.min(HEIGHT-1,(north-y)/(north-south)*(HEIGHT-1)));
  const x0=Math.floor(gx),y0=Math.floor(gy),x1=Math.min(WIDTH-1,x0+1),y1=Math.min(HEIGHT-1,y0+1);
  const dx=gx-x0,dy=gy-y0;
  const coverage=support[Math.round(gy)*WIDTH+Math.round(gx)];
  // Do not extrapolate hills into cells classified as approximate ocean.
  if(!coverage)return{height:0,coverage:0};
  const top=heights[y0*WIDTH+x0]*(1-dx)+heights[y0*WIDTH+x1]*dx;
  const bottom=heights[y1*WIDTH+x0]*(1-dx)+heights[y1*WIDTH+x1]*dx;
  return{height:(top*(1-dy)+bottom*dy)/10,coverage};
 }
 return Object.freeze({game:6,width:WIDTH,height:HEIGHT,bounds:Object.freeze([...data.bounds]),sample,stats:Object.freeze({...data.stats}),source:Object.freeze({...source})});
}
let cache=null;
async function load(fetcher=root.fetch.bind(root)){
 if(cache)return cache;
 const result=await fetcher(PATH,{cache:'force-cache',credentials:'same-origin'});
 if(!result.ok)fail('local data HTTP '+result.status);
 const content=await result.text();
 if(content.length>131072)fail('source exceeds size limit');
 const surface=decode(JSON.parse(content));
 cache=surface;return surface;
}
const api=Object.freeze({decode,load,PATH});
root.JuraApproxTerrain=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
