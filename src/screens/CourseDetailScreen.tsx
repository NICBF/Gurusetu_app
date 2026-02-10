/**
 * Course detail with full info + video player. Shows intro video if no lectures exist.
 * Adapted from HTML design: dark theme, all course details, embedded player.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import api from '../services/api';
import { getVideoPlayableUrl } from '../utils/videoUrl';
import { getDisplayableImageUrl } from '../utils/mediaUrl';
import { API_BASE } from '../config';
import Icon from '../components/Icon';
import { CourseVideoPlayer } from './VideoPlayerScreen';

const COLORS = {
  bg: '#0a0e27',
  bgGradient: '#1a1f3a',
  primary: '#667eea',
  primaryDark: '#764ba2',
  white: '#ffffff',
  white80: 'rgba(255,255,255,0.8)',
  white60: 'rgba(255,255,255,0.6)',
  white20: 'rgba(255,255,255,0.2)',
  border: 'rgba(102,126,234,0.3)',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CourseDetail'>;

interface CourseData {
  course_id: string;
  title: string;
  description?: string;
  instructor_name?: string;
  instructor_bio?: string;
  instructor_photo_url?: string;
  intro_video_path?: string;
  thumbnail_url?: string;
  objectives?: string[];
  course_outcomes?: string[];
  ideal_for?: string[];
  resources?: Array<{ label: string; link: string }>;
  [key: string]: unknown;
}

export default function CourseDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { courseId } = route.params;
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [instructorPhotoError, setInstructorPhotoError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        console.log('[CourseDetail] Fetching course:', courseId);
        const { data } = await api.get(`/courses/${courseId}`);
        console.log('[CourseDetail] Course data received:', data);
        if (!cancelled) {
          setCourse(data as CourseData);
          setInstructorPhotoError(false);
        }
      } catch (e) {
        console.error('[CourseDetail] Error:', e);
        if (!cancelled) {
          const errorMsg = e && typeof e === 'object' && 'response' in e
            ? (e as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail || 'Failed to load course'
            : 'Failed to load course';
          setError(errorMsg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating');
      return;
    }
    if (reviewText.trim().length < 10) {
      Alert.alert('Review Too Short', 'Please write at least 10 characters');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        course_id: courseId,
        rating,
        comment: reviewText.trim(),
      });
      Alert.alert('Success', 'Review submitted successfully!');
      setRating(0);
      setReviewText('');
    } catch (e) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <ActivityIndicator style={styles.centered} size="large" color={COLORS.primary} />;
  if (error || !course) return <Text style={styles.error}>{error || 'Course not found'}</Text>;

  const base = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
  const introVideoUri = course.intro_video_path
    ? getVideoPlayableUrl(course.intro_video_path)
    : null;
  let thumbnail = course.thumbnail_url;
  if (thumbnail && !thumbnail.startsWith('http')) {
    thumbnail = base ? `${base}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}` : null;
  }
  thumbnail = getDisplayableImageUrl(thumbnail) ?? thumbnail;
  let instructorPhotoUrl = course.instructor_photo_url;
  if (instructorPhotoUrl && !instructorPhotoUrl.startsWith('http')) {
    instructorPhotoUrl = base ? `${base}${instructorPhotoUrl.startsWith('/') ? '' : '/'}${instructorPhotoUrl}` : undefined;
  }
  instructorPhotoUrl = getDisplayableImageUrl(instructorPhotoUrl ?? '') ?? instructorPhotoUrl;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Intro video – inline expo-av player */}
      {introVideoUri ? (
        <View style={styles.videoContainer}>
          <CourseVideoPlayer
            videoUri={introVideoUri}
            title={course.title}
            showHeader={false}
          />
        </View>
      ) : null}

      {/* Course Details Section */}
      <View style={styles.detailsSection}>
        <Text style={styles.courseTitle}>{course.title}</Text>

        {/* Instructor Info */}
        <View style={styles.instructorInfo}>
          <View style={styles.instructorAvatar}>
            {instructorPhotoUrl && !instructorPhotoError ? (
              <Image
                source={{ uri: instructorPhotoUrl }}
                style={styles.instructorPhoto}
                onError={() => setInstructorPhotoError(true)}
              />
            ) : (
              <Text style={styles.instructorIcon}>👨‍🏫</Text>
            )}
          </View>
          <View>
            <Text style={styles.instructorLabel}>Instructor</Text>
            <Text style={styles.instructorName}>{course.instructor_name || 'Not specified'}</Text>
          </View>
        </View>

        {/* Instructor Bio */}
        {course.instructor_bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Instructor</Text>
            <Text style={styles.sectionText}>{course.instructor_bio}</Text>
          </View>
        )}

        {/* Module Description */}
        {course.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Module Description</Text>
            <Text style={styles.sectionText}>{course.description}</Text>
          </View>
        )}

        {/* Course Objectives */}
        {course.objectives && course.objectives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Course Objectives</Text>
            {course.objectives.map((obj, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.listBullet}>✓</Text>
                <Text style={styles.listText}>{obj}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Course Outcomes */}
        {course.course_outcomes && course.course_outcomes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Course Outcomes</Text>
            {course.course_outcomes.map((out, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.listBullet}>✓</Text>
                <Text style={styles.listText}>{out}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Targeted Audience */}
        {course.ideal_for && course.ideal_for.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Targeted Audience</Text>
            {course.ideal_for.map((aud, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.listBullet}>✓</Text>
                <Text style={styles.listText}>{aud}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Additional Resources */}
        {course.resources && course.resources.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Resources</Text>
            {course.resources.map((res, idx) => {
              const hasLink = !!res.link;
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.resourceItem}
                  activeOpacity={hasLink ? 0.7 : 1}
                  onPress={() => {
                    if (hasLink) Linking.openURL(res.link).catch(() => undefined);
                  }}
                  disabled={!hasLink}
                >
                  <Text style={[styles.resourceText, hasLink && styles.resourceLink]}>
                    {res.label || res.link || 'Resource'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Submit Review Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Submit a Review</Text>
          <View style={styles.starRating}>
            {[1, 2, 3, 4, 5].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRating(r)}
                style={styles.star}
              >
                <Text style={[styles.starText, r <= rating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.reviewTextarea}
            placeholder="Write your review here..."
            placeholderTextColor={COLORS.white60}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitReviewBtn, submittingReview && styles.submitReviewBtnDisabled]}
            onPress={handleSubmitReview}
            disabled={submittingReview}
          >
            <Text style={styles.submitReviewBtnText}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: COLORS.bg,
  },
  error: {
    padding: 20,
    color: COLORS.white,
    textAlign: 'center',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 30,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -35,
    marginLeft: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white20,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  playCenterVisible: {
    opacity: 1,
    backgroundColor: COLORS.primary + 'cc',
  },
  playIcon: {
    fontSize: 28,
    color: COLORS.white,
    marginLeft: 4,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.white20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnText: {
    color: COLORS.white,
    fontSize: 18,
  },
  timeText: {
    color: COLORS.white,
    fontSize: 13,
    minWidth: 100,
    textAlign: 'center',
  },
  speedWrap: {
    position: 'relative',
  },
  speedBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white20,
  },
  speedBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  speedMenu: {
    position: 'absolute',
    bottom: 44,
    right: 0,
    backgroundColor: 'rgba(20,20,30,0.95)',
    borderRadius: 10,
    minWidth: 100,
    overflow: 'hidden',
    zIndex: 20,
  },
  speedOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  speedOptionActive: {
    backgroundColor: COLORS.primary + '66',
  },
  speedOptionText: {
    color: COLORS.white60,
    fontSize: 14,
    textAlign: 'right',
  },
  detailsSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 30,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 20,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: COLORS.primary + '1a',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructorAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary + '4d',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  instructorPhoto: {
    width: 70,
    height: 70,
  },
  instructorIcon: {
    fontSize: 48,
  },
  instructorLabel: {
    color: COLORS.primary,
    fontSize: 14,
    marginBottom: 5,
  },
  instructorName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionText: {
    color: COLORS.white80,
    fontSize: 14,
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingLeft: 20,
  },
  listBullet: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: 10,
  },
  listText: {
    flex: 1,
    color: COLORS.white80,
    fontSize: 14,
    lineHeight: 20,
  },
  resourceItem: {
    paddingVertical: 6,
  },
  resourceText: {
    color: COLORS.white80,
    fontSize: 14,
  },
  resourceLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  reviewSection: {
    marginTop: 20,
  },
  starRating: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  star: {
    padding: 4,
  },
  starText: {
    fontSize: 32,
    color: COLORS.white20,
  },
  starActive: {
    color: '#ffd700',
  },
  reviewTextarea: {
    width: '100%',
    minHeight: 120,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 15,
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 15,
  },
  submitReviewBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitReviewBtnDisabled: {
    opacity: 0.6,
  },
  submitReviewBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  externalVideoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
    position: 'relative',
  },
  externalVideoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  externalVideoThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.bgGradient,
    justifyContent: 'center',
    alignItems: 'center',
  },
  externalVideoThumbnailIcon: {
    fontSize: 48,
    color: COLORS.primary,
    marginBottom: 8,
  },
  externalVideoThumbnailText: {
    fontSize: 14,
    color: COLORS.white60,
  },
  externalVideoInfo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  externalVideoTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  externalVideoNote: {
    color: COLORS.white80,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  externalVideoBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  externalVideoBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
