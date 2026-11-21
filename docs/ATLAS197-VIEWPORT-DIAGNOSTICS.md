# Atlas 19.7 · Browser race and phone overflow diagnostics

- GTA IV native map pin visibility changes on a requestAnimationFrame. Focused browser acceptance must wait for the resulting source-status text **after** click rather than reading the preceding frame immediately. It still asserts both hide and show transitions.
- The site-wide screenshot manifest now records DOM elements extending outside the viewport only on pages with measured document overflow; this makes the remaining classic episode and historical-audit mobile overflow defects actionable without hiding/clip-masking content.
- Prior 19.6 full Chromium and Edge **general page smoke** both passed 186/186. The specialized GTA IV script still failed an overly eager immediate status read; this amendment corrects the test synchronization, not the app's behavior. Re-run all CI on exact next commit.
- No live promotion until the complete suite and visual inspection are accepted by the owner.
