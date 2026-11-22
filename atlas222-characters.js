/* Atlas 22.2 — accessible, indexed character gallery. Original Elario visual system.
   Keep GTA V Story, GTA Online, GTA VI Story and classic editions isolated. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const ALLOWED=new Set(['all','story','online','vi','classic']);
const searchText=value=>String(value??'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/['’]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const identityMatch=(value,s)=>{
 const n=searchText(value);
 if(!s||!n)return false;
 if(n.includes(s)||n.replace(/ /g,'')===s.replace(/ /g,''))return true;
 const words=s.split(' ');
 return words.length>1&&words.every(word=>n.split(' ').some(part=>part.startsWith(word)));
};
const recordKey=r=>String(r.id||'').split(':').pop();
const hasLocalConcept=r=>r.preferConceptPortrait===true&&typeof r.conceptPortrait==='string'&&/^art\/[a-z0-9-]+\.(?:webp|png|jpe?g)$/i.test(r.conceptPortrait);
const WORLD_SCENES={story:'art/jura155-story.webp',online:'art/jura155-online.webp',vi:'art/jura155-vi.webp',classic:'art/jura155-characters.webp'};
const CLASSIC={
 'GTA III':'map-hub.html?game=iii','GTA Vice City':'map-hub.html?game=vc',
 'GTA San Andreas':'atlas-sa.html','GTA IV':'atlas-iv.html',
 'GTA Vice City Stories':'map-hub.html?game=vcs',
 'GTA Liberty City Stories':'map-hub.html?game=lcs',
 'GTA Chinatown Wars':'map-hub.html?game=ctw',
 'GTA The Lost and Damned':'map-hub.html?game=tlad',
 'GTA The Ballad of Gay Tony':'map-hub.html?game=tbogt'
};
const worlds={story:'GTA V Story',online:'GTA Online',vi:'GTA VI Story',classic:'Classic GTA'};
let indexedCharacters=[],visibleCharacters=[];
const profileLink=r=>'./atlas-characters.html?game='+encodeURIComponent(r.scope)+(r.scope==='classic'?'&edition='+encodeURIComponent(r.game):'')+'&q='+encodeURIComponent(r.name)+'&profile='+encodeURIComponent(r.id)+'#mainCharacterEra';
const worldLink=r=>r.scope==='classic'?'./'+(CLASSIC[r.game]||'maps.html'):
 r.scope==='story'?'./atlas.html':r.scope==='online'?'./atlas-online.html':'./atlas-vi.html';
const make=(tag,cl,value)=>{const n=document.createElement(tag);if(cl)n.className=cl;if(value!==undefined)n.textContent=value;return n};
const srcSafe=url=>typeof url==='string' && /^https:\/\/[a-z0-9.-]+\//i.test(url) && url.length<600;
const label=(r,local)=>local?'Original Elario cinematic world artwork · not a character portrait':
 /^https:\/\/www\.rockstargames\.com\/VI\/_next\/static\/media\//i.test(r.image||'')?
 'Official Rockstar Games character screenshot · © Rockstar Games / Take-Two Interactive':
 'Reference character artwork · source linked where provided';
function portraitMedia(r,profile=false){
 const media=make('div','j222-character-media'+(profile?' j222-profile-media':''));
 const credit=make('span','j222-art-credit');
 const safeConcept=typeof r.conceptPortrait==='string'&&/^art\/[a-z0-9-]+\.(?:webp|png|jpe?g)$/i.test(r.conceptPortrait);
 // A world/ensemble illustration is not evidence of the named character.
 // If a portrait cannot load, show a transparent identity state, never unrelated art.
 const unavailable=()=>{
  media.replaceChildren();
  media.dataset.artStatus='portrait-pending';
  const scene=make('img','j222-world-scene');
  scene.loading=profile?'eager':'lazy';scene.decoding='async';
  scene.alt='Illustrative '+(worlds[r.scope]||r.game||'GTA')+' world artwork; not a portrait of '+r.name;
  scene.src='./'+(WORLD_SCENES[r.scope]||WORLD_SCENES.classic);
  scene.addEventListener('error',()=>{scene.remove();media.classList.add('j222-art-missing')},{once:true});
  const identity=make('div','j222-portrait-unavailable');
  identity.setAttribute('role','group');
  identity.setAttribute('aria-label','Individual portrait unavailable for '+r.name);
  const monogram=make('strong','j222-portrait-initials',r.name.split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());
  identity.append(monogram,make('span','',r.name),make('small','','World illustration · individual portrait pending'));
  credit.textContent='Illustrative world artwork only · not a depiction of '+r.name;
  media.append(scene,identity,credit);
 };
 const showFallback=()=>{
  if(!safeConcept){unavailable();return}
  media.dataset.artStatus='character-concept';
  const portrait=make('img','jura-concept-portrait');
  // Only the small, locally bundled portrait set is eager; remote references stay lazy.
  portrait.loading='eager';
  portrait.decoding='async';
  portrait.alt='Elario Studios fan concept of '+r.name;
  portrait.addEventListener('error',unavailable,{once:true});
  credit.textContent='Elario Studios · illustrated character concept';
  media.replaceChildren(portrait,credit);
  portrait.src='./'+r.conceptPortrait;
 };
 if((r.preferConceptPortrait===true&&safeConcept)||!srcSafe(r.image)){showFallback();return media}
 media.dataset.artStatus='reference';
 const img=make('img');img.loading=profile?'eager':'lazy';img.decoding='async';img.referrerPolicy='no-referrer';
 img.alt='Reference artwork attributed to '+r.name+'; see image source for provenance';
 img.addEventListener('error',showFallback,{once:true});
 credit.textContent=label(r,false);
 media.append(img,credit);img.src=r.image;
 return media;
}
function card(r){
 const el=make('article','j222-character-card');
 el.dataset.j222World=r.scope;
 el.dataset.characterId=r.id;
 el.dataset.j226Edition=r.game||'';
 const media=portraitMedia(r);
 const box=make('div','j222-character-info');
 box.append(make('span','j222-world-tag',(r.scope==='classic'?r.game:(worlds[r.scope]||r.scope))+' · '+(r.group||'Character')));
 const title=make('h3','',r.name);box.append(title);
 const summary=make('p','',r.summary||'Explore the original game or official character source.');box.append(summary);
 const actions=make('div','j222-card-actions');
 const details=make('a','j222-action j222-primary','View profile');
 details.href=profileLink(r);
 details.addEventListener('click',event=>{const dialog=$('j222-profile-dialog');if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;if(!dialog||typeof dialog.showModal!=='function')return;event.preventDefault();showProfile(dialog,r,true);});
 const map=make('a','j222-action','Open '+(r.scope==='vi'?'Leonida':'world')+' map');map.href=worldLink(r);
 actions.append(details,map);
 if(srcSafe(r.sourceUrl)){const source=make('a','j222-source','Source ↗');source.href=r.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';actions.append(source)}
 box.append(actions);el.append(media,box);
 return el;
}
function showProfile(dialog,r,pushEntry=false){
 const content=$('j222-profile-content');if(!content)return;
 content.replaceChildren();
 const hero=make('div','j222-profile-hero');hero.append(portraitMedia(r,true));
 const intro=make('div','j222-profile-intro');
 const heading=make('h2','',r.name);heading.id='j222-profile-title';
 const edition=r.scope==='classic'?r.game:(worlds[r.scope]||r.game);
 intro.append(make('p','j222-world-tag',edition),heading,make('p','',r.summary||'No verified biography is available for this record.'));
 hero.append(intro);content.append(hero);
 const facts=make('dl','j222-profile-facts');
 const fact=(key,value)=>{if(value)facts.append(make('dt','',key),make('dd','',value))};
 fact('Edition',r.scope==='classic'?r.game:worlds[r.scope]);
 if(r.aliases?.length)fact('Also known as',r.aliases.join(', '));fact('Character role',r.group);fact('Region',r.region);
 if(r.verification)fact('Source confidence',r.verification);else fact('Source confidence','Curated reference; review needed');
 if(r.attributes?.performer)fact('Credited performer(s)',r.attributes.performer);
 if(r.attributes?.affiliation)fact('Published connections',r.attributes.affiliation);
 if(r.conceptPortrait)fact('Concept portrait','Elario Studios · original AI-assisted fan illustration');
 fact(r.preferConceptPortrait?'Additional reference attribution':'Reference image attribution',r.imageRights||'Original Elario illustrative world scene when no reference portrait is available');
 content.append(facts);
 if(r.scope==='vi')content.append(make('p','j222-profile-caution','A confirmed character does not verify exact map coordinates, game statistics or spawn locations.'));
 const links=make('div','j222-card-actions');
 const map=make('a','j222-action j222-primary','Open world map');map.href=worldLink(r);links.append(map);
 if(srcSafe(r.sourceUrl)){const source=make('a','j222-action','View original source');source.href=r.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';links.append(source)}
 if(srcSafe(r.imageCredit)&&r.imageCredit!==r.sourceUrl){const credit=make('a','j222-action','Image credit');credit.href=r.imageCredit;credit.target='_blank';credit.rel='noopener noreferrer';links.append(credit)}
 const share=make('a','j222-action','Link to character');share.href=profileLink(r);links.append(share);
 if(navigator.clipboard?.writeText){
  const copy=make('button','j222-action j226-copy','Copy profile link');copy.type='button';
  const status=make('span','j226-copy-status');status.setAttribute('role','status');
  copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(new URL(profileLink(r),location.href).href);status.textContent='Profile link copied.'}catch{status.textContent='Copy unavailable. Open the profile link to share it.'}});
  links.append(copy,status);
 }
 content.append(links);

 // Navigate the current filtered roster without stacking browser history:
 // one modal visit should require one Back action, even after many profiles.
 const index=visibleCharacters.findIndex(entry=>entry.id===r.id);
 if(index>=0&&visibleCharacters.length>1){
  const browse=make('nav','j304-profile-browse');
  browse.setAttribute('aria-label','Browse filtered character appearances');
  const current=make('span','j304-profile-position',(index+1)+' of '+visibleCharacters.length+' appearances');
  const step=(delta,labelText)=>{
   const button=make('button','j222-action',labelText);button.type='button';
   button.addEventListener('click',()=>{
    const next=visibleCharacters[(index+delta+visibleCharacters.length)%visibleCharacters.length];
    if(!next)return;
    const u=new URL(location.href);u.searchParams.set('profile',next.id);
    const state=history.state?.juraCharacterProfile?
     {...history.state,juraCharacterProfile:next.id}:history.state;
    history.replaceState(state,'',u);
    showProfile(dialog,next);
    button.textContent=labelText;
    browse.querySelector('[data-j304-next]')?.focus({preventScroll:true});
   });
   if(delta===1)button.dataset.j304Next='';else button.dataset.j304Previous='';
   return button;
  };
  browse.append(step(-1,'← Previous character'),current,step(1,'Next character →'));
  content.append(browse);
 }
 const alternates=indexedCharacters.filter(x=>x.kind==='character'&&x.name===r.name&&x.id!==r.id);
 if(alternates.length){
  const other=make('nav','j225-character-appearances');
  other.setAttribute('aria-label','Other documented game appearances');
  other.append(make('p','j225-appearances-heading','Also appears in'));
  for(const entry of alternates){
   const link=make('a','j222-action','View '+(entry.scope==='classic'?entry.game:(worlds[entry.scope]||entry.game))+' profile');
   link.href=profileLink(entry);other.append(link);
  }
  content.append(other);
 }
 const url=new URL(location.href);
 if(pushEntry && url.searchParams.get('profile')!==r.id){
  url.searchParams.set('profile',r.id);
  history.pushState({...history.state,juraCharacterProfile:r.id},'',url);
 }
 if(!dialog.open)dialog.showModal();
 dialog.scrollTop=0;
}
async function start(){
 const grid=$('j222-character-grid'),search=$('j222-character-search'),stat=$('j222-character-count');
 if(!grid||!search)return;
 let data=[];
 try{const resp=await fetch('./data/atlas-universe-profiles.json?v=222',{cache:'no-cache'});if(!resp.ok)throw Error('Character database missing');const json=await resp.json();data=(json.records||[]).filter(r=>r.kind==='character'&&ALLOWED.has(r.scope));indexedCharacters=data;}
 catch{grid.replaceChildren(make('p','j222-empty','Character data could not load. Open the full records search below.'));return}
 const buttons=[...document.querySelectorAll('[data-j222-scope]')];
 const args=new URLSearchParams(location.search);
 let scope=ALLOWED.has(args.get('game'))?args.get('game'):'all';
 let q=(args.get('q')||'').slice(0,120);
 let art=['concept','reference'].includes(args.get('art'))?args.get('art'):'all';
 const editions=[...new Set(data.filter(r=>r.scope==='classic').map(r=>r.game))].sort();
 let edition=editions.includes(args.get('edition'))?args.get('edition'):'all';
 const editionLabel=make('label','j226-edition-label','Classic game edition ');
 const editionSelect=make('select','j226-edition-select');
 editionSelect.setAttribute('aria-label','Classic game edition');
 for(const value of ['all',...editions]){
  const option=make('option','',value==='all'?'All classic games':value);
  option.value=value;editionSelect.append(option);
 }
 editionSelect.value=edition;
 editionLabel.append(editionSelect);
 buttons[0]?.parentElement?.after(editionLabel);
 const artButtons=[...document.querySelectorAll('[data-j304-art]')];
 const concepts=data.filter(hasLocalConcept).length;
 const metrics=$('j304-portrait-metrics');
 if(metrics)metrics.textContent=concepts+' listed local concepts · '+(data.length-concepts)+' reference/pending appearances';
 search.value=q;
 const persist=()=>{const u=new URL(location.href);
  if(scope==='all')u.searchParams.delete('game');else u.searchParams.set('game',scope);
  if(scope==='classic'&&edition!=='all')u.searchParams.set('edition',edition);else u.searchParams.delete('edition');
  if(q.trim())u.searchParams.set('q',q.trim());else u.searchParams.delete('q');
  if(art==='all')u.searchParams.delete('art');else u.searchParams.set('art',art);
  history.replaceState(history.state,'',u);
 };
 const syncDatabase=()=>{const el=$('filterGame');if(el&&el.value!==scope){el.value=scope;el.dispatchEvent(new Event('change',{bubbles:true}))}};
 const draw=()=>{
  const s=searchText(q);
  const scoped=data.filter(r=>(scope==='all'||r.scope===scope)&&(scope!=='classic'||edition==='all'||r.game===edition));
  editionLabel.hidden=scope!=='classic';
  // A character-name or alias query is a direct lookup. Do not clutter it with
  // other characters whose biography merely mentions that person's name.
  const nameMatches=s?scoped.filter(r=>[r.name,...(r.aliases||[])].some(x=>identityMatch(x,s))||
   searchText(recordKey(r)).replace(/ /g,'')===s.replace(/ /g,'')):[];
  const rows=!s?scoped:nameMatches.length?nameMatches:scoped.filter(r=>
   searchText([worlds[r.scope],r.game,r.group,r.region,r.summary,r.attributes?.affiliation,r.attributes?.performer].join(' ')).includes(s));
  const rank=r=>{
   const name=searchText(r.name);
   return name===s?0:name.startsWith(s)?1:name.includes(s)?2:3;
  };
  rows.sort((a,b)=>(s?rank(a)-rank(b):0)||
    (a.group==='Protagonist'?0:1)-(b.group==='Protagonist'?0:1)||a.name.localeCompare(b.name));
  const display=art==='all'?rows:rows.filter(r=>art==='concept'?hasLocalConcept(r):!hasLocalConcept(r));
  visibleCharacters=display;
  grid.replaceChildren();for(const r of display)grid.append(card(r));
  if(!display.length)grid.append(make('p','j222-empty','No appearances match these filters. Choose All appearances or reset to browse again.'));
  stat.textContent=display.length+' of '+data.length+' indexed character appearances · '+(scope==='classic'&&edition!=='all'?edition:(worlds[scope]||'All worlds'));
  for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.j222Scope===scope));
  for(const b of artButtons)b.setAttribute('aria-pressed',String(b.dataset.j304Art===art));
 };
 editionSelect.addEventListener('change',()=>{edition=editionSelect.value;draw();persist()});
 for(const b of artButtons)b.addEventListener('click',()=>{art=b.dataset.j304Art;draw();persist()});
 for(const b of buttons)b.addEventListener('click',()=>{scope=b.dataset.j222Scope;draw();syncDatabase();persist()});
 search.addEventListener('input',()=>{q=search.value.slice(0,120);draw();persist()});
 $('j222-reset')?.addEventListener('click',()=>{scope='all';edition='all';editionSelect.value='all';art='all';q='';search.value='';draw();syncDatabase();persist()});
 const dialog=$('j222-profile-dialog');
 dialog?.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
 });
 dialog?.addEventListener('close',()=>{
  const url=new URL(location.href);
  if(dialog.open)return;
  if(history.state?.juraCharacterProfile && history.state.juraCharacterProfile===url.searchParams.get('profile')){history.back();return}
  if(url.searchParams.has('profile')){
   url.searchParams.delete('profile');
   history.replaceState(history.state,'',url);
  }
 });
 if(location.hash==='#results'&&q){history.replaceState(history.state,'',location.pathname+location.search+'#mainCharacterEra');$('mainCharacterEra')?.scrollIntoView({block:'start'})}
 draw();
 function restoreProfile(){
  if(!dialog)return;
  const url=new URL(location.href);
  const requested=url.searchParams.get('profile');
  // A direct character URL is authoritative: an old world/edition filter must
  // never silently discard a valid profile, especially from shared links.
  const hit=requested && data.find(r=>r.id===requested);
  if(hit){
   if(scope!=='all'&&scope!==hit.scope){scope=hit.scope;syncDatabase()}
   if(hit.scope==='classic'&&edition!=='all'&&edition!==hit.game){edition=hit.game;editionSelect.value=edition}
   // A shared link should not open a modal above an empty filtered grid.
   // Preserve a useful name lookup only when the current search excludes it.
   const term=searchText(q);
   const matchesName=[hit.name,...(hit.aliases||[])].some(x=>identityMatch(x,term));
   if(term&&!matchesName){q=hit.name;search.value=q}
   if(art!=='all'&&(art==='concept')!==hasLocalConcept(hit))art='all';
   draw();persist();showProfile(dialog,hit);return
  }
  if(requested){url.searchParams.delete('profile');history.replaceState(history.state,'',url)}
  if(dialog.open)dialog.close();
 }
 window.addEventListener('popstate',restoreProfile);
 restoreProfile();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();