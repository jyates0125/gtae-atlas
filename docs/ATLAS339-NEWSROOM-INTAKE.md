# Atlas 33.9 — official Newsroom refresh and intake gate

Date: 2026-11-23. Status: draft staging, not released.

- Three Rockstar first-party entries from November 6, 19 and 20 are verified and added to the dated Newsroom snapshot; no copyrighted article body, maps or third-party graphics copied.
- A separate Newswire GraphQL discovery script reads only first-party article URLs and prepares a JSON review artifact. It validates URLs, calendar dates, duplicates, future dates and edition hints. Unknown classification remains unknown. Every discovered item is review-required and cannot be served as verified content until editorial approval.
- A distinct empty community-review queue has no publication connection. Community rumor or source availability is never proof of Rockstar confirmation.
- Tests are offline and deterministic. GitHub workflow runs them on changes to this feature branch. The optional manual/cron source discovery may fail when the undocumented GraphQL service changes or refuses requests. This must not be bypassed with speculative URLs.
- GitHub scheduled workflows run only from the default branch (currently protected main), not development or staging. The cron will NOT execute daily until the exact workflow has been separately approved into main. All automatic discovery remains unpublished unless reviewed.
- No unattended GitHub writes, merging, Cloudflare deployment, accounts, sign-in or changes to guest storage.
- Remaining release gates: exact-head workflow, full Chromium/Edge/ZIP, real iPhone Safari, source/artwork verification, both Cloudflare identities, owner review.
