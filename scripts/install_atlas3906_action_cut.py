#!/usr/bin/env python3
"""Install the pinned action candidate; preserve the original teaser master."""
import hashlib,json,sys,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
EXPECTED={
 'one-last-ride-39s-action-review.mp4':'290a1f34f3bee6f1af99efd5205dbeb1edcbf8aa8c4cb152866b950681cbd3f4',
 'new-opening.jpg':'f6a2fb3b77c96f5d2b5a9c487744c7b56d445950a3b2ac913de7849b3a5c3f82',
 'ACTION-REVIEW-MANIFEST.json':'732aaa9896867e2497069dbdd8137b0ddb6f58162dc7aa428a5a49dce312e2ed',
}
DEST={
 'one-last-ride-39s-action-review.mp4':'film/assets/one-last-ride-action-cut-3906.mp4',
 'new-opening.jpg':'film/assets/one-last-ride-action-opening-3906.jpg',
 'ACTION-REVIEW-MANIFEST.json':'docs/ATLAS3906-ACTION-CUT-MANIFEST.json',
}
MASTER=ROOT/'film/assets/one-last-ride-motion-preview.mp4'
assert hashlib.sha256(MASTER.read_bytes()).hexdigest()=='ddd2d44c6d58b114cceb523fea47dfce9fbe3259a449a3ce8e61d8b5b002798f'
with zipfile.ZipFile(sys.argv[1]) as archive:
    payload={}
    for name,digest in EXPECTED.items():
        assert archive.namelist().count(name)==1,name
        data=archive.read(name)
        assert hashlib.sha256(data).hexdigest()==digest,name
        payload[name]=data
manifest=json.loads(payload['ACTION-REVIEW-MANIFEST.json'])
assert manifest['reviewOnly'] and manifest['runtimeSeconds']==39
assert manifest['pictureVerification']['firstFrameExpectedMAE']<manifest['pictureVerification']['firstFrameOldMAE']
page=ROOT/'one-last-ride.html'
html=page.read_text()
def change(old,new):
    global html
    assert html.count(old)==1,old
    html=html.replace(old,new,1)
change('poster="./film/assets/approved-crew-poster.webp" aria-label="One Last Ride 39-second music-only teaser"',
       'poster="./film/assets/one-last-ride-action-opening-3906.jpg" aria-label="One Last Ride 39-second action teaser"')
change('<source src="./film/assets/one-last-ride-motion-preview.mp4?v=ddd2d44c" type="video/mp4">','<source src="./film/assets/one-last-ride-action-cut-3906.mp4?v=290a1f34" type="video/mp4">')
change('<a href="./film/assets/one-last-ride-motion-preview.mp4?v=ddd2d44c">Open the MP4 instead.</a>','<a href="./film/assets/one-last-ride-action-cut-3906.mp4?v=290a1f34">Open the MP4 instead.</a>')
change('with the original Elario score and sound effects.','with a new original 132 BPM Elario action score and a revised cinematic opening.')
change('♫ <strong>Original Elario score</strong> · sound effects','♫ <strong>Original Elario action score</strong> · no dialogue')
change('00:39 · 720p · Music-only cut','00:39 · 720p · Action cut')
change('the teaser uses the original Elario score and sound effects.','the action cut uses the original Elario music score; separate voice and final foley production remain open.')
change('The 39-second picture edit follows the crew through Los Santos with music and sound effects. Character voices are in development.','The 39-second action cut follows the crew through Los Santos with a new original score. Character voices and final foley are in development. <a href="./film/assets/one-last-ride-motion-preview.mp4?v=ddd2d44c">Original music-only master (archive)</a>.')
smoke=ROOT/'scripts/browser_smoke.py'
src=smoke.read_text()
old='video source[src*="one-last-ride-motion-preview.mp4"]'
new='video source[src*="one-last-ride-action-cut-3906.mp4"]'
assert src.count(old)==1
src=src.replace(old,new)
for name,data in payload.items():
    dest=ROOT/DEST[name]
    assert not dest.exists() or dest.read_bytes()==data,dest
    dest.write_bytes(data)
page.write_text(html)
smoke.write_text(src)
assert hashlib.sha256(MASTER.read_bytes()).hexdigest()=='ddd2d44c6d58b114cceb523fea47dfce9fbe3259a449a3ce8e61d8b5b002798f'
print('Installed exact action review candidate; original master untouched.')
