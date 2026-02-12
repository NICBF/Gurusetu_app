# Quick script to start the app
# Usage: .\START_APP.ps1

Write-Host "Checking Android setup..." -ForegroundColor Cyan

# Check ADB
$adbPath = "C:\Android\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    Write-Host "✓ ADB found" -ForegroundColor Green
    
    # Check connected devices
    Write-Host "`nChecking connected devices..." -ForegroundColor Cyan
    $devices = & $adbPath devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$" }
    
    if ($devices) {
        Write-Host "✓ Device(s) connected:" -ForegroundColor Green
        $devices | ForEach-Object { Write-Host "  $_" }
        Write-Host "`nStarting app build..." -ForegroundColor Cyan
        npx expo run:android
    } else {
        Write-Host "✗ No devices connected" -ForegroundColor Red
        Write-Host "`nOptions:" -ForegroundColor Yellow
        Write-Host "1. Start Android Emulator:" -ForegroundColor Yellow
        Write-Host "   - Open Android Studio" -ForegroundColor White
        Write-Host "   - Tools → Device Manager" -ForegroundColor White
        Write-Host "   - Click Play button next to emulator" -ForegroundColor White
        Write-Host "`n2. Use Expo Dev Server (easier):" -ForegroundColor Yellow
        Write-Host "   npx expo start --clear" -ForegroundColor White
        Write-Host "   Then press 'a' or scan QR code" -ForegroundColor White
        Write-Host "`n3. Connect physical device:" -ForegroundColor Yellow
        Write-Host "   - Enable USB Debugging" -ForegroundColor White
        Write-Host "   - Connect via USB" -ForegroundColor White
        Write-Host "   - Accept USB debugging prompt" -ForegroundColor White
        
        # Check for emulator
        $emulatorPath = "C:\Android\emulator\emulator.exe"
        if (Test-Path $emulatorPath) {
            Write-Host "`nChecking for emulators..." -ForegroundColor Cyan
            $avds = & $emulatorPath -list-avds
            if ($avds) {
                Write-Host "✓ Found emulators:" -ForegroundColor Green
                $avds | ForEach-Object { Write-Host "  $_" }
                Write-Host "`nTo start emulator manually:" -ForegroundColor Yellow
                Write-Host "  C:\Android\emulator\emulator.exe -avd $($avds[0])" -ForegroundColor White
            } else {
                Write-Host "✗ No emulators found. Create one in Android Studio." -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "✗ ADB not found at $adbPath" -ForegroundColor Red
    Write-Host "`nUsing Expo Dev Server instead..." -ForegroundColor Yellow
    Write-Host "Run: npx expo start --clear" -ForegroundColor White
}
