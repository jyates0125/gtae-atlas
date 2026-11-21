# Team Jura Atlas — Branch Cleanup Inventory

**Inventory date:** 2026-11-21. **Canonical repo:** `jyates0125/team-jura-atlas-preview`. **Observed GitHub default:** `Main`. **Branch count:** 96. **Open PRs:** 10.

This is a **read-only inventory**, not a command to delete any branch. A branch that appears merged by Git history can still contain work that was only partially copied elsewhere, and backups must be retained. Refer to [the binding charter](TEAM-JURA-STANDING-CHARTER.md) and [canonical topology](TEAM-JURA-CANONICAL-REPO-AND-DEPLOYMENT.md).

## Immediate administrative repair

1. **Completed and verified on November 21:** GitHub's default is restored to already existing lowercase `main`, not uppercase `Main`. **Do not rename a branch** while reviewing cleanup.
2. Verify **both** lowercase `main` and `development` show protected after the change. Don't disable, delete or rename the original rulesets.
3. In Cloudflare **gtae-online**, ensure production Git branch remains lowercase `development`, with successful Atlas 22.0 deployment; inspect page on iPhone.
4. **Do not delete uppercase `Main` yet.** After default/PR/CI/Cloudflare checks and owner approval, it may be removable because it pointed to the restored `development` commit at inventory time.

## Snapshot classifications

| Classification | Count | Meaning |
| --- | ---: | --- |
| Keep — permanent | 2 | Permanent operating branch |
| Keep — open PR | 10 | Active PR source; do not delete |
| Keep — safety backup | 3 | Rollback checkpoint; do not delete |
| Hold — correct default first | 1 | Unintended uppercase duplicate; preserve pending repair |
| Review — possible cleanup | 80 | No verified merge-status yet; audit individually before deleting |

## Keep — permanent (2)

| Branch name | Head SHA | Open PR | Action |
| --- | --- | --- | --- |
| `development` | `aa9940482a91` | — | Keep |
| `main` | `fcfda6a6ee3a` | — | Keep |

## Keep — open PR (10)

| Branch name | Head SHA | Open PR | Action |
| --- | --- | --- | --- |
| `dependabot/github_actions/actions/checkout-7` | `eaff91e902bd` | #2 | Keep |
| `dependabot/github_actions/actions/setup-node-7` | `ec07825df89f` | #1 | Keep |
| `dependabot/github_actions/actions/setup-python-7` | `e96785dfb1b4` | #3 | Keep |
| `dependabot/github_actions/actions/upload-artifact-7` | `b17658456304` | #4 | Keep |
| `feature/atlas121-game-specific-flatmaps-20261118` | `50e1eb387b2a` | #46 | Keep |
| `feature/atlas122-local-classic-maps-wildlife-20261118` | `fd05b42d0dc1` | #48 | Keep |
| `feature/atlas131-review-world-share` | `43d2dd62c4bb` | #54 | Keep |
| `feature/atlas141-crew-headquarters` | `4bf3dbed427f` | #63 | Keep |
| `feature/atlas210-iv-pinch-gesture` | `85b5ca95df17` | #73 | Keep |
| `feature/atlas212-directory-resume` | `4b0302a9e16b` | #74 | Keep |

## Keep — safety backup (3)

| Branch name | Head SHA | Open PR | Action |
| --- | --- | --- | --- |
| `safety/development-pre-atlas220-20261121` | `814a9876e95f` | — | Preserve backup |
| `safety/main-before-atlas110-20261118` | `7e00bea27615` | — | Preserve backup |
| `safety/main-pre-atlas220-20261121` | `dd8c69d41ba1` | — | Preserve backup |

## Hold — correct default first (1)

| Branch name | Head SHA | Open PR | Action |
| --- | --- | --- | --- |
| `Main` | `aa9940482a91` | — | Fix default first |

## Review — possible cleanup (80)

