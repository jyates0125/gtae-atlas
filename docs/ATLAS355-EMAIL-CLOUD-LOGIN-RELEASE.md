# Atlas 35.5 — existing verified email login and consent-first cloud saves

**Status:** Feature branch, staged; not production. 2026-11-23.
**Supabase project:** GTAE-Atlas (dwqrmgeldssozgdtidla).
**Production:** https://gtae-online.pages.dev/ on protected main. Development is non-production.

## Delivered
- Email/password login and sign-out with an official pinned supabase-js browser package.
- Private cloud save API using existing owner-scoped database RLS and optimistic revision checks.
- Nine known save categories: explicitly inspect, upload or restore; no automatic migration or overwrite.
- All existing guest access and broader manual device backups remain.
- Existing two verified email/password identities are the initial test accounts. No public signup, email reset, phone or OAuth login is enabled.
- Account page is HTTPS/top-level only, with a restrictive account-page CSP.
- The source authentication configuration is deliberately OFF. Cloudflare only injects a PUBLISHABLE key when explicitly opted in; no keys are committed to GitHub.
- Focused offline test and GitHub workflow for config opt-in, client syntax, save modules and generated build.

## Owner configuration — do NOT send any keys in chat
In Cloudflare → Pages → gtae-online → Settings → Variables and Secrets, configure the PREVIEW environment first:
- GTAE_ATLAS_AUTH_ENABLED = true
- GTAE_SUPABASE_PUBLISHABLE_KEY = the active Supabase GTAE-Atlas sb_publishable_ key (not sb_secret, service_role or database password).
- Build command remains node scripts/build-cloudflare.cjs; output directory remains public.

Redeploy a reviewed preview. Keep PRODUCTION settings disabled until owner acceptance and a protected main promotion. The generated client config intentionally publishes the public key to the browser; server RLS is the security boundary.

## Pre-release gates
1. Confirm focused CI passes on the exact feature head. Inspect production guard changes for conflicts.
2. Verify preview generated config, HTTPS, CSP and network access. Verify the correct Cloudflare environment.
3. Sign in as test account A, inspect and consent to a cloud upload.
4. Sign out, use separate browser context to sign in as account B and prove it cannot access or modify A's saves. Use actual authenticated sessions, not only metadata.
5. Validate session expiry, password entry, sign-out, opt-in transfers, revision conflicts, guest preservation, manual exports and restore on iPhone Safari, Edge and Chromium.
6. Set up and test custom SMTP and password recovery before allowing public email sign-up; default Supabase SMTP sends only to preauthorized team accounts.
7. Finalize actual account deletion/retention workflows and privacy terms. The proposed 14-day recovery process is not implemented.
8. Full release static/browser/validated ZIP checks and owner visual approval before promotion to protected main.
9. Deliberately set Production Cloudflare environment for the approved release, then validate exact live build identity and account behavior.

## Limits
Only existing test members can log in at this stage. Initial sync is manual and limited to nine known JSON localStorage categories; it is not complete or background cross-device sync. Some newer Garage and game modes remain uncovered.
CDN availability and third-party script integrity should be verified or the pinned client library vendored before public release.
Do not claim real passwords, cross-user isolation or deployed activation have been tested by metadata inspection alone.

## Recovery extension — 2026-11-23
- Existing-member Forgot password link and secure password-change form added on the protected preview.
- Supabase `resetPasswordForEmail` redirects back to the same preview's `atlas-account.html`; `PASSWORD_RECOVERY` is handled and the SDK requires a real authenticated session for `updateUser({password})`.
- Explicit password confirmation, session checking, input clearing and signed-out re-login verification; no public registration or privileged server credential.
- Delivery not yet proven: Supabase default email service only mails organization team-member addresses. An external address needs custom SMTP.
- Redirect not yet proven: configure/review Auth redirect allowlist for the specific protected preview or a tightly-scoped preview wildcard.
- Verify actual email receipt, password change, re-login, Safari/Edge, ownership isolation, CSP and final release gates before main.
