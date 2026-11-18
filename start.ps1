# CodeSentinel Multi-Service Startup Script (PowerShell)
param(
    [switch]$NoTunnel = $false
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Starting CodeSentinel Platform...     " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot
Set-Location $WorkspaceRoot

# 1. Check Python virtual environment
$PythonExe = Join-Path $WorkspaceRoot "venv\Scripts\python.exe"
if (-not (Test-Path $PythonExe)) {
    Write-Host "[!] Virtual environment not found at $PythonExe" -ForegroundColor Red
    Write-Host "[!] Please create and setup venv first." -ForegroundColor Yellow
    exit 1
}

# 2. Extract Ngrok domain from .env if present
$NgrokDomain = "gossipingly-unlunate-wilda.ngrok-free.dev"
if (Test-Path ".env") {
    $envMatch = Get-Content ".env" | Select-String "GITHUB_REDIRECT_URI=https://([^/]+)"
    if ($envMatch -and $envMatch.Matches.Groups.Count -gt 1) {
        $NgrokDomain = $envMatch.Matches.Groups[1].Value
    }
}

# 3. Start Backend (FastAPI + Uvicorn)
Write-Host "`n[*] Starting Backend API (Uvicorn on port 8000)..." -ForegroundColor Yellow
$BackendJob = Start-Process -FilePath $PythonExe `
    -ArgumentList "-m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000" `
    -WorkingDirectory $WorkspaceRoot `
    -PassThru

Start-Sleep -Seconds 3

# 4. Start Frontend (Next.js)
Write-Host "[*] Starting Frontend Dev Server (Next.js on port 3000)..." -ForegroundColor Yellow
$FrontendJob = Start-Process -FilePath "npm.cmd" `
    -ArgumentList "run dev" `
    -WorkingDirectory (Join-Path $WorkspaceRoot "frontend") `
    -PassThru

# 5. Start Ngrok Tunnel (if requested and ngrok is installed)
$NgrokJob = $null
if (-not $NoTunnel) {
    $ngrokCmd = Get-Command "ngrok" -ErrorAction SilentlyContinue
    if ($ngrokCmd) {
        Write-Host "[*] Starting ngrok tunnel for https://$NgrokDomain -> 127.0.0.1:8000..." -ForegroundColor Yellow
        $NgrokJob = Start-Process -FilePath "ngrok.exe" `
            -ArgumentList "http --url=$NgrokDomain 127.0.0.1:8000" `
            -PassThru
    } else {
        Write-Host "[i] ngrok CLI not found on PATH. Skipping tunnel." -ForegroundColor DarkGray
    }
}

Start-Sleep -Seconds 4

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "   CodeSentinel Services Running!         " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host " Frontend:      http://localhost:3000" -ForegroundColor White
Write-Host " Backend API:   http://localhost:8000 (Docs: http://localhost:8000/api/docs)" -ForegroundColor White
if ($NgrokJob) {
    Write-Host " Public Tunnel: https://$NgrokDomain" -ForegroundColor Cyan
    Write-Host " Webhook URL:   https://$NgrokDomain/api/v1/webhooks/github" -ForegroundColor Cyan
    Write-Host " Ngrok Web UI:  http://127.0.0.1:4040" -ForegroundColor Cyan
}
Write-Host "==========================================" -ForegroundColor Green
