# Elario Account · secure sign-in and cloud sync implementation plan

**Status: design and UI readiness only.** No backend, authentication, hosted database, or automatic cloud sync is enabled. Guest local storage remains authoritative.

## Goals
- Optional sign-in; all existing Atlas guest tools remain usable without an account.
- Private per-user crew, garage, progress, checklists, routes, favorites, and settings across devices.
- Preserve world separation: GTA V Story, GTA Online, GTA VI Story, and future games.
- Never imply Rockstar account linkage or crew membership validation.

## Production architecture (requires provider decision and secrets configured outside GitHub)
1. Managed authentication provider with OAuth/OIDC authorization-code + PKCE or secure passkeys; verify email when email sign-in is enabled. Avoid writing our own password storage.
2. Server-side authorization and row-level ownership enforcement on **every** sync record; never trust user ID supplied in browser JSON.
3. Cloud database with user-scoped, versioned records, strict schemas, record-size limits, audit logging and rate limits. Store only necessary data. No credentials in client code or public repositories.
4. HTTPS-only auth callbacks, secure same-site cookie sessions when supported, CSP and CSRF protection as appropriate; explicit redirect allowlist and verified domain configuration.
5. Sync engine: stable per-record IDs, monotonically increasing versions/ETags, timestamps used for display not as sole conflict authority, idempotent upserts, incremental pull, retry with backoff, offline queue and visible last-sync status.
6. Conflicts: show a compare/restore interface rather than silently overwriting another device's garage or crew. Provide backup/export before first migration.
7. Privacy: account deletion, cloud-data export, consent for sync, minimal telemetry, retention policy, security incident response and backups. Do not collect minors' personal information in adult gaming areas.

## Migration and rollback
- Preserve current keys `team-jura-world-profiles-v2`, `team-jura-atlas93-garage-v1`, `team-jura-atlas90-collection-v1` and other guest save keys.
- On first opt-in sync, validate local payloads, show summary and ask whether to upload, download, or merge. Do not delete local data until successful verified reconciliation.
- Keep an independent JSON export/import path and support offline-only use after sign-out.
- Schema migrations must be tested against real older-format backups, oversized/corrupt files, and two-device concurrent edits.

## Acceptance tests before enabling any sign-in button
- Unauthenticated user cannot read/write another user's data (including guessed IDs).
- Auth callback rejects forged state, bad redirect, expired session, and invalid tokens.
- Guest use works when provider is offline; no account requirement to view maps.
- Same account on two browsers syncs, handles concurrent edits without data loss, survives network interruptions, supports deletion and export.
- iPhone Safari and desktop Chromium/Edge end-to-end tests; production HTTPS domain and rollback tested.

## Release blocker
Provider selection, backend provisioning, environment secrets, privacy disclosures, and real integration tests are not yet completed. Do **not** show functional Sign In / Sync buttons until all of these pass. No fabricated account success messages.
