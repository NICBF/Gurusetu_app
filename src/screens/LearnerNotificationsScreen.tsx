/**
 * Learner notifications screen – adapted from HTML design.
 * Uses unified /notifications API (with fallback to legacy endpoints).
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  getNotifications,
  markAllNotificationsRead,
  type NotificationItem,
} from '../services/notificationsService';
import Icon from '../components/Icon';

type Filter = 'All' | 'Unread' | 'Archive';

const COLORS = {
  primary: '#135bec',
  backgroundDark: '#101622',
  surface: '#0f172a',
  surfaceCard: '#1e293b',
  border: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  white: '#ffffff',
  emerald: '#10b981',
  amber: '#f59e0b',
  blue: '#3b82f6',
  purple: '#a855f7',
};

function iconForType(type: NotificationItem['type']): { bg: string; color: string; icon: string } {
  switch (type) {
    case 'live_class':
      return { bg: COLORS.primary + '20', color: COLORS.primary, icon: 'live_tv' };
    case 'assignment':
      return { bg: COLORS.emerald + '20', color: COLORS.emerald, icon: 'grading' };
    case 'course_added':
      return { bg: COLORS.amber + '20', color: COLORS.amber, icon: 'auto_awesome' };
    case 'payment':
      return { bg: COLORS.blue + '20', color: COLORS.blue, icon: 'dashboard' };
    case 'certificate':
      return { bg: COLORS.purple + '20', color: COLORS.purple, icon: 'verified_user' };
    case 'discussion':
      return { bg: COLORS.surfaceCard, color: COLORS.textMuted, icon: 'contact_support' };
    default:
      return { bg: COLORS.surfaceCard, color: COLORS.textMuted, icon: 'notifications' };
  }
}

export default function LearnerNotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getNotifications();
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setError('Failed to load notifications.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
    } finally {
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const filtered = items.filter((n) => {
    if (filter === 'Unread') return !n.is_read;
    // Archive could be wired when backend supports it – for now same as All
    return true;
  });

  const groups: Array<{ key: 'today' | 'yesterday' | 'earlier'; label: string }> = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'earlier', label: 'Earlier' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingPage}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.8}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {(['All', 'Unread', 'Archive'] as Filter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                f === 'All' && styles.filterChipPrimary,
                f === 'Unread' && styles.filterChipSecondary,
                filter === f && styles.filterChipActiveBorder,
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  f === 'All' && styles.filterChipTextPrimary,
                  f === 'Unread' && styles.filterChipTextUnread,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Groups: Today, Yesterday, Earlier */}
        {groups.map(({ key, label }) => {
          const sectionItems = filtered.filter((n) => (n.group ?? 'earlier') === key);
          if (!sectionItems.length) return null;
          return (
            <View key={key} style={styles.groupSection}>
              <Text style={styles.groupLabel}>{label}</Text>
              <View style={styles.groupList}>
                {sectionItems.map((n) => {
                  const { bg, color, icon } = iconForType(n.type);
                  const isUnread = !n.is_read;
                  return (
                    <View
                      key={n.id}
                      style={[
                        styles.card,
                        !isUnread && styles.cardRead,
                      ]}
                    >
                      <View style={styles.cardRow}>
                        <View style={[styles.iconBox, { backgroundColor: bg }]}>
                          <Icon name={icon as any} size={20} color={color} />
                        </View>
                        <View style={styles.cardBody}>
                          <View style={styles.cardHeaderRow}>
                            <Text style={styles.cardTitle} numberOfLines={2}>
                              {n.title}
                            </Text>
                            {n.created_at ? (
                              <Text style={styles.cardTime}>·</Text>
                            ) : null}
                          </View>
                          {!!n.message && (
                            <Text style={styles.cardMessage} numberOfLines={3}>
                              {n.message}
                            </Text>
                          )}
                        </View>
                        {isUnread && <View style={styles.unreadDot} />}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {filtered.length === 0 && (
          <Text style={styles.emptyText}>No notifications yet.</Text>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.backgroundDark },
  loadingPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textMuted },
  errorText: { padding: 20, color: '#fca5a5', textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.text },
  markAll: { fontSize: 14, fontWeight: '500', color: COLORS.primary },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipPrimary: { backgroundColor: COLORS.primary },
  filterChipSecondary: { backgroundColor: COLORS.primary + '1a' },
  filterChipActiveBorder: { borderColor: COLORS.primary + '80' },
  filterChipText: { fontSize: 14, fontWeight: '500', color: COLORS.textMuted },
  filterChipTextPrimary: { color: COLORS.white },
  filterChipTextUnread: { color: COLORS.primary },
  groupSection: { marginBottom: 24 },
  groupLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupList: { gap: 8 },
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardRead: { opacity: 0.8 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 4,
  },
  cardTime: { fontSize: 11, color: COLORS.textMuted, marginLeft: 4 },
  cardMessage: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textMuted,
  },
  bottomSpacer: { height: 40 },
});

