/* GTAE 22.3 · Real homepage interactions, no screenshot-based controls.
   Character/world searches are same-origin sourced; no credentials or mutable global state. */
(()=>{'use strict';
if(!document.body.classList.contains('j223-home'))return;
const q=id=>document.getElementById(id), make=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=String(txt);return el};
const staticLinks=[
 ['Maps','maps.html','13 maps GTAV GTA online Leonida Liberty City San Andreas Vice City'],
 ['GTA V Story','atlas.html','Michael Franklin Trevor Los Santos'],
 ['GTA Online','atlas-online.html','Online multiplayer missions and collectibles'],
 ['GTA VI · Leonida','atlas-vi.html','Lucia Jason GTA 6 Vice City Florida'],
 ['GTA IV','atlas-iv.html','Niko Liberty City'],
 ['San Andreas','atlas-sa.html','CJ Carl Johnson Grove Street'],
 ['GTA III','map-hub.html?game=iii','Claude Liberty City'],
 ['Vice City','map-hub.html?game=vc','Tommy Vercetti'],
 ['Collectibles','atlas-collectibles.html','checklist collections'],
 ['Heists','heists.html','Cayo Perico casino doomsday'],
 ['GTA VI Vehicles','atlas90-vehicles6.html','cars Grotti Vapid'],
 ['GTA VI Weapons','atlas90-weapons6.html','guns equipment pistol'],
 ['All Characters','atlas-characters.html','protagonists NPC people cast'],
 ['GTA VI Research','atlas-research.html','provisional community mapped research'],
 ['My Garage','atlas93-garage.html','personal saved vehicles'],
 ['All records','atlas-database.html?kind=all&game=all','database catalog'],
 ['Guides','guides.html','walkthroughs'],
 ['Activities','atlas-activities.html','events'],
 ['Official Media','https://www.rockstargames.com/VI/media','trailer posters'],
];
const validLocal=x=>/^[a-z0-9][a-z0-9-]*\.html(?:\?[a-z0-9=&%._-]+)?(?:#[a-z0-9._-]+)?$/i.test(x);
const toLink=x=>x.startsWith('https://www.rockstargames.com/')?x:validLocal(x)?'./'+x:null;
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
let catalog=staticLinks.map(([title,href,keywords])=>({title,href,keywords,kind:'Atlas tool'}));
const input=q('j223-search-input'),results=q('j223-search-results'),form=q('j223-search-form');
function findRows(term){
 const normalized=searchText(term);
 if(!normalized)return [];
 return catalog.filter(x=>(x.record&&characterMatch(x.record,normalized))||
   searchText(x.title+' '+x.keywords+' '+x.kind).includes(normalized))
 .sort((a,b)=>{
  const score=x=>searchText(x.title)===normalized?0:
    x.record&&characterMatch(x.record,normalized)?1:
    searchText(x.title).startsWith(normalized)?2:
    x.kind==='Character'?3:4;
  return score(a)-score(b)||a.title.localeCompare(b.title);
 }).slice(0,9);
}
function show(term){
 const rows=findRows(term);results.replaceChildren();
 if(!term){results.hidden=true;input.setAttribute('aria-expanded','false');return rows}
 if(!rows.length){results.append(make('p','','No direct matches. Press Search to explore all records.'))}
 else for(const row of rows){
  const href=toLink(row.href);if(!href)continue;
  const a=make('a','',row.title),small=make('small','',row.kind+' · '+row.keywords.slice(0,75));
  a.href=href;if(href.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer'}
  a.append(small);results.append(a);
 }
 results.hidden=false;input.setAttribute('aria-expanded','true');return rows;
}
input?.addEventListener('input',()=>show(input.value.slice(0,120)));
input?.addEventListener('keydown',e=>{
 if(e.key==='Escape'){show('');input.blur();return}
 if(e.key==='ArrowDown'){const first=results.querySelector('a');if(first){e.preventDefault();first.focus()}}
});
results?.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();show('');input.focus();return}
 if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
 const links=[...results.querySelectorAll('a[href]')];
 if(!links.length)return;
 const current=links.indexOf(document.activeElement);
 const index=e.key==='Home'?0:e.key==='End'?links.length-1:
  e.key==='ArrowDown'?Math.min(current+1,links.length-1):current<=0?0:current-1;
 e.preventDefault();links[index].focus();
});
document.addEventListener('pointerdown',e=>{if(form&&!form.contains(e.target))show('')});
form?.addEventListener('submit',e=>{
 const text=input.value.trim().slice(0,120);
 if(!text){e.preventDefault();input.focus();return}
 const rows=findRows(text);
 e.preventDefault();
 const first=rows.find(x=>toLink(x.href));
 if(first){location.assign(toLink(first.href));return}
 location.assign('./atlas-database.html?kind=all&game=all&q='+encodeURIComponent(text));
});
const localFallback=s=>s==='vi'?'./art/jura155-vi.webp':
 s==='online'?'./art/jura155-online.webp':
 s==='story'?'./art/jura155-story.webp':'./art/jura155-characters.webp';
