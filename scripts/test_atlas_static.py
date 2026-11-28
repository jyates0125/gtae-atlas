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
expected=['day','scaly,view','dupzor,51']  # owner-approved single Day / Scaly / Loki selector
m=re.search(r" '6':\[(.*)\]\n\};",js)
assert m,'GTA VI layer selector missing'
actual=re.findall(r"\['([^']+)','",m.group(1))
assert actual==expected,(actual,expected)
assert "let markerDensity='individual'" in js
assert 'function cluster(' not in js
assert 'markerColor:Array.isArray(v)' in js
assert "styles={'5':'radar','6':'day'}" in js, "Owner-approved current Day artwork first; VI positions remain provisional"
assert "uncertain:!!analysis?.uncertain||g==='6'" in js
assert "'scaly,view','Scaly · YANIS V18'" in js and "'dupzor,51','Loki · DUPZOR V51'" in js
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
worker_version=re.search(r"\./atlas-sw\.js\?v=(\d+)",js)
assert worker_version, 'Service worker refresh missing'
assert "./atlas-sw.js?v="+worker_version[1] in (D/'atlas277-offline-classic.js').read_text(), 'Classic and core workers must agree'
assert "team-jura-atlas-v"+worker_version[1]+"-shell" in (D/'atlas-sw.js').read_text(), 'Versioned shell mismatch'
assert "team-jura-atlas-v191" in (D/'atlas-sw.js').read_text()
# The core script and worker have separate release cycles; enforce page parity.
core_versions=[]
for page in ('atlas.html','atlas-online.html','atlas-vi.html'):
    match=re.search(r"\./atlas\.js\?v=(\d+)",(D/page).read_text())
    assert match, page
    core_versions.append(match[1])
assert len(set(core_versions))==1, core_versions
assert "./atlas-research.js?v=218-yanis18" in (D/'atlas-research.html').read_text()
print('Atlas static regression PASS: GTADB VI Day plus distinct Scaly and Loki community maps, navigation, keys and links')

# Universe database, showroom and gallery integration regression.
import runpy
import traceback
failures=[]
def check_script(path, **kwargs):
    try:
        runpy.run_path(path, **kwargs)
    except (Exception, SystemExit) as exc:
        if isinstance(exc, SystemExit) and exc.code in (0,None):
            return
        failures.append(path)
        traceback.print_exc()
check_script(str(D / 'scripts/test_universe_100.py'), run_name='__main__')

# Original licensed-reference 3D concept builder contract.
check_script(str(D / 'scripts/test_configurator_101.py'),run_name='__main__')

# Standalone sourced cheat and official-news hub validation.
check_script(str(D / 'scripts/test_hubs_103.py'),run_name='__main__')

# Source-checked craft facts and mission-specific heist command presentation.
check_script(str(D / 'scripts/test_vehicle_intel_104.py'),run_name='__main__')

# 150 licensed San Andreas collectible locations, existing saves intact.
check_script(str(D / 'scripts/test_sa_pins_105.py'),run_name='__main__')

# 7 original game-specific covers, 13 map directory, SVG safety and correct prior pin metadata.
check_script(str(D / 'scripts/test_cover_art_106.py'),run_name='__main__')

# Centralized, source-checked credits including Rockstar policy and GTADB MIT notice.
check_script(str(D / 'scripts/test_credits_109.py'),run_name='__main__')

# Original designed-brand alignment across primary and earlier-built public workspaces.
check_script(str(D / 'scripts/test_visual_unification_112.py'), run_name='__main__')

# Current project showcase, QA crest and collectables visual/version labels.
check_script(str(D / 'scripts/test_showcase_116.py'), run_name='__main__')

# Continue current Elario designed-brand parity to personally saved catalogs and reference tools.
check_script(str(D / 'scripts/test_workspace_design_113.py'), run_name='__main__')

# Verification, calibration, source-pack and quality assurance pages follow the same Elario design.
check_script(str(D / 'scripts/test_research_design_115.py'),run_name='__main__')

# Game-specific authentic classic flat-map references; maintain local marker storage.
check_script(str(D / 'scripts/test_classic_flat_106.py'),run_name='__main__')

# Current flagship Elario map/film identity, untouched source libraries and player controls.
check_script(str(D / 'scripts/test_flagship_brand_117.py'),run_name='__main__')

# Design-comparison screenshots stay isolated from generated public site assets.
check_script(str(D / 'scripts/test_design_review_118.py'),run_name='__main__')

# GTA IV, source-aware research, heist HQ and Data Lab current Elario identity.
check_script(str(D / 'scripts/test_workspace_brand_119.py'),run_name='__main__')

# Fifteen unique Elario mission artworks and original heist source/guide controls.
check_script(str(D / 'scripts/test_heist_art_120.py'),run_name='__main__')

# Original game-map imagery and source rights, player progress unchanged.
check_script(str(D / 'scripts/test_game_art_121.py'), run_name='__main__')

assert not failures, ('Nested static regressions failed', failures)
