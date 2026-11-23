#!/usr/bin/env node
/* Atlas 35.5 — focused, offline auth release guard.
 * No credentials, network requests, test accounts, or database writes.
 */
'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const cp=require('node:child_process');
const assert=require('node:assert/strict');
const {join}=require('node:path');
const root=join(__dirname,'..');
const read=path=>fs.readFileSync(join(root,path),'utf8');
const html=read('atlas-account.html');
const source=read('atlas355-account-auth.js');
const buildSource=read('scripts/build-cloudflare.cjs');
const headers=read('_headers');
for(const path of ['atlas355-account-auth.js','atlas355-auth-config.js','atlas140-cloud-saves.js','atlas144-cloud-transfer.js','scripts/build-cloudflare.cjs']){
  cp.execFileSync(process.execPath,['--check',join(root,path)],{timeout:15000});
}
for(const needle of ['id="j355LoginForm"','data-atlas-auth-form','id="j355CloudSlots"','id="j355SignOut"',
    'id="j131Export"','id="j131Import"','Sign in · Coming after secure setup',
    'id="j355ForgotToggle"','id="j355RecoveryRequestForm"','id="j355NewPasswordForm"']){
  assert(html.includes(needle),'missing account/guest guard '+needle);
}
assert(source.includes('auth.signInWithPassword'));
assert(source.includes('auth.signOut'));
assert(source.includes('auth.resetPasswordForEmail'));
assert(source.includes('auth.updateUser({password})'));
assert(source.includes("event==='PASSWORD_RECOVERY'"));
assert(source.includes('AtlasCloudTransfer.createTransfer'));
assert(source.includes('consent:true'));
assert(source.includes('window.confirm'));
assert(source.includes('TeamJuraAuthTransport'));
assert(!source.includes('sb_secret_'));
assert(headers.includes("script-src 'self' https://cdn.jsdelivr.net"));
assert(headers.includes("connect-src 'self' https://dwqrmgeldssozgdtidla.supabase.co"));
assert(headers.includes('/atlas355-auth-config.js\n  Cache-Control: no-store'));
assert(buildSource.includes("GTAE_ATLAS_AUTH_ENABLED"));
assert(buildSource.includes("GTAE_SUPABASE_PUBLISHABLE_KEY"));
assert(!/sb_publishable_[A-Za-z0-9_-]{24,}/.test(source));
assert(!/sb_publishable_[A-Za-z0-9_-]{24,}/.test(buildSource));
function build(extra){
  const env={...process.env,GTAE_ATLAS_AUTH_ENABLED:'false',GTAE_SUPABASE_PUBLISHABLE_KEY:'',...extra};
  return cp.spawnSync(process.execPath,['scripts/build-cloudflare.cjs'],{cwd:root,env,encoding:'utf8',timeout:60000});
}
function config(){
  const sandbox={window:{}};
  vm.runInNewContext(read('public/atlas355-auth-config.js'),sandbox,{timeout:1000});
  return sandbox.window.TeamJuraAuthConfig;
}
let r=build({});
assert.equal(r.status,0,'default build: '+r.stderr);
assert.equal(config().enabled,false,'no sign-in without explicit opt-in');
assert.equal(config().publishableKey,null);
assert.equal(fs.existsSync(join(root,'public/atlas355-account-auth.js')),true);
const invalid=build({GTAE_ATLAS_AUTH_ENABLED:'true',GTAE_SUPABASE_PUBLISHABLE_KEY:'sb_secret_not_allowed'});
assert.notEqual(invalid.status,0,'must reject secret key at build time');
const fakeKey='sb_publishable_'+'t'.repeat(30);
r=build({GTAE_ATLAS_AUTH_ENABLED:'true',GTAE_SUPABASE_PUBLISHABLE_KEY:fakeKey});
assert.equal(r.status,0,'enabled test build: '+r.stderr);
assert.equal(config().enabled,true);
assert.equal(config().url,'https://dwqrmgeldssozgdtidla.supabase.co');
assert.equal(config().publishableKey,fakeKey);
cp.execFileSync(process.execPath,['--check',join(root,'public/atlas355-auth-config.js')],{timeout:15000});
r=build({});
assert.equal(r.status,0,'cleanup build: '+r.stderr);
assert.equal(config().enabled,false,'test key should not remain in the build');
assert(!read('public/atlas355-auth-config.js').includes(fakeKey));
console.log('PASS Atlas 35.5: existing verified-account UI, guest backup preservation, pinned SDK, HTTPS/CSP, disabled/default and enabled/test builds, no secret keys.');
