#!/usr/bin/env python3
"""Atlas 31.3: private named-build handoff never exposes user titles in links."""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parents[1]
collection=(ROOT/'atlas263-forge-collections.js').read_text(encoding='utf-8')
builder=(ROOT/'atlas101-configurator.js').read_text(encoding='utf-8')
test=(ROOT/'tests/atlas296-forge-collections.test.cjs').read_text(encoding='utf-8')
for token in ("const HANDOFF='team-jura-forge-private-handoff-v1'","w.sessionStorage.setItem(HANDOFF",
              "a.addEventListener('click',event=>","kind==='named'?{world,model:id,name}:null",
              "variant?'&source=collection':'"):
 assert token in collection,token
assert "#variant='+encodeURIComponent(variant)" not in collection
assert "source=collection" in test
for token in ("function requestedConceptVariant(model)","sessionStorage.getItem(key)",
              "sessionStorage.removeItem(key)","saved.world===WORLD&&saved.model===model",
              "const requestedVariant=requestedConceptVariant(selected)",
              "if(url.hash.startsWith('#variant='))url.hash=''"):
 assert token in builder,token
assert "url.hash='variant='+encodeURIComponent(variant)" not in builder
for f in ('atlas263-forge-collections.js','atlas101-configurator.js'):
 p=subprocess.run(['node','--check',str(ROOT/f)],capture_output=True,text=True)
 assert p.returncode==0,(f,p.stderr)
node=subprocess.run(['node','tests/atlas296-forge-collections.test.cjs'],cwd=ROOT,capture_output=True,text=True)
assert node.returncode==0,node.stderr
print('Atlas 31.3: private handoff, URL stripping, world validation and source syntax verified')
