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
