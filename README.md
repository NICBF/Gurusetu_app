# Gurusetu Mobile App

React Native (Expo) app — **Android only for now** (single codebase, TypeScript).  
Consumes existing Gurusetu HTTPS REST APIs; backend and live website are **read-only** and unchanged.

**No Google Play registration needed.** Distribute the APK directly (internal / sideload).

iOS is not in scope for now (would require Apple Developer / App Store setup).

## Requirements

- Node 18+
- **Android only:** Android Platform Tools (adb), `ANDROID_HOME` and PATH — see [docs/WINDOWS_ANDROID_SETUP.md](docs/WINDOWS_ANDROID_SETUP.md)
- API base URL (e.g. `https://gurusetu.iitm.ac.in`)

## Setup

```bash
cd E:\gsgs\gurusetu_mobile_app
npm install
cp .env.example .env
# Edit .env: set EXPO_PUBLIC_API_URL to your backend base URL (HTTPS).
```

## Run (development)

```bash
npm start
# Then: npm run android  OR  npm run ios
```

**Note:** Web is not supported; use only Android and iOS targets.

## Project structure

```
src/
  config/       # Env-based API base (no secrets)
  auth/          # Token storage, JWT role decode, AuthContext, logout on 401
  services/      # Central Axios API + authService (login)
  navigation/    # Role-based stacks (Faculty / Student)
  screens/       # Login, dashboards, course list/detail, videos, notifications
  components/    # Reusable UI (optional)
  utils/         # Helpers
```

## Security

- All requests use HTTPS and `Authorization: Bearer <token>`.
- Token and role stored in AsyncStorage; cleared on 401.
- Role-based access: app enforces faculty vs student flows; backend returns role in JWT.

## Build & distribution

- **Android:** Signed APK for internal distribution only (no Play Store). See [BUILD.md](./BUILD.md).
- **iOS:** TestFlight / Ad Hoc only; not listed on App Store. See [BUILD.md](./BUILD.md).

## Phase 1 scope

- Login (learner / professor / admin)
- Role-based dashboard (faculty / student)
- View assigned or enrolled courses
- View recorded videos (list; playback via backend API)
- View live class details (read-only)
- Notifications (UI-ready; backend-triggered push can be added later)

## Repository

[NICBF/Gurusetu_app](https://github.com/NICBF/Gurusetu_app)
