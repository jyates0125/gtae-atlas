#!/usr/bin/env python3
"""Atlas 13.8: check proposed SQL and prevent premature auth activation."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
schema = (root / "docs/ATLAS138-SUPABASE-SCHEMA.sql").read_text()
verify = (root / "docs/ATLAS138-SUPABASE-VERIFY.sql").read_text()
account = (root / "atlas-account.html").read_text()
security = (root / "docs/ATLAS138-SUPABASE-SECURITY.md").read_text()
assert "create table if not exists public.atlas_saves" in schema
assert "references auth.users(id) on delete cascade" in schema
assert "enable row level security" in schema
assert "force row level security" in schema
assert "revoke all on table public.atlas_saves from public, anon, authenticated" in schema
for command in ("select", "insert", "update", "delete"):
    assert f"for {command} to authenticated" in schema, command
assert schema.count("with check ((select auth.uid()) = user_id)") == 2
assert schema.count("using ((select auth.uid()) = user_id)") == 3
assert "has_table_privilege('anon'" in verify
assert "authenticated_can_truncate" in verify and "authenticated_can_trigger" in verify
assert "20261121043647_harden_atlas_save_table_privileges.sql" in security
assert "relforcerowsecurity" in verify
assert "pg_policies" in verify
assert "does NOT test two-user isolation" in verify
assert "Sign in · Coming after secure setup" in account
assert 'type="button" disabled' in account
assert "https://dwqrmgeldssozgdtidla.supabase.co" in security
# Do not accidentally embed supplied public key or service-role credentials in the new docs.
for filename in ("ATLAS138-SUPABASE-SCHEMA.sql","ATLAS138-SUPABASE-VERIFY.sql","ATLAS138-SUPABASE-SECURITY.md"):
    text=(root / "docs" / filename).read_text()
    assert not re.search(r"sb_(?:publishable|secret)_[A-Za-z0-9_-]{12,}",text),filename
print("PASS Atlas 13.8 security foundation static checks (not a live auth/RLS test)")
