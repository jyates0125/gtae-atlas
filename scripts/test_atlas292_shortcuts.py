"""Focused source contract for the Atlas 29.2 shortcut finder.
Run: python scripts/test_atlas292_shortcuts.py
"""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
html = (root / "atlas-dashboard.html").read_text(encoding="utf-8")
js = (root / "atlas292-shortcut-filter.js").read_text(encoding="utf-8")
css = (root / "atlas292-shortcut-filter.css").read_text(encoding="utf-8")
assert '<details class="j223-shortcuts-menu">' in html
assert 'id="juraShortcutFilter"' in html
assert 'id="juraShortcutLinks"' in html
assert 'id="juraShortcutCount"' in html
assert 'atlas292-shortcut-filter.js?v=292' in html
assert 'atlas292-shortcut-filter.css?v=292' in html
assert 'aria-live="polite"' in html
assert 'link.hidden = !matches' in js
assert "event.key === 'Escape'" in js
assert "event.key === 'Enter'" in js
assert "localStorage" not in js and "sessionStorage" not in js
assert '#juraShortcutLinks a[hidden]{display:none!important}' in css
print("Atlas 29.2 shortcut source contracts passed")
