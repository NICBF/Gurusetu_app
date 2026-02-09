/**
 * Environment-based config. No secrets committed.
 * Use .env (gitignored) with EXPO_PUBLIC_API_URL for dev/prod.
 * Also reads from app.config.js extra.apiUrl (set via dotenv).
 */
import Constants from 'expo-constants';

const getApiBase = (): string => {
  const fromExtra = (Constants.expoConfig as { extra?: { apiUrl?: string } } | null)?.extra?.apiUrl;
  const url = fromExtra ?? process.env.EXPO_PUBLIC_API_URL ?? '';
  const base = typeof url === 'string' ? url.trim() : '';
  if (base && !base.startsWith('http')) return '';
  return base.replace(/\/+$/, '');
};

export const API_BASE = getApiBase();

export const isDev = (): boolean =>
  __DEV__ ?? process.env.NODE_ENV !== 'production';
