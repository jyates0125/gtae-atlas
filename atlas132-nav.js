/* Team Jura Atlas 13.2 · universal game-first navigation
 * Rendered on all published HTML routes by the static build, with a full
 * searchable page index. No game engines or stored player data altered. */
(()=>{'use strict';
const CATEGORIES=[
 {title:'START & COMMUNITY',prefix:'start',items:[['Welcome','index.html'],['Enter Atlas dashboard','atlas-dashboard.html'],['Choose a world','atlas97-journey.html'],['All 13 maps','maps.html'],['Guest progress & backup','atlas-account.html'],['Share the Atlas','atlas-share.html'],['One Last Ride','one-last-ride.html'],['Team Jura','team-jura.html'],['Elario Studios','elario.html']]},
 {title:'GAME MAPS & EXPLORERS',prefix:'maps',items:[['GTA V Story','atlas.html'],['GTA Online','atlas-online.html'],['Leonida · Community Research 2D / 3D','atlas-vi.html'],['GTA VI Story · Official map','atlas-vi.html?view=rockstar'],['Cayo Perico','heist-cayo-perico.html'],['GTA IV','atlas-iv.html'],['San Andreas','atlas-sa.html'],['Vice City','map-hub.html?game=vc'],['GTA III','map-hub.html?game=iii'],['Vice City Stories','map-hub.html?game=vcs'],['Liberty City Stories','map-hub.html?game=lcs'],['Chinatown Wars','map-hub.html?game=ctw'],['The Lost and Damned (TLAD)','map-hub.html?game=tlad'],['The Ballad of Gay Tony (TBOGT)','map-hub.html?game=tbogt'],['Map directory','maps.html']]},
 {title:'COLLECTIONS & PLAYER TOOLS',prefix:'tools',items:[['Universe database','atlas-database.html'],['GTA V vehicles','atlas90-vehicles5.html'],['GTA VI vehicle research','atlas90-vehicles6.html'],['GTA V Story Weapons','atlas90-weapons.html?world=story'],['GTA Online Weapons','atlas90-weapons.html'],['GTA VI Weapon Research','atlas90-weapons6.html'],['All searchable characters','atlas-characters.html'],['Animals','atlas-animals.html'],['Collectibles','atlas-collectibles.html'],['My Garage','atlas93-garage.html'],['My Crew','my-crew.html'],['Vehicle 3D concept','atlas-vehicle-configurator.html'],['Atlas Passport','atlas-passport.html'],['Tracker & HQ','atlas81-hq.html'],['Cheat sheets','atlas-cheats.html'],['Guides','guides.html'],['Activities','atlas-activities.html'],['Your toolkit','atlas-toolkit.html']]},
 {title:'HEISTS & MISSIONS',prefix:'heists',items:[['Heists HQ','heists.html'],['Cayo Perico heist','heist-cayo-perico.html'],['Diamond Casino','heist-diamond-casino.html'],['Doomsday Act I','heist-doomsday-act-1.html'],['Doomsday Act II','heist-doomsday-act-2.html'],['Doomsday Act III','heist-doomsday-act-3.html'],['Pacific Standard','heist-pacific-standard.html'],['Fleeca Job','heist-fleeca.html'],['Prison Break','heist-prison-break.html'],['Humane Labs','heist-humane-labs.html'],['Auto Shop','heist-auto-shop.html'],['Cluckin Bell','heist-cluckin-bell.html'],['Series A Funding','heist-series-a.html'],['Agency VIP Contract','heist-agency-vip.html'],['Salvage Yard','heist-salvage-yard.html'],['Kortz Center research','heist-kortz-center.html']]},
 {title:'RESEARCH & STUDIO',prefix:'research',items:[['GTA VI Research','atlas-research.html'],['Landmark Library','atlas98-landmarks.html'],['Newsroom','atlas-news.html'],['Daily Intel','atlas87-daily.html'],['Atlas Dispatch','atlas93-dispatch.html'],['Source Registry','atlas-source-registry.html'],['Evidence & Verification','atlas-verification.html'],['Credits & Rights','atlas-credits.html'],['Style Lab','atlas98-style-lab.html'],['Data Lab','atlas98-data-lab.html']]}
];
const ALL=new Set(CATEGORIES.flatMap(x=>x.items.map(y=>y[1])));
const safeHref=x=>/^[a-z0-9-]+\.html$/i.test(x);
const searchText=value=>String(value??'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/['’]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const identityMatch=(value,s)=>{
 const n=searchText(value);
 if(!s||!n)return false;
 if(n.includes(s)||n.replace(/ /g,'')===s.replace(/ /g,''))return true;
 const words=s.split(' ');
 return words.length>1&&words.every(word=>n.split(' ').some(part=>part.startsWith(word)));
};
const recordKey=r=>String(r.id||'').split(':').pop();
function pageLink(a){const l=document.createElement('a');l.href='./'+a[1];l.textContent=a[0];
 const target=new URL(l.href),current=new URL(location.href);
 const pathnameMatch=current.pathname===target.pathname||(a[1]==='index.html'&&(current.pathname==='/'||current.pathname.endsWith('/index.html')));
 const scopedQuery=[...target.searchParams].every(([key,value])=>current.searchParams.get(key)===value);
 const armoryMatches=!target.pathname.endsWith('/atlas90-weapons.html')||
   (target.searchParams.get('world')==='story'?(current.searchParams.get('world')==='story'):(current.searchParams.get('world')!=='story'));
 if(pathnameMatch&&scopedQuery&&armoryMatches)l.setAttribute('aria-current','page');
 return l}
function build(){
 if(document.querySelector('#j132-nav-toggle'))return;
 const wrap=document.createElement('div');wrap.className='j132-nav';
 if(/^atlas(?:-online|-vi)?\.html$/i.test(location.pathname.split('/').pop()||''))wrap.classList.add('j132-map-nav');
 wrap.innerHTML='<button id="j132-nav-toggle" type="button" aria-controls="j132-nav-drawer" aria-expanded="false" aria-label="Open GTAE menu">☰ <span>MENU</span></button><aside id="j132-nav-drawer" aria-label="All GTAE navigation" hidden><div class="j132-nav-head"><img src="./art/elario-crest.svg" width="35" height="35" alt=""><div><strong>ELARIO STUDIOS · GTAE</strong><small>GTA EXPLORER · BY TEAM JURA</small></div><button type="button" class="j132-close" aria-label="Close site navigation">✕</button></div><label class="j132-search">Search every page<input type="search" id="j132-search" placeholder="Maps, garages, collectibles, heists..." autocomplete="off"></label><div class="j132-groups" id="j132-groups"></div><p class="j132-nav-tail">Many Crews. One Vision. · Independent GTA fan companion</p></aside>';
 const button=wrap.querySelector('#j132-nav-toggle'),drawer=wrap.querySelector('#j132-nav-drawer'),input=wrap.querySelector('#j132-search'),list=wrap.querySelector('#j132-groups');
 let allCategories=CATEGORIES.slice(),characterCategories=[],otherPages=[];
 function rebuildCategories(){allCategories=[...CATEGORIES,...characterCategories,...otherPages];render(input.value)}
 function render(query=''){
  const q=query.trim().toLocaleLowerCase();list.replaceChildren();
  let shown=0;
  for(const group of allCategories){
    if(!q&&group.prefix==='characters')continue; // Search-only results, not an extra 36-item navigation dump.
    const matches=group.items.filter(([label,url,keywords,record])=>{
      if(group.prefix!=='characters')return (label+' '+url+' '+(keywords||'')).toLocaleLowerCase().includes(q);
      const s=searchText(q);
      if(!s||!record)return false;
      return [record.name,...(record.aliases||[])].some(x=>identityMatch(x,s))||
       searchText(recordKey(record)).replace(/ /g,'')===s.replace(/ /g,'')||
       searchText(keywords).includes(s);
    });
    if(!matches.length)continue;
    const section=document.createElement('section');section.className='j132-group';
    const title=document.createElement('h3');title.textContent=group.title;section.append(title);
    for(const data of matches){section.append(pageLink(data));shown++}list.append(section);
  }
  if(!shown){const msg=document.createElement('p');msg.textContent='No pages matched. Try a game or feature name.';list.append(msg)}
 }
 const fullMenu=document.getElementById('j369-full-map-menu');
 let returnFocus=button;
 const open=(origin=button)=>{
   returnFocus=origin;
   if(origin===fullMenu){document.body.append(wrap);wrap.classList.add('j369-menu-portal');fullMenu.setAttribute('aria-expanded','true');}
   drawer.hidden=false;button.setAttribute('aria-expanded','true');wrap.classList.add('is-open');render(input.value);if(mapHost)drawer.querySelector('.j132-close').focus({preventScroll:true});else input.focus({preventScroll:true});
 };
 const close=(restoreFocus=true)=>{
   drawer.hidden=true;button.setAttribute('aria-expanded','false');wrap.classList.remove('is-open');if(fullMenu)fullMenu.setAttribute('aria-expanded','false');if(wrap.classList.contains('j369-menu-portal')){wrap.classList.remove('j369-menu-portal');mapHost?.append(wrap)}if(restoreFocus)returnFocus.focus({preventScroll:true});
 };
 button.addEventListener('click',()=>drawer.hidden?open():close());drawer.querySelector('.j132-close').addEventListener('click',()=>close());
 fullMenu?.addEventListener('click',()=>open(fullMenu));
 document.addEventListener('keydown',e=>{if(!drawer.hidden&&wrap.classList.contains('j369-menu-portal')&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}},true);
 input.addEventListener('input',()=>render(input.value));
 document.addEventListener('keydown',e=>{
   if(drawer.hidden)return;
   if(e.key==='Escape'){e.preventDefault();close();return;}
   if(e.key!=='Tab')return;
   const focusables=[...drawer.querySelectorAll('a[href],button:not([disabled]),input:not([disabled])')].filter(el=>el.getClientRects().length);
   if(!focusables.length)return;
   const first=focusables[0],last=focusables[focusables.length-1];
   if(e.shiftKey&&(document.activeElement===first||!drawer.contains(document.activeElement))){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&(document.activeElement===last||!drawer.contains(document.activeElement))){e.preventDefault();first.focus();}
 });
 document.addEventListener('pointerdown',e=>{if(!drawer.hidden&&!wrap.contains(e.target)&&!fullMenu?.contains(e.target))close(false)});
 // The Cayo heist keeps the searchable directory in its normal header flow.
 // Other pages retain their already-tested global navigation placement.
 const cayoHost=document.getElementById('j216-inline-mount');
 const mapHost=document.getElementById('j369-site-tools');
 if(cayoHost)cayoHost.append(wrap);
 else if(mapHost)mapHost.append(wrap);
 else document.body.append(wrap);
 render();
 // Production builder records all public HTML pages; expose the ones not in
 // the prominent categories under an honest "Other public pages" section.
 fetch('./atlas132-page-directory.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{
   if(!data||!Array.isArray(data.pages))return;
   const remainder=data.pages.filter(x=>x&&safeHref(x.path)&&!ALL.has(x.path)&&x.path!=='map-hub.html').map(x=>[String(x.title||x.path).replace(/\s*[|·].*$/,'').slice(0,80),x.path]);
   remainder.sort((a,b)=>a[0].localeCompare(b[0]));
   otherPages=remainder.length?[{title:'OTHER PUBLIC WORKSPACES & ARCHIVE',prefix:'other',items:remainder}]:[];
   rebuildCategories();
 }).catch(()=>{});
 // Include character records in the same global search field on every Atlas page.
 // The index is same-origin and labels/URLs are constructed with DOM textContent.
 fetch('./data/atlas-universe-profiles.json?v=222',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(data=>{
  if(!data||!Array.isArray(data.records))return;
  const worlds={classic:'Classic GTA',story:'GTA V Story',online:'GTA Online',vi:'GTA VI Story'};
  const items=data.records.filter(r=>r?.kind==='character'&&worlds[r.scope]).map(r=>[
   r.name+' · '+(r.scope==='classic'?r.game:worlds[r.scope]),
   'atlas-characters.html?game='+encodeURIComponent(r.scope)+(r.scope==='classic'?'&edition='+encodeURIComponent(r.game):'')+'&q='+encodeURIComponent(r.name)+'&profile='+encodeURIComponent(r.id)+'#mainCharacterEra',
   [r.game,worlds[r.scope],r.group,r.region,...(r.aliases||[])].filter(Boolean).join(' '),
   r
  ]).sort((a,b)=>a[0].localeCompare(b[0]));
  if(items.length)characterCategories=[{title:'CHARACTERS · SEARCH ALL WORLDS',prefix:'characters',items}];
  rebuildCategories();
 }).catch(()=>{});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();
})();
