/**
 * Registration API calls. Backend: POST /api/register, /api/register/professor
 */
import axios from 'axios';
import { API_BASE } from '../config';

const rawBase = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
const baseURL = rawBase.endsWith('/api') ? rawBase : rawBase ? `${rawBase}/api` : '';

export interface RegisterLearnerPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  name?: string; // backward compat
  role?: 'learner';
  country?: string;
  state?: string;
  institution?: string;
  other_institution?: string;
  registration_type?: string;
}

export interface RegisterProfessorPayload {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
  name?: string; // backward compat
}

export interface RegisterResponse {
  id: string;
  email: string;
  email_sent?: boolean;
  instructor_id?: string;
  message?: string;
}

/**
 * Register a learner (student)
 */
export async function registerLearner(
  payload: RegisterLearnerPayload
): Promise<RegisterResponse> {
  const url = `${baseURL}/register`;
  const { data } = await axios.post<RegisterResponse>(url, {
    ...payload,
    role: 'learner',
  });
  return data;
}

/**
 * Register a professor (faculty)
 */
export async function registerProfessor(
  payload: RegisterProfessorPayload
): Promise<RegisterResponse> {
  const url = `${baseURL}/register/professor`;
  const { data } = await axios.post<RegisterResponse>(url, payload);
  return data;
}
