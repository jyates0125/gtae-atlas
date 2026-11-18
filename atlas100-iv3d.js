/* Atlas 10 · same-page GTA IV 2D/3D map toggle.
 * MIT map geometry from GTADB.ORG (attributed in atlas100-gtadb-flat3d.js).
 * Source tiles pinned to the CC BY 4.0 repository commit; no invented positions,
 * no extra collection database, and no change to 2D saved progress.
 */
(()=>{'use strict';
 const tileRoot='https://raw.githubusercontent.com/rolux/gtadb.org/0d79c62bd47f7521b6847ec676b0f7389231101a/maps/tiles';
 const $=id=>document.getElementById(id);
 const source='https://github.com/rolux/gtadb.org/tree/0d79c62bd47f7521b6847ec676b0f7389231101a/maps/tiles/4';
 let viewer=null,open=false,panel=null,button=null;
 function make(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
 function close(){
  if(!open)return;
  open=false;viewer?.set({focused:false});viewer?.hide();
  panel.hidden=true;button.setAttribute('aria-pressed','false');button.textContent='▨ 3D Map';
  document.body.classList.remove('j100-3d-open');
  button.focus({preventScroll:true});
 }
 function launch(){
  const bridge=window.TeamJuraIV3DBridge;
  if(!bridge){$('j100-3d-note').textContent='GTA IV map is still loading; try again.';return}
  if(!window.gtadb?.Map3DFlat){$('j100-3d-note').textContent='The 3D renderer did not load. The 2D map remains available.';return}
  try{
   if(!panel){
    panel=make('section','j100-3d-panel');panel.id='j100-3d-panel';
    panel.setAttribute('aria-label','Liberty City 3D map perspective');panel.hidden=true;
    const view=make('div','j100-3d-viewer');view.id='j100-3d-viewer';
    const bar=make('div','j100-3d-bar');
    const back=make('button','j100-back','← Back to 2D');back.type='button';back.onclick=close;
    const north=make('button','','N ↑');north.type='button';
    north.onclick=()=>{if(viewer){const v=viewer.get();viewer.set({x:v.x,y:v.y,z:v.z});}};
    const plus=make('button','','+');plus.type='button';plus.setAttribute('aria-label','Zoom in 3D');
    plus.onclick=()=>{if(viewer){const v=viewer.get();viewer.set({z:Math.min(5,v.z+.55)})}};
    const minus=make('button','','−');minus.type='button';minus.setAttribute('aria-label','Zoom out 3D');
    minus.onclick=()=>{if(viewer){const v=viewer.get();viewer.set({z:Math.max(.1,v.z-.55)})}};
    const status=make('span','j100-3d-status','GTA IV · sourced 3D flat perspective');status.setAttribute('role','status');status.id='j100-3d-status';
    bar.append(back,north,plus,minus,status);
    const credit=make('div','j100-3d-credit');
    credit.append('GTADB.org 3D renderer · MIT · ');
    const citation=make('a','','Map tiles CC BY 4.0 ↗');citation.href=source;citation.target='_blank';citation.rel='noopener noreferrer';
    credit.append(citation, ' · Perspective is flat; not an elevation mesh');
    panel.append(view,bar,credit);document.body.append(panel);
    viewer=new window.gtadb.Map3DFlat({parentElement:view,v:4,tileRoot,tileSet:'original',
      x:150,y:40,z:3.4,maxZ:5,maxTilesPerLayer:56,landmarks:[],currentLandmarks:[],focused:false});
    viewer.hide();
    viewer.addEventListener('select',e=>{if(e.detail?.id)bridge.select(e.detail.id)});
   }
   const state=bridge.state(),landmarks=bridge.visible();
   viewer.set({v:4,tileSet:state.layer,x:state.x,y:state.y,z:Math.max(.1,Math.min(5,state.z)),
      landmarks,currentLandmarks:landmarks,selected:state.selectedId||null,focused:false});
   panel.hidden=false;document.body.classList.add('j100-3d-open');
   open=true;viewer.show();button.textContent='▣ Back to 2D';button.setAttribute('aria-pressed','true');
   $('j100-3d-status').textContent=landmarks.length+' source markers · '+(state.layer==='elevation'?'Elevation-color artwork':'Original artwork')+' · 3D flat perspective';
   panel.querySelector('.j100-back')?.focus({preventScroll:true});
  }catch(err){
   open=false;if(panel)panel.hidden=true;
   button.textContent='▨ 3D Map';button.setAttribute('aria-pressed','false');
   document.body.classList.remove('j100-3d-open');
   $('j100-3d-note').textContent='3D rendering unavailable ('+String(err.message||err).slice(0,110)+'). The original 2D map remains active.';
   console.warn('Liberty City 3D fallback:',err);
  }
 }
 function init(){
  const dock=document.querySelector('.classic-layer-dock');if(!dock||$('classic3dToggle'))return;
  button=make('button','','▨ 3D Map');button.type='button';button.id='classic3dToggle';
  button.setAttribute('aria-label','Toggle GTADB licensed 3D map perspective');
  button.setAttribute('aria-pressed','false');
  button.onclick=()=>open?close():launch();
  dock.append(button);
  const note=make('small','j100-3d-note','2D + licensed 3D perspective · source data shared');note.id='j100-3d-note';
  dock.closest('.classic-map-top')?.append(note);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open){e.preventDefault();close()}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
