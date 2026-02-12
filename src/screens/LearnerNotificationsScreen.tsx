/**
 * Learner notifications screen – matches live website (EduFlow) UI.
 * Section-based: New Modules, Assignments, Quizzes, Live Classes.
 * APIs: getNotificationsBySection(), markAllNotificationsRead().
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  getNotificationsBySection,
  markAllNotificationsRead,
  type NotificationItem,
  type NotificationsBySection,
  type NotificationSectionKey,
} from '../services/notificationsService';
import Icon from '../components/Icon';
import { useTheme } from '../theme/ThemeContext';

type Filter = 'All' | 'Unread' | 'Archive';

const COLORS = {
  primary: '#135bec',
  backgroundDark: '#101622',
  surfaceCard: 'rgba(30, 41, 59, 0.4)',
  surfaceCardBorder: 'rgba(51, 65, 85, 0.6)',
  border: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  sectionLabel: '#64748b',
  white: '#ffffff',
};

const SECTION_CONFIG: Array<{
  key: NotificationSectionKey;
  title: string;
  emptyMessage: string;
  iconName: 'auto_stories' | 'grading' | 'quiz' | 'live_tv';
}> = [
  { key: 'new_modules', title: 'New Modules', emptyMessage: 'No new modules', iconName: 'auto_stories' },
  { key: 'assignments', title: 'Assignments', emptyMessage: 'No assignments', iconName: 'grading' },
  { key: 'quizzes', title: 'Quizzes', emptyMessage: 'No quiz', iconName: 'quiz' },
  { key: 'live_classes', title: 'Live Classes', emptyMessage: 'No new live classes', iconName: 'live_tv' },
];

function filterItems(items: NotificationItem[], filter: Filter): NotificationItem[] {
  if (filter === 'Unread') return items.filter((n) => !n.is_read);
  if (filter === 'Archive') return items.filter((n) => n.is_read);
  return items;
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

function BottomNav({ activeTab = 'none' }: { activeTab?: 'home' | 'dashboard' | 'live' | 'notifications' | 'profile' }) {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: c.surfaceCard, borderTopColor: c.border }]}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LearnerHome')} activeOpacity={0.7}>
        <Icon name="home" size={22} color={activeTab === 'home' ? c.primary : c.textMuted} />
        <Text style={[styles.navLabel, { color: activeTab === 'home' ? c.primary : c.textMuted }, activeTab === 'home' && styles.navLabelActive]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('StudentDashboard')} activeOpacity={0.7}>
        <Icon name="dashboard" size={22} color={activeTab === 'dashboard' ? c.primary : c.textMuted} />
        <Text style={[styles.navLabel, { color: activeTab === 'dashboard' ? c.primary : c.textMuted }, activeTab === 'dashboard' && styles.navLabelActive]}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LiveClasses')} activeOpacity={0.7}>
        <Icon name="live_tv" size={22} color={activeTab === 'live' ? c.primary : c.textMuted} />
        <Text style={[styles.navLabel, { color: activeTab === 'live' ? c.primary : c.textMuted }, activeTab === 'live' && styles.navLabelActive]}>Live</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
        <View>
          <Icon name="notifications" size={22} color={activeTab === 'notifications' ? c.primary : c.textMuted} />
          {activeTab === 'notifications' && <View style={[styles.navDot, { backgroundColor: c.primary }]} />}
        </View>
        <Text style={[styles.navLabel, { color: activeTab === 'notifications' ? c.primary : c.textMuted }, activeTab === 'notifications' && styles.navLabelActive]}>Alerts</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LearnerProfile')} activeOpacity={0.7}>
        <Icon name="person" size={22} color={activeTab === 'profile' ? c.primary : c.textMuted} />
        <Text style={[styles.navLabel, { color: activeTab === 'profile' ? c.primary : c.textMuted }, activeTab === 'profile' && styles.navLabelActive]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function LearnerNotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const c = theme.colors;
  const [sections, setSections] = useState<NotificationsBySection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getNotificationsBySection();
      setSections(data);
    } catch (e) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
    } finally {
      setSections((prev) => {
        if (!prev) return prev;
        const map = (arr: NotificationItem[]) =>
          arr.map((n) => ({ ...n, is_read: true }));
        return {
          new_modules: map(prev.new_modules),
          assignments: map(prev.assignments),
          quizzes: map(prev.quizzes),
          live_classes: map(prev.live_classes),
        };
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.page, { backgroundColor: c.background }]}>
        <View style={[styles.loadingPage, { backgroundColor: c.background }]}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={[styles.loadingText, { color: c.textMuted }]}>Loading notifications...</Text>
        </View>
        <BottomNav activeTab="notifications" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.page, { backgroundColor: c.background }]}>
        <View style={[styles.loadingPage, { backgroundColor: c.background }]}>
          <Text style={[styles.errorText, { color: c.text }]}>{error}</Text>
        </View>
        <BottomNav activeTab="notifications" />
      </View>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: c.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.text }]}>Notifications</Text>
          <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.8}>
            <Text style={[styles.markAll, { color: c.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {(['All', 'Unread', 'Archive'] as Filter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                { borderColor: c.border },
                f === filter && f === 'All' && { backgroundColor: c.primary },
                f === filter && f !== 'All' && styles.filterChipActive,
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: f === filter && f === 'All' ? c.white : c.textMuted },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sections}>
          {SECTION_CONFIG.map(({ key, title, emptyMessage, iconName }) => {
            const list = sections
              ? filterItems(sections[key], filter)
              : [];
            return (
              <View key={key} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: c.textDim }]}>{title}</Text>
                {list.length === 0 ? (
                  <View style={[styles.emptyCard, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
                    <View style={[styles.emptyIconWrap, { backgroundColor: c.surfaceCard }]}>
                      <Icon
                        name={iconName}
                        size={24}
                        color={c.textDim}
                      />
                    </View>
                    <Text style={[styles.emptyText, { color: c.textDim }]}>{emptyMessage}</Text>
                  </View>
                ) : (
                  <View style={styles.cardList}>
                    {list.map((n) => (
                      <View
                        key={n.id}
                        style={[
                          styles.card,
                          { backgroundColor: c.surfaceCard, borderColor: c.border },
                          n.is_read && styles.cardRead,
                        ]}
                      >
                        <View style={styles.cardRow}>
                          <View style={styles.cardBody}>
                            <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={2}>
                              {n.title}
                            </Text>
                            {!!n.message && (
                              <Text
                                style={[styles.cardMessage, { color: c.textMuted }]}
                                numberOfLines={2}
                              >
                                {n.message}
                              </Text>
                            )}
                          </View>
                          {!n.is_read && <View style={[styles.unreadDot, { backgroundColor: c.primary }]} />}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomNav activeTab="notifications" />
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
    paddingBottom: 80,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textMuted },
  errorText: { padding: 20, color: '#fca5a5', textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  markAll: { fontSize: 14, fontWeight: '500', color: COLORS.primary },
  filterScroll: { marginBottom: 32 },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.surfaceCardBorder,
  },
  filterChipPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: 'transparent',
  },
  filterChipActive: {
    borderColor: COLORS.surfaceCardBorder,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  filterChipTextPrimary: { color: COLORS.white },
  sections: { gap: 24 },
  section: { marginBottom: 4 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.sectionLabel,
    textTransform: 'uppercase',
    letterSpacing: 2.4,
    marginBottom: 16,
    marginLeft: 4,
  },
  emptyCard: {
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.surfaceCardBorder,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.sectionLabel,
  },
  cardList: { gap: 8 },
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceCardBorder,
  },
  cardRead: { opacity: 0.85 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
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
  bottomSpacer: { height: 100 },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingHorizontal: 8,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navItem: { alignItems: 'center', minWidth: 48 },
  navLabel: { fontSize: 10, fontWeight: '500', color: COLORS.textMuted, marginTop: 4 },
  navLabelActive: { color: COLORS.primary, fontWeight: '600' },
  navDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
});
