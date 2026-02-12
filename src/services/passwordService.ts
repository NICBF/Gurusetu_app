/**
 * Password reset API service.
 * Matches API docs: POST /api/forgot-password, POST /api/verify-reset-code, POST /api/reset-password, POST /api/change-password
 */
import axios from 'axios';
import api from './api';
import { API_BASE } from '../config';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  user_not_found?: boolean;
  email_sent?: boolean;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface VerifyResetCodeResponse {
  message: string;
  verified: boolean;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

// Public API base URL (no auth)
const rawBase = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
const baseURL = rawBase.endsWith('/api') ? rawBase : rawBase ? `${rawBase}/api` : '';

/**
 * Request password reset (no auth required)
 * POST /api/forgot-password
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const { data } = await axios.post<ForgotPasswordResponse>(`${baseURL}/forgot-password`, { email });
  return data;
}

/**
 * Verify reset code (no auth required)
 * POST /api/verify-reset-code
 */
export async function verifyResetCode(email: string, code: string): Promise<VerifyResetCodeResponse> {
  const { data } = await axios.post<VerifyResetCodeResponse>(`${baseURL}/verify-reset-code`, { email, code });
  return data;
}

/**
 * Reset password with code (no auth required)
 * POST /api/reset-password
 */
export async function resetPassword(email: string, code: string, newPassword: string): Promise<ResetPasswordResponse> {
  const { data } = await axios.post<ResetPasswordResponse>(`${baseURL}/reset-password`, {
    email,
    code,
    new_password: newPassword,
  });
  return data;
}

/**
 * Change password (requires auth)
 * POST /api/change-password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<ChangePasswordResponse> {
  const { data } = await api.post<ChangePasswordResponse>('/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return data;
}
