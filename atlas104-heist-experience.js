/* Atlas 10.4 — heist-specific planning front end. Existing checklists/pins/data untouched. */
(()=>{'use strict';const page=(location.pathname.split('/').pop()||'').toLowerCase();if(page!=='heists.html'&&!/^heist-[a-z0-9-]+\.html$/.test(page))return;
const $=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n};
const title=page==='heists.html'?'HEIST HQ':(document.querySelector('.hero h1')?.textContent||'Heist operation').trim();
function init(){
 const sheet=$('link');sheet.rel='stylesheet';sheet.href='./atlas104-heist-experience.css?v=104';document.head.append(sheet);
 const brand=document.querySelector('.sitebar a.brand');if(brand){const img=$('img','j104-logo');img.src='./art/elario-crest.svg';img.width=40;img.height=40;img.alt='';const body=$('span','j104-brand-copy');body.append($('small','','ELARIO STUDIOS PRESENTS'),$('strong','','TEAM JURA ATLAS'),$('small','','MANY CREWS · ONE VISION'));brand.replaceChildren(img,body)}
 const hero=document.querySelector('.hero');if(hero){hero.classList.add('j104-heist-hero');const key=title.toLowerCase();hero.dataset.theme=/cayo|island/.test(key)?'island':/casino|diamond/.test(key)?'casino':/doomsday|facility|humane/.test(key)?'facility':/fleeca|standard/.test(key)?'bank':'urban';const chip=$('span','j104-world-chip','GTA ONLINE · MISSION-SPECIFIC PLANNING');hero.append(chip)}
 if(page==='heists.html'){document.querySelectorAll('.cards .card').forEach(card=>{const name=card.querySelector('h2')?.textContent||'';card.dataset.theme=/cayo/i.test(name)?'island':/casino/i.test(name)?'casino':/doomsday|humane/i.test(name)?'facility':/fleeca|standard/i.test(name)?'bank':'urban';const h=card.querySelector('h2');if(h)h.insertAdjacentElement('beforebegin',$('span','j104-card-emblem',card.dataset.theme==='island'?'◒':card.dataset.theme==='casino'?'◇':card.dataset.theme==='facility'?'⛭':'♜'))});return}
 const root=document.querySelector('.mapbox');if(!root)return;root.classList.add('j104-map-workspace');const pane=$('section','j104-plan-brief');pane.id='missionBrief';
 const header=$('div','j104-brief-header');header.append($('p','j104-overline','YOUR OPERATION / PERSONAL ROUTE PLANNER'),$('h3','','Mission briefing · '+title));pane.append(header);
 const stage=$('figure','j104-brief-visual');const img=$('img');img.src='./art/atlas104-heist-schematic.svg';img.alt='Original unscaled mission routing schematic, not actual GTA Online map locations';img.loading='lazy';img.width=960;img.height=540;const caption=$('figcaption','','Illustrative planning schematic — no verified route or pin coordinates. Use the personal pinboard and checklists to build your own plan.');stage.append(img,caption);pane.append(stage);
 const tasks=[...document.querySelectorAll('.steps [data-step]')].slice(0,8).map(n=>n.dataset.step||n.textContent.trim()).filter(Boolean);
 if(tasks.length){const list=$('ol','j104-mission-flow');for(const task of tasks){const li=$('li');li.append($('span','','PHASE '+String(list.children.length+1).padStart(2,'0')),$('strong','',task));list.append(li)}pane.append(list)}
 const notes=$('p','j104-evidence','No route/payout/entry point is asserted as verified unless a dated source is attached in your intel ledger. No community source assets are copied onto this board.');
 pane.append(notes);
 const actions=$('div','j104-heist-actions');const btn=$('button','','Open personal pinboard ↓');btn.type='button';btn.onclick=()=>{const board=document.querySelector('.j92-heist-workspace');if(board){board.scrollIntoView({block:'start',behavior:'smooth'});const focus=board.querySelector('input,button');focus?.focus({preventScroll:true})}else document.querySelector('#missionBrief')?.scrollIntoView()};actions.append(btn);
 const gameMap=page==='heist-cayo-perico.html'?'./atlas-cayo.html':null;
 if(gameMap){const a=$('a','','Open Cayo island planner ↗');a.href=gameMap;actions.append(a)}
 pane.append(actions);root.prepend(pane);
 const legacy=[...root.querySelectorAll('a')].find(a=>/Open existing interactive map|Open (?:existing )?world map/i.test(a.textContent));
 if(legacy){const optional=$('details','j104-optional-world');optional.append($('summary','','Optional general GTA Online world map (not a mission map)'));const p=$('p','','Use this only for broad travel orientation. Mission pins and verified objective positions are not provided by the general map.');legacy.textContent='Open general GTA Online map ↗';optional.append(p,legacy);pane.append(optional)}
 const oldImg=[...root.querySelectorAll(':scope > img')];for(const old of oldImg){old.loading='lazy';old.style.maxHeight='185px';old.setAttribute('aria-label','Legacy illustrative setting artwork — not a heist map')}
 const generalIntro=root.querySelector(':scope > p');if(generalIntro)generalIntro.classList.add('j104-old-note');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();