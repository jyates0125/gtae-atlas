#!/usr/bin/env python3
"""Atlas 31.1 — named Forge build mutation, storage isolation and source syntax."""
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parents[1]
html=(root/'atlas-vehicle-configurator.html').read_text(encoding='utf-8')
js=(root/'atlas101-configurator.js').read_text(encoding='utf-8')
css=(root/'atlas311-forge-variant-manager.css').read_text(encoding='utf-8')
for token in ('j311-manager','j311-new-name','j311-rename','j311-delete'):
 assert html.count('id="'+token+'"')==1,token
assert 'atlas311-forge-variant-manager.css?v=311' in html and 'atlas101-configurator.js?v=' in html
for token in ('function manageNamed(action)','function updateNamedManager()',
              "const raw=localStorage.getItem(KEY)",'normalizedPreset(current,array[index])',
              'JSON.stringify(currentValue)!==JSON.stringify(expected)',
              'localStorage.getItem(KEY)!==raw',
              'Delete the named design','No saved Forge record is available',
              'new Set(array.map(v=>variantName(v)))','variants:{...latest.variants,[current]:nextArray}',
              "if(!mergeLatest())"):
 assert token in js,token
assert 'variants:mergeVariants(storage.variants,latest.variants,null).merged' not in js
assert 'min-height:44px' in css and 'focus-visible' in css
for file in ('atlas101-configurator.js','atlas99-garage3d.js'):
 process=subprocess.run(['node','--check',str(root/file)],capture_output=True,text=True)
 assert process.returncode==0,(file,process.stderr)
print('Atlas 31.1 source contracts: rename/delete, recent-source authority, malformed save protection')
