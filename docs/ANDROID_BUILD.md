# Android build — pre-check, build, and APK

Use this before and when building the Android app with EAS (internal APK).

---

## 1. Pre-build: align dependencies

Run from the project root so Expo SDK and dependencies match (avoids build failures like `react-native-webview` version mismatch).

```bash
npx expo install --check
```

Fix any reported packages (it may suggest `npx expo install <package>@<version>`). Then:

```bash
npx expo doctor
```

All checks should pass. If one fails, follow the printed advice (e.g. pin a package version in `package.json`, then `npm install`).

---

## 2. Build the Android APK

From the project root:

```bash
eas build --profile internal --platform android
```

Or use the npm script:

```bash
npm run build:internal
```

- **Profile:** `internal` (see `eas.json`) — builds a signed **APK** for internal distribution (no Play Store).
- **EAS login:** Run `eas login` first if you haven’t.
- **Env/API URL:** Set `EXPO_PUBLIC_API_URL` in EAS Secrets or in `eas.json` under the profile’s `env` if the build must use a specific backend.

---

## 3. Get the Android file (APK)

1. When the build finishes, EAS prints a **build URL** (or open [expo.dev](https://expo.dev) → your project → **Builds**).
2. Open the **Android** build (status: finished).
3. Use **Download** (or “Download build”) to get the **`.apk`** file.
4. Share this `.apk` internally (link, MDM, or file share). Users install it on Android devices (Install from unknown sources allowed if needed).

**Build artifact:** one `.apk` file per successful build (e.g. `build-xxxx.apk` or similar from the EAS dashboard).

---

## Android build config (eas.json)

The **internal** profile used for the APK is defined in the project root as:

```json
"internal": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  },
  "env": {}
}
```

- `distribution: "internal"` — for internal distribution (no Play Store).
- `android.buildType: "apk"` — produces an APK (not AAB). Production profile can use `"app-bundle"` for Play Store.

---

## Quick reference

| Step              | Command |
|-------------------|--------|
| Check dependencies | `npx expo install --check` |
| Run doctor        | `npx expo doctor` |
| Install deps      | `npm install` |
| Build Android APK | `eas build --profile internal --platform android` or `npm run build:internal` |
| Get APK           | EAS dashboard → Builds → your Android build → Download |

For USB dev, backend check, and more build options, see **[BUILD.md](../BUILD.md)** and **[INTERNAL_DEPLOYMENT.md](../INTERNAL_DEPLOYMENT.md)**.
