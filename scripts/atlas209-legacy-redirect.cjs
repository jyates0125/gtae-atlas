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
function writeRedirectFile(out) {
  // Only the public shared homepage redirects. Old users can still visit
  // /atlas-account.html on the old origin to export locally stored progress
  // before importing a backup at the canonical GTAE site.
  const file=path.join(out,'_redirects');
  if(fs.existsSync(file))throw Error('Refusing to overwrite an existing redirect file');
  fs.writeFileSync(file,'/ https://gtae-online.pages.dev/ 302\n','utf8');
}
module.exports={isOldRelease,writeRedirectFile,LEGACY_HOST,PRIMARY};
