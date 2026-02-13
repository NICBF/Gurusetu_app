/**
 * Environment-based config. No secrets committed.
 * Use .env (gitignored) with EXPO_PUBLIC_API_URL for dev/prod.
 * Also reads from app.config.js extra.apiUrl (set via dotenv).
 */
import Constants from 'expo-constants';

const DEFAULT_PRODUCTION_URL = 'https://gurusetu.iitm.ac.in';

const getApiBase = (): string => {
  const fromExtra = (Constants.expoConfig as { extra?: { apiUrl?: string } } | null)?.extra?.apiUrl;
  const url = fromExtra ?? process.env.EXPO_PUBLIC_API_URL ?? '';
  const base = typeof url === 'string' ? url.trim() : '';
  if (base && !base.startsWith('http')) return '';
  return base.replace(/\/+$/, '');
};

export const API_BASE = getApiBase();

/** Base URL for resolving relative media (thumbnails, images). Uses API_BASE with production fallback so thumbnails work in live app. */
export const getMediaBase = (): string => {
  const base = getApiBase();
  if (base) return base;
  return DEFAULT_PRODUCTION_URL;
};

export const isDev = (): boolean =>
  __DEV__ ?? process.env.NODE_ENV !== 'production';
