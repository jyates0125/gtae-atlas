/* Atlas 36.7: retry only failed map artwork in the active world.
 * No remote requests, user storage, map style or game progress are touched
 * by this helper; the existing map renderer starts new Image requests only
 * for tiles visible after the next paint.
 */
(function(root,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.JuraTileRecovery=api;
})(typeof globalThis==='undefined'?null:globalThis,function(){
 'use strict';
 function clearFailed(store,game){
  if(!store||typeof store.entries!=='function'||typeof store.delete!=='function')throw Error('Tile cache Map required');
  if(!['5','6'].includes(String(game)))throw Error('Unsupported map world');
  let removed=0;
  for(const [key,tile] of store.entries()){
   if(tile&&tile.state==='error'&&String(tile.game)===String(game)){
    store.delete(key);removed++;
   }
  }
  return removed;
 }
 return Object.freeze({clearFailed});
});
