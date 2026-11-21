# Atlas 13.8 — Supabase integration security checklist

**Target:** GitHub `development` → Cloudflare Pages. **Project:** Supabase `elario-atlas-dev`.

## Project settings already chosen
- Primary site: `https://gtae-online.pages.dev`
- Allowed redirect URLs: `https://gtae-online.pages.dev/**` and `https://team-jura-atlas-preview.pages.dev/**`
- Email authentication and confirmation enabled; anonymous and phone sign-in disabled.
- Supabase database branch `main (PRODUCTION)` is **not** the GitHub website branch `main`. Do not change the protected GitHub `main`.

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

## Current implementation status
The public `atlas-account.html` intentionally displays **sign-in disabled**, and `atlas131-account.js` performs local manual backup. Neither is cloud authentication or sync. Do not present this checklist as a completed integration.
