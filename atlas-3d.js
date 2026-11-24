/* Team Jura Atlas 6.0 — original WebGL terrain engine. Elevation format and
 * coordinate convention based on GTADB.org MIT map source and public elevation
 * endpoint (data © GTADB.org and contributors, CC BY 4.0 where applicable).
 * The app does not assume that external elevation is available. */
(function(root){'use strict';
const ELEVATIONS={5:{width:930,height:1300,scaleXY:.1,scaleZ:52.11294342920029,zero:[410,839],offset:-462.2172786903457},6:{width:1536,height:1748,scaleXY:.083188297074,scaleZ:92.466616,zero:[1108.532445611,938.090772693],offset:-303.1033271360121}};
const vs=`attribute vec3 aPos;attribute vec2 aUV;attribute float aSupport;attribute float aLight;uniform mat4 uMVP;varying vec2 vUV;varying float vH;varying float vSupport;varying float vLight;void main(){vUV=aUV;vH=aPos.y;vSupport=aSupport;vLight=aLight;gl_Position=uMVP*vec4(aPos,1.);}`;
const fs=`precision mediump float;varying vec2 vUV;varying float vH;varying float vSupport;varying float vLight;uniform sampler2D uMap;uniform float uMapped;uniform float uShade;uniform float uCoverage;void main(){vec3 c;if(vSupport>3.5)c=vec3(.095,.19,.23);else if(vSupport<.5)c=vec3(.16,.46,.57);else if(vH<0.)c=mix(vec3(.08,.24,.33),vec3(.16,.46,.57),clamp((vH+130.)/180.,0.,1.));else if(vH<120.)c=mix(vec3(.24,.41,.26),vec3(.45,.49,.29),clamp(vH/120.,0.,1.));else c=mix(vec3(.48,.47,.36),vec3(.70,.66,.56),clamp((vH-120.)/300.,0.,1.));if(uMapped>.5){vec4 tex=texture2D(uMap,vUV);c=mix(c,tex.rgb,.89*tex.a);}if(uCoverage>.5){vec3 supportColor=vSupport<.5?vec3(.19,.43,.65):vSupport<1.5?vec3(.39,.42,.48):vSupport<2.5?vec3(.88,.59,.23):vec3(.27,.68,.48);c=mix(c,supportColor,.87);}float light=mix(1.,clamp(vLight,.50,1.20),clamp(uShade,0.,1.));gl_FragColor=vec4(c*light,1.);}`;
const compile=(gl,type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||'GL shader');return s};
function program(gl){const p=gl.createProgram();gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p)||'GL link');return p}
function perspective(fov,ratio,near,far){const f=1/Math.tan(fov/2),m=new Float32Array(16);m[0]=f/ratio;m[5]=f;m[10]=(far+near)/(near-far);m[11]=-1;m[14]=2*far*near/(near-far);return m}
function lookAt(eye,target,up){let z=normalize(sub(eye,target)),x=normalize(cross(up,z)),y=cross(z,x),m=new Float32Array(16);m[0]=x[0];m[1]=y[0];m[2]=z[0];m[4]=x[1];m[5]=y[1];m[6]=z[1];m[8]=x[2];m[9]=y[2];m[10]=z[2];m[12]=-dot(x,eye);m[13]=-dot(y,eye);m[14]=-dot(z,eye);m[15]=1;return m}
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],normalize=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l)};
function matmul(a,b){const out=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let i=0;i<4;i++)out[c*4+r]+=a[i*4+r]*b[c*4+i];return out}
// Pure, independently testable camera transformation.
function cameraMatrix(bearing,pitch,distance,width,height){
 const finite=(v,fallback)=>Number.isFinite(v)?v:fallback;
 const b=finite(bearing,0)%(Math.PI*2),t=Math.max(.24,Math.min(1.43,finite(pitch,.83))),d=Math.max(360,Math.min(40000,finite(distance,3200)));
 const ratio=Math.max(.1,Math.min(10,Math.max(1,finite(width,1))/Math.max(1,finite(height,1))));
 const eye=[Math.sin(b)*d*Math.cos(t),d*Math.sin(t),Math.cos(b)*d*Math.cos(t)];
 const m=matmul(perspective(Math.PI/3,ratio,5,90000),lookAt(eye,[0,0,0],[0,1,0]));
 if(!Array.from(m).every(Number.isFinite))throw Error('Non-finite terrain camera matrix');
 return m;
}
function clipPoint(m,p){const x=p[0],y=p[1],z=p[2];const w=m[3]*x+m[7]*y+m[11]*z+m[15];if(!Number.isFinite(w)||w<=.001)return null;return[(m[0]*x+m[4]*y+m[8]*z+m[12])/w,(m[1]*x+m[5]*y+m[9]*z+m[13])/w]}

