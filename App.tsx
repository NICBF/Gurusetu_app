/**
 * Root: ErrorBoundary + ThemeProvider + AuthProvider + AppNavigator.
 * App starts with IntroScreen; splash (purple) is kept until app is ready.
 */
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider } from './src/auth/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import GuruChatbot from './src/components/GuruChatbot';

function StatusBarThemed() {
  const { theme } = useTheme();
  return <StatusBar style={theme.isDarkMode ? 'light' : 'dark'} />;
}

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
      <ThemeProvider>
        <AuthProvider>
          <StatusBarThemed />
          <AppNavigator />
          <GuruChatbot />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
