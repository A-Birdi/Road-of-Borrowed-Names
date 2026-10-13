# VA-1 local audition on Windows: a thin wrapper around the same Node script the cloud runs (tools/voice/audition.mjs),
# for the local engines only (VOICEVOX, VOICEVOX Nemo, AivisSpeech). No credential, no cost, nothing uploaded.
# Not run on Windows by its author (no PowerShell where it was written): every step is also one plain `node` command
# in README-FIRST.md if this wrapper misbehaves.
#   .\tools\voice\windows\run-local-audition.ps1 -Config voicevox -Step voices
#   .\tools\voice\windows\run-local-audition.ps1 -Config voicevox -Step smoke -By "Robin, 2026-10-14, VOICEVOX local"
#   … -Step screen, then -Step gallery (opens review.html), then -Step matrix once each role's voice is selected
param(
  [Parameter(Mandatory = $true)][ValidateSet('voicevox', 'voicevox_nemo', 'aivis')][string]$Config,
  [Parameter(Mandatory = $true)][ValidateSet('voices', 'smoke', 'screen', 'matrix', 'gallery', 'status')][string]$Step,
  [string]$By = '',
  [string]$EngineUrl = ''
)
$ErrorActionPreference = 'Stop'
$Kit = Resolve-Path (Join-Path $PSScriptRoot '..\..\..')
Set-Location $Kit
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Write-Host 'Node.js is not installed (or not on PATH). Install the LTS version from https://nodejs.org and open a new PowerShell window.'; exit 1 }
$major = [int]((& node --version).TrimStart('v').Split('.')[0])
if ($major -lt 18) { Write-Host "Node.js 18 or newer is needed (found $(& node --version))."; exit 1 }
$engine = @()
if ($EngineUrl) { $engine = @('--engine-url', $EngineUrl) }
switch ($Step) {
  'voices' { & node tools/voice/audition.mjs voices --config $Config @engine }
  'status' { & node tools/voice/audition.mjs status }
  'gallery' {
    & node tools/voice/gallery.mjs
    $page = Get-ChildItem -Path 'voice-audition\VA1' -Filter review.html -Recurse | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($page) { Start-Process $page.FullName } else { Write-Host 'No review.html yet.' }
  }
  default {
    if (-not $By) { Write-Host 'Say who authorised this run: -By "<who, when, scope>"'; exit 2 }
    & node tools/voice/audition.mjs run --config $Config --kind $Step --authorised $By @engine
  }
}
exit $LASTEXITCODE
