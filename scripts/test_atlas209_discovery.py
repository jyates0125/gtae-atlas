#!/usr/bin/env python3
"""Atlas 20.9: production search discovery and shares use one correct public URL.

All changes are non-user-facing SEO metadata or optional existing share actions.
No analytics scripts, sign-in, donations, maps, artwork, saves, or auth enabled.
"""
from pathlib import Path
from html.parser import HTMLParser
import re
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
SITE='https://gtae-online.pages.dev'
OLD='https://team-jura-atlas-preview.pages.dev'
robots=(ROOT/'robots.txt').read_text(encoding='utf-8')
sitemap=(ROOT/'sitemap.xml').read_text(encoding='utf-8')
share=(ROOT/'atlas-share.html').read_text(encoding='utf-8')
launch=(ROOT/'atlas130-share.js').read_text(encoding='utf-8')
icons=(ROOT/'atlas131-social-icons.js').read_text(encoding='utf-8')
home=(ROOT/'index.html').read_text(encoding='utf-8')
assert 'Sitemap: '+SITE+'/sitemap.xml' in robots
assert 'User-agent: *' in robots and 'Allow: /' in robots
assert '<link rel="canonical" href="'+SITE+'/">' in home
root=ET.fromstring(sitemap)
urls=[node.text for node in root.iter() if node.tag.endswith('}loc')]
assert len(urls)==len(set(urls)) and len(urls)>=40, len(urls)
assert urls[0]==SITE+'/'
for url in urls:
 assert url.startswith(SITE+'/'), url
 path=url.removeprefix(SITE+'/')
 if path:assert (ROOT/path).is_file(), path
for path in ('maps.html','atlas-iv.html','heist-cayo-perico.html','heist-diamond-casino.html',
             'atlas90-vehicles5.html','atlas-characters.html','one-last-ride.html'):
 assert SITE+'/'+path in urls, path
for value in (robots,sitemap,share,launch,icons):
 assert OLD not in value,'Old preview links must not be promoted'
assert '<link rel="canonical" href="'+SITE+'/atlas-share.html">' in share
assert '<meta property="og:url" content="'+SITE+'/atlas-share.html">' in share
assert '<meta property="og:image" content="'+SITE+'/art/atlas98-approved-hero.webp">' in share
assert "const SITE='"+SITE+"/';" in launch
assert "const URL='"+SITE+"/';" in icons
assert "here.origin==='"+SITE+"'" in icons
assert 'navigator.share' in launch and 'navigator.share' in icons
assert 'navigator.clipboard.writeText' in icons
# Preserve existing, user-initiated share mechanism and Elario art.
assert "kind==='open-social'" in launch and 'data-j131-social-host' in home
assert 'art/atlas98-approved-hero.webp' in home
# No unsolicited trackers or fake donation endpoint.
for value in (launch,icons):
 for forbidden in ('cloudflareinsights.com', 'googletagmanager.com', 'adsbygoogle', 'ko-fi.com/'):
  assert forbidden not in value, forbidden
# Before forwarding old public links, preserve previous-origin guest backup.
account=(ROOT/'atlas-account.html').read_text(encoding='utf-8')
policy=(ROOT/'atlas-policies.html').read_text(encoding='utf-8')
assert 'j209LegacyTitle' in account
assert 'https://team-jura-atlas-preview.pages.dev/atlas-account.html' in account
assert 'A redirect to gtae-online.pages.dev does not automatically move it.' in account
assert 'Cloudflare Web Analytics' in policy
assert 'The GTAE public site' in policy
assert 'Before launching optional analytics' not in policy
print('PASS Atlas 20.9: canonical live origin, 41 search destinations, optional backup and transparent analytics policy')
