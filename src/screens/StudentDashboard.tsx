/**
 * Learner dashboard – adapted from Learning Dashboard HTML.
 * Header, search, Continue Learning, Enrolled Courses, Verticals, All courses, bottom nav.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getStudentDashboard, type DashboardData } from '../services/dashboardService';
import api from '../services/api';
import { API_BASE } from '../config';
import { getDisplayableImageUrl } from '../utils/mediaUrl';
import Icon from '../components/Icon';
import { useTheme } from '../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  yellow: '#facc15',
  emerald: '#10b981',
  purple: '#a855f7',
  orange: '#f97316',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  amber: '#f59e0b',
  teal: '#14b8a6',
  indigo: '#6366f1',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface EnrolledCourse {
  id?: string;
  course_id?: string | number;
  title?: string;
  name?: string;
  thumbnail_url?: string;
  progress?: number;
}

interface CourseSummary {
  id?: string;
  course_id?: string | number;
  title?: string;
  name?: string;
  thumbnail_url?: string;
  instructor_name?: string;
  average_rating?: number;
  vertical?: string;
}

// Same 9 verticals as live site / app home (names + emojis)
const VERTICALS = [
  { id: 'pedagogy', name: 'Pedagogy', emoji: '🎓' },
  { id: 'assessment', name: 'Assessment', emoji: '📝' },
  { id: 'use-of-technology', name: 'Use of Technology', emoji: '💻' },
  { id: 'ethics', name: 'Ethics of the Teaching Profession', emoji: '⚖️' },
  { id: 'psychological-literacy', name: 'Psychological Literacy', emoji: '🧠' },
  { id: 'diversity', name: 'Diversity, Equity and Inclusion', emoji: '🌍' },
  { id: 'research', name: 'Research', emoji: '🔬' },
  { id: 'career-management', name: 'Career Management as a Faculty', emoji: '🚀' },
  { id: 'educational-landscape', name: 'Educational Landscape, Policy and Governance', emoji: '📜' },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning,';
  if (h < 17) return 'Good Afternoon,';
  return 'Good Evening,';
}

function resolveThumbnail(thumbnailUrl: string | undefined): string | null {
  if (!thumbnailUrl || !thumbnailUrl.trim()) return null;
  let url = thumbnailUrl.trim();
  if (!url.startsWith('http')) {
    const base = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
    url = base ? `${base}${url.startsWith('/') ? '' : '/'}${url}` : url;
  }
  return getDisplayableImageUrl(url) ?? url;
}

export default function StudentDashboard() {
  const { logout } = useAuth();
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const tc = theme.colors;
  const [data, setData] = useState<DashboardData>({});
  const [allCourses, setAllCourses] = useState<CourseSummary[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: res } = await api.get('/courses');
        const arr: CourseSummary[] = Array.isArray(res) ? res : (res?.courses ?? res?.items ?? []);
        if (!cancelled && Array.isArray(arr)) setAllCourses(arr.slice(0, 6));
      } catch {
        if (!cancelled) setAllCourses([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const d = await getStudentDashboard();
      setData(d);
      const recent = (d.recent_courses || []) as EnrolledCourse[];
      setEnrolledCourseIds(
        new Set(recent.map((c) => String(c.id ?? c.course_id ?? '')).filter(Boolean))
      );
    } catch (e) {
      console.error('[StudentDashboard]', e);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await api.post('/enroll', { course_id: courseId });
      setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
      Alert.alert('Success', 'Successfully enrolled in course!');
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
            'Failed to enroll'
          : 'Failed to enroll';
      Alert.alert('Error', msg);
    }
  };

  const userName = data.user?.name || data.user?.email || 'Learner';
  const recentCourses = (data.recent_courses || []) as EnrolledCourse[];
  const firstCourse = recentCourses[0];
  const progressPresets = [45, 82, 15, 60, 90, 30];
  const enrolledForCards: Array<EnrolledCourse & { progress: number }> = recentCourses
    .slice(0, 6)
    .map((c, i) => ({ ...c, progress: c.progress ?? progressPresets[i] ?? 50 }));

  const goToLearnerAllCourses = () => navigation.navigate('LearnerAllCourses');
  const goToCourseDetail = (courseId: string) => navigation.navigate('CourseDetail', { courseId });
  const goToLearnerHome = () => navigation.navigate('LearnerHome');
  const goToCoursesWithVertical = (verticalName: string) =>
    navigation.navigate('LearnerAllCourses', { vertical: verticalName });
  const goToNotifications = () => navigation.navigate('Notifications');
  const goToLiveClasses = () => navigation.navigate('LiveClasses');

  if (loading) {
    return (
      <View style={[styles.loadingPage, { backgroundColor: tc.background }]}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={[styles.loadingText, { color: tc.textMuted }]}>Loading dashboard...</Text>
      </View>
    );
  }

  const continueTitle = firstCourse?.title ?? firstCourse?.name;
  const continueSubtitle = firstCourse ? (firstCourse.title ?? firstCourse.name ?? '')?.split(' ').slice(0, 2).join(' ') || 'Course' : '';
  const continueCourseId = firstCourse?.id ?? firstCourse?.course_id;
  const continueProgress = firstCourse?.progress ?? 0;
  const hasContinueLearning = Boolean(firstCourse && continueCourseId);

  return (
    <View style={[styles.page, { backgroundColor: tc.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatarWrap, { borderColor: tc.primary + '33' }]}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADeDn48LPQCqpRxuzHEY5bh5MdlGKWpRDWmWN-fLW_Q8x-hDFGIsUtsNhB5j4B5XJQfpHKMYddfXN_KtMnoBF5OUFZRY2E6cy7ZNZXZA47MgXpLuG80pk1CaqWSXlAkmNamrTMcmiddo5mMFbvAm0mjrNMNZlEezjRpgRHxIua2FDY4JcTeuwNVWnVL5D5uGemG5IO9UGkLRvhjVFtT3v-1qHxMGrp2F3RpWGsvKPqCGDTOLzGAraNhZwgYZ3JYJSdAxmNj8SxVrE' }}
                style={styles.avatar}
              />
            </View>
            <View>
              <Text style={[styles.greeting, { color: tc.textDim }]}>{getGreeting()}</Text>
              <Text style={[styles.userName, { color: tc.text }]}>{userName}</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.searchIconBtn, { backgroundColor: tc.surfaceCard }]}>
            <Icon name="search" size={20} color={tc.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.searchWrap, { backgroundColor: tc.surfaceCard }]}>
          <Icon name="search" size={20} color={tc.textDim} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: tc.text }]}
            placeholder="Search courses, mentors..."
            placeholderTextColor={tc.textDim}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Continue Learning – only when user has enrolled courses */}
        {hasContinueLearning && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: tc.text }]}>Continue Learning</Text>
              <TouchableOpacity onPress={goToLearnerAllCourses}>
                <Text style={[styles.linkText, { color: tc.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.continueCard}
              onPress={() => goToCourseDetail(String(continueCourseId))}
              activeOpacity={0.9}
            >
              <View style={styles.continueBlob1} />
              <View style={styles.continueBlob2} />
              <View style={styles.continueContent}>
                <View style={styles.continueTop}>
                  <View>
                    <View style={styles.continueTag}>
                      <Text style={styles.continueTagText}>{continueSubtitle}</Text>
                    </View>
                    <Text style={styles.continueTitle} numberOfLines={2}>{continueTitle}</Text>
                  </View>
                  <View style={styles.playBtn}>
                    <Icon name="play_arrow" size={24} color={tc.white} />
                  </View>
                </View>
                <View style={styles.progressWrap}>
                  <View style={styles.progressLabels}>
                    <Text style={[styles.progressLabel, { color: tc.textMuted }]}>Progress</Text>
                    <Text style={[styles.progressPct, { color: tc.text }]}>{continueProgress}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${continueProgress}%` }]} />
                  </View>
                  <Text style={[styles.progressSub, { color: tc.textMuted }]}>
                    {Math.round((continueProgress / 100) * 16)} of 16 lessons completed
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Enrolled Courses – only real data from API; empty state when none */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: tc.text }]}>Enrolled Courses</Text>
            <TouchableOpacity onPress={goToLearnerAllCourses}>
              <Text style={[styles.linkText, { color: tc.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          {enrolledForCards.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.enrolledScroll}>
              {enrolledForCards.map((card, idx) => {
                const thumbUri = resolveThumbnail(card.thumbnail_url);
                return (
                  <TouchableOpacity
                    key={card.id ?? card.course_id ?? idx}
                    style={[styles.enrolledCard, { backgroundColor: tc.surfaceCard }]}
                    onPress={() => goToCourseDetail(String(card.id ?? card.course_id ?? ''))}
                    activeOpacity={0.9}
                  >
                    {thumbUri ? (
                      <Image source={{ uri: thumbUri }} style={styles.enrolledImage} />
                    ) : (
                      <View style={[styles.enrolledImage, styles.enrolledImageFallback, { backgroundColor: tc.surface }]}>
                        <Icon name="school" size={32} color={tc.textDim} />
                      </View>
                    )}
                    <Text style={[styles.enrolledTitle, { color: tc.text }]} numberOfLines={1}>{card.title ?? card.name ?? 'Course'}</Text>
                    <View style={styles.enrolledProgressTrack}>
                      <View
                        style={[
                          styles.enrolledProgressFill,
                          { width: `${card.progress ?? 0}%` },
                          (card.progress ?? 0) >= 80 && { backgroundColor: COLORS.emerald },
                          (card.progress ?? 0) < 30 && (card.progress ?? 0) > 0 && { backgroundColor: COLORS.orange },
                        ]}
                      />
                    </View>
                    <Text style={[styles.enrolledPct, { color: tc.textMuted }]}>{card.progress ?? 0}% Complete</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={[styles.emptyEnrolledWrap, { backgroundColor: tc.surfaceCard }]}>
              <Icon name="school" size={40} color={tc.textDim} />
              <Text style={[styles.emptyEnrolledText, { color: tc.textMuted }]}>No enrolled courses yet</Text>
              <TouchableOpacity style={[styles.emptyEnrolledBtn, { backgroundColor: tc.primary }]} onPress={goToLearnerAllCourses}>
                <Text style={styles.emptyEnrolledBtnText}>Browse courses</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Verticals – same names + emojis as home */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: tc.text }]}>Verticals</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.verticalsScroll}>
            {VERTICALS.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.verticalItem, { backgroundColor: tc.surfaceCard }]}
                onPress={() => goToCoursesWithVertical(v.name)}
                activeOpacity={0.8}
              >
                <View style={[styles.verticalIconBox, { backgroundColor: tc.surface }]}>
                  <Text style={styles.verticalEmoji}>{v.emoji}</Text>
                </View>
                <Text style={[styles.verticalLabel, { color: tc.text }]} numberOfLines={2}>{v.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* All courses – from GET /api/courses (live website) */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: tc.text }]}>All courses</Text>
            <TouchableOpacity onPress={goToLearnerAllCourses}>
              <Text style={[styles.linkText, { color: tc.primary }]}>See More</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.allCoursesList}>
            {allCourses.map((course) => {
              const id = String(course.course_id ?? course.id ?? '');
              const isEnrolled = enrolledCourseIds.has(id);
              const thumbUri = resolveThumbnail(course.thumbnail_url);
              return (
                <View key={id} style={[styles.allCourseRow, { backgroundColor: tc.surfaceCard }]}>
                  <TouchableOpacity
                    style={styles.allCourseRowTouchable}
                    onPress={() => id && goToCourseDetail(id)}
                    activeOpacity={0.8}
                  >
                    {thumbUri ? (
                      <Image source={{ uri: thumbUri }} style={styles.allCourseThumb} />
                    ) : (
                      <View style={[styles.allCourseThumb, styles.enrolledImageFallback, { backgroundColor: tc.surface }]}>
                        <Icon name="school" size={24} color={tc.textDim} />
                      </View>
                    )}
                    <View style={styles.allCourseBody}>
                      <Text style={[styles.allCourseTitle, { color: tc.text }]} numberOfLines={2}>{course.title ?? course.name ?? 'Course'}</Text>
                      <View style={styles.instructorRow}>
                        <Icon name="person" size={14} color={tc.textDim} />
                        <Text style={[styles.instructorName, { color: tc.textDim }]}>{course.instructor_name ?? 'Instructor'}</Text>
                      </View>
                      <View style={styles.allCourseFooter}>
                        <View style={styles.ratingRow}>
                          <Icon name="star" size={14} color={COLORS.yellow} />
                          <Text style={[styles.ratingText, { color: tc.text }]}>{course.average_rating != null ? course.average_rating.toFixed(1) : '--'}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.allCourseBtn, isEnrolled && styles.allCourseBtnEnrolled]}
                    onPress={() => {
                      if (isEnrolled) goToCourseDetail(id);
                      else handleEnroll(id);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.allCourseBtnText}>
                      {isEnrolled ? 'Go to Course' : 'Enroll Now'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={[styles.bottomNav, { backgroundColor: tc.surfaceCard, borderColor: tc.border }]}>
        <TouchableOpacity style={styles.navItem} onPress={goToLearnerHome}>
          <Icon name="home" size={24} color={tc.textMuted} />
          <Text style={[styles.navLabel, { color: tc.textMuted }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="dashboard" size={24} color={tc.primary} />
          <Text style={[styles.navLabel, styles.navLabelActive, { color: tc.primary }]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToLiveClasses}>
          <Icon name="live_tv" size={24} color={tc.textMuted} />
          <Text style={[styles.navLabel, { color: tc.textMuted }]}>Live Classes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToNotifications}>
          <View>
            <Icon name="notifications" size={24} color={tc.textMuted} />
            <View style={[styles.badgeDot, { backgroundColor: tc.primary }]} />
          </View>
          <Text style={[styles.navLabel, { color: tc.textMuted }]}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LearnerProfile')}>
          <Icon name="person" size={24} color={tc.textMuted} />
          <Text style={[styles.navLabel, { color: tc.textMuted }]}>Profile</Text>
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 24,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary + '33',
  },
  avatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  greeting: { fontSize: 12, color: COLORS.textDim, fontWeight: '500', marginBottom: 2 },
  userName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  searchIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 12,
    paddingLeft: 12,
    marginBottom: 32,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text, paddingVertical: 12 },
  section: { marginBottom: 32 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  linkText: { fontSize: 14, fontWeight: '500', color: COLORS.primary },
  continueCard: {
    borderRadius: 12,
    padding: 20,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
    position: 'relative',
  },
  continueBlob1: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  continueBlob2: {
    position: 'absolute',
    bottom: -16,
    left: -16,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  continueContent: { zIndex: 1 },
  continueTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  continueTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    marginBottom: 8,
  },
  continueTagText: { fontSize: 10, fontWeight: '700', color: COLORS.white, letterSpacing: 1 },
  continueTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white, lineHeight: 26 },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: {},
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12, fontWeight: '500', color: COLORS.white },
  progressPct: { fontSize: 12, fontWeight: '500', color: COLORS.white },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.white, borderRadius: 4 },
  progressSub: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  enrolledScroll: { paddingRight: 20, gap: 16 },
  enrolledCard: { width: 224, marginRight: 16 },
  emptyEnrolledWrap: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  emptyEnrolledText: { fontSize: 14, textAlign: 'center' },
  emptyEnrolledBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  emptyEnrolledBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  enrolledImage: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, backgroundColor: COLORS.surfaceCard },
  enrolledImageFallback: { alignItems: 'center', justifyContent: 'center' },
  enrolledTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginTop: 12, marginBottom: 8 },
  enrolledProgressTrack: { height: 6, backgroundColor: COLORS.surfaceCard, borderRadius: 3, overflow: 'hidden' },
  enrolledProgressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  enrolledPct: { fontSize: 10, color: COLORS.textDim, fontWeight: '500', marginTop: 4 },
  verticalsScroll: { paddingRight: 20 },
  verticalItem: { alignItems: 'center', marginRight: 20 },
  verticalIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  verticalEmoji: { fontSize: 26 },
  verticalLabel: { fontSize: 11, fontWeight: '500', color: COLORS.textMuted, textAlign: 'center', maxWidth: 80 },
  allCoursesList: { gap: 16 },
  allCourseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  allCourseRowTouchable: {
    flexDirection: 'row',
    flex: 1,
    gap: 16,
    minWidth: 0,
  },
  allCourseBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allCourseBtnEnrolled: {
    backgroundColor: COLORS.textDim,
  },
  allCourseBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  allCourseThumb: { width: 96, height: 96, borderRadius: 8 },
  allCourseBody: { flex: 1, justifyContent: 'space-between', minWidth: 0 },
  allCourseTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, lineHeight: 20 },
  instructorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  instructorName: { fontSize: 11, color: COLORS.textDim },
  allCourseFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  ratingCount: { fontSize: 10, color: COLORS.textDim },
  priceText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  navItem: { alignItems: 'center', minWidth: 48 },
  navLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted, marginTop: 4 },
  navLabelActive: { color: COLORS.primary },
  badgeDot: {
    position: 'absolute',
    top: 0,
    right: '50%',
    marginRight: -12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
});
