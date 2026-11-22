/* Atlas Universe 10.0 — original Team Jura catalog; reference records, not gameplay claims. */
(()=>{'use strict';
const $=id=>document.getElementById(id),MODE=document.body.dataset.atlasKind||'all',LIMIT=24;
const IMAGE_ROOT='https://cdn.jsdelivr.net/gh/Stuyk/gtav-image-archive@main/',ART_CREDIT='https://github.com/Stuyk/gtav-image-archive',STORE='team-jura-atlas90-collection-v1';
const LABELS={vehicle:'Vehicle',weapon:'Weapon',character:'Character',animal:'Animal',collectible:'Collectible',business:'Business',garage:'Garage',property:'Property',landmark:'Landmark'};
const SYMBOLS={vehicle:'◆',weapon:'✦',character:'♟',animal:'✿',collectible:'◈',business:'▣',garage:'▤',property:'⌂',landmark:'◎'};
const WILDLIFE={alligator:'🐊',flamingo:'🦩',iguana:'🦎',dolphin:'🐬','sea-turtle':'🐢',shark:'🦈',cougar:'🐆',coyote:'🐺',deer:'🦌',boar:'🐗',cow:'🐄',pig:'🐖',hen:'🐔',chickenhawk:'🦅',cormorant:'🕊',rottweiler:'🐕'};
const WORLD_CODES=new Set(['story','online','vi','classic','all']);
const DEFAULT_KIND=MODE==='all'?'vehicle':MODE;
const DEFAULT_GAME=MODE==='animal'?'vi':MODE==='character'?'all':MODE==='collectible'?'story':'online';
let all=[],filtered=[],page=0,kind=DEFAULT_KIND,game=DEFAULT_GAME,group='all',query='',order='name',researchOnly=false,view='grid',compare=[],failed=[];
const make=(tag,cls,s)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(s!==undefined)e.textContent=String(s);return e};
const normalize=s=>String(s??'').trim(),slug=s=>normalize(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const searchText=value=>String(value??'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/['’]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const identityMatch=(value,s)=>{
 const n=searchText(value);
 if(!s||!n)return false;
 if(n.includes(s)||n.replace(/ /g,'')===s.replace(/ /g,''))return true;
 const words=s.split(' ');
 return words.length>1&&words.every(word=>n.split(' ').some(part=>part.startsWith(word)));
};
const recordKey=r=>String(r.id||'').split(':').pop();
const characterMatch=(r,s)=>!!s&&([r.name,...(r.aliases||[])].some(x=>identityMatch(x,s))||
 searchText(recordKey(r)).replace(/ /g,'')===s.replace(/ /g,''));
const encodeQuery=value=>encodeURIComponent(value).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
const characterHref=r=>'atlas-characters.html?game='+encodeQuery(r.scope)+(r.scope==='classic'?'&edition='+encodeQuery(r.game):'')+'&q='+encodeQuery(r.name)+'&profile='+encodeQuery(r.id)+'#mainCharacterEra';
const nice=s=>normalize(s).replace(/_mk(\d+)/g,' Mk $1').replace(/_([a-z])/g,(_,a)=>' '+a.toUpperCase()).replace(/([a-z])(\d)/g,'$1 $2').replace(/\b[a-z]/g,x=>x.toUpperCase());
const world=s=>({story:'GTA V Story',online:'GTA Online',vi:'GTA VI Story',classic:'Classic GTA',both:'GTA V + Online'})[s]||'Reference';
const isUnverified=r=>/unverified|provisional|community-tracked|pending/i.test(r.verification||'');
const image=(kind,id)=>IMAGE_ROOT+(kind==='weapon'?'weapons/weapon_':'vehicles/')+encodeURIComponent(id)+'.webp';
function weaponGroup(id){if(/knife|bat$|axe|bottle|crowbar|dagger|golfclub|hammer|hatchet|knuckle|machete|nightstick|poolcue|switchblade|wrench|flashlight/.test(id))return'Melee';if(/grenade|molotov|snowball|sticky|proximity|pipebomb|tear|smoke|petrol|hazard|fireextinguisher/.test(id))return'Throwable';if(/launcher|rpg|railgun|minigun|widowsmaker|unholy|firework/.test(id))return'Heavy';if(/sniper|marksman|precision/.test(id))return'Sniper';if(/shotgun|musket/.test(id))return'Shotgun';if(/rifle|carbine/.test(id))return'Rifle';if(/smg|pdw|machinepistol|mg$/.test(id))return'SMG / MG';if(/pistol|revolver|stungun/.test(id))return'Pistol';return'Other Weapons'}
function carGroup(id){
 // Only classify recognizable GTA V model IDs. Unknown IDs are unclassified rather than guessed.
 if(/^(buzzard|akula|annihilator|seasparrow|sparrow|cargobob|frogger|maverick|swift|valkyrie|savage|hunter|havok|supervolito|volatus|skylift)/.test(id))return'Helicopters';
 if(/^(lazer|hydra|alkonost|blimp|cuban|jet|dodo|velum|mammatus|miljet|luxor|nimbus|titan|besra|molotok|starling|pyro|rogue|nakota|seabreeze|seasparrow|bombushka|avenger|mogul|tula|streamer|duster)/.test(id))return'Planes & Aircraft';
 if(/^(squalo|dinghy|tropic|marquis|tug|jetmax|seashark|speeder|suntrap|torop|longfin|kraken|submersible|kosatka|patrolboat)/.test(id))return'Boats & Watercraft';
 if(/^(bati|akuma|faggio|bagger|vader|daemon|sovereign|hakuchou|oppressor|lectro|sanctus|nemesis|bati801|manchez|bf400|ruffian|diablous|shotaro|innovation|nightblade|vindicator|carbonrs|double|fcr|cliffhanger)/.test(id))return'Motorcycles';
 if(/^(police|ambulance|firetruk|rhino|apc|insurgent|barracks|riot|halftrack|chernobog|khanjali|barrage|technical|menacer)/.test(id))return'Emergency & Military';
 if(/^(bison|bobcat|rebel|sadler|sandking|guardian|rancher|yosemite|caracara|riata|kamacho|draugur|everon|contender|bruiser|burrito|mule|pounder|phantom|hauler|packer|benson|rumpo|speedo|slamvan|wastelander)/.test(id))return'Trucks & Utility';
 if(/^(baller|cavalcade|granger|dubsta|habanero|huntley|landstalker|novak|rebla|rocoto|seminole|serrano|toros|xls|jubilee|astron)/.test(id))return'SUVs & Off-Road';
 if(/^(adder|zentorno|emerus|entity|t20|osiris|infernus|autarch|vagner|nero|tezeract|thrax|krieger|xa21|prototipo|tyrant|reaper|fmj|turismor|cyclone|italigtb)/.test(id))return'Super';
 if(/^(banshee|coquette|jester|kuruma|elegy|sultan|feltzer|comet|pariah|calico|euros|futo|vectre|remus|cypher|growler|zr350|schlagen|jugular|neon|komoda|sugoi|penumbra|ninef)/.test(id))return'Sports & Coupes';
 if(/^(dominator|gauntlet|buffalo|ruiner|tampa|phoenix|sabregt|vigero|dukes|ellie|impaler|deviant|blade|vamos|greenwood|hotknife)/.test(id))return'Muscle';
 return'Unclassified vehicle'}
function index(profile,seed,catalog,sets,viWeapons){
 const result=[];
 for(const p of profile?.records||[])if(p.kind&&p.name)result.push({...p,verification:p.verification||'Curated index'});
 for(const r of catalog?.records||[]){if(!r?.name||!r?.kind)continue;const scope=r.game==='6'?'vi':r.mode==='story'?'story':r.mode==='both'?'both':'online';
 result.push({id:'reference:'+r.id,name:r.name,kind:r.kind,scope,group:r.group||'Reference',game:world(scope),summary:r.notes||'Reference only',sourceUrl:r.sourceUrl,verification:r.verification||'Reference index',attributes:r.attributes||{}});}
 for(const id of seed?.weapons||[]){if(!/^[a-z0-9_]+$/.test(id))continue;result.push({id:'archive:weapon:'+id,key:'weapons:'+id,name:nice(id),kind:'weapon',scope:'online',group:weaponGroup(id),image:image('weapon',id),imageCredit:ART_CREDIT,verification:'Community GTA V model archive',summary:'Pictured GTA V model reference; individual gameplay stats are not verified.'});}
 for(const id of seed?.vehicles||[]){if(!/^[a-z0-9_]+$/.test(id))continue;result.push({id:'archive:vehicle:'+id,key:'vehicles5:'+id,model:id,name:nice(id),kind:'vehicle',scope:'online',group:carGroup(id),image:image('vehicle',id),imageCredit:ART_CREDIT,verification:'Community GTA V model archive',summary:'Vehicle archive render. Prices, performance and game availability are not verified by an image.'});}
 for(const [i,r] of (seed?.vi||[]).entries()){if(!r.name)continue;result.push({id:'research:vehicle:'+i+':'+slug(r.name),name:r.name,kind:'vehicle',scope:'vi',group:r.type||'Vehicles',brand:r.brand||'',image:'',imageCredit:'',verification:'Provisional / unverified',summary:'GTA VI community roster research. An image will appear only when a GTA VI-specific source and its reuse permission are confirmed. Any generic graphic is an original Team Jura concept, not the exact vehicle.'});}
 for(const s of sets?.sets||[]){if(!s.id||!s.name)continue;const scope=s.mode==='story'?'story':s.mode==='online'?'online':'vi';result.push({id:'set:'+s.id,collectionId:s.id,name:s.name,kind:'collectible',scope,group:s.cycle||'Collection',total:s.total,summary:s.note||'Collection tracker; exact map points may not be sourced.',sourceUrl:s.sourceUrl,verification:s.verification||'Published set index'});}
 for(const r of viWeapons?.records||[]){
  if(!r?.id||!r?.name||!r?.sourceUrl)continue;
  result.push({id:'vi:weapon:'+r.id,kind:'weapon',scope:'vi',game:'GTA VI Story',
   name:r.name,group:r.group||'Weapon',summary:r.description||r.evidence||'Curated GTA VI source reference.',
   verification:r.grade||'Source-checked GTA VI weapon reference',sourceUrl:r.sourceUrl,
   image:'',imageCredit:'',aliases:['GTA VI','GTA 6',r.group||'']});
 }
 // Keep a pictured archive entry when a generic catalog index duplicates it; never merge Story into Online.
 const uniq=new Map();for(const r of result){const k=r.kind+'|'+slug(r.name)+'|'+r.scope+(r.kind==='character'&&r.scope==='classic'?'|'+slug(r.game):'');const old=uniq.get(k);
 if(old&&r.collectionId){uniq.set(k,{...old,collectionId:r.collectionId,total:r.total,sourceUrl:r.sourceUrl||old.sourceUrl});continue;}
 if(!old||(!old.image&&r.image)||(!old.key&&r.key))uniq.set(k,{...old,...r,sourceUrl:r.sourceUrl||old?.sourceUrl,attributes:r.attributes||old?.attributes});}
 return [...uniq.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
function badge(r){const id=r.id.split(':').pop().replace(/-vi|-v$/,'');if(r.kind==='animal')return WILDLIFE[id]||'✿';if(r.kind==='character')return r.name.split(' ').slice(0,2).map(x=>x[0]).join('');if(r.kind==='collectible')return /pumpkin/i.test(r.name)?'🎃':/snow/i.test(r.name)?'☃':/cards?/i.test(r.name)?'🃏':'◈';return SYMBOLS[r.kind]||'✦'}
function elarioCharacterPortrait(r,area,allowConcept=true){
 if(allowConcept && typeof r.conceptPortrait==='string' && /^art\/[a-z0-9-]+\.(?:webp|png|jpe?g)$/i.test(r.conceptPortrait)){
  const img=make('img');
  img.loading='eager';img.decoding='async';
  img.alt='Elario Studios fan concept of '+r.name;
  area.dataset.artStatus='character-concept';
  const note=area.querySelector('.u-image-note')||make('span','u-image-note');
  note.textContent='ELARIO CHARACTER CONCEPT';
  img.addEventListener('error',()=>{img.remove();elarioCharacterPortrait(r,area,false)},{once:true});
  area.append(img,note);
  img.src='./'+r.conceptPortrait;
  return;
 }
 // Cinematic world-scene fallback, honestly not an invented face or exact game portrait.
 const game=r.game||'';
 const classic=/GTA III/.test(game)?'jura157-iii-cinematic.webp':
 /Vice City Stories/.test(game)?'jura157-vcs-cinematic.webp':
 /Vice City/.test(game)?'jura157-vc-cinematic.webp':
 /San Andreas/.test(game)?'jura157-sa-cinematic.webp':
 /The Lost and Damned/.test(game)?'jura157-tlad-cinematic.webp':
 /The Ballad of Gay Tony/.test(game)?'jura157-tbogt-cinematic.webp':
 /Chinatown/.test(game)?'jura157-ctw-cinematic.webp':
 /Liberty City Stories/.test(game)?'jura157-lcs-cinematic.webp':'jura157-iv-cinematic.webp';
 const art=r.scope==='vi'?'jura155-vi.webp':r.scope==='online'?'jura155-online.webp':
 r.scope==='story'?'jura155-story.webp':classic;
 const img=make('img');img.alt='Original Elario '+world(r.scope)+' scene, not an exact portrait of '+r.name;
 img.loading='lazy';img.decoding='async';
 img.addEventListener('error',()=>img.remove(),{once:true});
 const identity=make('div','u-portrait-pending');
 identity.setAttribute('role','group');identity.setAttribute('aria-label','Individual portrait unavailable for '+r.name);
 identity.append(make('strong','',r.name),make('small','','Individual portrait pending'));
 area.append(img,identity);area.dataset.artStatus='world-scene';
 const tag=area.querySelector('.u-image-note')||make('span','u-image-note');
 tag.textContent='ELARIO CINEMATIC SCENE · NOT A PORTRAIT';area.append(tag);img.src='./art/'+art;
}
function artwork(r){
 const area=make('div','u-image u-image-'+r.kind);let hue=0;
 for(const c of r.name)hue=(hue*7+c.charCodeAt(0))%360;
 area.style.setProperty('--art-hue',String(hue)+'deg');
 if(r.kind==='character'&&r.preferConceptPortrait===true&&r.conceptPortrait){
  elarioCharacterPortrait(r,area);
 }else if(r.image){
  const img=make('img');img.alt='Sourced reference image for '+r.name;
  img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
  img.addEventListener('error',()=>{img.remove();if(r.kind==='character')elarioCharacterPortrait(r,area);else area.append(make('span','u-symbol',badge(r)))},{once:true});
  area.append(img);img.src=r.image;
 }else if(r.kind==='character')elarioCharacterPortrait(r,area);
 else area.append(make('span','u-symbol',badge(r)));
 if(!area.querySelector('.u-image-note') && isUnverified(r))area.append(make('span','u-image-note','UNVERIFIED RESEARCH'));
 else if(r.image&&!area.querySelector('.u-image-note'))area.append(make('span','u-image-note',r.scope==='vi'?'OFFICIAL RECORD · REFERENCE IMAGE':'REFERENCE ART'));
 else if(area.dataset.artStatus==='world-scene')area.append(make('span','u-image-note','ELARIO CINEMATIC SCENE · NOT A PORTRAIT'));
 if(area.dataset.artStatus==='world-scene')area.querySelector('.u-image-note')?.replaceChildren('ELARIO CINEMATIC SCENE · NOT A PORTRAIT');
 return area;
}
function own(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch{return{}}}
function toggleOwned(r,which){if(!r.key)return false;const data=own();data.schema=1;for(const key of ['owned','wishlist','note'])if(!data[key]||typeof data[key]!=='object')data[key]={};if(data[which][r.key])delete data[which][r.key];else{data[which][r.key]=true;delete data[which==='owned'?'wishlist':'owned'][r.key]}try{localStorage.setItem(STORE,JSON.stringify(data));return true}catch{return false}}
function scopeMatch(r){return game==='all'||r.scope===game||(r.scope==='both'&&(game==='story'||game==='online'))}
function match(){const q=query.toLowerCase(),s=searchText(query);
 const scoped=all.filter(x=>(kind==='all'||x.kind===kind)&&scopeMatch(x)&&(group==='all'||x.group===group)&&(!researchOnly||isUnverified(x)));
 const direct=kind==='character'&&s?scoped.filter(x=>characterMatch(x,s)):[];
 let r=direct.length?direct:scoped.filter(x=>!q||
  (x.kind==='character'&&characterMatch(x,s))||
  [x.name,world(x.scope),x.group,x.brand,x.kind,x.summary,x.game,...(x.aliases||[])].join(' ').toLowerCase().includes(q));
 const compareBy=order==='kind'?((a,b)=>a.kind.localeCompare(b.kind)||a.name.localeCompare(b.name)):order==='game'?((a,b)=>a.scope.localeCompare(b.scope)||a.name.localeCompare(b.name)):order==='name-desc'?((a,b)=>b.name.localeCompare(a.name)):((a,b)=>a.name.localeCompare(b.name));return r.sort(compareBy)}
function updateGroups(){const sel=$('filterGroup');const values=[...new Set(all.filter(x=>(kind==='all'||x.kind===kind)&&(game==='all'||x.scope===game||(x.scope==='both'&&['story','online'].includes(game)))).map(x=>x.group))].filter(Boolean).sort();sel.replaceChildren(new Option('All groups','all'));for(const v of values)sel.add(new Option(v,v));if(!values.includes(group))group='all';sel.value=group}
function link(label,href){const a=make('a','u-linkbutton',label);a.href=href.startsWith('https:')?href:'./'+href;if(href.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer'}return a}
function card(r){const node=make('article','u-card');node.append(artwork(r));const body=make('div','u-card-copy');body.append(make('p','u-card-eyebrow',(LABELS[r.kind]||'Record').toUpperCase()+' · '+(r.kind==='character'&&r.scope==='classic'?r.game:world(r.scope))));
 const title=make('h3');const open=make('button','u-card-title',r.name);open.type='button';open.onclick=()=>details(r,true);title.append(open);body.append(title);body.append(make('p','u-card-group',(r.brand?r.brand+' · ':'')+(r.group||'Reference')));body.append(make('p','u-card-desc',r.summary||'Open the reference for more information.'));
 const actions=make('div','u-card-actions');const b=make('button','u-action','View details');b.type='button';b.onclick=()=>details(r,true);actions.append(b);
 if(r.kind==='character'&&r.id.startsWith('character:')&&WORLD_CODES.has(r.scope))actions.append(link('Open character profile',characterHref(r)));
 if(r.kind==='vehicle'&&r.model&&r.scope!=='vi')actions.append(link('▣ Garage','atlas93-garage.html?addModel='+encodeURIComponent(r.model)));
 if(r.kind==='vehicle'||r.kind==='weapon'){const cmp=make('button','u-action u-muted-action',compare.some(x=>x.id===r.id)?'✓ Selected':'+ Compare');cmp.type='button';cmp.setAttribute('aria-pressed',String(compare.some(x=>x.id===r.id)));cmp.disabled=compare.length>=3&&!compare.some(x=>x.id===r.id);if(cmp.disabled)cmp.textContent='Compare limit reached';cmp.onclick=()=>selectCompare(r);actions.append(cmp)}
 body.append(actions);if(r.kind==='character'&&r.imageCredit&&r.imageCredit.startsWith('https://')){const credit=link('Portrait source ↗',r.imageCredit);credit.className='u-portrait-source';body.append(credit)}node.append(body);return node}
function syncURL(){
 const url=new URL(location.href);
 const options=[
  ['kind',kind,DEFAULT_KIND],['game',game,DEFAULT_GAME],['q',query,''],
  ['group',group,'all'],['sort',order,'name'],['research',researchOnly?'1':'',''],['view',view,'grid']
 ];
 for(const [key,value,defaultValue] of options){
  if(value===defaultValue)url.searchParams.delete(key);
  else url.searchParams.set(key,value);
 }
 if(url.href!==location.href)history.replaceState(history.state,'',url);
}
function draw(){document.body.dataset.activeWorld=game;document.body.dataset.activeKind=kind;filtered=match();syncURL();
 document.querySelectorAll('[data-world]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.world===game)));
 const title=$('resultsTitle');if(title)title.textContent=(kind==='all'?'All types':LABELS[kind]||'References')+' · '+(game==='all'?'All worlds':world(game));page=Math.max(0,Math.min(page,Math.ceil(filtered.length/LIMIT)-1));$('totalRecords').textContent=String(all.length);$('visibleRecords').textContent=String(filtered.length);$('selectedCompare').textContent=String(compare.length);$('resultsCount').textContent=filtered.length.toLocaleString()+' matching records';
 $('pageStatus').textContent='Page '+(page+1)+' of '+Math.max(1,Math.ceil(filtered.length/LIMIT));$('prevRecords').disabled=page===0;$('nextRecords').disabled=(page+1)*LIMIT>=filtered.length;
 const area=$('recordGrid');area.classList.toggle('u-list',view==='list');area.replaceChildren();filtered.slice(page*LIMIT,(page+1)*LIMIT).forEach(x=>area.append(card(x)));
 if(!filtered.length)area.append(make('p','u-empty',all.length?'No results. Try clearing your filters.':'No records could be loaded.'));
 $('gridView').setAttribute('aria-pressed',String(view==='grid'));$('listView').setAttribute('aria-pressed',String(view==='list'));$('compareDock').hidden=compare.length===0;$('compareDockText').textContent=compare.map(x=>x.name).join(' · ');$('openCompare').disabled=compare.length<2;
 $('universeStatus').textContent=(all.length?'Indexed '+all.length.toLocaleString()+' references': 'Database unavailable')+(failed.length?' · '+failed.length+' source(s) unavailable':'');
}
function field(list,label,value){const d=make('div','u-field');d.append(make('dt','',label),make('dd','',value===null||value===undefined||value===''?'Not provided / unverified':String(value)));list.append(d)}
function actionsFor(r,box){if(r.kind==='vehicle'){if(r.model&&r.scope!=='vi')box.append(link('▣ Add to My Garage','atlas93-garage.html?addModel='+encodeURIComponent(r.model)));box.append(link('View vehicle gallery',r.scope==='vi'?'atlas90-vehicles6.html':'atlas90-vehicles5.html'))}
 if(r.kind==='weapon'){
  const scope=r.scope==='both'?game:r.scope;
  const gallery=scope==='vi'?'atlas90-weapons6.html':scope==='online'||scope==='story'?'atlas90-weapons.html?world='+scope:null;
  if(gallery)box.append(link(scope==='vi'?'Leonida weapon research':'Pictured weapon gallery',gallery));
 }
 if(r.kind==='collectible'){
  if(r.scope==='story'||r.scope==='online'){
   const checklist=r.collectionId?'atlas81-hq.html?collection='+encodeURIComponent(r.collectionId)+'#collections':'atlas81-hq.html#collections';
   box.append(link(r.collectionId?'Open collection checklist':'Collection HQ',checklist));
  }
  const map=r.scope==='online'?'atlas-online.html':r.scope==='vi'?'atlas-vi.html':'atlas.html';
  if(r.collectionId)box.append(link('Open collection on map',map+'?collection='+encodeURIComponent(r.collectionId)));
  else box.append(link('Open relevant map',map));
 }
 if(r.kind==='character'&&r.id.startsWith('character:')&&WORLD_CODES.has(r.scope))box.append(link('Open character profile',characterHref(r)));
 if(r.kind==='animal'||r.kind==='character'){const classics={'GTA III':'map-hub.html?game=iii','GTA Vice City':'map-hub.html?game=vc','GTA San Andreas':'atlas-sa.html','GTA IV':'atlas-iv.html','GTA Vice City Stories':'map-hub.html?game=vcs','GTA Liberty City Stories':'map-hub.html?game=lcs','GTA Chinatown Wars':'map-hub.html?game=ctw','GTA The Lost and Damned':'map-hub.html?game=tlad','GTA The Ballad of Gay Tony':'map-hub.html?game=tbogt'};box.append(link('Explore correct world map',r.scope==='vi'?'atlas-vi.html':r.scope==='online'?'atlas-online.html':r.scope==='classic'?(classics[r.game]||'maps.html'):'atlas.html'));}
 if(r.sourceUrl&&r.sourceUrl.startsWith('https://'))box.append(link('Source ↗',r.sourceUrl));if(r.creditsUrl&&r.creditsUrl.startsWith('https://www.rockstargames.com/'))box.append(link('Rockstar cast credits ↗',r.creditsUrl));if(r.imageCredit)box.append(link('Artwork credits ↗',r.imageCredit));
 if(r.key){const state=own();for(const [key,word] of [['owned','Mark owned'],['wishlist','Wishlist']]){const b=make('button','u-action',state[key]?.[r.key]?'✓ '+word:word);b.type='button';b.onclick=()=>{if(toggleOwned(r,key))details(r,false);else alert('Storage unavailable; export your garage before clearing this device.');};box.append(b)}}
}
function details(r,updateURL){const dialog=$('recordDialog'),area=$('detailContent');area.replaceChildren();const hero=make('div','u-detail-hero');hero.append(artwork(r));const copy=make('div');copy.append(make('p','u-eyebrow',(LABELS[r.kind]||'Reference')+' / '+world(r.scope)),Object.assign(make('h2','',r.name),{id:'detailTitle'}),make('p','u-detail-desc',r.summary||'Curated reference record.'));hero.append(copy);area.append(hero);
 const list=make('dl','u-facts');field(list,'Record type',LABELS[r.kind]||'Reference');field(list,'Game / scope',r.game||world(r.scope));field(list,'Class or group',r.group);if(r.brand)field(list,'Brand / manufacturer',r.brand);if(r.region)field(list,'Setting / habitat',r.region);if(r.total!==null&&r.total!==undefined)field(list,'Collection total',r.total);field(list,'Verification',r.verification);if(r.kind==='vehicle')field(list,'Price / top speed',r.attributes?.price??null);if(r.kind==='weapon')field(list,'Damage / ammo',r.attributes?.damage??null);if(r.kind==='character'){if(r.attributes?.performer)field(list,'Credited performer(s)',r.attributes.performer);if(r.attributes?.affiliation)field(list,'Officially described connections',r.attributes.affiliation);}if(r.scope==='vi')field(list,'Source distinction',isUnverified(r)?'Provisional research; locations, spawns and exact performance remain unverified.':'This specific entry has an official published reference; exact locations, stats and collectible placement are not implied.');area.append(list);
 const actions=make('div','u-detail-actions');actionsFor(r,actions);area.append(actions);if(updateURL){const url=new URL(location.href);url.searchParams.set('item',r.id);history.replaceState(null,'',url)}if(dialog.showModal)dialog.showModal();}
function selectCompare(r){const idx=compare.findIndex(x=>x.id===r.id);if(idx>=0)compare.splice(idx,1);else if(compare.length<3)compare.push(r);draw()}
function showCompare(){if(compare.length<2)return;const area=$('compareContent');area.replaceChildren();for(const r of compare){const col=make('section','u-compare-col');col.append(artwork(r),make('h3','',r.name),make('p','',world(r.scope)));const dl=make('dl','u-facts');field(dl,'Type',LABELS[r.kind]);field(dl,'Category',r.group);field(dl,'Verification',r.verification);field(dl,'Price',r.attributes?.price??null);col.append(dl);area.append(col)}$('compareDialog').showModal()}
async function loadJSON(url){
 // The catalog is bundled on the same origin. Retry a short-lived local HTTP failure
 // before declaring a source unavailable, particularly on slower mobile/Edge loads.
 for(let attempt=0;attempt<3;attempt++){
  try{
   const response=await fetch('./'+url,{cache:'no-cache'});
   if(!response.ok){
    // A missing packaged file is a release defect, not a transient connection problem.
    if(response.status===404)break;
    throw Error('HTTP '+response.status);
   }
   return await response.json();
  }catch{
   if(attempt<2)await new Promise(resolve=>setTimeout(resolve,160*(attempt+1)));
  }
 }
 failed.push(url);return null;
}
async function init(){const args=new URLSearchParams(location.search);kind=MODE==='all'?(args.get('kind')||DEFAULT_KIND):MODE;if(kind!=='all'&&!Object.keys(LABELS).includes(kind))kind=DEFAULT_KIND;game=WORLD_CODES.has(args.get('game'))?args.get('game'):DEFAULT_GAME;const paramsKind=$('filterKind');paramsKind.value=kind;$('filterGame').value=game;if(args.has('q')){query=(args.get('q')||'').slice(0,120);$('universeSearch').value=query;}
 group=args.get('group')||'all';
 const sort=$('sortBy');
 const requestedSort=args.get('sort');
 if(Array.from(sort.options).some(option=>option.value===requestedSort))order=requestedSort;
 sort.value=order;
 researchOnly=args.get('research')==='1';
 $('researchOnly').checked=researchOnly;
 view=args.get('view')==='list'?'list':'grid';
 document.querySelectorAll('[data-world]').forEach(b=>b.addEventListener('click',()=>{game=b.dataset.world;group='all';page=0;$('filterGame').value=game;updateGroups();draw()}));
 const [profile,seed,catalog,sets,viWeapons]=await Promise.all(['data/atlas-universe-profiles.json?v=222','atlas90-seed.json','atlas-catalog.json','atlas-collections.json','data/atlas192-vi-weapons.json?v=222'].map(loadJSON));all=index(profile,seed,catalog,sets,viWeapons);updateGroups();
 $('universeSearch').addEventListener('input',e=>{query=e.target.value.trim();page=0;draw()});paramsKind.addEventListener('change',e=>{kind=e.target.value;page=0;group='all';updateGroups();draw()});$('filterGame').addEventListener('change',e=>{game=e.target.value;group='all';page=0;updateGroups();draw()});
 $('filterGroup').addEventListener('change',e=>{group=e.target.value;page=0;draw()});$('sortBy').addEventListener('change',e=>{order=e.target.value;draw()});$('researchOnly').addEventListener('change',e=>{researchOnly=e.target.checked;page=0;draw()});
 $('gridView').onclick=()=>{view='grid';draw()};$('listView').onclick=()=>{view='list';draw()};$('clearFilters').onclick=()=>{kind=DEFAULT_KIND;game=DEFAULT_GAME;group='all';query='';researchOnly=false;page=0;order='name';$('universeSearch').value='';paramsKind.value=kind;$('filterGame').value=game;$('researchOnly').checked=false;$('sortBy').value='name';updateGroups();draw()};
 $('prevRecords').onclick=()=>{page--;draw();$('results').scrollIntoView({block:'start'})};$('nextRecords').onclick=()=>{page++;draw();$('results').scrollIntoView({block:'start'})};
 $('resetCompare').onclick=()=>{compare=[];draw()};$('openCompare').onclick=showCompare;
 for(const d of [$('recordDialog'),$('compareDialog')])d.addEventListener('close',()=>{if(d.id==='recordDialog'){const url=new URL(location.href);url.searchParams.delete('item');history.replaceState(null,'',url)}});
 draw();const id=args.get('item');if(id){const found=all.find(x=>x.id===id);if(found)details(found,false)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();