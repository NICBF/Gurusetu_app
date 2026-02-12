# Fix: App Not Opening

## Problem
- App bundles successfully ✅
- But no device/emulator detected ❌
- App can't launch ❌

## Quick Solutions

### Solution 1: Use Expo Dev Server (Easiest - No Emulator Needed)

Instead of `npx expo run:android`, use the dev server:

```powershell
# Terminal 1: Start Expo dev server
npx expo start --clear

# Then press 'a' to open on Android
# OR scan QR code with Expo Go app on your phone
```

**Note:** This uses Expo Go (if installed on device) or builds on-the-fly.

### Solution 2: Start Android Emulator

**If Android Studio is installed:**

1. **Open Android Studio**
2. **Tools → Device Manager**
3. **Click Play button** next to an emulator (or create one first)
4. **Wait for emulator to boot** (takes 1-2 minutes)
5. **Verify connected:**
   ```powershell
   adb devices
   # Should show: emulator-5554    device
   ```
6. **Then run:**
   ```powershell
   npx expo run:android
   ```

**If emulator command not in PATH:**

Find Android SDK location (usually):
- `C:\Users\YourName\AppData\Local\Android\Sdk`
- Or check Android Studio → Settings → Appearance & Behavior → System Settings → Android SDK

Then add to PATH:
```powershell
# Replace with your actual SDK path
setx PATH "%PATH%;C:\Users\YourName\AppData\Local\Android\Sdk\emulator"
setx PATH "%PATH%;C:\Users\YourName\AppData\Local\Android\Sdk\tools"
setx PATH "%PATH%;C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools"
```

Restart terminal, then:
```powershell
emulator -list-avds
emulator -avd Pixel_5_API_33
```

### Solution 3: Connect Physical Android Device

1. **Enable USB Debugging:**
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"

2. **Connect via USB**

3. **Accept USB Debugging prompt** on phone

4. **Verify:**
   ```powershell
   adb devices
   # Should show: ABC123XYZ    device
   ```

5. **Run:**
   ```powershell
   npx expo run:android
   ```

### Solution 4: Use Expo Go App (Quickest for Testing)

1. **Install Expo Go** on your Android phone (from Play Store)

2. **Start dev server:**
   ```powershell
   npx expo start --clear
   ```

3. **Scan QR code** with Expo Go app

4. **App opens immediately** (no build needed)

**Note:** Expo Go has limitations. For full features, use Solution 2 or 3.

## Check Current Status

```powershell
# Check if devices connected
adb devices

# Check if emulators exist
# (If Android Studio installed)
cd "C:\Users\YourName\AppData\Local\Android\Sdk\emulator"
.\emulator.exe -list-avds
```

## Recommended: Use Expo Dev Server

For development, this is easiest:

```powershell
# Start dev server
npx expo start --clear

# Options:
# - Press 'a' to open on Android (if device connected)
# - Press 'i' to open on iOS simulator
# - Scan QR code with Expo Go
# - Press 'w' to open in web browser
```

This doesn't require building APK and works immediately!

## For Maestro Testing

Maestro needs a **built APK**, so you'll need:
1. Android Emulator running, OR
2. Physical device connected
3. Then: `npx expo run:android` to build and install
4. Then: `maestro test tests/learner/registration-flow.yaml`

## Summary

**Quick Fix (Development):**
```powershell
npx expo start --clear
# Press 'a' or scan QR code
```

**For Maestro Testing:**
1. Start emulator OR connect device
2. `npx expo run:android`
3. `maestro test tests/learner/registration-flow.yaml`
