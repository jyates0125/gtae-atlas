/* Team Jura Data Lab — standalone, non-destructive, local-first source validation. */
(function (root, factory) {
  'use strict';
  const core = factory();
  if (typeof module === 'object' && module.exports) module.exports = core;
  if (root) root.TeamJuraDataLab = core;
})(typeof globalThis === 'undefined' ? null : globalThis, function () {
  'use strict';
  const MAX_BYTES = 10 * 1024 * 1024;
  const MAX_RECORDS = 25000;
  const s = v => String(v ?? '').trim();
  function csvRows(text) {
    const rows=[];let row=[],field='',quoted=false;
    text=String(text).replace(/^\uFEFF/,'');
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++}else if(c==='"')quoted=false;else field+=c;continue}
      if(c==='"'){if(field!=='')throw Error('Invalid CSV quote');quoted=true}
      else if(c===','){row.push(field);field=''}
      else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field=''}
      else field+=c;
    }
    if(quoted)throw Error('Unterminated CSV quote');
    if(field!==''||row.length){row.push(field);if(row.some(x=>x.trim()))rows.push(row)}
    if(rows.length<2)throw Error('CSV requires a header and at least one row');
    const headers=rows.shift().map(x=>x.trim());if(new Set(headers).size!==headers.length)throw Error('Duplicate CSV header');
    return rows.map((values,i)=>{if(values.length!==headers.length)throw Error('CSV column mismatch on row '+(i+2));return Object.fromEntries(headers.map((key,j)=>[key,values[j]]))});
  }
  function parse(text,filename='data.json'){
    if(typeof text!=='string'||new TextEncoder().encode(text).byteLength>MAX_BYTES)throw Error('Input exceeds 10 MB');
    let data;
    if(/\.csv$/i.test(filename))data=csvRows(text);
    else {try{data=JSON.parse(text.replace(/^\uFEFF/,''))}catch(e){throw Error('Invalid JSON: '+e.message)}}
    if(data&&data.type==='FeatureCollection'&&Array.isArray(data.features))data=data.features;
    else if(!Array.isArray(data))data=data?.records||data?.landmarks||data?.locations||data?.data||data?.features;
    if(!Array.isArray(data))throw Error('Expected JSON array, {records:[...]}, or GeoJSON FeatureCollection');
    if(data.length>MAX_RECORDS)throw Error('Maximum 25,000 records per import');
    return data;
  }
  const first=(obj,...keys)=>{for(const key of keys){if(obj[key]!==undefined&&obj[key]!==null&&s(obj[key])!=='')return obj[key]}return null};
  function normalize(value,i,meta){
    if(!value||typeof value!=='object'||Array.isArray(value))return {index:i+1,valid:false,reasons:['Not an object'],raw:value};
    const props=value.type==='Feature'&&value.properties&&typeof value.properties==='object'?value.properties:value;
    const geometry=value.type==='Feature'?value.geometry:null;
    const coords=geometry?.type==='Point'&&Array.isArray(geometry.coordinates)?geometry.coordinates:null;
    const name=s(first(props,'name','title','label','Name','Title'));
    const category=s(first(props,'category','type','group','kind','Category')||'uncategorized');
    const id=s(first(props,'id','uid','slug','key','ID')||'');
    const xRaw=first(props,'x','X','worldX','mapX','longitude','lon')??coords?.[0];
    const yRaw=first(props,'y','Y','worldY','mapY','latitude','lat')??coords?.[1];
    const x=xRaw===null?NaN:Number(xRaw),y=yRaw===null?NaN:Number(yRaw);
    const reasons=[];
    if(!name||name.length>240)reasons.push('Missing/overlong name');
    if(!Number.isFinite(x)||!Number.isFinite(y))reasons.push('Missing/invalid coordinates');
    if(Math.abs(x)>10000000||Math.abs(y)>10000000)reasons.push('Coordinates outside safety limit');
    if(!category||category.length>120)reasons.push('Invalid category');
    if(meta.license==='unknown')reasons.push('Reuse rights not verified');
    const verification=meta.game==='6'?'provisional':meta.license==='unknown'?'research-only':'unverified-coordinate';
    return {index:i+1,id:id||`candidate-${i+1}`,name,category,x,y,game:meta.game,mode:meta.game==='online'?'online':meta.game==='5'?'story':'research',sourceUrl:meta.sourceUrl,sourceName:meta.sourceName,license:meta.license,verification,checkedAt:meta.checkedAt,reasons,valid:reasons.length===0};
  }
  function validate(data,meta){
    if(!Array.isArray(data)||data.length>MAX_RECORDS)throw Error('Invalid or oversized record array');
    const seen=new Set();let duplicates=0;
    const rows=data.map((r,i)=>{
      const item=normalize(r,i,meta);
      if(item.name&&Number.isFinite(item.x)&&Number.isFinite(item.y)){
        const key=[item.game,item.name.toLowerCase().replace(/\s+/g,' '),item.category.toLowerCase(),item.x.toFixed(3),item.y.toFixed(3)].join('|');
        if(seen.has(key)){item.reasons.push('Duplicate name/category/coordinates');item.valid=false;duplicates++}else seen.add(key);
      }
      return item;
    });
    const usable=rows.filter(r=>r.valid);
    return {rows,usable,total:rows.length,duplicates,invalid:rows.length-usable.length,checkedAt:meta.checkedAt};
  }
  // Safely bridge reviewed research to the EXISTING Atlas map pack importer.
  // Source permission alone does not validate map coordinates or gameplay spawn state.
  const CATEGORY_SET = new Set(['collectible','vehicle','property','weapon','activity','landmark','transport','shop','food','hotel','nature','leisure','government','office','industry','utility','other']);
  function atlasCategory(category) {
    const c=s(category).toLowerCase().replace(/[\s_]+/g,'-');
    if(CATEGORY_SET.has(c))return c;
    if(/collect|playing-card|letter-scrap|spaceship|stunt|snowman|figurine|jack-o|pumpkin/.test(c))return 'collectible';
    if(/car|truck|vehicle|bike|plane|helicopter|garage/.test(c))return 'vehicle';
    if(/weapon|ammunation|gun|ammo/.test(c))return 'weapon';
    if(/house|property|business/.test(c))return 'property';
    if(/food|restaur|cafe|bar/.test(c))return 'food';
    if(/store|retail|shop/.test(c))return 'shop';
    if(/tower|power|water|utility/.test(c))return 'utility';
    if(/bridge|bus|airport|rail|transit/.test(c))return 'transport';
    if(/park|beach|mountain|river|nature/.test(c))return 'nature';
    return 'landmark';
  }
  function toAtlasPack(result,meta){
    if(!result||!Array.isArray(result.usable)||!meta||meta.coordinateSystem!=='gta-world-xy')throw Error('Confirm map-aligned GTA world X/Y coordinates before map export');
    const allowed={'CC-BY-4.0':'CC BY 4.0','MIT':'MIT','original':'Original / authorized','custom-permission':'Original / authorized'};
    if(!allowed[meta.license])throw Error('This license needs separate review or is unsupported by the map importer');
    if(!['5','online','6'].includes(meta.game))throw Error('Atlas supports only GTA V, Online and provisional VI map packs');
    if(meta.license!=='original'&&!/^https:\/\/[^\s/]+/i.test(meta.sourceUrl||''))throw Error('Enter the authoritative HTTPS source URL or proof-of-permission location');
    if(result.usable.length>12000)throw Error('Map packs allow up to 12,000 records; split your candidate dataset');
    const records=result.usable.filter(r=>Number.isFinite(r.x)&&Number.isFinite(r.y)&&Math.abs(r.x)<=16384&&Math.abs(r.y)<=16384)
      .map(r=>({id:s(r.id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,70)||String(r.index),name:r.name.slice(0,160),category:atlasCategory(r.category),game:meta.game==='online'?'5':meta.game,scope:meta.game==='online'?'online':meta.game==='6'?'vi':'story',x:r.x,y:r.y,uncertain:true,tags:[r.category,'community research','coordinates require in-game verification'].slice(0,12)}));
    if(!records.length)throw Error('No candidate coordinates fit the Atlas map world [-16384,16384]');
    const slug=s(meta.sourceName||'research').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,26)||'research';
    const pack={id:'tj98-'+slug,license:allowed[meta.license],attribution:s(meta.sourceName||'Team Jura research').slice(0,110),sourceUrl:s(meta.sourceUrl||'').slice(0,500),records};
    const bytes=new TextEncoder().encode(JSON.stringify(pack)).byteLength;
    if(bytes>2500000)throw Error('This Atlas pack exceeds the 2.5 MB import limit; split the dataset');
    return {pack,omitted:result.usable.length-records.length};
  }
  function download(data,filename){
    const a=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json;charset=utf-8'}));
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function mount(doc){
    if(!doc?.getElementById('sourceFile'))return;
    const $=id=>doc.getElementById(id);let raw=null,result=null,filename='',selectedMeta=null;
    const status=text=>{$('status').textContent=text};
    const clearView=()=>{result=null;$('review').disabled=!raw;$('filter').disabled=true;$('download').disabled=true;$('mapPack').disabled=true;$('report').disabled=true;['total','valid','duplicates','invalid'].forEach(id=>$(id).textContent='0');$('results').replaceChildren();const tr=doc.createElement('tr'),td=doc.createElement('td');td.colSpan=4;td.textContent='Import a source file to review it.';tr.append(td);$('results').append(tr);$('showing').textContent=''};
    function draw(){if(!result)return;const term=$('filter').value.trim().toLowerCase(),matches=result.rows.filter(r=>[r.name,r.category,String(r.x),String(r.y),r.reasons.join(' ')].join(' ').toLowerCase().includes(term));
      const body=$('results');body.replaceChildren();for(const item of matches.slice(0,250)){
        const tr=doc.createElement('tr');const cells=[item.name||`Record ${item.index}`,item.category,Number.isFinite(item.x)&&Number.isFinite(item.y)?`${item.x}, ${item.y}`:'—',item.reasons.join('; ')||'Usable candidate · coordinate unverified'];
        for(const content of cells){const td=doc.createElement('td');td.textContent=content;tr.append(td)}body.append(tr)
      }$('showing').textContent=`Showing ${Math.min(250,matches.length)} of ${matches.length} matching records (max 250 rendered).`;
    }
    $('sourceFile').addEventListener('change',async e=>{raw=null;filename='';clearView();const file=e.target.files?.[0];if(!file){status('No dataset loaded.');return}if(file.size>MAX_BYTES){status('File exceeds 10 MB limit.');return}try{raw=parse(await file.text(),file.name);filename=file.name;$('review').disabled=false;status(`${raw.length} records loaded from ${filename}. Choose source metadata, then validate.`)}catch(err){status('Import failed: '+err.message)}});
    $('review').addEventListener('click',()=>{if(!raw)return;const sourceUrl=$('sourceUrl').value.trim(),license=$('license').value;
      if(sourceUrl){try{const u=new URL(sourceUrl);if(!['https:','http:'].includes(u.protocol))throw Error('Invalid protocol')}catch{status('Source URL must begin with https:// or http://');return}}
      const meta={sourceName:$('sourceName').value.trim().slice(0,200)||filename,sourceUrl,license,game:$('game').value,coordinateSystem:$('coordinateSystem').value,checkedAt:new Date().toISOString()};selectedMeta=meta;
      result=validate(raw,meta);$('total').textContent=result.total;$('valid').textContent=result.usable.length;$('duplicates').textContent=result.duplicates;$('invalid').textContent=result.invalid;$('filter').disabled=false;$('download').disabled=result.usable.length===0;$('mapPack').disabled=result.usable.length===0||meta.coordinateSystem!=='gta-world-xy';$('report').disabled=false;draw();status(`${result.usable.length} usable research candidates. Nothing has been added to the live map or saved progress.`)
    });
    $('filter').addEventListener('input',draw);
    $('download').addEventListener('click',()=>{if(!result)return;download({schema:'team-jura-research-candidates-v1',checkedAt:result.checkedAt,records:result.usable},'team-jura-candidates.json')});
    $('mapPack').addEventListener('click',()=>{if(!result)return;try{const {pack,omitted}=toAtlasPack(result,selectedMeta);download(pack,'team-jura-atlas-map-pack.json');status(`${pack.records.length} provisional Atlas pins exported. ${omitted} out-of-bounds records excluded. Open the matching map and choose Import Pack.`)}catch(err){status('Map pack blocked: '+err.message)}});
    $('report').addEventListener('click',()=>{if(!result)return;download({schema:'team-jura-data-lab-report-v1',checkedAt:result.checkedAt,total:result.total,usable:result.usable.length,duplicates:result.duplicates,invalid:result.invalid,issues:result.rows.filter(x=>!x.valid).map(({index,name,reasons})=>({index,name,reasons}))},'team-jura-data-qa-report.json')});
    $('clear').addEventListener('click',()=>{raw=null;filename='';$('sourceFile').value='';$('filter').value='';clearView();status('In-memory import cleared. Your Atlas maps and saved progress were not touched.')});clearView();
  }
  if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(document));else mount(document)}
  return Object.freeze({parse,csvRows,normalize,validate,toAtlasPack,atlasCategory,mount});
});
