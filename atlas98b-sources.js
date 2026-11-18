/* Original independent links to game-specific reference destinations.
 * Links do NOT license their databases/tiles for direct redistribution. */
(()=>{'use strict';const query=new URLSearchParams(location.search),alias={'vice-city':'vc','gta-iii':'iii','vice-city-stories':'vcs','liberty-city-stories':'lcs','chinatown-wars':'ctw','lost-and-damned':'tlad','ballad-of-gay-tony':'tbogt'},raw=(query.get('game')||query.get('world')||'iii').toLowerCase(),world=alias[raw]||raw;
const refs={
 iii:{href:'https://gtamap.io/gta-3-map/',title:'GTA III independent map reference',license:'Pin geometry on independent sites is not automatically licensed for redistribution.'},
 vc:{href:'https://gtamap.io/gta-vice-city-map/',title:'Vice City independent map reference',license:'Separate source datasets and artworks can have different rights.'},
 vcs:{href:'https://gtamap.io/gta-vice-city-stories-map/',title:'Vice City Stories source map',license:'PSP and PS2 editions include differing rampage/jump totals.'},
 lcs:{href:'https://gtamap.io/gta-liberty-city-stories-map/',title:'Liberty City Stories source map',license:'Game coordinates shown elsewhere are not automatically available for Atlas redistribution.'},
 ctw:{href:'https://gtamap.io/gta-chinatown-wars-map/',title:'Chinatown Wars reference map',license:'The existing PDA image is not a calibrated world-coordinate layer.'},
 tlad:{href:'https://gtamap.io/gta-maps/',title:'GTA IV Episodes and maps directory',license:'Episode collectibles are tracked separately from GTA IV.'},
 tbogt:{href:'https://gtamap.io/gta-maps/',title:'GTA IV Episodes and maps directory',license:'Episode collectibles are tracked separately from GTA IV.'}
};
function init(){const ref=refs[world],box=document.querySelector('.classic-info');if(!ref||!box||document.getElementById('j98b-source-link'))return;
 const label=document.createElement('p');label.className='eyebrow';label.textContent='GAME-SPECIFIC MAP REFERENCE';const link=document.createElement('a');link.id='j98b-source-link';link.href=ref.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=ref.title+' ↗';const note=document.createElement('small');note.textContent=ref.license;box.insertBefore(note,box.firstChild);box.insertBefore(link,box.firstChild);box.insertBefore(label,box.firstChild)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
