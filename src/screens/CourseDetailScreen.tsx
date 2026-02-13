/**
 * Course detail with full info + video player. Shows intro video if no lectures exist.
 * Adapted from HTML design: dark theme, all course details, embedded player.
 */
import React, { useEffect, useRef, useState } from 'react';
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
import { getDisplayableImageUrl, resolveThumbnailUrl } from '../utils/mediaUrl';
import { API_BASE } from '../config';
import Icon from '../components/Icon';
import { CourseVideoPlayer } from './VideoPlayerScreen';
import VideoFeedbackModal from '../components/VideoFeedbackModal';
import { checkVideoFeedback } from '../services/videoFeedbackService';
import QuizModal from '../components/QuizModal';
import { getCourseQuizzes, getQuiz, checkQuizCompletion, type Quiz } from '../services/quizService';
import AssignmentModal from '../components/AssignmentModal';
import { getCourseAssignments, getAssignment, type Assignment } from '../services/assignmentService';
import { useTheme } from '../theme/ThemeContext';

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
  const { theme } = useTheme();
  const c = theme.colors;
  const { courseId } = route.params;
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [instructorPhotoError, setInstructorPhotoError] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasFeedback, setHasFeedback] = useState<boolean | null>(null);
  const feedbackSubmittedThisSession = useRef(false);
  const [checkingFeedback, setCheckingFeedback] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean | null>(null);
  const [showAssignment, setShowAssignment] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentCompleted, setAssignmentCompleted] = useState<boolean | null>(null);

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

  // Check if feedback already exists for intro video (run for every course so "Rate this session" / "Feedback submitted" shows correctly)
  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    setCheckingFeedback(true);
    (async () => {
      try {
        const exists = await checkVideoFeedback(courseId, 'intro', true);
        if (!cancelled) setHasFeedback(exists);
      } catch (e) {
        console.error('[CourseDetail] Error checking feedback:', e);
        if (!cancelled && !feedbackSubmittedThisSession.current) setHasFeedback(false);
      } finally {
        if (!cancelled) setCheckingFeedback(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  // Load quizzes for the course and check completion status
  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    setLoadingQuizzes(true);
    (async () => {
      try {
        console.log('[CourseDetail] Fetching quizzes for course:', courseId);
        const quizList = await getCourseQuizzes(courseId);
        console.log('[CourseDetail] Quizzes received:', quizList);
        if (!cancelled) {
          setQuizzes(quizList);
          // If there's at least one quiz, check completion from list first, then load details
          if (quizList.length > 0) {
            const firstQuiz = quizList[0];
            // Check completion status from quiz list response
            const isCompletedFromList = firstQuiz.is_completed ?? firstQuiz.submission_status === 'completed' ?? (firstQuiz.score !== undefined && firstQuiz.score !== null);
            console.log('[CourseDetail] Quiz completion from list:', isCompletedFromList, firstQuiz);
            
            if (!cancelled) {
              setSelectedQuiz(firstQuiz);
              setQuizCompleted(isCompletedFromList);
            }
            
            // Also load full quiz details to get questions
            try {
              const quizDetails = await getQuiz(firstQuiz.id);
              console.log('[CourseDetail] Quiz details loaded:', quizDetails);
              if (!cancelled) {
                setSelectedQuiz({
                  ...quizDetails,
                  questions:
                    (quizDetails.questions && quizDetails.questions.length > 0)
                      ? quizDetails.questions
                      : (firstQuiz.questions && firstQuiz.questions.length > 0)
                        ? firstQuiz.questions
                        : quizDetails.questions,
                });
                const isCompletedFromDetails = quizDetails.is_completed ?? quizDetails.submission_status === 'completed' ?? (quizDetails.score !== undefined && quizDetails.score !== null);
                if (isCompletedFromDetails !== isCompletedFromList) {
                  console.log('[CourseDetail] Updating quiz completion status from details:', isCompletedFromDetails);
                  setQuizCompleted(isCompletedFromDetails);
                }
              }
            } catch (e) {
              console.error('[CourseDetail] Error loading quiz details:', e);
              if (!cancelled) setSelectedQuiz(firstQuiz);
            }
          } else {
            setQuizCompleted(false);
          }
        }
      } catch (e) {
        console.error('[CourseDetail] Error loading quizzes:', e);
        if (!cancelled) {
          setQuizzes([]);
          setQuizCompleted(false);
        }
      } finally {
        if (!cancelled) setLoadingQuizzes(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  // Load assignments for the course and check completion status
  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    setLoadingAssignments(true);
    (async () => {
      try {
        console.log('[CourseDetail] Fetching assignments for course:', courseId);
        const assignmentList = await getCourseAssignments(courseId);
        console.log('[CourseDetail] Assignments received:', assignmentList);
        if (!cancelled) {
          setAssignments(assignmentList);
          // If there's at least one assignment, select the first one
          if (assignmentList.length > 0) {
            const firstAssignment = assignmentList[0];
            setSelectedAssignment(firstAssignment);
            // Check if assignment is completed
            const isCompleted = firstAssignment.is_completed ?? false;
            console.log('[CourseDetail] Assignment completion status:', isCompleted);
            setAssignmentCompleted(isCompleted);
          } else {
            console.log('[CourseDetail] No assignments found for course');
            setAssignmentCompleted(false);
          }
        }
      } catch (e) {
        console.error('[CourseDetail] Error loading assignments:', e);
        if (!cancelled) {
          setAssignments([]);
          setAssignmentCompleted(false);
        }
      } finally {
        if (!cancelled) setLoadingAssignments(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  const handleVideoEnd = async () => {
    if (feedbackSubmittedThisSession.current) return;
    if (hasFeedback === null) {
      setTimeout(() => {
        if (!feedbackSubmittedThisSession.current) setShowFeedback(true);
      }, 500);
    } else if (!hasFeedback) {
      setShowFeedback(true);
    }
  };

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

  if (loading) return <View style={[styles.centered, { backgroundColor: c.background }]}><ActivityIndicator size="large" color={c.primary} /></View>;
  if (error || !course) return <View style={[styles.centered, { backgroundColor: c.background }]}><Text style={[styles.error, { color: c.text }]}>{error || 'Course not found'}</Text></View>;

  const base = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
  const introVideoUri = course.intro_video_path
    ? getVideoPlayableUrl(course.intro_video_path)
    : null;
  const thumbnail = resolveThumbnailUrl(course.thumbnail_url);
  let instructorPhotoUrl = course.instructor_photo_url;
  if (instructorPhotoUrl && !instructorPhotoUrl.startsWith('http')) {
    instructorPhotoUrl = base ? `${base}${instructorPhotoUrl.startsWith('/') ? '' : '/'}${instructorPhotoUrl}` : undefined;
  }
  instructorPhotoUrl = getDisplayableImageUrl(instructorPhotoUrl ?? '') ?? instructorPhotoUrl;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Intro video – inline player (expo-video) */}
      {introVideoUri ? (
        <View style={styles.videoContainer} testID="course-video-player">
          <CourseVideoPlayer
            videoUri={introVideoUri}
            title={course.title}
            thumbnailUri={thumbnail || undefined}
            courseId={courseId}
            isIntro={true}
            showHeader={false}
            onEnd={handleVideoEnd}
          />
        </View>
      ) : thumbnail ? (
        <View style={styles.videoContainer} testID="course-thumbnail">
          <Image source={{ uri: thumbnail }} style={styles.videoThumbnail} resizeMode="cover" />
        </View>
      ) : null}

      {/* Video feedback – show in all courses with intro video; after submit show "Feedback submitted" */}
      {courseId && (introVideoUri || hasFeedback === true) ? (
        hasFeedback === true ? (
          <View style={[styles.feedbackSubmittedRow, { backgroundColor: c.surfaceCard }]} testID="feedback-submitted">
            <Icon name="verified_user" size={20} color="#4CAF50" />
            <Text style={[styles.feedbackSubmittedText, { color: c.text }]}>Feedback submitted</Text>
          </View>
        ) : (
          <TouchableOpacity
            testID="rate-session-button"
            style={[styles.feedbackButton, { backgroundColor: c.primary }]}
            onPress={() => setShowFeedback(true)}
            activeOpacity={0.8}
          >
            <Icon name="grading" size={20} color={COLORS.white} />
            <Text style={styles.feedbackButtonText}>Rate this session</Text>
          </TouchableOpacity>
        )
      ) : null}

      {/* Quizzes – always show section; button when available */}
      {courseId && (
        <View style={styles.quizAssignmentSection}>
          {quizzes.length > 0 ? (
            quizCompleted ? (
              <View style={styles.quizCompletedContainer}>
                <Icon name="verified_user" size={20} color="#4CAF50" />
                <Text style={[styles.quizCompletedText, { color: c.text }]}>Quiz Finished</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.quizButton, { backgroundColor: c.primary }]}
                onPress={async () => {
                  if (!quizCompleted && selectedQuiz?.id) {
                    if (__DEV__) console.log('[CourseDetail] Quizzes tapped – opening quiz modal');
                    try {
                      const full = await getQuiz(selectedQuiz.id);
                      setSelectedQuiz({
                        ...full,
                        questions:
                          (full.questions && full.questions.length > 0 ? full.questions : selectedQuiz.questions) ?? full.questions,
                      });
                    } catch (e) {
                      console.error('[CourseDetail] Error loading quiz details:', e);
                    }
                    setShowQuiz(true);
                  }
                }}
                activeOpacity={0.8}
                disabled={quizCompleted === true}
              >
                <Icon name="quiz" size={20} color={c.white} />
                <Text style={styles.quizButtonText}>Quizzes</Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={[styles.quizAssignmentEmpty, { backgroundColor: c.surfaceCard }]}>
              <Icon name="quiz" size={20} color={c.textDim} />
              <Text style={[styles.quizAssignmentEmptyText, { color: c.textMuted }]}>No quizzes for this course</Text>
            </View>
          )}
        </View>
      )}

      {/* Assignments – always show section; button when available */}
      {courseId && (
            <View style={styles.quizAssignmentSection}>
          {assignments.length > 0 ? (
            assignmentCompleted ? (
              <View style={styles.assignmentCompletedContainer}>
                <Icon name="verified_user" size={20} color="#4CAF50" />
                <Text style={[styles.assignmentCompletedText, { color: c.text }]}>Assignment Finished</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.assignmentButton, { backgroundColor: c.primary }]}
                onPress={async () => {
                  if (!assignmentCompleted && selectedAssignment) {
                    const needsDetails =
                      !selectedAssignment.questions || selectedAssignment.questions.length === 0;
                    if (needsDetails && selectedAssignment.id) {
                      try {
                        const full = await getAssignment(String(selectedAssignment.id));
                        setSelectedAssignment(full);
                      } catch (e) {
                        console.error('[CourseDetail] Error loading assignment details:', e);
                      }
                    }
                    setShowAssignment(true);
                  }
                }}
                activeOpacity={0.8}
                disabled={assignmentCompleted === true}
              >
                <Icon name="grading" size={20} color={c.white} />
                <Text style={styles.assignmentButtonText}>Assignments</Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={[styles.quizAssignmentEmpty, { backgroundColor: c.surfaceCard }]}>
              <Icon name="grading" size={20} color={c.textDim} />
              <Text style={[styles.quizAssignmentEmptyText, { color: c.textMuted }]}>No assignments for this course</Text>
            </View>
          )}
        </View>
      )}

      {/* Course Details Section */}
      <View style={[styles.detailsSection, { backgroundColor: c.background }]}>
        <Text style={[styles.courseTitle, { color: c.text }]}>{course.title}</Text>

        {/* Instructor Info */}
        <View style={styles.instructorInfo}>
          <View style={[styles.instructorAvatar, { backgroundColor: c.surfaceCard }]}>
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
            <Text style={[styles.instructorLabel, { color: c.textMuted }]}>Instructor</Text>
            <Text style={[styles.instructorName, { color: c.text }]}>{course.instructor_name || 'Not specified'}</Text>
          </View>
        </View>

        {/* Instructor Bio */}
        {course.instructor_bio && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>About Instructor</Text>
            <Text style={[styles.sectionText, { color: c.textMuted }]}>{course.instructor_bio}</Text>
          </View>
        )}

        {/* Module Description */}
        {course.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Module Description</Text>
            <Text style={[styles.sectionText, { color: c.textMuted }]}>{course.description}</Text>
          </View>
        )}

        {/* Course Objectives */}
        {course.objectives && course.objectives.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Course Objectives</Text>
            {course.objectives.map((obj, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={[styles.listBullet, { color: c.primary }]}>✓</Text>
                <Text style={[styles.listText, { color: c.text }]}>{obj}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Course Outcomes */}
        {course.course_outcomes && course.course_outcomes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Course Outcomes</Text>
            {course.course_outcomes.map((out, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={[styles.listBullet, { color: c.primary }]}>✓</Text>
                <Text style={[styles.listText, { color: c.text }]}>{out}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Targeted Audience */}
        {course.ideal_for && course.ideal_for.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Targeted Audience</Text>
            {course.ideal_for.map((aud, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={[styles.listBullet, { color: c.primary }]}>✓</Text>
                <Text style={[styles.listText, { color: c.text }]}>{aud}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Additional Resources */}
        {course.resources && course.resources.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Additional Resources</Text>
            {course.resources.map((res, idx) => {
              const hasLink = !!res.link;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.resourceItem, { borderColor: c.border }]}
                  activeOpacity={hasLink ? 0.7 : 1}
                  onPress={() => {
                    if (hasLink) Linking.openURL(res.link).catch(() => undefined);
                  }}
                  disabled={!hasLink}
                >
                  <Text style={[styles.resourceText, { color: c.text }, hasLink && { color: c.primary }]}>
                    {res.label || res.link || 'Resource'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Submit Review Section */}
        <View style={styles.reviewSection}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Submit a Review</Text>
          <View style={styles.starRating}>
            {[1, 2, 3, 4, 5].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRating(r)}
                style={styles.star}
              >
                <Text style={[styles.starText, { color: c.textDim }, r <= rating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[styles.reviewTextarea, { backgroundColor: c.surfaceCard, borderColor: c.border, color: c.text }]}
            placeholder="Write your review here..."
            placeholderTextColor={c.textDim}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitReviewBtn, { backgroundColor: c.primary }, submittingReview && styles.submitReviewBtnDisabled]}
            onPress={handleSubmitReview}
            disabled={submittingReview}
          >
            <Text style={styles.submitReviewBtnText}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {courseId && (
        <VideoFeedbackModal
          isOpen={showFeedback && hasFeedback !== true && !feedbackSubmittedThisSession.current}
          onClose={() => setShowFeedback(false)}
          lectureTitle={course.title}
          courseId={courseId}
          lectureId="intro"
          isIntro={true}
          onSubmit={() => {
            feedbackSubmittedThisSession.current = true;
            setHasFeedback(true);
            setShowFeedback(false);
          }}
        />
      )}

      {selectedQuiz && !quizCompleted && (
        <QuizModal
          key={`quiz-${selectedQuiz.id}-${showQuiz}`}
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          quiz={selectedQuiz}
          onComplete={async (response) => {
            const score = response.score;
            const total = response.total;
            console.log('[CourseDetail] Quiz submitted:', score, '/', total, 'response:', response);
            setShowQuiz(false);
            const quizId = selectedQuiz?.id != null ? String(selectedQuiz.id) : '';
            if (!quizId) return;
            const max = response.max_attempts ?? selectedQuiz?.max_attempts ?? 3;
            const prevUsed = selectedQuiz?.attempt_count ?? 0;
            const prevRemaining = selectedQuiz?.remaining_attempts ?? max;
            const respUsed = response.attempt_count ?? response.attempts_used;
            const respRemaining = response.remaining_attempts ?? response.attempts_remaining;
            const used =
              typeof respUsed === 'number' && respUsed > 0
                ? respUsed
                : prevUsed + 1;
            const remaining =
              typeof respRemaining === 'number' && respRemaining < max
                ? respRemaining
                : Math.max(0, prevRemaining - 1);
            setSelectedQuiz((prev) =>
              prev
                ? {
                    ...prev,
                    score,
                    total,
                    attempt_count: used,
                    max_attempts: max,
                    remaining_attempts: remaining,
                    is_completed: response.passed === true,
                    has_passed: response.passed === true,
                  }
                : null
            );
            try {
              const fresh = await getQuiz(quizId);
              setSelectedQuiz((prev) => ({
                ...fresh,
                questions:
                  (fresh.questions && fresh.questions.length > 0 ? fresh.questions : prev?.questions) ?? fresh.questions,
              }));
              const remaining =
                response.remaining_attempts ?? response.attempts_remaining ?? fresh.remaining_attempts;
              const nowCompleted =
                response.passed === true ||
                fresh.is_completed === true ||
                fresh.has_passed === true ||
                (remaining !== undefined && remaining <= 0);
              setQuizCompleted(nowCompleted);
            } catch (e) {
              console.error('[CourseDetail] Re-fetch quiz after submit:', e);
              setSelectedQuiz((prev) => (prev ? { ...prev, score, total } : null));
              setQuizCompleted(false);
            }
          }}
        />
      )}

      {selectedAssignment && !assignmentCompleted && (
        <AssignmentModal
          isOpen={showAssignment}
          onClose={() => setShowAssignment(false)}
          assignment={selectedAssignment}
          onStartAssignment={() => {
            console.log('[CourseDetail] Assignment started');
          }}
          onSubmitSuccess={() => {
            setAssignmentCompleted(true);
            setShowAssignment(false);
          }}
        />
      )}
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
    minHeight: 280,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 24,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: 12,
  },
  feedbackButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackSubmittedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  feedbackSubmittedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  quizAssignmentSection: {
    marginBottom: 12,
  },
  quizAssignmentEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
  },
  quizAssignmentEmptyText: {
    fontSize: 14,
    color: COLORS.white60,
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    borderRadius: 12,
  },
  quizButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  quizCompletedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  quizCompletedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  assignmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(156, 39, 176, 0.9)',
    borderRadius: 12,
  },
  assignmentButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  assignmentCompletedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  assignmentCompletedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
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
