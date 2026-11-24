/* Atlas 30.5 · immutable, fail-closed named Forge variant projection for My Garage. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else if(root)root.JuraGarageVariants=api})(typeof window==='undefined'?null:window,function(){'use strict';
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const validModel=id=>typeof id==='string'&&/^[a-z0-9_]{2,65}$/.test(id)&&!['constructor','prototype','__proto__'].includes(id);
const safePaint=x=>typeof x==='string'&&/^#[0-9a-f]{6}$/i.test(x);
const allowedBody=new Set(['auto','sports','truck','standard']);
function list(raw,model){
 if(!validModel(model))return [];
 if(raw===null||raw===undefined||raw==='')return [];
 try{
  const store=typeof raw==='string'?JSON.parse(raw):raw;
  if(!plain(store)||store.schema!==1||!plain(store.builds))return null;
  const variants=store.variants;
  if(variants===undefined||variants===null)return [];
  if(!plain(variants))return null;
  if(!Object.hasOwn(variants,model))return [];
  const values=variants[model];
  if(!Array.isArray(values))return null;
  const results=[],seen=new Set();
  for(const value of values){
   if(results.length>=8)break;
   if(!plain(value)||value.model!==model||!safePaint(value.paint)||
      !allowedBody.has(value.body)||typeof value.name!=='string'||typeof value.note!=='string')continue;
   const name=value.name.trim().slice(0,72),key=name.toLocaleLowerCase();
   if(!name||seen.has(key))continue;
   seen.add(key);
   results.push(Object.freeze({model,paint:value.paint.toLowerCase(),body:value.body,
    name,note:value.note.slice(0,800),design:plain(value.design)?value.design:{}}));
  }
  return results;
 }catch{return null}
}
return Object.freeze({list,validModel});
});
