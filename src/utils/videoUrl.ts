/**
 * Resolve lecture video_path to a playable URL for in-app or external.
 */
import { API_BASE } from '../config';

export function getVideoPlayableUrl(videoPath: string | undefined): string | null {
  if (!videoPath || !videoPath.trim()) return null;
  const path = videoPath.trim();
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
  if (!base) return null;
  const apiBase = base.endsWith('/api') ? base : `${base}/api`;
  return `${apiBase}/videos/${encodeURIComponent(path)}`;
}

/** True if URL is likely streamable in-app (same-origin or CORS-friendly). */
export function isStreamableInApp(url: string): boolean {
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('drive.google.com')) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}
