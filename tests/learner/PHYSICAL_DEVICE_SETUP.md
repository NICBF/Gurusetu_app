# Physical Android Device Setup for Expo

## Quick Setup (5 minutes)

### Step 1: Enable Developer Options on Your Phone

1. **Open Settings** on your Android phone
2. **Go to:** Settings → About Phone (or About Device)
3. **Find "Build Number"** (usually at the bottom)
4. **Tap "Build Number" 7 times** until you see "You are now a developer!"
5. **Go back** to Settings

### Step 2: Enable USB Debugging

1. **Settings → Developer Options** (now visible!)
2. **Enable these options:**
   - ✅ **USB Debugging** (ON)
   - ✅ **Install via USB** (ON) - if available
   - ✅ **USB Debugging (Security settings)** - if available
3. **Keep Developer Options open** (don't close settings yet)

### Step 3: Connect Phone to PC

1. **Connect phone to PC** via USB cable
2. **On phone:** When prompted, select **"File Transfer"** or **"MTP"** mode
3. **On phone:** You'll see a popup: **"Allow USB debugging?"**
   - ✅ Check **"Always allow from this computer"**
   - ✅ Tap **"Allow"** or **"OK"**

### Step 4: Verify Connection

Open PowerShell:
```powershell
adb devices
```

**Should show:**
```
List of devices attached
ABC123XYZ    device
```

If it shows **"unauthorized"**:
- Unlock your phone
- Check for USB debugging prompt
- Tap "Allow"

### Step 5: Run Your App!

**Option A: Using Expo Dev Server (Recommended)**
```powershell
npx expo start --clear
```

Then:
- Press **`a`** in the terminal to open on Android
- OR scan the QR code with Expo Go app

**Option B: Build and Install APK**
```powershell
npx expo run:android
```

This will:
- Build APK
- Install on your phone
- Launch app automatically

## Troubleshooting

### Issue: "adb devices" shows nothing

**Fix:**
```powershell
# Restart ADB
adb kill-server
adb start-server
adb devices

# If still empty:
# 1. Try different USB cable
# 2. Try different USB port
# 3. Unlock phone
# 4. Check USB debugging is enabled
```

### Issue: Shows "unauthorized"

**Fix:**
1. **Unlock your phone**
2. **Look for popup:** "Allow USB debugging?"
3. **Check:** "Always allow from this computer"
4. **Tap:** "Allow"
5. **Run again:**
   ```powershell
   adb devices
   ```

### Issue: "device offline"

**Fix:**
```powershell
adb kill-server
adb start-server
adb devices

# If still offline:
# 1. Disconnect USB
# 2. Reconnect USB
# 3. Accept USB debugging prompt again
```

### Issue: Phone not charging/not detected

**Fix:**
1. **Try different USB cable** (some cables are charge-only)
2. **Try different USB port** (use USB 2.0 port if available)
3. **Enable "File Transfer" mode** on phone
4. **Install phone USB drivers** (if Windows doesn't recognize it)

### Issue: Expo Go app not connecting

**Fix:**
1. **Make sure phone and PC are on same Wi-Fi**
2. **OR use USB mode:**
   ```powershell
   # Terminal 1: Start Expo
   npx expo start --clear
   
   # Terminal 2: Forward port
   adb reverse tcp:8081 tcp:8081
   
   # Then press 'a' in Expo terminal
   ```

## Using Expo Go App (Easiest Method)

### Step 1: Install Expo Go

1. **Open Play Store** on your phone
2. **Search:** "Expo Go"
3. **Install** Expo Go app

### Step 2: Connect

1. **Start Expo:**
   ```powershell
   npx expo start --clear
   ```

2. **On your phone:**
   - Open **Expo Go** app
   - Tap **"Scan QR code"**
   - Scan QR code from terminal
   - App loads automatically!

**Note:** Expo Go has some limitations. For full features, use `npx expo run:android` to build APK.

## For Maestro Testing

Once your device is connected:

```powershell
# 1. Verify device connected
adb devices

# 2. Build and install APK
npx expo run:android

# 3. Run Maestro tests
maestro test tests/learner/registration-flow.yaml
```

## Quick Commands Reference

```powershell
# Check connected devices
adb devices

# Restart ADB if issues
adb kill-server
adb start-server

# Forward Metro port (for USB-only connection)
adb reverse tcp:8081 tcp:8081

# Install APK manually (if needed)
adb install path/to/app.apk

# Uninstall app (if needed)
adb uninstall in.ac.iitm.gurusetu
```

## Recommended Setup

**For Development:**
- Use **Expo Dev Server** (`npx expo start`)
- Use **Expo Go** app or press `a` to install dev build
- Fastest iteration, no build needed

**For Testing:**
- Use **`npx expo run:android`** to build APK
- Install on device
- Run Maestro tests

## Summary

✅ **Enable Developer Options** (tap Build Number 7 times)
✅ **Enable USB Debugging**
✅ **Connect via USB**
✅ **Accept USB debugging prompt**
✅ **Verify:** `adb devices`
✅ **Run:** `npx expo start --clear` or `npx expo run:android`

Your physical device is ready! 🎉
