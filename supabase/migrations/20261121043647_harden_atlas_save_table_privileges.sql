-- Executed in Supabase elario-atlas-dev on 2026-11-21; retain versioned parity in GitHub.
-- Restrict public cloud-save table to owner-scoped CRUD via RLS. Do not allow table-wide operations.
REVOKE ALL PRIVILEGES ON TABLE public.atlas_saves FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.atlas_saves TO authenticated;
