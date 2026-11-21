/* Atlas 22.2 — accessible, indexed character gallery. Original Elario visual system.
   Keep GTA V Story, GTA Online, GTA VI Story and classic editions isolated. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const ALLOWED=new Set(['all','story','online','vi','classic']);
const FALLBACKS={
 story:'art/jura155-story.webp',online:'art/jura155-online.webp',
 vi:'art/jura155-vi.webp',classic:'art/jura155-characters.webp'
};
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
let indexedCharacters=[];
const profileLink=r=>'./atlas-characters.html?game='+encodeURIComponent(r.scope)+'&q='+encodeURIComponent(r.name)+'&profile='+encodeURIComponent(r.id)+'#mainCharacterEra';
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
 const img=make('img');img.loading=profile?'eager':'lazy';img.decoding='async';img.referrerPolicy='no-referrer';
 let fallback=!srcSafe(r.image);
 const scene='./'+(FALLBACKS[r.scope]||FALLBACKS.classic);
 const credit=make('span','j222-art-credit',label(r,fallback));
 img.alt=label(r,fallback)+' for '+r.name;img.src=fallback?scene:r.image;
 img.addEventListener('error',()=>{if(fallback)return;fallback=true;img.src=scene;img.alt=label(r,true)+' for '+r.name;credit.textContent=label(r,true)},{once:true});
 media.append(img,credit);return media;
}
function card(r){
 const el=make('article','j222-character-card');
 el.dataset.j222World=r.scope;
 const media=portraitMedia(r);
 const box=make('div','j222-character-info');
 box.append(make('span','j222-world-tag',(worlds[r.scope]||r.scope)+' · '+(r.group||'Character')));
 const title=make('h3','',r.name);box.append(title);
 const summary=make('p','',r.summary||'Explore the original game or official character source.');box.append(summary);
 const actions=make('div','j222-card-actions');
 const details=make('a','j222-action j222-primary','View profile');
 details.href=profileLink(r);
 details.addEventListener('click',event=>{const dialog=$('j222-profile-dialog');if(!dialog||typeof dialog.showModal!=='function')return;event.preventDefault();showProfile(dialog,r);});
 const map=make('a','j222-action','Open '+(r.scope==='vi'?'Leonida':'world')+' map');map.href=worldLink(r);
 actions.append(details,map);
 if(srcSafe(r.sourceUrl)){const source=make('a','j222-source','Source ↗');source.href=r.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';actions.append(source)}
 box.append(actions);el.append(media,box);
 return el;
}
function showProfile(dialog,r){
 const content=$('j222-profile-content');if(!content)return;
 content.replaceChildren();
 const hero=make('div','j222-profile-hero');hero.append(portraitMedia(r,true));
 const intro=make('div','j222-profile-intro');
 const heading=make('h2','',r.name);heading.id='j222-profile-title';
 intro.append(make('p','j222-world-tag',(worlds[r.scope]||r.scope)+' · '+(r.game||'')),heading,make('p','',r.summary||'No verified biography is available for this record.'));
 hero.append(intro);content.append(hero);
 const facts=make('dl','j222-profile-facts');
 const fact=(key,value)=>{if(value)facts.append(make('dt','',key),make('dd','',value))};
 fact('Edition',r.game||worlds[r.scope]);fact('Character role',r.group);fact('Region',r.region);
 if(r.verification)fact('Source confidence',r.verification);else fact('Source confidence','Curated reference; review needed');
 if(r.attributes?.performer)fact('Credited performer(s)',r.attributes.performer);
 if(r.attributes?.affiliation)fact('Published connections',r.attributes.affiliation);
 fact('Image attribution',r.imageRights||'Original Elario illustrative world scene when no reference portrait is available');
 content.append(facts);
 if(r.scope==='vi')content.append(make('p','j222-profile-caution','A confirmed character does not verify exact map coordinates, game statistics or spawn locations.'));
 const links=make('div','j222-card-actions');
 const map=make('a','j222-action j222-primary','Open world map');map.href=worldLink(r);links.append(map);
 if(srcSafe(r.sourceUrl)){const source=make('a','j222-action','View original source');source.href=r.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';links.append(source)}
 if(srcSafe(r.imageCredit)&&r.imageCredit!==r.sourceUrl){const credit=make('a','j222-action','Image credit');credit.href=r.imageCredit;credit.target='_blank';credit.rel='noopener noreferrer';links.append(credit)}
 const share=make('a','j222-action','Link to character');share.href=profileLink(r);links.append(share);
 content.append(links);
 const alternates=indexedCharacters.filter(x=>x.kind==='character'&&x.name===r.name&&x.scope!==r.scope);
 if(alternates.length){
  const other=make('nav','j225-character-appearances');
  other.setAttribute('aria-label','Other documented game appearances');
  other.append(make('p','j225-appearances-heading','Also appears in'));
  for(const entry of alternates){
   const link=make('a','j222-action','View '+(worlds[entry.scope]||entry.game)+' profile');
   link.href=profileLink(entry);other.append(link);
  }
  content.append(other);
 }
 const url=new URL(location.href);
 if(url.searchParams.get('profile')!==r.id){
  url.searchParams.set('profile',r.id);
  history.replaceState(history.state,'',url);
 }
 dialog.showModal();
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
 search.value=q;
 const persist=()=>{const u=new URL(location.href);
  if(scope==='all')u.searchParams.delete('game');else u.searchParams.set('game',scope);
  if(q.trim())u.searchParams.set('q',q.trim());else u.searchParams.delete('q');
  history.replaceState(history.state,'',u);
 };
 const syncDatabase=()=>{const el=$('filterGame');if(el&&el.value!==scope){el.value=scope;el.dispatchEvent(new Event('change',{bubbles:true}))}};
 const draw=()=>{
  const s=q.trim().toLocaleLowerCase();
  const scoped=data.filter(r=>scope==='all'||r.scope===scope);
  // A character-name or alias query is a direct lookup. Do not clutter it with
  // other characters whose biography merely mentions that person's name.
  const nameMatches=s?scoped.filter(r=>[r.name,...(r.aliases||[])].some(x=>String(x).toLocaleLowerCase().includes(s))):[];
  const rows=!s?scoped:nameMatches.length?nameMatches:scoped.filter(r=>
   [worlds[r.scope],r.game,r.group,r.region,r.summary].join(' ').toLocaleLowerCase().includes(s));
  const rank=r=>{
   const name=r.name.toLocaleLowerCase();
   return name===s?0:name.startsWith(s)?1:name.includes(s)?2:3;
  };
  rows.sort((a,b)=>(s?rank(a)-rank(b):0)||
    (a.group==='Protagonist'?0:1)-(b.group==='Protagonist'?0:1)||a.name.localeCompare(b.name));
  grid.replaceChildren();for(const r of rows)grid.append(card(r));
  if(!rows.length)grid.append(make('p','j222-empty','No characters matched. Try another world or search term.'));
  stat.textContent=rows.length+' of '+data.length+' indexed characters · '+(worlds[scope]||'All worlds');
  for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.j222Scope===scope));
 };
 for(const b of buttons)b.addEventListener('click',()=>{scope=b.dataset.j222Scope;draw();syncDatabase();persist()});
 search.addEventListener('input',()=>{q=search.value.slice(0,120);draw();persist()});
 $('j222-reset')?.addEventListener('click',()=>{scope='all';q='';search.value='';draw();syncDatabase();persist()});
 const dialog=$('j222-profile-dialog');
 dialog?.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
 });
 dialog?.addEventListener('close',()=>{
  const url=new URL(location.href);
  if(url.searchParams.has('profile')){
   url.searchParams.delete('profile');
   history.replaceState(history.state,'',url);
  }
 });
 if(location.hash==='#results'&&q){history.replaceState(history.state,'',location.pathname+location.search+'#mainCharacterEra');$('mainCharacterEra')?.scrollIntoView({block:'start'})}
 draw();
 const requested=args.get('profile');
 if(requested&&dialog){
  const hit=data.find(r=>r.id===requested&&(scope==='all'||r.scope===scope));
  if(hit)showProfile(dialog,hit);
  else{const url=new URL(location.href);url.searchParams.delete('profile');history.replaceState(history.state,'',url)}
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();