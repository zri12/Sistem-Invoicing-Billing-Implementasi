param([ValidateSet('all', 'full')][string]$Suite = 'all',
    [ValidateSet('', 'remaining', 'financial', 'settings', 'users', 'responsive', 'double')][string]$Focus = '',
    [switch]$Visible)
$ErrorActionPreference = 'Stop'
$projectPath = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
Set-Location -LiteralPath $projectPath
if (Get-NetTCPConnection -State Listen -LocalPort 8018 -ErrorAction SilentlyContinue) {
    throw 'Port 8018 is already in use. Stop the isolated test server before running this script.'
}
$browserTools = Join-Path $env:TEMP 'invoicing-browser-tests'
if (!(Test-Path (Join-Path $browserTools 'node_modules/playwright'))) {
    npm install --prefix $browserTools playwright --no-save --package-lock=false
    if ($LASTEXITCODE -ne 0) { throw 'Playwright installation failed.' }
}
$env:PLAYWRIGHT_MODULE = Join-Path $browserTools 'node_modules/playwright'
if ($Visible) { $env:BROWSER_HEADED = '1' } else { Remove-Item Env:BROWSER_HEADED -ErrorAction SilentlyContinue }
$env:APP_ENV = 'testing'
$env:DB_CONNECTION = 'sqlite'
$env:DB_DATABASE = Join-Path $projectPath 'storage/app/browser-testing.sqlite'
$env:DB_URL = ''
$env:CACHE_STORE = 'array'
$env:PUBLIC_STORAGE_ROOT = Join-Path $projectPath 'storage/app/public/browser-tests'
$env:PUBLIC_STORAGE_URL = '/storage/browser-tests'
$env:INVOICE_PDF_STORAGE_PATH = Join-Path $projectPath 'storage/app/browser-test-results/pdf-cache'
Remove-Item Env:BROWSER_TEST_MATCH -ErrorAction SilentlyContinue
Remove-Item Env:FULL_QA_PHASE -ErrorAction SilentlyContinue
if (!(Test-Path -LiteralPath $env:DB_DATABASE)) {
    New-Item -ItemType File -Path $env:DB_DATABASE | Out-Null
}
# This resets only the explicit disposable SQLite database above.
php tests/browser/database.php --check
if ($LASTEXITCODE -ne 0) { throw 'Refusing to reset a database that failed the isolation check.' }
if (!$Focus) {
    php artisan migrate:fresh --force --no-interaction
    if ($LASTEXITCODE -ne 0) { throw 'Browser database migration failed.' }
    php tests/browser/seed.php
    if ($LASTEXITCODE -ne 0) { throw 'Browser fixtures failed.' }
} else {
    $env:FULL_QA_PHASE = $Focus
    Write-Output 'Focused regression against existing isolated fixtures; not a full-system PASS.'
}
$env:APP_ENV = 'local' # Keep real CSRF checks enabled in browser tests.
$env:APP_URL = 'http://127.0.0.1:8018'
$env:SESSION_DRIVER = 'file'
$env:SESSION_COOKIE = 'invoicing-browser-test'
$env:SANCTUM_STATEFUL_DOMAINS = '127.0.0.1:8018'
$resultDirectory = Join-Path $projectPath 'storage/app/browser-test-results'
New-Item -ItemType Directory -Path $resultDirectory -Force | Out-Null
$phpExecutable = (Get-Command php).Source
$serverProcess = Start-Process -FilePath $phpExecutable -ArgumentList @(
    '-S', '127.0.0.1:8018', '../tests/browser/server.php'
) -WorkingDirectory (Join-Path $projectPath 'public') -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput (Join-Path $resultDirectory 'server-output.log') `
    -RedirectStandardError (Join-Path $resultDirectory 'server-error.log')
try {
    $serverReady = $false
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        try {
            Invoke-WebRequest 'http://127.0.0.1:8018/up' -UseBasicParsing | Out-Null
            $serverReady = $true
            break
        } catch { Start-Sleep -Milliseconds 250 }
    }
    if (!$serverReady) { throw 'Browser server did not start.' }
    if ($Suite -eq 'all' -and !$Focus) {
        node tests/browser/smoke.cjs
        if ($LASTEXITCODE -ne 0) { throw 'Browser smoke checks failed. See browser-test-results.' }
        node tests/browser/filters.cjs
        if ($LASTEXITCODE -ne 0) { throw 'Browser filter checks failed.' }
    }
    if (!$Focus) {
        node tests/browser/login-validation.cjs
        if ($LASTEXITCODE -ne 0) { throw 'Login UI validation failed.' }
    }
    node tests/browser/full-system.cjs
    if ($LASTEXITCODE -ne 0) { throw 'Full-system QA failed. See json/full-system-results.json.' }
    if (!$Focus) {
        node tests/browser/manager-read-filters.cjs
        if ($LASTEXITCODE -ne 0) { throw 'Manager read filter checks failed.' }
        python tests/browser/verify-pdfs.py
        if ($LASTEXITCODE -ne 0) { throw 'Rendered PDF verification failed. See pdf evidence.' }
    }
} finally {
    Stop-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue
}
