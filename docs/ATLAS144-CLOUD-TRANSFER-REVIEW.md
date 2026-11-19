# Atlas 14.4 — Consent-first cloud progress transfer (staging)

**Branch:** `feature/atlas144-consent-first-cloud-transfers` from the validated public `development` baseline. **Release status: REVIEW ONLY — NO MERGE TO CLOUDFLARE.**

## What is implemented

- `atlas144-cloud-transfer.js`: independent, testable cloud transfer coordinator using an already authenticated `AtlasCloudSaves.createRepository(client)` instance, never an admin/service-role connection.
- `inspect(namespace)`: read-only comparison of current device and current user's cloud record, including remote revision. No changes to local storage or database.
- `upload(namespace,{consent:true,mode:'create'})`: create only if the authenticated user's namespace has no cloud version.
- `upload(namespace,{consent:true,mode:'replace',expectedRevision})`: requires a reviewed matching revision; the repository's optimistic update catches concurrent writes.
- `download(namespace,{consent:true,overwriteLocal:true})`: explicit opt-in to replace an existing device record; a missing local record can be restored without overwrite.
- Only allowlisted original localStorage keys and known namespaces; invalid records, oversized documents, fabricated namespace strings and remote payload formats are rejected. No secret or user-input SQL is constructed.
- Failed writes preserve existing progress where storage permits. All transfer methods are intentionally **unwired from the public UI** until HTTPS login and real-device tests pass.

## Initial category coverage — not complete backup parity

| Cloud namespace | Existing device storage key |
|---|---|
| `story_progress` | `jura3-progress` |
| `passport` | `team-jura-passport-v74` |
| `collection_hq` | `team-jura-atlas81-hq-v1` |
| `collectible_checklist` | `team-jura-checklist-v54` |
| `owned_vehicles` | `team-jura-atlas90-collection-v1` |
| `parking_ledger` | `team-jura-atlas96-parking-v1` |
| `garage_details` | `team-jura-atlas93-garage-v1` |
| `map_routes` | `jura-atlas-routes` |
| `map_favorites` | `jura-atlas-favorites` |

Other tools, newer individual game modes and locally stored image blobs are **not yet** part of cloud transfers. Do not claim complete cross-device syncing or automatic backup. The existing `atlas131-account.js` manual JSON export/import remains the broader emergency backup option.

## Before making public account buttons active

1. Confirm the exact Supabase project URL and publishable key using a vetted HTTPS-only configuration. Never commit service-role or secret keys.
2. Finish a real, user-approved confirmed-email login and sign-out flow and test invalid/expired sessions on the deployed **HTTPS** origin.
3. Test owner A/B isolation through separate real browser JWT sessions, not only database policy simulation.
4. Audit storage quota, conflict decisions, storage rollback, cross-device migration and recovery on iPhone, Chromium and Edge.
5. Expand the namespace coverage to all relevant progress and validate map/story/online isolation.
6. Present a clear **review and explicit consent** dialog for *each transfer*, with separate buttons for upload versus download. Do not sync silently on page load or sign-in.
7. Re-run source/static, desktop/mobile Chromium and Edge, reviewed screenshots, and validated ZIP. Keep public sign-in disabled until these gates succeed.

## Release hold

Per owner's November 19 instruction, this work must remain on the review branch until the owner asks for **one combined merge** to the Cloudflare-connected `development` branch. GitHub `main` remains untouched. Distinguish staging code and passing CI from an actual Cloudflare deployment.
