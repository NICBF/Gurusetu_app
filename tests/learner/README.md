# Maestro Tests for Learner Flows

This folder contains Maestro test files for testing learner-specific functionality.

## Setup

1. **Install Maestro**: Download from https://maestro.mobile.dev

2. **Build Development APK**:
   ```bash
   npx expo run:android
   # OR
   eas build --profile development --platform android
   ```

3. **Install APK** on emulator or physical device

4. **Run Tests**:
   ```bash
   maestro test registration-flow.yaml
   maestro test login-flow.yaml
   maestro test course-access-flow.yaml
   maestro test video-player-flow.yaml
   maestro test complete-learner-journey.yaml
   ```

## Test Files

- `registration-flow.yaml` - Tests learner registration process
- `login-flow.yaml` - Tests login functionality
- `course-access-flow.yaml` - Tests browsing and accessing courses
- `video-player-flow.yaml` - Tests video player screen visibility
- `complete-learner-journey.yaml` - End-to-end learner flow

## App Package

Package ID: `in.ac.iitm.gurusetu`

## Limitations

⚠️ **Google Drive Player Controls**: Maestro cannot test controls inside Google Drive iframe (play, pause, seek) due to WebView sandbox restrictions. We can only test:
- ✅ Video screen loads
- ✅ WebView renders
- ✅ No crashes
- ✅ Navigation works
