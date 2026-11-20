/* Team Jura Atlas 9.4 — eliminate redundant map chrome without replacing the engine. */
(()=>{'use strict';
const page=(location.pathname.split('/').pop()||'').toLowerCase();
const make=(type,cls,text)=>{const n=document.createElement(type);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
function leonida(){
 const sidebar=document.getElementById('sidebar');if(!sidebar)return;
 document.body.classList.add('j94-leonida');
 // Legacy duplicate legend must not intercept clicks or cover the illustration.
 const duplicate=document.getElementById('juraMapLegend');
 if(duplicate){duplicate.hidden=true;duplicate.open=false;duplicate.setAttribute('aria-hidden','true');duplicate.inert=true;}
 const trailer=document.getElementById('juraTrailerLegend');
 if(trailer){trailer.open=false;trailer.querySelector('summary')?.replaceChildren(document.createTextNode('🎞 Trailer & scene research · provisional'));}
 const stack=document.querySelector('.j86-legend-stack');
 if(stack){stack.classList.add('j94-research-stack');const heading=stack.querySelector('.j86-stack-heading');if(heading)heading.textContent='OPTIONAL RESEARCH REFERENCES';if(!sidebar.contains(stack))sidebar.append(stack);}
 // Regression repair: the native map engine supports Loki/Dupzor, but the option
 // disappeared from its static layer table. Restore the option, then dispatch
 // the native change event instead of constructing a competing map layer engine.
 const layer=document.getElementById('layer');
 function restoreLoki(){
  if(!layer||layer.querySelector('option[value="loki,view"]'))return;
  if(!layer.querySelector('option[value="scaly,view"]'))return;
  const opt=new Option('Loki · Styled V51','loki,view');
  layer.querySelector('option[value="scaly,view"]').after(opt);
 }
 restoreLoki();
 if(layer){const observer=new MutationObserver(()=>{if(layer.querySelector('option[value="scaly,view"]')&&!layer.querySelector('option[value="loki,view"]'))restoreLoki()});observer.observe(layer,{childList:true});
 const original=layer;original.addEventListener('change',()=>{document.body.dataset.j94View=original.value});}

 const quick=document.getElementById('threeDReference');
 if(quick){quick.hidden=true;quick.inert=true;quick.setAttribute('aria-hidden','true');}
 const tools=document.getElementById('jura3dTools'),toggle=document.getElementById('juraToggle3d');
 if(toggle){toggle.title='WebGL perspective; real relief requires an installed local heightfield';toggle.setAttribute('aria-label','Toggle 3D perspective (heightfield optional)');}
 if(tools&&!tools.querySelector('.j94-3d-note'))tools.append(make('small','j94-3d-note','3D is WebGL perspective. Terrain is flat if no local heightfield is installed. Use 2D to see the full illustrated map.'));
}
function research(){
 const rail=document.getElementById('rail');if(!rail)return;
 document.body.classList.add('j94-research');
 // The original research sidebar already owns source and category toggles.
 // Remove the old second "Map display & layers" panel entirely, keeping
 // progression tools below the same real legend and filters.
 const anchor=rail.querySelector('.toolbar');
 // Reuse the existing source-backed result list; it already owns the current
 // filters, visit state, selected pin and map camera. No duplicate data model.
 const progress=make('details','j94-progress');progress.append(make('summary','','✓ Research progress & backup'));
 const bar=make('div','j94-progress-actions');
 const next=make('button','','→ Next unvisited');next.type='button';
 const exportButton=make('button','','↓ Export progress');exportButton.type='button';
 const importLabel=make('label','','↑ Import progress');
 const importInput=make('input');importInput.type='file';importInput.accept='.json,application/json';importInput.setAttribute('aria-label','Import Team Jura research progress');importLabel.append(importInput);
 const status=make('p','j94-sub','Progress stays in this browser until exported. Only matching Team Jura research progress files are accepted.');status.setAttribute('role','status');
 bar.append(next,exportButton,importLabel);progress.append(bar,status);
 if(anchor)anchor.insertAdjacentElement('afterend',progress);else rail.prepend(progress);
 let lastName='';
 next.onclick=()=>{const list=document.getElementById('resultList'),more=document.getElementById('more');if(!list)return;
 let buttons=[...list.querySelectorAll('button.result')];const find=()=>buttons.filter(b=>!b.querySelector('small')?.textContent.includes('✓ Visited'));
 let pending=find(),loops=0;
 while(!pending.length&&more&&!more.hidden&&loops++<8){const old=buttons.length;more.click();buttons=[...list.querySelectorAll('button.result')];if(buttons.length<=old)break;pending=find();}
 if(!pending.length){status.textContent=more&&!more.hidden?'No unvisited place within the loaded results. Refine a category or use Show more.':'No unvisited places among current filtered results.';return;}
 let target=pending.find(b=>b.querySelector('b')?.textContent!==lastName)||pending[0];lastName=target.querySelector('b')?.textContent||'';target.click();status.textContent='Selected: '+lastName+' · provisional research record';};
 const STORE='jura-research-66',maxSize=2_000_000;
 const parse=(k)=>{try{const value=JSON.parse(localStorage.getItem(STORE+k)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch{return {}}};
 exportButton.onclick=()=>{const payload={schema:'team-jura-research-progress',version:1,exportedAt:new Date().toISOString(),visited:parse('-visited'),favorites:parse('-fav')};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=make('a');a.href=url;a.download='team-jura-leonida-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);status.textContent='Research progress backup exported. Save this file safely.';};
 importInput.onchange=async()=>{const file=importInput.files?.[0];if(!file)return;try{if(file.size>maxSize)throw Error('File exceeds 2 MB');const obj=JSON.parse(await file.text());if(obj?.schema!=='team-jura-research-progress'||obj.version!==1)throw Error('Not a Team Jura research backup');
 const valid=(o)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).length<100000&&Object.entries(o).every(([k,v])=>k.length<=400&&typeof v==='boolean');
 if(!valid(obj.visited)||!valid(obj.favorites))throw Error('Progress data invalid');
 if(!window.confirm('Merge this Team Jura progress backup into your current device? Existing completed and favorite places will be preserved.'))return;
 for(const [suffix,data] of [['-visited',obj.visited],['-fav',obj.favorites]])localStorage.setItem(STORE+suffix,JSON.stringify({...parse(suffix),...data}));
 status.textContent='Backup merged. Refresh the research page to update markers and progress.';
 }catch(err){status.textContent='Import rejected: '+err.message}finally{importInput.value='';}};
 const version=document.querySelector('header .brand span');if(version&&/ATLAS 7/i.test(version.textContent||''))version.textContent='ATLAS · COMMUNITY RESEARCH';
}
function init(){if(page==='atlas-vi.html')leonida();if(page==='atlas-research.html')research();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
