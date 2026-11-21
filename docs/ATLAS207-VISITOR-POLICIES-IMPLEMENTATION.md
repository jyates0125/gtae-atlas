# Atlas 20.7 — Visitor policies and account privacy implementation checklist

**Staging only.** The visitor-facing Policies & Disclaimers page is not a replacement for the detailed source-specific Credits page. Original Elario branding and Rockstar fan rights boundaries are preserved.

## Verified current site features
- Guest play and browser-managed local progress.
- Manual backup export and restore.
- Sign-in remains disabled; automatic cloud sync and account deletion workflows are NOT activated.

## Proposals requiring implementation before sign-in launch
- Verify a real private rights/privacy contact channel and publish it, replacing the temporary statement that one is required.
- Inventory service providers and server logs. Do not assume analytics or cookies are absent without auditing real production resources.
- Verify secure HTTPS login, two-user isolation, backup restore, opt-in guest-to-cloud migration and actual data erasure across Auth, cloud-save tables, owned storage, logs and backups.
- Proposed voluntary 14-day cancellation window for deletion, with immediate session gating and guaranteed job retry after window. Do not represent it as required by law or as evidence that backups vanish immediately.
- Publish deletion-specific request and processing SLAs, limited lawful retention exceptions, and data-subject request / escalation processes applicable to operating jurisdictions.
- Re-review laws applicable to project scale; the Kentucky Consumer Data Protection Act took effect January 2026 but covered-entity thresholds matter. The California CCPA and COPPA also have separate applicability rules.
- Future children's products must be separate and assessed for age, COPPA/parental consent, and special information practices.
- Test account, storage and notification disclosures on mobile, Safari, Edge and Chromium. Verify external providers and actual telemetry before promising no sale, no tracking or deletion deadlines.

## Legal information sources (not a substitute for counsel)
- https://www.ag.ky.gov/about/Office-Divisions/ODP/KCDPA/Pages/default.aspx
- https://www.oag.ca.gov/privacy/ccpa
- https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- https://support.rockstargames.com/articles/7bNaeoMFTV0iUDGhStTXvz/policy-on-posting-copyrighted-rockstar-games-material

No owner-sensitive personal contact addresses, secrets or user data are added to the public repository.
