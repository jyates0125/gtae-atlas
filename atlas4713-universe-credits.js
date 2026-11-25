/* Searchable source registry, not another catalog or collection store. */
(()=>{'use strict';
const root=document.getElementById('universeSourceRows'),input=document.getElementById('universeSourceFilter'),status=document.getElementById('universeSourceCount');
if(!root||!input||!status)return;
const el=(tag,value)=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=value;return n};
const add=(host,label,url)=>{try{const u=new URL(url);if(u.protocol!=='https:')return;const a=el('a',label);a.href=u.href;a.rel='noopener noreferrer';a.target='_blank';const li=el('li');li.append(a);host.append(li)}catch{}};
Promise.allSettled(['data/atlas-universe-profiles.json','atlas-catalog.json','atlas-collections.json','atlas90-seed.json'].map(async p=>{const r=await fetch('./'+p);if(!r.ok)throw Error(p);return r.json()})).then(results=>{
 const get=i=>results[i].status==='fulfilled'?results[i].value:{};
 const rows=[...(get(0).records||[]),...(get(1).records||[]),...(get(2).sets||[]),...(get(3).vi||[])].filter(r=>r?.name);
 const archive='https://github.com/Stuyk/gtav-image-archive';
 for(const [kind,ids] of [['vehicle',get(3).vehicles||[]],['weapon',get(3).weapons||[]]])for(const id of ids)if(/^[a-z0-9_]+$/.test(id))rows.push({name:id,kind,sourceUrl:archive,verification:'GTA V shared archive reference; game availability not implied.'});
 function render(){
  const q=input.value.trim().toLowerCase();let matches=rows.filter(r=>[r.name,r.displayName,r.kind,r.group,r.type,...(r.aliases||[])].some(x=>String(x||'').toLowerCase().includes(q)));
  status.textContent=matches.length+' source records'+(matches.length>60?' · showing first 60; narrow the search':'')+(results.some(r=>r.status==='rejected')?' · some sources unavailable':'');
  root.replaceChildren();
  for(const r of matches.slice(0,60)){const item=el('details'),links=el('ul');item.append(el('summary',r.displayName||r.name),el('p',r.verification||r.confidence||'Reference index'),links);add(links,'Identity or catalog source',r.sourceUrl);add(links,'Image attribution',r.imageCredit);add(links,'Official cast credits',r.creditsUrl);if(!links.childElementCount)item.append(el('p','No individual URL recorded; see the source register above.'));root.append(item);}
 }
 input.value=(new URLSearchParams(location.search).get('universe')||'').slice(0,120);input.addEventListener('input',render);render();
});
})();
