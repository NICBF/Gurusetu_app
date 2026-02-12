# Fix Android Emulator Error

## Common Emulator Errors & Solutions

### Error 1: "HAXM not installed" or "Intel HAXM error"

**Solution:**
1. **Enable Virtualization in BIOS:**
   - Restart PC
   - Enter BIOS (usually F2, F10, or Del during boot)
   - Find "Virtualization Technology" or "Intel VT-x"
   - Enable it
   - Save and exit

2. **Install HAXM manually:**
   - Download: https://github.com/intel/haxm/releases
   - Install HAXM
   - Restart PC

### Error 2: "Emulator process was killed" or crashes immediately

**Solution:**
1. **Check available RAM:**
   - Emulator needs 2-4GB RAM
   - Close other applications

2. **Reduce emulator RAM:**
   - Android Studio → Device Manager
   - Edit emulator (pencil icon)
   - Show Advanced Settings
   - Reduce RAM to 2048 MB

3. **Use x86_64 system image** (not ARM):
   - When creating emulator, choose x86_64 images
   - ARM images are slower and may crash

### Error 3: "No system images installed"

**Solution:**
1. **Open Android Studio**
2. **Tools → SDK Manager**
3. **SDK Platforms tab:**
   - Check "Show Package Details"
   - Select Android 13 (API 33) or Android 14 (API 34)
   - Check "Google APIs" or "Google Play" system image
4. **SDK Tools tab:**
   - Check "Android Emulator"
   - Check "Android SDK Platform-Tools"
5. **Apply** and wait for download

### Error 4: "Emulator won't start" or hangs

**Solution:**
1. **Delete and recreate emulator:**
   - Device Manager → Delete emulator
   - Create new one with:
     - Device: Pixel 5 (recommended)
     - System Image: API 33 (Android 13) x86_64
     - Graphics: Automatic or Hardware - GLES 2.0

2. **Cold boot:**
   - Device Manager → Dropdown arrow → Cold Boot Now

3. **Check Windows Hyper-V:**
   ```powershell
   # Run as Administrator
   bcdedit /set hypervisorlaunchtype off
   # Restart PC
   ```

### Error 5: "ADB not found" or connection issues

**Solution:**
1. **Verify ADB path:**
   ```powershell
   adb version
   # Should show version number
   ```

2. **Restart ADB:**
   ```powershell
   adb kill-server
   adb start-server
   adb devices
   ```

## Step-by-Step: Create Working Emulator

### After Installing Android Studio:

1. **Open Android Studio**
2. **Welcome Screen → More Actions → SDK Manager**
3. **Install Required Components:**
   - SDK Platforms → Android 13 (API 33) → Check "Google APIs x86_64"
   - SDK Tools → Check "Android Emulator"
   - Apply → Wait for download

4. **Create Emulator:**
   - Welcome Screen → Device Manager
   - Create Device
   - Select: **Pixel 5** (recommended)
   - Next → Select: **API 33 (Android 13)** → x86_64 Images tab
   - Download if needed
   - Next → Finish

5. **Start Emulator:**
   - Click **Play** button next to Pixel 5
   - Wait 1-2 minutes for first boot

6. **Verify:**
   ```powershell
   adb devices
   # Should show: emulator-5554    device
   ```

## Alternative: Use Physical Device (Easier!)

If emulator keeps failing:

1. **Enable USB Debugging on phone:**
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"

2. **Connect via USB**

3. **Accept USB Debugging prompt** on phone

4. **Verify:**
   ```powershell
   adb devices
   # Should show: ABC123XYZ    device
   ```

5. **Run app:**
   ```powershell
   npx expo run:android
   ```

## Quick Workaround: Use Expo Dev Server (No Emulator Needed!)

**You don't need emulator for development:**

```powershell
# Start dev server
npx expo start --clear

# Options:
# - Press 'a' to open on Android (if device connected)
# - Scan QR code with Expo Go app
# - Press 'w' to open in web browser
```

This works immediately without emulator!

## Check Emulator Status

```powershell
# Check if emulator is running
adb devices

# If emulator shows "offline":
adb kill-server
adb start-server
adb devices

# Check emulator logs (if crashing):
# Android Studio → View → Tool Windows → Logcat
```

## Recommended Emulator Settings

When creating emulator, use these settings:

- **Device:** Pixel 5 (most compatible)
- **System Image:** API 33 (Android 13) - x86_64
- **RAM:** 2048 MB (minimum), 4096 MB (recommended)
- **Graphics:** Hardware - GLES 2.0
- **Storage:** 2048 MB minimum

## Still Having Issues?

1. **Check Android Studio logs:**
   - Help → Show Log in Explorer
   - Check `idea.log` for errors

2. **Try different emulator:**
   - Use Pixel 6 instead of Pixel 5
   - Try API 34 instead of API 33

3. **Reinstall Android Studio:**
   - Uninstall completely
   - Delete `C:\Users\YourName\AppData\Local\Android`
   - Reinstall fresh

4. **Use WSL2** (if Windows issues persist):
   - Install WSL2
   - Run emulator in WSL2

## Summary

**For Development (Easiest):**
```powershell
npx expo start --clear
# No emulator needed!
```

**For Maestro Testing:**
- Need emulator OR physical device
- Follow emulator setup steps above
- Or use physical device (easier!)
