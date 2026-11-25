import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
const stage=document.getElementById('stage'),status=document.getElementById('status'),paint=document.getElementById('paint'),finish=document.getElementById('finish'),mirror=document.getElementById('mirror');
let renderer,scene,camera,controls,floor,matte,observer,disposed=false,car,materials=[];
function render(){if(!disposed&&renderer)renderer.render(scene,camera)}
function resize(){if(disposed||!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();render()}
function update(){for(const m of materials){m.color.set(paint.value);const settings={metallic:[.65,.24,1,.06],gloss:[.12,.18,1,.04],satin:[.5,.48,.25,.3],matte:[.05,.85,0,.6]}[finish.value];[m.metalness,m.roughness,m.clearcoat,m.clearcoatRoughness]=settings;m.needsUpdate=true}render()}
function dispose(){if(disposed)return;disposed=true;observer?.disconnect();controls?.dispose();scene?.traverse(o=>{o.geometry?.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material]))m?.dispose()});floor?.getRenderTarget()?.dispose();scene?.environment?.dispose();renderer?.dispose()}
try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;stage.append(renderer.domElement);
 scene=new THREE.Scene();scene.background=new THREE.Color('#181020');
 camera=new THREE.PerspectiveCamera(38,1,.1,80);camera.position.set(6.4,3.2,7.1);
 controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.7,0);controls.minDistance=4;controls.maxDistance=17;controls.maxPolarAngle=Math.PI*.49;controls.addEventListener('change',render);controls.update();
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xfff0df,0x4b315d,1.1));
 for(const [color,intensity,pos] of [[0xffe1b7,3.6,[4,6,5]],[0x9ca9ff,2.4,[-4,3,-4]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.set(...pos);scene.add(light)}
 floor=new Reflector(new THREE.CircleGeometry(8,96),{color:0x62526e,textureWidth:1024,textureHeight:1024});floor.rotation.x=-Math.PI/2;floor.position.y=-.025;scene.add(floor);
 matte=new THREE.Mesh(new THREE.CircleGeometry(8,96),new THREE.MeshStandardMaterial({color:0x2b2235,roughness:.95}));matte.rotation.x=-Math.PI/2;matte.position.y=-.02;matte.visible=false;scene.add(matte);
 observer=new ResizeObserver(resize);observer.observe(stage);resize();
 const gltf=await new GLTFLoader().loadAsync('./wedge.glb');
 car=gltf.scene;let triangles=0;const map=new Map();
 car.traverse(o=>{if(!o.isMesh)return;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;
 const convert=m=>{if(!/Paint|LiquidGraphite/.test(m.name))return m;if(!map.has(m)){const replacement=new THREE.MeshPhysicalMaterial({name:m.name,color:m.color,metalness:.65,roughness:.24,clearcoat:1,clearcoatRoughness:.06,map:m.map,normalMap:m.normalMap});map.set(m,replacement);materials.push(replacement)}return map.get(m)};
 o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);
 });
 if(!materials.length||triangles<50000)throw Error('Unexpected asset structure');
 scene.add(car);const bounds=new THREE.Box3().setFromObject(car);car.position.y-=bounds.min.y;
 stage.dataset.triangles=String(Math.round(triangles));stage.dataset.paintMaterials=String(materials.length);
 paint.addEventListener('input',update);finish.addEventListener('change',update);mirror.addEventListener('change',()=>{floor.visible=mirror.checked;matte.visible=!mirror.checked;render()});
 update();stage.dataset.state='ready';status.textContent=Math.round(triangles).toLocaleString('en-US')+' triangles · independent body paint materials · real-time mirror floor';
 window.addEventListener('pagehide',dispose,{once:true});
}catch(e){stage.dataset.state='error';status.textContent='3D laboratory unavailable: '+e.message;dispose();console.error(e)}
