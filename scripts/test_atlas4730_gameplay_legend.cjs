const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8'),map=read('atlas.js'),nav=read('atlas-navigation.js');
new vm.Script(map);new vm.Script(nav);
const get=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert(i>=0&&j>i,a);return s.slice(i,j)};
const fixtures=[{id:'a',name:'Maze Bank West',x:1,y:2},{id:'b',name:'Maze Bank Tower',x:3,y:4},{id:'c',name:'Gun Van',activityId:'gun-van',x:5,y:6},{id:'d',name:'Invalid',x:NaN,y:0}];
const find=vm.runInNewContext(get(nav,'function find(s,browse=false)','function closeSuggestions')+';find',{all:()=>fixtures});
assert.equal(find('maze').length,2);assert.equal(find('maze bank tower')[0].id,'b');assert.equal(find('gun-van')[0].id,'c');assert.equal(find('',true).length,3);assert.equal(find('Invalid').length,0);
const state={fields:[{input:{value:'Maze Bank'}}],waypoints:[null],find,popup:()=>{},closeSuggestions:()=>{}};
const resolve=vm.runInNewContext(get(nav,'function resolve(index)','function renderFields')+';resolve',state);
assert.equal(resolve(0),false);assert.equal(state.waypoints[0],null);state.fields[0].input.value='Maze Bank Tower';assert.equal(resolve(0),true);assert.equal(state.waypoints[0].id,'b');
const collection=vm.runInNewContext(get(map,'const GAMEPLAY_COLLECTIONS=','const gameplayPathCache')+';gameplayCollectionKey',{});
assert.equal(collection({category:'collectible',collectionType:'Spaceship parts'}),'spaceship-parts');assert.equal(collection({category:'collectible',name:'Letter scrap'}),'letter-scraps');assert.equal(collection({category:'shop',name:'Letter scraps'}),null);
for(const id of ['gun-van','street-dealers','shipwreck','ufo','nightclubs-business','spaceship-parts'])assert(map.includes("'"+id+"'")||map.includes('"'+id+'"'),id);
assert(map.includes('renderGameplayLegend(root,rows,query)'));assert(map.includes('drawGameplayGlyph(selected'));assert(map.includes('eventHidden.delete(rule.id);showPins=true'));assert(nav.includes('aria-activedescendant'));assert(nav.includes('That activity is no longer eligible'));
for(const f of ['atlas.html','atlas-online.html']){const h=read(f);assert(h.includes('id="j4730-legend-search"'));assert(h.includes('j4730-advanced-sources'));assert(h.includes('atlas-navigation.js?v=47301'))}
console.log('Gameplay legend / route search focused behavioral tests passed');

const snapshot={feed:{'gun-van':new Set(['van-active'])},now:Date.parse('2026-11-27T12:00:00Z')};
const conditionEngine={BY_ID:{'gun-van':{kind:'rotation'},'cayo-chests':{kind:'rotation'}},rotationFeed:(s,id)=>s[id]?{active:s[id]}:null};
const dated=vm.runInNewContext(get(map,'function datedMainlandMarker(r,cache)','function todayFocusRows')+';datedMainlandMarker',{window:{JuraConditions:conditionEngine}});
const marker={scope:'online',activityId:'gun-van',rotationMarkerId:'van-active'};
assert.equal(dated(marker,snapshot),true);
assert.equal(dated({...marker,rotationMarkerId:'van-old'},snapshot),false);
assert.equal(dated({...marker,scope:'story'},snapshot),false);
assert.equal(dated({...marker,uncertain:true},snapshot),false);
assert.equal(dated({...marker,activityId:'cayo-chests'},snapshot),false);
assert.equal(dated(marker,{feed:{},now:snapshot.now}),false);
assert(map.includes('priorityIds.has(r.id)'));
assert(map.includes('j4730-selected-glyph')&&map.includes('j4730-list-glyph'));
console.log('Current-day focus eligibility and shared marker contracts passed');

