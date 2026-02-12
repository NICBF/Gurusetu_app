# Quick Start Guide - Fix Your Current Issues

## Current Status ✅❌

- ✅ ADB installed (`C:\Android\platform-tools\adb.exe`)
- ❌ Java 8 installed (need Java 17+)
- ❌ Maestro not installed
- ❌ No Android device/emulator connected

## Step-by-Step Fix

### Step 1: Install Java 17+ (Required for Maestro)

**Option A: Download Java 17**
1. Download from: https://adoptium.net/temurin/releases/
   - Select: Windows x64, JDK 17
   - Download installer
2. Install and set JAVA_HOME:
   ```powershell
   # After installation, set JAVA_HOME
   setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot"
   setx PATH "%PATH%;%JAVA_HOME%\bin"
   ```
3. Restart terminal and verify:
   ```powershell
   java -version
   # Should show: java version "17"
   ```

**Option B: Use Android Studio's Java**
- Android Studio includes Java 17
- Usually at: `C:\Users\YourName\AppData\Local\Android\Sdk\jbr`
- Add to PATH:
  ```powershell
  setx PATH "%PATH%;C:\Users\YourName\AppData\Local\Android\Sdk\jbr\bin"
  ```

### Step 2: Install Maestro

1. **Download Maestro:**
   - Go to: https://github.com/mobile-dev-inc/maestro/releases/latest
   - Download: `maestro-*-windows.zip`

2. **Extract:**
   - Extract to: `C:\maestro` (or any folder you prefer)

3. **Add to PATH:**
   ```powershell
   # Replace with your actual path
   setx PATH "%PATH%;C:\maestro\bin"
   ```

4. **Restart PowerShell** and verify:
   ```powershell
   maestro --version
   ```

### Step 3: Set Up Android Emulator

**If Android Studio is installed:**

1. **Open Android Studio**
2. **Tools → Device Manager**
3. **Create Device:**
   - Select: Pixel 5 or Pixel 6
   - System Image: API 33 (Android 13) or API 34 (Android 14)
   - Finish

4. **Start Emulator:**
   - Click Play button next to device
   - OR via command:
     ```powershell
     emulator -avd Pixel_5_API_33
     ```

5. **Verify Connected:**
   ```powershell
   adb devices
   # Should show: emulator-5554    device
   ```

**If Android Studio is NOT installed:**

1. Download: https://developer.android.com/studio
2. Install Android Studio
3. Open → Tools → SDK Manager
4. Install: Android SDK Platform-Tools, Android Emulator
5. Create emulator (steps above)

### Step 4: Build and Install APK

Once emulator is running:

```powershell
# Build and install on emulator
npx expo run:android

# This will:
# - Build APK
# - Install on emulator
# - Launch app
```

### Step 5: Run Maestro Tests

```powershell
# Verify everything is ready
adb devices          # Should show emulator
maestro --version    # Should show version number
java -version        # Should show Java 17+

# Run test
maestro test tests/learner/registration-flow.yaml
```

## Troubleshooting

### "Java version not found"
- Restart terminal after setting PATH
- Check: `echo $env:JAVA_HOME`
- Verify: `java -version`

### "Maestro command not found"
- Restart terminal after setting PATH
- Check: `echo $env:PATH` (should include maestro path)
- Try full path: `C:\maestro\bin\maestro.exe --version`

### "No devices found"
```powershell
# Restart ADB
adb kill-server
adb start-server
adb devices

# If still empty, start emulator manually
```

### "Build fails"
```powershell
# Clean and rebuild
cd android
.\gradlew clean
cd ..
npx expo prebuild --clean
npx expo run:android
```

## Summary Checklist

- [ ] Install Java 17+ (or use Android Studio's Java)
- [ ] Download and extract Maestro
- [ ] Add Maestro to PATH
- [ ] Restart terminal
- [ ] Verify: `maestro --version`
- [ ] Install Android Studio (if not installed)
- [ ] Create Android Emulator
- [ ] Start Emulator
- [ ] Verify: `adb devices`
- [ ] Build APK: `npx expo run:android`
- [ ] Run test: `maestro test tests/learner/registration-flow.yaml`

## Need Help?

See detailed guides:
- `INSTALLATION.md` - Full installation instructions
- `SETUP.md` - Test setup and configuration
