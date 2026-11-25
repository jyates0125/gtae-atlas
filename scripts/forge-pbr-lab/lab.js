// Automotive studio benchmark. Studio softbox approach inspired by Collect Cars
// (drcollect, MIT viewer); original GLB assets retain their own licenses.
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {KTX2Loader} from 'three/addons/loaders/KTX2Loader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
const $=id=>document.getElementById(id);
const stage=$('stage'),status=$('status'),paint=$('paint'),finish=$('finish'),mirror=$('mirror'),model=$('model'),view=$('view');
const assets=Object.freeze({
 wedge:{file:'wedge.glb',name:'80s Wedge · drcollect',source:'https://github.com/drcollect/collect-cars',license:'CC BY 4.0',triangles:71240},
 fastback:{file:'fastback.glb',name:'Late-60s fastback · tevy',source:'https://tevy.dev/models/muscle-car',license:'CC0 1.0',triangles:54908}
});
let renderer,scene,camera,controls,floor,matte,observer,disposed=false,car,bounds,envTarget,ktx,sequence=0,materials=[],wheelMaterials=[],activeTextures=new Set(),keyLight,frame=0;
const label=(text)=>{status.textContent=text};
function render(){if(!disposed&&renderer)renderer.render(scene,camera)}
function requestRender(){if(!frame&&!disposed)frame=requestAnimationFrame(()=>{frame=0;render()})}
function disposeTree(root){
 const geometries=new Set(),mats=new Set(),textures=new Set();
 root?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m)continue;mats.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v)}});
 geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
}
function studioEnvironment(){
 const env=new THREE.Scene();
 const room=new THREE.Mesh(new THREE.BoxGeometry(32,20,32),new THREE.MeshBasicMaterial({color:0x100c19,side:THREE.BackSide}));room.position.y=7;env.add(room);
 const panels=[
 [4.2,8.5,5.8,0xfff4df,[0,6.5,0],[Math.PI/2,0,0]],
 [8.5,.72,4.8,0xffe1bc,[-5,1.7,0],[0,Math.PI/2,0]],
 [8.5,.62,4.2,0xe2d7ff,[5,1.8,0],[0,Math.PI/2,0]],
 [5,3,.75,0xd6baff,[0,2.3,-12],[0,0,0]],
 [6,3,1.1,0xffe1bf,[0,2.5,12],[0,Math.PI,0]]
 ];
 for(const [w,h,level,color,pos,rot] of panels){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(level),side:THREE.DoubleSide}));m.position.set(...pos);m.rotation.set(...rot);env.add(m)
 }
 const gen=new THREE.PMREMGenerator(renderer);envTarget=gen.fromScene(env,.025);gen.dispose();disposeTree(env);return envTarget.texture;
}
function radialLayer(width,depth,stops,y,order){
 const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(128,128,0,128,128,128);
 stops.forEach(([at,col])=>g.addColorStop(at,col));ctx.fillStyle=g;ctx.fillRect(0,0,256,256);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,toneMapped:false}));mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.renderOrder=order;scene.add(mesh);return mesh;
}
function frameVehicle(preset='front'){
 if(!bounds)return;const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 const dirs={front:[.68,.23,1],rear:[-.68,.23,-1],side:[1,.13,0],top:[.22,1,.40]};
 const dir=new THREE.Vector3(...dirs[preset]).normalize();
 const target=new THREE.Vector3(center.x,Math.max(size.y*.42,.32),center.z);
 const vertical=THREE.MathUtils.degToRad(camera.fov)/2,horizontal=Math.atan(Math.tan(vertical)*camera.aspect);
 // Fit the actual projected model bounds, not a fixed class-size camera.
 const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),dir).normalize(),up=new THREE.Vector3().crossVectors(dir,right).normalize();
 let distance=0;
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
  const p=new THREE.Vector3(x,y,z).sub(target),depth=p.dot(dir);
  distance=Math.max(distance,depth+Math.abs(p.dot(right))/Math.tan(horizontal)*1.12,depth+Math.abs(p.dot(up))/Math.tan(vertical)*1.24)
 }
 camera.position.copy(target).addScaledVector(dir,distance);controls.target.copy(target);controls.minDistance=Math.max(size.z*.50,2);controls.maxDistance=Math.max(distance*2.1,18);controls.update();stage.dataset.cameraView=preset;render();
}
function resize(){if(disposed||!renderer)return;const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(bounds)frameVehicle(view.value);else render()}
function update(){
 for(const m of materials){m.color.set(paint.value);const settings={metallic:[.65,.24,1,.06],gloss:[.12,.18,1,.04],satin:[.5,.48,.25,.3],matte:[.05,.85,0,.6]}[finish.value];[m.metalness,m.roughness,m.clearcoat,m.clearcoatRoughness]=settings;m.needsUpdate=true}
 requestRender()
}
function dispose(){if(disposed)return;disposed=true;sequence++;if(frame)cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();ktx?.dispose();disposeTree(scene);floor?.getRenderTarget()?.dispose();envTarget?.dispose();renderer?.dispose()}
async function load(){
 const ticket=++sequence,asset=assets[model.value];if(!asset)return;
 if(car){scene.remove(car);disposeTree(car);car=null;}bounds=null;materials=[];stage.dataset.state='loading';paint.disabled=finish.disabled=true;label('Loading local '+asset.name+'…');render();
 try{
  const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setKTX2Loader(ktx);
  const gltf=await loader.loadAsync('./'+asset.file);
  if(disposed||ticket!==sequence){disposeTree(gltf.scene);return}
  car=gltf.scene;let triangles=0;const map=new Map(),originals=new Set(),names=new Set();
  car.traverse(o=>{if(!o.isMesh)return;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;o.castShadow=true;o.receiveShadow=true;
   const convert=m=>{names.add(m.name||'(unnamed)');
    // Only known separate paint channels are editable. Preserve baked textures
    // and all unmapped materials rather than falsely repainting the entire car.
    if(!/Paint|LiquidGraphite/i.test(m.name)||model.value==='fastback'&&m.map)return m;
    if(!map.has(m)){const replacement=new THREE.MeshPhysicalMaterial({name:m.name,color:m.color,metalness:.65,roughness:.24,clearcoat:1,clearcoatRoughness:.06,map:m.map,normalMap:m.normalMap,side:m.side});map.set(m,replacement);materials.push(replacement);originals.add(m)}
    return map.get(m)
   };
   o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);
  });
  originals.forEach(m=>m.dispose());
  if(triangles<10000||Math.abs(triangles-asset.triangles)>Math.max(20,asset.triangles*.02))throw Error('Unexpected triangle count: '+triangles);
  scene.add(car);const box=new THREE.Box3().setFromObject(car);car.position.y-=box.min.y;car.updateMatrixWorld(true);bounds=new THREE.Box3().setFromObject(car);
  stage.dataset.triangles=String(Math.round(triangles));stage.dataset.paintMaterials=String(materials.length);stage.dataset.asset=model.value;stage.dataset.materialNames=JSON.stringify([...names].sort());
  $('credit').href=asset.source;$('credit').textContent=asset.name+' · '+asset.license;
  paint.disabled=finish.disabled=!materials.length;if(materials.length)update();
  frameVehicle(view.value);stage.dataset.state='ready';label(Math.round(triangles).toLocaleString('en-US')+' triangles · '+(materials.length?materials.length+' editable paint channels':'factory finish only — paint mapping needs review')+' · real-time reflection');
 }catch(e){if(ticket!==sequence||disposed)return;if(car){scene.remove(car);disposeTree(car);car=null;}stage.dataset.state='error';label('Model unavailable: '+e.message);render();console.error(e)}
}
try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.append(renderer.domElement);
 scene=new THREE.Scene();scene.background=new THREE.Color('#100b19');scene.environment=studioEnvironment();scene.environmentIntensity=1.45;
 camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(6.4,2.2,7.1);
 controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.6,0);controls.enablePan=false;controls.minDistance=3;controls.maxDistance=24;controls.maxPolarAngle=Math.PI*.49;controls.addEventListener('change',requestRender);controls.update();
 keyLight=new THREE.DirectionalLight(0xfff0df,1.8);keyLight.position.set(3.5,8,5);keyLight.castShadow=true;keyLight.shadow.mapSize.set(1024,1024);Object.assign(keyLight.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.5,far:25});keyLight.shadow.bias=-.0004;scene.add(keyLight);
 floor=new Reflector(new THREE.CircleGeometry(28,96),{color:0x34313e,clipBias:.003,textureWidth:1024,textureHeight:1024});floor.rotation.x=-Math.PI/2;floor.position.y=-.025;scene.add(floor);
 matte=new THREE.Mesh(new THREE.CircleGeometry(28,96),new THREE.MeshStandardMaterial({color:0x2b2235,roughness:.95}));matte.rotation.x=-Math.PI/2;matte.position.y=-.02;matte.receiveShadow=true;matte.visible=false;scene.add(matte);
 radialLayer(5.2,7.1,[[0,'rgba(0,0,0,.58)'],[.45,'rgba(0,0,0,.35)'],[1,'rgba(0,0,0,0)']],-.012,2);
 radialLayer(65,65,[[0,'rgba(16,11,25,0)'],[.13,'rgba(16,11,25,0)'],[.55,'rgba(16,11,25,1)'],[1,'rgba(16,11,25,1)']],-.008,3);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(15,15),new THREE.ShadowMaterial({opacity:.25}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.009;shadow.receiveShadow=true;scene.add(shadow);
 ktx=new KTX2Loader().setTranscoderPath('./node_modules/three/examples/jsm/libs/basis/').detectSupport(renderer);
 observer=new ResizeObserver(resize);observer.observe(stage);resize();
 paint.addEventListener('input',update);finish.addEventListener('change',update);mirror.addEventListener('change',()=>{floor.visible=mirror.checked;matte.visible=!mirror.checked;requestRender()});
 view.addEventListener('change',()=>frameVehicle(view.value));model.addEventListener('change',load);
 window.addEventListener('pagehide',dispose,{once:true});await load();
}catch(e){stage.dataset.state='error';label('3D laboratory unavailable: '+e.message);dispose();console.error(e)}
