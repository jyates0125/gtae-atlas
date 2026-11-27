// Focused source contract checks; real browser validation remains required.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8'),map=read('atlas.js'),nav=read('atlas-navigation.js');
new vm.Script(map);new vm.Script(nav);
for(const id of ['gun-van','street-dealers','shipwreck','ufo','nightclubs-business'])assert(map.includes("'"+id+"'")||map.includes('"'+id+'"'),id);
assert(map.includes('renderGameplayLegend(root,rows,query)'));
assert(map.includes('drawGameplayGlyph(selected'));
assert(map.includes('eventHidden.delete(rule.id);showPins=true'));
assert(nav.includes('exact.length===1')&&nav.includes('aria-activedescendant'));
for(const f of ['atlas.html','atlas-online.html']){const h=read(f);assert(h.includes('id="j4730-legend-search"'));assert(h.includes('j4730-advanced-sources'));assert(h.includes('atlas-navigation.js?v=4730'))}
console.log('Gameplay legend / navigation source contracts passed');
