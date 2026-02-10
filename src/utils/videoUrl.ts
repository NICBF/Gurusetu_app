/**
 * Resolve video_path to a playable URL. Always returns a backend URL so the real
 * source is never exposed to the client. Playback happens in the embedded player only.
 */
import { API_BASE } from '../config';

function getApiBase(): string {
  const base = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
  return base.endsWith('/api') ? base : base ? `${base}/api` : '';
}

export function getVideoPlayableUrl(videoPath: string | undefined): string | null {
  if (!videoPath || !videoPath.trim()) return null;
  const path = videoPath.trim();
  const apiBase = getApiBase();
  if (!apiBase) return null;
  // Relative path: backend serves at /api/videos/<path>
  if (!path.startsWith('http://') && !path.startsWith('https://')) {
    return `${apiBase}/videos/${encodeURIComponent(path)}`;
  }
  // Absolute URL (e.g. YouTube, Drive): backend must proxy at /api/videos/stream?ref=...
  // App never exposes the real URL; playback is always in the embedded player.
  return `${apiBase}/videos/stream?ref=${encodeURIComponent(path)}`;
}

/** All playback URLs from getVideoPlayableUrl are backend URLs, so always stream in-app. */
export function isStreamableInApp(_url: string): boolean {
  return true;
}

const DRIVE_VIDEO_REGEX = /drive\.google\.com\/file\/d\//i;

/** True when the path is a Google Drive file URL (needs WebView embed, not expo-av). */
export function isGoogleDriveVideoUrl(path: string | undefined): boolean {
  return !!(path && path.trim() && DRIVE_VIDEO_REGEX.test(path.trim()));
}

/** Normalize Drive URL to embeddable preview form for WebView. */
export function getDriveEmbedUrl(path: string): string {
  const u = path.trim();
  return u.replace(/\/(view|edit)(\?[^#]*)?(#.*)?$/i, '/preview') || u;
}
