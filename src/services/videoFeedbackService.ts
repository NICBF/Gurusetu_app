/**
 * Video feedback API: POST /api/video-feedback
 * Body: course_id, lecture_id?, is_intro?, quality_rating, clarity_rating, learning_value_rating, practicality_rating, overall_satisfaction_rating
 * Check existing feedback: GET /api/courses/{course_id}/lectures/{lecture_id}/feedback (for lectures)
 * For intro videos, check by course_id and is_intro flag
 */
import api from './api';

export interface VideoFeedbackRequest {
  course_id: string;
  lecture_id?: string;
  is_intro?: boolean;
  quality_rating: number;
  clarity_rating: number;
  learning_value_rating: number;
  practicality_rating: number;
  overall_satisfaction_rating: number;
}

export interface VideoFeedbackResponse {
  id?: string;
  course_id: string;
  lecture_id?: string;
  is_intro?: boolean;
  [key: string]: unknown;
}

export interface VideoFeedbackCheckResponse {
  exists?: boolean;
  feedback?: VideoFeedbackResponse;
  [key: string]: unknown;
}

/**
 * Check if user has already submitted feedback for a video
 * For intro videos: check by course_id and is_intro=true
 * For lecture videos: check by course_id and lecture_id
 * 
 * The API endpoint GET /api/courses/{course_id}/lectures/{lecture_id}/feedback
 * returns user-specific feedback when authenticated with JWT.
 */
export async function checkVideoFeedback(
  courseId: string,
  lectureId?: string,
  isIntro?: boolean
): Promise<boolean> {
  try {
    let endpoint = '';
    if (isIntro) {
      // For intro videos, use 'intro' as lecture_id
      endpoint = `/courses/${courseId}/lectures/intro/feedback`;
    } else if (lectureId) {
      // For lecture videos, check by lecture_id
      endpoint = `/courses/${courseId}/lectures/${lectureId}/feedback`;
    } else {
      return false;
    }

    console.log('[VideoFeedback] Checking endpoint:', endpoint);
    const { data } = await api.get<VideoFeedbackCheckResponse | VideoFeedbackResponse | VideoFeedbackResponse[]>(
      endpoint
    );
    console.log('[VideoFeedback] Response data:', data);

    // Handle different response formats
    if (Array.isArray(data)) {
      // Array of feedback entries - check if any exist (user-specific if authenticated)
      const hasFeedback = data.length > 0;
      console.log('[VideoFeedback] Array response, has feedback:', hasFeedback);
      return hasFeedback;
    } else if (data && typeof data === 'object') {
      // Single feedback object or check response
      if ('exists' in data) {
        console.log('[VideoFeedback] Exists field:', data.exists);
        return !!data.exists;
      }
      if ('feedback' in data && data.feedback) {
        console.log('[VideoFeedback] Feedback field exists');
        return true;
      }
      // If it's a feedback object with course_id, it exists
      if ('course_id' in data) {
        const hasFeedback = data.course_id === courseId;
        console.log('[VideoFeedback] Feedback object found, course_id matches:', hasFeedback);
        return hasFeedback;
      }
      // If it has any feedback-related fields, consider it exists
      if ('id' in data || 'quality_rating' in data || 'clarity_rating' in data) {
        console.log('[VideoFeedback] Feedback object detected by fields');
        return true;
      }
    }
    console.log('[VideoFeedback] No feedback found');
    return false;
  } catch (error) {
    // If endpoint doesn't exist (404) or error, assume no feedback exists yet
    if (error && typeof error === 'object' && 'response' in error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status === 404) {
        // 404 means no feedback exists - this is expected for first-time users
        console.log('[VideoFeedback] 404 - no feedback exists');
        return false;
      }
    }
    console.log('[VideoFeedback] Check feedback error (assuming no feedback):', error);
    return false;
  }
}

export async function submitVideoFeedback(
  body: VideoFeedbackRequest
): Promise<VideoFeedbackResponse> {
  const { data } = await api.post<VideoFeedbackResponse>('/video-feedback', body);
  return data;
}
