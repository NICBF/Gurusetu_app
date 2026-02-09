/**
 * Contact/Support API calls. Backend: POST /api/contact
 */
import axios from 'axios';
import { API_BASE } from '../config';

const rawBase = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
const baseURL = rawBase.endsWith('/api') ? rawBase : rawBase ? `${rawBase}/api` : '';

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSubmissionResponse {
  message: string;
  id: string;
  submitted_at: string;
}

/**
 * Submit contact form
 */
export async function submitContact(
  payload: ContactSubmissionPayload
): Promise<ContactSubmissionResponse> {
  const url = `${baseURL}/contact`;
  const { data } = await axios.post<ContactSubmissionResponse>(url, payload);
  return data;
}
