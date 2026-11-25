#!/usr/bin/env node
/** Deterministic, offline, secure Cloudflare Pages static-site build.
 * No third-party network fetch; data synchronization is a separate manual review task.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'public');
const legacy = require('./atlas209-legacy-redirect.cjs');
const primaryGuards = require('./atlas352-primary-security-redirects.cjs');
const skipDirs = new Set(['.git','.github','.venv','node_modules','tests','tools','scripts','reference','reference-pack','optional','private-lab','atlas-lab-private','research-private','user-exports','qa-evidence','public','__pycache__','docs','.playwright','.cache']);
const allowExt = new Set(['.html','.css','.js','.json','.csv','.svg','.png','.jpg','.jpeg','.webp','.gif','.ico','.woff','.woff2','.mp4','.webm','.mp3','.ogg','.wav','.bin','.txt','.md','.xml','.webmanifest','.wasm','.glb','.gltf','.avif']);
const excludeNames = new Set(['MANIFEST-SHA256.txt','.env','.env.local','atlas-build-identity.json','atlas132-page-directory.json','INSTALL-TO-DEVELOPMENT.ps1','package-lock.json','package.json']);
const specials = new Set(['_headers','_redirects','.nojekyll']);
function walk(dir, prefix='') {
  const list=[];
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if (entry.isSymbolicLink()) throw new Error(`Unsafe symbolic link: ${prefix}/${entry.name}`);
    const rel=prefix ? path.posix.join(prefix,entry.name) : entry.name;
    if(entry.isDirectory()) {
      if(skipDirs.has(entry.name)) continue;
      list.push(...walk(path.join(dir,entry.name),rel));
    } else if(entry.isFile() && !excludeNames.has(entry.name) && (specials.has(entry.name) || allowExt.has(path.extname(entry.name).toLowerCase()))) {
      if (entry.name.startsWith('.env') || entry.name.startsWith('test-') || entry.name.endsWith('.test.js')) continue;
      list.push(rel);
    }
  }
  return list;
}
if(fs.existsSync(out)) fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
const files=walk(root);
// Fail closed before copying model assets to the deployment tree.
require('node:child_process').execFileSync(process.execPath,[path.join(root,'scripts/forge-pbr-lab/verify-published-models.mjs')],{
  cwd:root,input:JSON.stringify(files.filter(p=>/\.(?:glb|gltf)$/i.test(p)||p.toLowerCase().startsWith('assets/forge/'))),stdio:['pipe','inherit','inherit']
});
// Explicit per-page artwork selection; missing or changed selected art fails
// in every build. The optional smaller concept pack never auto-activates.
const headerPack=JSON.parse(fs.readFileSync(path.join(root,'docs/ATLAS3904-HEADER-ART.json'),'utf8')).images;
const selectedPaths=new Set(), selectedHashes=new Set();
const headerRules=Object.entries(headerPack).map(([key,entry])=>{
 if(!/^[a-z0-9-]+$/.test(key)||!['existing','new'].includes(entry.selected))throw new Error('Invalid header selection: '+key);
 const existing=entry.selected==='existing';
 const rel=existing?entry.fallback:entry.path;
 if(!/^art\/[a-zA-Z0-9-]+\.webp$/.test(rel)||!files.includes(rel))throw new Error('Missing selected cinematic header: '+key);
 const bytes=fs.readFileSync(path.join(root,rel));
 if(bytes.length<12||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw new Error('Invalid WebP header: '+key);
 const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
 const gitBlob=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 if(existing?gitBlob!==entry.fallbackGitBlob:sha256!==entry.sha256)throw new Error('Selected header identity mismatch: '+key);
 if(selectedPaths.has(rel)||selectedHashes.has(sha256))throw new Error('Repeated selected cinematic header: '+key);
 selectedPaths.add(rel);selectedHashes.add(sha256);
 const page=fs.readFileSync(path.join(root,entry.page),'utf8');
 if(!page.includes('data-gtae-header="'+key+'"')||!page.includes('atlas3903-header-refresh.css'))throw new Error('Header wiring missing: '+key);
 return '[data-gtae-header="'+key+'"]{--j3904-art:url("./'+rel+'")}';
});
if(headerRules.length!==9)throw new Error('Expected nine selected cinematic headers');
const portraitPack=JSON.parse(fs.readFileSync(path.join(root,'docs/ATLAS3907-PORTRAIT-MEDIA.json'),'utf8')).files;
if(Object.keys(portraitPack).length!==2)throw new Error('Expected two cinematic portraits');
for(const [key,entry] of Object.entries(portraitPack)){
 if(!/^art\/[a-zA-Z0-9-]+\.webp$/.test(entry.path)||!files.includes(entry.path))throw new Error('Missing portrait: '+key);
 if(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,entry.path))).digest('hex')!==entry.sha256)throw new Error('Portrait identity mismatch: '+key);
 if(!fs.readFileSync(path.join(root,'atlas8-preview.html'),'utf8').includes('src="./'+entry.path+'"'))throw new Error('Portrait wiring missing: '+key);
}
const headerOverride='\n/* Validated selected cinematic headers */\n'+headerRules.join('\n')+'\n';
console.log('Cinematic headers: '+headerRules.length+'/9 selected images verified; visual release review remains separate.');
// Recovery-only aliases are still built and served, but not advertised by Menu.
const pages = files.filter(rel => rel.endsWith('.html') && !rel.includes('/') && rel!=='atlas-cayo.html').sort().map(rel => {
  const source=fs.readFileSync(path.join(root,rel),'utf8');
  const lower=source.toLowerCase();
  const tag=lower.indexOf('<title');
  const valueStart=tag<0?-1:source.indexOf('>',tag)+1;
  const valueEnd=valueStart<1?-1:lower.indexOf('</title>',valueStart);
  const title=valueStart>0 && valueEnd>valueStart?source.slice(valueStart,valueEnd):rel;
  return {path:rel,title:title.replace(/<[^>]*>/g,'').replace(/&amp;/gi,'&').trim()};
});
let bytes=0;
const manifest=[];
for (const rel of files) {
  const src=path.join(root,rel),dst=path.join(out,rel);
  fs.mkdirSync(path.dirname(dst),{recursive:true});
  if (rel.endsWith('.html') && !rel.includes('/')) {
    const html=fs.readFileSync(src,'utf8');
    const requiredAssets=[
      'atlas160-premium-headers.css?v=160','atlas162-subject-heroes.css?v=162',
      'atlas153-advisory.css?v=153','atlas153-advisory.js?v=153',
      'atlas132-nav.css','atlas132-nav.js','atlas131-social-icons.css','atlas131-social-icons.js'
    ];
    for(const asset of requiredAssets){
      const attribute=asset.includes('.css')?'href':'src';
      const references=html.split(attribute+'="./'+asset).length-1;
      if(references!==1) throw new Error(rel+' requires one reference to '+asset);
    }
  }
  fs.copyFileSync(src,dst);
  if(rel==='atlas3903-header-refresh.css'&&headerOverride)fs.appendFileSync(dst,headerOverride);
  const buf=fs.readFileSync(dst);
  bytes+=buf.length;
  manifest.push({path:rel.replaceAll('\\','/'),bytes:buf.length,sha256:crypto.createHash('sha256').update(buf).digest('hex')});
}
// Redirect the OLD project's advertised root only. Keep its HTML/CSS/JS and
// /atlas-account.html available so existing guest saves remain exportable.
// LocalStorage cannot be read across the two independent *.pages.dev origins.
if (legacy.isOldRelease(process.env)) {
  legacy.writeRedirectFile(out);
  const rel='_redirects';
  const buf=fs.readFileSync(path.join(out,rel));
  bytes+=buf.length;
  manifest.push({path:rel,bytes:buf.length,sha256:crypto.createHash('sha256').update(buf).digest('hex')});
  console.log('Old Pages project root redirects to public GTAE; legacy guest export stays accessible.');
}
// Only the official GTAE main release gets cached-source blocking redirects.
// Keep old Pages root redirect and development/feature builds untouched.
if (primaryGuards.isPrimaryProduction(process.env)) {
  primaryGuards.writePrimaryRedirectFile(out);
  const rel='_redirects';
  const buf=fs.readFileSync(path.join(out,rel));
  bytes+=buf.length;
  manifest.push({path:rel,bytes:buf.length,sha256:crypto.createHash('sha256').update(buf).digest('hex')});
  console.log('GTAE main production: blocked cached internal source paths.');
}
for(const required of ['index.html','maps.html','atlas.html','atlas-online.html','atlas-vi.html','one-last-ride.html','atlas98-data-lab.html','atlas-source-registry.html','film/assets/one-last-ride-motion-preview.mp4','_headers']) {
  if (!fs.existsSync(path.join(out,required))) throw new Error(`Missing required production asset: ${required}`);
}
const pageBytes=Buffer.from(JSON.stringify({version:132,pages},null,2));
const pageFile='atlas132-page-directory.json';
if (JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,pageFile),'utf8'))) !== JSON.stringify({version:132,pages})) {
  throw new Error('Update '+pageFile+' from the current HTML page titles for direct-source hosting');
}
fs.writeFileSync(path.join(out,pageFile),pageBytes);
bytes+=pageBytes.length;
manifest.push({path:pageFile,bytes:pageBytes.length,sha256:crypto.createHash('sha256').update(pageBytes).digest('hex')});
manifest.sort((a,b)=>a.path.localeCompare(b.path));
// Cloudflare and GitHub Actions supply the checked-out revision. Do not expose arbitrary environment values.
const revision=[process.env.CF_PAGES_COMMIT_SHA,process.env.GITHUB_SHA].find(v=>typeof v==='string'&&/^[0-9a-f]{40}$/i.test(v))||null;
const buildIdentity={schema:1,revision,generatedAt:new Date().toISOString()};
const identityFile='atlas-build-identity.json',identityBytes=Buffer.from(JSON.stringify(buildIdentity,null,2)+'\n');
fs.writeFileSync(path.join(out,identityFile),identityBytes);
bytes+=identityBytes.length;
manifest.push({path:identityFile,bytes:identityBytes.length,sha256:crypto.createHash('sha256').update(identityBytes).digest('hex')});
manifest.sort((a,b)=>a.path.localeCompare(b.path));
const report={version:'9.8C',generatedAt:buildIdentity.generatedAt,fileCount:files.length,bytes,files:manifest};
fs.writeFileSync(path.join(out,'release-manifest.json'),JSON.stringify(report,null,2)+'\n');
console.log(`Cloudflare static build: ${files.length} files / ${bytes} bytes -> public/ (offline, reproducible)`);
