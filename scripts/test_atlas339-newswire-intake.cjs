#!/usr/bin/env node
'use strict';
const a=require('node:assert/strict'),n=require('./atlas339-newswire-intake.cjs');
const official='https://www.rockstargames.com/newswire/article/39akk424a9oo53/grand-theft-auto-vi-now-available';
a.equal(n.officialURL(official),official);
a.equal(n.officialURL('/newswire/article/39akk424a9oo53/grand-theft-auto-vi-now-available'),official);
for(const bad of ['http://www.rockstargames.com/newswire/article/1/post','https://evil.example/newswire/article/1/post','https://www.rockstargames.com.evil.example/newswire/article/1/post','https://www.rockstargames.com/newswire','https://user:pw@www.rockstargames.com/newswire/article/1/post'])a.equal(n.officialURL(bad),null);
a.equal(n.publishedDate('11/20/26, 1:00 PM'),'2026-11-20');
a.equal(n.publishedDate('2026-11-19'),'2026-11-19');
a.equal(n.publishedDate('02/30/26'),null);
a.equal(n.publishedDate('invalid'),null);
a.equal(n.suggestedWorld('Grand Theft Auto VI Now Available'),'vi');
a.equal(n.suggestedWorld('GTA+ Members Can Claim a Car'),'online');
a.equal(n.suggestedWorld('Festival Update'),null);
const input={data:{posts:{results:[
{id:'1',url:official,title:'Grand Theft Auto VI Now Available',created:'11/19/26, 1:00 PM'},
{id:'2',url:official,title:'Duplicate title',created:'11/19/26'},
{id:'3',url:'https://www.rockstargames.com/newswire/article/k4a8955a93o747/grand-theft-auto-vi-the-album-now-available',title:'Grand Theft Auto VI: The Album Now Available',created:'11/20/26'},
{id:'4',url:'https://evil.example/newswire/article/abc/malware',title:'GTA Online malware',created:'11/20/26'},
{id:'5',url:'/newswire/article/3456/unknown-event',title:'Unclassified bulletin',created:'11/21/26'},
{id:'6',url:'/newswire/article/5678/future',title:'Grand Theft Auto VI future news',created:'11/24/26'}
]}}};
const found=n.candidates(input,{news:[{url:official}]},new Date('2026-11-23T12:00:00Z'));
a.equal(found.length,2);a.equal(found[0].date,'2026-11-21');a.equal(found[0].suggestedGame,null);
a.equal(found[1].suggestedGame,'vi');a.ok(found.every(x=>x.status==='review-required'));
a.throws(()=>n.candidates({errors:[{message:'blocked'}]},{news:[]}),/unavailable/);
a.throws(()=>n.candidates({data:{}},{news:[]}),/unavailable/);
(async()=>{
 let called;
 const got=await n.retrieve(async(url,opt)=>{called={url,opt};return {ok:true,text:async()=>JSON.stringify(input)}});
 a.deepEqual(got,input);a.equal(called.url,'https://graph.rockstargames.com/');
 a.equal(called.opt.method,'POST');a.equal(called.opt.redirect,'error');
const body=JSON.parse(called.opt.body);a.equal(body.variables.locale,'en_us');a.equal(body.variables.page,1);a.equal(body.variables.limit,50);a.match(body.query,/id: id_hash/);a.match(body.query,/posts\(page: \$page/);
 console.log('PASS Atlas 33.9 offline Newswire URL/date/edition/dedup/source/transport tests');
})().catch(e=>{console.error(e);process.exitCode=1});
