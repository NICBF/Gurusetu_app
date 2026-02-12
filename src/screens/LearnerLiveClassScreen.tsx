/**
 * Learner Live Class screen – adapted from Live Classes HTML.
 * Uses live-classes API (same contract as live website). Live Now + Upcoming, filter chips, bottom nav.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getLiveClassesAll, type LiveSession, type UpcomingClass } from '../services/liveClassesService';
import Icon from '../components/Icon';
import { useTheme } from '../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;

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
  red: '#ef4444',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FILTERS = ['All', 'Design', 'Development', 'Marketing', 'Business'];

export default function LearnerLiveClassScreen() {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const c = theme.colors;
  const [filter, setFilter] = useState('All');
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { live, upcoming } = await getLiveClassesAll();
        if (!cancelled) {
          setLiveSessions(live);
          setUpcoming(upcoming);
        }
      } catch {
        if (!cancelled) {
          setLiveSessions([]);
          setUpcoming([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const goToLearnerHome = () => navigation.navigate('LearnerHome');
  const goToDashboard = () => navigation.navigate('StudentDashboard');
  const goToNotifications = () => navigation.navigate('Notifications');

  const handleJoin = (session: LiveSession) => {
    if (session.join_url) {
      Linking.openURL(session.join_url).catch(() => {});
    } else {
      // Placeholder: could open in-app WebView or show toast
    }
  };

  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const toggleReminder = (id: string) => {
    setReminders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <View style={[styles.loadingPage, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[styles.loadingText, { color: c.textMuted }]}>Loading live classes...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: c.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Filter chips */}
        <View style={styles.chipsWrap}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, { backgroundColor: f === filter ? c.primary : c.surfaceCard }, f === filter && styles.chipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.chipText, { color: f === filter ? c.white : c.textMuted }, f === filter && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!loading && liveSessions.length === 0 && upcoming.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="live_tv" size={48} color={c.textDim} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No live classes right now</Text>
            <Text style={[styles.emptySubtext, { color: c.textMuted }]}>Scheduled sessions will appear here. Check back later.</Text>
          </View>
        )}

        {/* Live Now */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.liveNowTitleRow}>
              <View style={styles.liveDot} />
              <Text style={[styles.sectionTitle, { color: c.text }]}>Live Now</Text>
            </View>
            <Text style={[styles.activeCount, { color: c.primary }]}>{liveSessions.length} active</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.liveScroll}>
            {liveSessions.map((session) => (
              <View key={session.id} style={styles.liveCard}>
                <Image source={{ uri: session.thumbnail_url }} style={styles.liveCardImage} />
                <View style={styles.liveCardGradient} />
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>Live</Text>
                </View>
                <View style={styles.liveCardFooter}>
                  <Text style={styles.liveCardTitle} numberOfLines={2}>{session.title}</Text>
                  <View style={styles.liveCardRow}>
                    <View style={styles.instructorRow}>
                      <Image source={{ uri: session.instructor_avatar_url }} style={styles.instructorAvatar} />
                      <Text style={styles.instructorName}>{session.instructor_name}</Text>
                    </View>
                    <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin(session)}>
                      <Text style={styles.joinBtnText}>Join</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Classes */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Upcoming Classes</Text>
            <Text style={[styles.seeAllMuted, { color: c.textDim }]}>See All</Text>
          </View>
          <View style={styles.upcomingList}>
            {upcoming.map((cls) => {
              const isPrimary = cls.starts_in_label?.toLowerCase().includes('starts') ?? false;
              const reminderOn = reminders[cls.id] ?? cls.reminder_on ?? false;
              return (
                <View key={cls.id} style={[styles.upcomingCard, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
                  <View style={[styles.timeBox, { backgroundColor: isPrimary ? c.primary + '20' : c.surface }, isPrimary && styles.timeBoxPrimary]}>
                    <Text style={[styles.timeText, { color: isPrimary ? c.primary : c.textMuted }, isPrimary && styles.timeTextPrimary]}>{cls.starts_at}</Text>
                    <Text style={[styles.timeLabel, { color: isPrimary ? c.primary : c.textDim }, isPrimary && styles.timeLabelPrimary]}>
                      {cls.starts_in_label ?? 'Today'}
                    </Text>
                  </View>
                  <View style={styles.upcomingBody}>
                    <Text style={[styles.upcomingTitle, { color: c.text }]} numberOfLines={1}>{cls.title}</Text>
                    <View style={styles.upcomingMeta}>
                      <Text style={[styles.upcomingMetaText, { color: c.textDim }]}>by {cls.instructor_name}</Text>
                      <Text style={[styles.upcomingDot, { color: c.border }]}>•</Text>
                      <Text style={[styles.upcomingMetaText, { color: c.textDim }]}>{cls.category ?? 'General'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.bellBtn, { backgroundColor: c.surface }, reminderOn && styles.bellBtnActive]}
                    onPress={() => toggleReminder(cls.id)}
                  >
                    <Icon name="notifications" size={20} color={reminderOn ? c.primary : c.textDim} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={[styles.bottomNav, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
        <TouchableOpacity style={styles.navItem} onPress={goToLearnerHome}>
          <Icon name="home" size={24} color={c.textMuted} />
          <Text style={[styles.navLabel, { color: c.textMuted }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToDashboard}>
          <Icon name="dashboard" size={24} color={c.textMuted} />
          <Text style={[styles.navLabel, { color: c.textMuted }]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {}}
          activeOpacity={1}
        >
          <View>
            <Icon name="live_tv" size={24} color={c.primary} />
            <View style={styles.navLiveDot} pointerEvents="none" />
          </View>
          <Text style={[styles.navLabel, styles.navLabelActive, { color: c.primary }]}>Live Classes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToNotifications}>
          <Icon name="notifications" size={24} color={c.textMuted} />
          <Text style={[styles.navLabel, { color: c.textMuted }]}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('LearnerProfile')}
        >
          <Icon name="person" size={24} color={c.textMuted} />
          <Text style={[styles.navLabel, { color: c.textMuted }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.backgroundDark },
  loadingPage: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundDark },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textMuted },
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: COLORS.textMuted, marginTop: 8, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  chipsWrap: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: COLORS.surfaceCard,
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 14, fontWeight: '500', color: COLORS.textMuted },
  chipTextActive: { color: COLORS.white },
  section: { marginBottom: 32 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  liveNowTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.red },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  activeCount: { fontSize: 14, fontWeight: '500', color: COLORS.primary },
  seeAllMuted: { fontSize: 14, fontWeight: '500', color: COLORS.textDim },
  liveScroll: { paddingRight: 20 },
  liveCard: {
    width: CARD_WIDTH,
    marginRight: 16,
    aspectRatio: 16 / 10,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  liveCardImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' },
  liveCardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.red,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  liveCardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  liveCardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 8 },
  liveCardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  instructorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  instructorAvatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  instructorName: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  joinBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  joinBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  upcomingList: { gap: 16 },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeBox: {
    minWidth: 70,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBoxPrimary: { backgroundColor: COLORS.primary + '20' },
  timeText: { fontSize: 18, fontWeight: '700', color: COLORS.textMuted },
  timeTextPrimary: { color: COLORS.primary },
  timeLabel: { fontSize: 10, fontWeight: '500', color: COLORS.textDim, marginTop: 2 },
  timeLabelPrimary: { color: COLORS.primary + 'b3' },
  upcomingBody: { flex: 1, minWidth: 0 },
  upcomingTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  upcomingMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  upcomingMetaText: { fontSize: 12, color: COLORS.textDim },
  upcomingDot: { fontSize: 12, color: COLORS.border },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBtnActive: { backgroundColor: COLORS.primary + '20' },
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  navItem: { alignItems: 'center', flex: 1, maxWidth: 80 },
  navLabel: { fontSize: 10, fontWeight: '500', color: COLORS.textMuted, marginTop: 4 },
  navLabelActive: { color: COLORS.primary },
  navLiveDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    borderWidth: 2,
    borderColor: COLORS.backgroundDark,
  },
});
