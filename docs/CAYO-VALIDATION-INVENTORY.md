# Cayo validation inventory — independent pilot

Baseline: development 05303dcaf7e0c5ad810ff26297128cddee7304ff; protected main 4de7bcfedb411a88f609402f6065d098e4d059fe. Owner requests detailed completed feature checks only when affected, instead of repeating them on unrelated changes.

## Verified current duplication
The production workflow team-jura-release.yml calls test_atlas171_browser.py and test_atlas186_route_browser.py in both broad browser jobs AND both Atlas 22.0 focus jobs. This is eight detailed script invocations across Chromium and Edge, four per script. The broad Cayo-named step also runs thirteen other browser scripts, including VI and classic maps. Existing production invocations remain unchanged in this pilot.

## Independent Cayo job
A browser matrix executes the two original scripts once per browser against the built and audited public tree. It preserves the assertions, failure semantics, screenshots, versions and browser coverage, allowing each browser job to be retried separately. Triggered on pilot files only or manual dispatch; not automatically on unrelated changes. This pilot is not yet a required production gate.

## Observed dependencies (not exhaustive)
- Entry: heist-cayo-perico.html; heist-pages.js; atlas-conditions.js; atlas220-cayo-recovery.js; atlas302-cayo-legacy-rescue.js/css.
- Direct shared resources in HTML: jura-legacy-bridge.css, heist-theme.css, jura-design-lock.css, atlas89-shell, atlas92-style/ui/heists, atlas93-global/heist-intel, atlas97-connect, atlas119-workspace-brand, atlas120-heist-worlds, atlas160-premium-headers, atlas162-subject-heroes, atlas153-advisory, atlas132-nav, atlas131-social-icons, atlas216-cayo-nav, art/elario-crest.svg, art/jura159-heist-cayo-perico.webp.
- Dynamic loader: atlas164-heist-workspace, atlas167-heist-focus, atlas168-heist-guides, atlas169-heist-views, atlas171-cayo-board, atlas180-cayo-flagship, atlas181-cayo-hotspots, atlas185-cayo-polish, atlas186-cayo-route, atlas188-cayo-flow, atlas298-heist-map-kit, atlas299-heist-backup (JS and CSS where loaded).
- Rotation fixture and production branch feed contract; original and fallback map art; shared navigation, local saves, gesture behavior and generated public payload; build-cloudflare.cjs and audit_published.py; pinned Playwright and browser environment. These can affect behavior indirectly.

## Next gate
Verify standalone exact-head results. Build comprehensive transitive dependency fingerprints including dynamically loaded resources, build inputs and fixture data. Then propose moving duplicate Cayo invocations to independent required jobs in the production workflow, preserving packaging dependencies and evidence. No production checks removed yet. Unknown dependency changes remain full-validation scope. Do not treat this inventory as proof of equivalence or permission to skip required checks.
