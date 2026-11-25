// Shared asset capability contract, isolated QA only. A visual asset is not a game vehicle.
const freezeRecord = x => Object.freeze({...x, body:Object.freeze(x.body||[]), rim:Object.freeze(x.rim||[]), interior:Object.freeze(x.interior||[])});
export const assets=Object.freeze({
 wedge:freezeRecord({file:'wedge.glb',name:'80s Wedge · drcollect',source:'https://github.com/drcollect/collect-cars',license:'CC BY 4.0',triangles:71240,review:'benchmark',body:['reviewed-wedge-pattern']}),
 fastback:freezeRecord({file:'fastback.glb',name:'Late-60s fastback · tevy',source:'https://tevy.dev/models/muscle-car',license:'CC0 1.0',triangles:54908,review:'benchmark',body:['paint','paint_body'],rim:['rim_paint','rim_paint_body'],interior:['interior','leather']}),
 supercar:freezeRecord({file:'supercar.glb',name:'Mid-engine supercar · tevy · full',source:'https://tevy.dev/models/supercar',license:'CC0 1.0',triangles:159952,review:'candidate',family:'supercar',lod:0}),
 'supercar-balanced':freezeRecord({file:'supercar-balanced.glb',name:'Mid-engine supercar · tevy · balanced',source:'https://tevy.dev/models/supercar',license:'CC0 1.0',triangles:44632,review:'candidate',family:'supercar',lod:1}),
 formula:freezeRecord({file:'formula.glb',name:'Open-wheel formula car · tevy',source:'https://tevy.dev/models/formula-car',license:'CC0 1.0',triangles:46816,review:'candidate'})
});
export function materialChannel(id,m){
 const asset=assets[id];
 if(!asset||asset.review==='candidate'||!m||typeof m.name!=='string')return null;
 const name=m.name.trim().toLowerCase();
 // Do not infer channels on new assets; preserve baked colors and unrelated surfaces.
 if(id==='wedge')return /paint|liquidgraphite/i.test(name)&&!/rim|wheel|caliper|brake|stripe|glass|trim|interior/i.test(name)?'body':null;
 if(m.map||!m.color)return null;
 for(const channel of ['body','rim','interior'])if(asset[channel].includes(name))return channel;
 return null;
}
export function validTriangleCount(asset,triangles){
 return Number.isSafeInteger(triangles)&&triangles>=10000&&Math.abs(triangles-asset.triangles)<=Math.max(20,asset.triangles*.02);
}
