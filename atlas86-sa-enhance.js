/* Team Jura built-in San Andreas 2D map, available locally.
 * Source 1: Toliak vector tracing, Apache-2.0, bundled; see art/atlas-sa-vector.LICENSE.txt.
 * Source 2: credited MTA San Andreas 2048 image fallback (MIT repository).
 * Never assume image pixels establish collectible spawn coordinates.
 */
(()=>{'use strict';
const SOURCES=[
 {url:'./art/atlas-sa-vector.svg',label:'Toliak San Andreas vector map · Apache-2.0 · bundled locally',mapped:true},
 {url:'https://raw.githubusercontent.com/gptrk0/mtasa-map-images/master/default/map_default_2048.jpg',label:'Patrick / gptrk0 in-game map image · MIT repository',mapped:true},
 {url:'./art/country.svg',label:'Team Jura original illustration · not coordinate-calibrated',mapped:false}
];
function init(){
 const bg=document.getElementById('mapBackground'),status=document.getElementById('mapStatus');
 if(!bg)return;
 const image=document.createElement('img');image.decoding='async';image.loading='eager';image.className='j86-san-map';
 let index=0;
 const load=()=>{const source=SOURCES[index];image.alt=source.label+'; game world art © respective rights holders';image.src=source.url};
 image.addEventListener('load',()=>{
  if(!bg.contains(image))return;
  bg.classList.add('j86-map-loaded');
  const source=SOURCES[index];
  if(source.mapped){
   const accepted=window.TeamJuraSAArtwork?.attach(image.naturalWidth,image.naturalHeight,source.label);if(accepted&&index===0)window.dispatchEvent(new Event('jura-sa-vector-ready'));
  }
  if(status)status.textContent=source.label+' · artwork loaded · collectible pins require a coordinate-matched, attributed source pack';
 });
 image.addEventListener('error',()=>{
  if(!bg.contains(image))return;
  if(++index<SOURCES.length){load();return}
  image.remove();bg.classList.remove('j86-map-loaded');
  if(status)status.textContent='Could not load the bundled map artwork or fallbacks; collection records remain accessible';
 });
 bg.replaceChildren(image);load();
 const credits=document.querySelector('.credits');
 if(credits&&!credits.querySelector('[data-atlas-sa-license]')){
  const note=document.createElement('p');note.className='j86-sa-credit';note.dataset.atlasSaLicense='true';
  note.append('San Andreas map: ');
  const vector=document.createElement('a');vector.href='https://github.com/Toliak/San-Andreas-vector-map';vector.target='_blank';vector.rel='noopener noreferrer';vector.textContent='Toliak · Apache-2.0 vector';
  const older=document.createElement('a');older.href='https://github.com/gptrk0/mtasa-map-images';older.target='_blank';older.rel='noopener noreferrer';older.textContent='MTA:SA in-game reference';
  note.append(vector,' · backup ',older,'. World artwork remains © Rockstar Games/Take-Two. No invented collectible coordinates.');credits.append(note);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
