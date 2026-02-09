/**
 * Login API calls. Backend: POST /api/login, /api/login/professor, /api/login/admin.
 */
import axios from 'axios';
import { API_BASE } from '../config';

// Normalize: backend routes are /api/login/..., so we need /api in path. API_BASE may or may not include /api.
const rawBase = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
const baseURL = rawBase.endsWith('/api') ? rawBase : rawBase ? `${rawBase}/api` : '';

export type LoginPayload = { email: string; password: string };

export type LoginResponse = { access_token: string; token_type?: string; user?: unknown };

function loginPath(role: 'learner' | 'professor' | 'admin'): string {
  if (role === 'admin') return '/login/admin';
  if (role === 'professor') return '/login/professor';
  return '/login/learner';
}

export async function login(
  email: string,
  password: string,
  role: 'learner' | 'professor' | 'admin' = 'learner'
): Promise<LoginResponse> {
  const url = `${baseURL}${loginPath(role)}`;
  if (__DEV__) console.log('[LOGIN] URL:', url);

  // Backend expects OAuth2PasswordRequestForm: username (not email) + password as form-data
  // FastAPI OAuth2PasswordRequestForm accepts both form-data and JSON, but expects 'username' field
  const payload = new URLSearchParams();
  payload.append('username', email);
  payload.append('password', password);
  
  const { data } = await axios.post<LoginResponse>(
    url,
    payload.toString(),
    { 
      timeout: 15000, 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' } 
    }
  );
  if (!data?.access_token) throw new Error('Login response missing token');
  return data;
}

export async function getMe(baseUrl: string, token: string): Promise<unknown> {
  const apiBase = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl.replace(/\/+$/, '')}/api`;
  const { data } = await axios.get(`${apiBase}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 10000,
  });
  return data;
}
