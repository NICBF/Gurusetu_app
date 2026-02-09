/**
 * Root: ErrorBoundary + AuthProvider + AppNavigator. No Expo Web; Android & iOS only.
 * App starts with IntroScreen; splash (purple) is kept until app is ready.
 */
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthProvider } from './src/auth/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Keep native splash (purple, matches IntroScreen) visible until our app has mounted
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    // Hide splash as soon as we're about to show IntroScreen
    const t = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}
