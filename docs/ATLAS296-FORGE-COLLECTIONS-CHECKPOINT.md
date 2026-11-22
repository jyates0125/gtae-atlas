# Atlas 29.6 — Forge Collections includes unowned saved Garage builds

**Status:** functional code staged on top of draft Atlas 29.4 integrated preview; tests and owner acceptance still required before release.

## Completed in source
- `atlas263-forge-collections.js` now reads the existing private Garage metadata and ownership registry to show **saved Garage builds, regardless of whether the model is marked owned**.
- A model with both a saved Garage build and an owned mark produces one Garage collection entry, with a truthful combined label. An owned model without a custom build still appears; an unowned untouched default model does not masquerade as a personal saved build.
- The collection hub continues to show separately saved Forge primary and named variants, with GTA VI source names isolated to the VI Forge namespace.
- Collection links contain only the public model ID; player notes, personal garage names, design titles and ownership values do not go into shareable URLs. The destination is the existing private local Garage detail.
- The filter description now explicitly includes saved unowned Garage designs. Nothing in this change claims an in-game purchase, Rockstar account sync, exact licensed 3D mesh or server cloud storage.

## Focused acceptance
- `node tests/atlas296-forge-collections.test.cjs`: source-backed saved/owned identity, unowned entries, default model omission, no double counting, VI isolation, read-only data and link privacy.
- `python scripts/test_atlas296_forge_collections_browser.py`: actual Cloudflare-built local site at 390px and 1440px, Forge saved results, search/filter, no horizontal overflow, private local storage unchanged and model-specific Garage deep link.
- `.github/workflows/atlas296-forge-collections.yml`: path-scoped unit, built-site audit, Chromium interactions and screenshot artifact. Does **not** execute unrelated Cayo/Edge/full release checks during routine work.

## Still open
Device-side Safari acceptance, owner visual approval, complete multi-world premium art and the wider Standing Charter completion board. Integrate only into draft staging PR #98 after focused CI passes; the protected public release branches remain untouched until separately approved.