/** Stateless camera gesture transform. Single drag orbits, Shift-drag pans;
 * two touchpoints pan and pinch. Pure so gesture math can be unit tested.
 */
function solveGesture(start,current,view,extent,viewportWidth){
 const out={bearing:view.bearing,pitch:view.pitch,distance:view.distance,centerX:view.centerX,centerY:view.centerY};
 if(!start?.length||start.length!==current?.length)return out;
 const scale=Math.max(360,view.distance)*1.2/Math.max(200,viewportWidth||1);
 const pan=(dx,dy)=>{const c=Math.cos(view.bearing),s=Math.sin(view.bearing);out.centerX+=(-dx*c+dy*s)*scale;out.centerY+=(dx*s+dy*c)*scale;};
 if(start.length===1){
  const dx=current[0].x-start[0].x,dy=current[0].y-start[0].y;
  if(start[0].shift){
   pan(dx,dy);
  }else{
   out.bearing+=dx*.007;
   out.pitch=Math.max(.24,Math.min(1.43,out.pitch-dy*.005));
  }
 }else{
  const a=start[0],bb=start[1],c=current[0],d=current[1];
  const startWidth=Math.max(1,Math.hypot(a.x-bb.x,a.y-bb.y));
  const nowWidth=Math.max(1,Math.hypot(c.x-d.x,c.y-d.y));
  pan(((c.x+d.x)-(a.x+bb.x))*.5,((c.y+d.y)-(a.y+bb.y))*.5);
  out.distance=Math.max(360,Math.min(40000,view.distance*(startWidth/nowWidth)));
 }
 return out;
}
// Quantized spatial levels keep the mesh stable during small zoom gestures.
function terrainExtent(distance,aspect){
 const span=Math.max(1200,Math.min(65536,distance*2.2*Math.max(1,Math.min(3,aspect||1))));
 return Math.min(65536,1200*2**Math.max(0,Math.ceil(Math.log2(span/1200))));
}
function create(opts){const canvas=opts.canvas,overlay=opts.overlay,status=opts.status,bridge=opts.bridge;let gl=null,p=null,position=null,uv=null,index=null,tex=null,ready=false,active=false,projectMatrix=null,center={x:0,y:0,z:2},bearing=0,pitch=.86,distance=3200,extent=8000,textureFingerprint='',textured=false,geoKey='',meshPoints=[],sourceHeights=null,heightGame=null,approximateSurface=null,showCoverage=false,supportBuffer=null,lightBuffer=null,sourceError='',loadToken=0,assetUpdate=0,textureRevision=-1,lastRender=0,pointers=new Map(),gesture=null,renderQueued=false,frameVerified=false,frameReport=null,layoutObserver=null;
function notice(message){if(status)status.textContent=hasApproximate()&&!message.startsWith('Approximate terrain')?'Approximate terrain · '+message:message}
function elevation(x,y){if(!sourceHeights||heightGame!==String(bridge.game()))return hasApproximate()?approximateSurface.sample(x,y).height:0;const d=ELEVATIONS[bridge.game()];if(!d)return 0;const px=d.zero[0]+x*d.scaleXY,py=d.zero[1]-y*d.scaleXY;if(px<0||py<0||px>=d.width-1||py>=d.height-1)return 0;const x0=Math.floor(px),y0=Math.floor(py),fx=px-x0,fy=py-y0,off=y0*d.width+x0;const a=sourceHeights[off]*(1-fx)+sourceHeights[off+1]*fx,b=sourceHeights[off+d.width]*(1-fx)+sourceHeights[off+d.width+1]*fx;return Math.max(-400,Math.min(1800,((a*(1-fy)+b*fy)/d.scaleZ+d.offset)));}
function decodeHeightfield(buffer,definition){
 const expected=definition.width*definition.height*2;
 if(!(buffer instanceof ArrayBuffer)||buffer.byteLength!==expected){
   throw Error('Expected '+expected.toLocaleString()+' bytes for this heightfield');
 }
 const heights=new Uint16Array(buffer);
 if(!heights.some(sample=>sample!==heights[0])){
   throw Error('All elevation samples are identical. This file contains no terrain relief.');
 }
 return heights;
}
// Atlas 36.6: never decide a bundled local DEM is missing before attempting
// to read it. Read ONLY this site's own elevation-[game].bin, not a live GTADB
// media endpoint. A correct, nonuniform Uint16 grid is a prerequisite for 3D.
function hasElevation(g=bridge.game()){return !!sourceHeights&&heightGame===String(g);}
function hasApproximate(g=bridge.game()){return String(g)==='6'&&String(bridge.game())==='6'&&!!approximateSurface&&!hasElevation(g);}
function setApproximateSurface(surface){if(String(bridge.game())!=='6'||hasElevation()||!surface||surface.game!==6||typeof surface.sample!=='function')throw Error('Approximation is only available for Leonida without a dense heightfield');++loadToken;approximateSurface=surface;showCoverage=false;sourceError='';geoKey='';textureFingerprint='';return true;}
function clearApproximateSurface(){approximateSurface=null;showCoverage=false;geoKey='';textureFingerprint='';}
function setCoverageVisible(value){showCoverage=!!value&&hasApproximate();if(active)render();return showCoverage;}
async function prepareElevation(g=bridge.game()){
 const target=String(g),definition=ELEVATIONS[target];
 if(target!==String(bridge.game())||!definition){
  sourceError='Elevation world does not match the selected map';return false;
 }
 if(hasElevation(target))return true; // local file import always takes priority
 const token=++loadToken;
 sourceError='';
 try{
  const response=await fetch('./elevation-'+target+'.bin',{cache:'force-cache',credentials:'same-origin'});
  if(!response.ok)throw Error('No bundled elevation-'+target+'.bin (HTTP '+response.status+')');
  const expected=definition.width*definition.height*2;
  const declared=Number(response.headers?.get?.('content-length')||0);
  if(declared>0&&declared!==expected)throw Error('Bundled elevation size mismatch');
  const buffer=await response.arrayBuffer();
  if(token!==loadToken||target!==String(bridge.game()))return false;
  const decoded=decodeHeightfield(buffer,definition);
  clearApproximateSurface();sourceHeights=decoded;heightGame=target;sourceError='';
  geoKey='';textureFingerprint='';
  notice('Local heightfield ready · GTADB-coordinate reconstructed terrain');
  if(active)render();
  return true;
 }catch(e){
  if(token!==loadToken||target!==String(bridge.game()))return false;
  sourceError=e?.message||'Elevation loading failed';
  if(active)notice('3D terrain unavailable · map preview retained');
  return false;
 }
}
async function setElevationBinary(buffer,g){
 const d=ELEVATIONS[g];if(!d||bridge.game()!==String(g))throw Error('Choose the matching game first');
 const heights=decodeHeightfield(buffer,d);
 ++loadToken;clearApproximateSurface();sourceHeights=heights;heightGame=String(g);sourceError='';geoKey='';notice('User-supplied heightfield active for GTA '+g+' · reconstructed 3D terrain');render();return true;
}
function ensureGL(){if(ready&&!gl?.isContextLost?.())return true;ready=false;try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true});if(!gl)throw Error('WebGL not supported');p=program(gl);position=gl.createBuffer();uv=gl.createBuffer();supportBuffer=gl.createBuffer();lightBuffer=gl.createBuffer();index=gl.createBuffer();tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([40,82,98,255]));ready=true;return true;}catch(e){notice('3D renderer unavailable: '+e.message);return false}}
function updateMesh(){const num=Math.max(35,Math.min(70,Math.round(canvas.clientWidth/10))),vertices=[],uvs=[],supports=[],lights=[],indices=[];const radius=extent/2,step=extent/num;for(let r=0;r<=num;r++)for(let c=0;c<=num;c++){const dx=-radius+c*step,dz=-radius+r*step,wx=center.x+dx,wy=center.y-dz;vertices.push(dx,elevation(wx,wy)*2.1,dz);uvs.push(c/num,r/num);const bounds=approximateSurface?.bounds;supports.push(hasApproximate()?(bounds&&(wx<bounds[0]||wy<bounds[1]||wx>bounds[2]||wy>bounds[3])?4:approximateSurface.sample(wx,wy).coverage):3);const gx=(elevation(wx+step,wy)-elevation(wx-step,wy))*2.1/(2*step),gz=(elevation(wx,wy-step)-elevation(wx,wy+step))*2.1/(2*step),n=normalize([-gx,1,-gz]);lights.push(.65+.52*Math.max(0,dot(n,normalize([-.6,1,.45]))))}
 for(let r=0;r<num;r++)for(let c=0;c<num;c++){const i=r*(num+1)+c;indices.push(i,i+num+1,i+1,i+1,i+num+1,i+num+2)}
 gl.bindBuffer(gl.ARRAY_BUFFER,position);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,uv);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(uvs),gl.DYNAMIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,supportBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(supports),gl.DYNAMIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,lightBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(lights),gl.DYNAMIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);meshPoints=indices;}
