/**
 * Learner certificates: types and API for /my-certificates and certificate download.
 * Backend: GET /api/my-certificates, GET /api/certificates/{id}, GET /api/certificates/{id}/download
 */
import { Linking } from 'react-native';
import api from './api';
import { API_BASE } from '../config';
import { getToken } from '../auth/storage';

export interface LearnerCertificateSummary {
  id: string | number;
  title?: string;
  course_name?: string;
  name?: string;
  completed_at?: string;
  issued_at?: string;
  thumbnail_url?: string;
  preview_url?: string;
  image_url?: string;
  certificate_number?: string;
  display_id?: string;
}

/** Raw item from backend – may use different keys. */
type RawCertificateItem = Record<string, unknown> & {
  id?: string | number;
  certificate_id?: string | number;
  cert_id?: string | number;
  title?: string;
  course_name?: string;
  course_title?: string;
  name?: string;
  completed_at?: string;
  completion_date?: string;
  issued_at?: string;
  created_at?: string;
  thumbnail_url?: string;
  preview_url?: string;
  image_url?: string;
  certificate_image?: string;
  certificate_number?: string;
  display_id?: string;
};

function getFirst<T>(...values: (T | undefined | null)[]): T | undefined {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== '') return v as T;
  }
  return undefined;
}

function normalizeItem(raw: RawCertificateItem): LearnerCertificateSummary {
  const id = getFirst(raw.id, raw.certificate_id, raw.cert_id);
  const title = getFirst(
    raw.title,
    raw.course_name,
    raw.course_title,
    raw.name
  ) as string | undefined;
  const date = getFirst(
    raw.completed_at,
    raw.completion_date,
    raw.issued_at,
    raw.created_at
  ) as string | undefined;
  const image = getFirst(
    raw.thumbnail_url,
    raw.preview_url,
    raw.image_url,
    raw.certificate_image
  ) as string | undefined;

  const certNumber = getFirst(
    raw.certificate_number,
    raw.display_id
  ) as string | undefined;

  return {
    id: id ?? '',
    title,
    course_name: title,
    name: title,
    completed_at: date,
    issued_at: date,
    thumbnail_url: image,
    preview_url: image,
    image_url: image,
    certificate_number: certNumber,
    display_id: certNumber,
  };
}

function extractArray(body: unknown): RawCertificateItem[] {
  if (Array.isArray(body)) return body as RawCertificateItem[];
  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>;
    if (Array.isArray(o.certificates)) return o.certificates as RawCertificateItem[];
    if (Array.isArray(o.data)) return o.data as RawCertificateItem[];
    if (Array.isArray(o.results)) return o.results as RawCertificateItem[];
    if (Array.isArray(o.items)) return o.items as RawCertificateItem[];
  }
  return [];
}

function normalizeListPayload(body: unknown): LearnerCertificateSummary[] {
  const arr = extractArray(body);
  return arr.map((item) => normalizeItem(item));
}

export async function fetchMyCertificates(): Promise<LearnerCertificateSummary[]> {
  const res = await api.get<unknown>('/my-certificates');
  return normalizeListPayload(res.data);
}

/**
 * Builds a display title from certificate fields (backend may use title, course_name, or name).
 */
export function certificateDisplayTitle(c: LearnerCertificateSummary): string {
  return (
    (c.title ?? c.course_name ?? c.name) ||
    'Certificate'
  );
}

/**
 * Formatted completion/issued date for display.
 */
export function certificateDisplayDate(c: LearnerCertificateSummary): string {
  const raw = c.completed_at ?? c.issued_at ?? '';
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return raw;
  }
}

/** Short issued date for subtitle: "Issued Oct 12, 2023". */
export function certificateIssuedShort(c: LearnerCertificateSummary): string {
  const raw = c.completed_at ?? c.issued_at ?? '';
  if (!raw) return '';
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return raw;
  }
}

/** Display ID for subtitle: e.g. "GS-9921" or backend certificate_number. */
export function certificateDisplayId(c: LearnerCertificateSummary): string {
  const fromApi = c.certificate_number ?? c.display_id;
  if (fromApi && String(fromApi).trim()) return String(fromApi).trim();
  const id = c.id ?? '';
  if (id === '') return '';
  const s = String(id);
  return s.length >= 4 ? `GS-${s.slice(-4)}` : `GS-${s}`;
}

/**
 * Opens certificate in browser (view PDF). Uses same endpoint as download.
 * API: GET /api/certificates/{id}/download
 */
export const openCertificateView = openCertificateDownload;

/**
 * Preview image URL for the certificate (thumbnail or preview).
 * Resolves relative URLs against API_BASE so backend paths like /media/... work.
 */
export function certificatePreviewUrl(c: LearnerCertificateSummary): string | undefined {
  const raw = c.thumbnail_url ?? c.preview_url ?? c.image_url;
  if (!raw || typeof raw !== 'string' || raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }
  const base = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return base ? `${base}${path}` : raw;
}

/**
 * Opens the certificate PDF download in the browser.
 * Uses ?access_token= if backend supports it; otherwise download may require in-app blob handling.
 */
export async function openCertificateDownload(certificateId: string | number): Promise<void> {
  const token = await getToken();
  const base = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
  const apiPath = base.endsWith('/api') ? base : base ? `${base}/api` : '';
  if (!apiPath) return;
  const path = `/certificates/${encodeURIComponent(String(certificateId))}/download`;
  const url = token
    ? `${apiPath}${path}?access_token=${encodeURIComponent(token)}`
    : `${apiPath}${path}`;
  Linking.openURL(url).catch(() => undefined);
}
