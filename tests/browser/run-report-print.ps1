$ErrorActionPreference = 'Stop'
$project = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
Set-Location -LiteralPath $project
if (Get-NetTCPConnection -State Listen -LocalPort 8018 -ErrorAction SilentlyContinue) { throw 'Port 8018 is in use.' }
$env:PLAYWRIGHT_MODULE = Join-Path $env:TEMP 'invoicing-browser-tests/node_modules/playwright'
$env:APP_ENV = 'testing'
$env:DB_CONNECTION = 'sqlite'
$env:DB_DATABASE = Join-Path $project 'storage/app/browser-testing.sqlite'
$env:DB_URL = ''
$env:CACHE_STORE = 'array'
$env:PUBLIC_STORAGE_ROOT = Join-Path $project 'storage/app/public/browser-tests'
$env:PUBLIC_STORAGE_URL = '/storage/browser-tests'
php tests/browser/database.php --check
if ($LASTEXITCODE -ne 0) { throw 'Isolated database check failed.' }
$env:APP_ENV = 'local'
$env:APP_URL = 'http://127.0.0.1:8018'
$env:SESSION_DRIVER = 'file'
$env:SESSION_COOKIE = 'invoicing-browser-test'
$env:SANCTUM_STATEFUL_DOMAINS = '127.0.0.1:8018'
$server = Start-Process -FilePath (Get-Command php).Source -ArgumentList @('-S', '127.0.0.1:8018', '../tests/browser/server.php') -WorkingDirectory (Join-Path $project 'public') -WindowStyle Hidden -PassThru
try {
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        try { Invoke-WebRequest 'http://127.0.0.1:8018/up' -UseBasicParsing | Out-Null; $ready = $true; break } catch { Start-Sleep -Milliseconds 250 }
    }
    if (!$ready) { throw 'Test server did not start.' }
    node tests/browser/report-print.cjs
    if ($LASTEXITCODE -ne 0) { throw 'Print report check failed.' }
} finally { Stop-Process -Id $server.Id -ErrorAction SilentlyContinue }
