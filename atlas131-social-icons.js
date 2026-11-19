/* Team Jura Atlas 13.1: honest brand-icon buttons for actual share flows.
   Facebook/Reddit use web share dialogs. The others use OS native share
   when supported; on desktop copy a URL and open the platform for manual paste.
   No account access, scraping, or pretending to auto-post. */
(()=>{'use strict';
if(window.__juraUniversalSocialReady)return;window.__juraUniversalSocialReady=true;
const URL='https://team-jura-atlas-preview.pages.dev/';
const artwork={
 facebook:'<path fill="currentColor" d="M13.2 4.1h4.4V0h-5C7.8 0 6 3 6 7.7V12H2v4.7h4V30h5.4V16.7h4.2L16.3 12h-4.9V8c0-2.1.5-3.9 1.8-3.9Z" transform="translate(7 1) scale(.93)"/>',
 youtube:'<rect x="2" y="7" width="30" height="20" rx="6" fill="currentColor"/><path d="M14 12.5v9l8-4.5-8-4.5Z" fill="#fff"/>',
 tiktok:'<path d="M21 4c.6 4.2 2.7 6.1 7 6.8v5.5c-2.7 0-5.2-.8-7-2.3v8.2c0 5.4-4 9.3-9.2 9.3-5.1 0-8.8-3.7-8.8-8.4 0-5.7 4.8-9.8 10.8-9.1v5.6c-2.9-.6-5.1 1.1-5.1 3.5 0 2.1 1.5 3.6 3.6 3.6 2.4 0 3.7-1.5 3.7-4.5V4h5Z" fill="currentColor"/>',
 instagram:'<rect x="4" y="4" width="26" height="26" rx="8" stroke="currentColor" stroke-width="3" fill="none"/><circle cx="17" cy="17" r="6" stroke="currentColor" stroke-width="3" fill="none"/><circle cx="25" cy="9" r="2" fill="currentColor"/>',
 discord:'<path d="M8 8c5.8-3 12.2-3 18 0l3.8 18c-3.3 2.4-6.9 3.6-10.8 4.2l-.8-2.4c1.7-.2 3.4-.8 4.8-1.7-4.7 2-9.6 2-14.2 0 1.4.9 3.1 1.5 4.8 1.7l-.8 2.4C8.9 29.6 5.3 28.4 2 26L5.8 8 8 8Z" fill="currentColor"/><circle cx="12.2" cy="19" r="2" fill="#170a2a"/><circle cx="21.8" cy="19" r="2" fill="#170a2a"/>',
 reddit:'<circle cx="17" cy="20" r="12" fill="currentColor"/><ellipse cx="17" cy="22" rx="9" ry="7" fill="#fff"/><circle cx="12.5" cy="20" r="1.9" fill="#ff612b"/><circle cx="21.5" cy="20" r="1.9" fill="#ff612b"/><path d="M12.5 25c2.5 2 6.5 2 9 0" stroke="#ff612b" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M17 9 19 3l6 1" stroke="currentColor" stroke-width="2" fill="none"/>',
 more:'<path d="M12 9 19 2v5c6 .5 10.8 5.4 11 12.2-4-5.1-7.6-5.4-11-5.4V20l-7-7 0-4Z" fill="currentColor"/><path d="M8 17H4v12h22v-9" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
};
const labels={facebook:'Facebook',youtube:'YouTube',tiktok:'TikTok',instagram:'Instagram',discord:'Discord',reddit:'Reddit',more:'More apps'};
const shareTarget=(key,url)=>{
 if(key==='facebook')return 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url);
 if(key==='reddit')return 'https://www.reddit.com/submit?url='+encodeURIComponent(url)+'&title='+encodeURIComponent('Team Jura Atlas · Public Preview');
 return null;
};
function currentShareURL(){const here=new URL(location.href);if(here.origin==='https://team-jura-atlas-preview.pages.dev')return here.href;return new URL(location.pathname+location.search,URL).href}
function status(container,text){let p=container.querySelector('.j131-social-status');if(p)p.textContent=text}
async function copy(value){try{await navigator.clipboard.writeText(value);return true}catch(_){let input=document.createElement('textarea');input.value=value;input.style.position='fixed';input.style.left='-5000px';document.body.append(input);input.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}input.remove();return ok}}
async function selected(key,container){
 const url=currentShareURL();const direct=shareTarget(key,url);
 if(direct){const anchor=document.createElement('a');anchor.href=direct;anchor.target='_blank';anchor.rel='noopener noreferrer';document.body.append(anchor);anchor.click();anchor.remove();status(container,'Opened '+labels[key]+' share. Sign in there if prompted, then choose Post.');return}
 // Web Share chooses the app itself on supported devices; no undocumented upload URL.
 if(navigator.share){try{await navigator.share({title:'Team Jura Atlas · Elario Studios',text:'Many Crews. One Vision. Explore the public development preview.',url});status(container,'Choose the app and complete sharing there.');return}catch(err){if(err?.name==='AbortError'){status(container,'Sharing cancelled.');return}}}
 const success=await copy(url);
 const destinations={youtube:'https://www.youtube.com/',tiktok:'https://www.tiktok.com/',instagram:'https://www.instagram.com/',discord:'https://discord.com/app'};
 const dest=destinations[key];
 if(dest){const a=document.createElement('a');a.href=dest;a.target='_blank';a.rel='noopener noreferrer';document.body.append(a);a.click();a.remove()}
 status(container,success?'Atlas link copied. Sign in to '+(labels[key]||'the app')+' and paste it into your post.':'Open '+(labels[key]||'your app')+' and paste the Atlas link: '+url);
}
function inject(node){
 if(!node)return;
 const existing=node.querySelector('.j131-social');
 if(existing){for(const button of existing.querySelectorAll('button[data-j131-platform]')){const key=button.dataset.j131Platform;if(!labels[key]||button.dataset.j131Ready)return;button.dataset.j131Ready='true';button.addEventListener('click',()=>selected(key,existing));}return;}
 const region=document.createElement('section');region.className='j131-social';region.setAttribute('aria-label','Share Team Jura Atlas with your community');
 const heading=document.createElement('div');heading.className='j131-social-title';
 heading.innerHTML='<div><h2>Share the Atlas</h2><p>Many Crews. One Vision. Share a page with your community.</p></div><a href="./atlas-share.html">Sharing options ›</a>';
 const grid=document.createElement('div');grid.className='j131-social-grid';
 for(const key of Object.keys(labels)){
 const button=document.createElement('button');button.type='button';button.dataset.j131Platform=key;
 button.setAttribute('aria-label','Share Team Jura Atlas with '+labels[key]);
 button.innerHTML='<svg viewBox="0 0 34 34" aria-hidden="true" focusable="false" fill="none" xmlns="http://www.w3.org/2000/svg">'+artwork[key]+'</svg><span>'+labels[key]+'</span>';
 button.addEventListener('click',()=>selected(key,region));grid.append(button);
 }
 const hint=document.createElement('p');hint.className='j131-social-hint';hint.textContent='Facebook and Reddit open a share composer. On iPhone, other icons can open the system Share sheet; some platforms require pasting your link after sign-in.';
 const live=document.createElement('p');live.className='j131-social-status';live.setAttribute('aria-live','polite');live.setAttribute('role','status');
 region.append(heading,grid,hint,live);node.append(region);
}
function init(){
 // One small, predictable footer on every published route; never interrupt the page body.
 // Relocate older per-page sharing modules rather than duplicating them.
 let host=document.querySelector('[data-j131-social-host]');
 const footer=document.createElement('footer');
 footer.className='j133-universal-footer';
 footer.setAttribute('aria-label','Community sharing and site resources');
 if(host){
   host.removeAttribute('class');
   footer.append(host);
 }else{
   host=document.createElement('div');
   host.setAttribute('data-j131-social-host','');
   footer.append(host);
 }
 const links=document.createElement('nav');
 links.className='j133-footer-links';
 links.setAttribute('aria-label','Footer navigation');
 links.innerHTML='<a href="./index.html">Welcome</a><a href="./maps.html">Maps</a><a href="./atlas93-garage.html">My Garage</a><a href="./atlas-account.html">Guest backup</a><a href="./atlas-credits.html">Sources &amp; rights</a><a href="./atlas-share.html">Share</a>';
 const legal=document.createElement('p');legal.className='j133-footer-legal';legal.textContent='Elario Studios · Team Jura Atlas · Independent fan project. Not affiliated with Rockstar Games or Take-Two Interactive.';
 footer.append(links,legal);
 document.body.append(footer);
 inject(host);
 const title=host.querySelector('.j131-social-title');
 if(title){const h=title.querySelector('h2');if(h)h.textContent='Share the Atlas';const sub=title.querySelector('p');if(sub)sub.textContent='Many Crews. One Vision. Share this page with your community.';const a=title.querySelector('a');if(a){a.textContent='Sharing options ›';a.href='./atlas-share.html';}}
 const hint=host.querySelector('.j131-social-hint');if(hint)hint.textContent='User-initiated sharing. Some apps require pasting your link after sign-in.';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
