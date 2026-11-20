# Team Jura Atlas 16.2 — combined phone + laptop pre-merge handoff
Date: November 20, 2026. Work branch: `feature/atlas144-consent-first-cloud-transfers`; PR #68 targets **live Cloudflare `development`**. Never modify protected `main`. This document supersedes older assumptions about artwork that is still rejected.

## Owner's explicit art review
- Owner positively reviewed **home page**, 13 cinematic world covers, Vice City Stories world artwork and map layout, and 15 heist cinema artwork with source-aware planning contexts; accept these as the visual direction. One outstanding group still used dated skyline/crew illustration: wildlife, collectibles, weapons and GTA V/VI vehicle gallery hero images. Atlas 16.2 replaces them with **five separate original raster assets**.
- Owner has **not** given final, all-pages release approval: release gate stays HOLD. Do not declare unused 3D features, film, true coordinates or fully complete source-parity merely because artwork looks premium.
- The map should load directly, with optional user-triggered GTA VI ZIP download; no JSON upload required to browse. Preserve verified map coordinates, category-specific pins, guest saved progress, routes, multiple genuine image/map views and legend toggles; keep Story and Online datasets separate; source-qualify GTA VI Research/Scaly/Loki, and retain those approved map implementations rather than inadvertently swapping layers. Classic map notebook coordinates are image-relative unless sourced; avoid false basemaps.

## Site flow, identity, and stage scope
- Original public poster shared on Facebook → `Start Here` and guest Home dashboard → 4 flagship worlds → other 9 world cards → appropriate working tools. Full 13 world maps/search, heists, vehicles/specs, garage customization, weapons, characters III–VI, animals, collectibles and Elario Studios each need appropriate premium artwork.
- Social links are compact **footer icons**, not a social launch-kit page or compulsory download; no public credentials or forced sign-in. Mature-audience/parental notice friendly and nonblocking. Elario Studios educational/family sections separate from teen/adult GTA fan Atlas.
- Sign-in provider was reportedly set up separately. **Do not activate its public integration before one explicitly owner-approved artwork release is tested and merged to `development`**. Later implement secure HTTPS optional accounts, consent-based guest transfer and recovery.
- Film *One Last Ride*: existing short teaser is not full 3–5-minute film. Approved script/story remains in scope; do not mislabel teaser completed. Use legal/consented real-person likeness and original/authorized music.
- Compare actual usefulness and provenance with GTAWeb, GTADB and GTAMap.io (real layers, collectibles, accurate maps, 2D/3D where supported, vehicles, routes, search, personal progress); do not clone their unlicensed datasets or invent verified points. Identify remaining gaps in release notes.

## Release acceptance workflow
**Approved reference → distinct artwork → real working page → screenshot comparison at desktop/mobile → functional CI (Chromium and Edge) → source/right checks → validated Cloudflare staging preview → owner approves final rendered release → exactly one merge to `development` → verify live deployment.**
- GitHub CI on earlier head `0457fd2` showed Chromium+Edge success, 94 screenshots per browser, and uploaded package, while `validated-zip` failed ONLY at the intentional `scripts/test_atlas151_visual_release.py` owner HOLD. Never misstate this as a general site-build crash or bypass HOLD to get a green check.
- Existing scenic UI sources are informational **fan concept art**, never actual georeferenced in-game maps; do not use decorative cinematic imagery as map coordinates.
- Check/compare actual screenshot ZIP of all 94 mobile/desktop pages, not only a first-fold summary, including iPhone docking, map zoom/pinch/FIT, heist panel and every page's hero.
- Unresolved before final signoff: full page-by-page visual review, 3D functionality/source parity gaps, partial older-game map coverage and still-unverified coordinates, full Last Ride film, possible model image/spec completeness and secure signup deferred after merge.
- The existing **Team Jura Preview Builder** performs staging work; the new independent **Team Jura Merge Review** condition watcher alerts the owner when genuinely review-ready, never auto-merges. Do not run two separate workstreams into live.

## New five file assignments
Wildlife `art/jura161-wildlife.webp`; collectible hunts `art/jura161-collectibles.webp`; weapons `art/jura161-weapons.webp`; GTA V vehicles `art/jura161-vehicles.webp`; GTA VI vehicles `art/jura161-vehicles6.webp`. Different imagery per page, no generic SVG hero or duplicated crew posters; fallbacks may stay only for actual asset failure.
