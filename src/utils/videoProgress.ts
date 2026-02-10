import { API_BASE } from '../config';

/**
 * Fire-and-forget progress save. Safe if API is not yet wired –
 * all errors are swallowed so UX is never blocked.
 */
export async function saveProgress(key: string, seconds: number): Promise<void> {
  try {
    const base = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
    if (!base) return;
    const url = `${base}/api/video-progress`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        watchedSeconds: Math.floor(seconds),
      }),
    });
  } catch {
    // silently ignore – analytics, not core flow
  }
}