| Branch name | Head SHA | Open PR | Action |
| --- | --- | --- | --- |
| `aura-connection-test-20261117` | `b4461f1c67a9` | — | Review commit/diff + PR history |
| `automation/gtadb-vi-snapshot` | `083e9de9fc06` | — | Review commit/diff + PR history |
| `docs/atlas221-canonical-repo-charter` | `5bd33ec1349a` | — | Review commit/diff + PR history |
| `docs/atlas-branch-and-design-authority-20261118` | `0ec3fb0c9ae6` | — | Review commit/diff + PR history |
| `docs/elario-studio-standard-v2` | `760220269693` | — | Review commit/diff + PR history |
| `feature/atlas99-uv-nav-garage-20261117` | `8331c4815879` | — | Review commit/diff + PR history |
| `feature/atlas100-gtadb-3d-liberty-20261117` | `89be350c2229` | — | Review commit/diff + PR history |
| `feature/atlas101-dedup-3d-regressions-20261117` | `b3283797692d` | — | Review commit/diff + PR history |
| `feature/atlas110-main-release-guard-20261118` | `bea7a1ce6d38` | — | Review commit/diff + PR history |
| `feature/atlas112-unified-site-design-20261118` | `a03c39134306` | — | Review commit/diff + PR history |
| `feature/atlas113-integrated-nav-safe-20261118` | `e0423bd7351f` | — | Review commit/diff + PR history |
| `feature/atlas113-tools-and-collection-design-20261118` | `8da7ece22a63` | — | Review commit/diff + PR history |
| `feature/atlas115-research-rebased-20261118` | `abdf98fd39b6` | — | Review commit/diff + PR history |
| `feature/atlas115-research-utility-visuals-20261118` | `f584a3287dc8` | — | Review commit/diff + PR history |
| `feature/atlas116-showcase-brand-20261118` | `941839f92d63` | — | Review commit/diff + PR history |
| `feature/atlas117-primary-worlds-brand-20261118` | `d279af72ab9f` | — | Review commit/diff + PR history |
| `feature/atlas118-visual-review-evidence-20261118` | `5803b7f72eea` | — | Review commit/diff + PR history |
| `feature/atlas119-heist-iv-research-brand-20261118` | `bc188a610700` | — | Review commit/diff + PR history |
| `feature/atlas120-heist-world-art-20261118` | `b123a79b3e98` | — | Review commit/diff + PR history |
| `feature/atlas121-authentic-world-maps-20261118` | `151e3710a67c` | — | Review commit/diff + PR history |
| `feature/atlas127-catalog-brand` | `1ea88f9a7d51` | — | Review commit/diff + PR history |
| `feature/atlas127-research-identity` | `005b9d5cf78a` | — | Review commit/diff + PR history |
| `feature/atlas128-map-chrome` | `8bc669025108` | — | Review commit/diff + PR history |
| `feature/atlas129-facebook-social-preview` | `d94b516277dc` | — | Review commit/diff + PR history |
| `feature/atlas130-premium-public-launch` | `677917ed9cc2` | — | Review commit/diff + PR history |
| `feature/atlas131-one-tap-social-icons` | `e18a257aacfa` | — | Review commit/diff + PR history |
| `feature/atlas134-auto-events-status` | `882167cc4035` | — | Review commit/diff + PR history |
| `feature/atlas135-unified-event-feed` | `e496474e4716` | — | Review commit/diff + PR history |
| `feature/atlas136-status-integrity` | `0969603173ec` | — | Review commit/diff + PR history |
| `feature/atlas137-mobile-map-navigation` | `37828cd7aab7` | — | Review commit/diff + PR history |
| `feature/atlas138-release-header-audit` | `29ea27ba8850` | — | Review commit/diff + PR history |
| `feature/atlas138-supabase-secure-foundation` | `a7ea0162ba62` | — | Review commit/diff + PR history |
| `feature/atlas139-postrelease-hardening` | `da23b7d696a0` | — | Review commit/diff + PR history |
| `feature/atlas140-cloud-save-repository` | `dd2c12cc86fa` | — | Review commit/diff + PR history |
| `feature/atlas140-world-art-and-leonida-launch` | `664abf21a34f` | — | Review commit/diff + PR history |
| `feature/atlas141-leonida-research-entry` | `d840bfdcb6a6` | — | Review commit/diff + PR history |
| `feature/atlas142-official-leonida-sources` | `5491e9aae6f7` | — | Review commit/diff + PR history |
| `feature/atlas144-consent-first-cloud-transfers` | `41d0bfa919b5` | — | Review commit/diff + PR history |
| `feature/atlas145-leonida-poster-recovery` | `a86492c47f3c` | — | Review commit/diff + PR history |
| `feature/atlas163-postrelease-parity` | `9022c9e1e159` | — | Review commit/diff + PR history |
| `feature/atlas209-traffic-discovery` | `604b6a8d3b49` | — | Review commit/diff + PR history |
| `feature/atlas215-rc-stage-20261121` | `98e4d8a33f70` | — | Review commit/diff + PR history |
| `feature/atlas217-leonida-connected-world` | `169fc3d44e3d` | — | Review commit/diff + PR history |
| `feature/atlas218-vi-source-refresh` | `7fa3c083f798` | — | Review commit/diff + PR history |
| `feature/atlas220-vi-mobile-pin-polish` | `17efe1d98e0e` | — | Review commit/diff + PR history |
| `feature/atlas-cheats-news-20261117` | `b80553674d92` | — | Review commit/diff + PR history |
| `feature/atlas-cheats-news-integrated-20261117` | `0e9a6fdd3ea3` | — | Review commit/diff + PR history |
| `feature/atlas-classic-cinematic-seven-covers-20261117` | `77a88b174bb7` | — | Review commit/diff + PR history |
| `feature/atlas-classic-covers-final-20261117` | `b41aeba1a165` | — | Review commit/diff + PR history |
| `feature/atlas-classic-flat-map-gateway-20261117` | `817ac45d2d5d` | — | Review commit/diff + PR history |
| `feature/atlas-classic-flat-map-integrated-20261117` | `778341629e64` | — | Review commit/diff + PR history |
| `feature/atlas-classic-highres-local-maps-20261118` | `ba8248f414f9` | — | Review commit/diff + PR history |
| `feature/atlas-credits-provenance-hub-20261118` | `dc1f7023693f` | — | Review commit/diff + PR history |
| `feature/atlas-original-configurator-20261117` | `36b814b0dbad` | — | Review commit/diff + PR history |
| `feature/atlas-sa-150-sourced-pins-20261117` | `4f7af5b3f29a` | — | Review commit/diff + PR history |
| `feature/atlas-sa-sourced-150-pins-20261117` | `804b20116a23` | — | Review commit/diff + PR history |
| `feature/atlas-sa-sourced-pins-20261117` | `299d5d7808ae` | — | Review commit/diff + PR history |
| `feature/atlas-universe-database-20261117` | `ef008f4ce9cf` | — | Review commit/diff + PR history |
| `feature/atlas-vehicle-intelligence-heist-worlds-20261117` | `ef05128211a7` | — | Review commit/diff + PR history |
| `feature/atlas-world-first-ux-20261117` | `141946758afa` | — | Review commit/diff + PR history |
| `feature/garage-showroom-modes-20261117` | `b4461f1c67a9` | — | Review commit/diff + PR history |
| `feature/research-licensed-data-20261117` | `db1dc6bce762` | — | Review commit/diff + PR history |
| `fix/atlas111-mobile-map-startup-20261118` | `36fdc545be79` | — | Review commit/diff + PR history |
| `fix/atlas114-nav-failsoft-on-mobile-20261118` | `016285d62dea` | — | Review commit/diff + PR history |
| `fix/research-authoritative-snapshot-20261117` | `d63338810ee6` | — | Review commit/diff + PR history |
| `fix/scaly-loki-pins-off-default-20261117` | `5739d614ae23` | — | Review commit/diff + PR history |
| `fix/vi-development-manifest-20261117` | `dcbb5504bb49` | — | Review commit/diff + PR history |
| `fix/vi-refresh-protected-branch-20261117` | `b4b279cabb08` | — | Review commit/diff + PR history |
| `fix/yanis18-research-map-grid-20261117` | `8b35d2bf1bc2` | — | Review commit/diff + PR history |
| `jyates0125-patch-1` | `bbeda2de5af8` | — | Review commit/diff + PR history |
| `jyates0125-patch-2` | `6bb5678f0a4b` | — | Review commit/diff + PR history |
| `jyates0125-patch-3` | `42247de143e7` | — | Review commit/diff + PR history |
| `jyates0125-patch-4` | `dabae158b6a8` | — | Review commit/diff + PR history |
| `release/atlas110-main-reviewed-20261118` | `f9cda8c674fd` | — | Review commit/diff + PR history |
| `release/atlas219-cinematic-consolidation-20261121` | `ed5062d1926f` | — | Review commit/diff + PR history |
| `release/atlas219-publish-candidate-20261121` | `18da7abf2013` | — | Review commit/diff + PR history |
| `release/atlas219-qa-gate-20261121` | `8a412cbc9b42` | — | Review commit/diff + PR history |
| `release/atlas220-main-integrated-20261121` | `6fe6c4d289fd` | — | Review commit/diff + PR history |
| `release/atlas220-main-sync-20261121` | `f57cb05715b4` | — | Review commit/diff + PR history |
| `restore/working-maps-before-pr15` | `702b82d9b42d` | — | Review commit/diff + PR history |

## Approval and deletion gate

Before retiring any candidate: fetch its current SHA and unmerged diff; confirm it has no open PR or running workflow, no important unique asset, no dependent deployment, and no special rollback value. Record its final SHA and backup ref; obtain explicit owner confirmation, then delete only the approved list. Do not force-update or squash history to hide it. **No remote refs were deleted by this audit.**
