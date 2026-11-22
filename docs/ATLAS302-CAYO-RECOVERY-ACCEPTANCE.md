# Atlas 30.2 — Cayo emergency-only raw recovery and single mission-map loader

**Draft staging only.** Based on successful Atlas 30.1 guest checklist preservation on PR #98. Existing modern Cayo island map, 15 heist pages, source attribution and user-owned progress must remain unchanged.

## Implementation
- If the historical `teamjura-heist-cayo-perico` checklist JSON is valid or absent, the new extension adds **no visible UI and performs no writes**.
- If it is corrupt or an unsupported JSON shape, a clearly labeled Elario violet/amber rescue panel appears immediately below Cayo's main navigation, outside `main.wrap>.layout` (hidden by the current Cayo flagship). The full modern island map and daily/chest planning remain available.
- The player can download the **exact original bytes** of that old checklist as a local text file. Only after a successful download and a distinct confirmation does a reset of that single key become available. It rechecks the raw value, rejects a concurrent change and leaves all Cayo focus routes, mission notes, other heists and Garage data untouched.
- A storage event from another tab invalidates stale download approval. No raw contents are sent over the network; no sign-in or public data sharing occurs.
- The shared heist-page loader previously included two identical injections of `atlas298-heist-map-kit.js` and its CSS. Removed the duplicate so the 14 non-Cayo schematic phase maps mount **exactly once**. The independent Atlas 29.9 backup loader and Cayo island scripts remain unchanged.
- The original Atlas 30.1 complete checklist code on draft PR #98 is preserved; the earlier duplicate stacked PR #104 was closed without merging to prevent overwriting a newer implementation.

## Focused QA and release safety
- `scripts/test_atlas302_cayo_rescue.py` checks that original Cayo source remains, map loader is not duplicated, fallback is emergency-only, safe raw storage handling and JS syntax.
- `scripts/test_atlas302_cayo_rescue_browser.py` exercises actual built Cloudflare site at 390px and 1440px: healthy Cayo has no rescue, corrupted Cayo shows an accessible recovery panel, original bytes download exactly, stale-copy reset is blocked, a new copy/confirmed reset changes **only** the old checklist, island map remains navigable, and Fleeca's mission-phase map mounts once.
- Only scoped Cayo/Fleeca Chromium and build/source checks are configured in `atlas302-cayo-rescue.yml`. The complete last-release Chromium/Edge/ZIP validation is still manual, separate and required along with user iPhone/Safari visual review and explicit owner approval.
- Never treat this staged change as deployment to public Cloudflare `development` or protected `main`.
