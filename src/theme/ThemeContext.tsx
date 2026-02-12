/**
 * Global Dark/Light theme. Persisted via AsyncStorage.
 * Default: dark. Toggle in header updates all screens that use useTheme().
 */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@gurusetu_theme_dark';

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceCard: string;
  border: string;
  text: string;
  textMuted: string;
  textDim: string;
  primary: string;
  white: string;
  headerBackground: string;
  headerTint: string;
}

export interface Theme {
  isDarkMode: boolean;
  colors: ThemeColors;
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const darkColors: ThemeColors = {
  background: '#101622',
  backgroundSecondary: '#0f172a',
  surface: '#0f172a',
  surfaceCard: '#1e293b',
  border: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  primary: '#135bec',
  white: '#ffffff',
  headerBackground: '#101622',
  headerTint: '#f1f5f9',
};

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  backgroundSecondary: '#f6f6f8',
  surface: '#f1f5f9',
  surfaceCard: '#e2e8f0',
  border: '#cbd5e1',
  text: '#0f172a',
  textMuted: '#475569',
  textDim: '#64748b',
  primary: '#135bec',
  white: '#ffffff',
  headerBackground: '#FFFFFF',
  headerTint: '#0f172a',
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored !== null) {
          setIsDarkMode(stored === 'true');
        }
      } catch {
        // keep default
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, String(next)).catch(() => {});
      return next;
    });
  }, []);

  const theme: Theme = {
    isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
  };

  const value: ThemeContextValue = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
