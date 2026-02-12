# Android Emulator Setup - Step by Step

## Prerequisites Check

Before starting, verify:
- ✅ Android Studio installed
- ✅ At least 8GB RAM available
- ✅ Virtualization enabled in BIOS
- ✅ 10GB+ free disk space

## Complete Setup Process

### Step 1: Install Android Studio

1. **Download:** https://developer.android.com/studio
2. **Run installer:**
   - Choose "Standard" installation
   - Let it download SDK components
   - Wait for completion (may take 20-30 minutes)

### Step 2: Configure SDK Components

1. **Open Android Studio**
2. **Welcome Screen → More Actions → SDK Manager**
3. **SDK Platforms tab:**
   ```
   ☑ Android 13.0 (Tiramisu) - API Level 33
      ☑ Google APIs Intel x86_64 Atom System Image
   ```
4. **SDK Tools tab:**
   ```
   ☑ Android SDK Build-Tools
   ☑ Android Emulator
   ☑ Android SDK Platform-Tools
   ☑ Intel x86 Emulator Accelerator (HAXM installer)
   ```
5. **Apply** → Wait for downloads

### Step 3: Create Emulator

1. **Welcome Screen → Device Manager**
2. **Create Device** button
3. **Select Hardware:**
   - Choose: **Pixel 5** (most compatible)
   - Click **Next**
4. **Select System Image:**
   - Tab: **x86 Images** (NOT ARM!)
   - Select: **API 33 (Android 13)** - Google APIs
   - If not downloaded, click **Download**
   - Wait for download
   - Click **Next**
5. **Verify Configuration:**
   - Name: Pixel_5_API_33
   - RAM: 2048 MB (or 4096 MB if you have 16GB+ RAM)
   - Graphics: Hardware - GLES 2.0
   - Click **Finish**

### Step 4: Start Emulator

1. **Device Manager** → Find your emulator
2. **Click Play button** ▶️
3. **Wait 1-2 minutes** for first boot (subsequent boots are faster)
4. **Emulator window opens** → Android home screen appears

### Step 5: Verify Connection

Open PowerShell:
```powershell
adb devices
```

Should show:
```
List of devices attached
emulator-5554    device
```

### Step 6: Run Your App

```powershell
# Build and install on emulator
npx expo run:android
```

## Troubleshooting Common Issues

### Issue: "HAXM not installed"

**Fix:**
1. SDK Manager → SDK Tools → Check "Intel x86 Emulator Accelerator"
2. Apply → Install HAXM
3. If still fails:
   - Download HAXM manually: https://github.com/intel/haxm/releases
   - Install → Restart PC

### Issue: "Virtualization disabled"

**Fix:**
1. Restart PC
2. Enter BIOS (F2, F10, or Del during boot)
3. Find "Virtualization Technology" or "Intel VT-x"
4. Enable it
5. Save and exit
6. Restart PC

### Issue: Emulator crashes immediately

**Fix:**
1. Device Manager → Edit emulator (pencil icon)
2. Show Advanced Settings
3. Reduce RAM to 2048 MB
4. Graphics: Try "Software - GLES 2.0"
5. Save → Cold Boot

### Issue: "No system images"

**Fix:**
1. SDK Manager → SDK Platforms
2. Check "Show Package Details"
3. Expand Android 13 (API 33)
4. Check "Google APIs Intel x86_64 Atom System Image"
5. Apply → Download

### Issue: Emulator very slow

**Fix:**
1. Use x86_64 images (not ARM)
2. Enable hardware acceleration
3. Allocate more RAM (if available)
4. Close other applications
5. Use "Quick Boot" option

## Alternative: Use Physical Device

If emulator keeps failing, use your phone:

1. **Enable Developer Options:**
   - Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back → Developer Options

2. **Enable USB Debugging:**
   - Developer Options → USB Debugging (ON)
   - Also enable: "Install via USB"

3. **Connect Phone:**
   - Connect via USB cable
   - Select "File Transfer" mode
   - Accept "Allow USB Debugging" prompt

4. **Verify:**
   ```powershell
   adb devices
   # Should show: ABC123XYZ    device
   ```

5. **Run App:**
   ```powershell
   npx expo run:android
   ```

## Quick Test

After emulator starts:

```powershell
# Check device
adb devices

# Should show emulator connected
# Then run:
npx expo run:android
```

## Recommended Settings Summary

- **Device:** Pixel 5
- **API Level:** 33 (Android 13)
- **Architecture:** x86_64 (NOT ARM)
- **RAM:** 2048-4096 MB
- **Graphics:** Hardware - GLES 2.0
- **Storage:** 2048 MB

## Still Stuck?

1. **Check Android Studio logs:**
   - Help → Show Log in Explorer
   - Look for error messages

2. **Try different emulator:**
   - Pixel 6 instead of Pixel 5
   - API 34 instead of API 33

3. **Use Expo Dev Server instead:**
   ```powershell
   npx expo start --clear
   # No emulator needed for development!
   ```

4. **Check system requirements:**
   - Windows 10/11
   - 8GB+ RAM
   - 10GB+ free disk space
   - Virtualization enabled
