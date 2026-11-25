# Atlas 30.0 — focus CI on the latest affected files

**Status:** draft staging optimization, **not public deployment or release approval**. Based on combined draft PR #98 at `9f45d521b2b6c8cecd2a43df53b249fc4bf24345`. Updates twelve existing scoped workflows, not the production release gate.

## Why this is needed
GitHub's `pull_request.paths` is evaluated against the cumulative base-versus-head PR diff. After a long staging PR changes Garage, characters, maps and heists, each unrelated follow-up commit can restart *all* focused browser workflows because those paths remain in the cumulative PR. That costs time, repeatedly downloads browsers and cancels useful evidence.

## Implementation
- `scripts/atlas300-ci-delta.py` reads the **actual workflow's existing configured paths** and compares the latest checked-out head commit to its first parent with `git diff --no-renames --diff-filter=ACDMRT HEAD^ HEAD`. Deletions and renamed-away files count.
- On `pull_request.synchronize`, only the workflow's related new changes activate its expensive tests. Otherwise its lightweight checkout, setup and scope print the decision and skip browser install/build/screenshots.
- On first opening/reopening a PR, `workflow_dispatch` and similar events, **run all targeted checks**. If Git parent history or the diff is unavailable, **fail open and test**, never pretend files were unrelated.
- Twelve GitHub workflows, covering fourteen individual jobs, add these scope decisions; conditional guard every expensive step, including `always()` artifact upload.
- Add shared dependency paths so the proper checks still run: Forge collection core and its Garage contracts; Garage/Forge cross-tab persistence; navigation JS; source-qualified heist map and backup scripts; Atlas linked map dependencies.
- Reduce the overly broad `scripts/test_atlas29*.py` match in the integrated Leonida/Garage workflow to the actual 290–294 tests. Documentation-only completion board updates no longer rerun the cross-product browser/build gate.
- Existing path-scoped Cayo optimization remains intact. The full `team-jura-release.yml` manual Chromium, Microsoft Edge, Cayo, ZIP and owner signoff gate is **not changed** or disabled.

## Verification
`scripts/test_atlas300_ci_delta.py` uses the same actual workflow YAML definitions and Python glob matching; the scoped CI installs PyYAML to parse the workflow syntax and confirm all fourteen jobs have a valid gate and all expensive steps are conditioned. Tests include open/manual/reopen, synchronize, deleted/renamed dependency, missing parent (fail-open), relevant and unrelated changes, and shared source dependencies.

**Limitations:** A latest-commit gate cannot by itself certify cumulative PR history if earlier jobs were canceled. We must retain successful focused CI on each upstream feature before stacking, the integrated exact-head acceptance checks for interdependent features, and one complete owner-approved final release validation. Skipping unrelated checks does **not** mean the product or site has passed them.

**Release policy:** After source CI passes, integrate this into *draft PR #98 only*. Owner approval remains required before a `development` or protected `main` merge.


## Atlas 45.5 — complete synchronize-event delta (November 24, 2026)
The previous HEAD^ comparison could incorrectly skip affected tests when a push contained multiple commits and only the final commit was unrelated. Read the actual GitHub event before/after SHAs, require the checked-out HEAD to equal after and before to be a verifiable ancestor; diff the complete range with NUL-delimited paths. If event evidence is absent, malformed, shallow or non-ancestor, run the triggered checks instead. Existing depth-2 checkouts may therefore run more checks on multi-commit pushes; do not trade correctness for fewer runs. Existing initial/manual/full release gates are unchanged. Real temporary Git repository regressions exercise the earlier relevant commit, irrelevant single-commit update, missing or mismatched SHAs and deletion. Exact-head CI pending; no tests removed or production changes. The 45.4 and AI charter PRs have already passed 20/20 and 2/2 respectively and merged into development at c4904f9. This work implements the owner's continuous improvement/test reliability requirement without claiming every duplicate workflow has been consolidated.
