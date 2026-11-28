/* Manual guest backup: explicitly scoped VI progress, no account or network. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./atlas-vi-journey.js'),require('./atlas-objective-core.js'),require('./atlas450-vi-progress.js'));else if(root)root.JuraVIBackup=factory(root.JuraVIJourney,root.JuraObjectives,root.JuraVIActivity)})(typeof window==='undefined'?null:window,function(journey,objectives,activity){'use strict';
const J='team-jura-vi-journeys-v1',O='team-jura-objective-progress-v1:vi-story',C='team-jura-vi-activity-counts-v1',scope=/^team-jura-objective-progress-v1:vi-story:vj-[a-f0-9]{32}$/,countScope=/^team-jura-vi-activity-counts-v1:vj-[a-f0-9]{32}$/;
const isKey=k=>k===J||k===O||k===C||typeof k==='string'&&(scope.test(k)||countScope.test(k));
function locks(saves){const keys=Object.keys(saves).filter(isKey);if(keys.some(k=>scope.test(k)||countScope.test(k))&&!keys.includes(J))keys.push(J);return keys.sort();}
function plan(storage,saves){
 if(!journey||!objectives||!activity)throw Error('Leonida backup support unavailable');
 const keys=locks(saves),before=new Map(keys.map(k=>[k,storage.getItem(k)])),shadow=new Map(before),written=new Set();
 const store={getItem:k=>shadow.get(k)??null,setItem:(k,v)=>{if(!before.has(k))throw Error('Unexpected backup scope');shadow.set(k,v);written.add(k)}};
 const parse=raw=>{const value=JSON.parse(raw);if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid Leonida progress record');return value};
 let journeyConflicts=0,discoveryConflicts=0,activityConflicts=0;
 if(Object.hasOwn(saves,J)){const r=journey.merge(store,parse(saves[J]));journeyConflicts=r.conflicts}
 const known=keys.includes(J)?new Set(journey.read(store).state.profiles.map(p=>p.id)):new Set();
 for(const key of keys.filter(k=>k!==J)){
  const isCount=key===C||countScope.test(key),prefix=isCount?C:O,profile=key===prefix?null:key.slice(prefix.length+1);
  if(profile!==null&&!known.has(profile))throw Error('Backup references an unavailable Leonida playthrough; restore its journey directory first');
  const r=(isCount?activity:objectives).merge(store,parse(saves[key]),profile);if(isCount)activityConflicts+=r.conflicts;else discoveryConflicts+=r.conflicts;
 }
 return {before,entries:[...written].map(k=>[k,shadow.get(k)]),journeyConflicts,discoveryConflicts,activityConflicts};
}
return Object.freeze({isKey,locks,plan});
});
