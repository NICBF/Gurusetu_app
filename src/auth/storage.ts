/**
 * Secure token and role storage. Uses AsyncStorage (no localStorage on RN).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@gurusetu_token';
const ROLE_KEY = '@gurusetu_role';

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getStoredRole(): Promise<string | null> {
  return AsyncStorage.getItem(ROLE_KEY);
}

export async function setStoredRole(role: string): Promise<void> {
  await AsyncStorage.setItem(ROLE_KEY, role);
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY]);
}

