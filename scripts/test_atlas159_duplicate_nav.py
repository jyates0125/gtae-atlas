#!/usr/bin/env python3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
css=(root/'atlas132-nav.css').read_text(encoding='utf-8')
legacy=(root/'atlas89-shell.js').read_text(encoding='utf-8')
new=(root/'atlas132-nav.js').read_text(encoding='utf-8')
assert 'body:has(#j132-nav-toggle) #j89-shell{display:none!important}' in css
assert '@media(max-width:820px)' in css
assert "dock.id='j89-shell'" in legacy
assert "wrap.className='j132-nav'" in new
assert 'document.body.append(wrap)' in new
print('Atlas 15.9 mobile duplicate legacy dock is hidden without deleting menu behavior PASS')
