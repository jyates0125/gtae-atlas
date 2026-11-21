# Atlas 13.1 — Social icons, guest accounts and progress portability

## Owner intention
1. A visitor sees directly clickable branded social platform icons on iPhone and desktop. No ZIP or media download is required for an ordinary link share.
2. Facebook/Reddit use their documented public share composer. TikTok, Instagram, YouTube and Discord don't expose a universal, open website link composer for unauthenticated third-party sites. On supported iPhones we call the native Web Share API so visitors can choose their installed app; on desktops without native sharing we copy the URL, open that platform and instruct users to finish posting. Users sign into their chosen platform themselves.
3. An optional Elario account will eventually enable actual saved progress after browser storage is cleared. **Until a secure, configured storage/auth system is built and verified, this must not be represented as working cloud sync.**

## What's built in this review branch
- `atlas131-social-icons.js` + `atlas131-social-icons.css` render branded accessible icons in welcome, `atlas-share.html`, and One Last Ride.
- `atlas-account.html` uses an honest guest-first interface and a disabled future sign-in control.
- `atlas131-account.js` exports and restores relevant known Team Jura localStorage game-progress records in a bounded JSON package; imports require explicit confirmation and reject suspicious keys.
- This portable backup can be saved to iCloud Drive and imported after the iPhone/browser is reset. **It is manual**, not automated.
- Tests and two-browser smoke coverage apply to desktop and 390px phone viewport.

## Recommended production cloud-account architecture (not yet integrated)
- Keep all public maps and guest features functional without account creation or cloud requests.
- Configure a first-party Cloudflare Pages Functions account API on HTTPS, an identity provider with verified OAuth/OIDC or email magic-link, and Cloudflare D1 database for owner-scoped saves. No bearer token in static public code or local backup packages.
- Store account-scoped, versioned per-feature save JSON with checked size/shape limits, server-side authorization, HTTPS-only secure session cookies, CSRF protection where relevant, per-user rate limits and retention/deletion policy.
- Implement optimistic revisions and user-visible conflict choices: do not silently replace a more recent device save. Merge guest progress only after authenticated explicit consent.
- Test account signup and recovery, sign-out, a cleared iPhone/device, successful login from another device, cloud recovery, guest-saves migration, deletion request, private isolation between two accounts, concurrent edits and restore rollback.
- Add app/secret settings and migration automation only after the owner configures/approves identity provider and Cloudflare D1. No placeholder endpoint or fake success. A successful static QA is not proof of actual cloud sync.

## Existing dataset protections
No changes to GTA map engines, source dataset, unverified VI labels, native progress storage semantics, Last Ride chapters/film assets, or Cloudflare public build workflow beyond tests. No login over HTTP or collection of visitor credentials.

## Release rule
**This is review-only.** Do not merge to `development` (the Cloudflare live site) or to `main` without new explicit owner approval, even when CI passes.
