"""No-network regression test for the Atlas 6.1 root-site contracts."""
from pathlib import Path
from html.parser import HTMLParser
import re,json,sys
D=Path(__file__).resolve().parents[1]
class RefParser(HTMLParser):
    def __init__(self):super().__init__();self.refs=[];self.ids=set()
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.add(a['id'])
        for key in ['src','href']:
            url=a.get(key,'')
            if url.startswith('./') and not ('?' in url and not url.split('?',1)[0]): self.refs.append(url.split('?',1)[0].split('#')[0].removeprefix('./'))
js=(D/'atlas.js').read_text()
expected=['scaly,view','yanis,18','yanis,15','dupzor,51']
m=re.search(r" '6':\[(.*)\]\n\};",js)
assert m,'GTA VI layer selector missing'
actual=re.findall(r"\['([^']+)','",m.group(1))
assert actual==expected,(actual,expected)
assert "let markerDensity='individual'" in js
assert 'function cluster(' not in js
assert 'markerColor:Array.isArray(v)' in js
assert "styles={'5':'radar','6':'scaly,view'}" in js
assert 'jura3-progress' in js and 'jura-atlas-routes' in js
# The GTA VI JSON feed is used by research adapters, not hard-wired into the map canvas.
assert 'data/gtadb-6.json' in (D/'atlas-research.js').read_text() or "'./data/gtadb-'" in (D/'atlas98-landmarks.js').read_text()
for name in ['atlas.html','atlas-online.html','atlas-vi.html']:
    p=RefParser();p.feed((D/name).read_text())
    for wanted in ['jura3dCanvas','juraOpenNav','jura3d','jura2d','layer','legend','atlasCanvas']:
        assert wanted in p.ids,(name,wanted)
    missing=[f for f in p.refs if f and not (D/f).exists()]
    assert not missing,(name,missing)
for filename in ['atlas-3d.js','atlas-navigation.js','atlas-road-core.js','atlas-route-core.js']:
    assert (D/filename).stat().st_size>200,(filename,'missing')
assert (D/'.github/workflows/team-jura-release.yml').exists()
assert (D/'scripts/sync_gtadb_vi.py').exists()
assert (D/'data/gtadb-6-manifest.json').exists()
manifest=json.loads((D/'data/gtadb-6-manifest.json').read_text())
assert manifest['game']=='6' and manifest['license']=='CC BY 4.0'
# GTADB moved the active licensed VI illustration from YANIS V17 to V18.
research=(D/'atlas-research.js').read_text()
assert "'yanis,18'" in js and "base:'yanis,18'" in js
assert "yanis,17" not in js and "/yanis,17/" not in research, 'Retired tiles cause the grid fallback'
assert "maps/tiles/6/yanis,18/" in research, 'Research primary imagery not migrated'
assert "./atlas-sw.js?v=103-tiles" in js, 'Service worker refresh missing'
assert "team-jura-atlas-v103-tiles" in (D/'atlas-sw.js').read_text()
for page in ('atlas.html','atlas-online.html','atlas-vi.html'):
    assert "./atlas.js?v=103-tiles" in (D/page).read_text(), page
assert "./atlas-research.js?v=103-tiles" in (D/'atlas-research.html').read_text()
print('Atlas 6.7 static regression PASS: 5 unique VI views, navigation, legacy keys, links, sync plumbing')

# Universe database, showroom and gallery integration regression.
import runpy
runpy.run_path(str(D / 'scripts/test_universe_100.py'), run_name='__main__')

# Original licensed-reference 3D concept builder contract.
runpy.run_path(str(D / 'scripts/test_configurator_101.py'),run_name='__main__')

# Standalone sourced cheat and official-news hub validation.
runpy.run_path(str(D / 'scripts/test_hubs_103.py'),run_name='__main__')

# Source-checked craft facts and mission-specific heist command presentation.
runpy.run_path(str(D / 'scripts/test_vehicle_intel_104.py'),run_name='__main__')

# 150 licensed San Andreas collectible locations, existing saves intact.
runpy.run_path(str(D / 'scripts/test_sa_pins_105.py'),run_name='__main__')

# 7 original game-specific covers, 13 map directory, SVG safety and correct prior pin metadata.
runpy.run_path(str(D / 'scripts/test_cover_art_106.py'),run_name='__main__')
