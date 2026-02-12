# Fix: App Taking Too Long to Open

## Why It's Slow

The app has **intentional delays** built in:

1. **IntroScreen Minimum Time:** `MIN_INTRO_MS = 2500` (2.5 seconds)
   - Location: `src/navigation/AppNavigator.tsx`
   - Purpose: Ensures IntroScreen shows for at least 2.5 seconds

2. **Auth Loading:** `isLoading` from AuthContext
   - Checks AsyncStorage for token
   - May take additional time

3. **First-Time Bundle Download:**
   - If using Expo Go, first load downloads entire bundle
   - Subsequent loads are faster (cached)

## Quick Fixes

### Fix 1: Reduce Intro Delay (Development Only)

**For faster development, reduce the intro delay:**

Edit `src/navigation/AppNavigator.tsx`:

```typescript
// Change this:
const MIN_INTRO_MS = 2500;

// To this (for development):
const MIN_INTRO_MS = 500; // Or even 0 for instant
```

**Remember to change back before production!**

### Fix 2: Use Development Build Instead of Expo Go

Expo Go downloads bundle every time. Development build is faster:

```powershell
# Build development APK (one time)
npx expo run:android

# Then app opens much faster on subsequent launches
```

### Fix 3: Clear Cache and Rebuild

If app is slow even after first load:

```powershell
# Clear Metro cache
npx expo start --clear

# Clear Android build cache
cd android
.\gradlew clean
cd ..

# Rebuild
npx expo run:android
```

### Fix 4: Check Network Connection

Slow network = slow bundle download:

```powershell
# Use USB instead of Wi-Fi
adb reverse tcp:8081 tcp:8081

# Then start Expo
npx expo start --clear
```

### Fix 5: Optimize Auth Loading

If AuthContext is slow, check AsyncStorage access:

```typescript
// In AuthContext.tsx, ensure AsyncStorage is fast
// Consider caching token in memory after first load
```

## Normal Startup Times

- **First Launch (Expo Go):** 10-30 seconds (downloading bundle)
- **Subsequent Launches (Expo Go):** 3-5 seconds (cached bundle)
- **Development Build:** 2-5 seconds (native, faster)
- **Production Build:** 1-3 seconds (optimized)

## What's Happening During Startup

1. **Bundle Download** (if Expo Go, first time only)
2. **IntroScreen Display** (minimum 2.5 seconds)
3. **Auth Check** (AsyncStorage read)
4. **Navigation Setup**
5. **Component Rendering**

## Performance Tips

### For Development:

1. **Reduce intro delay:**
   ```typescript
   const MIN_INTRO_MS = 500; // Development only
   ```

2. **Skip intro in dev:**
   ```typescript
   const MIN_INTRO_MS = __DEV__ ? 0 : 2500;
   ```

3. **Use development build** instead of Expo Go

### For Production:

Keep `MIN_INTRO_MS = 2500` for proper UX.

## Check Current Status

```powershell
# Check if bundle is downloading
# Look for "Downloading JavaScript bundle" in Expo terminal

# Check device connection speed
adb shell ping -c 3 8.8.8.8

# Check Metro bundler
# Should see "Metro waiting on exp://..." when ready
```

## Summary

**The 2.5 second delay is intentional** (IntroScreen minimum time).

**To speed up development:**
- Reduce `MIN_INTRO_MS` to 500 or 0
- Use development build instead of Expo Go
- Clear cache if needed

**Normal startup:** 3-5 seconds is normal for Expo Go after first load.
