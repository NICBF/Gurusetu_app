# Gurusetu Mobile — Build & Distribution

Backend is **read-only**. This app consumes existing HTTPS REST APIs only.

---

## USB-only development (no Wi-Fi, LAN over USB)

When you have **no Wi-Fi** and the phone is connected by USB, Expo can only talk to the device via **adb reverse**. This is the only option; QR code and LAN IP will not work.

**Prerequisites:** Android Platform Tools installed, `adb` in PATH, `ANDROID_HOME` set (e.g. `C:\Android`, with `C:\Android\platform-tools` on PATH). Restart PC after changing env vars.

1. **Start Metro:**
   ```bash
   npx expo start --clear
   ```
2. **In a second terminal**, forward Metro port so the device can reach it over USB:
   ```bash
   npm run adb-reverse
   ```
   (Or run: `adb reverse tcp:8081 tcp:8081`.)
3. **Verify:** `adb reverse --list` should show `tcp:8081 tcp:8081`.
4. In the Expo terminal, press **`a`** to open the app on the device. It will use `exp://localhost:8081` — no Wi-Fi needed.

**If `adb devices` shows "unauthorized":** Unlock the phone and accept the USB debugging dialog. Ensure **USB debugging** and **Install via USB** are on; USB mode: **File Transfer (MTP)**.

---

## App start (IntroScreen and splash)

The app is designed to **start with IntroScreen only** (opening + loading). The native splash screen is set to the same purple as IntroScreen (`#667eea`) so the transition looks seamless.

- **In Expo Go:** The first screen you see (“Loading from…”, app name, “New update available, downloading…”) is **Expo Go’s** own loading UI while it fetches the JS bundle. It is not part of this project and cannot be changed. IntroScreen is part of that bundle, so it cannot run until the bundle has loaded. As soon as it has, the first screen our app renders is **IntroScreen**.
- **In a built app** (development build or production): The first screen is the **purple splash** (same look as IntroScreen), then IntroScreen, then Login when loading finishes. To get this “intro from the very first frame” experience, use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) or a release build instead of Expo Go.

---

## Check if backend is connected

From the **PC** (in the mobile app folder):

```bash
npm run check-backend
```

This hits `EXPO_PUBLIC_API_URL` from your `.env` (e.g. `https://gurusetu.iitm.ac.in/api/health`). If it prints **OK** and a status, the backend is reachable from your machine. If it fails, the backend is down or the URL is wrong.

**"Network error" on the device** means the **phone** cannot reach the API URL:

- **Production URL** (`https://gurusetu.iitm.ac.in`): The phone needs internet (Wi‑Fi or mobile data). No USB setting fixes this.
- **Local backend on your PC**: The app must call your PC’s address, not `localhost` (on the phone, `localhost` is the phone itself).
  - **Same Wi‑Fi:** In `.env` set `EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:8000` (e.g. `http://10.21.33.21:8000`). Replace `8000` with the port your backend uses.
  - **USB only (no Wi‑Fi):** Run the backend on the PC, then with the device connected and `adb devices` showing the device, run:
    ```bash
    adb reverse tcp:8081 tcp:8081
    adb reverse tcp:8000 tcp:8000
    ```
    In `.env` set `EXPO_PUBLIC_API_URL=http://localhost:8000`. The phone’s `localhost` will then go to the PC. Restart the Expo app after changing `.env`.

---

## Android: Signed APK (internal distribution)

**Full steps (build, share, install, updates):** see **[INTERNAL_DEPLOYMENT.md](./INTERNAL_DEPLOYMENT.md)**.

1. **Install EAS CLI** (Expo Application Services):
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure project** (first time):
   ```bash
   cd E:\gsgs\gurusetu_mobile_app
   eas build:configure
   ```
   Choose Android; skip iOS if only building APK.

3. **Build APK** (no Play Store): use the **internal** profile for a signed APK:
   ```bash
   eas build --profile internal --platform android
   ```
   Or: `npm run build:internal`. Set `EXPO_PUBLIC_API_URL` in EAS Secrets (or `eas.json` env) so the APK uses your production backend.

   For a **local** development build without EAS:
   ```bash
   npx expo prebuild
   cd android && ./gradlew assembleRelease
   ```
   Signing: create a keystore and set `android/gradle.properties` / `android/app/build.gradle` with `storeFile`, `storePassword`, `keyAlias`, `keyPassword`. Do not commit these.

4. **Distribute**: Share the generated `.apk` file internally (e.g. via internal link or MDM). No Google Play Store.

---

## iOS: Private distribution (TestFlight / Ad Hoc)

1. **Apple Developer account** required (e.g. IIT org account).

2. **Configure EAS for iOS**:
   ```bash
   eas build:configure
   ```
   Select iOS; add your Apple Team ID and provisioning.

3. **TestFlight** (recommended for testers):
   ```bash
   eas build --platform ios --profile preview
   eas submit --platform ios --latest
   ```
   In App Store Connect, use the build for **TestFlight** (internal testing). App is **not** submitted to the public App Store.

4. **Ad Hoc** (devices only):
   In `eas.json` use a profile with `"distribution": "internal"` and appropriate provisioning profile for ad hoc. Install via link or MDM.

5. **Not listed on App Store**: Do not complete “Submit for Review” in App Store Connect; use only TestFlight / internal distribution.

---

## Environment

- Set `EXPO_PUBLIC_API_URL` for API base (e.g. in EAS Build secrets or `.env`; see `.env.example`).
- No secrets in repo; use EAS Secrets or local `.env` (gitignored).

---

## Optional backend improvements (comments only; do not implement here)

- Optional: dedicated mobile login endpoint returning a long-lived refresh token.
- Optional: push notification registration endpoint and FCM/APNs keys for backend-triggered notifications.
- Optional: API version prefix (e.g. `/api/v1`) for future compatibility.
