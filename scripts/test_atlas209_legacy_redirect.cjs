#!/usr/bin/env node
'use strict';
/* Build variant regression. Both Cloudflare projects share one repository. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const cp=require('node:child_process');
const {isOldRelease,writeRedirectSite,PRIMARY}=require('./atlas209-legacy-redirect.cjs');
const base={CF_PAGES:'1',CF_PAGES_BRANCH:'development'};
const old={...base,CF_PAGES_URL:'https://random123.team-jura-atlas-preview.pages.dev/'};
const cases=[
  [old,true],
  [{...old,CF_PAGES_URL:'https://team-jura-atlas-preview.pages.dev/'},true],
  [{...old,CF_PAGES_BRANCH:'main'},true],
  [{...old,CF_PAGES_BRANCH:'feature/atlas209-traffic-discovery'},false],
  [{...old,CF_PAGES_BRANCH:'fix/anything'},false],
  [{...old,CF_PAGES:'0'},false],
  [{...old,CF_PAGES_URL:'https://random123.gtae-online.pages.dev/'},false],
  [{...old,CF_PAGES_URL:'https://gtae-online.pages.dev'},false],
  [{...old,CF_PAGES_URL:'https://team-jura-atlas-preview.pages.dev.evil.example/'},false],
  [{...old,CF_PAGES_URL:'http://team-jura-atlas-preview.pages.dev/'},false],
  [{...old,CF_PAGES_URL:'not-a-valid-url'},false],
  [{...old,CF_PAGES_URL:'https://team-jura-atlas-preview.pages.dev:1234/'},false],
  [{...old,CF_PAGES_URL:'https://user:pass@team-jura-atlas-preview.pages.dev'},false],
  [{CF_PAGES:'1',CF_PAGES_BRANCH:'development'},false],
];
for(const [env,want] of cases) assert.equal(isOldRelease(env),want,JSON.stringify(env));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'jura-redirect-test-'));
try {
 writeRedirectSite(temp);
 const output=fs.readFileSync(path.join(temp,'_redirects'),'utf8');
 assert.match(output,/^\/ https:\/\/gtae-online\.pages\.dev\/ 302$/m);
 assert.match(output,/^\/\* https:\/\/gtae-online\.pages\.dev\/:splat 302$/m);
 assert.deepEqual(fs.readdirSync(temp).sort(),['_redirects','index.html']);
 const html=fs.readFileSync(path.join(temp,'index.html'),'utf8');
 assert.ok(html.includes(PRIMARY));assert.ok(html.includes('noindex'));
}finally{fs.rmSync(temp,{recursive:true,force:true})}
const root=path.resolve(__dirname,'..');
try{
 const result=cp.execFileSync(process.execPath,[path.join(root,'scripts/build-cloudflare.cjs')],{
   cwd:root,env:{...process.env,...old},encoding:'utf8'
 });
 assert.match(result,/old Pages project/i);
 assert.deepEqual(fs.readdirSync(path.join(root,'public')).sort(),['_redirects','index.html']);
 assert.equal(fs.existsSync(path.join(root,'public','atlas.html')),false);
}finally{fs.rmSync(path.join(root,'public'),{recursive:true,force:true})}
console.log('PASS Atlas 20.9: release-only old project redirect, no canonical or preview redirect, fallback noindex');
