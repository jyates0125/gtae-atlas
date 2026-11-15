/* Atlas 9.2 reliable Daily Intelligence: fixes empty state, NOT a live location feed. */
(()=>{'use strict';
const PATH=(location.pathname.split('/').pop()||'').toLowerCase();
if(PATH!=='atlas87-daily.html')return;
const SOURCES=[
['gun-van','Gun Van',6,'https://gtadb.net/gta-online-map/gun-van/'],
['shipwreck','Shipwreck',6,'https://gtadb.net/gta-online-map/shipwrecks/'],
['street-dealers','Street Dealers',7,'https://gtadb.net/gta-online-map/street-dealers/'],
['smoke-products','Smoke on the Water Products',6,'https://gtadb.net/gta-online-map/interactive/'],
['ls-tags','LS Tags',6,'https://gtadb.net/gta-online-map/interactive/'],
['hidden-caches','Hidden Caches',6,'https://gtadb.net/gta-online-map/interactive/'],
['junk-skydives','Junk Energy Skydives',6,'https://gtadb.net/gta-online-map/interactive/'],
['cayo-chests','Cayo Treasure Chests',6,'https://gtadb.net/gta-online-map/interactive/'],
['cayo-stashes','Cayo Buried Stashes',6,'https://gtadb.net/gta-online-map/interactive/']];
function card(root,id,name,reset,source){const article=document.createElement('article');article.className='j87-daily-card';article.dataset.status='missing';const title=document.createElement('div');title.className='j87-daily-title';const strong=document.createElement('strong');strong.textContent=name;const time=document.createElement('span');time.textContent='Reset '+String(reset).padStart(2,'0')+':00 UTC';title.append(strong,time);const status=document.createElement('p');status.textContent='Current positions not verified';const note=document.createElement('small');note.textContent='Category available. Exact selected pins require a dated, licensed source; possible spawn sites are not today’s confirmed positions.';const links=document.createElement('div');links.className='j87-daily-links';for(const [label,url] of [['Activity tracker','./atlas-activities.html?mode=online'],['Check source ↗',source]]){const a=document.createElement('a');a.textContent=label;a.href=url;if(/^https:/.test(url)){a.target='_blank';a.rel='noopener noreferrer'}links.append(a)}article.append(title,status,note,links);root.append(article)}
function ensure(){const list=document.getElementById('j87-daily-list'),summary=document.getElementById('j87-daily-summary');if(!list)return;
 if(!list.children.length){for(const r of SOURCES)card(list,...r);if(summary)summary.textContent='9 daily categories · fallback labels · no live location feed connected';}
 const actions=document.querySelector('.j87-daily-actions');if(actions&&!document.getElementById('j92-refresh-source')){const link=document.createElement('a');link.id='j92-refresh-source';link.href='https://gtadb.net/gta-online-map/interactive/';link.target='_blank';link.rel='noopener noreferrer';link.textContent='↗ View GTADB dated daily status';actions.append(link);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(ensure,0),{once:true});else setTimeout(ensure,0);
})();
