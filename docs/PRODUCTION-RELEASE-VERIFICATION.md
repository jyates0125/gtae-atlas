# Production release verification

## Atlas 47.2.8 — November 26, 2026 (Central)
- Owner reviewed the preview and responded “Yes looks good”; prior authorization to promote after required validation remains applicable. This is owner design acceptance, not an independently executed native-device test.
- Release PR #262 exact head `b1aaf5f63ed50ba3ffd9053e414ce3aebf8c70dc`: production workflow 45921930797 passed all five jobs; navigation workflow 45921930806 passed. Validated ZIP artifact 15165311304.
- Protected main merged as `fa3edaa21939fa30cc7d427ef25eccc171fac8a6`; compare against exact tested head reports no changed tracked files. Rollback baseline `cd10e4716e721beea51edbb96a6288a303262f6e`.
- Independent Cloudflare deployed identity remains pending: direct chat web access was unavailable, not evidence of an outage. Existing read-only verifier checks anonymous HTML and exact main SHA; this evidence-path trigger allows the same probe to execute during release reconciliation without touching application code or altering test assertions.
- General GTAE builder confirmed paused, rotation/Leonida/private Forge schedules unchanged. Draft #261 remains separate until reconciliation and its applicable review. Do not activate authentication or claim unverified deployed state.
- Next: inspect exact reconciliation PR CI, record actual live probe response and synchronize development via reviewed PR. Resume general builder only when authorized.


## Elario rights and founder protection v1.0 — November 26, 2026 Central

PR #266 exact candidate `b538ea120a981fb88c4baeb14bd2479c114ca0df` passed all five production jobs in run 45930098959; validated ZIP artifact 15168423314. Merged protected main `0f9e1bd092f4373c91bdd264de7379e017802ded`; comparison confirms no tracked-file changes from tested candidate. Rollback baseline `fa3edaa21939fa30cc7d427ef25eccc171fac8a6`. Independent live verification run 45931250979, job 140284144412: attempt 3 returned anonymous HTML and deployment identity HTTP 200, exact revision 0f9e1bd092f4373c91bdd264de7379e017802ded, verified true at 2026-11-27T02:57:10Z. Reconciled into development via #269. No seasonal asset or navigation candidate included. Preserve guest entry and private technology.


## Thanksgiving welcome and archive — November 26, 2026 Central

PR #271 candidate `e4b0c8793bfcb15d6097af22cebc5fa0d9a0a2dc` passed all seven jobs across production run 45932501668 and seasonal run 45932501671. Validated package artifact 15169332774. Merged protected main `6d2b9e6ef13565b90a1fa1d0ccb034f736474529` with no tracked-file difference from tested candidate. Owner approved artwork and uploaded exact verified WebP; native-device visual review remains separate from CI. Welcome expires December 1 at 00:00 Central; archive retained. Rollback `0f9e1bd092f4373c91bdd264de7379e017802ded`. Request independent exact live SHA probe before claiming deployment verified. Navigation draft #267 excluded.


## Seasonal artwork visibility correction — November 26, 2026 Central

Owner iPhone screenshot revealed artwork hidden behind the welcome background despite successful decoding. PR #273 added foreground stacking, stylesheet cache revision, and hit-testing regression; all four focused workflows passed. Release #274 exact head `8221a9ff3ffdd7a05e2b19c056aa296674b77dd1` passed both production and seasonal workflows 45934169458 and 45934169474; validated package 15170881568. Initial broad Edge run timed out in unchanged VI mobile hub geometry; retry passed. Protected main `4de7bcfedb411a88f609402f6065d098e4d059fe` matches tested files. Rollback `6d2b9e6ef13565b90a1fa1d0ccb034f736474529`. Previous Thanksgiving release was independently live verified in run 45933697877. Current corrected deployment and native iPhone appearance require confirmation. Preserve gold crowned E shield per owner approval. Owner requests future focused release validation and documented equivalence for unaffected tests; no current protected gate bypass.
