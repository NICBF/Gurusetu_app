# Quick script to start app on your physical device
# Usage: .\START_ON_DEVICE.ps1

Write-Host "`n=== Starting App on Physical Device ===" -ForegroundColor Cyan

# Check ADB
$adbPath = "C:\Android\platform-tools\adb.exe"
if (-not (Test-Path $adbPath)) {
    Write-Host "✗ ADB not found at $adbPath" -ForegroundColor Red
    Write-Host "`nPlease check your Android SDK installation." -ForegroundColor Yellow
    exit 1
}

# Check connected devices
Write-Host "`nChecking connected devices..." -ForegroundColor Cyan
$devices = & $adbPath devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$" }

if ($devices) {
    Write-Host "✓ Device(s) connected:" -ForegroundColor Green
    $devices | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    
    Write-Host "`nChoose method:" -ForegroundColor Yellow
    Write-Host "1. Expo Dev Server (fast, uses Expo Go)" -ForegroundColor White
    Write-Host "2. Build APK and install (full features)" -ForegroundColor White
    Write-Host "`nStarting Expo Dev Server..." -ForegroundColor Cyan
    Write-Host "Press 'a' when ready, or scan QR code with Expo Go app" -ForegroundColor Yellow
    Write-Host "`n" -ForegroundColor White
    
    npx expo start --clear
} else {
    Write-Host "✗ No devices connected" -ForegroundColor Red
    Write-Host "`nPlease:" -ForegroundColor Yellow
    Write-Host "1. Enable Developer Options on your phone:" -ForegroundColor White
    Write-Host "   Settings → About Phone → Tap Build Number 7 times" -ForegroundColor Gray
    Write-Host "2. Enable USB Debugging:" -ForegroundColor White
    Write-Host "   Settings → Developer Options → USB Debugging (ON)" -ForegroundColor Gray
    Write-Host "3. Connect phone via USB" -ForegroundColor White
    Write-Host "4. Accept USB debugging prompt on phone" -ForegroundColor White
    Write-Host "`nThen run this script again." -ForegroundColor Yellow
    
    # Check for unauthorized devices
    $unauthorized = & $adbPath devices | Select-Object -Skip 1 | Where-Object { $_ -match "unauthorized" }
    if ($unauthorized) {
        Write-Host "`n⚠ Found unauthorized device(s):" -ForegroundColor Yellow
        $unauthorized | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        Write-Host "`nUnlock your phone and accept USB debugging prompt!" -ForegroundColor Yellow
    }
}
