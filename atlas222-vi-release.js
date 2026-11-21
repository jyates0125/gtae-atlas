/* Atlas 22.2 · Official-source first post-launch VI directory.
   No invented map coordinates, no browser storage changes and no spoiler plot text. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const make=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
async function start(){
 const host=$('j222-vi-categories'),state=$('j222-vi-status'),regions=$('j222-vi-regions');
 if(!host||!state)return;
 let db;
 try{const r=await fetch('./data/atlas222-vi-release-index.json?v=222',{cache:'no-cache'});if(!r.ok)throw Error('Missing VI index');db=await r.json();if(db.schema!==1||!Array.isArray(db.categories))throw Error('Invalid VI index')}
 catch{state.textContent='Local release index unavailable. Use Rockstar’s official links below.';return}
 const sourceMap=new Map((db.sources||[]).map(s=>[s.id,s]));
 const approved=/^[a-z0-9][a-z0-9-]*\.html(?:[?#][a-z0-9=&%-]*)?$/i;
 host.replaceChildren();
 for(const row of db.categories){
  const card=make('article','j222-launch-card');
  card.append(make('strong','',row.label),make('span','j222-launch-status',row.status),make('p','',row.note));
  const links=make('div','j222-launch-actions');
  if(approved.test(row.href)){const a=make('a','', 'Open in Atlas');a.href='./'+row.href;links.append(a)}
  const src=sourceMap.get(row.sourceId);
  if(src&&/^https:\/\/www\.rockstargames\.com\//.test(src.url)){const a=make('a','', 'Rockstar source ↗');a.href=src.url;a.target='_blank';a.rel='noopener noreferrer';links.append(a)}
  card.append(links);host.append(card);
 }
 if(regions&&Array.isArray(db.regions)){regions.replaceChildren();
  for(const region of db.regions){const a=make('a','',region.name);a.href='https://www.rockstargames.com/VI/only-in-leonida';a.target='_blank';a.rel='noopener noreferrer';regions.append(a)}
 }
 state.textContent=db.categories.length+' categories · '+db.regions.length+' Rockstar-named regions · Reviewed '+db.reviewedAt;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();