# Atlas 19.3 · Full-site browser reliability — staging only

These changes were derived from the last 186-check Chromium and Edge smoke pass. They preserve the existing charter and approved cinematic Elario brand.

- Fixed a real JavaScript initialization failure in both alternate explorer pages: provisional fallback points now have normalized tag arrays and empty real-world descriptors rather than crashing on `tags.join`.
- Removed duplicate top-level `oldExport` variable declarations; all backup export/import controls remain bound with their original storage keys.
- Corrected `online-explorer.html` to open with GTA V rather than the GTA VI research grid. The full GTA Online Atlas is the authoritative primary destination, while the alternative viewer retains its private pin workflow.
- Repaired false negative in mobile browser smoke: first-load scroll is measured before Playwright scrolls to sidebar filters.
- Reconciled first-visit map pin QA with approved visible default categories; still asserts both directions of the interaction.
- GTA IV smoke verifies the bundled licensed local dataset contains at least 2,000 landmarks; no live source request is necessary.
- The Garage navigation now must have all eight existing locations, including VI vehicle research, without wrapped rows.
- The old optional embedded heist map may remain attached but hidden while the new single live map / view tabs are actively exercised. Any actual broken interaction still fails.
- Slower mobile accordion click gets 5.5 seconds, but must remain clickable.
- Release gate remains **HOLD**, no merge to `development` or `main`.
