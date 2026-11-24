# Atlas 30.8 — San Andreas collector-to-map return

**Draft charter staging only.** San Andreas already provides individual sourced collector cards and a Locate on map action. This milestone adds a corresponding 44px Back to map control within the existing item toolbar, with keyboard Escape when focused inside item cards. The map returns to the original camera/zoom state and restores keyboard focus to the last selected pin when available, otherwise to the map viewport.

This script does not alter personal progress, category, map transforms, imported source coordinates, route data, image rights or browser history. Existing note-edit blur save behavior remains owned by the original game UI.

**Focused proof:** scripts/test_atlas308_sa_return.py and built Chromium scripts/test_atlas308_sa_return_browser.py at 375×667, 390×844, 844×390, and 1440×900. Includes pin→item→map, Escape, storage, camera, focus, source scope, mobile overflow. Path-scoped workflow atlas308-sa-return.yml. Full release browser/ZIP, actual Safari, source/art quality and specific owner approval remain pending.