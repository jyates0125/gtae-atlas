/* Team Jura Atlas 14.0 — cloud-save repository (not wired to the public UI).
 * Requires an authenticated Supabase client supplied by a future verified auth flow.
 * Does not store tokens, initiate login, access guest localStorage or auto-upload saves.
 * RLS remains the server-side authority. All database arguments are structured values.
 */
(function(factory){
  'use strict';
  if(typeof module==='object'&&module.exports) module.exports=factory();
  else if(typeof window!=='undefined') window.AtlasCloudSaves=factory();
})(function(){
  'use strict';
  const NAME=/^[a-z][a-z0-9_-]{1,63}$/;
  const MAX_BYTES=131072;
  class CloudSaveError extends Error {constructor(message,code){super(message);this.name='CloudSaveError';this.code=code}}
  function validateNamespace(value){
    if(typeof value!=='string'||!NAME.test(value))throw new CloudSaveError('Invalid save namespace.','INVALID_NAMESPACE');
    return value;
  }
  function validatePayload(payload){
    if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new CloudSaveError('Save must be an object.','INVALID_PAYLOAD');
    const text=JSON.stringify(payload);
    if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_BYTES)throw new CloudSaveError('Save exceeds size limit.','INVALID_PAYLOAD');
    return JSON.parse(text);
  }
  function requireResponse(result){
    if(result?.error)throw new CloudSaveError('Cloud request failed.',result.error.code||'REMOTE_ERROR');
    return result?.data??null;
  }
  async function currentUser(client){
    if(!client||!client.auth||typeof client.auth.getUser!=='function')throw new CloudSaveError('Supabase Auth client required.','CONFIG_REQUIRED');
    const result=await client.auth.getUser();
    if(result?.error||!result?.data?.user?.id)throw new CloudSaveError('Sign in to access cloud progress.','NOT_AUTHENTICATED');
    const id=result.data.user.id;
    if(typeof id!=='string'||!/^[a-f0-9-]{36}$/i.test(id))throw new CloudSaveError('Invalid account identity.','INVALID_USER');
    return id;
  }
  function createRepository(client){
    if(!client||typeof client.from!=='function')throw new CloudSaveError('Supabase client required.','CONFIG_REQUIRED');
    return Object.freeze({
      async read(namespace){
        const name=validateNamespace(namespace),userId=await currentUser(client);
        return requireResponse(await client.from('atlas_saves')
          .select('namespace,schema_version,payload,revision,updated_at')
          .eq('user_id',userId).eq('namespace',name).maybeSingle());
      },
      async create(namespace,payload){
        const name=validateNamespace(namespace),data=validatePayload(payload),userId=await currentUser(client);
        const response=await client.from('atlas_saves')
          .insert({user_id:userId,namespace:name,schema_version:1,payload:data,revision:1})
          .select('namespace,schema_version,payload,revision,updated_at').single();
        if(response?.error?.code==='23505')throw new CloudSaveError('Cloud save already exists. Review it before overwriting.','CONFLICT');
        return requireResponse(response);
      },
      async update(namespace,payload,expectedRevision){
        const name=validateNamespace(namespace),data=validatePayload(payload);
        if(!Number.isSafeInteger(expectedRevision)||expectedRevision<1)throw new CloudSaveError('Expected revision required.','INVALID_REVISION');
        const userId=await currentUser(client);
        const response=await client.from('atlas_saves')
          .update({payload:data,revision:expectedRevision+1,updated_at:new Date().toISOString()})
          .eq('user_id',userId).eq('namespace',name).eq('revision',expectedRevision)
          .select('namespace,schema_version,payload,revision,updated_at').maybeSingle();
        const saved=requireResponse(response);
        if(!saved)throw new CloudSaveError('Another device may have changed this save. Reload and review before saving.','CONFLICT');
        return saved;
      },
      async remove(namespace,expectedRevision){
        const name=validateNamespace(namespace);
        if(!Number.isSafeInteger(expectedRevision)||expectedRevision<1)throw new CloudSaveError('Expected revision required.','INVALID_REVISION');
        const userId=await currentUser(client);
        const response=await client.from('atlas_saves').delete()
          .eq('user_id',userId).eq('namespace',name).eq('revision',expectedRevision)
          .select('namespace').maybeSingle();
        const removed=requireResponse(response);
        if(!removed)throw new CloudSaveError('Save changed or no longer exists. Reload before deleting.','CONFLICT');
        return true;
      }
    });
  }
  return Object.freeze({createRepository,CloudSaveError});
});
