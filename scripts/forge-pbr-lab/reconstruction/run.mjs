import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {refine} from './fit.mjs';
// Fixed inputs/outputs: no arbitrary paths, remote data or production mutation.
const input=new URL('./study.json',import.meta.url);
const raw=readFileSync(input,'utf8');
const result=refine(JSON.parse(raw));
const dir=fileURLToPath(new URL('../../../qa-evidence/forge-reconstruction/',import.meta.url));
mkdirSync(dir,{recursive:true});
const body=JSON.stringify({...result,referenceSha256:createHash('sha256').update(raw).digest('hex')},null,2)+'\n';
writeFileSync(resolve(dir,'synthetic-candidate.json'),body);
console.log(JSON.stringify({study:result.study,iterations:result.iterations,baseline:result.history[0],final:result.history.at(-1),converged:result.converged,releaseEligible:false}));
