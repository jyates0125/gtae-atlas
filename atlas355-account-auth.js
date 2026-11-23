/* Atlas 35.5 · existing confirmed-email accounts only.
 * No public signup or password recovery until independent SMTP verification.
 * A public publishable key is injected by Cloudflare at build time only after
 * explicit enablement. Database RLS, not browser checks, enforces ownership.
 */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const root=$('j355AuthPanel'), config=window.TeamJuraAuthConfig;
 if(!root||!config||config.enabled!==true)return;
 const safeUrl='https://dwqrmgeldssozgdtidla.supabase.co';
 const keyPattern=/^sb_publishable_[A-Za-z0-9_-]{12,}$/;
 const status=text=>{if($('j355AuthStatus'))$('j355AuthStatus').textContent=String(text)};
 const niceError=e=>{
   const codes={CONFLICT:'The saved version changed. Review this category again before transferring.',
    NO_LOCAL_PROGRESS:'No local progress was found in this category.',
    INVALID_LOCAL_PROGRESS:'This saved progress is not valid JSON. Export a manual backup before making repairs.',
    TOO_LARGE:'This category is too large for a cloud save. Use a manual backup instead.',
    STORAGE_ERROR:'This browser could not store that record. Your previous progress was preserved where possible.',
    REMOTE_FORMAT:'The cloud version uses an unexpected format. No changes were made.',
    LOCAL_CONFLICT:'Review the existing device progress before overwriting it.',
    REMOTE_ERROR:'The cloud request did not complete. Try again.',
    NOT_AUTHENTICATED:'This session expired. Please sign in again.'};
   return codes[e?.code]||'That operation did not complete. No automatic overwrite was attempted.';
 };
 if(config.url!==safeUrl||typeof config.publishableKey!=='string'||!keyPattern.test(config.publishableKey)){
   status('Account configuration is invalid. Guest access and local backups remain available.');
   return;
 }
 root.hidden=false;
 const legacy=$('cloudTitle')?.closest('.j131-account-panel');
 if(legacy){
   const eyebrow=legacy.querySelector('.eyebrow');
   if(eyebrow)eyebrow.textContent='VERIFIED MEMBERS · CONTROLLED EARLY ACCESS';
   const oldButton=legacy.querySelector('button[disabled]');
   if(oldButton)oldButton.hidden=true;
 }
 if($('cloudTitle'))$('cloudTitle').textContent='Sign in and manage cloud saves';
 if($('accountNotice'))$('accountNotice').textContent='Sign-in is optional. We support existing confirmed email accounts during testing; new public registrations are not available yet.';
 const footer=document.querySelector('.footer>small');
 if(footer)footer.textContent='Optional member accounts are in controlled testing. Guest play and device backups remain available.';
 if(!window.TeamJuraAuthTransport?.isSecure?.()){
   $('j355LoginForm').hidden=true;
   status('Account sign-in requires a top-level HTTPS page. Continue as guest on this device.');
   return;
 }
 let client=null,repository=null,transfer=null,memberId=null;
 let loading=false;
 const slots=new Map();
 const labels={
  story_progress:'GTA V story progress',passport:'Atlas Passport',
  collection_hq:'Collection headquarters',collectible_checklist:'Collectible checklist',
  owned_vehicles:'Owned vehicles',parking_ledger:'Parking ledger',
  garage_details:'Garage details',map_routes:'Saved routes',map_favorites:'Map favorites'
 };
 const msg=(item,text)=>{item.querySelector('.j355-slot-status').textContent=text};
 const btn=(text)=>{const b=document.createElement('button');b.type='button';b.textContent=text;return b};
 function renderSlots(){
   if(!$('j355CloudSlots')||!transfer)return;
   $('j355CloudSlots').replaceChildren();
   slots.clear();
   for(const name of transfer.namespaces()){
     const article=document.createElement('article');
     article.className='j355-slot';
     const heading=document.createElement('strong');
     heading.textContent=labels[name]||name;
     const note=document.createElement('p');
     note.className='j355-slot-status';note.setAttribute('role','status');
     note.textContent='Select Review to compare this device and your cloud version.';
     const controls=document.createElement('div');controls.className='j355-slot-actions';
     const review=btn('Review'),upload=btn('Upload'),download=btn('Restore');
     upload.disabled=true;download.disabled=true;
     controls.append(review,upload,download);
     article.append(heading,controls,note);
     $('j355CloudSlots').append(article);
     const state={name,article,review,upload,download,inspection:null,busy:false};
     slots.set(name,state);
     review.addEventListener('click',()=>inspect(state));
     upload.addEventListener('click',()=>transferAction(state,'upload'));
     download.addEventListener('click',()=>transferAction(state,'download'));
   }
 }
 async function inspect(s){
   if(s.busy||!transfer)return;
   s.busy=true;s.review.disabled=true;s.upload.disabled=true;s.download.disabled=true;
   msg(s.article,'Checking this device and your account...');
   try{
     const info=await transfer.inspect(s.name);
     s.inspection=info;
     const local=info.localExists?'On this device':'No device progress';
     const remote=info.cloudExists?'In your cloud (revision '+info.cloudRevision+')':'No cloud copy';
     msg(s.article,local+' · '+remote+(info.same?' · Already identical':''));
     s.upload.disabled=!info.localExists||info.same;
     s.download.disabled=!info.cloudExists||info.same;
   }catch(error){s.inspection=null;msg(s.article,niceError(error));}
   finally{s.busy=false;s.review.disabled=false;}
 }
 async function transferAction(s,direction){
   if(s.busy||!transfer||!s.inspection)return;
   const info=s.inspection;
   if(direction==='upload'&&(!info.localExists||info.same))return;
   if(direction==='download'&&(!info.cloudExists||info.same))return;
   const message=direction==='upload'
     ?(info.cloudExists?'Replace this cloud category with your current DEVICE data? The earlier cloud revision will be overwritten.':'Make a new private CLOUD copy of this device category?')
     :(info.localExists?'Restore this CLOUD category onto this DEVICE? Its existing local data will be replaced. Export a manual backup first.':'Restore this cloud category onto this device?');
   if(!window.confirm(message))return;
   s.busy=true;s.review.disabled=true;s.upload.disabled=true;s.download.disabled=true;
   msg(s.article,direction==='upload'?'Uploading selected progress...':'Restoring selected progress...');
   try{
     const result=direction==='upload'
      ?await transfer.upload(s.name,{consent:true,mode:info.cloudExists?'replace':'create',expectedRevision:info.cloudRevision})
      :await transfer.download(s.name,{consent:true,overwriteLocal:info.localExists});
     s.inspection=null;
     msg(s.article,'Completed: '+result.status+'. Review this category again to see its latest state.');
   }catch(error){s.inspection=null;msg(s.article,niceError(error));}
   finally{s.busy=false;s.review.disabled=false;}
 }
 async function renderAuth(){
   if(!client)return;
   let user=null;
   try{
     const response=await client.auth.getUser();
     user=response?.error?null:response?.data?.user||null;
   }catch{user=null}
   const id=user?.id||null;
   if(id!==memberId){memberId=id;slots.clear();if($('j355CloudSlots'))$('j355CloudSlots').replaceChildren();}
   $('j355LoginForm').hidden=!!user;
   $('j355SignedIn').hidden=!user;
   $('j355CloudPanel').hidden=!user;
   if(!user){status('Sign in using one of the two existing confirmed Atlas email accounts.');return;}
   $('j355MemberEmail').textContent=user.email||'Verified member';
   if(slots.size===0)renderSlots();
   status('Signed in. All progress transfers require your separate approval; nothing was automatically uploaded.');
 }
 function loadSdk(){
   return new Promise((resolve,reject)=>{
     if(window.supabase?.createClient){resolve(window.supabase);return;}
     const script=document.createElement('script');
     script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.2';
     script.crossOrigin='anonymous';
     script.onload=()=>window.supabase?.createClient?resolve(window.supabase):reject(Error('SDK API unavailable'));
     script.onerror=()=>reject(Error('SDK download unavailable'));
     document.head.append(script);
   });
 }
 $('j355LoginForm').addEventListener('submit',async event=>{
   event.preventDefault();if(!client||loading)return;
   const email=$('j355Email').value.trim(),password=$('j355Password').value;
   if(!email||!password)return;
   loading=true;
   const submit=$('j355LoginForm').querySelector('button[type=submit]');
   submit.disabled=true;status('Signing in...');
   try{
     const {error}=await client.auth.signInWithPassword({email,password});
     if(error){status('Sign-in failed. Check your email and password, then try again.');return;}
     $('j355Password').value='';
     await renderAuth();
   }catch{status('Sign-in could not connect. Please try again.');}
   finally{loading=false;submit.disabled=false;$('j355Password').value='';}
 });
 $('j355SignOut').addEventListener('click',async()=>{
   if(!client||loading)return;loading=true;$('j355SignOut').disabled=true;status('Signing out...');
   try{
     const {error}=await client.auth.signOut();
     if(error)throw error;
     memberId=null;
     await renderAuth();
   }catch{status('Sign-out did not complete; try again.');}
   finally{loading=false;$('j355SignOut').disabled=false;}
 });
 async function init(){
   if(!window.AtlasCloudSaves?.createRepository||!window.AtlasCloudTransfer?.createTransfer){
     status('Cloud-save components are unavailable. Guest backups remain available.');return;
   }
   try{
     const sdk=await loadSdk();
     client=sdk.createClient(config.url,config.publishableKey,{
       auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'gtae-atlas-member-session'}
     });
     repository=window.AtlasCloudSaves.createRepository(client);
     transfer=window.AtlasCloudTransfer.createTransfer({repository,storage:window.localStorage});
     await renderAuth();
     client.auth.onAuthStateChange((event)=>{
       if(event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='TOKEN_REFRESHED'||event==='USER_UPDATED'){
         queueMicrotask(()=>{renderAuth().catch(()=>status('Unable to refresh the account state.'));});
       }
     });
   }catch{status('Secure account setup is temporarily unavailable. Continue as guest or use a device backup.');}
 }
 init();
})();