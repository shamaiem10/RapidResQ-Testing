# ============================================================
# RapidResQ Integration Test Runner
# Run from project root:  powershell -ExecutionPolicy Bypass -File tests\run-tests.ps1
# ============================================================

Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  RapidResQ Integration Test Runner'     -ForegroundColor Cyan
Write-Host '========================================'  -ForegroundColor Cyan
Write-Host ''

# 1. Check backend is reachable
try {
    $health = Invoke-RestMethod -Uri 'http://localhost:5000/api/health' -Method GET
    Write-Host '  Backend running' -ForegroundColor Green
} catch {
    Write-Host '  Backend NOT reachable.' -ForegroundColor Red
    Write-Host '  Open a NEW terminal and run:  npm run dev:api' -ForegroundColor Yellow
    exit 1
}

# 2. Build timestamped report name
$timestamp  = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = "tests\report-$timestamp.html"

# 3. Run Newman
newman run tests\rapidresq-collection.json `
  --environment tests\rapidresq-env.json `
  --delay-request 400 `
  --reporters cli,htmlextra `
  --reporter-htmlextra-export $reportPath `
  --reporter-htmlextra-title "RapidResQ Tests - $timestamp" `
  --reporter-htmlextra-showOnlyFails false

# 4. Open report
Write-Host ''
Write-Host "Report saved → $reportPath" -ForegroundColor Yellow
Start-Process $reportPath