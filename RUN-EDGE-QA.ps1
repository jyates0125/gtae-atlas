# Manual Microsoft Edge test for Team Jura Atlas on Windows.
# Does not change the GitHub repository or Cloudflare project.
$ErrorActionPreference='Stop'
Push-Location $PSScriptRoot
try {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js 22 or newer is required. Install it from nodejs.org.' }
  if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'Python 3.12 or newer is required.' }
  & node scripts/build-cloudflare.cjs
  if ($LASTEXITCODE -ne 0) { throw 'Production build failed.' }
  & python scripts/audit_published.py
  if ($LASTEXITCODE -ne 0) { throw 'Production audit failed. Do not launch.' }
  & python -c 'import playwright'
  if ($LASTEXITCODE -ne 0) { throw 'Install Playwright first: python -m pip install playwright==1.58.0' }
  $env:ATLAS_BROWSER='msedge'
  & python scripts/browser_smoke.py
  if ($LASTEXITCODE -ne 0) { throw 'Microsoft Edge smoke tests failed. See errors; do not publish.' }
  Write-Host 'PASS: Team Jura Atlas Microsoft Edge smoke checks. Also test third-party map tiles on the Cloudflare preview.'
} finally { Pop-Location }
