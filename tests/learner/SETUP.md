# Maestro Testing Setup Guide

## Prerequisites

1. **Install Maestro**: Download from https://maestro.mobile.dev
   - Windows: Download installer and add to PATH
   - Verify: `maestro --version`

2. **Build Development APK**:
   ```bash
   # Option 1: Using Expo CLI
   npx expo run:android
   
   # Option 2: Using EAS Build
   eas build --profile development --platform android
   ```

3. **Install APK**:
   - On emulator: Drag APK to emulator window
   - On physical device: `adb install path/to/app.apk`

## Test Files

All test files are in `tests/learner/`:

- `registration-flow.yaml` - Tests learner registration
- `login-flow.yaml` - Tests login functionality  
- `course-access-flow.yaml` - Tests browsing and accessing courses
- `video-player-flow.yaml` - Tests video player screen visibility
- `complete-learner-journey.yaml` - End-to-end learner flow

## Running Tests

### Single Test
```bash
maestro test tests/learner/registration-flow.yaml
```

### All Tests
```bash
maestro test tests/learner/
```

### With Screenshots
```bash
maestro test tests/learner/complete-learner-journey.yaml --format junit
```

## Test Credentials

Update test files with your test credentials:
- Email: `test.learner@example.com`
- Password: `TestPassword123`

Or use environment variables in Maestro config.

## Limitations

⚠️ **Google Drive Player Controls**: Maestro cannot test controls inside Google Drive iframe (play, pause, seek) due to WebView sandbox restrictions.

**What we CAN test:**
- ✅ Video screen loads
- ✅ WebView renders
- ✅ No crashes
- ✅ Navigation works
- ✅ UI elements visibility

**What we CANNOT test:**
- ❌ Play/pause buttons inside Drive player
- ❌ Seek bar inside Drive
- ❌ Fullscreen inside Drive
- ❌ Video playback state

## Test IDs Added

### Components with testIDs:
- `DriveVideoPlayer`: `drive-video-player`, `drive-webview`, `video-loading`, `video-error`
- `RegisterScreen`: `registration-form`, `email-input`, `password-input`, `confirm-password-input`, `create-account-button`, `role-learner-button`, `role-professor-button`, `sign-in-link`
- `LoginScreen`: `login-form`, `institutional-id-input`, `password-input`, `sign-in-button`, `login-role-learner`, `login-role-professor`, `login-role-admin`, `register-link`
- `CourseDetailScreen`: `course-video-player`, `course-thumbnail`, `rate-session-button`
- `LearnerHomeScreen`: `course-card-{id}` (dynamic)

## Troubleshooting

1. **Test fails to find element**: Check testID is correct in component
2. **APK not found**: Ensure APK is installed: `adb shell pm list packages | grep gurusetu`
3. **WebView not loading**: Check network connectivity and API URL
4. **Screenshots not saving**: Check write permissions in test directory

## CI/CD Integration

For CI/CD, use Maestro Cloud or run tests in headless mode:
```bash
maestro test tests/learner/ --format junit --output results.xml
```
