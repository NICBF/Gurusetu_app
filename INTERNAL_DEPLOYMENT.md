# Internal Android APK Deployment (Faculty / Staff)

This app is **internal-only**: no Play Store, installed manually, Android only. Backend is already live (Docker); treat it as a fixed external API.

## Prerequisites

- Node.js and npm installed
- EAS CLI: `npm install -g eas-cli`
- Expo account: `eas login`
- Project linked to EAS: `eas build:configure` (if not already)

## 1. Set production API URL for the build

The APK must point at your live backend. Set env vars in EAS (used at build time):

**Option A – EAS project secrets (recommended)**  
In [expo.dev](https://expo.dev) → your project → Secrets:

- `EXPO_PUBLIC_API_URL` = `https://gurusetu.iitm.ac.in` (or your production API base, no trailing slash)
- Optional: `EXPO_PUBLIC_CHATBOT_API_URL` = your chatbot base URL if different

**Option B – eas.json**  
Under `build.internal.env`:

```json
"internal": {
  "distribution": "internal",
  "android": { "buildType": "apk" },
  "env": {
    "EXPO_PUBLIC_API_URL": "https://gurusetu.iitm.ac.in"
  }
}
```

## 2. Build the APK

From the project root:

```bash
eas build --profile internal --platform android
```

- Build runs in the cloud; no Android Studio required.
- When finished, download the **APK** from the EAS build page (not the AAB).

## 3. Share the APK

Distribute the APK via:

- Google Drive / internal file share  
- SFTP / internal portal  
- Any channel your faculty use  

Do **not** upload to the Play Store.

## 4. How faculty install the APK

1. **Allow installs from unknown sources**  
   Settings → Security (or Apps) → enable “Install unknown apps” for the browser or file manager they use.

2. **Open the APK**  
   Download from the link you shared and tap the APK file.

3. **Install**  
   Follow the prompts; no Google account needed for installation.

## 5. Releasing updates

To ship a new version over the previous internal install:

1. **Bump version in `app.json`:**
   - `version`: e.g. `"1.0.0"` → `"1.0.1"` (user-visible).
   - `expo.android.versionCode`: e.g. `1` → `2` (must increase every release).

2. **Keep `expo.android.package` unchanged**  
   Same value as current app (e.g. `in.ac.iitm.gurusetu`). Do not change the applicationId.

3. **Rebuild and redistribute:**
   ```bash
   eas build --profile internal --platform android
   ```
   Share the new APK as in step 3. Faculty install the new APK; it will replace the old app as an update.

## Summary

| Step            | Command / action |
|-----------------|------------------|
| Set API URL     | EAS Secrets or `eas.json` → `build.internal.env` |
| Build APK       | `eas build --profile internal --platform android` |
| Get APK         | Download from EAS build page (APK, not AAB) |
| Distribute      | Drive / SFTP / internal portal |
| Faculty install | Enable unknown sources → open APK → Install |
| Update          | Increment `version` and `versionCode`, same `package`, rebuild, re-share APK |
