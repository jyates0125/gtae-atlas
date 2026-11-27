# Full production command inventory — November 26 Central

Source: .github/workflows/team-jura-release.yml blob 45de387bd4b12c9baada8cd817df5f566cad81a6, development 05303dcaf7e0c5ad810ff26297128cddee7304ff. The accompanying CSV enumerates all 204 direct Python/Node command invocations (160 unique command strings), excluding package/browser installation. This is a source inventory, not a count of individual assertions or proof of dependency equivalence.

## Exact duplicate browser commands
- Cayo: test_atlas171_browser.py and test_atlas186_route_browser.py each run twice per engine (8 total, proposed 4; four avoidable invocations if standalone equivalence verified).
- VI: test_atlas220_vi_mobile_browser.py runs twice per engine (4 total, proposed 2; two avoidable invocations if equivalent).
- Preserve Chromium and Edge as distinct evidence. Other paired browser commands are not duplicates merely because the script name matches.

## Static, build and integrity candidates
- test_atlas220_vi_mobile.py, node --check atlas220-vi-mobile.js and node --check atlas220-cayo-recovery.js each run three times. Evaluate OS/phase equivalence before consolidation.
- node --check atlas.js runs in both focus jobs; evaluate consolidation into mandatory static checks.
- test_atlas3906_action_cut.py runs three times. It verifies public payload hashes only when public exists, so its pre-build and post-build checks are not automatically equivalent.
- build-cloudflare.cjs and audit_published.py each execute five times. These are not redundant by default: each independent runner requires the exact public tree. Consider one immutable built artifact with integrity and platform equivalence, while retaining final package audit.
- 44 command-string repeats include intentional cross-browser/platform and phase-specific checks; do not interpret all 44 as redundant.

## Proposed ownership of every major suite family
| Family | Examples from inventory | Policy |
|---|---|---|
| Mandatory baseline | audit_release, audit_published, HTTPS auth, Supabase, cloud transfer, source identity, visual release | Always preserve applicable security, privacy, rights, build/package and release integrity |
| Cayo / heists | 170/171/180/181/184/185/186/216, 164/167/168/169, browser 171/186 | independent feature suite; #277 pilot |
| Leonida / VI | 141/142/143/149/172/217/218/219/220/222/290/291, VI Day and poster | separate feature jobs; direct/shared dependencies; retain engine coverage |
| Classic maps | 106/150/157, 190/201/210, route/layer tests | group by map/route dependencies; preserve world isolation |
| Home / navigation | 98/100/103/130/132/139/156/159/191/212/223, browser_smoke | distinguish essential guest/nav smoke from exhaustive feature sweep |
| Garage / catalog / Armory | 127/147/192, gallery and weapons scripts | map dependent model, save and game identity coverage before reducing; current full workflow only, specialized development workflows not inventoried here |
| Rotations / conditions | 134/135/136, Cayo daily and data fixtures | preserve dedicated publisher's freshness and validity checks; no scheduling or publisher change |
| Art / media | 121/148/152/155/160/161/162/163/3904/3905/3906, Salvage Yard | split exact byte/rights checks from affected visual/browser checks; retain owner review |
| Offline / data | 96/97/98b/99/140/144/278, data-lab, source identity | retain integrity, storage migration and security; unknown shared changes require full |

## Safe migration order
1. Independently validate original Cayo tests; migrate duplicated invocations only after review.
2. Independently validate VI mobile duplicate; preserve all other distinct VI scripts.
3. Separate browser jobs by feature and keep mandatory package dependencies. Exact assertions preserved.
4. Evaluate static and build reuse with input/output fingerprints and trusted exact-head evidence. Unknown dependencies require full validation.
5. Use shadow classification and compare to full baseline; activate focused releases only after reviewed implementation. All existing production gates remain unchanged in this audit.

Scope limitation: inspected the full main-promotion workflow, not every one of the separate development, rotation, private Forge or Leonida specialist workflows. Dependency mapping remains incomplete. CSV is an invocation inventory, not a license to skip tests.
