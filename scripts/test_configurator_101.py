#!/usr/bin/env python3
"""Team Jura original vehicle configurator contract — no proprietary meshes."""
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
page=(ROOT/'atlas-vehicle-configurator.html').read_text(encoding='utf8')
script=(ROOT/'atlas101-configurator.js').read_text(encoding='utf8')
viewer=(ROOT/'atlas99-garage3d.js').read_text(encoding='utf8')
class IDs(HTMLParser):
 def __init__(self):super().__init__();self.ids=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if d.get('id'):self.ids.append(d['id'])
parser=IDs();parser.feed(page)
assert len(parser.ids)==len(set(parser.ids))
expected={'modelSearch','modelSelect','bodyStyle','referenceImage','referenceTitle','referenceNote','paintSwatches','paintColor','buildName','buildNote','saveBuild','resetBuild','exportBuilds','loadBuild','importBuilds','presetImportHint','bodyStyleHint','builderStatus','stageModel','concept3d','resetCamera','addToGarage'}
assert expected.issubset(set(parser.ids)), expected-set(parser.ids)
for filename in ['atlas101-configurator.css','atlas101-configurator.js','atlas99-garage3d.css','atlas99-garage3d.js']:
 assert filename in page and (ROOT/filename).is_file(),filename
assert 'team-jura-atlas101-concept-presets-v1' in script,'Never overwrite existing garage keys'
assert 'team-jura-atlas90-collection-v1' not in script,'Concept presets must be separate from owned records'
assert 'atlas90-seed.json' in script
assert 'atlas93-garage.html?addModel=' in script
assert 'TeamJuraGarage3D.mount' in script
assert 'No licensed game meshes' in script
assert 'prepareImport(payload,storage.builds,new Set(models))' in script
assert 'Object.hasOwn(merged,id)' in script and 'entry.model!==id' in script
assert 'style.disabled=unsupported||classLocked' in script
assert 'presets and Garage ownership stay untouched' not in page or 'importBuilds' in page
assert 'NOT a GTA vehicle model' in viewer, 'Viewer disclaimer must remain'
for nav in ('index.html','atlas97-journey.html','atlas93-garage.html','atlas-database.html','atlas100-showroom.js'):
 assert 'atlas-vehicle-configurator.html' in (ROOT/nav).read_text(encoding='utf8'),nav
print('PASS Atlas 10.1 original 3D concept builder: source references, inputs, storage isolation, navigation and rights disclosures')
