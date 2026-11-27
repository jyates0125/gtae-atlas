# Focused production validation — proposed engineering improvement

Owner direction, November 26, 2026: avoid repeating unrelated successful tests for small corrections. Keep mandatory security, privacy, source rights, save integrity, visual acceptance, exact deployment identity and rollback protections.

## Observed baseline
- Seasonal release #271: seven production jobs passed at e4b0c8793bfcb15d6097af22cebc5fa0d9a0a2dc.
- Owner iPhone review revealed image occlusion despite successful decode. #273 added a foreground stacking and hit-test regression, with four focused workflows passing.
- Correction #274 repeated the broad production workflow. Edge timed out in unchanged VI hub geometry, after Cayo passed; retry passed. This is evidence of avoidable coupling, not proof every timeout is harmless.
- Current main 4de7bcfedb411a88f609402f6065d098e4d059fe independently verified HTTP 200 and exact revision at 2026-11-27T04:22:02Z, run 45939505749; owner reported approval in chat. Development reconciled through #275.

## Proposed classification
1. Documentation-only: validate links, policy consistency, build and security checks.
2. Isolated seasonal UI: exact artwork bytes, layer visibility, mobile and desktop affected journeys, dates, fallback, guest entry, packaging and security.
3. Scoped functional change: execute the owning feature suite plus its transitive dependencies and representative integration journeys.
4. Shared runtime, security, storage, build system, unknown dependency, mixed scope, or absent trusted evidence: full release validation.

All classes keep required production packaging, applicable security and rights checks, affected native-device review, rollback and independent live revision verification. No current gate changes under this proposal.

## Evidence reuse design
- Classify actual base-to-head paths, including additions, deletions, renames and generated outputs; do not trust PR labels or author assertions.
- Maintain reviewed dependency manifests for each suite, including transitive local assets/scripts, fixtures, build inputs, workflow and toolchain versions. Unknown dependencies fail closed to full validation.
- Match trusted successful CI evidence from the protected baseline against exact suite input fingerprints. Record original run, tested SHA, artifact digest, environment, candidate SHA and reason for equivalence. Never label reused evidence as fresh execution.
- Keep current full workflow as fallback. Split large browser jobs into independently retryable suites before introducing reuse. Keep a single mandatory aggregate release gate that fails on missing, failed, stale, or unverifiable evidence. Packaging must depend on all applicable gates.
- Test selector and evidence validation against changed shared scripts, assets, build tooling, malicious or malformed manifests, stale results, missing artifacts, mixed changes and rollback scenarios.
- Compare shadow-mode decisions against full existing runs, measure elapsed time and missed dependencies, review with owner before enabling any reduced execution in protected production.
- No changes to protection, permissions, scheduling or authentication in this proposal. No automatic acceptance of failed checks.

## Next implementation
Inventory current production workflow steps and dependency owners; write conservative selector and unit tests in shadow mode; compare with full runs. Review before changing required workflow execution. Record measured rather than predicted savings.

## Owner clarification: completed feature suites
Retain detailed Cayo mission-board, route, interaction and screenshot tests as regression coverage, not mandatory repetitions on every unrelated release. Apply the same rule to other completed features. Execute the full feature suite on direct changes, relevant shared dependencies, periodic major-release validation or missing trustworthy evidence. Keep a minimal applicable integration smoke check and core security/build/deployment gates. Separate Cayo from unrelated VI and homepage jobs. Do not remove unique coverage or claim tests ran when evidence was reused. Current shadow classifier makes recommendations only; Cayo dependency mapping and trusted evidence validation are not yet implemented.
