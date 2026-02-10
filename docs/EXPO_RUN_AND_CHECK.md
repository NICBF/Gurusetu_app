# Run Expo and check for errors

Use this **first** when developing: start the dev server, then run checks so the app and build stay healthy.

---

## 1. Run Expo (development server)

From the project root:

```bash
npx expo start --clear
```

Or:

```bash
npm start
```

Then:

- Press **`a`** to open on Android (device/emulator).
- **QR code:** Scan with Expo Go if you’re on the same Wi‑Fi (or use tunnel; see below).

**If you see a stuck prompt** (e.g. `Ctrl + C` then `npx expo start --clear` on the same line): run the command on a **new line** after stopping the previous process with `Ctrl + C`. Wait for the process to exit before typing the next command.

---

## 2. Check for errors (before coding or building)

Run these from the project root when things feel off or before a build.

### Dependency and SDK check

```bash
npx expo install --check
```

Fixes version mismatches (e.g. `react-native-webview`). If it suggests changes, run the command it prints (often `npx expo install <package>@<version>`), then:

```bash
npm install
```

### Full project check

```bash
npx expo doctor
```

All checks should pass. If one fails, follow the printed advice (e.g. pin a version in `package.json` and run `npm install` again).

### Backend reachable (optional)

```bash
npm run check-backend
```

Confirms `EXPO_PUBLIC_API_URL` (from `.env`) is reachable. If it fails, the app may show “Network error” on the device.

---

## 3. Quick reference

| Step              | Command |
|-------------------|--------|
| Start Expo        | `npx expo start --clear` or `npm start` |
| Open on Android   | Press **`a`** in the Expo terminal |
| Check dependencies | `npx expo install --check` |
| Run doctor        | `npx expo doctor` |
| Check backend     | `npm run check-backend` |

---

## 4. Common issues

- **“adb” not recognized / press `a` does nothing**  
  → Install Android Platform Tools and set `ANDROID_HOME` / PATH. See **[WINDOWS_ANDROID_SETUP.md](./WINDOWS_ANDROID_SETUP.md)**.

- **Device “unauthorized”**  
  → Unlock the phone and accept the USB debugging dialog.

- **Metro not reachable on device (no Wi‑Fi)**  
  → Use USB only: in a **second** terminal run `adb reverse tcp:8081 tcp:8081`, then press **`a`**. See **[BUILD.md](../BUILD.md)** (USB-only development).

- **Package version mismatch (e.g. in EAS build)**  
  → Run `npx expo install --check` and `npx expo doctor`, fix versions, then `npm install`. See **[ANDROID_BUILD.md](./ANDROID_BUILD.md)**.

- **Network error in app**  
  → Phone must reach the API URL. For production URL use Wi‑Fi/mobile data; for local backend see BUILD.md (same Wi‑Fi or adb reverse).

---

## 5. More docs

- **USB / adb setup (Windows):** [WINDOWS_ANDROID_SETUP.md](./WINDOWS_ANDROID_SETUP.md)
- **Build and backend:** [BUILD.md](../BUILD.md)
- **Android APK build and pre-check:** [ANDROID_BUILD.md](./ANDROID_BUILD.md)
