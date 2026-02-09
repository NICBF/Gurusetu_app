/**
 * Auth context: token, role, login, logout. Role from JWT or stored value.
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getToken, setToken, getStoredRole, setStoredRole, clearAuth } from './storage';
import { decodeRoleFromToken } from './jwt';
import { setOnUnauthorized } from './authStore';

export type Role = 'Learner' | 'Professor' | 'admin' | null;

type AuthState = {
  token: string | null;
  role: Role;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshRole: () => Promise<void>;
};

const defaultState: AuthState = {
  token: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeRole(raw: string | null): Role {
  if (!raw) return null;
  const r = raw.toLowerCase();
  if (r === 'admin') return 'admin';
  if (r === 'prof' || r === 'professor' || r === 'instructor') return 'Professor';
  if (r === 'student' || r === 'learner') return 'Learner';
  return raw as Role;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);

  const refreshRole = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setState((s) => ({ ...s, token: null, role: null, isAuthenticated: false, isLoading: false }));
      return;
    }
    const fromJwt = decodeRoleFromToken(token);
    const role = normalizeRole(fromJwt);
    if (role) await setStoredRole(role);
    const storedRole = await getStoredRole();
    setState((s) => ({ ...s, token, role: role ?? normalizeRole(storedRole), isAuthenticated: true, isLoading: false }));
  }, []);

  useEffect(() => {
    let mounted = true;
    const safetyTimeout = setTimeout(() => {
      if (mounted) setState((s) => (s.isLoading ? { ...s, isLoading: false } : s));
    }, 5000);

    (async () => {
      try {
        const token = await getToken();
        if (!mounted) return;
        if (!token) {
          setState((s) => ({ ...s, isLoading: false }));
          return;
        }
        const fromJwt = decodeRoleFromToken(token);
        const role = normalizeRole(fromJwt);
        if (role) await setStoredRole(role);
        const storedRole = await getStoredRole();
        setState({
          token,
          role: role ?? normalizeRole(storedRole),
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (e) {
        console.error('Auth init error:', e);
        if (mounted) setState((s) => ({ ...s, isLoading: false, isAuthenticated: false }));
      }
    })();

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
    };
  }, []);

  const login = useCallback(async (token: string) => {
    await setToken(token);
    const role = normalizeRole(decodeRoleFromToken(token));
    if (role) await setStoredRole(role);
    setState({ token, role, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
    setState({ ...defaultState, isLoading: false });
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => { logout(); });
  }, [logout]);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
