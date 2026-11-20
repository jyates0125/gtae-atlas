#!/usr/bin/env python3
"""Check four evidence workspaces use distinct original artwork and truthful navigation."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
css=(ROOT/"atlas127-research-identity.css").read_text(encoding="utf-8")
expect={
 "atlas-test-center.html":("j127-test","interface-illustration.webp",["atlas98b-test.html","atlas-credits.html"]),
 "atlas-coverage.html":("j127-coverage","atlas92-map-directory.webp",["atlas-verification.html","maps.html"]),
 "atlas-verification.html":("j127-verification","atlas93-leonida.svg",["atlas-source-registry.html","atlas-credits.html"]),
 "atlas-feature-audit.html":("j127-history","atlas93-gta-online.svg",["maps.html","atlas-test-center.html"]),
}
for page,(scope,art,links) in expect.items():
 html=(ROOT/page).read_text(encoding="utf-8")
 assert "j127-evidence-page "+scope in html,page
 assert './atlas127-research-identity.css?v=127' in html,page
 assert 'j127-page-links' in html,page
 assert 'class="j115-source-head"' in html,page
 assert f"body.{scope}" in css,(page,scope)
 assert art in css and (ROOT/"art"/art).is_file(),art
 for link in links:
  assert 'href="./'+link+'"' in html,(page,link)
  assert (ROOT/link).is_file(),link
 assert re.search(r'<section class="j115-source-head"[^>]*>.*?<nav class="j127-page-links"[^>]*>.*?</nav>\s*</section>',html,re.S),page
assert len(set(v[1] for v in expect.values()))==len(expect)
assert "atlas98-approved-hero.webp" not in css, "Never repeat the crew hero on evidence pages"
print("PASS Atlas 12.7: distinct original evidence hero images, source navigation and data-safe page styling")
