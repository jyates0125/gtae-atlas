/* Elario 2150 Forge · original interactive vehicle concepts.
 * NOT a GTA vehicle model. No game meshes, tracking or external libraries.
 */
(function(root){'use strict';
let current=null;
function mount(target,opts={}){
 if(!target)return;
 current?.dispose();current=null;
 const forge=root.JuraForge;
 const E=(tag,str)=>{const e=document.createElement(tag);if(str!==undefined)e.textContent=str;return e};
 target.replaceChildren();target.classList.add('j256-forge');
 const title=E('strong','ELARIO 2150 · FORGE SHOWROOM');
 const study=forge?.modelProfile?.(opts.type,opts.model);
 const note=E('small',study?'Elario original model-targeted concept · '+study.label+'. Approximate visual study; not a verified likeness, exact game mesh or modification catalog.':'Original class-based design for '+String(opts.name||'vehicle')+'. Not an exact game model or a verified modification catalogue.');
 target.dataset.forgeFidelity=study?'model-study':'class-concept';
 const wrap=E('div');wrap.className='j99-3d-stage j256-stage';
 const canvas=E('canvas');canvas.tabIndex=0;canvas.setAttribute('aria-label','Original 3D vehicle concept. Arrow keys rotate; plus and minus zoom. Drag to rotate.');wrap.append(canvas);
 const hud=E('div');hud.className='j256-hud';hud.setAttribute('aria-hidden','true');hud.textContent='FORGE / LIVE CONCEPT';wrap.append(hud);
 const controls=E('div');controls.className='j99-3d-controls';
 const button=(label,fn)=>{const b=E('button',label);b.type='button';b.onclick=fn;return b};
 const styling=E('details');styling.className='j256-style';styling.open=true;styling.append(E('summary','Design lab · concept styling'));
 const fields=E('div');fields.className='j256-fields';styling.append(fields);
 let design=forge?.normalize(opts.design)||{},paint=opts.paint||'#586478',gl=null,program=null,buffer=null,count=0,dead=false,raf=0,observer=null,drag=null;
 let yaw=.7,pitch=.30,distance=7.9,profile=forge?.classify(opts.type,opts.model)||'touring';
 let environment=forge?.resolveTheme?.(profile,design.environment)||forge?.defaultTheme?.(profile)||'signature';
 target.dataset.forgeClass=profile;target.dataset.forgeStatus='pending';target.dataset.forgeEnvironment=environment;
 function control(label,element){const l=E('label',label);l.append(element);fields.append(l);return element}
 function select(label,values,key){const s=E('select');s.dataset.forgeControl=key;for(const [v,l] of values){const o=E('option',l);o.value=v;s.append(o)}s.value=design[key];s.onchange=()=>change({[key]:s.value});control(label,s);return s}
 function change(patch){if(!forge)return;design=forge.normalize({...design,...patch});opts.onDesign?.({...design});rebuild()}
 if(forge?.themes){
  const scene=E('select');scene.dataset.forgeControl='environment';
  const auto=E('option','Automatic · vehicle class');auto.value='auto';scene.append(auto);
  for(const [key,theme] of Object.entries(forge.themes)){const o=E('option',theme.label);o.value=key;scene.append(o)}
  scene.value=design.environment||'auto';scene.onchange=()=>{design=forge.normalize({...design,environment:scene.value});environment=forge.resolveTheme(profile,design.environment);target.dataset.forgeEnvironment=environment;hud.textContent='FORGE / '+forge.themes[environment].label.toUpperCase();opts.onDesign?.({...design});rebuild()};control('Showroom environment',scene);
  hud.textContent='FORGE / '+forge.themes[environment].label.toUpperCase();
 }
 const finish=select('Surface finish',[['metallic','Metallic'],['satin','Satin'],['stealth','Stealth']], 'finish');
 const accent=E('input');accent.type='color';accent.value=design.accent||'#eab56a';accent.dataset.forgeControl='accent';accent.oninput=()=>change({accent:accent.value});control('Accent RGB',accent);
 const road=['sport','touring','utility'].includes(profile);
 if(road)select('Ride height',[['street','Street'],['low','Low'],['raised','Raised']], 'stance');
 if(road||profile==='marine')select(road?'Aero styling':'Deck styling',[['clean','Clean'],['sport','Sport'],['track','Track']], 'kit');
 const lights=E('input');lights.type='checkbox';lights.checked=design.lights!==false;lights.dataset.forgeControl='lights';lights.onchange=()=>change({lights:lights.checked});control('Concept lighting',lights);
 const changeCamera=(a,b,d=7.9)=>{yaw=a;pitch=b;distance=d;render()};
 const zoom=d=>{distance=Math.max(5.9,Math.min(14,distance+d));render()};
 controls.append(button('3/4 view',()=>changeCamera(.7,.30)),button('Front',()=>changeCamera(0,.16)),button('Side',()=>changeCamera(Math.PI/2,.16)),button('Top',()=>changeCamera(0,1.48,9.3)),button('＋ Zoom',()=>zoom(-.6)),button('− Zoom',()=>zoom(.6)));
 const spin=button('Auto rotate',()=>{if(raf){cancelAnimationFrame(raf);raf=0;spin.textContent='Auto rotate';spin.setAttribute('aria-pressed','false');return}
  spin.textContent='Stop rotation';spin.setAttribute('aria-pressed','true');let previous=0;
  function tick(t){if(dead||!target.isConnected){instance.dispose();return}if(previous)yaw+=Math.min(40,t-previous)*.00035;previous=t;render();raf=requestAnimationFrame(tick)}
  raf=requestAnimationFrame(tick);
 });spin.setAttribute('aria-pressed','false');controls.append(spin);
 target.append(title,note,wrap,controls,styling);
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 function init(){
  gl=canvas.getContext('webgl',{alpha:false,antialias:true,preserveDrawingBuffer:false});if(!gl)throw Error('WebGL unavailable');
  const vertex='attribute vec3 aPos,aColor;varying vec3 vColor;uniform float uYaw,uPitch,uDist,uAspect;void main(){float cy=cos(uYaw),sy=sin(uYaw),cp=cos(uPitch),sp=sin(uPitch);vec3 p=vec3(aPos.x,aPos.y-.42,aPos.z);p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);p=vec3(p.x,cp*p.y-sp*p.z,sp*p.y+cp*p.z);float z=uDist-p.z;float f=2.35*min(1.0,uAspect);gl_Position=vec4(p.x*f/uAspect,p.y*f,1.008032*z-.2008032,z);vColor=aColor;}';
  const fragment='precision mediump float;varying vec3 vColor;void main(){gl_FragColor=vec4(vColor,1.0);}';
  program=gl.createProgram();const vs=shader(gl.VERTEX_SHADER,vertex),ss=shader(gl.FRAGMENT_SHADER,fragment);gl.attachShader(program,vs);gl.attachShader(program,ss);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(ss);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  buffer=gl.createBuffer();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
 }
 function render(){
  if(dead||!gl||!program)return;
  const dpr=Math.min(root.devicePixelRatio||1,1.75),w=Math.max(1,Math.round(canvas.clientWidth*dpr)),h=Math.max(1,Math.round(canvas.clientHeight*dpr));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  gl.viewport(0,0,w,h);gl.clearColor(...(forge?.themes?.[environment]?.background||[.057,.031,.095]),1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(const [name,offset] of [['aPos',0],['aColor',12]]){const k=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(k);gl.vertexAttribPointer(k,3,gl.FLOAT,false,24,offset)}
  for(const [name,value] of [['uYaw',yaw],['uPitch',pitch],['uDist',distance],['uAspect',w/h]])gl.uniform1f(gl.getUniformLocation(program,name),value);
  gl.drawArrays(gl.TRIANGLES,0,count);
 }
 function rebuild(){if(!gl||dead||!forge)return;const model=forge.build(opts.type,opts.model,paint,design,environment);count=model.vertices.length/6;target.dataset.forgeTriangles=String(count/3);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,model.vertices,gl.STATIC_DRAW);render()}
 function dispose(){if(dead)return;dead=true;if(raf)cancelAnimationFrame(raf);raf=0;observer?.disconnect();if(gl){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext()}gl=null}
 const instance={dispose,paint(color){paint=color;rebuild()},getDesign(){return {...design}},reset(){changeCamera(.7,.30)}};
 current=instance;
 try{if(!forge)throw Error('Forge module unavailable');init();rebuild();target.dataset.forgeStatus='ready';if(root.ResizeObserver){observer=new ResizeObserver(render);observer.observe(canvas)}}catch(e){target.dataset.forgeStatus='fallback';wrap.hidden=true;controls.hidden=true;note.textContent='WebGL preview unavailable on this device. Reference image and private design settings remain usable.'}
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(dead)return;target.dataset.forgeStatus='fallback';wrap.hidden=true;controls.hidden=true;note.textContent='3D context lost. Reopen this vehicle to restore the preview.';if(raf)cancelAnimationFrame(raf);raf=0});
 canvas.addEventListener('pointerdown',e=>{drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;yaw+=(e.clientX-drag.x)*.012;pitch=Math.max(-.25,Math.min(1.48,pitch+(e.clientY-drag.y)*.009));drag.x=e.clientX;drag.y=e.clientY;render()});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>drag=null);
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?.45:-.45)},{passive:false});
 canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')yaw-=.18;else if(e.key==='ArrowRight')yaw+=.18;else if(e.key==='ArrowUp')pitch=Math.min(1.48,pitch+.1);else if(e.key==='ArrowDown')pitch=Math.max(-.25,pitch-.1);else if(e.key==='+'||e.key==='=')zoom(-.5);else if(e.key==='-')zoom(.5);else return;e.preventDefault();render()});
 return instance;
}
root.TeamJuraGarage3D=Object.freeze({mount,paint(c){current?.paint(c)},reset(){current?.reset()},dispose(){current?.dispose();current=null},getDesign(){return current?.getDesign()}});
})(window);
