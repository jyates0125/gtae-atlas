/* Atlas 32.3: read-only classic checklist evidence for Atlas Passport.
 * Device-local saved slot counts are not map coordinates or verified game pickups. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else if(root)root.JuraPassportBridge=api})(typeof window==='undefined'?null:window,function(){'use strict';
const SCHEMA='team-jura-atlas98b-items-v1';
const LINKED=Object.freeze({
 iii:'Hidden packages',vc:'Hidden packages',lcs:'Hidden packages',
 vcs:'Red balloons',ctw:'Security cameras',tlad:'Seagulls',tbogt:'Seagulls'
});
const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const key=world=>'team-jura-atlas98b-items-'+world+'-v1';
const link=(world,set)=>'./map-hub.html?game='+encodeURIComponent(world)+'&collection='+encodeURIComponent(set);
function read(world,goal,sets,raw){
 if(LINKED[world]!==goal)return {status:'unsupported'};
 const src=plain(sets)&&plain(sets[goal])?sets[goal]:null;
 if(!Number.isInteger(src?.count)||src.count<1||src.count>500)return {status:'unavailable'};
 const url=link(world,goal);
 if(raw===null||raw===undefined)return {status:'empty',count:0,total:src.count,url};
 let data;
 try{data=JSON.parse(raw)}catch{return {status:'damaged',url}}
 if(!plain(data)||data.schema!==SCHEMA||data.game!==world||!plain(data.done))return {status:'damaged',url};
 const entries=data.done[goal];
 if(entries!==undefined&&!Array.isArray(entries))return {status:'damaged',url};
 const count=new Set((entries||[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=src.count)).size;
 return {status:'saved',count,total:src.count,url};
}
return Object.freeze({SCHEMA,LINKED,key,link,read});
});
