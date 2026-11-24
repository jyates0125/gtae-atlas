#!/usr/bin/env node
/* Atlas 36.7 release safety: do not publish any dense game elevation without
 * documented file-exact rights, checksum and coordinate control evidence.
 * GTADB's CC BY 4.0 for repository-owned materials remains respected.
 * A checked proof is not a substitute for actual legal/geographic review. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {webcrypto}=require('node:crypto');
require('../atlas-3d.js');
const evidence=require('../atlas-terrain-evidence.js');

async function check(root=path.resolve(__dirname,'..')){
 const notes=[];
 const published=path.join(root,'public');
 for(const game of ['5','6']){
  const filename='elevation-'+game+'.bin';
  const input=path.join(root,filename);
  const output=path.join(published,filename);
  const exists=fs.existsSync(input),deployed=fs.existsSync(output);
  if(!exists&&deployed)throw Error(filename+' is being published without a reviewed source file');
  if(!exists){notes.push(filename+': NOT INSTALLED (truthful flat/perspective fallback)');continue;}
  const file=fs.readFileSync(input);
  const definition=JuraTerrain3D.ELEVATIONS[game];
  if(file.length!==definition.width*definition.height*2)
   throw Error(filename+': invalid binary size; public release blocked');
  const proofPath=path.join(root,'docs','ATLAS-HEIGHTFIELD-'+game+'-RELEASE-PROOF.json');
  if(!fs.existsSync(proofPath))
   throw Error(filename+': missing reviewed evidence '+path.relative(root,proofPath));
  let proof;
  try{proof=JSON.parse(fs.readFileSync(proofPath,'utf8'))}
  catch(e){throw Error(filename+': evidence file is invalid JSON: '+e.message)}
  const copy=file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength);
  await evidence.verify(copy,proof,definition,game,webcrypto);
  if(!deployed)throw Error(filename+': approved terrain is absent from the built public/ directory');
  if(!fs.readFileSync(output).equals(file))
   throw Error(filename+': built terrain differs from reviewed file');
  notes.push(filename+': source proof checksum, declared rights, independent points and deployed bytes match; independent owner review remains required');
 }
 return notes;
}
if(require.main===module)check().then(lines=>{for(const line of lines)console.log('Atlas 36.7 '+line)})
 .catch(err=>{console.error('Atlas 36.7 heightfield distribution HOLD:',err.message);process.exitCode=1});
module.exports={check};
