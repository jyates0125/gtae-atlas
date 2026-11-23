#!/usr/bin/env python3
"""Atlas 35.4: offline deployment-boundary / guest-first / Supabase-doc contract.

Intentionally does not connect to the production service or any user account.
It cannot prove the absence of *all* secrets or the safety of real Auth sessions.
"""
import json
import os
import re
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/"public"
read=lambda name:(ROOT/name).read_text(encoding="utf-8")

account=read("atlas-account.html")
assert "SECURE CLOUD ACCOUNT · NOT ENABLED YET" in account
assert "Sign in · Coming after secure setup" in account
assert re.search(r'<button[^>]+disabled[^>]*>Sign in · Coming after secure setup</button>',account), "Sign-in button must remain disabled"
assert "Continue as a guest" in account and "Back up my Atlas progress" in account
assert "This page does not collect a password or email" in account
assert "not automatic cloud syncing" in account.lower()

headers=read("_headers")
for setting in ("X-Content-Type-Options: nosniff","X-Frame-Options: DENY",
                "Strict-Transport-Security: max-age=31536000","/atlas-account.html",
                "Cache-Control: no-store"):
    assert setting in headers,setting

supabase=read("docs/ATLAS138-SUPABASE-SECURITY.md")
audit=read("docs/ATLAS354-GIT-CLOUDFLARE-SUPABASE-READINESS-20261123.md")
assert "does not verify live Auth URL/provider settings" in supabase
assert "no schema changes" in supabase.lower()
assert "RLS enabled and FORCE RLS on" in supabase
assert "main" in supabase and "development" in supabase
assert "Cloudflare" in audit and "Supabase" in audit and "GitHub" in audit
assert "public" in audit and "Cloudflare" in audit

env=os.environ.copy()
for key in ("CF_PAGES","CF_PAGES_BRANCH","CF_PAGES_URL"):
    env.pop(key,None)
env["CF_PAGES_COMMIT_SHA"]="a"*40
z=subprocess.run(["node","scripts/build-cloudflare.cjs"],cwd=ROOT,env=env,
    text=True,capture_output=True,timeout=120,check=False)
assert z.returncode==0, "Secure builder failed: "+z.stderr[-1600:]
assert "-> public/" in z.stdout
identity=json.loads((PUBLIC/"atlas-build-identity.json").read_text(encoding="utf-8"))
assert identity.get("revision")=="a"*40 and str(identity.get("generatedAt","")).endswith("Z")
for page in ("index.html","maps.html","atlas-account.html","atlas-credits.html",
             "atlas-policies.html","atlas.html","atlas-online.html","atlas-vi.html",
             "atlas93-garage.html","_headers"):
    assert (PUBLIC/page).is_file(), "Public website route missing: "+page
for internal in ("scripts/build-cloudflare.cjs","scripts/build-cloudfare.cjs",
    ".github/workflows/team-jura-release.yml","docs/TEAM-JURA-STANDING-CHARTER.md",
    "docs/ATLAS138-SUPABASE-SECURITY.md","docs/ATLAS354-GIT-CLOUDFLARE-SUPABASE-READINESS-20261123.md",
    "supabase/migrations/20261121043647_harden_atlas_save_table_privileges.sql",
    "package.json","package-lock.json"):
    assert not (PUBLIC/internal).exists(), "Internal repository path leaked into production: "+internal
privileged=re.compile(
    r"sb_secret_[A-Za-z0-9_-]{12,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
    re.I
)
for path in PUBLIC.rglob("*"):
    if path.is_file() and path.suffix.lower() in (".html",".js",".json",".css",".txt"):
        contents=path.read_text(encoding="utf-8",errors="replace")
        assert not privileged.search(contents), "Known privileged token signature found in deployed asset: "+str(path.relative_to(PUBLIC))
public_account=(PUBLIC/"atlas-account.html").read_text(encoding="utf-8")
assert "Sign in · Coming after secure setup" in public_account
assert "<button type=\"button\" disabled" in public_account
assert "mailto:rights@" not in public_account and "mailto:hello@" not in public_account
print("PASS Atlas 35.4: filtered output, guest-first disabled auth, security headers, no detected privileged token patterns")
print("NOTE: real Cloudflare caching, Supabase Auth settings and user A/B isolation require separate live acceptance")
