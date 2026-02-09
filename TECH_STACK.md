# Technology Stack & Tools

Complete list of technologies, frameworks, libraries, and tools used to build the Gurusetu Mobile App.

**GitHub Repository:** [https://github.com/NICBF/Gurusetu_app](https://github.com/NICBF/Gurusetu_app)

---

## 📱 Frontend (Mobile App) - Technology Stack

| Category | Tool/Technology | Version | Purpose | Official Documentation |
|----------|----------------|---------|---------|----------------------|
| **Core Framework** | React Native | `0.81.5` | Cross-platform mobile app framework | [reactnative.dev](https://reactnative.dev/) |
| **Core Framework** | Expo | `~54.0.33` | Toolchain and platform for React Native | [docs.expo.dev](https://docs.expo.dev/) |
| **Core Framework** | React | `19.1.0` | JavaScript library for building UIs | [react.dev](https://react.dev/) |
| **Language** | TypeScript | `5.9.2` | Typed superset of JavaScript | [typescriptlang.org](https://www.typescriptlang.org/) |
| **Navigation** | React Navigation (Native) | `^7.1.28` | Routing and navigation library | [reactnavigation.org](https://reactnavigation.org/) |
| **Navigation** | React Navigation (Native Stack) | `^7.12.0` | Stack navigator for React Navigation | [reactnavigation.org](https://reactnavigation.org/) |
| **Navigation** | react-native-screens | `~4.16.0` | Native navigation primitives | [GitHub](https://github.com/software-mansion/react-native-screens) |
| **Navigation** | react-native-safe-area-context | `^5.6.2` | Safe area handling (notches, status bars) | [GitHub](https://github.com/th3rdwave/react-native-safe-area-context) |
| **HTTP Client** | Axios | `^1.13.5` | Promise-based HTTP client for API requests | [axios-http.com](https://axios-http.com/) |
| **Storage** | AsyncStorage | `^2.2.0` | Asynchronous persistent key-value storage | [async-storage.github.io](https://react-native-async-storage.github.io/async-storage/) |
| **Configuration** | dotenv | `^17.2.4` | Loads environment variables from `.env` | [GitHub](https://github.com/motdotla/dotenv) |
| **Configuration** | expo-constants | `^18.0.13` | System information and app config constants | [docs.expo.dev](https://docs.expo.dev/versions/latest/sdk/constants/) |
| **UI Components** | expo-status-bar | `~3.0.9` | Component to control status bar appearance | [docs.expo.dev](https://docs.expo.dev/versions/latest/sdk/status-bar/) |
| **Type Definitions** | @types/react | `~19.1.0` | TypeScript type definitions for React | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |

---

## 🔧 Frontend Development Tools

| Tool | Version/Requirement | Purpose | Official Link |
|------|---------------------|---------|---------------|
| **Node.js** | `18+` | JavaScript runtime environment | [nodejs.org](https://nodejs.org/) |
| **npm** | Latest (comes with Node.js) | Package manager for Node.js | [npmjs.com](https://www.npmjs.com/) |
| **Android Platform Tools (adb)** | Latest | Command-line tools for Android development | [developer.android.com](https://developer.android.com/tools/releases/platform-tools) |
| **EAS CLI** | Latest | Expo Application Services CLI for builds | [docs.expo.dev](https://docs.expo.dev/build/introduction/) |

---

## 🔌 Backend API (Consumed by Mobile App)

**Note:** The mobile app consumes an existing backend API. The backend is a separate repository and is **read-only** from this app's perspective.

| Category | Technology/Protocol | Details | API Endpoint |
|----------|-------------------|---------|--------------|
| **API Base URL** | HTTPS REST API | Production backend server | `https://gurusetu.iitm.ac.in/api` |
| **Authentication** | JWT (JSON Web Tokens) | Token-based authentication | `/api/login`, `/api/login/learner`, `/api/login/professor`, `/api/login/admin` |
| **Protocol** | HTTPS | Secure HTTP protocol | All endpoints use HTTPS |
| **API Format** | REST API | RESTful API endpoints | JSON request/response |
| **Endpoints Used** | Various | Login, Courses, Videos, Notifications | See API endpoints below |

### Backend API Endpoints Consumed

| Endpoint | Method | Purpose | Used In |
|----------|--------|---------|---------|
| `/api/login` | POST | General login (backward compatibility) | LoginScreen |
| `/api/login/learner` | POST | Learner/Student login | LoginScreen |
| `/api/login/professor` | POST | Professor/Faculty login | LoginScreen |
| `/api/login/admin` | POST | Admin login | LoginScreen |
| `/api/me` | GET | Get current user info | AuthService |
| `/api/my-courses` | GET | Get student's enrolled courses | CourseListScreen |
| `/api/instructor/courses` | GET | Get instructor's courses | CourseListScreen |
| `/api/courses/{id}` | GET | Get course details | CourseDetailScreen |
| `/api/courses/{id}/lectures` | GET | Get course lectures/videos | VideoListScreen |
| `/api/notifications/new-lectures` | GET | Get new lecture notifications | NotificationsScreen |
| `/api/notifications/new-assignments` | GET | Get new assignment notifications | NotificationsScreen |
| `/api/health` | GET | Backend health check | check-backend script |

---

## 📊 Technology Stack Summary Table

| Layer | Technology | Version | Type |
|-------|-----------|---------|------|
| **Mobile Framework** | React Native | `0.81.5` | Framework |
| **Development Platform** | Expo | `~54.0.33` | Platform |
| **UI Library** | React | `19.1.0` | Library |
| **Language** | TypeScript | `5.9.2` | Language |
| **Navigation** | React Navigation | `^7.1.28` | Library |
| **HTTP Client** | Axios | `^1.13.5` | Library |
| **Storage** | AsyncStorage | `^2.2.0` | Library |
| **Runtime** | Node.js | `18+` | Runtime |
| **Package Manager** | npm | Latest | Tool |
| **Build Service** | EAS (Expo) | Latest | Service |
| **Backend API** | REST API (HTTPS) | - | Protocol |
| **Authentication** | JWT | - | Standard |

---

## 🏗️ Project Architecture

### File Structure
```
src/
  ├── auth/          # Authentication (JWT, storage, context)
  ├── config/        # Environment configuration
  ├── navigation/    # React Navigation setup
  ├── screens/       # App screens (Login, Dashboards, Courses, etc.)
  ├── services/      # API services (Axios, authService)
  ├── components/    # Reusable UI components
  └── utils/         # Helper functions
```

### State Management
- **React Context API** (for authentication state)
- **Local State** (useState hooks for component state)

### Styling
- **React Native StyleSheet API** (inline styles)
- No external CSS frameworks (native styling only)

---

## 🔐 Security & Authentication

| Technology | Purpose | Implementation |
|-----------|---------|----------------|
| **JWT (JSON Web Tokens)** | User authentication tokens | Tokens received from backend API |
| **HTTPS** | Secure API communication | All API calls use HTTPS |
| **Bearer Token** | Authorization header | `Authorization: Bearer <token>` |
| **AsyncStorage** | Secure token storage | Tokens stored locally on device |
| **Token Expiry Handling** | Auto-logout on 401 | Interceptor clears auth on token expiry |

---

## 📱 Platform Support

| Platform | Status | Development Method | Distribution |
|----------|--------|-------------------|--------------|
| **Android** | ✅ Fully Supported | USB debugging (adb), Expo Go, Dev Build | Signed APK (internal) |
| **iOS** | ⚠️ Code Ready | iOS Simulator (macOS), Expo Go | TestFlight/Ad Hoc |
| **Web** | ❌ Not Supported | - | - |

---

## 🔗 Quick Reference Links

### Frontend Technologies
- **React Native:** [reactnative.dev](https://reactnative.dev/)
- **Expo:** [docs.expo.dev](https://docs.expo.dev/)
- **React:** [react.dev](https://react.dev/)
- **TypeScript:** [typescriptlang.org](https://www.typescriptlang.org/)
- **React Navigation:** [reactnavigation.org](https://reactnavigation.org/)
- **Axios:** [axios-http.com](https://axios-http.com/)

### Development Tools
- **Node.js:** [nodejs.org](https://nodejs.org/)
- **npm:** [npmjs.com](https://www.npmjs.com/)
- **Android Platform Tools:** [developer.android.com](https://developer.android.com/tools/releases/platform-tools)
- **EAS Build:** [docs.expo.dev/build](https://docs.expo.dev/build/introduction/)

### Project Repository
- **GitHub:** [https://github.com/NICBF/Gurusetu_app](https://github.com/NICBF/Gurusetu_app)

---

## 📝 Important Notes

1. **Backend Separation:** This mobile app consumes existing REST APIs (`https://gurusetu.iitm.ac.in/api/*`). The backend is a separate repository and remains unchanged.

2. **Read-Only Consumer:** The mobile app does not modify the backend. It only consumes API endpoints.

3. **Single Codebase:** One codebase supports both Android and iOS platforms (React Native).

4. **TypeScript:** Full TypeScript support for type safety and better developer experience.

5. **Environment Variables:** API base URL configured via `.env` file (`EXPO_PUBLIC_API_URL`).

6. **Authentication Flow:** JWT tokens stored locally, auto-refresh on API calls, auto-logout on 401.

---

**Last Updated:** February 2026  
**Repository:** [https://github.com/NICBF/Gurusetu_app](https://github.com/NICBF/Gurusetu_app)
