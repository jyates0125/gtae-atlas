// Regression: importing Garage backups must preserve class-specific Forge environments.
const assert=require('node:assert/strict');const merge=require('../atlas254-garage-merge.js').merge;
const base={schema:1,garages:['Main Garage'],vehicles:{}};const gallery={owned:{},wishlist:{}};
for(const [model,environment] of [['jetmax','marina'],['buzzard','hangar'],['adder','signature'],['bison','workshop']]){
 const payload={schema:1,app:'team-jura-atlas93-garage',garage:{garages:['Main Garage'],vehicles:{[model]:{paint:'Graphite',studioDesign:{finish:'satin',environment,lights:false}}}},collection:{owned:{}}};
 const result=merge(payload,base,gallery,new Set([model]));
 assert.equal(result.added,1);
 assert.equal(result.meta.vehicles[model].studioDesign.environment,environment);
 assert.equal(result.meta.vehicles[model].studioDesign.finish,'satin');
 assert.equal(result.meta.vehicles[model].studioDesign.lights,false);
}
const unsafe={schema:1,app:'team-jura-atlas93-garage',garage:{garages:['Main Garage'],vehicles:{jetmax:{studioDesign:{environment:'<script>',accent:'javascript:alert(1)'}}}},collection:{}};
const clean=merge(unsafe,base,gallery,new Set(['jetmax']));
assert.equal(clean.meta.vehicles.jetmax.studioDesign.environment,'auto');
assert.equal(clean.meta.vehicles.jetmax.studioDesign.accent,'#eab56a');
console.log('Atlas 29.4 Forge environment backup round-trip validation passed');
