#!/usr/bin/env pwsh
# Helper to start Backend and Frontend in separate PowerShell windows (Windows)
# Usage: Right-click -> Run with PowerShell, or from PowerShell: .\run-all.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

function Start-ServiceWindow($name, $workDir, $startCmd) {
    $psArgs = "-NoExit -Command cd '$workDir'; $startCmd"
    Start-Process -FilePath "powershell" -ArgumentList $psArgs -WindowStyle Normal -Verb Open
    Write-Host "Started $name in new window (working dir: $workDir)"
}

# Backend
$backendDir = Join-Path $root 'Backend'
if (Test-Path $backendDir) {
    Start-ServiceWindow 'Backend' $backendDir 'npm start'
} else {
    Write-Warning "Backend folder not found: $backendDir"
}

# Frontend
$frontendDir = Join-Path $root 'Frontend'
if (Test-Path $frontendDir) {
    Start-ServiceWindow 'Frontend' $frontendDir 'npm start'
} else {
    Write-Warning "Frontend folder not found: $frontendDir"
}

Write-Host "Launched startup windows for Backend and Frontend. Check those windows for logs/errors."
