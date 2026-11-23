/** Temporary GTAE Pages-only rules against retained assets from legacy root deployments.
 * Cloudflare Pages can retain old static assets; redirect precedence wins
 * over a previously uploaded source file. Never emit on old Pages or previews.
 * Keep browser assets, routes and guest exports accessible.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const RULES = [
  '/scripts/* /atlas-policies.html 302',
  '/.github/* /atlas-policies.html 302',
  '/.git/* /atlas-policies.html 302',
  '/docs/* /atlas-policies.html 302',
  '/qa-evidence/* /atlas-policies.html 302',
  '/private-lab/* /atlas-policies.html 302',
  '/research-private/* /atlas-policies.html 302',
  '/user-exports/* /atlas-policies.html 302',
  '/tests/* /atlas-policies.html 302',
  '/tools/* /atlas-policies.html 302',
  '/reference-pack/* /atlas-policies.html 302',
  '/optional/* /atlas-policies.html 302',
  '/.env* /atlas-policies.html 302',
  '/README.md /atlas-policies.html 302',
  '/AGENTS.md /atlas-policies.html 302',
  '/package.json /atlas-policies.html 302',
  '/package-lock.json /atlas-policies.html 302',
  '/MANIFEST-SHA256.txt /atlas-policies.html 302'
].join('\n')+'\n';
function isPrimaryProduction(env) {
  if (env.CF_PAGES!=='1' || env.CF_PAGES_BRANCH!=='main') return false;
  try {
    const url=new URL(env.CF_PAGES_URL);
    if(url.protocol!=='https:' || url.username || url.password || url.port) return false;
    return url.hostname==='gtae-online.pages.dev' ||
      /^[a-z0-9-]+\.gtae-online\.pages\.dev$/.test(url.hostname);
  } catch (_) {return false}
}
function writePrimaryRedirectFile(out) {
  const file=path.join(out,'_redirects');
  if(fs.existsSync(file))throw Error('Refusing to overwrite an existing redirect file');
  fs.writeFileSync(file,RULES,'utf8');
}
module.exports={RULES,isPrimaryProduction,writePrimaryRedirectFile};
