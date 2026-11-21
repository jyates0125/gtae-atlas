#!/usr/bin/env python3
"""Visitor policies: no false account/delete claims; sources remain preserved."""
from pathlib import Path
from html.parser import HTMLParser
r=Path(__file__).resolve().parents[1]
h=(r/'atlas-policies.html').read_text(encoding='utf8')
a=(r/'atlas-account.html').read_text(encoding='utf8')
c=(r/'atlas-credits.html').read_text(encoding='utf8')
home=(r/'index.html').read_text(encoding='utf8')
class Checker(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=set()
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id' in d:self.ids.add(d['id'])
  if tag=='a' and d.get('href','').startswith('./'):self.links.append(d['href'])
p=Checker();p.feed(h)
for ident in ('main','privacy','guest','deletion','terms','fan','rights','storage','age'):
 assert ident in p.ids,ident
for phrase in ('We do not sell','seven-day cancellation window','not a legal rule',
 'sign-in and automatic cloud syncing are not available','Clearing site data',
 'not sponsored, endorsed','not automatically','not yet exist on the public site'):
 assert phrase.lower() in h.lower(),phrase
for link in p.links:assert (r/link[2:].split('?',1)[0]).is_file(),link
assert 'Policies &amp; Disclaimers</a>' in c
assert 'atlas-policies.html' in a and 'atlas-policies.html' in home
assert 'Sign in · Coming after secure setup' in a and 'type="button" disabled' in a
print('PASS Atlas 20.7: visitor policy hub, deletion truth, guest-data warning and existing credits')
