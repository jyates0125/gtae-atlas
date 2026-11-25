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
 const title=E('strong','ELARIO FORGE · SIGNATURE SHOWROOM');
 const study=forge?.modelProfile?.(opts.type,opts.model);
 const note=E('small',study?'Elario original model-targeted concept · '+study.label+'. Approximate visual study; not a verified likeness, exact game mesh or modification catalog.':'Original class-based design for '+String(opts.name||'vehicle')+'. Not an exact game model or a verified modification catalogue.');
 const rights=E('p','Original Elario concept — not a scanned or official model. Not an exact game mesh or a verified in-game customization.');rights.className='j256-rights';
 target.dataset.forgeFidelity=study?'model-study':'class-concept';
 const wrap=E('div');wrap.className='j99-3d-stage j256-stage';
 const canvas=E('canvas');canvas.tabIndex=0;canvas.setAttribute('aria-label','Original 3D vehicle concept. Arrow keys rotate; plus and minus zoom. Drag to rotate.');wrap.append(canvas);
 const hud=E('div');hud.className='j256-hud';hud.setAttribute('aria-hidden','true');hud.textContent='FORGE / LIVE CONCEPT';wrap.append(hud);
 const controls=E('div');controls.className='j99-3d-controls';
 const button=(label,fn)=>{const b=E('button',label);b.type='button';b.onclick=fn;return b};
 const styling=E('details');styling.className='j256-style';styling.open=true;styling.append(E('summary','Visual concept controls · approximate, not in-game parts'));
 const fields=E('div');fields.className='j256-fields';styling.append(fields);
 let design=forge?.normalize(opts.design,String(opts.model||''))||{},paint=opts.paint||'#586478',gl=null,program=null,buffer=null,surfaceBuffer=null,count=0,vehicleStart=0,floorCount=0,stencilCount=0,reflection=true,hasStencil=false,dead=false,raf=0,observer=null,drag=null;
 let yaw=.7,pitch=.30,distance=7.9,profile=forge?.classify(opts.type,opts.model)||'touring';
 let environment=forge?.resolveTheme?.(profile,design.environment)||forge?.defaultTheme?.(profile)||'signature';
 target.dataset.forgeClass=profile;target.dataset.forgeStatus='pending';target.dataset.forgeEnvironment=environment;
 function control(label,element){const l=E('label',label);l.append(element);fields.append(l);return element}
 function select(label,values,key){const s=E('select');s.dataset.forgeControl=key;for(const [v,l] of values){const o=E('option',l);o.value=v;s.append(o)}s.value=design[key];s.onchange=()=>change({[key]:s.value});control(label,s);return s}
 function change(patch){if(!forge)return;design=forge.normalize({...design,...patch},String(opts.model||''));opts.onDesign?.({...design});rebuild();syncWorkshop()}
 if(forge?.themes){
  const scene=E('select');scene.dataset.forgeControl='environment';
  const auto=E('option','Automatic · vehicle class');auto.value='auto';scene.append(auto);
  for(const [key,theme] of Object.entries(forge.themes)){const o=E('option',theme.label);o.value=key;scene.append(o)}
  scene.value=design.environment||'auto';scene.onchange=()=>{design=forge.normalize({...design,environment:scene.value},String(opts.model||''));environment=forge.resolveTheme(profile,design.environment);target.dataset.forgeEnvironment=environment;hud.textContent='FORGE / '+forge.themes[environment].label.toUpperCase();opts.onDesign?.({...design});rebuild()};control('Showroom environment',scene);
  hud.textContent='FORGE / '+forge.themes[environment].label.toUpperCase();
 }
 const finish=select('Surface finish',[['metallic','Metallic'],['satin','Satin'],['stealth','Stealth']], 'finish');
 const accent=E('input');accent.type='color';accent.value=design.accent||'#eab56a';accent.dataset.forgeControl='accent';accent.oninput=()=>change({accent:accent.value});control('Accent RGB',accent);
 const road=['sport','touring','utility'].includes(profile);
 if(road){
  select('Wheel design',[['classic','Classic six-spoke'],['mesh','Fine twelve-spoke'],['deepdish','Deep-dish five-spoke']],'wheels');
  select('Wheel finish',[['silver','Polished silver'],['gold','Warm gold'],['black','Satin black']],'rim');
  // Legacy original artwork remains readable in older saved builds, but
  // new workshop selections use the sourced game catalogue below.
  const legacy=E('div');legacy.className='j412-legacy-livery';
  if(design.livery!=='none'){
   legacy.append(E('p','This saved design contains a legacy original studio pattern, not an in-game livery.'));
   legacy.append(button('Clear legacy studio pattern',()=>{change({livery:'none'});legacy.remove()}));
   fields.append(legacy);
  }
  select('Racing stripe',[['none','None'],['single','Single accent stripe'],['dual','Twin accent stripes']],'stripe');
 }
 // A sourced workshop choice is a planning record, never a claim that the
 // current original mesh has the Rockstar texture or an in-game unlock.
 let workshopSelect=null,workshopStatus=null,workshopApply=null;
 const workshopRows=forge?.workshopLiveries?.(String(opts.model||''))||[];
 function syncWorkshop(){
  if(!workshopSelect)return;
  const chosen=workshopRows.find(r=>r.id===design.workshopLivery);
  workshopSelect.value=chosen?.id||'none';
  workshopStatus.textContent=chosen?(chosen.stripeColor?'Source-listed workshop choice. An optional original twin-stripe approximation is available.':'Source-listed workshop choice. Exact artwork not bundled; this is a planning reference only.'):'No in-game livery reference selected. Original livery controls are independent.';
  workshopApply.disabled=!chosen?.stripeColor;
 }
 if(road&&workshopRows.length){
  const panel=E('details');panel.className='j412-workshop';panel.open=true;
  panel.append(E('summary','GTA Online workshop liveries · source reference'));
  panel.append(E('p','Actual community-recorded workshop names for this model only. Listed GTA$ prices are reference amounts; availability and unlocks may vary. Original virtual styling is separate.'));
  workshopSelect=E('select');workshopSelect.dataset.forgeControl='workshopLivery';workshopSelect.setAttribute('aria-label','GTA Online workshop livery reference');
  const blank=E('option','Not selected');blank.value='none';workshopSelect.append(blank);
  for(const row of workshopRows){const option=E('option',row.name+' · GTA,[['street','Street'],['low','Low'],['raised','Raised']], 'stance');
 if(road||profile==='marine')select(road?'Aero styling':'Deck styling',[['clean','Clean'],['sport','Sport'],['track','Track']], 'kit');
 const lights=E('input');lights.type='checkbox';lights.checked=design.lights!==false;lights.dataset.forgeControl='lights';lights.onchange=()=>change({lights:lights.checked});control('Concept lighting',lights);
 const reflectionControl=E('input');reflectionControl.type='checkbox';reflectionControl.checked=true;reflectionControl.dataset.forgeControl='reflection';reflectionControl.onchange=()=>{reflection=reflectionControl.checked;render()};control('Live floor reflection',reflectionControl);
 const changeCamera=(a,b,d=7.9)=>{yaw=a;pitch=b;distance=d;render()};
 const zoom=d=>{distance=Math.max(5.9,Math.min(14,distance+d));render()};
 controls.append(button('3/4 view',()=>changeCamera(.7,.30)),button('Front',()=>changeCamera(0,.16)),button('Side',()=>changeCamera(Math.PI/2,.16)),button('Top',()=>changeCamera(0,1.48,9.3)),button('＋ Zoom',()=>zoom(-.6)),button('− Zoom',()=>zoom(.6)));
 const spin=button('Auto rotate',()=>{if(raf){cancelAnimationFrame(raf);raf=0;spin.textContent='Auto rotate';spin.setAttribute('aria-pressed','false');return}
  spin.textContent='Stop rotation';spin.setAttribute('aria-pressed','true');let previous=0;
  function tick(t){if(dead||!target.isConnected){instance.dispose();return}if(previous)yaw+=Math.min(40,t-previous)*.00035;previous=t;render();raf=requestAnimationFrame(tick)}
  raf=requestAnimationFrame(tick);
 });spin.setAttribute('aria-pressed','false');controls.append(spin);
 target.append(title,note,rights,wrap,controls,styling);
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 function init(){
  gl=canvas.getContext('webgl',{alpha:false,antialias:true,stencil:true,preserveDrawingBuffer:false});if(!gl)throw Error('WebGL unavailable');hasStencil=gl.getParameter(gl.STENCIL_BITS)>0;if(!hasStencil){reflectionControl.checked=false;reflectionControl.disabled=true;reflectionControl.title='Stencil reflections unavailable on this device';}
  const vertex=`precision mediump float;
 attribute vec3 aPos,aColor;
 attribute vec4 aSurface;varying vec3 vColor,vPos,vNormal;varying float vMaterial;
 uniform float uYaw,uPitch,uDist,uAspect,uMirror;
 void main(){
  float cy=cos(uYaw),sy=sin(uYaw),cp=cos(uPitch),sp=sin(uPitch);
  vec3 p=vec3(aPos.x,mix(aPos.y,-aPos.y-.07,uMirror)-.42,aPos.z);
  p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);
  p=vec3(p.x,cp*p.y-sp*p.z,sp*p.y+cp*p.z);
  float z=uDist-p.z;float f=2.35*min(1.0,uAspect);
  gl_Position=vec4(p.x*f/uAspect,p.y*f,1.008032*z-.2008032,z);
  vColor=aColor;vNormal=aSurface.xyz;vMaterial=aSurface.w;vPos=aPos;
 }`;
 const fragment=`precision mediump float;
 varying vec3 vColor,vPos,vNormal;varying float vMaterial;
 uniform vec3 uEye,uFloor,uLiveryColor;
 uniform float uLivery;
 uniform float uMirror,uAlpha,uGloss,uStage;
 void main(){
  vec3 n=normalize(vNormal);vec3 v=normalize(uEye-vPos);
  if(dot(n,v)<0.0)n=-n;
  vec3 key=normalize(vec3(-.6,.9,.6));vec3 fill=normalize(vec3(.8,.3,-.55));
  vec3 h=normalize(key+v);vec3 h2=normalize(fill+v);
  float rough=mix(9.0,36.0,uGloss);
  float spec=pow(max(0.0,dot(n,h)),rough)+.45*pow(max(0.0,dot(n,h2)),rough*.72);
  float fresnel=pow(1.0-clamp(abs(dot(n,v)),0.0,1.0),3.0);
  float strip=pow(max(0.0,1.0-abs(dot(n,normalize(vec3(.42,.15,1.0))))),12.0);
  // Original painted motifs in model coordinates: the same shader is used
  // for the live body and its mirror pass. Glass, rubber and chrome stay clean.
  vec3 painted=vColor;
  if(vMaterial>.99&&uLivery>.5){
   float side=abs(vPos.x),z=vPos.z,y=vPos.y;
   float band=0.0;
   if(uLivery<1.5){band=step(.55,side)*step(.47,y)*(1.0-step(.62,y));}
   else if(uLivery<2.5){band=step(.55,side)*(1.0-step(.27,abs(z+1.5*y-.65)));}
   else if(uLivery<3.5){band=step(.52,side)*step(.38,y)*(1.0-step(.75,y))*step(.5,mod(floor((z+3.0)*3.0),2.0));}
   else if(uLivery<4.5){float chevron=abs(z+.35)-1.1*(y-.42);band=step(.48,side)*(1.0-step(.10,abs(chevron-.47)));band=max(band,step(.60,side)*(1.0-step(.045,abs(y-.47))));}
   else{band=smoothstep(.35,1.13,y)*.85;}
   painted=mix(vColor,uLiveryColor*.82,band);
  }
  vec3 light=painted+vMaterial*(spec*vec3(.38,.28,.18)+fresnel*vec3(.10,.045,.20)+strip*vec3(.12,.09,.20)*uGloss);
  light=mix(light,vColor,uStage);
  if(uMirror>.5){float fade=clamp(.85-vPos.y*.25,.25,.8);light=mix(uFloor,light,fade);}
  gl_FragColor=vec4(clamp(light,0.0,1.0),uAlpha);
 }`;
  program=gl.createProgram();const vs=shader(gl.VERTEX_SHADER,vertex),ss=shader(gl.FRAGMENT_SHADER,fragment);gl.attachShader(program,vs);gl.attachShader(program,ss);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(ss);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  buffer=gl.createBuffer();surfaceBuffer=gl.createBuffer();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
 }
 function render(){
  if(dead||!gl||!program)return;
  const dpr=Math.min(root.devicePixelRatio||1,1.75),w=Math.max(1,Math.round(canvas.clientWidth*dpr)),h=Math.max(1,Math.round(canvas.clientHeight*dpr));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  const theme=forge.themes[environment]||forge.themes.signature;
  gl.viewport(0,0,w,h);gl.clearColor(...theme.background,1);
  gl.depthMask(true);gl.colorMask(true,true,true,true);gl.stencilMask(255);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(const [name,offset] of [['aPos',0],['aColor',12]]){const k=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(k);gl.vertexAttribPointer(k,3,gl.FLOAT,false,24,offset)}
  gl.bindBuffer(gl.ARRAY_BUFFER,surfaceBuffer);
  const surface=gl.getAttribLocation(program,'aSurface');gl.enableVertexAttribArray(surface);gl.vertexAttribPointer(surface,4,gl.FLOAT,false,16,0);
  const uniform=(name,value)=>gl.uniform1f(gl.getUniformLocation(program,name),value);
  for(const [name,value] of [['uYaw',yaw],['uPitch',pitch],['uDist',distance],['uAspect',w/h],['uGloss',design.finish==='metallic'?1:design.finish==='satin'?.4:.12]])uniform(name,value);
  gl.uniform3f(gl.getUniformLocation(program,'uEye'),-Math.sin(yaw)*Math.cos(pitch)*distance,.42+Math.sin(pitch)*distance,Math.cos(yaw)*Math.cos(pitch)*distance);
  gl.uniform3fv(gl.getUniformLocation(program,'uFloor'),theme.deck);
  uniform('uLivery',['none','heritage','velocity','circuit','jura','fade'].indexOf(design.livery));
  const pigment=(design.liveryColor||'#d5aa59').slice(1).match(/../g).map(v=>parseInt(v,16)/255);
  gl.uniform3fv(gl.getUniformLocation(program,'uLiveryColor'),pigment);
  function draw(first,n,mirror=0,alpha=1,stage=0){if(n<=0)return;uniform('uMirror',mirror);uniform('uAlpha',alpha);uniform('uStage',stage);gl.drawArrays(gl.TRIANGLES,first,n)}
  const reflective=reflection&&hasStencil&&pitch>.01&&vehicleStart>0;
  if(reflective){
   // Mask reflections to the actual turntable. The reflected geometry is
   // rendered below the floor using the same live vehicle vertex buffer.
   gl.enable(gl.STENCIL_TEST);gl.stencilFunc(gl.ALWAYS,1,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.REPLACE);
   gl.colorMask(false,false,false,false);gl.depthMask(false);draw(0,stencilCount,0,1,1);
   gl.colorMask(true,true,true,true);gl.depthMask(true);gl.stencilMask(0);
   gl.stencilFunc(gl.EQUAL,1,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
   draw(vehicleStart,count-vehicleStart,1);gl.disable(gl.STENCIL_TEST);
   gl.clear(gl.DEPTH_BUFFER_BIT);
   gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
   draw(0,stencilCount,0,.50,1);draw(stencilCount,floorCount-stencilCount,0,.38,1);
   gl.disable(gl.BLEND);draw(floorCount,vehicleStart-floorCount,0,1,1);
  }else draw(0,vehicleStart,0,1,1);
  draw(vehicleStart,count-vehicleStart);
  target.dataset.forgeReflection=reflective?'active':'off';
 }
 function rebuild(){
  if(!gl||dead||!forge)return;
  const model=forge.build(opts.type,opts.model,paint,design,environment);
  count=model.vertices.length/6;vehicleStart=model.vehicleStart;floorCount=model.floorCount;stencilCount=model.stencilCount;
  if(!model.surface||model.surface.length!==count*4)throw Error('Forge surface buffer mismatch');
  target.dataset.forgeTriangles=String(count/3);target.dataset.forgeRenderer='lit-reflective';
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,model.vertices,gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,surfaceBuffer);gl.bufferData(gl.ARRAY_BUFFER,model.surface,gl.STATIC_DRAW);render()
 }
 function dispose(){if(dead)return;dead=true;if(raf)cancelAnimationFrame(raf);raf=0;observer?.disconnect();if(gl){if(buffer)gl.deleteBuffer(buffer);if(surfaceBuffer)gl.deleteBuffer(surfaceBuffer);if(program)gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext()}gl=null}
 const instance={dispose,paint(color){paint=color;rebuild()},getDesign(){return {...design}},reset(){changeCamera(.7,.30)}};
 current=instance;
 try{if(!forge)throw Error('Forge module unavailable');init();rebuild();target.dataset.forgeStatus='ready';if(root.ResizeObserver){observer=new ResizeObserver(render);observer.observe(canvas)}}catch(e){console.warn('[Forge renderer]',e.message);target.dataset.forgeStatus='fallback';wrap.hidden=true;controls.hidden=true;note.textContent='WebGL preview unavailable on this device. Reference image and private design settings remain usable.'}
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
+row.priceUSD.toLocaleString('en-US'));option.value=row.id;workshopSelect.append(option)}
  if(!workshopRows.some(r=>r.id===design.workshopLivery))design=forge.normalize({...design,workshopLivery:'none'});
  workshopSelect.onchange=()=>change({workshopLivery:workshopSelect.value});
  workshopStatus=E('p');workshopStatus.setAttribute('role','status');
  workshopApply=button('Preview original twin-stripe interpretation',()=>{
   const row=workshopRows.find(r=>r.id===design.workshopLivery);if(!row?.stripeColor)return;
   change({stripe:'dual',accent:row.stripeColor,livery:'none'});
   fields.querySelector('[data-forge-control="stripe"]').value=design.stripe;
   fields.querySelector('[data-forge-control="accent"]').value=design.accent;
   fields.querySelector('.j412-legacy-livery')?.remove();
  });
  const categories=forge.workshopCatalog(String(opts.model||''));
  const planner=E('div');planner.className='j256-fields';
  const totals=E('p');totals.setAttribute('role','status');
  function updateTotal(){
   let sum=workshopRows.find(r=>r.id===design.workshopLivery)?.priceUSD||0,selected=design.workshopLivery!=='none'?1:0;
   for(const group of categories){const option=group.options.find(o=>o.id===design.workshopOptions?.[group.key]);if(option){sum+=option.price;selected++}}
   totals.textContent=selected+' choices · GTAsource.href='./atlas-credits.html#forge-workshop-liveries';panel.append(workshopSelect,workshopStatus,workshopApply,source);styling.append(panel);syncWorkshop();
 }
 if(!workshopRows.length){
  const info=E('p',String(opts.model||'').startsWith('vi_')?'GTA VI: model-specific workshop choices have not been source-checked for this model. No GTA Online options are assumed.':'This model’s exact workshop options are not yet in the local catalogue.');
  const ref=E('a',String(opts.model||'').startsWith('vi_')?'Official GTA VI edition and mod shop information':'GTADB vehicle configurator reference');
  ref.href=String(opts.model||'').startsWith('vi_')?'https://www.rockstargames.com/VI/editions':'https://gtadb.net/gta-online/vehicle-configurator/';
  ref.target='_blank';ref.rel='noopener noreferrer';styling.append(info,ref);
 }
 if(road)select('Ride height',[['street','Street'],['low','Low'],['raised','Raised']], 'stance');
 if(road||profile==='marine')select(road?'Aero styling':'Deck styling',[['clean','Clean'],['sport','Sport'],['track','Track']], 'kit');
 const lights=E('input');lights.type='checkbox';lights.checked=design.lights!==false;lights.dataset.forgeControl='lights';lights.onchange=()=>change({lights:lights.checked});control('Concept lighting',lights);
 const reflectionControl=E('input');reflectionControl.type='checkbox';reflectionControl.checked=true;reflectionControl.dataset.forgeControl='reflection';reflectionControl.onchange=()=>{reflection=reflectionControl.checked;render()};control('Live floor reflection',reflectionControl);
 const changeCamera=(a,b,d=7.9)=>{yaw=a;pitch=b;distance=d;render()};
 const zoom=d=>{distance=Math.max(5.9,Math.min(14,distance+d));render()};
 controls.append(button('3/4 view',()=>changeCamera(.7,.30)),button('Front',()=>changeCamera(0,.16)),button('Side',()=>changeCamera(Math.PI/2,.16)),button('Top',()=>changeCamera(0,1.48,9.3)),button('＋ Zoom',()=>zoom(-.6)),button('− Zoom',()=>zoom(.6)));
 const spin=button('Auto rotate',()=>{if(raf){cancelAnimationFrame(raf);raf=0;spin.textContent='Auto rotate';spin.setAttribute('aria-pressed','false');return}
  spin.textContent='Stop rotation';spin.setAttribute('aria-pressed','true');let previous=0;
  function tick(t){if(dead||!target.isConnected){instance.dispose();return}if(previous)yaw+=Math.min(40,t-previous)*.00035;previous=t;render();raf=requestAnimationFrame(tick)}
  raf=requestAnimationFrame(tick);
 });spin.setAttribute('aria-pressed','false');controls.append(spin);
 target.append(title,note,rights,wrap,controls,styling);
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 function init(){
  gl=canvas.getContext('webgl',{alpha:false,antialias:true,stencil:true,preserveDrawingBuffer:false});if(!gl)throw Error('WebGL unavailable');hasStencil=gl.getParameter(gl.STENCIL_BITS)>0;if(!hasStencil){reflectionControl.checked=false;reflectionControl.disabled=true;reflectionControl.title='Stencil reflections unavailable on this device';}
  const vertex=`precision mediump float;
 attribute vec3 aPos,aColor;
 attribute vec4 aSurface;varying vec3 vColor,vPos,vNormal;varying float vMaterial;
 uniform float uYaw,uPitch,uDist,uAspect,uMirror;
 void main(){
  float cy=cos(uYaw),sy=sin(uYaw),cp=cos(uPitch),sp=sin(uPitch);
  vec3 p=vec3(aPos.x,mix(aPos.y,-aPos.y-.07,uMirror)-.42,aPos.z);
  p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);
  p=vec3(p.x,cp*p.y-sp*p.z,sp*p.y+cp*p.z);
  float z=uDist-p.z;float f=2.35*min(1.0,uAspect);
  gl_Position=vec4(p.x*f/uAspect,p.y*f,1.008032*z-.2008032,z);
  vColor=aColor;vNormal=aSurface.xyz;vMaterial=aSurface.w;vPos=aPos;
 }`;
 const fragment=`precision mediump float;
 varying vec3 vColor,vPos,vNormal;varying float vMaterial;
 uniform vec3 uEye,uFloor,uLiveryColor;
 uniform float uLivery;
 uniform float uMirror,uAlpha,uGloss,uStage;
 void main(){
  vec3 n=normalize(vNormal);vec3 v=normalize(uEye-vPos);
  if(dot(n,v)<0.0)n=-n;
  vec3 key=normalize(vec3(-.6,.9,.6));vec3 fill=normalize(vec3(.8,.3,-.55));
  vec3 h=normalize(key+v);vec3 h2=normalize(fill+v);
  float rough=mix(9.0,36.0,uGloss);
  float spec=pow(max(0.0,dot(n,h)),rough)+.45*pow(max(0.0,dot(n,h2)),rough*.72);
  float fresnel=pow(1.0-clamp(abs(dot(n,v)),0.0,1.0),3.0);
  float strip=pow(max(0.0,1.0-abs(dot(n,normalize(vec3(.42,.15,1.0))))),12.0);
  // Original painted motifs in model coordinates: the same shader is used
  // for the live body and its mirror pass. Glass, rubber and chrome stay clean.
  vec3 painted=vColor;
  if(vMaterial>.99&&uLivery>.5){
   float side=abs(vPos.x),z=vPos.z,y=vPos.y;
   float band=0.0;
   if(uLivery<1.5){band=step(.55,side)*step(.47,y)*(1.0-step(.62,y));}
   else if(uLivery<2.5){band=step(.55,side)*(1.0-step(.27,abs(z+1.5*y-.65)));}
   else if(uLivery<3.5){band=step(.52,side)*step(.38,y)*(1.0-step(.75,y))*step(.5,mod(floor((z+3.0)*3.0),2.0));}
   else if(uLivery<4.5){float chevron=abs(z+.35)-1.1*(y-.42);band=step(.48,side)*(1.0-step(.10,abs(chevron-.47)));band=max(band,step(.60,side)*(1.0-step(.045,abs(y-.47))));}
   else{band=smoothstep(.35,1.13,y)*.85;}
   painted=mix(vColor,uLiveryColor*.82,band);
  }
  vec3 light=painted+vMaterial*(spec*vec3(.38,.28,.18)+fresnel*vec3(.10,.045,.20)+strip*vec3(.12,.09,.20)*uGloss);
  light=mix(light,vColor,uStage);
  if(uMirror>.5){float fade=clamp(.85-vPos.y*.25,.25,.8);light=mix(uFloor,light,fade);}
  gl_FragColor=vec4(clamp(light,0.0,1.0),uAlpha);
 }`;
  program=gl.createProgram();const vs=shader(gl.VERTEX_SHADER,vertex),ss=shader(gl.FRAGMENT_SHADER,fragment);gl.attachShader(program,vs);gl.attachShader(program,ss);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(ss);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  buffer=gl.createBuffer();surfaceBuffer=gl.createBuffer();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
 }
 function render(){
  if(dead||!gl||!program)return;
  const dpr=Math.min(root.devicePixelRatio||1,1.75),w=Math.max(1,Math.round(canvas.clientWidth*dpr)),h=Math.max(1,Math.round(canvas.clientHeight*dpr));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  const theme=forge.themes[environment]||forge.themes.signature;
  gl.viewport(0,0,w,h);gl.clearColor(...theme.background,1);
  gl.depthMask(true);gl.colorMask(true,true,true,true);gl.stencilMask(255);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(const [name,offset] of [['aPos',0],['aColor',12]]){const k=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(k);gl.vertexAttribPointer(k,3,gl.FLOAT,false,24,offset)}
  gl.bindBuffer(gl.ARRAY_BUFFER,surfaceBuffer);
  const surface=gl.getAttribLocation(program,'aSurface');gl.enableVertexAttribArray(surface);gl.vertexAttribPointer(surface,4,gl.FLOAT,false,16,0);
  const uniform=(name,value)=>gl.uniform1f(gl.getUniformLocation(program,name),value);
  for(const [name,value] of [['uYaw',yaw],['uPitch',pitch],['uDist',distance],['uAspect',w/h],['uGloss',design.finish==='metallic'?1:design.finish==='satin'?.4:.12]])uniform(name,value);
  gl.uniform3f(gl.getUniformLocation(program,'uEye'),-Math.sin(yaw)*Math.cos(pitch)*distance,.42+Math.sin(pitch)*distance,Math.cos(yaw)*Math.cos(pitch)*distance);
  gl.uniform3fv(gl.getUniformLocation(program,'uFloor'),theme.deck);
  uniform('uLivery',['none','heritage','velocity','circuit','jura','fade'].indexOf(design.livery));
  const pigment=(design.liveryColor||'#d5aa59').slice(1).match(/../g).map(v=>parseInt(v,16)/255);
  gl.uniform3fv(gl.getUniformLocation(program,'uLiveryColor'),pigment);
  function draw(first,n,mirror=0,alpha=1,stage=0){if(n<=0)return;uniform('uMirror',mirror);uniform('uAlpha',alpha);uniform('uStage',stage);gl.drawArrays(gl.TRIANGLES,first,n)}
  const reflective=reflection&&hasStencil&&pitch>.01&&vehicleStart>0;
  if(reflective){
   // Mask reflections to the actual turntable. The reflected geometry is
   // rendered below the floor using the same live vehicle vertex buffer.
   gl.enable(gl.STENCIL_TEST);gl.stencilFunc(gl.ALWAYS,1,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.REPLACE);
   gl.colorMask(false,false,false,false);gl.depthMask(false);draw(0,stencilCount,0,1,1);
   gl.colorMask(true,true,true,true);gl.depthMask(true);gl.stencilMask(0);
   gl.stencilFunc(gl.EQUAL,1,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
   draw(vehicleStart,count-vehicleStart,1);gl.disable(gl.STENCIL_TEST);
   gl.clear(gl.DEPTH_BUFFER_BIT);
   gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
   draw(0,stencilCount,0,.50,1);draw(stencilCount,floorCount-stencilCount,0,.38,1);
   gl.disable(gl.BLEND);draw(floorCount,vehicleStart-floorCount,0,1,1);
  }else draw(0,vehicleStart,0,1,1);
  draw(vehicleStart,count-vehicleStart);
  target.dataset.forgeReflection=reflective?'active':'off';
 }
 function rebuild(){
  if(!gl||dead||!forge)return;
  const model=forge.build(opts.type,opts.model,paint,design,environment);
  count=model.vertices.length/6;vehicleStart=model.vehicleStart;floorCount=model.floorCount;stencilCount=model.stencilCount;
  if(!model.surface||model.surface.length!==count*4)throw Error('Forge surface buffer mismatch');
  target.dataset.forgeTriangles=String(count/3);target.dataset.forgeRenderer='lit-reflective';
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,model.vertices,gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,surfaceBuffer);gl.bufferData(gl.ARRAY_BUFFER,model.surface,gl.STATIC_DRAW);render()
 }
 function dispose(){if(dead)return;dead=true;if(raf)cancelAnimationFrame(raf);raf=0;observer?.disconnect();if(gl){if(buffer)gl.deleteBuffer(buffer);if(surfaceBuffer)gl.deleteBuffer(surfaceBuffer);if(program)gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext()}gl=null}
 const instance={dispose,paint(color){paint=color;rebuild()},getDesign(){return {...design}},reset(){changeCamera(.7,.30)}};
 current=instance;
 try{if(!forge)throw Error('Forge module unavailable');init();rebuild();target.dataset.forgeStatus='ready';if(root.ResizeObserver){observer=new ResizeObserver(render);observer.observe(canvas)}}catch(e){console.warn('[Forge renderer]',e.message);target.dataset.forgeStatus='fallback';wrap.hidden=true;controls.hidden=true;note.textContent='WebGL preview unavailable on this device. Reference image and private design settings remain usable.'}
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
+sum.toLocaleString('en-US')+' sum of selected listed prices (not a quote or incremental upgrade cost).';
  }
  for(const group of categories){
   const label=E('label',group.label),select=E('select');select.dataset.workshopCategory=group.key;
   const blank=E('option','Not selected');blank.value='';select.append(blank);
   for(const row of group.options){const option=E('option',row.name+' · GTAsource.href='./atlas-credits.html#forge-workshop-liveries';panel.append(workshopSelect,workshopStatus,workshopApply,source);styling.append(panel);syncWorkshop();
 }
 if(road)select('Ride height',[['street','Street'],['low','Low'],['raised','Raised']], 'stance');
 if(road||profile==='marine')select(road?'Aero styling':'Deck styling',[['clean','Clean'],['sport','Sport'],['track','Track']], 'kit');
 const lights=E('input');lights.type='checkbox';lights.checked=design.lights!==false;lights.dataset.forgeControl='lights';lights.onchange=()=>change({lights:lights.checked});control('Concept lighting',lights);
 const reflectionControl=E('input');reflectionControl.type='checkbox';reflectionControl.checked=true;reflectionControl.dataset.forgeControl='reflection';reflectionControl.onchange=()=>{reflection=reflectionControl.checked;render()};control('Live floor reflection',reflectionControl);
 const changeCamera=(a,b,d=7.9)=>{yaw=a;pitch=b;distance=d;render()};
 const zoom=d=>{distance=Math.max(5.9,Math.min(14,distance+d));render()};
 controls.append(button('3/4 view',()=>changeCamera(.7,.30)),button('Front',()=>changeCamera(0,.16)),button('Side',()=>changeCamera(Math.PI/2,.16)),button('Top',()=>changeCamera(0,1.48,9.3)),button('＋ Zoom',()=>zoom(-.6)),button('− Zoom',()=>zoom(.6)));
 const spin=button('Auto rotate',()=>{if(raf){cancelAnimationFrame(raf);raf=0;spin.textContent='Auto rotate';spin.setAttribute('aria-pressed','false');return}
  spin.textContent='Stop rotation';spin.setAttribute('aria-pressed','true');let previous=0;
  function tick(t){if(dead||!target.isConnected){instance.dispose();return}if(previous)yaw+=Math.min(40,t-previous)*.00035;previous=t;render();raf=requestAnimationFrame(tick)}
  raf=requestAnimationFrame(tick);
 });spin.setAttribute('aria-pressed','false');controls.append(spin);
 target.append(title,note,rights,wrap,controls,styling);
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 function init(){
  gl=canvas.getContext('webgl',{alpha:false,antialias:true,stencil:true,preserveDrawingBuffer:false});if(!gl)throw Error('WebGL unavailable');hasStencil=gl.getParameter(gl.STENCIL_BITS)>0;if(!hasStencil){reflectionControl.checked=false;reflectionControl.disabled=true;reflectionControl.title='Stencil reflections unavailable on this device';}
  const vertex=`precision mediump float;
 attribute vec3 aPos,aColor;
 attribute vec4 aSurface;varying vec3 vColor,vPos,vNormal;varying float vMaterial;
 uniform float uYaw,uPitch,uDist,uAspect,uMirror;
 void main(){
  float cy=cos(uYaw),sy=sin(uYaw),cp=cos(uPitch),sp=sin(uPitch);
  vec3 p=vec3(aPos.x,mix(aPos.y,-aPos.y-.07,uMirror)-.42,aPos.z);
  p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);
  p=vec3(p.x,cp*p.y-sp*p.z,sp*p.y+cp*p.z);
  float z=uDist-p.z;float f=2.35*min(1.0,uAspect);
  gl_Position=vec4(p.x*f/uAspect,p.y*f,1.008032*z-.2008032,z);
  vColor=aColor;vNormal=aSurface.xyz;vMaterial=aSurface.w;vPos=aPos;
 }`;
 const fragment=`precision mediump float;
 varying vec3 vColor,vPos,vNormal;varying float vMaterial;
 uniform vec3 uEye,uFloor,uLiveryColor;
 uniform float uLivery;
 uniform float uMirror,uAlpha,uGloss,uStage;
 void main(){
  vec3 n=normalize(vNormal);vec3 v=normalize(uEye-vPos);
  if(dot(n,v)<0.0)n=-n;
  vec3 key=normalize(vec3(-.6,.9,.6));vec3 fill=normalize(vec3(.8,.3,-.55));
  vec3 h=normalize(key+v);vec3 h2=normalize(fill+v);
  float rough=mix(9.0,36.0,uGloss);
  float spec=pow(max(0.0,dot(n,h)),rough)+.45*pow(max(0.0,dot(n,h2)),rough*.72);
  float fresnel=pow(1.0-clamp(abs(dot(n,v)),0.0,1.0),3.0);
  float strip=pow(max(0.0,1.0-abs(dot(n,normalize(vec3(.42,.15,1.0))))),12.0);
  // Original painted motifs in model coordinates: the same shader is used
  // for the live body and its mirror pass. Glass, rubber and chrome stay clean.
  vec3 painted=vColor;
  if(vMaterial>.99&&uLivery>.5){
   float side=abs(vPos.x),z=vPos.z,y=vPos.y;
   float band=0.0;
   if(uLivery<1.5){band=step(.55,side)*step(.47,y)*(1.0-step(.62,y));}
   else if(uLivery<2.5){band=step(.55,side)*(1.0-step(.27,abs(z+1.5*y-.65)));}
   else if(uLivery<3.5){band=step(.52,side)*step(.38,y)*(1.0-step(.75,y))*step(.5,mod(floor((z+3.0)*3.0),2.0));}
   else if(uLivery<4.5){float chevron=abs(z+.35)-1.1*(y-.42);band=step(.48,side)*(1.0-step(.10,abs(chevron-.47)));band=max(band,step(.60,side)*(1.0-step(.045,abs(y-.47))));}
   else{band=smoothstep(.35,1.13,y)*.85;}
   painted=mix(vColor,uLiveryColor*.82,band);
  }
  vec3 light=painted+vMaterial*(spec*vec3(.38,.28,.18)+fresnel*vec3(.10,.045,.20)+strip*vec3(.12,.09,.20)*uGloss);
  light=mix(light,vColor,uStage);
  if(uMirror>.5){float fade=clamp(.85-vPos.y*.25,.25,.8);light=mix(uFloor,light,fade);}
  gl_FragColor=vec4(clamp(light,0.0,1.0),uAlpha);
 }`;
  program=gl.createProgram();const vs=shader(gl.VERTEX_SHADER,vertex),ss=shader(gl.FRAGMENT_SHADER,fragment);gl.attachShader(program,vs);gl.attachShader(program,ss);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(ss);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  buffer=gl.createBuffer();surfaceBuffer=gl.createBuffer();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
 }
 function render(){
  if(dead||!gl||!program)return;
  const dpr=Math.min(root.devicePixelRatio||1,1.75),w=Math.max(1,Math.round(canvas.clientWidth*dpr)),h=Math.max(1,Math.round(canvas.clientHeight*dpr));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  const theme=forge.themes[environment]||forge.themes.signature;
  gl.viewport(0,0,w,h);gl.clearColor(...theme.background,1);
  gl.depthMask(true);gl.colorMask(true,true,true,true);gl.stencilMask(255);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(const [name,offset] of [['aPos',0],['aColor',12]]){const k=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(k);gl.vertexAttribPointer(k,3,gl.FLOAT,false,24,offset)}
  gl.bindBuffer(gl.ARRAY_BUFFER,surfaceBuffer);
  const surface=gl.getAttribLocation(program,'aSurface');gl.enableVertexAttribArray(surface);gl.vertexAttribPointer(surface,4,gl.FLOAT,false,16,0);
  const uniform=(name,value)=>gl.uniform1f(gl.getUniformLocation(program,name),value);
  for(const [name,value] of [['uYaw',yaw],['uPitch',pitch],['uDist',distance],['uAspect',w/h],['uGloss',design.finish==='metallic'?1:design.finish==='satin'?.4:.12]])uniform(name,value);
  gl.uniform3f(gl.getUniformLocation(program,'uEye'),-Math.sin(yaw)*Math.cos(pitch)*distance,.42+Math.sin(pitch)*distance,Math.cos(yaw)*Math.cos(pitch)*distance);
  gl.uniform3fv(gl.getUniformLocation(program,'uFloor'),theme.deck);
  uniform('uLivery',['none','heritage','velocity','circuit','jura','fade'].indexOf(design.livery));
  const pigment=(design.liveryColor||'#d5aa59').slice(1).match(/../g).map(v=>parseInt(v,16)/255);
  gl.uniform3fv(gl.getUniformLocation(program,'uLiveryColor'),pigment);
  function draw(first,n,mirror=0,alpha=1,stage=0){if(n<=0)return;uniform('uMirror',mirror);uniform('uAlpha',alpha);uniform('uStage',stage);gl.drawArrays(gl.TRIANGLES,first,n)}
  const reflective=reflection&&hasStencil&&pitch>.01&&vehicleStart>0;
  if(reflective){
   // Mask reflections to the actual turntable. The reflected geometry is
   // rendered below the floor using the same live vehicle vertex buffer.
   gl.enable(gl.STENCIL_TEST);gl.stencilFunc(gl.ALWAYS,1,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.REPLACE);
   gl.colorMask(false,false,false,false);gl.depthMask(false);draw(0,stencilCount,0,1,1);
   gl.colorMask(true,true,true,true);gl.depthMask(true);gl.stencilMask(0);
   gl.stencilFunc(gl.EQUAL,1,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
   draw(vehicleStart,count-vehicleStart,1);gl.disable(gl.STENCIL_TEST);
   gl.clear(gl.DEPTH_BUFFER_BIT);
   gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
   draw(0,stencilCount,0,.50,1);draw(stencilCount,floorCount-stencilCount,0,.38,1);
   gl.disable(gl.BLEND);draw(floorCount,vehicleStart-floorCount,0,1,1);
  }else draw(0,vehicleStart,0,1,1);
  draw(vehicleStart,count-vehicleStart);
  target.dataset.forgeReflection=reflective?'active':'off';
 }
 function rebuild(){
  if(!gl||dead||!forge)return;
  const model=forge.build(opts.type,opts.model,paint,design,environment);
  count=model.vertices.length/6;vehicleStart=model.vehicleStart;floorCount=model.floorCount;stencilCount=model.stencilCount;
  if(!model.surface||model.surface.length!==count*4)throw Error('Forge surface buffer mismatch');
  target.dataset.forgeTriangles=String(count/3);target.dataset.forgeRenderer='lit-reflective';
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,model.vertices,gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,surfaceBuffer);gl.bufferData(gl.ARRAY_BUFFER,model.surface,gl.STATIC_DRAW);render()
 }
 function dispose(){if(dead)return;dead=true;if(raf)cancelAnimationFrame(raf);raf=0;observer?.disconnect();if(gl){if(buffer)gl.deleteBuffer(buffer);if(surfaceBuffer)gl.deleteBuffer(surfaceBuffer);if(program)gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext()}gl=null}
 const instance={dispose,paint(color){paint=color;rebuild()},getDesign(){return {...design}},reset(){changeCamera(.7,.30)}};
 current=instance;
 try{if(!forge)throw Error('Forge module unavailable');init();rebuild();target.dataset.forgeStatus='ready';if(root.ResizeObserver){observer=new ResizeObserver(render);observer.observe(canvas)}}catch(e){console.warn('[Forge renderer]',e.message);target.dataset.forgeStatus='fallback';wrap.hidden=true;controls.hidden=true;note.textContent='WebGL preview unavailable on this device. Reference image and private design settings remain usable.'}
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
+row.price.toLocaleString('en-US')+(row.condition?' · '+row.condition:''));option.value=row.id;select.append(option)}
   select.value=design.workshopOptions?.[group.key]||'';
   select.onchange=()=>{change({workshopOptions:{...design.workshopOptions,[group.key]:select.value}});updateTotal()};
   label.append(select);planner.append(label);
  }
  workshopSelect.addEventListener('change',updateTotal);
  panel.append(planner,totals,E('p','Horns, neon, paint colors, wheel types and colors, and tire smoke: see linked reference. Some cosmetic options are recorded only; not every part has an approved 3D asset.'));updateTotal();
  const source=E('a','Workshop sources & credits');source.href='./atlas-credits.html#forge-workshop-liveries';panel.append(workshopSelect,workshopStatus,workshopApply,source);styling.append(panel);syncWorkshop();
 }
 if(road)select('Ride height',[['street','Street'],['low','Low'],['raised','Raised']], 'stance');
 if(road||profile==='marine')select(road?'Aero styling':'Deck styling',[['clean','Clean'],['sport','Sport'],['track','Track']], 'kit');
 const lights=E('input');lights.type='checkbox';lights.checked=design.lights!==false;lights.dataset.forgeControl='lights';lights.onchange=()=>change({lights:lights.checked});control('Concept lighting',lights);
 const reflectionControl=E('input');reflectionControl.type='checkbox';reflectionControl.checked=true;reflectionControl.dataset.forgeControl='reflection';reflectionControl.onchange=()=>{reflection=reflectionControl.checked;render()};control('Live floor reflection',reflectionControl);
 const changeCamera=(a,b,d=7.9)=>{yaw=a;pitch=b;distance=d;render()};
 const zoom=d=>{distance=Math.max(5.9,Math.min(14,distance+d));render()};
 controls.append(button('3/4 view',()=>changeCamera(.7,.30)),button('Front',()=>changeCamera(0,.16)),button('Side',()=>changeCamera(Math.PI/2,.16)),button('Top',()=>changeCamera(0,1.48,9.3)),button('＋ Zoom',()=>zoom(-.6)),button('− Zoom',()=>zoom(.6)));
 const spin=button('Auto rotate',()=>{if(raf){cancelAnimationFrame(raf);raf=0;spin.textContent='Auto rotate';spin.setAttribute('aria-pressed','false');return}
  spin.textContent='Stop rotation';spin.setAttribute('aria-pressed','true');let previous=0;
  function tick(t){if(dead||!target.isConnected){instance.dispose();return}if(previous)yaw+=Math.min(40,t-previous)*.00035;previous=t;render();raf=requestAnimationFrame(tick)}
  raf=requestAnimationFrame(tick);
 });spin.setAttribute('aria-pressed','false');controls.append(spin);
 target.append(title,note,rights,wrap,controls,styling);
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 function init(){
  gl=canvas.getContext('webgl',{alpha:false,antialias:true,stencil:true,preserveDrawingBuffer:false});if(!gl)throw Error('WebGL unavailable');hasStencil=gl.getParameter(gl.STENCIL_BITS)>0;if(!hasStencil){reflectionControl.checked=false;reflectionControl.disabled=true;reflectionControl.title='Stencil reflections unavailable on this device';}
  const vertex=`precision mediump float;
 attribute vec3 aPos,aColor;
 attribute vec4 aSurface;varying vec3 vColor,vPos,vNormal;varying float vMaterial;
 uniform float uYaw,uPitch,uDist,uAspect,uMirror;
 void main(){
  float cy=cos(uYaw),sy=sin(uYaw),cp=cos(uPitch),sp=sin(uPitch);
  vec3 p=vec3(aPos.x,mix(aPos.y,-aPos.y-.07,uMirror)-.42,aPos.z);
  p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);
  p=vec3(p.x,cp*p.y-sp*p.z,sp*p.y+cp*p.z);
  float z=uDist-p.z;float f=2.35*min(1.0,uAspect);
  gl_Position=vec4(p.x*f/uAspect,p.y*f,1.008032*z-.2008032,z);
  vColor=aColor;vNormal=aSurface.xyz;vMaterial=aSurface.w;vPos=aPos;
 }`;
 const fragment=`precision mediump float;
 varying vec3 vColor,vPos,vNormal;varying float vMaterial;
 uniform vec3 uEye,uFloor,uLiveryColor;
 uniform float uLivery;
 uniform float uMirror,uAlpha,uGloss,uStage;
 void main(){
  vec3 n=normalize(vNormal);vec3 v=normalize(uEye-vPos);
  if(dot(n,v)<0.0)n=-n;
  vec3 key=normalize(vec3(-.6,.9,.6));vec3 fill=normalize(vec3(.8,.3,-.55));
  vec3 h=normalize(key+v);vec3 h2=normalize(fill+v);
  float rough=mix(9.0,36.0,uGloss);
  float spec=pow(max(0.0,dot(n,h)),rough)+.45*pow(max(0.0,dot(n,h2)),rough*.72);
  float fresnel=pow(1.0-clamp(abs(dot(n,v)),0.0,1.0),3.0);
  float strip=pow(max(0.0,1.0-abs(dot(n,normalize(vec3(.42,.15,1.0))))),12.0);
  // Original painted motifs in model coordinates: the same shader is used
  // for the live body and its mirror pass. Glass, rubber and chrome stay clean.
  vec3 painted=vColor;
  if(vMaterial>.99&&uLivery>.5){
   float side=abs(vPos.x),z=vPos.z,y=vPos.y;
   float band=0.0;
   if(uLivery<1.5){band=step(.55,side)*step(.47,y)*(1.0-step(.62,y));}
   else if(uLivery<2.5){band=step(.55,side)*(1.0-step(.27,abs(z+1.5*y-.65)));}
   else if(uLivery<3.5){band=step(.52,side)*step(.38,y)*(1.0-step(.75,y))*step(.5,mod(floor((z+3.0)*3.0),2.0));}
   else if(uLivery<4.5){float chevron=abs(z+.35)-1.1*(y-.42);band=step(.48,side)*(1.0-step(.10,abs(chevron-.47)));band=max(band,step(.60,side)*(1.0-step(.045,abs(y-.47))));}
   else{band=smoothstep(.35,1.13,y)*.85;}
   painted=mix(vColor,uLiveryColor*.82,band);
  }
  vec3 light=painted+vMaterial*(spec*vec3(.38,.28,.18)+fresnel*vec3(.10,.045,.20)+strip*vec3(.12,.09,.20)*uGloss);
  light=mix(light,vColor,uStage);
  if(uMirror>.5){float fade=clamp(.85-vPos.y*.25,.25,.8);light=mix(uFloor,light,fade);}
  gl_FragColor=vec4(clamp(light,0.0,1.0),uAlpha);
 }`;
  program=gl.createProgram();const vs=shader(gl.VERTEX_SHADER,vertex),ss=shader(gl.FRAGMENT_SHADER,fragment);gl.attachShader(program,vs);gl.attachShader(program,ss);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(ss);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  buffer=gl.createBuffer();surfaceBuffer=gl.createBuffer();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
 }
 function render(){
  if(dead||!gl||!program)return;
  const dpr=Math.min(root.devicePixelRatio||1,1.75),w=Math.max(1,Math.round(canvas.clientWidth*dpr)),h=Math.max(1,Math.round(canvas.clientHeight*dpr));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  const theme=forge.themes[environment]||forge.themes.signature;
  gl.viewport(0,0,w,h);gl.clearColor(...theme.background,1);
  gl.depthMask(true);gl.colorMask(true,true,true,true);gl.stencilMask(255);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(const [name,offset] of [['aPos',0],['aColor',12]]){const k=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(k);gl.vertexAttribPointer(k,3,gl.FLOAT,false,24,offset)}
  gl.bindBuffer(gl.ARRAY_BUFFER,surfaceBuffer);
  const surface=gl.getAttribLocation(program,'aSurface');gl.enableVertexAttribArray(surface);gl.vertexAttribPointer(surface,4,gl.FLOAT,false,16,0);
  const uniform=(name,value)=>gl.uniform1f(gl.getUniformLocation(program,name),value);
  for(const [name,value] of [['uYaw',yaw],['uPitch',pitch],['uDist',distance],['uAspect',w/h],['uGloss',design.finish==='metallic'?1:design.finish==='satin'?.4:.12]])uniform(name,value);
  gl.uniform3f(gl.getUniformLocation(program,'uEye'),-Math.sin(yaw)*Math.cos(pitch)*distance,.42+Math.sin(pitch)*distance,Math.cos(yaw)*Math.cos(pitch)*distance);
  gl.uniform3fv(gl.getUniformLocation(program,'uFloor'),theme.deck);
  uniform('uLivery',['none','heritage','velocity','circuit','jura','fade'].indexOf(design.livery));
  const pigment=(design.liveryColor||'#d5aa59').slice(1).match(/../g).map(v=>parseInt(v,16)/255);
  gl.uniform3fv(gl.getUniformLocation(program,'uLiveryColor'),pigment);
  function draw(first,n,mirror=0,alpha=1,stage=0){if(n<=0)return;uniform('uMirror',mirror);uniform('uAlpha',alpha);uniform('uStage',stage);gl.drawArrays(gl.TRIANGLES,first,n)}
  const reflective=reflection&&hasStencil&&pitch>.01&&vehicleStart>0;
  if(reflective){
   // Mask reflections to the actual turntable. The reflected geometry is
   // rendered below the floor using the same live vehicle vertex buffer.
   gl.enable(gl.STENCIL_TEST);gl.stencilFunc(gl.ALWAYS,1,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.REPLACE);
   gl.colorMask(false,false,false,false);gl.depthMask(false);draw(0,stencilCount,0,1,1);
   gl.colorMask(true,true,true,true);gl.depthMask(true);gl.stencilMask(0);
   gl.stencilFunc(gl.EQUAL,1,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
   draw(vehicleStart,count-vehicleStart,1);gl.disable(gl.STENCIL_TEST);
   gl.clear(gl.DEPTH_BUFFER_BIT);
   gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
   draw(0,stencilCount,0,.50,1);draw(stencilCount,floorCount-stencilCount,0,.38,1);
   gl.disable(gl.BLEND);draw(floorCount,vehicleStart-floorCount,0,1,1);
  }else draw(0,vehicleStart,0,1,1);
  draw(vehicleStart,count-vehicleStart);
  target.dataset.forgeReflection=reflective?'active':'off';
 }
 function rebuild(){
  if(!gl||dead||!forge)return;
  const model=forge.build(opts.type,opts.model,paint,design,environment);
  count=model.vertices.length/6;vehicleStart=model.vehicleStart;floorCount=model.floorCount;stencilCount=model.stencilCount;
  if(!model.surface||model.surface.length!==count*4)throw Error('Forge surface buffer mismatch');
  target.dataset.forgeTriangles=String(count/3);target.dataset.forgeRenderer='lit-reflective';
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,model.vertices,gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,surfaceBuffer);gl.bufferData(gl.ARRAY_BUFFER,model.surface,gl.STATIC_DRAW);render()
 }
 function dispose(){if(dead)return;dead=true;if(raf)cancelAnimationFrame(raf);raf=0;observer?.disconnect();if(gl){if(buffer)gl.deleteBuffer(buffer);if(surfaceBuffer)gl.deleteBuffer(surfaceBuffer);if(program)gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext()}gl=null}
 const instance={dispose,paint(color){paint=color;rebuild()},getDesign(){return {...design}},reset(){changeCamera(.7,.30)}};
 current=instance;
 try{if(!forge)throw Error('Forge module unavailable');init();rebuild();target.dataset.forgeStatus='ready';if(root.ResizeObserver){observer=new ResizeObserver(render);observer.observe(canvas)}}catch(e){console.warn('[Forge renderer]',e.message);target.dataset.forgeStatus='fallback';wrap.hidden=true;controls.hidden=true;note.textContent='WebGL preview unavailable on this device. Reference image and private design settings remain usable.'}
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
