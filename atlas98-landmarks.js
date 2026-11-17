/* Source-attributed CC BY 4.0 landmark data viewer. Never claims all points are collectibles. */
(()=>{'use strict';const $=q=>document.querySelector(q);const E=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=value;return x};
 const cache=new Map();let current='6',rows=[],shown=[],page=0,token=0;const PAGE=40;
 const mapLinks={'4':'atlas-iv.html','5':'atlas.html','6':'atlas-vi.html'};
 const status=t=>$('#landmarkStatus').textContent=t;
 function parse(data,game){const payload=data?.records||data;
   if(Array.isArray(data?.entries))return data.entries.filter(r=>Array.isArray(r)&&typeof r[1]==='string').map(r=>({id:r[0],name:r[1],xy:Number.isFinite(r[2])&&Number.isFinite(r[3])?[r[2],r[3]]:null,real:r[4]||'',tags:Array.isArray(r[5])?r[5]:[],game}));
   if(Array.isArray(payload))return payload.filter(r=>r&&typeof r.name==='string').map(r=>({id:r.id||'',name:r.name,xy:Number.isFinite(r.x)&&Number.isFinite(r.y)?[r.x,r.y]:null,real:r.address||'',tags:Array.isArray(r.tags)?r.tags:[],game}));
   if(typeof payload!=='object'||!payload)throw Error('Invalid JSON records');
   return Object.entries(payload).filter(([id,r])=>Array.isArray(r)&&typeof r[0]==='string').map(([id,r])=>({id,name:r[0],xy:Array.isArray(r[1])&&r[1].length===2&&r[1].every(n=>typeof n==='number')?r[1]:null,real:typeof r[3]==='string'?r[3]:'',tags:Array.isArray(r[6])?r[6].filter(x=>typeof x==='string'):[],game}));}
 async function load(game){current=game;const selected=++token;status('Loading saved offline '+(game==='6'?'provisional ':'')+'landmarks…');$('#landmarkWorld').href='./'+mapLinks[game];
  try{if(!cache.has(game)){
    let data=null,starter=false;
    const resp=await fetch('./data/gtadb-'+game+'.json',{cache:'no-cache'});
    if(resp.ok)data=await resp.json();
    else{const fallback=game==='4'?'./data/gtadb-iv-starter.json':'./gtadb-v'+game+'.json';const basic=await fetch(fallback);if(!basic.ok)throw Error('No bundled landmark reference');data=await basic.json();starter=true;}
    cache.set(game,{rows:parse(data,game),starter});}
    if(selected!==token)return;rows=cache.get(game).rows;$('#landmarkSearch').value='';categoryOptions();render();if(cache.get(game).starter)status(rows.length+' offline starter landmarks (not a complete database). CC BY 4.0 · GTADB.ORG.');}
  catch(e){if(selected!==token)return;rows=[];shown=[];$('#landmarkResults').replaceChildren();$('#landmarkCategory').replaceChildren(E('option','','All categories'));const link=E('a','','Browse the GTADB.ORG source repository ↗');link.href='https://github.com/rolux/gtadb.org/tree/main/map/data/'+game;link.target='_blank';link.rel='noopener noreferrer';$('#landmarkResults').append(link);$('#landmarkPage').textContent='No local snapshot';status('Offline data unavailable for this world. Run scripts/sync_atlas98_gtadb.py and commit its generated files; existing GTA VI snapshots are preserved.');}
 }
 function categoryOptions(){const tagCount=new Map();for(const r of rows)for(const tag of r.tags)tagCount.set(tag,(tagCount.get(tag)||0)+1);const select=$('#landmarkCategory');select.replaceChildren();const all=E('option','','All categories');all.value='';select.append(all);for(const tag of [...tagCount.keys()].sort((a,b)=>a.localeCompare(b))){const opt=E('option','',tag+' ('+tagCount.get(tag)+')');opt.value=tag;select.append(opt)}}
 function render(){const q=$('#landmarkSearch').value.trim().toLocaleLowerCase(),category=$('#landmarkCategory').value;shown=rows.filter(r=>(!category||r.tags.includes(category))&&(!q||[r.id,r.name,r.real,...r.tags].join(' ').toLowerCase().includes(q)));page=0;paint()}
 function paint(){const list=$('#landmarkResults');list.replaceChildren();const ptotal=Math.max(1,Math.ceil(shown.length/PAGE));page=Math.max(0,Math.min(page,ptotal-1));const data=shown.slice(page*PAGE,(page+1)*PAGE);
 for(const r of data){const article=E('article','landmark-entry');article.append(E('h3','',r.name),E('small','',r.id+' · '+(r.tags.join(', ')||'uncategorized')));
   article.append(E('p','',r.xy?'Game-space X/Y: '+r.xy.map(x=>x.toFixed(2)).join(', '):'No mapped game coordinates'));
   if(r.real)article.append(E('p','','Real-world inspiration: '+r.real));const copy=E('button','','Copy coordinates');copy.type='button';copy.disabled=!r.xy;copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(r.xy.join(', '));copy.textContent='Copied'}catch{copy.textContent='Copy unavailable'}});article.append(copy);if(r.xy&&/^L[0-9]+$/.test(String(r.id))){const jump=E('a','landmark-map-link','View on game map ↗');jump.href='./'+mapLinks[current]+'?'+(current==='4'?'loc=':'place=gtadb-'+current+'-')+encodeURIComponent(r.id);jump.setAttribute('aria-label','View '+r.name+' on the GTA '+current+' map');article.append(jump)}list.append(article)}
 if(!data.length)list.append(E('p','','No matching landmark records. Try another name or category.'));
 $('#landmarkPrev').disabled=page===0;$('#landmarkNext').disabled=page>=ptotal-1;$('#landmarkPage').textContent='Page '+(page+1)+' / '+ptotal;
 status(shown.length.toLocaleString()+' of '+rows.length.toLocaleString()+' sourced landmarks shown.'+(current==='6'?' GTA VI points remain community-provisional.':'')+' CC BY 4.0 · GTADB.ORG.');
 }
 function init(){const initial=new URLSearchParams(location.search).get('game');const initialGame=['4','5','6'].includes(initial)?initial:'6';$('#landmarkGame').value=initialGame;$('#landmarkGame').addEventListener('change',e=>load(e.target.value));$('#landmarkSearch').addEventListener('input',render);$('#landmarkCategory').addEventListener('change',render);$('#landmarkPrev').addEventListener('click',()=>{page--;paint()});$('#landmarkNext').addEventListener('click',()=>{page++;paint()});load(initialGame)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
