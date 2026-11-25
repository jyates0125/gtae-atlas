#!/usr/bin/env python3
"""Build a portable demonstration from the exact same original Forge source as GTAE."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'qa-evidence'/'chromium'/'elario-forge-preview.html'
OUT.parent.mkdir(parents=True,exist_ok=True)
models=[
 ['ellie','GTA Online · Vapid Ellie','Touring concept'],
 ['dominator','GTA Online · Vapid Dominator','Touring concept'],
 ['gauntlet','GTA Online · Bravado Gauntlet','Touring concept'],
 ['cheetah2','GTA Online · Grotti Cheetah Classic','Sports concept'],
 ['banshee','GTA Online · Bravado Banshee','Sports concept'],
 ['vi_ganado70','GTA VI · Vapid ’70 Ganado','Pickup / Truck'],
 ['vi_cheetah95','GTA VI · ’95 Grotti Cheetah','Sports concept'],
 ['vi_stanier55','GTA VI · ’55 Vapid Stanier','Touring concept'],
 ['vi_dominator67_buggy','GTA VI · ’67 Vapid Dominator Buggy','Pickup / Truck'],
 ['vi_squalo','GTA VI · Shitzu Squalo','Boat / Watercraft concept'],
]
css=(ROOT/'atlas99-garage3d.css').read_text(encoding='utf8')
sources=[(ROOT/p).read_text(encoding='utf8') for p in ['atlas256-forge-geometry.js','atlas99-garage3d.js']]
assert all('</script' not in s.lower() for s in sources)
assert '</style' not in css.lower()
html="""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Elario Forge · Signature Showroom</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#100b18;color:#f7e7f6;font:15px/1.5 system-ui,sans-serif}main{max-width:1200px;margin:auto;padding:clamp(14px,3vw,36px)}h1{font-size:clamp(28px,5vw,48px);line-height:1.05;margin:8px 0;color:#ffe1a6}header{border-bottom:1px solid #806083;padding-bottom:16px;margin-bottom:18px}header p{max-width:70ch;margin:6px 0;color:#d9c8dc}.eyebrow{color:#dda976;letter-spacing:.18em;font-weight:800;font-size:12px}.choices{display:flex;align-items:end;gap:14px;flex-wrap:wrap;margin-bottom:16px}.choices label{display:grid;gap:6px;min-width:0;font-weight:700;color:#f2cf9f}.choices select,.choices input{max-width:100%;min-height:44px;background:#22152f;color:#fff;border:1px solid #a67aab;border-radius:8px;padding:8px;font:inherit}.choices input{width:80px}#stage canvas{height:clamp(280px,55vw,600px)}footer{margin-top:20px;color:#c8b7cd;font-size:13px}
"""+css+"""</style></head><body><main><header><div class="eyebrow">GTAE · ELARIO STUDIOS · TEAM JURA</div><h1>Forge Signature Showroom</h1><p>Interactive development preview using the actual GTAE original model renderer. Drag to orbit, choose a model, edit paint, wheels and lighting, and select source-listed workshop references where available, and toggle the live floor reflection.</p></header><div class="choices"><label>Vehicle study<select id="model"></select></label><label>Primary paint<input id="paint" type="color" value="#30323a"></label></div><div id="stage"></div><footer>Original procedural visual studies only. No official GTA meshes, exact in-game liveries or game-save access. This portable preview makes no network requests and stores no personal data. WebGL and a compatible GPU are required.</footer></main>"""
for source in sources: html+='<script>'+source+'</script>'
html+='<script>const models='+json.dumps(models,ensure_ascii=False)+""";const select=document.getElementById('model'),paint=document.getElementById('paint'),stage=document.getElementById('stage');const drafts=new Map();for(const [id,label] of models)select.add(new Option(label,id));function open(){const [id,label,type]=models.find(x=>x[0]===select.value)||models[0];const saved=drafts.get(id)||{paint:'#30323a',design:{rim:'gold',wheels:'mesh',stripe:'none',livery:'none',workshopLivery:'none'}};paint.value=saved.paint;drafts.set(id,saved);TeamJuraGarage3D.mount(stage,{name:label,model:id,type,paint:saved.paint,design:saved.design,onDesign:d=>{saved.design=d}})}select.onchange=open;paint.oninput=()=>{drafts.get(select.value).paint=paint.value;TeamJuraGarage3D.paint(paint.value)};open();</script></body></html>"""
OUT.write_text(html,encoding='utf8')
print('Built actual-source portable Forge preview:',OUT)
