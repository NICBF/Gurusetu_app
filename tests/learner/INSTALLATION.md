# Maestro Installation & Setup Guide

## Issue 1: Maestro Not Installed

### Windows Installation

**Prerequisites:** Java 17 or higher required
```powershell
# Check Java version
java -version
# Should show: java version "17" or higher

# If you have Java 8 (like Java 1.8), you need to upgrade:
# Download Java 17+ from: https://adoptium.net/
# OR use Android Studio's bundled JDK (usually Java 17)
```

**Option 1: Manual Installation (Recommended)**
1. Download Maestro from: https://github.com/mobile-dev-inc/maestro/releases/latest
   - Download: `maestro-*-windows.zip`
2. Extract to a folder (e.g., `C:\maestro` or `C:\Users\YourName\maestro`)
3. Add to PATH using PowerShell:
   ```powershell
   # Replace C:\maestro\bin with your actual path
   setx PATH "%PATH%;C:\maestro\bin"
   ```
4. **Restart PowerShell/Terminal** for PATH changes to take effect
5. Verify:
   ```powershell
   maestro --version
   ```

**Option 2: Using WSL2 (Alternative)**
If you prefer WSL2:
```powershell
# Install WSL2 (as Administrator)
wsl --install

# Then in WSL2 terminal:
sudo apt install openjdk-17-jdk
curl -Ls "https://get.maestro.mobile.dev" | bash
```

**Verify Installation:**
```powershell
maestro --version
```

## Issue 2: No Android Device/Emulator

### Option A: Use Android Emulator (Recommended for Testing)

1. **Install Android Studio** (if not installed):
   - Download: https://developer.android.com/studio
   - Install with Android SDK

2. **Create Emulator:**
   ```powershell
   # Open Android Studio
   # Tools → Device Manager → Create Device
   # Select: Pixel 5 or Pixel 6
   # System Image: API 33 (Android 13) or API 34 (Android 14)
   ```

3. **Start Emulator:**
   ```powershell
   # Via Android Studio: Device Manager → Play button
   # OR via command line:
   emulator -avd Pixel_5_API_33
   ```

4. **Verify Device Connected:**
   ```powershell
   adb devices
   # Should show: emulator-5554    device
   ```

### Option B: Use Physical Device

1. **Enable Developer Options:**
   - Settings → About Phone → Tap "Build Number" 7 times
   - Go back → Developer Options → Enable "USB Debugging"

2. **Connect via USB:**
   ```powershell
   adb devices
   # Should show your device ID
   ```

3. **If device not showing:**
   - Install USB drivers for your phone
   - Try different USB cable/port
   - Check "Allow USB debugging" prompt on phone

### Option C: Use Expo Go (Quick Testing)

For quick testing without building APK:

```powershell
# Start Expo dev server
npx expo start

# Scan QR code with Expo Go app on phone
# OR press 'a' to open in Android emulator
```

**Note:** Maestro works best with APK builds, not Expo Go.

## Building APK for Testing

### Development Build (Recommended)

```powershell
# Make sure emulator/device is connected first
adb devices

# Build and install
npx expo run:android

# This will:
# 1. Build APK
# 2. Install on connected device/emulator
# 3. Start the app
```

### Standalone APK Build

```powershell
# Using EAS Build
eas build --profile development --platform android

# Download APK from EAS dashboard
# Install manually:
adb install path/to/app.apk
```

## Running Maestro Tests

Once both are set up:

```powershell
# 1. Verify device connected
adb devices

# 2. Verify Maestro installed
maestro --version

# 3. Run test
maestro test tests/learner/registration-flow.yaml

# 4. Run all tests
maestro test tests/learner/
```

## Troubleshooting

### Maestro Command Not Found
- Restart terminal after installation
- Check PATH: `echo $env:PATH` (PowerShell)
- Reinstall Maestro

### No Devices Found
```powershell
# Check ADB
adb devices

# Restart ADB server
adb kill-server
adb start-server
adb devices

# Check emulator status
emulator -list-avds
```

### Build Fails
```powershell
# Clean build
cd android
./gradlew clean
cd ..

# Rebuild
npx expo prebuild --clean
npx expo run:android
```

## Quick Start Checklist

- [ ] Install Maestro (`iwr https://raw.githubusercontent.com/mobile-dev-inc/maestro/main/install.ps1 -useb | iex`)
- [ ] Verify Maestro (`maestro --version`)
- [ ] Install Android Studio
- [ ] Create Android Emulator (Pixel 5, API 33)
- [ ] Start Emulator
- [ ] Verify device (`adb devices`)
- [ ] Build APK (`npx expo run:android`)
- [ ] Run test (`maestro test tests/learner/registration-flow.yaml`)
