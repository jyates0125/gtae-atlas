#!/usr/bin/env python3
"""Conservative metadata and structural gate for optional game road data.
Not a substitute for in-game topology/drivability validation.
"""
import json, sys, math, pathlib
p=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else None
if not p or not p.exists():sys.exit('Usage: python tools/validate_road_graph.py <graph.json>')
raw=json.loads(p.read_text())
if raw.get('version')!=1 or raw.get('game') not in ('5','6') or raw.get('units')!='gta-world':sys.exit('FAIL: wrong graph schema/game/world units')
for k in ('source','license','coordinateSystem','testedAgainst'):
    if not isinstance(raw.get(k),str) or len(raw[k].strip())<5:sys.exit('FAIL: missing provenance: '+k)
if any(term in raw['source'].upper() for term in ('SYNTHETIC','DEMO','EXAMPLE')):sys.exit('FAIL: synthetic demo graph is not game-road evidence')
if len(raw.get('nodes',[]))<50 or not isinstance(raw.get('edges'),list) or len(raw['edges'])<50:sys.exit('FAIL: too small for a real-world road network')
if len(raw['nodes'])>250000 or len(raw['edges'])>500000:sys.exit('FAIL: graph exceeds engine limits')
ids=set()
for node in raw['nodes']:
    if not isinstance(node.get('id'),str) or node['id'] in ids:sys.exit('FAIL: duplicate/invalid node')
    ids.add(node['id'])
    if not all(isinstance(node.get(k),(float,int)) and math.isfinite(node[k]) and abs(node[k])<=100000 for k in ('x','y')):sys.exit('FAIL: invalid coordinates')
for edge in raw['edges']:
    if edge.get('from') not in ids or edge.get('to') not in ids:sys.exit('FAIL: dangling road link')
print('PASS: metadata and structure gate. Road graph is STILL unverified for drivable directions until in-game snapping, connectivity, and turn rules are tested.')
