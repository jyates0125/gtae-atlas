# Atlas 19.8 — Chromium/Edge event-driven rendering QA

The preceding staged release `858fe6c` passed **186/186 general smoke checks** in Chromium and Edge, and captured **172/172 page screenshots** in each. The specialized browser battery uncovered three *test synchronization* issues:
- `test_atlas190_map_browser.py` checked GTA IV Canvas status before the next requestAnimationFrame; now waits for the updated hidden/visible label.
- `test_atlas171_browser.py` (Edge) checked all 50+ Cayo fallback markers before its asynchronous SVG icon layer completed; now waits for at least 50 icons **and** all 19 chest references before asserting them.
- `test_atlas191_first_visit_browser.py` (Edge) sometimes observed loaded but disabled-only source categories before enabled first-visit VI pin counts arrived; now waits until at least one *enabled, populated* category exists, then still asserts the full exact set and saved all-off/on behavior.

These changes do **not** skip failing interactions, bypass data assertions, or suppress renderer errors. Any missing pins, wrong save scope, empty world or broken map still fails within a bounded timeout. All three browser families and phone/Desktop are to be retested. No live merge until owner approval.
