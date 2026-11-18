/* Team Jura Atlas 9.9 · original interactive WebGL garage concept.
 * The geometry is our own generic car silhouette, NOT a GTA vehicle model.
 * No downloaded meshes, Rockstar models, telemetry, external libraries, or save-key changes.
 */
(function(root){'use strict';
let gl=null, canvas=null, section=null, program=null, buffer=null, count=0, yaw=.5, pitch=.32, distance=6.6, active=false,raf=0,drag=null,paint='#586478';
const $=id=>document.getElementById(id);
function hexColor(hex){
 const matched=/^#([0-9a-f]{6})$/i.exec(hex||'');
 return matched?[0,2,4].map(i=>parseInt(matched[1].slice(i,i+2),16)/255):[.38,.42,.53];
}
function tint(color,shade){return color.map(c=>Math.max(0,Math.min(1,c*shade)))}
function mesh(color,kind){
 const data=[];const base=hexColor(color);
 function tri(p,q,r,c){for(const v of [p,q,r])data.push(v[0],v[1],v[2],c[0],c[1],c[2]);}
 function face(a,b,c,d,col){tri(a,b,c,col);tri(a,c,d,col)}
 function cuboid(x,y,z,w,h,l,c){
  const x0=x-w/2,x1=x+w/2,y0=y-h/2,y1=y+h/2,z0=z-l/2,z1=z+l/2;
  face([x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],tint(c,1.19));
  face([x0,y0,z1],[x1,y0,z1],[x1,y0,z0],[x0,y0,z0],tint(c,.57));
  face([x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0],tint(c,.8));
  face([x0,y0,z1],[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],tint(c,.66));
  face([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],tint(c,.92));
  face([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],tint(c,.82));
 }
 function wheel(cx,cy,cz){
  const N=20,r=.36,half=.17;
  const tread=[.11,.12,.15],rim=[.62,.66,.74],hub=[.23,.28,.36];
  for(let k=0;k<N;k++){let a=k*2*Math.PI/N,b=(k+1)*2*Math.PI/N;
    const ya=cy+Math.cos(a)*r,za=cz+Math.sin(a)*r,yb=cy+Math.cos(b)*r,zb=cz+Math.sin(b)*r;
    face([cx-half,ya,za],[cx-half,yb,zb],[cx+half,yb,zb],[cx+half,ya,za],tread);
    for(const side of [-half,half]){
      const x=cx+side;
      tri([x,cy,cz],[x,ya,za],[x,yb,zb],tread);
      const rr=.245;
      tri([x+(side>0?.003:-.003),cy,cz],[x+(side>0?.003:-.003),cy+Math.cos(a)*rr,cz+Math.sin(a)*rr],[x+(side>0?.003:-.003),cy+Math.cos(b)*rr,cz+Math.sin(b)*rr],rim);
    }
  }
  cuboid(cx+(cx>0?.184:-.184),cy,cz,.01,.085,.085,hub);
 }
 const truck=/truck|pickup|commercial|van/i.test(kind||'');
 const sport=/super|sport|coupe/i.test(kind||'');
 const bodyLength=truck?4.45:sport?4.0:4.25;
 const bodyHeight=sport?.59:.8;
 // Raised dark turntable gives depth without representing any copyrighted in-game garage.
 cuboid(0,-.22,0,4.4,.12,5.95,[.16,.095,.23]);
 cuboid(0,-.34,0,4.75,.09,6.25,[.35,.22,.38]);
 // Forward is +Z
 cuboid(0,.67,0,2.04,bodyHeight,bodyLength,base);
 const windshield=[.16,.25,.31],glass=[.19,.29,.37];
 if(truck){
   cuboid(0,1.31,-.62,1.83,.77,1.78,tint(base,.9));
   cuboid(0,1.33,.31,1.86,.53,.24,glass);
 }else{
   cuboid(0,sport?1.14:1.29,-.40,1.80,sport?.50:.67,2.38,tint(base,.88));
   cuboid(0,sport?1.15:1.33,.66,1.65,sport?.35:.46,.13,windshield);
 }
 // Color-coded lamps; never a purported exact vehicle render.
 cuboid(-.73,.77,bodyLength/2+.018,.36,.17,.07,[.94,.91,.7]);
 cuboid(.73,.77,bodyLength/2+.018,.36,.17,.07,[.94,.91,.7]);
 cuboid(-.73,.77,-bodyLength/2-.018,.36,.17,.07,[.92,.18,.21]);
 cuboid(.73,.77,-bodyLength/2-.018,.36,.17,.07,[.92,.18,.21]);
 cuboid(0,.32,bodyLength/2,.95,.16,.15,[.1,.11,.13]);
 cuboid(0,.32,-bodyLength/2,.95,.16,.15,[.1,.11,.13]);
 for(const x of [-1.0,1.0])for(const z of [-1.22,1.22])wheel(x,.30,z);
 return new Float32Array(data);
}
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||'3D shader unavailable');return s}
function initGL(){
 if(gl)return true;
 try{
  gl=canvas.getContext('webgl',{alpha:false,antialias:true,preserveDrawingBuffer:false});
  if(!gl)return false;
  const vertex='attribute vec3 aPos; attribute vec3 aColor; varying vec3 vColor; uniform float uYaw,uPitch,uDist,uAspect; void main(){float cy=cos(uYaw),sy=sin(uYaw); vec3 p=vec3(cy*aPos.x+sy*aPos.z,aPos.y,-sy*aPos.x+cy*aPos.z); float cp=cos(uPitch),sp=sin(uPitch); p=vec3(p.x,cp*p.y-sp*p.z,sp*p.y+cp*p.z); p.z-=uDist; float f=2.35; float z=-p.z; gl_Position=vec4(p.x*f/uAspect,p.y*f,((z-0.1)/(25.0-0.1))*z,z);vColor=aColor;}';
  const fragment='precision mediump float; varying vec3 vColor; void main(){gl_FragColor=vec4(vColor,1.0);}';
  program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  buffer=gl.createBuffer();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
  return true;
 }catch(e){console.warn('Original 3D preview disabled:',e.message);return false}
}
function render(){
 if(!gl||!active)return;
 const dpr=Math.min(window.devicePixelRatio||1,2),w=Math.max(1,Math.round(canvas.clientWidth*dpr)),h=Math.max(1,Math.round(canvas.clientHeight*dpr));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
 gl.viewport(0,0,w,h);gl.clearColor(.07,.036,.12,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 for(const [name,size,offset]of [['aPos',3,0],['aColor',3,12]]){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,24,offset)}
 for(const [name,val]of [['uYaw',yaw],['uPitch',pitch],['uDist',distance],['uAspect',w/h]])gl.uniform1f(gl.getUniformLocation(program,name),val);
 gl.drawArrays(gl.TRIANGLES,0,count);
}
function rebuild(kind){if(!gl)return;const data=mesh(paint,kind);count=data.length/6;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);render()}
function mount(target,opts){
 if(!target||!opts)return;
 active=false;cancelAnimationFrame(raf);
 section=target;section.replaceChildren();const title=document.createElement('strong');title.textContent='3D CONCEPT SHOWROOM · ORIGINAL TEAM JURA GEOMETRY';
 const note=document.createElement('small');note.textContent='Interactive 3D shape for paint visualization; not a scanned or official model of '+String(opts.name||'the vehicle')+'. The archive image above identifies the actual vehicle.';
 const canvasWrap=document.createElement('div');canvasWrap.className='j99-3d-stage';canvas=document.createElement('canvas');canvas.setAttribute('aria-label','Interactive original car concept. Drag to rotate; use the zoom buttons.');canvas.width=520;canvas.height=270;canvasWrap.append(canvas);
 const controls=document.createElement('div');controls.className='j99-3d-controls';
 const left=document.createElement('button');left.type='button';left.textContent='⟲ Rotate';
 const zoomIn=document.createElement('button');zoomIn.type='button';zoomIn.textContent='＋ Zoom';
 const zoomOut=document.createElement('button');zoomOut.type='button';zoomOut.textContent='− Zoom';
 controls.append(left,zoomIn,zoomOut);
 section.append(title,note,canvasWrap,controls);
 gl=null;program=null;buffer=null;const ok=initGL();if(!ok){canvasWrap.hidden=true;controls.hidden=true;note.textContent='WebGL 3D is unavailable on this device. Your genuine vehicle-reference image above remains available.';return}
 paint=opts.paint||'#586478';yaw=.55;pitch=.32;distance=6.6;active=true;
 const kind=opts.type||'';section.dataset.profile=kind;rebuild(kind);
 let last=null;canvas.addEventListener('pointerdown',e=>{last={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture?.(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!last||last.id!==e.pointerId)return;yaw+=(e.clientX-last.x)*.010;pitch=Math.max(-.12,Math.min(1.05,pitch+(e.clientY-last.y)*.008));last.x=e.clientX;last.y=e.clientY;render()});
 for(const n of ['pointerup','pointercancel'])canvas.addEventListener(n,()=>{last=null});
 canvas.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(4.9,Math.min(11,distance+(e.deltaY>0?.45:-.45)));render()},{passive:false});
 left.onclick=()=>{yaw+=Math.PI/4;render()};zoomIn.onclick=()=>{distance=Math.max(4.9,distance-.6);render()};zoomOut.onclick=()=>{distance=Math.min(11,distance+.6);render()};
}
root.TeamJuraGarage3D=Object.freeze({mount,paint(color){paint=color;rebuild(section?.dataset.profile||'')}});
})(window);
