#!/usr/bin/env python3
"""Idempotent, minimal, forward-only HTML integration, run on development only.
Does not change engine, data, saves, maps, artwork or source attributions.
"""
from pathlib import Path
import argparse

ROOT = Path(__file__).resolve().parents[1]
TARGETS = ['atlas-vi.html', 'atlas-research.html']
TAGS = ('<link rel="stylesheet" href="./atlas94-ui.css?v=94">',
        '<script defer src="./atlas94-ui.js?v=94"></script>')

def update(text):
    for tag in TAGS:
        if tag not in text:
            i = text.lower().rfind('</head>')
            if i < 0:
                raise ValueError('Missing closing head')
            text = text[:i] + tag + '\n' + text[i:]
    return text

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    assert all((ROOT / p).is_file() for p in ('atlas94-ui.css','atlas94-ui.js')), 'Missing assets'
    touched = []
    for target in TARGETS:
        file = ROOT / target
        if not file.is_file():
            raise FileNotFoundError(f'{target} missing; apply to existing Atlas repository')
        old = file.read_text(encoding='utf-8')
        new = update(old)
        if new != old:
            touched.append(target)
            if not args.check:
                file.write_text(new, encoding='utf-8')
    print(('Would update' if args.check else 'Updated'),len(touched),'pages:',', '.join(touched) or '(already installed)')

if __name__ == '__main__': main()