assert(map.includes('let onlineCleanView=true'));assert(map.includes('onlineLayerMatches(r,onlineSelectedLayers)'));assert(read('atlas-online.html').includes('id="j4731-filters-map"'));console.log('Clean default and direct filter contract checks passed');

const layerMatches=vm.runInNewContext(get(map,'function onlineLayerMatches(r,keys)','function setOnlineLayers')+';onlineLayerMatches',{matchesEventResearch:(rule,r)=>r.activityId===rule.id,gameplayCollectionKey:r=>r.collectionKey,NAMED_LAYERS:[['nightclubs-business','Nightclubs',r=>r.kind==='nightclub']],collectionLayerId:n=>'collection:'+n.toLowerCase()});
const club={category:'business_site',kind:'nightclub'},office={category:'business_site',kind:'office'},dealer={category:'activity',activityId:'street-dealers'},van={category:'activity',activityId:'gun-van'};
const chosen=new Set();assert.equal(layerMatches(club,chosen),false);chosen.add('named:nightclubs-business');assert.equal(layerMatches(club,chosen),true);assert.equal(layerMatches(office,chosen),false);chosen.add('event:street-dealers');assert.equal(layerMatches(dealer,chosen),true);assert.equal(layerMatches(van,chosen),false);assert.equal(layerMatches(club,chosen),true);chosen.delete('named:nightclubs-business');assert.equal(layerMatches(club,chosen),false);assert.equal(layerMatches(dealer,chosen),true);assert.equal(layerMatches({collectionKey:'playing-cards'},new Set(['collection-type:playing-cards'])),true);console.log('Independent click-to-show layer tests passed');

const prefs=vm.runInNewContext(get(map,'function safeOnlineLayerPrefs(value)','const onlineSelectedLayers')+';safeOnlineLayerPrefs',{});assert.deepEqual(Array.from(prefs(['event:gun-van','event:gun-van','named:ceo-offices','invalid','event:evil<script>'])),['event:gun-van','named:ceo-offices']);assert.equal(prefs(null).length,0);assert(map.includes('store(ONLINE_LAYER_PREF,[...onlineSelectedLayers])'));assert(read('atlas-online.html').includes('id="j4732-back-map"'));assert(read('atlas88-events.js').includes("if(extra)extra.open=true"));console.log('Preference and event deep-link contracts passed');

// Compare the actual canvas path against SVG geometry, not merely function presence.
const shapeCode=get(map,'const ELARIO_LEGEND_SHAPES=','function gameplayGlyphColor');
const drawCode=get(map,'function gameplayGlyphColor','function quickLegendRow');
function fakeElement(){return {attrs:{},children:[],setAttribute(k,v){this.attrs[k]=v},append(n){this.children.push(n)}}}
let paths=[];const glyphContext={game:'5',mode:'story',window:{},document:{createElementNS:()=>fakeElement()},Path2D:class{constructor(d){this.d=d;paths.push(d)}},ctx:new Proxy({},{get:(o,k)=>o[k]||(()=>{})}),conditionForRecord:()=>null,progress:{},doneKey:r=>r.id,camera:{z:3},CATEGORIES:{}};
const glyph=vm.runInNewContext(shapeCode+drawCode+';({legend:elarioLegendGlyph,draw:drawGameplayGlyph})',glyphContext);
for(const key of ['gun-van','street-dealers','shipwreck','ls-tags','hidden-caches','smoke-products','junk-skydives','ufo','ghosts-exposed','spaceship-parts','agencies-business','mc-business','nightclubs-business','letter-scraps']){const d=glyph.legend(key).children.map(p=>p.attrs.d).join(' ');assert(glyph.draw({id:key,category:key},20,20,null),key);assert.equal(paths.at(-1),d,key)}
const daily=['gun-van','street-dealers','shipwreck','ls-tags','hidden-caches','smoke-products','junk-skydives'].map(k=>glyph.legend(k).children.map(p=>p.attrs.d).join(' '));assert.equal(new Set(daily).size,daily.length,'Mainland daily icons must be distinguishable');
console.log('Shared SVG / actual canvas geometry and distinct mainland rotation glyphs passed');
