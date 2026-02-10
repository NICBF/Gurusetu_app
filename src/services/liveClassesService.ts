/**
 * Live classes API – aligned with live website.
 * Endpoints: GET /live-classes (or /live-classes/now, /live-classes/upcoming).
 * Does not modify the live website; app and website share the same API contract.
 */
import api from './api';

export interface LiveSession {
  id: string;
  title: string;
  instructor_name: string;
  instructor_avatar_url?: string;
  thumbnail_url?: string;
  join_url?: string;
  category?: string;
  started_at?: string;
}

export interface UpcomingClass {
  id: string;
  title: string;
  instructor_name: string;
  category?: string;
  starts_at: string;
  starts_in_label?: string;
  reminder_on?: boolean;
}

export interface LiveClassesResponse {
  live?: LiveSession[];
  upcoming?: UpcomingClass[];
}

/**
 * Fetch sessions that are live now. Same contract as live website.
 * GET /live-classes/now or GET /live-classes?status=live
 */
export async function getLiveNow(): Promise<LiveSession[]> {
  try {
    const { data } = await api.get<LiveSession[] | { live: LiveSession[] }>('/live-classes/now');
    if (Array.isArray(data)) return data;
    return (data as { live: LiveSession[] }).live ?? [];
  } catch (e) {
    try {
      const { data } = await api.get<{ live?: LiveSession[] }>('/live-classes', { params: { status: 'live' } });
      return data.live ?? [];
    } catch {
      return [];
    }
  }
}

/**
 * Fetch upcoming live classes. Same contract as live website.
 * GET /live-classes/upcoming or GET /live-classes?status=upcoming
 */
export async function getUpcomingClasses(): Promise<UpcomingClass[]> {
  try {
    const { data } = await api.get<UpcomingClass[] | { upcoming: UpcomingClass[] }>('/live-classes/upcoming');
    if (Array.isArray(data)) return data;
    return (data as { upcoming: UpcomingClass[] }).upcoming ?? [];
  } catch (e) {
    try {
      const { data } = await api.get<{ upcoming?: UpcomingClass[] }>('/live-classes', { params: { status: 'upcoming' } });
      return data.upcoming ?? [];
    } catch {
      return [];
    }
  }
}
