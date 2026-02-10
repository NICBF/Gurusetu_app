/**
 * Notifications API service.
 * Primary contract for the app and live website: GET /notifications, POST /notifications/mark-all-read.
 * Falls back to legacy endpoints /notifications/new-lectures and /notifications/new-assignments
 * so we don't break existing backend behaviour.
 */
import api from './api';

export type NotificationKind =
  | 'live_class'
  | 'assignment'
  | 'course_added'
  | 'payment'
  | 'certificate'
  | 'discussion'
  | 'generic';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationKind;
  created_at?: string;
  is_read?: boolean;
  group?: 'today' | 'yesterday' | 'earlier';
  [key: string]: unknown;
}

/**
 * Normalize backend response into NotificationItem[].
 */
function normalizeNotifications(raw: any[]): NotificationItem[] {
  return raw.map((n, idx) => {
    const id = String(n.id ?? n.notification_id ?? idx);
    const title = n.title ?? n.heading ?? 'Notification';
    const message = n.message ?? n.body ?? '';
    const type: NotificationKind =
      (n.type as NotificationKind) ??
      (n.category as NotificationKind) ??
      'generic';

    return {
      id,
      title,
      message,
      type,
      created_at: n.created_at ?? n.timestamp,
      is_read: !!n.is_read,
    };
  });
}

/**
 * Group notifications into today / yesterday / earlier on the client side
 * when backend doesn't provide grouping.
 */
function addGroups(items: NotificationItem[]): NotificationItem[] {
  const now = new Date();
  return items.map((n) => {
    if (!n.created_at) return { ...n, group: 'earlier' };
    const dt = new Date(n.created_at);
    const sameDay =
      dt.getFullYear() === now.getFullYear() &&
      dt.getMonth() === now.getMonth() &&
      dt.getDate() === now.getDate();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      dt.getFullYear() === yesterday.getFullYear() &&
      dt.getMonth() === yesterday.getMonth() &&
      dt.getDate() === yesterday.getDate();
    return {
      ...n,
      group: sameDay ? 'today' : isYesterday ? 'yesterday' : 'earlier',
    };
  });
}

/**
 * Main notifications fetch – preferred contract: GET /notifications
 * returning an array or { items: [...] }.
 * Fallback: legacy lecture/assignment endpoints.
 */
export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const res = await api.get('/notifications');
    const data = Array.isArray(res.data)
      ? res.data
      : (res.data && (res.data as { items?: any[] }).items) || [];
    const normalized = normalizeNotifications(data);
    return addGroups(normalized);
  } catch (e) {
    // Fallback to existing endpoints used by the app today
    try {
      const [lecturesRes, assignmentsRes] = await Promise.all([
        api.get('/notifications/new-lectures').catch(() => ({ data: [] })),
        api.get('/notifications/new-assignments').catch(() => ({ data: [] })),
      ]);
      const lectureList = Array.isArray(lecturesRes.data)
        ? lecturesRes.data
        : [];
      const assignList = Array.isArray(assignmentsRes.data)
        ? assignmentsRes.data
        : [];
      const combined = [
        ...lectureList.map((x: any, i: number) => ({
          ...x,
          id: x.id ?? `l-${i}`,
          type: x.type ?? 'live_class',
        })),
        ...assignList.map((x: any, i: number) => ({
          ...x,
          id: x.id ?? `a-${i}`,
          type: x.type ?? 'assignment',
        })),
      ];
      const normalized = normalizeNotifications(combined);
      return addGroups(normalized);
    } catch {
      return [];
    }
  }
}

/**
 * Mark all notifications as read. Backend contract: POST /notifications/mark-all-read.
 * If endpoint doesn't exist yet, we ignore the error so we don't break anything.
 */
export async function markAllNotificationsRead(): Promise<void> {
  try {
    await api.post('/notifications/mark-all-read');
  } catch {
    // no-op fallback
  }
}

