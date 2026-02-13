/**
 * Resolve image URLs for display. Google Drive "view" links are HTML pages;
 * convert them to direct image URLs so <Image> can load them.
 */
import { getMediaBase } from '../config';

const DRIVE_FILE_ID_REGEX = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;

export function getDisplayableImageUrl(url: string | undefined | null): string | null {
  if (!url || !url.trim()) return null;
  const u = url.trim();
  const match = u.match(DRIVE_FILE_ID_REGEX);
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return u;
}

/**
 * Resolve course/lecture thumbnail URL for display. Relative paths are made absolute
 * using getMediaBase() so thumbnails work in the live app when API_BASE is set or fallback.
 */
export function resolveThumbnailUrl(thumbnailUrl: string | undefined | null): string | null {
  if (!thumbnailUrl || !thumbnailUrl.trim()) return null;
  let url = thumbnailUrl.trim();
  if (!url.startsWith('http')) {
    const base = getMediaBase();
    url = `${base.replace(/\/+$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return getDisplayableImageUrl(url) ?? url;
}
