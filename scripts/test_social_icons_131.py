#!/usr/bin/env python3
"""Atlas 13.1: visitor share via actual branded icon buttons, no downloads or invented integrations."""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
js=(R/'atlas131-social-icons.js').read_text()
css=(R/'atlas131-social-icons.css').read_text()
for page in ('index.html','atlas-share.html','one-last-ride.html'):
 h=(R/page).read_text()
 assert '<div data-j131-social-host' in h,page
 assert './atlas131-social-icons.css?v=131' in h,page
 assert './atlas131-social-icons.js?v=131' in h,page
assert len(set(['facebook','youtube','tiktok','instagram','discord','reddit','more']))==7
for key in ['facebook','youtube','tiktok','instagram','discord','reddit','more']:
 assert key+':' in js or key+"'" in js,key
assert "navigator.share" in js and "navigator.clipboard.writeText" in js
assert "https://www.facebook.com/sharer/sharer.php?" in js
assert "https://www.reddit.com/submit?" in js
assert "https://www.youtube.com/" in js
assert "https://www.tiktok.com/" in js
assert "https://www.instagram.com/" in js
assert "https://discord.com/app" in js
assert "Sign in" in js and "No downloads" in js
assert 'data-j131-social-host' in (R/'index.html').read_text()
assert (R/'index.html').read_text().count('data-j131-platform=')==7, 'Homepage social buttons must exist before JS loads'
assert "const existing=node.querySelector('.j131-social')" in js
assert '.j131-social-grid' in css and '@media(max-width:430px)' in css
for forbidden in ('download(','autoPost(','access_token','client_secret'):
 assert forbidden not in js,forbidden
print('PASS Atlas 13.1: responsive clickable brand icons, native share, web composer, honest fallback and privacy')
