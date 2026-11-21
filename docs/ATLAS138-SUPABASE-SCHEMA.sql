-- Atlas 13.8 candidate owner-scoped cloud-save schema.
-- Review in Supabase SQL editor before applying; not executed by website builds.
-- Authentication must be verified on HTTPS. This schema does NOT activate sign-in.

create table if not exists public.atlas_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  namespace text not null check (namespace ~ '^[a-z][a-z0-9_-]{1,63}$'),
  schema_version integer not null default 1 check (schema_version between 1 and 100),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 131072),
  revision bigint not null default 1 check (revision >= 1),
  updated_at timestamptz not null default now(),
  primary key (user_id, namespace)
);

alter table public.atlas_saves enable row level security;
alter table public.atlas_saves force row level security;

revoke all on table public.atlas_saves from public, anon, authenticated;
grant select, insert, update, delete on table public.atlas_saves to authenticated;

drop policy if exists atlas_saves_own_select on public.atlas_saves;
create policy atlas_saves_own_select on public.atlas_saves
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists atlas_saves_own_insert on public.atlas_saves;
create policy atlas_saves_own_insert on public.atlas_saves
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists atlas_saves_own_update on public.atlas_saves;
create policy atlas_saves_own_update on public.atlas_saves
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists atlas_saves_own_delete on public.atlas_saves;
create policy atlas_saves_own_delete on public.atlas_saves
  for delete to authenticated using ((select auth.uid()) = user_id);

-- IMPORTANT: a future API must implement optimistic revision checks and avoid
-- overwriting another device's later edits. RLS is required but not sufficient.
-- Test owner vs another authenticated user and unauthenticated access before use.
