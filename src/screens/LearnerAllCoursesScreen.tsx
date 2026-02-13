/**
 * Learner All Courses screen – adapted from \"All Courses List\" HTML.
 * Uses /courses when available, falls back to /my-courses so existing APIs keep working.
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import api from '../services/api';
import { API_BASE } from '../config';
import { getDisplayableImageUrl } from '../utils/mediaUrl';
import Icon from '../components/Icon';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const COLORS = {
  primary: '#135bec',
  backgroundDark: '#101622',
  surfaceCard: '#1e293b',
  border: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  white: '#ffffff',
  yellow: '#facc15',
};

interface Course {
  id?: string | number;
  course_id?: string | number;
  title?: string;
  name?: string;
  vertical?: string;
  instructor_name?: string;
  thumbnail_url?: string;
  thumbnail?: string;
  average_rating?: number;
  rating?: number;
  reviews_count?: number;
  is_enrolled?: boolean;
  [key: string]: unknown;
}

// Match live site verticals (same as LearnerHomeScreen)
const VERTICAL_NAMES = [
  'Pedagogy',
  'Assessment',
  'Use of Technology',
  'Ethics of the Teaching Profession',
  'Psychological Literacy',
  'Diversity, Equity and Inclusion',
  'Research',
  'Career Management as a Faculty',
  'Educational Landscape, Policy and Governance',
];
const FILTERS = ['All Verticals', ...VERTICAL_NAMES];

async function fetchLearnerCourses(): Promise<Course[]> {
  try {
    const { data } = await api.get('/courses');
    const arr = Array.isArray(data) ? data : (data?.courses ?? data?.items ?? []);
    return Array.isArray(arr) ? arr : [];
  } catch {
    try {
      const { data } = await api.get('/my-courses').catch(() => ({ data: [] }));
      const arr = Array.isArray(data) ? data : (data?.courses ?? data?.items ?? []);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
}

async function fetchEnrolledCourseIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  try {
    const { data } = await api.get('/my-courses');
    const arr = Array.isArray(data) ? data : (data?.courses ?? data?.items ?? []);
    (Array.isArray(arr) ? arr : []).forEach((c: Course) => {
      const id = String(c.course_id ?? c.id ?? '');
      if (id) ids.add(id);
    });
  } catch {
    // ignore
  }
  return ids;
}

export default function LearnerAllCoursesScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'LearnerAllCourses'>>();
  const initialVertical = route.params?.vertical;
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>(initialVertical ?? 'All Verticals');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [list, enrolled] = await Promise.all([
          fetchLearnerCourses(),
          fetchEnrolledCourseIds(),
        ]);
        if (!cancelled) {
          setCourses(list);
          setEnrolledCourseIds(enrolled);
        }
      } catch (e) {
        if (!cancelled) setError('Failed to load courses.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      const title = (c.title ?? c.name ?? '').toString().toLowerCase();
      const instructor = (c.instructor_name ?? '').toString().toLowerCase();
      const vertical = (c.vertical ?? '').toString().toLowerCase();
      const matchesSearch = !q || title.includes(q) || instructor.includes(q);
      const matchesFilter =
        filter === 'All Verticals' || !filter
          ? true
          : vertical.includes(filter.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  }, [courses, search, filter]);

  const resultCount = filteredCourses.length;

  const goToCourseDetail = (courseId: string) => {
    if (!courseId) return;
    navigation.navigate('CourseDetail', { courseId });
  };

  if (loading) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading courses...</Text>
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

  const base = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Courses</Text>
            <View style={styles.headerIconCircle}>
              <Icon name="dashboard" size={20} color={COLORS.primary} />
            </View>
          </View>
          <View style={styles.searchWrap}>
            <Icon name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for courses..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                f === filter && styles.filterChipActive,
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  f === filter && styles.filterChipTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Result count + filter button (visual only) */}
        <View style={styles.resultRow}>
          <Text style={styles.resultText}>
            {resultCount} Result{resultCount === 1 ? '' : 's'} Found
          </Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="grading" size={16} color={COLORS.primary} />
            <Text style={styles.filterBtnText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Course cards */}
        <View style={styles.list}>
          {filteredCourses.map((c, idx) => {
            let thumb = c.thumbnail_url ?? c.thumbnail;
            if (thumb && !thumb.startsWith('http')) {
              thumb = base ? `${base}${thumb.startsWith('/') ? '' : '/'}${thumb}` : null;
            }
            thumb = getDisplayableImageUrl(thumb) ?? thumb;
            const courseId = String(c.course_id ?? c.id ?? '');
            const isEnrolled = enrolledCourseIds.has(courseId) || Boolean(c.is_enrolled);
            const title = c.title ?? c.name ?? 'Course';
            const instructor = c.instructor_name ?? 'Instructor';
            const rating = c.average_rating ?? c.rating ?? 0;
            const reviews = c.reviews_count ?? 0;
            return (
              <View key={String(c.id ?? c.course_id ?? idx)} style={styles.card}>
                <TouchableOpacity
                  style={styles.cardMain}
                  onPress={() => goToCourseDetail(courseId)}
                  activeOpacity={0.85}
                >
                  <View style={styles.thumbWrap}>
                    {thumb ? (
                      <Image source={{ uri: thumb }} style={styles.thumb} />
                    ) : (
                      <View style={styles.thumbPlaceholder}>
                        <Icon name="school" size={24} color={COLORS.textMuted} />
                      </View>
                    )}
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {title}
                    </Text>
                    <View style={styles.instructorRow}>
                      <Icon name="person" size={14} color={COLORS.textDim} />
                      <Text style={styles.instructorText}>{instructor}</Text>
                    </View>
                    <View style={styles.cardFooter}>
                      <View style={styles.ratingRow}>
                        <Icon name="star" size={14} color={COLORS.yellow} />
                        <Text style={styles.ratingText}>
                          {rating ? rating.toFixed(1) : '--'}
                        </Text>
                        {reviews ? (
                          <Text style={styles.ratingCount}>
                            ({reviews.toLocaleString()})
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.cardBtn, isEnrolled && styles.cardBtnEnrolled]}
                    onPress={() => {
                      if (isEnrolled) {
                        goToCourseDetail(courseId);
                      } else {
                        handleEnroll(courseId);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cardBtnText}>
                      {isEnrolled ? 'Go to Course' : 'Enroll Now'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          {filteredCourses.length === 0 && (
            <Text style={styles.emptyText}>No courses match your filters.</Text>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  loadingPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  errorText: {
    padding: 20,
    textAlign: 'center',
    color: '#fca5a5',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 4,
  },
  filterScroll: {
    paddingVertical: 8,
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#1e293b',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBtnText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row',
    padding: 12,
  },
  cardActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 10,
  },
  cardBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBtnEnrolled: {
    backgroundColor: COLORS.textDim,
  },
  cardBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  thumbWrap: {
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  thumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  instructorText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.textDim,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  ratingCount: {
    fontSize: 10,
    color: COLORS.textDim,
  },
  emptyText: {
    paddingVertical: 32,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textMuted,
  },
  bottomSpacer: {
    height: 40,
  },
});

