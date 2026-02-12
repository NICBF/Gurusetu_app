/**
 * Notifications API service.
 * Matches live website: section-based UI (New Modules, Assignments, Quizzes, Live Classes).
 * APIs: GET /notifications (preferred), POST /notifications/mark-all-read;
 * fallback: GET /notifications/new-lectures, GET /notifications/new-assignments.
 */
import api from './api';

export type NotificationKind =
  | 'live_class'
  | 'assignment'
  | 'course_added'
  | 'quiz'
  | 'payment'
  | 'certificate'
  | 'discussion'
  | 'generic';

/** Section keys matching the live website notifications page. */
export type NotificationSectionKey = 'new_modules' | 'assignments' | 'quizzes' | 'live_classes';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationKind;
  section: NotificationSectionKey;
  created_at?: string;
  is_read?: boolean;
  group?: 'today' | 'yesterday' | 'earlier';
  [key: string]: unknown;
}

/** Sectioned data for the website-style notifications UI. */
export interface NotificationsBySection {
  new_modules: NotificationItem[];
  assignments: NotificationItem[];
  quizzes: NotificationItem[];
  live_classes: NotificationItem[];
}

function typeToSection(type: NotificationKind): NotificationSectionKey {
  switch (type) {
    case 'live_class':
      return 'live_classes';
    case 'assignment':
      return 'assignments';
    case 'quiz':
      return 'quizzes';
    case 'course_added':
      return 'new_modules';
    default:
      return 'new_modules';
  }
}

/**
 * Normalize backend response into NotificationItem[] with section.
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
    const section: NotificationSectionKey =
      (n.section as NotificationSectionKey) ?? typeToSection(type);

    return {
      id,
      title,
      message,
      type,
      section,
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
          section: 'live_classes',
        })),
        ...assignList.map((x: any, i: number) => ({
          ...x,
          id: x.id ?? `a-${i}`,
          type: x.type ?? 'assignment',
          section: 'assignments',
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
 * Fetch all notifications and group by website sections (New Modules, Assignments, Quizzes, Live Classes).
 * Uses GET /notifications with fallback to /notifications/new-lectures and /notifications/new-assignments.
 */
export async function getNotificationsBySection(): Promise<NotificationsBySection> {
  const items = await getNotifications();
  const empty: NotificationItem[] = [];
  return {
    new_modules: items.filter((n) => n.section === 'new_modules'),
    assignments: items.filter((n) => n.section === 'assignments'),
    quizzes: items.filter((n) => n.section === 'quizzes'),
    live_classes: items.filter((n) => n.section === 'live_classes'),
  };
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

