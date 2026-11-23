#!/usr/bin/env node
'use strict';
// No network calls, real passwords, real email addresses, or production keys.
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'..','atlas355-account-auth.js'),'utf8');
test('password recovery UI verifies a code before offering password update',async()=>{
  const elements=new Map();
  function element(id){
    if(elements.has(id))return elements.get(id);
    const e={id,hidden:false,value:'',textContent:'',disabled:false,handlers:{},
      addEventListener(name,fn){this.handlers[name]=fn;},
      querySelector(){return {disabled:false};},closest(){return null;},
      replaceChildren(){},focus(){},append(){},
      async click(){return this.handlers.click?.({preventDefault(){}});},
      async submit(){return this.handlers.submit?.({preventDefault(){}});}};
    elements.set(id,e);return e;
  }
  for(const id of ['j355AuthPanel','j355RecoveryRequestForm','j355RecoveryCodeForm','j355NewPasswordForm','j355SignedIn','j355CloudPanel'])element(id).hidden=true;
  const recorded={reset:0,verify:0,update:0,signout:0};
  let member=null;
  const auth={
    getUser:async()=>({data:{user:member},error:null}),
    resetPasswordForEmail:async()=>{recorded.reset++;return {error:null};},
    verifyOtp:async(info)=>{assert.equal(info.type,'recovery');recorded.verify++;member={id:'test',email:'test@example.invalid'};return {error:null};},
    updateUser:async()=>{recorded.update++;return {error:null};},
    signOut:async()=>{recorded.signout++;member=null;return {error:null};},
    signInWithPassword:async()=>({error:null}),
    onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})
  };
  const win={
    location:{protocol:'https:',search:'',hash:'',pathname:'/atlas-account.html',href:'https://example.invalid/atlas-account.html'},
    history:{replaceState(){}},
    TeamJuraAuthConfig:{enabled:true,url:'https://dwqrmgeldssozgdtidla.supabase.co',publishableKey:'sb_publishable_'+'x'.repeat(32)},
    TeamJuraAuthTransport:{isSecure:()=>true},
    AtlasCloudSaves:{createRepository:()=>({})},
    AtlasCloudTransfer:{createTransfer:()=>({namespaces:()=>[]})},
    localStorage:{},
    supabase:{createClient:()=>({auth})}
  };
  const context={window:win,document:{getElementById:element,querySelector:()=>null},URL,URLSearchParams,queueMicrotask};
  vm.runInNewContext(code,context,{timeout:2000});
  await new Promise(r=>setImmediate(r));
  assert.equal(element('j355AuthPanel').hidden,false);
  assert.equal(element('j355NewPasswordForm').hidden,true);
  await element('j355ForgotToggle').click();
  element('j355RecoveryEmail').value='test@example.invalid';
  await element('j355RecoveryRequestForm').submit();
  assert.equal(recorded.reset,1);
  assert.equal(element('j355RecoveryCodeForm').hidden,false);
  element('j355RecoveryCodeEmail').value='test@example.invalid';
  element('j355RecoveryCode').value='123456';
  await element('j355RecoveryCodeForm').submit();
  assert.equal(recorded.verify,1);
  assert.equal(element('j355NewPasswordForm').hidden,false);
  element('j355NewPassword').value=['Test','Password','123','!'].join('');
  element('j355NewPasswordConfirm').value=element('j355NewPassword').value;
  await element('j355NewPasswordForm').submit();
  assert.equal(recorded.update,1);
  assert.equal(recorded.signout,1);
  assert.equal(element('j355LoginForm').hidden,false);
});
