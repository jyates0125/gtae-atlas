"""Focused Lamar Davis dual-appearance portrait and game separation contracts."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
records=json.loads((root/'data/atlas-universe-profiles.json').read_text(encoding='utf-8'))['records']
lamar=[r for r in records if r.get('kind')=='character' and r.get('name')=='Lamar Davis']
assert len(lamar)==2, 'Lamar must appear separately in Story and Online'
assert {r['scope'] for r in lamar}=={'story','online'}
assert {r['id'] for r in lamar}=={'character:lamar-story','character:lamar'}
for r in lamar:
    assert r.get('image','').startswith('https://'), 'A source portrait reference is required'
    assert r.get('game') in ('GTA V','GTA Online'), 'World/era must remain identified'
js=(root/'atlas222-characters.js').read_text(encoding='utf-8')
assert "media.dataset.artStatus='portrait-pending'" in js
assert "Individual portrait unavailable for " in js
assert "r.scope==='story'?'./atlas.html':r.scope==='online'?'./atlas-online.html'" in js
assert "r.scope==='classic'?'&edition='" in js
print('Lamar Story/Online portrait provenance and scope contracts passed')
