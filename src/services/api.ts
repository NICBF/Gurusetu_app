/**
 * Central Axios API service. All backend calls go through this.
 * Uses API_BASE from config (env). Normalizes so baseURL always ends with /api.
 */
import axios, { AxiosError } from 'axios';
import { API_BASE } from '../config';
import { getToken } from '../auth/storage';
import { triggerUnauthorized } from '../auth/authStore';

const rawBase = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
const baseURL = rawBase.endsWith('/api') ? rawBase : rawBase ? `${rawBase}/api` : '';

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request (async supported by Axios)
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// Handle 401: token expiry → clear auth so app can redirect to login
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) triggerUnauthorized();
    return Promise.reject(err);
  }
);

export default api;
