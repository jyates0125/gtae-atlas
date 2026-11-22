# Atlas 30.5 — Multiple named Forge builds visible in My Garage

**Staged only.** The existing Forge configurator already stores up to eight independent named variants per vehicle. This milestone makes those variants available as editable working copies in the matching GTA V/Online Garage model.

## User-visible completion
- For a selected Garage model, list only validated matching GTA V Forge named designs, including original stored names and exact RGB values. Never read GTA VI's separate Forge namespace.
- Choosing Load reads the latest Forge key again, validates identity and selected named variant, applies color/body/visual concept to the unsaved Garage editor, and leaves garage location, notes, plate, favorite and ownership unchanged. Other vehicle data stays untouched.
- The visitor must still explicitly choose **Save custom build** to persist the selected Garage vehicle. Forge original and other saved named designs remain untouched. No user metadata is placed in shareable model URLs.
- Malformed or stale Forge data fails closed with a visible status; it is never overwritten or silently reset. Current model-specific marine/aviation concept and source disclaimer remain authoritative.

## Focused evidence and holds
- Pure reader unit: `tests/atlas305-garage-variants.test.cjs`, including scope identity, duplicate suppression, 8 variant limit, corrupt storage and immutability.
- Built Chromium 390px/1440px: `scripts/test_atlas305_garage_variants_browser.py`; path-scoped workflow `atlas305-garage-variants.yml`. Check exact PR head CI before merging.
- Still required for Charter completion: genuine source-cleared per-model 3D meshes and accurate vehicle media, actual iPhone Safari and design acceptance, complete release browser/ZIP evidence, owner approval, and protected public release. No new image rights are asserted.
