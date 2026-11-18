#!/usr/bin/env python3
"""One-time safety cleanup after extracting cumulative ZIP into a development checkout.
This script never changes main and never commits or pushes. It deletes only
obsolete, overlapping Atlas auto-apply GitHub Actions workflows.
"""
from __future__ import annotations
import argparse,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OLD={
'atlas-checks','atlas-checks.yml','atlas-preview.yml',
'atlas85-apply.yml','atlas88-apply.yml','atlas92-apply.yml',
'atlas93-apply.yml','atlas93-vi-sync.yml','atlas97-one-upload-apply.yml',
'atlas96-cumulative-apply.yml','atlas98b-preview-quality.yml','gtadb-vi-sync.yml'
}
NEW={'team-jura-release.yml','team-jura-data-review.yml'}

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--apply',action='store_true',help='Delete known legacy auto-apply workflows; run only on development');args=ap.parse_args()
 try:
  branch=subprocess.run(['git','rev-parse','--abbrev-ref','HEAD'],cwd=ROOT,text=True,capture_output=True,check=True).stdout.strip()
 except (OSError,subprocess.CalledProcessError):
  print('ERROR: Run this inside your locally cloned Team Jura Git checkout. No files changed.');return 2
 if branch!='development':
  print(f'ERROR: Current branch is {branch!r}. Switch to development; main is protected. No files changed.');return 2
 workflow=ROOT/'.github'/'workflows'
 for name in NEW:
  if not (workflow/name).is_file():print('ERROR: Missing new workflow '+name);return 2
 old=sorted(p for p in workflow.iterdir() if p.is_file() and p.name in OLD)
 print('Development release workflow audit:',len(old),'old actions to retire')
 for p in old:print('  ',p.relative_to(ROOT))
 if not args.apply:
  print('Dry run only; add --apply to remove only these old workflows.');return 0
 for p in old:p.unlink()
 print('Safe cleanup applied. No commits or pushes performed. Next: python scripts/audit_release.py')
 return 0

if __name__=='__main__':sys.exit(main())
