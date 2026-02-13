/**
 * Learner home screen – mirrors live GuruSetu website.
 * For learner login only. Professor/admin flows come later.
 * Sections: hero, verticals, top trending courses, why GuruSetu, testimonials, FAQ, bottom nav.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Icon from '../components/Icon';
import api from '../services/api';
import { resolveThumbnailUrl } from '../utils/mediaUrl';
import { useTheme } from '../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#135bec',
  backgroundDark: '#101622',
  backgroundLight: '#f6f6f8',
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
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface CourseSummary {
  id?: string;
  course_id?: string;
  title?: string;
  name?: string;
  thumbnail_url?: string;
  instructor_name?: string;
  average_rating?: number;
  rating?: number;
  students_count?: number;
}

// Verticals from live site login page (icons + names)
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

// Fallback trending list used only if API call fails
const TRENDING_FALLBACK: Array<{
  id: string;
  title: string;
  description: string;
}> = [
  {
    id: 'V8',
    title: 'Lesson Plan - Effective tool for Teaching',
    description:
      'Design outcome-based lesson plans that drive engagement and measurable learning.',
  },
  {
    id: 'V10',
    title: 'Research Grant Writing & Publication',
    description:
      'Learn the essentials of grant writing and publishing in reputed journals.',
  },
];

const WHY_ITEMS = [
  { icon: 'auto_awesome' as const, title: 'Innovative Teaching', subtitle: 'Modern tools for contemporary faculty.', color: COLORS.primary },
  { icon: 'trending_up' as const, title: 'Career Growth', subtitle: 'Accelerate your professional journey.', color: COLORS.emerald },
  { icon: 'hub' as const, title: 'Peer Networking', subtitle: 'Connect with global educators.', color: COLORS.purple },
  { icon: 'verified_user' as const, title: 'Expert Mentorship', subtitle: 'Learn from seasoned experts.', color: COLORS.orange },
];

const FAQ_ITEMS = [
  { q: 'How do I get certification?', a: 'Complete all modules and assessments in a course to earn your certificate.' },
  { q: 'Are these courses UGC recognized?', a: 'Please check the course description or contact support for recognition details.' },
];

// Local logo and ministry assets (bundled with app)
const LOGO_SOURCE = require('../../assets/logo.png');
const MINISTRY_SOURCE = require('../../assets/ministry-of-edu.png');

export default function LearnerHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [trending, setTrending] = useState<CourseSummary[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const c = theme.colors;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/my-courses');
        const arr = Array.isArray(data) ? data : (data?.courses ?? data?.items ?? []);
        const ids = new Set<string>();
        (Array.isArray(arr) ? arr : []).forEach((item: { course_id?: string; id?: string }) => {
          const id = String(item.course_id ?? item.id ?? '');
          if (id) ids.add(id);
        });
        if (!cancelled) setEnrolledCourseIds(ids);
      } catch {
        if (!cancelled) setEnrolledCourseIds(new Set());
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleEnroll = async (courseId: string) => {
    try {
      await api.post('/enroll', { course_id: courseId });
      setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
      Alert.alert('Success', 'Successfully enrolled in course!');
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to enroll'
          : 'Failed to enroll';
      Alert.alert('Error', msg);
    }
  };

  const goToCourses = () => navigation.navigate('LearnerAllCourses');
  const goToCoursesWithVertical = (verticalName: string) =>
    navigation.navigate('LearnerAllCourses', { vertical: verticalName });
  const goToCourseDetail = (courseId: string) => navigation.navigate('CourseDetail', { courseId });
  const goToDashboard = () => navigation.navigate('StudentDashboard');
  const goToNotifications = () => navigation.navigate('Notifications');
  const goToLiveClasses = () => navigation.navigate('LiveClasses');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/courses');
        const arr: CourseSummary[] = Array.isArray(data)
          ? data
          : (data?.courses ?? data?.items ?? []);
        if (!Array.isArray(arr)) return;
        const sorted = [...arr].sort((a, b) => {
          const aScore = (a.students_count ?? 0) * 10 + (a.average_rating ?? a.rating ?? 0);
          const bScore = (b.students_count ?? 0) * 10 + (b.average_rating ?? b.rating ?? 0);
          return bScore - aScore;
        });
        if (!cancelled) {
          setTrending(sorted.slice(0, 3));
        }
      } catch {
        if (!cancelled) {
          // Fallback to hardcoded list mapped into CourseSummary
          setTrending(
            TRENDING_FALLBACK.map((c) => ({
              id: c.id,
              course_id: c.id,
              title: c.title,
              students_count: 0,
            })),
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={[styles.page, { backgroundColor: c.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header – local logo and ministry logo */}
        <View style={[styles.header, { backgroundColor: theme.isDarkMode ? 'rgba(16,22,34,0.8)' : c.surfaceCard }]}>
          <View style={styles.headerLeft}>
            <Image source={LOGO_SOURCE} style={styles.headerLogo} resizeMode="contain" />
            <View style={styles.gurusetuAndMinistry}>
              <Text style={[styles.logoTitle, { color: c.text }]}>GuruSetu</Text>
              <Image source={MINISTRY_SOURCE} style={[styles.headerMinistryLogo, { tintColor: theme.isDarkMode ? '#FFFFFF' : '#0f172a' }]} resizeMode="contain" />
            </View>
          </View>
          <TouchableOpacity style={[styles.searchBtn, { backgroundColor: c.surfaceCard }]}>
            <Icon name="search" size={20} color={c.text} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <View style={styles.heroBlob1} />
            <View style={styles.heroBlob2} />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                With GuruSetu, every step of your learning journey transforms into meaningful achievement
              </Text>
              <TouchableOpacity style={styles.heroBtn} onPress={goToCourses} activeOpacity={0.9}>
                <Text style={styles.heroBtnText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Verticals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Verticals</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.verticalsScroll}>
            {VERTICALS.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={styles.verticalItem}
                onPress={() => goToCoursesWithVertical(v.name)}
                activeOpacity={0.8}
              >
                <View style={styles.verticalIconBox}>
                  <Text style={styles.verticalEmoji}>{v.emoji}</Text>
                </View>
                <Text style={[styles.verticalLabel, { color: c.text }]} numberOfLines={2}>
                  {v.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Top Trending Courses – live data from backend */}
        {trending.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionRowLeft}>
                <Icon name="trending_up" size={22} color={COLORS.primary} />
                <Text style={[styles.sectionTitleLarge, { color: c.text }]}>Top Trending Courses</Text>
              </View>
              <TouchableOpacity onPress={goToCourses}>
                <Text style={[styles.seeAll, { color: c.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.coursesList}>
              {trending.map((course) => {
                const id = String(course.course_id ?? course.id ?? '');
                if (!id) return null;
                const title = course.title ?? course.name ?? 'Course';
                const instructor = course.instructor_name ?? 'Instructor';
                const rating = course.average_rating ?? course.rating ?? 0;
                const thumb = resolveThumbnailUrl(course.thumbnail_url ?? '');
                return (
                  <View key={id} style={[styles.courseCard, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
                    <View style={styles.courseImageWrap}>
                      {thumb ? (
                        <Image source={{ uri: thumb }} style={styles.courseImage} />
                      ) : (
                        <View style={[styles.courseImageFallback, { backgroundColor: c.surface }]}>
                          <Icon name="school" size={26} color={c.textMuted} />
                        </View>
                      )}
                      <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
                        <Text style={styles.badgeText}>Trending</Text>
                      </View>
                      <View style={styles.courseImageGradient} />
                    </View>
                    <View style={styles.courseBody}>
                      <View style={styles.starRow}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Icon key={i} name="star" size={18} color={COLORS.yellow} />
                        ))}
                        <Text style={[styles.ratingText, { color: c.textMuted }]}>
                          {rating ? rating.toFixed(1) : '--'}
                        </Text>
                      </View>
                      <Text style={[styles.courseTitle, { color: c.text }]} numberOfLines={2}>
                        {title}
                      </Text>
                      <View style={[styles.instructorRow, { backgroundColor: c.surface, borderColor: c.border }]}>
                        <View style={[styles.instructorAvatarFallback, { backgroundColor: c.surfaceCard }]}>
                          <Icon name="person" size={20} color={c.primary} />
                        </View>
                        <View style={styles.instructorTextWrap}>
                          <Text style={[styles.instructorLabel, { color: c.textMuted }]}>Instructor</Text>
                          <Text style={[styles.instructorName, { color: c.text }]} numberOfLines={1}>{instructor}</Text>
                        </View>
                      </View>
                      <Text style={[styles.courseDesc, { color: c.textMuted }]} numberOfLines={3}>
                        {course.students_count
                          ? `${course.students_count.toLocaleString()} learners enrolled`
                          : 'Join faculty across India learning with GuruSetu.'}
                      </Text>
                      <TouchableOpacity
                        testID={`course-card-${id}`}
                        style={[styles.enrollBtn, enrolledCourseIds.has(id) && styles.enrollBtnEnrolled]}
                        onPress={() => {
                          if (enrolledCourseIds.has(id)) {
                            goToCourseDetail(id);
                          } else {
                            handleEnroll(id);
                          }
                        }}
                        activeOpacity={0.9}
                      >
                        <Text style={styles.enrollBtnText}>
                          {enrolledCourseIds.has(id) ? 'Go to Course' : 'Enroll Now'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Why GuruSetu */}
        <View style={[styles.section, styles.whySection, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Why GuruSetu?</Text>
          <View style={styles.whyGrid}>
            {WHY_ITEMS.map((item, i) => (
              <View key={i} style={[styles.whyCard, { backgroundColor: c.surfaceCard }]}>
                <View style={[styles.whyIconBox, { backgroundColor: item.color + '20' }]}>
                  <Icon name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={[styles.whyTitle, { color: c.text }]}>{item.title}</Text>
                <Text style={[styles.whySubtitle, { color: c.textDim }]}>{item.subtitle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Frequently Asked Questions</Text>
          {FAQ_ITEMS.map((faq, i) => (
            <View key={i} style={styles.faqItemWrap}>
              <TouchableOpacity
                style={[styles.faqItem, { backgroundColor: c.surfaceCard }]}
                onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
              >
                <Text style={[styles.faqQuestion, { color: c.text }]}>{faq.q}</Text>
                <Icon name="expand_more" size={20} color={c.textDim} />
              </TouchableOpacity>
              {expandedFaq === i && <Text style={[styles.faqAnswer, { color: c.textMuted }]}>{faq.a}</Text>}
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={[styles.bottomNav, { backgroundColor: c.surfaceCard }]}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color={c.primary} />
          <Text style={[styles.navLabel, styles.navLabelActive, { color: c.primary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToDashboard}>
          <Icon name="dashboard" size={24} color={c.textMuted} />
          <Text style={[styles.navLabel, { color: c.textMuted }]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToLiveClasses}>
          <View style={styles.fab}>
            <Icon name="live_tv" size={24} color={c.white} />
          </View>
          <Text style={[styles.navLabel, { color: c.textMuted }]}>Live</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToNotifications}>
          <View>
            <Icon name="notifications" size={24} color={c.textMuted} />
            <View style={styles.badgeDot} />
          </View>
          <Text style={[styles.navLabel, { color: c.textMuted }]}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LearnerProfile')}>
          <Icon name="person" size={24} color={c.textMuted} />
          <Text style={[styles.navLabel, { color: c.textMuted }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(16,22,34,0.8)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerLogo: { width: 36, height: 36 },
  gurusetuAndMinistry: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerMinistryLogo: { width: 96, height: 84, tintColor: '#FFFFFF' },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: { paddingHorizontal: 24, paddingVertical: 24 },
  heroCard: {
    borderRadius: 12,
    padding: 32,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
  },
  heroBlob1: {
    position: 'absolute',
    right: -40,
    bottom: -40,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroBlob2: {
    position: 'absolute',
    left: -40,
    top: -40,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(19,91,236,0.2)',
  },
  heroContent: { zIndex: 1 },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 30,
    marginBottom: 16,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  heroBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  section: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitleLarge: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  seeAll: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  verticalsScroll: { paddingHorizontal: 24, gap: 16 },
  verticalItem: { alignItems: 'center', marginRight: 16 },
  verticalIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  verticalEmoji: { fontSize: 26 },
  verticalLabel: { fontSize: 11, fontWeight: '500', color: COLORS.text, textAlign: 'center', maxWidth: 72 },
  coursesList: { paddingHorizontal: 24, gap: 32 },
  courseCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseImageWrap: { height: 208, position: 'relative' },
  courseImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  courseImageFallback: {
    flex: 1,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  courseImageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 96,
    backgroundColor: 'transparent',
  },
  courseBody: { padding: 24 },
  starRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, marginLeft: 8 },
  courseTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 26,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  instructorAvatar: { width: 40, height: 40, borderRadius: 20 },
  instructorAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructorTextWrap: { flex: 1, minWidth: 0 },
  instructorLabel: { fontSize: 10, fontWeight: '700', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  instructorName: { fontSize: 14, fontWeight: '700' },
  courseDesc: { fontSize: 14, color: COLORS.textMuted, marginBottom: 24, lineHeight: 20 },
  enrollBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  enrollBtnEnrolled: {
    backgroundColor: COLORS.textDim,
  },
  enrollBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  whySection: {
    backgroundColor: COLORS.surface,
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  whyCard: {
    width: (SCREEN_WIDTH - 24 * 2 - 16) / 2,
    backgroundColor: COLORS.surfaceCard,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  whyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  whyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  whySubtitle: { fontSize: 11, color: COLORS.textDim, lineHeight: 16 },
  faqItemWrap: { marginHorizontal: 24, marginBottom: 12 },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  faqQuestion: { fontSize: 14, fontWeight: '500', color: COLORS.text, flex: 1 },
  faqAnswer: {
    padding: 12,
    paddingTop: 0,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  navItem: { alignItems: 'center', minWidth: 48 },
  navLabel: { fontSize: 10, fontWeight: '500', color: COLORS.textMuted, marginTop: 4 },
  navLabelActive: { fontWeight: '700', color: COLORS.primary },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
  badgeDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
});