const castId=['character:michael','character:franklin','character:trevor','character:lucia','character:jason'];
// Exact identities and local concept image paths copied from the bundled source profiles.
// Keep featured navigation available when the larger local JSON is still loading or offline.
const featuredFallback=[
 {id:'character:michael',name:'Michael De Santa',scope:'story',game:'GTA V',conceptPortrait:'art/jura221-michael-cinematic.webp'},
 {id:'character:franklin',name:'Franklin Clinton',scope:'story',game:'GTA V',conceptPortrait:'art/jura221-franklin-cinematic.webp'},
 {id:'character:trevor',name:'Trevor Philips',scope:'story',game:'GTA V',conceptPortrait:'art/jura221-trevor-cinematic.webp'},
 {id:'character:lucia',name:'Lucia Caminos',scope:'vi',game:'GTA VI Story',conceptPortrait:'art/jura221-lucia-cinematic.webp'},
 {id:'character:jason',name:'Jason Duval',scope:'vi',game:'GTA VI Story',conceptPortrait:'art/jura221-jason-cinematic.webp'},
 {id:'character:cj',name:'Carl Johnson',scope:'classic',game:'GTA San Andreas',aliases:['CJ','Carl CJ Johnson']},
 {id:'character:dre-quan-priest',name:"Dre'Quan Priest",scope:'vi',game:'GTA VI Story',aliases:['DreQuan',"Dre'Quan Priest"]}
];
catalog.push(...featuredFallback.map(c=>({title:c.name,kind:'Character',keywords:[c.game,c.scope,...(c.aliases||[])].join(' '),record:c,href:characterHref(c)})));
async function initData(useFallback=false){
 let characters=featuredFallback;
 if(!useFallback)try{
  const res=await fetch('./data/atlas-universe-profiles.json?v=223',{cache:'no-cache'});
  if(!res.ok)throw Error('No local character index');
  characters=(await res.json()).records.filter(x=>x.kind==='character'&&['vi','story','online','classic'].includes(x.scope));
 }catch{characters=featuredFallback}
 if(characters.length){
  const rows=characters.map(x=>({
   title:x.name,
   kind:'Character',
   keywords:[x.game,x.scope,x.group,x.region,x.summary,...(x.aliases||[])].filter(Boolean).join(' '),
   record:x,
   href:characterHref(x)
  }));
  catalog=catalog.filter(x=>x.kind!=='Character');catalog.push(...rows);
  // The user may already have typed while the local character index was loading.
  if(input&&document.activeElement===input&&input.value.trim())show(input.value.slice(0,120));
  for(const [title,href,keywords] of staticLinks){
   if(!catalog.some(x=>x.title===title&&x.href===href))catalog.push({title,href,keywords,kind:'Atlas tool'});
  }
 }
 const host=q('j223-cast-rail');if(!host||!characters.length)return;
 host.replaceChildren();
 const chosen=castId.map(id=>characters.find(c=>c.id===id)).filter(Boolean);
 for(const c of chosen){
  const a=make('a','');a.href='./'+characterHref(c);
  a.title='Search '+c.name+' · '+c.game;
  const img=make('img'),credit=make('small','j223-cast-credit');
  img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
  const scene=()=>{img.dataset.art='world';img.alt='Original Elario world scene; not a likeness of '+c.name;
   credit.textContent='World scene';a.title='Elario world scene, not a portrait of '+c.name;img.src=localFallback(c.scope)};
  img.addEventListener('error',()=>{if(img.dataset.art==='world'){img.remove();credit.textContent='Art unavailable';return}scene()});
  if(typeof c.conceptPortrait==='string'&&/^art\/[a-z0-9-]+\.(?:webp|png|jpe?g)$/i.test(c.conceptPortrait)){
   img.dataset.art='concept';img.alt='Elario fan concept of '+c.name;credit.textContent='Fan concept';
   a.title=c.name+' · Elario illustrated fan concept';img.src='./'+c.conceptPortrait;
  }else if(typeof c.image==='string'&&/^https:\/\/[a-z0-9.-]+\//i.test(c.image)){
   img.dataset.art='reference';img.alt='Sourced reference portrait of '+c.name;credit.textContent='Reference';img.src=c.image;
  }else scene();
  a.append(img,make('strong','',c.name.split(' ')[0]),credit);host.append(a);
 }
}
const evidenceExplanations={
 official:'Correct. Rockstar is a primary source for the named character. Other details—such as unshown spawn positions—still need their own proof.',
 community:'Correct. Screenshot-aligned community coordinates are a useful estimate, but not confirmed in-game positioning.',
 unverified:'Correct. Without a traceable source or independent gameplay check, the exact spawn claim must remain unverified.'
};
const evidenceTryAgain={
 official:'Not quite. A published Rockstar profile verifies the name; keep other gameplay claims separate.',
 community:'Not quite. Screenshot alignment is a community estimate, not a Rockstar-confirmed position.',
 unverified:'Not quite. A location with no evidence cannot be labeled official or calibrated research.'
};
document.querySelectorAll('.j223-evidence-card').forEach(card=>{
 const answer=card.dataset.j223Evidence;
 const feedback=card.querySelector('.j223-evidence-feedback');
 const buttons=[...card.querySelectorAll('[data-j223-grade]')];
 for(const button of buttons)button.addEventListener('click',()=>{
  const choice=button.dataset.j223Grade;
  buttons.forEach(x=>x.setAttribute('aria-pressed',String(x===button)));
  feedback.textContent=choice===answer?evidenceExplanations[answer]:evidenceTryAgain[answer];
  feedback.classList.toggle('j223-correct',choice===answer);
 });
});
initData(true);initData();
})();