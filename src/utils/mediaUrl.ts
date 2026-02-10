/**
 * Resolve image URLs for display. Google Drive "view" links are HTML pages;
 * convert them to direct image URLs so <Image> can load them.
 */
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
