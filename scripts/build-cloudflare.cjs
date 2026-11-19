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
const skipDirs = new Set(['.git','.github','.venv','node_modules','tests','tools','scripts','reference','reference-pack','optional','private-lab','atlas-lab-private','research-private','user-exports','qa-evidence','public','__pycache__','docs','.playwright','.cache']);
const allowExt = new Set(['.html','.css','.js','.json','.csv','.svg','.png','.jpg','.jpeg','.webp','.gif','.ico','.woff','.woff2','.mp4','.webm','.mp3','.ogg','.wav','.bin','.txt','.md','.xml','.webmanifest','.wasm','.glb','.gltf','.avif']);
const excludeNames = new Set(['MANIFEST-SHA256.txt','.env','.env.local','INSTALL-TO-DEVELOPMENT.ps1','package-lock.json','package.json']);
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
const pages = files.filter(rel => rel.endsWith('.html') && !rel.includes('/')).sort().map(rel => {
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
    const includes='<link rel="stylesheet" href="./atlas132-nav.css?v=132"><script defer src="./atlas132-nav.js?v=132"></script>';
    const at=html.toLowerCase().lastIndexOf('</head>');
    if (at<0) throw new Error('Published HTML is missing head: '+rel);
    fs.writeFileSync(dst,html.slice(0,at)+includes+html.slice(at));
  } else {
    fs.copyFileSync(src,dst);
  }
  const buf=fs.readFileSync(dst);
  bytes+=buf.length;
  manifest.push({path:rel.replaceAll('\\','/'),bytes:buf.length,sha256:crypto.createHash('sha256').update(buf).digest('hex')});
}
for(const required of ['index.html','maps.html','atlas.html','atlas-online.html','atlas-vi.html','one-last-ride.html','atlas98-data-lab.html','atlas-source-registry.html','film/assets/one-last-ride-motion-preview.mp4','_headers']) {
  if (!fs.existsSync(path.join(out,required))) throw new Error(`Missing required production asset: ${required}`);
}
const pageBytes=Buffer.from(JSON.stringify({version:132,pages},null,2)+'\\n');
const pageFile='atlas132-page-directory.json';
fs.writeFileSync(path.join(out,pageFile),pageBytes);
bytes+=pageBytes.length;
manifest.push({path:pageFile,bytes:pageBytes.length,sha256:crypto.createHash('sha256').update(pageBytes).digest('hex')});
manifest.sort((a,b)=>a.path.localeCompare(b.path));
const report={version:'9.8C',generatedAt:new Date().toISOString(),fileCount:files.length,bytes,files:manifest};
fs.writeFileSync(path.join(out,'release-manifest.json'),JSON.stringify(report,null,2)+'\n');
console.log(`Cloudflare static build: ${files.length} files / ${bytes} bytes -> public/ (offline, reproducible)`);
