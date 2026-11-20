#!/usr/bin/env python3
from pathlib import Path
p=Path(__file__).resolve().parents[1]
html=(p/'atlas155-art-review.html').read_text(encoding='utf-8')
style=(p/'atlas155-art-review.css').read_text(encoding='utf-8')
for item in ['story','online','vi','cayo','characters','heists','map','studio']:
 assert html.count(f'./art/jura155-{item}.webp')==1,item
 assert (p/'art'/f'jura155-{item}.webp').is_file(),item
assert 'name="robots" content="noindex,follow"' in html
assert 'No account needed' in html and 'unfinished' in html
for page in ['atlas.html','atlas-online.html','atlas-vi.html','heists.html','elario.html','atlas-characters.html']:
 assert f'./{page}' in html,page
assert '@media(max-width:690px)' in style
print('Atlas 15.5 staging art-review index and eight original images PASS')
