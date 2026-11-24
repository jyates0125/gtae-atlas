# Atlas 36.4 — Modern map credit and navigation completion batch
Date: November 23, 2026 · Scope: Story, Online, Leonida maps · **draft staging only**

## Delivered source changes
- A **single, readable bottom credit** on each of the three modern map pages: GTADB.org, exact CC BY 4.0 license and direct Sources & changes register. No additional pop-up, floating credit card, redundant sidebar attribution panel or media hotlink.
- Live view provenance displayed only where space permits: GTADB original tile variants, YANIS V18 / Scaly, DUPZOR V51 / Loki, YANIS V15 archive, research view, and the in-game GTA VI Day tile family. For the Day view the source text separately acknowledges Rockstar artwork; a CC license for contributors' work does not license Rockstar's game IP.
- All Maps is preserved and accessible as the first link in the existing Atlas page navigation, rather than a fixed bottom-right element obstructing map actions and licensing attributions. GTA VI and Online use correct initial map headings while the map engine initializes.
- On narrow phones, long per-view labels are hidden but author/license/full-credit links remain in the narrow bottom strip. The three map action buttons sit above the credit strip.
- GTADB and contributors' exact attribution and transformations remain in `atlas-credits.html#licensed`. License source: https://github.com/rolux/gtadb.org/blob/main/LICENSE-DATA ; source FAQ: https://faq.gtadb.org/.

## Focused validation
`node scripts/test_atlas364_map_credits.cjs` checks all three pages, single strip, legally required links, native nav placement, world labels, per-view updates, safe unknown-layer fallback and no source network calls/storage. New focused CI workflow `atlas364-map-credit.yml` is path scoped. Run actual built Chromium/Edge phone and desktop map usability checks before release; no green claim is made before Actions finishes.

## Unresolved, explicitly **not** completed
- A license-cleared, coordinate-aligned **1536 x 1748 uint16 Leonida elevation grid** remains absent; 3D remains truthful perspective fallback/optional local terrain import. There is no new terrain asset in this batch.
- Independently verified map positions, exhaustive all-world collectibles/route data, physical iPhone Safari touch acceptance, owner visual release review, final full Chromium + Edge + validated ZIP and separate protected `main` approval remain open.
- No external media mirrored, no new sign-in enabled, no guest progress keys changed, no Cloudflare production deployment.
