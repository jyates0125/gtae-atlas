/* Elario 2150 original procedural geometry. No game assets or exact model claims. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.JuraForge=api})(typeof globalThis==='undefined'?null:globalThis,function forgeFactory(){
 'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),hex=(s,fallback=[.42,.29,.65])=>typeof s==='string'&&/^#[a-f0-9]{6}$/i.test(s)?[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255):fallback;
 const defaults={finish:'metallic',accent:'#eab56a',stance:'street',kit:'sport',lights:true};
 function normalize(d){d=d&&typeof d==='object'?d:{};return{finish:['metallic','satin','stealth'].includes(d.finish)?d.finish:defaults.finish,accent:typeof d.accent==='string'&&/^#[a-f0-9]{6}$/i.test(d.accent)?d.accent.toLowerCase():defaults.accent,stance:['street','low','raised'].includes(d.stance)?d.stance:defaults.stance,kit:['clean','sport','track'].includes(d.kit)?d.kit:defaults.kit,lights:typeof d.lights==='boolean'?d.lights:defaults.lights,environment:['signature','marina','hangar','workshop'].includes(d.environment)?d.environment:'auto'}}
 function classify(type,model=''){
  const t=String(type||'').toLowerCase(),m=String(model||'').toLowerCase();
  if(/watercraft|boat|marine|submarine/.test(t)||/^(jetmax|squalo|dinghy|speeder|longfin|tropic|suntrap|seashark|marquis|tug|kosatka|avisa|kraken|submersible)/.test(m))return 'marine';
  if(/helicopter|rotorcraft/.test(t))return 'rotor';
  if(/aircraft|plane|fixed.wing/.test(t))return 'air';
  if(/truck|utility|pickup|off.road|van|suv/.test(t))return 'utility';
  if(/sport|super|coupe/.test(t))return 'sport';
  return 'touring';
 }
 const themes=Object.freeze({
  signature:Object.freeze({label:'Elario Signature',background:[.057,.031,.095],floor:[.10,.055,.17],deck:[.13,.09,.20],trim:[.30,.18,.42]}),
  marina:Object.freeze({label:'Leonida Marina',background:[.025,.08,.105],floor:[.035,.12,.16],deck:[.14,.15,.17],trim:[.10,.55,.68]}),
  hangar:Object.freeze({label:'Aviation Hangar',background:[.065,.075,.095],floor:[.12,.14,.17],deck:[.19,.20,.23],trim:[.85,.68,.34]}),
  workshop:Object.freeze({label:'Midnight Workshop',background:[.045,.042,.047],floor:[.09,.09,.10],deck:[.16,.14,.15],trim:[.68,.27,.10]})
 });
 function themeFor(name){return Object.hasOwn(themes,name)?name:'signature'}
 function defaultTheme(kind){return kind==='marine'?'marina':kind==='air'||kind==='rotor'?'hangar':kind==='utility'?'workshop':'signature'}
 function resolveTheme(kind,environment){return environment==='auto'||!environment?defaultTheme(kind):themeFor(environment)}
 // Artist-authored proportions in normalized display units, NOT measured game dimensions.
 // V archetypes informed by the checked records in data/atlas-vehicle-intel.json;
 // VI studies use official named gallery subjects, with speculative shape detail.
 const profiles=Object.freeze({
  adder:{kind:'sport',shape:'round',label:'Rounded grand-tourer study',w:1.10,len:2.25,roof:1.02,cab:-.14,wheel:1.43,rad:.39,nose:.76},
  alpha:{kind:'sport',shape:'coupe',label:'Luxury coupe study',w:.99,len:2.39,roof:1.22,cab:-.24,wheel:1.52,rad:.36,nose:.94},
  buffalo:{kind:'sport',shape:'sedan',label:'Muscle sedan study',w:1.05,len:2.48,roof:1.30,cab:-.03,wheel:1.55,rad:.39,nose:.98},
  asea:{kind:'touring',shape:'sedan',label:'Compact sedan study',w:.87,len:2.12,roof:1.32,cab:.05,wheel:1.30,rad:.33,nose:.90},
  regina:{kind:'touring',shape:'wagon',label:'Long-roof wagon study',w:.94,len:2.48,roof:1.42,cab:-.20,wheel:1.48,rad:.36,nose:.95},
  rebel:{kind:'utility',shape:'pickup',label:'Rugged pickup study',w:1.02,len:2.37,roof:1.51,cab:.18,wheel:1.60,rad:.46,nose:.91},
  riata:{kind:'utility',shape:'pickup',label:'Raised vintage pickup study',w:1.13,len:2.50,roof:1.57,cab:.26,wheel:1.62,rad:.49,nose:.97},
  aleutian:{kind:'utility',shape:'wagon',label:'Full-size SUV study',w:1.15,len:2.54,roof:1.66,cab:-.16,wheel:1.60,rad:.43,nose:.99},
  rocoto:{kind:'utility',shape:'wagon',label:'Rounded luxury SUV study',w:1.06,len:2.32,roof:1.51,cab:-.03,wheel:1.49,rad:.40,nose:.82},
  jetmax:{kind:'marine',shape:'powerboat',label:'Sleek performance watercraft study',w:.90,len:1.04,cab:.22},
  squalo:{kind:'marine',shape:'powerboat',label:'Classic powerboat study',w:1.05,len:.96,cab:-.08},
  vi_cheetah95:{kind:'sport',shape:'coupe',label:'1990s coupe visual study',w:1.10,len:2.28,roof:1.04,cab:-.26,wheel:1.43,rad:.38,nose:.78},
  vi_stanier55:{kind:'touring',shape:'sedan',label:'1950s sedan visual study',w:1.04,len:2.57,roof:1.38,cab:-.14,wheel:1.62,rad:.40,nose:1.02},
  vi_dominator67_buggy:{kind:'utility',shape:'buggy',label:'Off-road buggy visual study',w:1.06,len:2.21,roof:1.45,cab:.10,wheel:1.55,rad:.48,nose:.91},
  vi_squalo:{kind:'marine',shape:'powerboat',label:'Leonida powerboat visual study',w:1.02,len:1.01,cab:.10}
 });
 function modelProfile(type,model){const id=String(model||'').toLowerCase();const p=Object.hasOwn(profiles,id)?profiles[id]:null;return p&&p.kind===classify(type,id)?p:null}
 function build(type,model,paint,settings,environment){
  const kind=classify(type,model),d=normalize(settings),base=hex(paint),accent=hex(d.accent),glass=[.12,.24,.34],dark=[.07,.085,.13],rubber=[.045,.05,.065],chrome=[.56,.64,.73],data=[];
  const theme=themes[resolveTheme(kind,environment||d.environment)],profile=modelProfile(type,model);
  const tint=(c,k)=>c.map(v=>clamp(v*k,0,1));
  const blend=(a,b,f)=>a.map((v,i)=>v*(1-f)+b[i]*f);
  let transform=null;
  function tri(a,b,c,col,emissive=false){
   if(transform){a=transform(a);b=transform(b);c=transform(c)}
   const u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n);if(l<1e-7)return;
   const ny=Math.abs(n[1]/l),light=Math.abs((n[0]*.37+n[1]*.86+n[2]*.35)/l);
   const factor=emissive?1: .53+.46*light+.15*ny;
   const c2=tint(col,factor);
   for(const p of [a,b,c])data.push(...p,...c2);
  }
  const quad=(a,b,c,e,col,em=false)=>{tri(a,b,c,col,em);tri(a,c,e,col,em)};
  function box(x,y,z,w,h,l,col,em=false){const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,f=z-l/2,g=z+l/2;
   const p=[[a,c,f],[b,c,f],[b,e,f],[a,e,f],[a,c,g],[b,c,g],[b,e,g],[a,e,g]];
   for(const q of [[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]])quad(...q.map(i=>p[i]),col,em);
  }
  // Sculpted octagonal/elliptical cross sections; forward axis +Z.
  const rounded=[[-.72,-1],[.72,-1],[1,-.45],[1,.45],[.72,1],[-.72,1],[-1,.45],[-1,-.45]];
  const hull=[[-.04,-1],[.04,-1],[.82,-.48],[1,.35],[.76,1],[-.76,1],[-1,.35],[-.82,-.48]];
  function loft(rows,col,shape=rounded){
   const rings=rows.map(([z,w,y,h])=>shape.map(([x,v])=>[x*w,y+v*h,z]));
   for(let i=0;i<rings.length-1;i++)for(let j=0;j<shape.length;j++){let k=(j+1)%shape.length;quad(rings[i][j],rings[i][k],rings[i+1][k],rings[i+1][j],col)}
   for(const ring of [rings[0],rings.at(-1)])for(let i=1;i<ring.length-1;i++)tri(ring[0],ring[i],ring[i+1],col);
  }
  const circle=(n)=>Array.from({length:n},(_,i)=>[Math.cos(i*2*Math.PI/n),Math.sin(i*2*Math.PI/n)]);
  function disc(y,r,col){const c=circle(64);for(let i=0;i<c.length;i++){const a=c[i],b=c[(i+1)%c.length];tri([0,y,0],[a[0]*r,y,a[1]*r],[b[0]*r,y,b[1]*r],col,true)}}
  function ring(y,r,w,col){const c=circle(64);for(let i=0;i<c.length;i++){const a=c[i],b=c[(i+1)%c.length];quad([a[0]*r,y,a[1]*r],[b[0]*r,y,b[1]*r],[b[0]*(r-w),y,b[1]*(r-w)],[a[0]*(r-w),y,a[1]*(r-w)],col,true)}}
  disc(-.06,3.42,theme.floor);disc(-.035,3.28,theme.deck);ring(-.025,3.27,.025,accent);ring(-.02,2.93,.024,theme.trim);ring(-.015,2.31,.012,tint(theme.trim,.65));
  // Original low-profile set dressing: visible from orbit and top cameras without occluding the vehicle.
  const env=resolveTheme(kind,environment||d.environment);
  if(env==='marina'){
   for(const x of [-2.85,2.85]){box(x,.025,0,.42,.10,2.7,theme.deck);for(const z of [-1.1,0,1.1]){box(x,.10,z,.16,.21,.16,chrome);box(x,.22,z,.18,.035,.18,theme.trim,true)}}
   for(let n=-3;n<=3;n++){box(n*.36,-.01,2.92,.22,.012,.07,theme.trim,true);box(n*.36,-.01,-2.92,.22,.012,.07,theme.trim,true)}
  }else if(env==='hangar'){
   for(const x of [-2.97,2.97])for(const z of [-.95,0,.95])box(x,.015,z,.12,.045,.54,theme.trim,true);
   for(const z of [-3.04,3.04])box(0,.008,z,1.65,.025,.08,theme.trim,true);
  }else if(env==='workshop'){
   for(const x of [-2.88,2.88])for(const z of [-1,0,1]){box(x,.025,z,.27,.08,.52,dark);box(x,.07,z,.21,.025,.42,theme.trim,true)}
  }else{
   for(let i=0;i<8;i++){const a=i*Math.PI/4;box(Math.cos(a)*3.1,.018,Math.sin(a)*3.1,.16,.05,.16,theme.trim,true)}
  }
  for(let n=-3;n<=3;n++){const len=Math.sqrt(Math.max(0,3.15**2-(n*.75)**2));box(n*.75,-.012,0,.009,.004,2*len,[.22,.13,.31]);box(0,-.011,n*.75,2*len,.004,.009,[.22,.13,.31])}
  const shell=d.finish==='stealth'?blend(base,[.11,.12,.17],.48):d.finish==='satin'?tint(base,.80):blend(base,[.58,.64,.78],.11);
  const lamp=d.lights?[.73,.94,1]:[.20,.23,.27],tail=d.lights?[1,.12,.24]:[.32,.09,.12];
  if(kind==='marine'){
   if(profile)transform=p=>[p[0]*profile.w,p[1],p[2]*profile.len+(p[1]>.88?profile.cab*Math.min(1,(p[1]-.88)*4):0)];
   loft([[-2.58,.67,.36,.17],[-2.28,.92,.43,.28],[-1.35,1.01,.46,.32],[.38,.98,.46,.32],[1.53,.68,.56,.25],[2.42,.12,.73,.085],[2.66,.025,.77,.025]],shell,hull);
   loft([[-2.4,.65,.72,.09],[-1.55,.88,.78,.09],[.3,.89,.79,.08],[1.55,.57,.87,.065],[2.55,.075,.83,.02]],tint(shell,1.15));
   loft([[-1.15,.71,.89,.13],[-.53,.74,.98,.16],[.26,.59,1.10,.16],[.65,.45,1.10,.11]],glass);
   for(const x of [-.40,.40]){box(x,.93,-1.46,.35,.23,.55,dark);box(x,1.16,-1.68,.36,.40,.16,tint(accent,.74));box(x,.90,-.66,.33,.15,.43,[.22,.22,.27])}
   for(const x of [-.66,.66]){box(x,.73,-2.44,.19,.13,.3,chrome);box(x,.87,-1.91,.05,.043,.86,accent,true)}
   box(0,.89,1.13,.055,.015,1.17,accent,true);
   if(d.kit==='track'){box(0,1.09,-1.96,1.44,.09,.17,accent);for(const x of [-.63,.63])box(x,.94,-1.96,.06,.28,.08,chrome)}
   if(d.lights){box(-.43,.85,1.75,.07,.065,.13,[.9,.17,.25],true);box(.43,.85,1.75,.07,.065,.13,[.16,.85,.64],true)}
  }else if(kind==='air'||kind==='rotor'){
   const rotor=kind==='rotor';
   loft(rotor?[[-2.42,.09,.76,.09],[-1.35,.18,.80,.16],[-.8,.48,.79,.43],[.15,.68,.83,.56],[1.02,.61,.88,.48],[1.71,.22,.85,.20],[1.88,.035,.86,.035]]:[[-2.63,.15,.73,.13],[-1.8,.32,.77,.33],[-.65,.52,.80,.42],[.95,.47,.80,.38],[1.9,.25,.79,.23],[2.63,.02,.79,.02]],shell,circle(14));
   loft([[.31,.43,1.04,.18],[.85,.47,1.13,.21],[1.43,.23,.99,.11]],glass,circle(12));
   if(rotor){box(0,1.43,-.1,.18,.54,.18,chrome);box(0,1.69,-.1,5.22,.05,.21,accent);box(0,1.69,-.1,.21,.05,4.74,dark);box(0,1.18,-2.21,.09,.74,.40,shell);box(.17,1.07,-2.25,.06,.89,.12,chrome);for(const x of [-.66,.66]){box(x,.15,.2,.16,.10,2.8,chrome);box(x,.36,.6,.08,.46,.09,dark);box(x,.36,-.65,.08,.46,.09,dark)}}
   else{for(const sign of [-1,1]){const a=[sign*.3,.74,.76],b=[sign*2.83,.70,-.85],c=[sign*2.66,.70,-1.13],e=[sign*.34,.74,-.8];quad(a,b,c,e,shell);quad(a.map((v,i)=>i===1?v-.10:v),e.map((v,i)=>i===1?v-.10:v),c.map((v,i)=>i===1?v-.10:v),b.map((v,i)=>i===1?v-.10:v),tint(shell,.68));quad([sign*.18,.90,-1.78],[sign*.30,.9,-2.39],[sign*1.18,.90,-2.28],[sign*1.08,.90,-2.13],accent);box(sign*2.57,.75,-.94,.18,.08,.13,lamp,true)}
    quad([-.04,.95,-2.51],[-.04,1.82,-2.32],[-.04,1.76,-1.96],[-.04,.95,-1.57],shell);quad([.04,.95,-2.51],[.04,1.82,-2.32],[.04,1.76,-1.96],[.04,.95,-1.57],shell);}
  }else{
   const truck=kind==='utility',sport=kind==='sport',shift=d.stance==='low'?-.09:d.stance==='raised'?.15:0,y=.64+shift,w=profile?.w||(truck?1.09:1.0),len=profile?.len||(truck?2.45:sport?2.22:2.30),shape=profile?.shape||'generic',cab=profile?.cab||0,nose=profile?.nose||.70;
   loft([[-len,(shape==='round'?.66:.79)*w,y,.18],[-len+.22,w,y,.32],[-1.35,w*1.04,y+.01,.35],[.95,w*1.04,y+.02,.36],[len-.23,w*.91,y-.02,.27],[len,nose*w,y-.07,.14]],shell);
   const roof=profile?.roof||(truck?1.43:sport?1.10:1.28),back=shape==='wagon'?-1.91:shape==='pickup'?-.54:-1.26,topBack=shape==='wagon'?-1.70:shape==='pickup'?-.34:-.76,front=shape==='pickup'?1.10:.94;
   if(shape==='buggy'){
    for(const x of [-.67,.67]){box(x,roof/2+.44+shift,-.60,.09,roof-.48,.09,chrome);box(x,roof/2+.44+shift,.43,.09,roof-.48,.09,chrome);box(x,roof+.20+shift,-.085,.09,.09,1.12,chrome);box(x,y+.38,-.12,.40,.32,.48,dark)}
    box(0,roof+.20+shift,-.60,1.41,.09,.09,chrome);box(0,roof+.20+shift,.43,1.41,.09,.09,chrome);
   }else{
    loft([[back+cab,.80*w,y+.36,.12],[topBack+cab,.76*w,roof+shift,.20],[.34+cab,.79*w,roof+shift,.2],[front+cab,.72*w,y+.37,.13]],glass);
    loft([[topBack+cab,.75*w,roof+shift+.17,.04],[.32+cab,.78*w,roof+shift+.17,.04],[.53+cab,.67*w,roof+shift+.10,.04]],shell);
    if(shape==='pickup'){box(0,y+.34,-1.46,1.43*w,.055,1.28,dark);for(const x of [-.85*w,.85*w])box(x,y+.40,-1.46,.09,.13,1.40,shell);box(0,y+.40,-2.08,1.75*w,.15,.10,shell)}
    if(shape==='wagon'||shape==='sedan'){for(const x of [-.77*w,.77*w])box(x,roof+shift-.06,-.13+cab,.042,.29,.055,dark)}
   }
   // Wheel arch lips, ventilated rims and radial spokes.
   const rad=profile?.rad||(truck?.43:.37);const wheelZ=profile?.wheel||(truck?1.53:1.39);
   for(const x of [-w,w])for(const z of [-wheelZ,wheelZ]){
    const side=x>0?1:-1,mid=rad+.015,axis=x+side*.045,segments=32;
    const at=(a,r,dx)=>[axis+dx,mid+Math.cos(a)*r,z+Math.sin(a)*r];
    for(let i=0;i<segments;i++){const a=i*Math.PI*2/segments,b=(i+1)*Math.PI*2/segments;
     quad(at(a,rad,-.17),at(b,rad,-.17),at(b,rad,.17),at(a,rad,.17),rubber);
     for(const s of [-.17,.17]){quad(at(a,rad,s),at(b,rad,s),at(b,rad*.71,s),at(a,rad*.71,s),rubber);quad(at(a,rad*.71,s),at(b,rad*.71,s),at(b,rad*.62,s+.004*side),at(a,rad*.62,s+.004*side),chrome)}
     tri([axis+side*.165,mid,z],at(a,rad*.60,side*.165),at(b,rad*.60,side*.165),dark);
    }
    for(let i=0;i<6;i++){const a=i*Math.PI/3;quad(at(a-.07,rad*.62,side*.183),at(a+.07,rad*.62,side*.183),at(a+.17,rad*.16,side*.183),at(a-.17,rad*.16,side*.183),chrome)}
    box(axis+side*.189,mid,z,.022,.12,.12,accent);
    for(let i=0;i<14;i++){const a=i*Math.PI/14,b=(i+1)*Math.PI/14;quad(at(a-Math.PI/2,rad+.065,side*.04),at(b-Math.PI/2,rad+.065,side*.04),at(b-Math.PI/2,rad+.085,side*.04),at(a-Math.PI/2,rad+.085,side*.04),shell)}
   }
   for(const side of [-1,1]){box(side*.67*w,y+.07,len-.006,.31,.08,.06,lamp,true);box(side*.69*w,y+.13,-len+.008,.30,.09,.07,tail,true);box(side*w*.97,y-.13,0,.07,.10,2.0,accent,true);box(side*.83,y+.55,.5,.20,.10,.28,shell)}
   box(0,y-.13,len-.002,.90,.14,.07,dark);box(0,y-.14,-len+.02,.84,.14,.08,dark);
   for(let i=-3;i<=3;i++)box(i*.11,y-.13,len+.04,.016,.11,.02,chrome);
   if(d.kit!=='clean'){box(0,y-.27,len-.13,1.87*w,.07,.45,dark);box(0,y-.26,-len+.13,1.76*w,.07,.34,dark)}
   if(d.kit==='track'){box(0,y+.62,-len+.52,1.81*w,.075,.44,accent);for(const x of [-.59,.59])box(x,y+.40,-len+.52,.08,.47,.09,dark)}
   if(d.lights){for(const side of [-1,1])box(side*.73,.09,0,.08,.015,2.7,accent,true)}
  }
  return{kind,vertices:new Float32Array(data),settings:d,profile:profile?.label||null};
 }
 return Object.freeze({normalize,classify,build,themes,themeFor,defaultTheme,resolveTheme,modelProfile});
});
