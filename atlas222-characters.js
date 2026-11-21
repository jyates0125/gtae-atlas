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
const profileLink=r=>'./atlas-characters.html?game='+encodeURIComponent(r.scope)+'&q='+encodeURIComponent(r.name)+'#mainCharacterEra';
const worldLink=r=>r.scope==='classic'?'./'+(CLASSIC[r.game]||'maps.html'):
 r.scope==='story'?'./atlas.html':r.scope==='online'?'./atlas-online.html':'./atlas-vi.html';
const make=(tag,cl,value)=>{const n=document.createElement(tag);if(cl)n.className=cl;if(value!==undefined)n.textContent=value;return n};
const srcSafe=url=>typeof url==='string' && /^https:\/\/[a-z0-9.-]+\//i.test(url) && url.length<600;
const label=(r,local)=>local?'Original Elario cinematic world artwork · not a character portrait':
 'Reference character artwork · source linked where provided';
function card(r){
 const el=make('article','j222-character-card');
 el.dataset.j222World=r.scope;
 const media=make('div','j222-character-media');
 const image=make('img');
 image.loading='lazy';image.decoding='async';image.referrerPolicy='no-referrer';
 const scene='./'+(FALLBACKS[r.scope]||FALLBACKS.classic);
 image.alt=label(r,!srcSafe(r.image))+' for '+r.name;
 image.src=srcSafe(r.image)?r.image:scene;
 let fallback=!srcSafe(r.image);
 const mediaStatus=make('span','j222-art-credit',label(r,fallback));
 const onError=()=>{if(fallback)return;fallback=true;image.src=scene;image.alt=label(r,true)+' for '+r.name;mediaStatus.textContent=label(r,true)};
 image.addEventListener('error',onError,{once:true});
 media.append(image,mediaStatus);
 const box=make('div','j222-character-info');
 box.append(make('span','j222-world-tag',(worlds[r.scope]||r.scope)+' · '+(r.group||'Character')));
 const title=make('h3','',r.name);box.append(title);
 const summary=make('p','',r.summary||'Explore the original game or official character source.');box.append(summary);
 const actions=make('div','j222-card-actions');
 const details=make('a','j222-action j222-primary','View profile');
 details.href=profileLink(r);
 const map=make('a','j222-action','Open '+(r.scope==='vi'?'Leonida':'world')+' map');map.href=worldLink(r);
 actions.append(details,map);
 if(srcSafe(r.sourceUrl)){const source=make('a','j222-source','Source ↗');source.href=r.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';actions.append(source)}
 box.append(actions);el.append(media,box);
 return el;
}
async function start(){
 const grid=$('j222-character-grid'),search=$('j222-character-search'),stat=$('j222-character-count');
 if(!grid||!search)return;
 let data=[];
 try{const resp=await fetch('./data/atlas-universe-profiles.json?v=222',{cache:'no-cache'});if(!resp.ok)throw Error('Character database missing');const json=await resp.json();data=(json.records||[]).filter(r=>r.kind==='character'&&ALLOWED.has(r.scope));}
 catch{grid.replaceChildren(make('p','j222-empty','Character data could not load. Open the full records search below.'));return}
 const buttons=[...document.querySelectorAll('[data-j222-scope]')];
 const args=new URLSearchParams(location.search);
 let scope=ALLOWED.has(args.get('game'))?args.get('game'):'all';
 let q=(args.get('q')||'').slice(0,120);
 search.value=q;
 const draw=()=>{
  const s=q.trim().toLocaleLowerCase();
  const rows=data.filter(r=>(scope==='all'||r.scope===scope)&&(!s||[r.name,worlds[r.scope],r.game,r.group,r.summary,...(r.aliases||[])].join(' ').toLocaleLowerCase().includes(s)));
  rows.sort((a,b)=>{const pri=x=>x.group==='Protagonist'?0:1;return pri(a)-pri(b)||a.name.localeCompare(b.name)});
  grid.replaceChildren();for(const r of rows)grid.append(card(r));
  if(!rows.length)grid.append(make('p','j222-empty','No characters matched. Try another world or search term.'));
  stat.textContent=rows.length+' of '+data.length+' searchable characters';
  for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.j222Scope===scope));
 };
 for(const b of buttons)b.addEventListener('click',()=>{scope=b.dataset.j222Scope;draw()});
 search.addEventListener('input',()=>{q=search.value.slice(0,120);draw()});
 $('j222-reset')?.addEventListener('click',()=>{scope='all';q='';search.value='';draw()});
 draw();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();