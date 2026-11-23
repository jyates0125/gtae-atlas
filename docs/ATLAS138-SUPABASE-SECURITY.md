# Atlas 13.8 — Supabase integration security checklist

**Target:** GitHub `development` for private previews → protected `main` for Cloudflare GTAE production. **Project:** Supabase `elario-atlas-dev`.

## Intended Auth settings — recheck in Supabase dashboard before enabling login
- Primary GTAE site: `https://gtae-online.pages.dev` (public website on protected GitHub `main`).
- Historical desired redirect allowlist included GTAE and the older `team-jura-atlas-preview.pages.dev` origin. **The connected Supabase API in this audit does not verify live Auth URL/provider settings.** Recheck settings in the dashboard and retire the old allowed origin only after its Cloudflare project is actually removed.
- Email confirmation and disabled anonymous/phone sign-in were owner-intended settings, **not re-verified by the available auth-config read tools**. No public signup/login or cloud sync is wired on the GTAE site today.
- Supabase database branch `main (PRODUCTION)` is not the website's GitHub production branch. Do not confuse independent product branch controls.

## Key handling
- Owner supplied a Supabase **publishable** key in conversation. Never store that key in this document, a GitHub commit, or a server-secret field.
- The browser may use a Supabase publishable key **only** when paired with the verified project URL. Publishable is not a service-role key.
- Never expose `service_role`, `sb_secret_*`, database credentials, JWT signing secrets, or privileged API routes to a static build or commit.
- Do not enable any account button until the auth provider and save APIs are verified on the deployed HTTPS origin.

## Database release gates (required before sign-in)
1. **Project reference confirmed by owner:** `dwqrmgeldssozgdtidla`. Derived Supabase URL: `https://dwqrmgeldssozgdtidla.supabase.co`. Reconfirm with the dashboard before deploying a live client.
2. Create an owner-scoped `atlas_saves` table, with primary key (`user_id`, `namespace`) and `user_id uuid not null references auth.users(id) on delete cascade`.
3. Enable RLS on the table and enforce `auth.uid() = user_id` for select/insert/update/delete **and** matching `WITH CHECK` for inserts/updates. Test using two separate authenticated users; anonymous traffic must not read/write.
4. Limit permitted namespaces, input sizes, schema versions and update rates; design revision-based conflict handling before implementing overwrites.
5. Retain explicit guest mode and manual import/export; never auto-upload guest progress without consent.
6. Verify confirmed-email login, invalid-session handling, sign-out, reset/recovery, two-account isolation, device transfer, conflicts, data deletion and server-side access controls.
7. Run complete Chromium/Edge + static audit + validated ZIP workflow on a review branch before a conditional merge to `development`.

## Verified live database privilege hardening (21 Nov 2026 UTC)
- Supabase project `elario-atlas-dev` has RLS enabled and four user-owned CRUD policies on `public.atlas_saves`. A metadata query showed two existing Auth accounts and zero cloud-save rows at review time; this is not proof of login readiness.
- Applied and verified migration `20261121043647_harden_atlas_save_table_privileges.sql` directly in the connected Supabase development project. Authenticated retains SELECT, INSERT, UPDATE, DELETE; anonymous has no table privileges; authenticated TRUNCATE, REFERENCES and TRIGGER are false. This removes unnecessary table-wide privileges not governed by row policies.
- Security Advisor still warns **Leaked Password Protection Disabled**. Before enabling password sign-up, review and enable compromised-password protection where supported, confirm custom Auth SMTP, and test two-account isolation, email confirmation/recovery, device transfer and actual deletion.
- No Edge Functions are deployed for account deletion; the proposed 14-day cancellation/recovery window is not implemented.

## Live connected review — November 23, 2026

- Supabase `elario-atlas-dev` is `ACTIVE_HEALTHY` on PostgreSQL 17.12, with zero rows in `public.atlas_saves`; this does not mean the Auth user table is empty.
- The save table has **RLS enabled and FORCE RLS on**, exactly four owner-only `authenticated` CRUD policies, and `anon` has no table grants. `authenticated` has SELECT/INSERT/UPDATE/DELETE only. UPDATE and INSERT have owner-scoped `WITH CHECK`; all grants were read from `information_schema.role_table_grants`. Schema bounds: valid namespace pattern, JSON object up to 131072 bytes, revision >= 1 and schema version 1..100.
- A `public.rls_auto_enable()` security-definer helper exists, but its observed function ACL allows `postgres` only; do not grant it to `PUBLIC` or API roles.
- Security Advisor: **Leaked Password Protection Disabled** (WARN), while health/performance advisors report zero lint findings. Supabase currently documents this specific feature as requiring **Pro+**; avoid promising it is free. Consider verified email OTP/magic-link sign-in if appropriate, but do not enable any public flow without testing email delivery.
- No Supabase Edge Functions are deployed. Account deletion/recovery and two-real-user data isolation remain **not implemented/verified**.
- **No schema changes were executed** in this review; the existing owner-scoped database security foundation remains unchanged.
- Binding complete audit matrix: [Atlas 35.4 GitHub, Cloudflare and Supabase readiness](ATLAS354-GIT-CLOUDFLARE-SUPABASE-READINESS-20261123.md).

## Current implementation status
The public `atlas-account.html` intentionally displays **sign-in disabled**, and `atlas131-account.js` performs local manual backup. Neither is cloud authentication or sync. Do not present this checklist as a completed integration.
