# Atlas 30.4 — Character archive navigation and portrait coverage
**Stage only · no production release.** Based on the owner-approved Team Jura Standing Charter and the frozen combined staging head `359ea0223a0fabd19bd333034743737685e60fdf`.

## Working scope
- The curated character database remains **40 appearance records**, not 40 distinct people. **13** list local original Elario character concepts and **27** are reference-only or individual-portrait-pending. The counts are dynamically derived from recorded assets, not fabricated render or copyright assurances.
- A visible coverage filter switches between all, bundled-local concept and reference/pending appearances; it respects Story, Online, VI and classic edition filters, name/alias search, reset and shareable `art=` query parameters. A valid shared profile always overrides an incompatible art filter.
- In a character profile, Previous / Next browses only the current filtered results. Switching records **replaces the single open-modal history entry**, so browser Back or the native close action returns to the roster instead of forcing the visitor through every inspected character. Names, world links and provenance update with the selected profile.
- Short mobile landscape keeps the profile dialog within the viewport; its original 44px sticky close stays reachable. No world data changes, no new network image downloads, no guest storage writes.

## Focused tests and release hold
- `scripts/test_atlas304_character_archive.py` checks source contracts, the 40/13/27 coverage ledger and original world-boundary assertions.
- `scripts/test_atlas304_character_archive_browser.py` runs against Cloudflare's built static payload in Chromium at 375×667, 390×844, 844×390 and 1440×900. It checks filters, deep links, modal next/previous, URL/back behavior, mobile exit and no horizontal overflow, with external media blocked.
- `.github/workflows/atlas304-character-archive.yml` is path-scoped to archive files. It does **not** run unrelated Cayo/heist tests.
- This is a usability milestone, **not** proof of portraits resembling real in-game characters. Dedicated Story/Online Lamar images and many other character illustrations remain unfulfilled. Real iPhone Safari, premium art owner review, license audit, full Chromium/Edge/ZIP release and protected main approval remain pending.
