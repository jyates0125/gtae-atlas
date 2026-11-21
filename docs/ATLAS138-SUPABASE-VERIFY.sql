-- Team Jura Atlas 13.8 — READ-ONLY security verification
-- Run in Supabase SQL Editor under elario-atlas-dev.
-- This does NOT test two-user isolation; browser/API tests with two real accounts are still needed.
select
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  has_table_privilege('anon','public.atlas_saves','SELECT') as anonymous_can_select,
  has_table_privilege('anon','public.atlas_saves','INSERT') as anonymous_can_insert,
  has_table_privilege('authenticated','public.atlas_saves','SELECT') as authenticated_can_select,
  has_table_privilege('authenticated','public.atlas_saves','INSERT') as authenticated_can_insert,
  has_table_privilege('authenticated','public.atlas_saves','TRUNCATE') as authenticated_can_truncate,
  has_table_privilege('authenticated','public.atlas_saves','REFERENCES') as authenticated_can_references,
  has_table_privilege('authenticated','public.atlas_saves','TRIGGER') as authenticated_can_trigger
from pg_class c
where c.oid = 'public.atlas_saves'::regclass;

select policyname, cmd, roles, qual as using_expression, with_check
from pg_policies
where schemaname = 'public' and tablename = 'atlas_saves'
order by policyname;

-- Expected: RLS enabled/forced; anon SELECT/INSERT false;
-- authenticated SELECT/INSERT true but TRUNCATE/REFERENCES/TRIGGER false; exactly 4 policies to authenticated,
-- using auth.uid() = user_id, and INSERT/UPDATE with matching WITH CHECK.
