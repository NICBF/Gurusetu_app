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
import { getLiveNow, getUpcomingClasses, type LiveSession, type UpcomingClass } from '../services/liveClassesService';
import Icon from '../components/Icon';

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

const FALLBACK_LIVE: LiveSession[] = [
  {
    id: '1',
    title: 'Advanced UI Component Architecture',
    instructor_name: 'Alex Rivers',
    instructor_avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtWJNRhLmIPJU0HdTN8diJE_OXPhN7LMKR4AUdp_Ca3OljPXfywEhYB-uzrtwgvmAcmnA-nDO9NIgtB_tQd33e7a7NB3Oi7LTDdPUaNjDROr7AnMDqdTBWVCWvnD5osnd_pwO13jvjEZfJsMcP2rP7_N3ftJxFC02Z2sqw2pCtZjRY_st9ygEbbXl4yccHAD51ooBnk8GsRpWoC9Ptr3huasjFfuOjioQkLFhY06XOYHaV9ZS6mK-AgU32Wwl4Yo9yTrrMRrXSFYY',
    thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVJmcQZ5PBT8mL9UWJPLYeTD3_CbYKZPje-wChO6uX1lQrr0bh1310yC54kQpO4VWiRxWsVsoV_JrUy442ccX5ea75pg079z8GFc3zlRocsRqyhZXwBhbgHo6CbPHbSM-v6vqND_NfyZr38CB0VTAgiXf6mRTew6M8JiOqOFP-iKGGxD5vNv2YreNjuGqDg-moZdistgzqhSwUTFljq696dGC9GlC6zHN-mqFnH7YllXQ-Sn3FX3TV6NQWhjpBeCrUcVgOqYhPHu8',
  },
  {
    id: '2',
    title: 'Growth Marketing Masterclass',
    instructor_name: 'Sarah Chen',
    instructor_avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmYpONVI7aFDjzeOtChwAEalDSOS6QxZIdzCAAyzFPKe6YI2tdBqISZtqpjL9aGEKO4eQQmJDJMOjmtlq0r7sQCOYZ1dcGVdAP67OG69tx6ThWidjJGjwn4uoMaQQAyZTr9iNztSXFsGOlPYUtznvM9Om6c5BrQsMIKo1QdVky8VDcdGM5aW4PnjBHzDqxjH-Nx8Y7IojcSUvfzNCIME-6mPQekDRViwxkwyiG7ptAO5HpeyiAwF9y7JFojmd7BHelpOdnELpKurw',
    thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3qCuN0b_wo5omd2E4dw0EqfYoX3vDuK_gFgQUL46WuTVDrQ2ZCPPQl0m_UO7DINGuGYp-0HzXbc8lLrQRJX8YdEu04H-a568pjkbJHMCmzrKw_87bj5rSigMCSJbza058Lzo943IiUyFati16rzgtxLR_fCNtSflPky-U3xNEexhkVHYwFfZZ2NRWXR5Iz_8eWIYd9_FgLh2qRJQhvBxnZNIXygcUHRsJfHXLVKgX01v-DIxIbI-Nc4KmZCEFgA_tYFG0TvJcqJc',
  },
];

const FALLBACK_UPCOMING: UpcomingClass[] = [
  { id: 'u1', title: 'Product Management Fundamentals', instructor_name: 'Marcus Thorne', category: 'Business', starts_at: '14:00', starts_in_label: 'Starts in 45m', reminder_on: false },
  { id: 'u2', title: 'React Server Components 101', instructor_name: 'Elena Rodriguez', category: 'Coding', starts_at: '16:30', starts_in_label: 'Today', reminder_on: true },
  { id: 'u3', title: 'SEO Writing that Converts', instructor_name: 'Jamie Smith', category: 'Marketing', starts_at: '18:00', starts_in_label: 'Today', reminder_on: false },
];

export default function LearnerLiveClassScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState('All');
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [live, up] = await Promise.all([getLiveNow(), getUpcomingClasses()]);
        if (!cancelled) {
          setLiveSessions(live.length ? live : FALLBACK_LIVE);
          setUpcoming(up.length ? up : FALLBACK_UPCOMING);
        }
      } catch (e) {
        if (!cancelled) {
          setLiveSessions(FALLBACK_LIVE);
          setUpcoming(FALLBACK_UPCOMING);
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
      <View style={styles.loadingPage}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading live classes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Filter chips */}
        <View style={styles.chipsWrap}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, f === filter && styles.chipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.chipText, f === filter && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live Now */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.liveNowTitleRow}>
              <View style={styles.liveDot} />
              <Text style={styles.sectionTitle}>Live Now</Text>
            </View>
            <Text style={styles.activeCount}>{liveSessions.length} active</Text>
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
            <Text style={styles.sectionTitle}>Upcoming Classes</Text>
            <Text style={styles.seeAllMuted}>See All</Text>
          </View>
          <View style={styles.upcomingList}>
            {upcoming.map((c) => {
              const isPrimary = c.starts_in_label?.toLowerCase().includes('starts') ?? false;
              const reminderOn = reminders[c.id] ?? c.reminder_on ?? false;
              return (
                <View key={c.id} style={styles.upcomingCard}>
                  <View style={[styles.timeBox, isPrimary && styles.timeBoxPrimary]}>
                    <Text style={[styles.timeText, isPrimary && styles.timeTextPrimary]}>{c.starts_at}</Text>
                    <Text style={[styles.timeLabel, isPrimary && styles.timeLabelPrimary]}>
                      {c.starts_in_label ?? 'Today'}
                    </Text>
                  </View>
                  <View style={styles.upcomingBody}>
                    <Text style={styles.upcomingTitle} numberOfLines={1}>{c.title}</Text>
                    <View style={styles.upcomingMeta}>
                      <Text style={styles.upcomingMetaText}>by {c.instructor_name}</Text>
                      <Text style={styles.upcomingDot}>•</Text>
                      <Text style={styles.upcomingMetaText}>{c.category ?? 'General'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.bellBtn, reminderOn && styles.bellBtnActive]}
                    onPress={() => toggleReminder(c.id)}
                  >
                    <Icon name="notifications" size={20} color={reminderOn ? COLORS.primary : COLORS.textDim} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={goToLearnerHome}>
          <Icon name="home" size={24} color={COLORS.textMuted} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToDashboard}>
          <Icon name="dashboard" size={24} color={COLORS.textMuted} />
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LearnerProfile')}>
          <View>
            <Icon name="live_tv" size={24} color={COLORS.primary} />
            <View style={styles.navLiveDot} />
          </View>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Live Classes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToNotifications}>
          <Icon name="notifications" size={24} color={COLORS.textMuted} />
          <Text style={styles.navLabel}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="person" size={24} color={COLORS.textMuted} />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.backgroundDark },
  loadingPage: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundDark },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textMuted },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: 'rgba(16,22,34,0.95)',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  navItem: { alignItems: 'center', minWidth: 48 },
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
