"""Atlas 29.3 Garage -> Forge explicit working-copy handoff contracts.
Run: python scripts/test_atlas293_garage_forge_handoff.py
"""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
garage = (root / 'atlas93-garage.js').read_text(encoding='utf-8')
forge = (root / 'atlas101-configurator.js').read_text(encoding='utf-8')
assert "'&source=garage'" in garage, 'Garage must identify intentional source handoff'
assert "get('source')==='garage'" in forge
assert 'const incoming=garagePreset();' in forge
assert 'loadWorking(incoming)' in forge
assert 'if(named&&!garageHandoff)' in forge, 'Old named preset must not overwrite Garage handoff'
assert 'else if(!garageHandoff&&!selectedPreset()&&!garagePreset())' in forge
assert "new URLSearchParams(location.search).get('world')==='vi'" in forge
assert "const garageHandoff=!VI" in forge, 'VI concepts must not import GTA V Garage data'
assert "window.JuraForge?.normalize(existing?.design)" in forge
assert "studioDesign:window.JuraForge?.normalize(studioDesign)" in garage
assert "localStorage.setItem(KEY" in forge, 'Existing explicit Forge save remains intact'
assert "localStorage.setItem(META" in garage, 'Existing Garage save remains intact'
print('Atlas 29.3 Garage / Forge handoff source contracts passed')
