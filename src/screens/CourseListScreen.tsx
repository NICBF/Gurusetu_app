/**
 * All Courses screen: Shows all available courses in a grid layout matching HTML design.
 * Dark theme with course cards showing thumbnail, title, description, instructor info, and action buttons.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import api from '../services/api';
import { API_BASE } from '../config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2; // 2 columns with padding

type Nav = NativeStackNavigationProp<RootStackParamList>;

const COLORS = {
  bg: '#0a0e27',
  bgGradient: '#1a1f3a',
  primary: '#667eea',
  primaryDark: '#764ba2',
  white: '#ffffff',
  white80: 'rgba(255,255,255,0.8)',
  white70: 'rgba(255,255,255,0.7)',
  white60: 'rgba(255,255,255,0.6)',
  white20: 'rgba(255,255,255,0.2)',
  border: 'rgba(102,126,234,0.3)',
  success: '#10b981',
  successDark: '#059669',
};

interface Course {
  id?: string | number;
  course_id?: string | number;
  name?: string;
  title?: string;
  thumbnail_url?: string;
  description?: string;
  instructor_name?: string;
  instructor_bio?: string;
  lectures_count?: number;
  is_enrolled?: boolean;
  is_completed?: boolean;
  [key: string]: unknown;
}

export default function CourseListScreen() {
  const { role, user } = useAuth();
  const navigation = useNavigation<Nav>();
  const [list, setList] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isFaculty = role === 'Professor' || role === 'admin';
  const endpoint = isFaculty ? '/instructor/courses' : '/my-courses';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        console.log('[CourseList] Fetching courses from:', endpoint);
        const { data } = await api.get(endpoint);
        console.log('[CourseList] Response:', data);
        const arr = Array.isArray(data) ? data : (data?.courses ?? data?.items ?? []);
        if (!cancelled) {
          const courses = Array.isArray(arr) ? arr : [];
          setList(courses);
          // Track enrolled course IDs
          const enrolled = new Set<string>();
          courses.forEach((c: Course) => {
            const cid = String(c.course_id ?? c.id);
            if (c.is_enrolled || cid) enrolled.add(cid);
          });
          setEnrolledCourseIds(enrolled);
          console.log('[CourseList] Loaded', courses.length, 'courses');
        }
      } catch (e) {
        console.error('[CourseList] Error:', e);
        if (!cancelled) {
          const errorMsg =
            e && typeof e === 'object' && 'response' in e
              ? (e as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail ||
                'Failed to load courses'
              : 'Failed to load courses';
          setError(errorMsg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [endpoint, role]);

  const handleEnroll = async (courseId: string) => {
    try {
      await api.post('/enroll', { course_id: courseId });
      setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
      Alert.alert('Success', 'Successfully enrolled in course!');
    } catch (e) {
      console.error('[CourseList] Enrollment error:', e);
      const errorMsg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to enroll'
          : 'Failed to enroll';
      Alert.alert('Error', errorMsg);
    }
  };

  const renderItem = ({ item }: { item: Course }) => {
    const name = item.name ?? item.title ?? `Course ${item.id ?? item.course_id}`;
    const courseId = String(item.course_id ?? item.id);
    const isEnrolled = enrolledCourseIds.has(courseId);
    let thumbnail = item.thumbnail_url;
    if (thumbnail && !thumbnail.startsWith('http')) {
      const base = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
      thumbnail = base ? `${base}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}` : null;
    }
    const desc = item.description || '';
    const instructorName = item.instructor_name || 'Instructor';
    const instructorBio = item.instructor_bio || '';

    return (
      <View style={styles.courseCard}>
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.thumbnailIcon}>📚</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {name}
          </Text>
          {desc ? (
            <Text style={styles.cardDescription} numberOfLines={3}>
              {desc}
            </Text>
          ) : null}

          {/* Instructor Info */}
          <View style={styles.instructorCardInfo}>
            <View style={styles.instructorCardAvatar}>
              <Text style={styles.instructorCardIcon}>👨‍🏫</Text>
            </View>
            <View style={styles.instructorCardDetails}>
              <Text style={styles.instructorCardLabel}>Instructor</Text>
              <Text style={styles.instructorCardName} numberOfLines={1}>
                {instructorName}
              </Text>
              {instructorBio ? (
                <Text style={styles.instructorCardBio} numberOfLines={1}>
                  {instructorBio.substring(0, 50)}...
                </Text>
              ) : null}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.cardButtons}>
            <TouchableOpacity
              style={[styles.cardBtn, isEnrolled && styles.cardBtnEnrolled]}
              onPress={() => {
                if (!isEnrolled) {
                  handleEnroll(courseId);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.cardBtnText}>{isEnrolled ? '✓ Enrolled' : 'Enroll Now'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardBtn}
              onPress={() => navigation.navigate('CourseDetail', { courseId })}
              activeOpacity={0.8}
            >
              <Text style={styles.cardBtnText}>{isEnrolled ? 'Go to Course' : 'Preview'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  if (error)
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Courses</Text>
      </View>
      <FlatList
        data={list}
        keyExtractor={(item) => String(item.course_id ?? item.id ?? Math.random())}
        renderItem={renderItem}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={<Text style={styles.empty}>No courses available</Text>}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  error: {
    padding: 20,
    color: COLORS.white,
    textAlign: 'center',
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '700',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  courseCard: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.primary,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailIcon: {
    fontSize: 64,
  },
  cardContent: {
    padding: 20,
    flex: 1,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 24,
  },
  cardDescription: {
    color: COLORS.white70,
    fontSize: 13,
    marginBottom: 15,
    lineHeight: 18,
    flex: 1,
  },
  instructorCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.primary + '26',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  instructorCardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '4d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructorCardIcon: {
    fontSize: 32,
  },
  instructorCardDetails: {
    flex: 1,
  },
  instructorCardLabel: {
    color: COLORS.primary,
    fontSize: 11,
    marginBottom: 3,
  },
  instructorCardName: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  instructorCardBio: {
    color: COLORS.white60,
    fontSize: 12,
    marginTop: 2,
  },
  cardButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cardBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  cardBtnEnrolled: {
    backgroundColor: COLORS.success,
  },
  cardBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    padding: 40,
    color: COLORS.white60,
    textAlign: 'center',
    fontSize: 16,
  },
});
