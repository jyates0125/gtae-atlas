# Atlas 31.1 — Named Forge design rename/delete and stale-tab protection

**Draft staging only. No public Cloudflare release.**

## Functional change
Forge already supports eight distinct saved versions for an individual vehicle concept. Owners can now select one named build and rename it without changing its paint, private notes, sculpted scene design or original body style. The same panel allows a confirmation-gated deletion of only that selected named build. The primary preset, other named builds, another model's versions, My Garage ownership/placements, and all independent local world keys remain untouched.

The same controls apply to GTA V/Online and GTA VI only within their existing *different* local storage namespaces. This is Elario concept work, not actual in-game property or Rockstar modifications. Buttons are disabled until a valid version is selected; all controls have 44px touch targets and accessible focus.

The mutation handler rereads the latest stored JSON at click time, requires a valid schema, verifies the current model and selected entry, refuses duplicates, and rejects a saved entry modified by a newer tab since the current page's snapshot. An invalid/corrupt record is not overwritten. A confirmed delete cannot accidentally remove the primary concept. A separate fix makes the latest persisted saved variants authoritative when later Forge actions merge across tabs; deleted versions are no longer automatically resurrected by stale in-memory copies. Other primary, import and export actions also refuse to overwrite unreadable Forge storage.

## Focused acceptance
- scripts/test_atlas311_forge_management.py checks exact source contracts, cache revisions and JavaScript syntax.
- scripts/test_atlas311_forge_management_browser.py uses the Cloudflare-built site at 390px, 844px landscape and 1440px, in each V and VI world, verifying rename preservation, stale-tab refusal, deletion cancel/confirm, corrupt data preservation, exact unrelated keys and no horizontal overflow.
- Existing node Garage variant reader and Forge Collections tests run as related regressions.
- Workflow .github/workflows/atlas311-forge-management.yml is scoped to this feature and deliberately does not re-run unrelated Cayo tests or full final Edge/ZIP on every draft commit.

Still outstanding: native iPhone Safari, owner design review, licensed model-specific geometry, premium vehicle art and the separate final release Chromium+Edge+ZIP with explicit production approval.
