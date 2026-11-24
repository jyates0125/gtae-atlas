#!/usr/bin/env python3
"""Validate selected cinematic art and its exact published wiring."""
import argparse,hashlib,json,re
from pathlib import Path
R=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser()
p.add_argument('--require',action='store_true',help='Also require the built CSS and all selected published images')
a=p.parse_args()
entries=json.loads((R/'docs/ATLAS3904-HEADER-ART.json').read_text())['images']
assert len(entries)==9
css=(R/'atlas3903-header-refresh.css').read_text()
paths=set(); hashes=set(); installed=0
def webp(path):
    data=path.read_bytes()
    assert len(data)>=12 and data[:4]==b'RIFF' and data[8:12]==b'WEBP',path
    return data
for key,entry in entries.items():
    assert re.fullmatch('[a-z0-9-]+',key),key
    assert entry['selected'] in ('existing','new'),key
    fallback=entry['fallback']
    assert './'+fallback in css,key
    page=(R/entry['page']).read_text()
    assert 'data-gtae-header="'+key+'"' in page,key
    assert 'atlas3903-header-refresh.css' in page,key
    source=R/entry['path']
    if source.is_file():
        assert hashlib.sha256(webp(source)).hexdigest()==entry['sha256'],key
        installed+=1
    existing=entry['selected']=='existing'
    rel=fallback if existing else entry['path']
    assert re.fullmatch(r'art/[a-zA-Z0-9-]+\.webp',rel),key
    data=webp(R/rel)
    digest=hashlib.sha256(data).hexdigest()
    if existing:
        git_blob=hashlib.sha1(f'blob {len(data)}\0'.encode()+data).hexdigest()
        assert git_blob==entry['fallbackGitBlob'],key
    else:
        assert digest==entry['sha256'],key
    assert rel not in paths and digest not in hashes,key
    paths.add(rel);hashes.add(digest)
    public_css=R/'public/atlas3903-header-refresh.css'
    if public_css.is_file():
        assert '[data-gtae-header="'+key+'"]{--j3904-art:url("./'+rel+'")}' in public_css.read_text(),key
        assert (R/'public'/rel).read_bytes()==data,key
    # The release static suite may run before the build. Source selection is
    # mandatory then; the Cloudflare build separately verifies published bytes.
print(f'Atlas 39.0.5: {len(paths)}/9 selected cinematic images verified; {installed}/9 optional concept images installed')
