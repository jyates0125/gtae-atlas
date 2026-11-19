#!/usr/bin/env python3
"""Atlas 13.9: closing navigation on an outside tap must not steal focus."""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
js=(R/'atlas132-nav.js').read_text(encoding='utf-8')
assert 'const close=(restoreFocus=true)=>' in js
assert 'if(restoreFocus)button.focus()' in js
assert 'if(!drawer.hidden&&!wrap.contains(e.target))close(false)' in js
assert "if(e.key==='Escape'){e.preventDefault();close();return;}" in js
assert "drawer.querySelector('.j132-close').addEventListener('click',close)" in js
print('PASS Atlas 13.9 outside-tap focus behavior')
