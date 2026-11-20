#!/usr/bin/env python3
"""Atlas 14.2: official Rockstar map/source links and truthful coordinate separation."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
js=(root/"atlas.js").read_text(encoding="utf-8")
page=(root/"atlas-vi.html").read_text(encoding="utf-8")
style=(root/"atlas141-leonida-views.css").read_text(encoding="utf-8")
for region in ["Vice City","Leonida Keys","Grassrivers","Port Gellhorn","Ambrosia","Mount Kalaga National Park"]:
    assert f"['{region}'" in js, region
assert "https://www.rockstargames.com/VI/media" in js
assert "https://www.rockstargames.com/VI/media/screenshots" in js
assert "https://www.rockstargames.com/VI" in js
assert "Rockstar official sources" in js
assert "not verified against Rockstar" in js
assert "community-map marker positions" in js
assert "sourcePanel.append" in js
assert "aria-label','Rockstar GTA VI official reference sources" in js
assert "active[filterScope()]=null;page=0;showTab('Find');render()" in js
assert "j142-official-sources" in style
assert "j141-official-flat" not in page and "atlas141-leonida-views.css" in page
assert "COMMUNITY RESEARCH · UNVERIFIED" in page
print("Atlas 14.2 official source links, six Rockstar regions, map-research separation PASS")
