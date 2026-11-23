#!/usr/bin/env node
'use strict';
// First-party discovery is review-only: no writes to public data, no PR merges.
const fs=require('node:fs');
const path=require('node:path');
const ENDPOINT='https://graph.rockstargames.com/';
const QUERY='query NewswireList($locale: String!, $page: Int!, $limit: Int) { posts(page: $page, locale: $locale, limit: $limit) { results { id: id_hash url title created } } }';
function officialURL(raw) {
  if(typeof raw!=='string'||raw.length>400)return null;
  try {
    const u=new URL(raw,'https://www.rockstargames.com');
    if(u.protocol!=='https:'||!['rockstargames.com','www.rockstargames.com'].includes(u.hostname)||u.username||u.password||u.port)return null;
    if(!/^\/newswire\/article\/[a-z0-9]+\/[a-z0-9][a-z0-9-]*\/?$/i.test(u.pathname))return null;
    u.hostname='www.rockstargames.com';u.search='';u.hash='';
    return u.toString();
  }catch{return null}
}
function publishedDate(raw){
  if(typeof raw!=='string')return null;
  const s=raw.trim();
  const iso=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  const us=/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(?:,?\s+\d{1,2}:\d{2}(?:\s*[AP]M)?)?$/i.exec(s);
  let y,m,d;
  if(iso){y=+iso[1];m=+iso[2];d=+iso[3]}
  else if(us){m=+us[1];d=+us[2];y=+us[3];if(y<100)y+=2000}
  else return null;
  if(y<2023||y>2100||m<1||m>12||d<1||d>31)return null;
  const z=new Date(Date.UTC(y,m-1,d));
  if(z.getUTCFullYear()!==y||z.getUTCMonth()!==m-1||z.getUTCDate()!==d)return null;
  return z.toISOString().slice(0,10);
}
function suggestedWorld(title){
  if(/\b(grand theft auto vi|gtavi|gta vi)\b/i.test(title))return 'vi';
  if(/\b(gta online|gta\+|grand theft auto online)\b/i.test(title))return 'online';
  return null;
}
function candidates(payload,reviewed,now=new Date()){
  if(!Array.isArray(payload?.data?.posts?.results)||payload.errors?.length)throw Error('Newswire response unavailable or changed shape');
  if(!Array.isArray(reviewed?.news))throw Error('Reviewed snapshot invalid');
  const existing=new Set(reviewed.news.map(x=>officialURL(x.url)).filter(Boolean));
  const seen=new Set(),out=[];
  const maxDate=new Date(now.getTime()+86400000).toISOString().slice(0,10);
  for(const p of payload.data.posts.results){
    const url=officialURL(p?.url),date=publishedDate(p?.created);
    const title=typeof p?.title==='string'?p.title.trim():'';
    if(!url||!date||date>maxDate||title.length<8||title.length>170||/[<>]/.test(title)||existing.has(url)||seen.has(url))continue;
    seen.add(url);
    out.push({status:'review-required',id:String(p.id||'').slice(0,60),date,title,url,
      suggestedGame:suggestedWorld(title),source:'Rockstar Newswire discovery',
      caveat:'Not published. Verify original post, date, edition and rights manually.'});
  }
  return out.sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title));
}
async function retrieve(fetcher=fetch){
  const response=await fetcher(ENDPOINT,{method:'POST',redirect:'error',
    headers:{'content-type':'application/json',accept:'application/json'},
    body:JSON.stringify({query:QUERY,variables:{locale:'en_us',page:1,limit:50}}),signal:AbortSignal.timeout(16000)});
  if(!response.ok)throw Error('Newswire HTTP '+response.status);
  const body=await response.text();
  if(body.length>750000)throw Error('Newswire result too large');
  return JSON.parse(body);
}
async function main(){
  const reviewed=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/atlas-news-cheats.json'),'utf8'));
  const found=candidates(await retrieve(),reviewed);
  const report={schema:1,source:ENDPOINT,generatedAt:new Date().toISOString(),reviewRequired:true,
    items:found,unclassified:found.filter(x=>!x.suggestedGame).length,
    note:'Automatic discovery only. No changes to reviewed news or Cloudflare site.'};
  const output=path.resolve(__dirname,'../qa-evidence/atlas339-newswire-candidates.json');
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{mode:0o600});
  console.log('Newswire intake: '+found.length+' candidate(s) for manual verification. No publication.');
}
if(require.main===module)main().catch(e=>{console.error('Newswire intake failed closed: '+e.message);process.exitCode=1});
module.exports={officialURL,publishedDate,suggestedWorld,candidates,retrieve};
