$ErrorActionPreference = 'Stop'
$mascotNode = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $mascotNode) { $mascotNode = 'C:/Users/Chapito/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' }
if (-not (Test-Path -LiteralPath $mascotNode)) { throw 'Node is unavailable. Open this project in Codex to start the relay.' }
$mascotScript = Join-Path $PSScriptRoot 'status-relay.mjs'
Start-Process -FilePath $mascotNode -ArgumentList ('"' + $mascotScript + '"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $PSScriptRoot '.local/relay.log') -RedirectStandardError (Join-Path $PSScriptRoot '.local/relay-error.log')
Write-Output 'Mascot status relay started. No STUDIO service or startup setting was changed.'