function updateTexture(){
 if(!bridge.textureDraw)return;
 const off=document.createElement('canvas'),textureSize=canvas.clientWidth<600?512:768;
 off.width=textureSize;off.height=textureSize;const r=extent/2;
 try{
  const result=bridge.textureDraw(off,{x0:center.x-r,y0:center.y-r,x1:center.x+r,y1:center.y+r});
  const loaded=typeof result==='object'&&result!==null?result.loaded>0:!!result;
  const complete=typeof result==='object'&&result!==null?result.complete:loaded;
  if(!loaded){textured=false;document.body.classList.remove('jura-3d-texture-pending');notice(hasApproximate()?'Approximate terrain · map imagery loading':'3D terrain · map imagery loading');return}
  gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,off);
  textured=true;document.body.classList.remove('jura-3d-texture-pending');
  notice((hasApproximate()?'Approximate terrain':'3D terrain')+(complete?' · map imagery active':' · partial map imagery'));
 }catch(e){textured=false;document.body.classList.remove('jura-3d-texture-pending');notice('3D terrain · map imagery unavailable; relief colors shown')}
}
function sync(){const c=bridge.camera();center={x:c.x,y:c.y,z:c.z};distance=Math.max(360,Math.min(40000,Math.pow(2,3.2-c.z)*5700*.92));pitch=.83;bearing=0;geoKey='';textureFingerprint='';}
function fit(){
 if(!active)return;
 const bounds=approximateSurface?.bounds||(String(bridge.game())==='6'?[-13325.582,-9723.834,5126.534,11276.716]:[-4550,-4750,4800,8150]);
 const [west,south,east,north]=bounds;
 center={x:(west+east)/2,y:(south+north)/2,z:0};bearing=0;pitch=1.29;
 const aspect=Math.max(.2,canvas.clientWidth/Math.max(1,canvas.clientHeight));
 const spanX=east-west,spanY=north-south;
 distance=Math.min(40000,Math.max(spanX/aspect,spanY)*1.05+spanY*.16);
 geoKey='';textureFingerprint='';render();
}
function updateCompass(){
 const button=document.getElementById('j371-compass'),needle=document.getElementById('j371-needle');
 if(!button||!needle)return;
 const deg=((bearing*180/Math.PI)%360+360)%360;
 needle.style.transform='rotate('+(-deg)+'deg)';
 button.title='Heading '+Math.round(deg)+'° · reset north';
}
function constrainCenter(){
 if(!hasApproximate())return;
 const [w,s,e,n]=approximateSurface.bounds;
 center.x=Math.max(w,Math.min(e,center.x));center.y=Math.max(s,Math.min(n,center.y));
}
function matrix(){return cameraMatrix(bearing,pitch,distance,canvas.width,canvas.height)}
function project(x,y){if(!projectMatrix)return null;const pos=[x-center.x,elevation(x,y)*2.1+22,center.y-y],coords=clipPoint(projectMatrix,pos);if(!coords||Math.abs(coords[0])>1.4||Math.abs(coords[1])>1.4)return null;return{x:(coords[0]+1)*canvas.clientWidth/2,y:(1-coords[1])*canvas.clientHeight/2}}
function drawOverlays(){if(!overlay)return;overlay.replaceChildren();const places=bridge.places().filter(r=>Math.abs(r.x-center.x)<extent*.4&&Math.abs(r.y-center.y)<extent*.4).slice(0,1200),route=bridge.route(),points=[];
 for(const r of places){const q=project(r.x,r.y);if(!q)continue;const b=document.createElement('button');b.type='button';b.className='jura-3d-pin';b.textContent=r.markerColor?'':bridge.symbol(r.category);b.title=r.name;b.setAttribute('aria-label','Find '+r.name);b.style.left=q.x+'px';b.style.top=q.y+'px';b.style.background=bridge.color(r.category,r);if(r.markerColor)b.classList.add('jura-gtadb-pin');if(bridge.compactLandmark?.(r)){b.classList.add('j371-landmark-pin');b.textContent='◆'}b.onclick=()=>bridge.select(r);overlay.append(b)}
 if(route.length>1){for(const r of route){const q=project(r.x,r.y);if(q)points.push([q.x,q.y]);}if(points.length>=2){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${canvas.clientWidth} ${canvas.clientHeight}`);svg.setAttribute('class','jura-3d-route');const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');line.setAttribute('points',points.map(p=>p.join(',')).join(' '));line.setAttribute('fill','none');line.setAttribute('stroke','#ffd27d');line.setAttribute('stroke-width','4');line.setAttribute('stroke-dasharray','8 5');svg.append(line);overlay.prepend(svg)}}
 }
function render(){if(!active||!ensureGL()||canvas.clientWidth<2||canvas.clientHeight<2){frameReport={reason:'canvas not laid out',clientWidth:canvas.clientWidth,clientHeight:canvas.clientHeight};return false;}const dpr=Math.min(2,devicePixelRatio||1),w=Math.max(1,Math.round(canvas.clientWidth*dpr)),h=Math.max(1,Math.round(canvas.clientHeight*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;geoKey=''}
 gl.viewport(0,0,w,h);gl.colorMask(true,true,true,true);gl.depthMask(true);gl.disable(gl.CULL_FACE);gl.disable(gl.SCISSOR_TEST);gl.disable(gl.BLEND);gl.clearColor(.095,.19,.23,0);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
 extent=terrainExtent(distance,canvas.clientWidth/Math.max(1,canvas.clientHeight));updateCompass();
 const key=[center.x.toFixed(1),center.y.toFixed(1),extent.toFixed(1),!!sourceHeights,hasApproximate()].join(':');if(key!==geoKey){updateMesh();geoKey=key;textureFingerprint=''}
 const now=Date.now();const revision=bridge.textureRevision?.()??0;if(!textureFingerprint||revision!==textureRevision){updateTexture();textureFingerprint=key;assetUpdate=now;textureRevision=revision}
 projectMatrix=matrix();gl.useProgram(p);gl.uniformMatrix4fv(gl.getUniformLocation(p,'uMVP'),false,projectMatrix);gl.uniform1f(gl.getUniformLocation(p,'uMapped'),textured?1:0);gl.uniform1f(gl.getUniformLocation(p,'uShade'),1);gl.uniform1f(gl.getUniformLocation(p,'uCoverage'),showCoverage&&hasApproximate()?1:0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(gl.getUniformLocation(p,'uMap'),0);
 gl.bindBuffer(gl.ARRAY_BUFFER,position);const aPos=gl.getAttribLocation(p,'aPos');gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,uv);const aUV=gl.getAttribLocation(p,'aUV');gl.enableVertexAttribArray(aUV);gl.vertexAttribPointer(aUV,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,supportBuffer);const aSupport=gl.getAttribLocation(p,'aSupport');gl.enableVertexAttribArray(aSupport);gl.vertexAttribPointer(aSupport,1,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,lightBuffer);const aLight=gl.getAttribLocation(p,'aLight');gl.enableVertexAttribArray(aLight);gl.vertexAttribPointer(aLight,1,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index);gl.drawElements(gl.TRIANGLES,meshPoints.length,gl.UNSIGNED_SHORT,0);try{drawOverlays()}catch(e){console.warn('Atlas terrain overlay:',e.message)}return true;}
// A successful GL context or texture upload alone does not prove a frame.
function verifyFrame(){
 if(!gl||gl.isContextLost?.()||canvas.width<2||canvas.height<2)return false;
 const pixel=new Uint8Array(4);let hits=0;const samples=[];
 for(const y of [.15,.3,.5,.7,.85])for(const x of [.15,.3,.5,.7,.85]){
  gl.readPixels(Math.min(canvas.width-1,Math.floor(canvas.width*x)),Math.min(canvas.height-1,Math.floor(canvas.height*y)),1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);
  samples.push([...pixel]);if(pixel[3]>127)hits++;
 }
 const errors=[];for(let i=0;i<8;i++){const code=gl.getError();if(code===gl.NO_ERROR)break;errors.push(code)}
 frameReport={reason:hits?'drawn':'no opaque terrain pixels',hits,samples,errors,width:canvas.width,height:canvas.height,clientWidth:canvas.clientWidth,clientHeight:canvas.clientHeight,drawingWidth:gl.drawingBufferWidth,drawingHeight:gl.drawingBufferHeight,extent,distance,center:{...center},meshIndices:meshPoints.length,finiteMatrix:!!projectMatrix&&Array.from(projectMatrix).every(Number.isFinite),centerClip:projectMatrix?clipPoint(projectMatrix,[0,0,0]):null,textured};
 return hits>0&&errors.length===0;
}
function activate(){if(!hasElevation()&&!hasApproximate()){notice('No elevation data available for true 3D');return false}
 if(!ensureGL())return false;
 document.body.classList.add('jura-3d-texture-pending');
 document.body.classList.remove('jura-perspective-fallback');
 canvas.hidden=false;if(overlay)overlay.hidden=false;
 sync();active=true;textured=false;frameVerified=false;frameReport=null;
 if(canvas.style)canvas.style.touchAction='none';
 try{
  // Explicit initial layout and draw. No cached tile callback is required.
  canvas.getBoundingClientRect();
  frameVerified=!!render()&&verifyFrame();
  if(!frameVerified&&canvas.clientWidth>1&&canvas.clientHeight>1){
   // Retry the same geometry with a conservative centered camera and fresh
   // buffers. This is a camera correction, never invented elevation data.
   pitch=1.05;distance=extent*.75;geoKey='';textureFingerprint='';
   frameVerified=!!render()&&verifyFrame();
  }
 }catch(e){sourceError=String(e?.message||e);frameReport={reason:sourceError,stack:String(e?.stack||'')}}
 if(!frameVerified){
  console.warn('Atlas 3D visible-frame check failed',JSON.stringify(frameReport));
  sourceError='3D frame could not be displayed';active=false;canvas.hidden=true;if(overlay)overlay.hidden=true;
  document.body.classList.remove('jura-3d-texture-pending');
  document.body.classList.add('jura-perspective-fallback');
  notice('3D frame could not be displayed; illustrated map retained');return false;
 }
 document.body.classList.remove('jura-3d-texture-pending');
 if(typeof ResizeObserver==='function'&&!layoutObserver){
  layoutObserver=new ResizeObserver(()=>{if(active&&canvas.clientWidth>1&&canvas.clientHeight>1)queueRender()});
  layoutObserver.observe(canvas);
 }
 queueRender();return true;
}
function deactivate(){active=false;frameVerified=false;clearApproximateSurface();pointers.clear();gesture=null;if(canvas.style)canvas.style.touchAction='';loadToken++;document.body.classList.remove('jura-3d-texture-pending');canvas.hidden=true;if(overlay){overlay.hidden=true;overlay.replaceChildren()}notice('2D map view');}
function rebase(){if(!active)return;if(!hasElevation()&&!hasApproximate()){sourceHeights=null;deactivate();notice('3D terrain is not available for this world');return}textured=false;document.body.classList.add('jura-3d-texture-pending');sync();render()}
function refreshTexture(){if(!active)return;textureFingerprint='';textured=false;render()}
function zoom(factor){distance=Math.max(360,Math.min(40000,distance*factor));queueRender()}
function beginGesture(){
 const points=[...pointers.values()].map(p=>({...p}));
 gesture=points.length?{points,view:{bearing,pitch,distance,centerX:center.x,centerY:center.y}}:null;
}
function queueRender(){
 if(renderQueued||!active)return;
 renderQueued=true;
 if(typeof requestAnimationFrame==='function'){
  requestAnimationFrame(()=>{renderQueued=false;render()});
 }else{renderQueued=false;render()}
}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();frameVerified=false;if(active){deactivate();if(typeof document!=='undefined')document.dispatchEvent(new Event('jura:terrain-frame-lost'));}});
canvas.addEventListener('webglcontextrestored',()=>{ready=false;geoKey='';textureFingerprint='';});
canvas.addEventListener('pointerdown',e=>{
 if(!active)return;
 if(e.pointerType==='touch')e.preventDefault();
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,shift:!!e.shiftKey});
 beginGesture();
 canvas.setPointerCapture?.(e.pointerId);
});
canvas.addEventListener('pointermove',e=>{
 if(!active||!pointers.has(e.pointerId)||!gesture)return;
 if(e.pointerType==='touch')e.preventDefault();
 const original=pointers.get(e.pointerId);
 pointers.set(e.pointerId,{...original,x:e.clientX,y:e.clientY});
 const next=solveGesture(gesture.points,[...pointers.values()],gesture.view,extent,canvas.clientWidth);
 if(next.centerX!==center.x||next.centerY!==center.y){geoKey='';textureFingerprint=''}
 bearing=next.bearing;pitch=next.pitch;distance=next.distance;
 center.x=next.centerX;center.y=next.centerY;constrainCenter();
 queueRender();
});
const release=e=>{if(pointers.delete(e.pointerId))beginGesture()};
canvas.addEventListener('pointerup',release);
canvas.addEventListener('pointercancel',release);
canvas.addEventListener('lostpointercapture',release);
canvas.addEventListener('wheel',e=>{if(!active)return;e.preventDefault();zoom(e.deltaY>0?1.17:.85)},{passive:false});
return{activate,deactivate,rebase,refreshTexture,render,zoom,fit,prepareElevation,setElevationBinary,hasApproximate,setApproximateSurface,clearApproximateSurface,setCoverageVisible,getCoverageVisible:()=>showCoverage,resetNorth(){bearing=0;pitch=.86;queueRender()},isActive:()=>active,hasElevation,getError:()=>sourceError,hasMapTexture:()=>textured,hasVisibleFrame:()=>frameVerified,verifyFrame,getFrameReport:()=>frameReport,getView:()=>({bearing,pitch,distance,extent,center:{...center}})};
}
root.JuraTerrain3D=Object.freeze({create,ELEVATIONS,solveGesture,cameraMatrix,terrainExtent});
})(typeof window!=='undefined'?window:globalThis);
