#!/usr/bin/env python3
"""Atlas 34.7 rights boundary contract for source + filtered production site."""
from pathlib import Path
from html.parser import HTMLParser
import json

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/"public"

class Ids(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids=set()
        self.links=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if "id" in attrs:
            assert attrs["id"] not in self.ids, "Duplicate section/element ID: "+attrs["id"]
            self.ids.add(attrs["id"])
        if tag=="a" and attrs.get("href"):
            self.links.append(attrs["href"])

def check(root):
    credits=(root/"atlas-credits.html").read_text(encoding="utf-8")
    terms=(root/"atlas-policies.html").read_text(encoding="utf-8")
    a,b=Ids(),Ids()
    a.feed(credits)
    b.feed(terms)
    assert "studio-rights" in a.ids
    assert "#studio-rights" in a.links
    assert "./atlas-policies.html#terms" in a.links
    assert "./atlas-credits.html#studio-rights" in b.links
    for word in ("© 2026 Elario Studios","All rights reserved","Third-party","Rockstar Games",
                 "Take-Two","AI-assisted","original", "permissions"):
        assert word.lower() in credits.lower(), word
    for word in ("© 2026 Elario Studios","all rights reserved","public GitHub repository",
                 "does not", "AI-assisted", "licensed"):
        assert word.lower() in terms.lower(), word
    assert "credit alone does not grant" in credits.lower()
    assert "no unverified email address is published" in credits.lower()
    assert "mailto:rights@" not in credits.lower() and "mailto:hello@" not in credits.lower()
    assert "./atlas-source-registry.html" in credits
    assert "MIT License" in credits and "CC BY 4.0" in credits
    assert "not an invitation" in terms.lower()
    assert "reuse" in b.ids and "#reuse" in b.links
    for phrase in ("noncommercial sharing and adaptation of limited excerpts",
                   "separate written permission", "not a blanket CC BY 4.0 license",
                   "does not restrict or revoke rights independently granted",
                   "withdraw our own limited community permission prospectively",
                   "remove material from its own service", "restore it where warranted",
                   "dedicated private rights contact is pending verification"):
        assert phrase.lower() in terms.lower(), phrase
    assert "https://creativecommons.org/licenses/by/4.0/" in b.links
    assert "https://github.com/rolux/gtadb.org/blob/main/LICENSE-DATA" in b.links
    assert "./atlas-credits.html#corrections" in b.links and "corrections" in a.ids
    print("PASS rights/permissions, upstream source credits and non-claim boundaries:",root)

check(ROOT)
if PUBLIC.is_dir():
    check(PUBLIC)
    # No source files or workflow YAML may be served by our real Cloudflare build.
    forbidden=("scripts/build-cloudflare.cjs","docs/TEAM-JURA-STANDING-CHARTER.md",
              ".github/workflows/team-jura-release.yml","LICENSE",
              "docs/ATLAS347-ELARIO-RIGHTS-AND-SOURCE-GOVERNANCE.md")
    for rel in forbidden:
        assert not (PUBLIC/rel).exists(), "Nonproduction source exposed: "+rel
    identity=json.loads((PUBLIC/"atlas-build-identity.json").read_text(encoding="utf-8"))
    assert identity.get("schema")==1
    assert "generatedAt" in identity and identity["generatedAt"], "Production identity timestamp not generated"
    print("PASS filtered public/ excludes internal docs/workflows and produces build identity")
