#!/usr/bin/env python3
"""Atlas 31.0: verify all coverage rows against their actual bundled source files."""
import json, math, subprocess
from collections import defaultdict
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
load=lambda path: json.loads((ROOT/path).read_text(encoding='utf-8'))
config=load('data/atlas310-coverage-config.json')
matrix=load('data/atlas310-coverage-matrix.json')
worlds=config['worlds']
assert matrix['schema']==config['schema']==1
assert len(worlds)==len({w['id'] for w in worlds})==13
assert matrix['worlds']==[w['id'] for w in worlds]
assert matrix['dataAsOf']==config['dataAsOf']
rows=matrix['rows']
assert len(rows)==54 and len({r['id'] for r in rows})==54
assert {r['world'] for r in rows}==set(matrix['worlds'])
numeric=lambda obj,keys: all(type(obj.get(k)) in (int,float) and math.isfinite(obj[k]) for k in keys)
sources=set()
for i,spec in enumerate(config['specs']):
    path=spec.get('path')
    source=load(path) if path else {}
    if path:sources.add(path)
    selected=[r for r in rows if r['id'].startswith(spec['world']+'-'+str(i)+'-')]
    expected={}
    if spec['shape']=='gap':
        expected[spec['category']]=(None,None,None,None)
    elif spec['shape']=='manifest':
        assert source['schema']==2 and source['count']>=source['mappedCount']
        expected['Place / landmark snapshot']=(source['count'],source['mappedCount'],None,None)
    elif spec['shape']=='slots':
        assert source['schema']==1
        for entry in source['sets']:
            if entry['mode']==spec['filter']:
                assert entry['name'] not in expected and entry['total']>0
                expected[entry['name']]=(None,None,None,entry['total'])
    elif spec['shape']=='set':
        assert source['game']=='4'
        items=source['sets'][spec['set']]
        expected[spec['category']]=(len(items),sum(numeric(x,spec['point']) for x in items),len(items),None)
    else:
        groups=defaultdict(list)
        for item in source[spec.get('list','records')]:
            groups[str(item.get(spec['group']) or 'Other')].append(item)
        for key,items in groups.items():
            total=len(items)
            positions=sum(numeric(item,spec['point']) for item in items)
            if spec.get('objectiveMode')=='not-collectibles':objectives=None
            elif spec.get('objectiveField'):objectives=len({item[spec['objectiveField']] for item in items})
            else:objectives=total
            expected[spec.get('categoryPrefix','')+key]=(total,positions,objectives,None)
    assert len(selected)==len(expected),(path,'count',len(selected),len(expected))
    assert {r['category'] for r in selected}==set(expected),(path,'groups')
    for row in selected:
        recs,positions,objectives,slots=expected[row['category']]
        assert (row['sourceRows'],row['positioned'],row['objectives'],row['slots'])==(recs,positions,objectives,slots),(path,row['category'])
        assert row['sourceFile']==path
        assert row['evidence']==spec['evidence'] and row['note']==spec['note']
        assert row['worldName']==next(w['name'] for w in worlds if w['id']==row['world']==spec['world'])
        assert row['href']==next(w['href'] for w in worlds if w['id']==row['world'])
        assert row['sourceUrl']==source.get('sourceUrl')
        assert row['license']==source.get('license')
        revision=next((source[k] for k in ('sourceCommit','sourceRevision','upstreamRevision') if k in source),None)
        assert row['revision']==revision
assert len(sources)==16,len(sources)
assert all(r['sourceRows'] is None and r['positioned'] is None and r['slots']>0 for r in rows if r['world']=='online')
ctw=next(r for r in rows if r['world']=='ctw')
assert ctw['sourceRows'] is None and ctw['evidence']=='not-audited'
iii=next(r for r in rows if r['world']=='iii' and r['category']=='Rampages')
assert iii['sourceRows']==40 and iii['objectives']==20
vi=next(r for r in rows if r['world']=='vi')
assert vi['sourceRows']==3754 and vi['positioned']==3663 and vi['evidence']=='provisional-landmarks'
for name in ('atlas310-source-coverage.js','atlas-coverage.js'):
    p=subprocess.run(['node','--check',str(ROOT/name)],capture_output=True,text=True)
    assert p.returncode==0,(name,p.stderr)
html=(ROOT/'atlas-coverage.html').read_text(encoding='utf-8')
for token in ('atlas310-source-coverage.js?v=310','atlas310-source-coverage.css?v=310','id="j310-rows"','id="j310-export"'):
    assert html.count(token)==1,token
client=(ROOT/'atlas310-source-coverage.js').read_text(encoding='utf-8')
assert not any(bad in client for bad in ('localStorage','indexedDB','history.pushState'))
assert 'history.replaceState' in client and 'csvCell' in client and 'noopener noreferrer' in client
print('Atlas 31.0: verified 54 category rows, 16 actual source files, 13 game scopes, unknowns preserved')
