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

/** True when the path is a Google Drive file URL (needs WebView embed, not native video). */
export function isGoogleDriveVideoUrl(path: string | undefined): boolean {
  return !!(path && path.trim() && DRIVE_VIDEO_REGEX.test(path.trim()));
}

/** Normalize Drive URL to embeddable form for WebView. Adds parameters to minimize controls. */
export function getDriveEmbedUrl(path: string): string {
  const u = path.trim();
  let embedUrl = u;
  
  // Convert to /preview format if needed
  if (u.includes('/file/d/')) {
    embedUrl = u.replace(/\/file\/d\/([a-zA-Z0-9_-]+)\/.*$/i, '/file/d/$1/preview');
  } else {
    embedUrl = u.replace(/\/(view|edit)(\?[^#]*)?(#.*)?$/i, '/preview') || u;
  }
  
  // Add parameters to minimize UI elements (if not already present)
  if (!embedUrl.includes('?')) {
    embedUrl += '?usp=sharing&rm=minimal';
  } else if (!embedUrl.includes('rm=')) {
    embedUrl += '&rm=minimal';
  }
  
  return embedUrl;
}

/**
 * If the given URI is a backend stream URL whose ref= points to Google Drive,
 * return the direct Drive embed URL so we can play in WebView (backend proxy often 404).
 */
export function getDriveEmbedUrlFromStreamUri(uri: string): string | null {
  if (!uri || !uri.includes('ref=')) return null;
  const match = uri.match(/ref=([^&]+)/);
  if (!match) return null;
  try {
    const decoded = decodeURIComponent(match[1]);
    if (!DRIVE_VIDEO_REGEX.test(decoded)) return null;
    return getDriveEmbedUrl(decoded);
  } catch {
    return null;
  }
}
