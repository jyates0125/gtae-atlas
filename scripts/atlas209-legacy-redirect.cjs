/**
 * Team Jura 20.9: old Pages project only, on a release branch.
 * Cloudflare injects CF_PAGES, CF_PAGES_BRANCH, and CF_PAGES_URL.
 * No global/shared _redirects in source: same code deploys to both projects.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const LEGACY_HOST='team-jura-atlas-preview.pages.dev';
const PRIMARY='https://gtae-online.pages.dev/';
function isOldRelease(env) {
  if(env.CF_PAGES!=='1' || !['development','main'].includes(env.CF_PAGES_BRANCH))return false;
  try {
    const u=new URL(env.CF_PAGES_URL);
    return u.protocol==='https:' && !u.port && !u.username && !u.password &&
      (u.hostname===LEGACY_HOST ||
       /^[a-z0-9-]+\.team-jura-atlas-preview\.pages\.dev$/.test(u.hostname));
  }catch(_){return false}
}
function writeRedirectSite(out) {
  fs.rmSync(out,{recursive:true,force:true});
  fs.mkdirSync(out,{recursive:true});
  // 302 is intentional until deployed HTTP responses are independently checked.
  fs.writeFileSync(path.join(out,'_redirects'),
    '/ https://gtae-online.pages.dev/ 302\n' +
    '/* https://gtae-online.pages.dev/:splat 302\n');
  fs.writeFileSync(path.join(out,'index.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="noindex">' +
    '<link rel="canonical" href="https://gtae-online.pages.dev/">' +
    '<meta http-equiv="refresh" content="0;url=https://gtae-online.pages.dev/">' +
    '<title>Team Jura Atlas moved to GTAE Explorer</title></head><body>' +
    '<main><h1>Team Jura Atlas has moved</h1>' +
    '<p>Continue to <a href="https://gtae-online.pages.dev/">GTAE Explorer</a>.</p>' +
    '</main></body></html>\n');
}
module.exports={isOldRelease,writeRedirectSite,LEGACY_HOST,PRIMARY};
