/**
 * Live classes API – aligned with live website.
 * Tries GET /api/live-classes first (single response { live, upcoming }); then falls back to
 * /live-classes/now and /live-classes/upcoming. Read-only; does not modify the live website.
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
 * Fetch all live-classes. Tries GET /api/live-classes first (single response { live, upcoming }).
 * On 404 or error, falls back to GET /live-classes/now and /live-classes/upcoming.
 * Read-only; does not modify the live website.
 */
export async function getLiveClassesAll(): Promise<LiveClassesResponse> {
  try {
    const { data } = await api.get<LiveClassesResponse>('/live-classes');
    return {
      live: Array.isArray(data?.live) ? data.live : [],
      upcoming: Array.isArray(data?.upcoming) ? data.upcoming : [],
    };
  } catch {
    const [live, upcoming] = await Promise.all([
      getLiveNowFallback(),
      getUpcomingClassesFallback(),
    ]);
    return { live, upcoming };
  }
}

async function getLiveNowFallback(): Promise<LiveSession[]> {
  try {
    const { data } = await api.get<LiveSession[] | { live: LiveSession[] }>('/live-classes/now');
    if (Array.isArray(data)) return data;
    return (data as { live: LiveSession[] }).live ?? [];
  } catch {
    try {
      const { data } = await api.get<{ live?: LiveSession[] }>('/live-classes', { params: { status: 'live' } });
      return data.live ?? [];
    } catch {
      return [];
    }
  }
}

async function getUpcomingClassesFallback(): Promise<UpcomingClass[]> {
  try {
    const { data } = await api.get<UpcomingClass[] | { upcoming: UpcomingClass[] }>('/live-classes/upcoming');
    if (Array.isArray(data)) return data;
    return (data as { upcoming: UpcomingClass[] }).upcoming ?? [];
  } catch {
    try {
      const { data } = await api.get<{ upcoming?: UpcomingClass[] }>('/live-classes', { params: { status: 'upcoming' } });
      return data.upcoming ?? [];
    } catch {
      return [];
    }
  }
}

/** Fetch sessions that are live now. Prefer getLiveClassesAll() for a single request. */
export async function getLiveNow(): Promise<LiveSession[]> {
  const { live } = await getLiveClassesAll();
  return live;
}

/** Fetch upcoming live classes. Prefer getLiveClassesAll() for a single request. */
export async function getUpcomingClasses(): Promise<UpcomingClass[]> {
  const { upcoming } = await getLiveClassesAll();
  return upcoming;
}
