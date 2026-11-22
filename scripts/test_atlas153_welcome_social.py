#!/usr/bin/env python3
"""Atlas 15.3: the public FB-poster gateway leads to the home, with footer-only optional sharing."""
from pathlib import Path
R = Path(__file__).resolve().parents[1]
def read(p):
    return (R / p).read_text(encoding='utf-8')
index = read('index.html')
dashboard = read('atlas-dashboard.html')
account = read('atlas-account.html')
js = read('atlas131-social-icons.js')
build = read('scripts/build-cloudflare.cjs')
css = read('atlas130-launch.css')

# Owner-approved public FB poster is first; the complete interactive dashboard is a distinct second step.
assert 'j130-public-hero j132-poster-welcome' in index
assert index.index('j132-poster-welcome') < index.index('id="featuredGrid"')
assert "url('./art/atlas98-approved-hero.webp')" in css
assert 'href="./atlas-dashboard.html">✦ Enter Atlas · Continue as Guest' in index
assert 'href="./atlas-account.html">◎ Sign-in &amp; Progress Options' in index
assert 'id="publicEntryNote"' in index and 'No download or account is required' in index
assert 'id="featuredGrid"' in dashboard
assert 'href="./atlas-dashboard.html">Enter Atlas as a guest' in account
assert 'Sign in · Coming after secure setup' in account and 'disabled aria-describedby=' in account

# The simpler premium poster must not be surrounded by the rejected 14.8 SVG collage panels.
assert 'j132-poster-art' not in index
assert 'j132-poster-panel' not in index

# Social buttons exist as progressive enhancement but begin below the original footer, not after hero.
assert index.count('data-j131-social-host') == 1
assert index.index('<div data-j131-social-host') > index.index('</footer>')
for name in ('atlas-share.html', 'one-last-ride.html'):
    html = read(name)
    assert html.index('<div data-j131-social-host') > html.index('</footer>'), name
assert index.count('data-j131-platform=') == 7
assert 'Get the social launch kit' not in index
assert 'j130-social-inline' not in index
assert 'download or account' in index.lower()
assert "document.body.append(footer)" in js and "footer.append(host)" in js
assert "const existing=node.querySelector('.j131-social')" in js
assert all(page.read_text().count('src="./atlas131-social-icons.js') == 1 for page in R.glob('*.html'))
assert 'atlas131-social-icons.css' in build
assert 'data-j130-action="share-page"' in index
assert index.index('data-j130-action="share-page"') > index.index('id="featuredGrid"')

# Sharing is optional: no forced kit download, account signup or misleading automatic posting.
for banned in ('Social Launch Kit', 'Download social kit', 'autoPost(', 'access_token'):
    assert banned not in index, banned
print('PASS Atlas 15.3: approved poster → guest dashboard / honest account; footer-only sharing; no launch-kit regression')
