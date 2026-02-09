# Windows + Android USB setup for Gurusetu Mobile

Use this when **adb is not recognized** or **press `a` fails** in Expo.

## 1. Install Android Platform Tools (adb)

1. Download: [Platform Tools](https://developer.android.com/tools/releases/platform-tools)
2. Extract to `C:\Android\platform-tools`
3. Confirm `adb.exe` is inside that folder.

## 2. Environment variables

1. **Windows + S** → search **Environment Variables** → **Edit the system environment variables** → **Environment Variables**.
2. Under **System variables** → **New**:
   - **Variable name:** `ANDROID_HOME`
   - **Variable value:** `C:\Android`
3. Under **System variables** → select **Path** → **Edit** → **New** → add:
   - `C:\Android\platform-tools`
4. **OK** on all dialogs, then **restart the PC**.

## 3. Verify adb

Open a **new** PowerShell/CMD:

```bash
adb version
# Expect: Android Debug Bridge version x.x.x

adb devices
# Connect phone via USB; expect "device" (if "unauthorized", unlock phone and accept popup)
```

## 4. Phone: USB debugging

- **Settings** → **About phone** → tap **Build number** 7 times.
- **Settings** → **Developer options** → enable **USB debugging** and **Install via USB**.

## 5. Run Expo with USB (local)

In project folder:

```bash
npx expo start --clear
```

When Metro is ready, in **another** terminal:

```bash
adb reverse tcp:8081 tcp:8081
```

Back in the Expo terminal, press **`a`**. The app should open on the phone.

## If you can’t fix adb yet (temporary)

```bash
npx expo start --tunnel
```

Scan the QR code with Expo Go; works without adb (uses Expo’s tunnel).
