#!/usr/bin/env node
'use strict';
/* Build variant regression. Both Cloudflare projects share one repository. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const cp=require('node:child_process');
const {isOldRelease,writeRedirectFile,PRIMARY}=require('./atlas209-legacy-redirect.cjs');
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
 writeRedirectFile(temp);
 const output=fs.readFileSync(path.join(temp,'_redirects'),'utf8');
 assert.match(output,/^\/ https:\/\/gtae-online\.pages\.dev\/ 302$/m);
 assert.equal(output,'/ https://gtae-online.pages.dev/ 302\n');
 assert.deepEqual(fs.readdirSync(temp).sort(),['_redirects']);
 assert.equal(PRIMARY,'https://gtae-online.pages.dev/');
}finally{fs.rmSync(temp,{recursive:true,force:true})}
const root=path.resolve(__dirname,'..');
try{
 const result=cp.execFileSync(process.execPath,[path.join(root,'scripts/build-cloudflare.cjs')],{
   cwd:root,env:{...process.env,...old},encoding:'utf8'
 });
 assert.match(result,/Old Pages project root redirects/i);
 assert.equal(fs.readFileSync(path.join(root,'public','_redirects'),'utf8'),'/ https://gtae-online.pages.dev/ 302\n');
 for(const name of ['index.html','atlas.html','atlas-account.html','atlas131-account.js','_headers','maps.html']) {
   assert.equal(fs.existsSync(path.join(root,'public',name)),true,'Existing legacy guest site file must survive: '+name);
 }
 assert.ok(fs.readFileSync(path.join(root,'public','atlas-account.html'),'utf8').includes('j131Export'));
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'public','release-manifest.json'),'utf8'));
 assert.ok(manifest.files.some(x=>x.path==='_redirects'));
 assert.ok(manifest.files.some(x=>x.path==='atlas-account.html'));
}finally{fs.rmSync(path.join(root,'public'),{recursive:true,force:true})}
// Two independent Cloudflare site configurations deploy from this same repo.
// Confirm the primary public site and legacy FEATURE preview cannot inherit redirects.
for(const [label,env] of [
  ['canonical', {...old,CF_PAGES_URL:'https://random123.gtae-online.pages.dev/'}],
  ['legacy-feature-preview', {...old,CF_PAGES_BRANCH:'feature/atlas209-traffic-discovery'}],
]) {
 try {
  cp.execFileSync(process.execPath,[path.join(root,'scripts/build-cloudflare.cjs')],{
   cwd:root,env:{...process.env,...env},encoding:'utf8'
  });
  assert.equal(fs.existsSync(path.join(root,'public','_redirects')),false,
    label+' must never inherit the public redirect');
  const index=fs.readFileSync(path.join(root,'public','index.html'),'utf8');
  assert.ok(index.includes('j132-poster-welcome'),label+' must preserve the approved public homepage');
  for(const name of ['atlas-account.html','maps.html','art/atlas98-approved-hero.webp'])
   assert.equal(fs.existsSync(path.join(root,'public',name)),true,label+' missing '+name);
 }finally{fs.rmSync(path.join(root,'public'),{recursive:true,force:true})}
}
console.log('PASS Atlas 20.9: old root redirects only on release build; legacy backups preserved; canonical and staging unaffected');
