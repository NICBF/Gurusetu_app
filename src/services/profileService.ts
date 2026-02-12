/**
 * Profile API service.
 * Matches API docs: GET /api/me, PUT /api/update-profile, POST /api/update-password, DELETE /api/delete-account
 */
import api from './api';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  profile_picture_url?: string;
  institution?: string;
  country?: string;
  state?: string;
  bio?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface UpdateProfileRequest {
  name?: string;
  first_name?: string;
  last_name?: string;
  institution?: string;
  country?: string;
  state?: string;
  bio?: string;
  phone?: string;
  profile_picture_url?: string;
  [key: string]: unknown;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UpdatePasswordResponse {
  message: string;
}

export interface DeleteAccountResponse {
  message: string;
}

/**
 * Get current user profile (requires auth)
 * GET /api/me
 */
export async function getProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/me');
  return data;
}

/**
 * Update user profile (requires auth)
 * PUT /api/update-profile (POST also supported)
 */
export async function updateProfile(updates: UpdateProfileRequest): Promise<UserProfile> {
  const { data } = await api.put<UserProfile>('/update-profile', updates);
  return data;
}

/**
 * Update password (requires auth)
 * POST /api/update-password
 */
export async function updatePassword(request: UpdatePasswordRequest): Promise<UpdatePasswordResponse> {
  const { data } = await api.post<UpdatePasswordResponse>('/update-password', request);
  return data;
}

/**
 * Delete account (requires auth)
 * DELETE /api/delete-account
 */
export async function deleteAccount(): Promise<DeleteAccountResponse> {
  const { data } = await api.delete<DeleteAccountResponse>('/delete-account');
  return data;
}
