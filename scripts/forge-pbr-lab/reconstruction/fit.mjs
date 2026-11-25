function requireValid(ok,message){if(!ok)throw new Error(message)}

function validateStudy(study){
 requireValid(study&&study.schema===1&&study.kind==='synthetic-study'&&study.world===null&&study.model===null,'Only synthetic reference studies are enabled in v1');
 requireValid(typeof study.id==='string'&&/^[a-z0-9-]{1,48}$/.test(study.id),'Invalid study ID');
 requireValid(study.units==='normalized'&&study.source==='Elario original synthetic fixture','Invalid source or units');
 requireValid(Array.isArray(study.stations)&&study.stations.length>=3&&study.stations.length<=24,'Invalid station count');
 const numeric=(v,lo,hi)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
 for(let i=0;i<study.stations.length;i++){
  const s=study.stations[i];requireValid(Array.isArray(s)&&s.length===4&&numeric(s[0],-1,1)&&numeric(s[1],.02,1)&&numeric(s[2],.02,1.5)&&numeric(s[3],0,1.4)&&s[2]-s[3]>=.02,'Invalid [longitudinal, half width, top, bottom] station');
  if(i)requireValid(s[0]-study.stations[i-1][0]>=.025,'Stations must be strictly ordered and spaced');
 }
 requireValid(study.stations[0][0]===-1&&study.stations.at(-1)[0]===1,'Stations must span -1 to +1');
 return study;
}

function buildMesh(stations,segments=32){
 requireValid(Number.isInteger(segments)&&segments>=16&&segments<=64&&segments%4===0,'Invalid ring resolution');
 const vertices=[],faces=[];
 for(const [z,w,top,bottom] of stations){const center=(top+bottom)/2,half=(top-bottom)/2;for(let j=0;j<segments;j++){const a=2*Math.PI*j/segments;vertices.push([w*Math.cos(a),z,center+half*Math.sin(a)])}}
 for(let i=0;i<stations.length-1;i++)for(let j=0;j<segments;j++){const k=(j+1)%segments,a=i*segments+j,b=i*segments+k,c=(i+1)*segments+k,d=(i+1)*segments+j;faces.push([d,c,b,a])}
 // Caps use opposite winding; axis +Y runs along vehicle length.
 faces.push(Array.from({length:segments},(_,i)=>i));
 faces.push(Array.from({length:segments},(_,i)=>stations.length*segments-1-i));
 return {vertices,faces,segments};
}

function measureMesh(mesh){
 const {vertices,segments}=mesh,rows=[];
 for(let i=0;i<vertices.length;i+=segments){const ring=vertices.slice(i,i+segments);rows.push([ring[0][1],Math.max(...ring.map(v=>Math.abs(v[0]))),Math.max(...ring.map(v=>v[2])),Math.min(...ring.map(v=>v[2]))])}
 return rows;
}

function scoreMesh(mesh,target){
 const rows=measureMesh(mesh);requireValid(rows.length===target.length,'Mismatched mesh stations');
 let sum=0,max=0;
 for(let i=0;i<rows.length;i++)for(let j=1;j<4;j++){const error=Math.abs(rows[i][j]-target[i][j]);sum+=error*error;max=Math.max(max,error)}
 return {rmse:Math.sqrt(sum/(rows.length*3)),maxError:max};
}

function refine(study,{maxIterations=20,tolerance=.0005,segments=32}={}){
 validateStudy(study);requireValid(Number.isInteger(maxIterations)&&maxIterations>=0&&maxIterations<=32,'Iteration budget exceeded');
 requireValid(typeof tolerance==='number'&&Number.isFinite(tolerance)&&tolerance>=.000001&&tolerance<=.05,'Invalid tolerance');
 const target=study.stations;
 // Deliberately coarse baseline, not a reconstruction of a named car.
 let stations=target.map(([z])=>[z,.32+.12*(1-z*z),.52+.12*(1-z*z),.12]);
 let mesh=buildMesh(stations,segments),score=scoreMesh(mesh,target);
 const history=[{iteration:0,...score}];
 for(let i=1;i<=maxIterations&&score.rmse>tolerance;i++){
  const next=stations.map((row,k)=>row.map((x,j)=>j===0?x:x+.45*(target[k][j]-x)));
  const candidate=buildMesh(next,segments),candidateScore=scoreMesh(candidate,target);
  if(candidateScore.rmse>=score.rmse-1e-12)break;
  stations=next;mesh=candidate;score=candidateScore;history.push({iteration:i,...score});
 }
 return {schema:1,kind:'synthetic-mesh-candidate',study:study.id,world:null,model:null,releaseEligible:false,reason:'Synthetic body envelope only; no vehicle identity, rights, reference likeness or visual acceptance',iterations:history.length-1,converged:score.rmse<=tolerance,history,stations,mesh};
}
export {validateStudy,buildMesh,measureMesh,scoreMesh,refine};
