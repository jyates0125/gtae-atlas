#!/usr/bin/env python3
"""Static and behavioral regression gates for cumulative 9.4/9.5/9.6.
Integration is tested against the published 2026-11-15 source anchors; browser
and pixel-level reference comparisons are separate release gates.
"""
from __future__ import annotations
from pathlib import Path
import importlib.util
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
sys.path.insert(0,str(ROOT/'scripts'))
import apply_atlas95 as v95
import apply_atlas96 as v96
import sync_gtadb_vi as sync

class TestCumulative(unittest.TestCase):
    def test_research_api_filter_progress_and_cors(self):
        js=("let rawRecords=[],records=[];"
            "function filtered(){return records.filter(r=>familyEnabled.has(r.family)&&groupEnabled.has(r.group))}"
            "r.positioned?'Mapped (provisional)':'No coordinates';"
            "r.family.toUpperCase()+' · '+r.group;"
            "const o={state:'loading',img:new Image(),fallback:false};images.set(id,o);"
            "o.img.onload=()=>{o.state='ok';draw()};"
            "function refresh(){totalVisible=filtered();drawList();draw()}"
            "window.addEventListener('resize',size);size();load();})();")
        once=v95.patch_research(js)
        self.assertIn('window.TeamJuraResearch95=Object.freeze',once)
        self.assertIn("positionMode==='mapped'",once)
        self.assertIn("o.img.crossOrigin='anonymous'",once)
        self.assertIn('UNVERIFIED · map pin',once)
        self.assertEqual(once,v95.patch_research(once))

    def test_cluster_draw_click_and_keyboard(self):
        js=("const markers=totalVisible.filter(r=>r.positioned);for(const r of markers){"
            "const p=screen(r.x,r.y);hits.push({x:p.x,y:p.y,r})}"
            "for(const hit of hits){if(d<dist){dist=d;nearest=hit.r}}if(nearest)select(nearest);"
            "window.addEventListener('resize',size);size();load();})();")
        a=v96.patch_cluster_engine(js)
        self.assertIn('TeamJuraClusters96?.group',a)
        self.assertIn('camera.z=Math.min(5.2,camera.z+1.15)',a)
        self.assertIn("canvas.addEventListener('keydown'",a)
        self.assertEqual(a,v96.patch_cluster_engine(a))

    def test_gallery_parking_link(self):
        js="function card(r){actions.append(own,wish,cmp);body.append(actions);return root}"
        result=v96.patch_gallery(js)
        self.assertIn("r.kind==='vehicles5'",result)
        self.assertIn('encodeURIComponent(r.archive)',result)
        self.assertEqual(result,v96.patch_gallery(result))

    def test_audit_panel_and_html_injection_idempotent(self):
        html='<html><head></head><body><main><h1>Feature Audit</h1></main></body></html>'
        content=v96.patch_audit(html)
        self.assertEqual(content,v96.patch_audit(content))
        self.assertIn('UNVERIFIED community research',content)
        tags=['<link rel="stylesheet" href="./atlas96-garage.css?v=96">']
        self.assertEqual(v95.inject(v95.inject(html,tags),tags),v95.inject(html,tags))

    def test_source_keeps_unlocated_and_rejects_improper(self):
        raw={f'L{i}':['Record '+str(i),[i*0.5,i*0.25],[], '', [], [],['landmark'],'abcdef',[]] for i in range(1,601)}
        raw['L601']=['No coordinate',[],[],'',[],[],[], 'abcdef',[]]
        raw['L602']=['Impossible coordinate',[100000,0],[],'',[],[],[], 'abcdef',[]]
        snapshot,rejected=sync.build_snapshot(raw)
        self.assertEqual(snapshot['count'],602)
        self.assertEqual(snapshot['mappedCount'],600)
        self.assertEqual(snapshot['searchOnlyCount'],2)
        self.assertEqual(snapshot['records']['L602'][1],[])
        self.assertEqual(rejected,0)
        self.assertEqual(snapshot['status'],'community-provisional')
        self.assertEqual(snapshot['license'],'CC BY 4.0')

    def test_files_present(self):
        for name in ['atlas94-ui.js','atlas94-ui.css','atlas95-ui.js','atlas95-ui.css','atlas96-cluster-core.js','atlas96-garage.js','atlas96-garage.css','atlas96-catalog.css']:
            self.assertTrue((ROOT/name).is_file(),name)

if __name__=='__main__':
    unittest.main(verbosity=2)
