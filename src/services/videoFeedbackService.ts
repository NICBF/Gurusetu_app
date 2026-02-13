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
 * Check if user has already submitted feedback for a video.
 * Uses GET /api/courses/{course_id}/video-feedback-submitted which returns
 * { submitted_keys: ["intro-{course_id}", "<lecture_uuid>", ...] } for the current user.
 */
export async function checkVideoFeedback(
  courseId: string,
  lectureId?: string,
  isIntro?: boolean
): Promise<boolean> {
  try {
    const endpoint = `/courses/${courseId}/video-feedback-submitted`;
    const { data } = await api.get<{ submitted_keys?: string[] }>(endpoint);
    const keys = Array.isArray(data?.submitted_keys) ? data.submitted_keys : [];
    const introKey = `intro-${courseId}`;
    if (isIntro) {
      const has = keys.includes(introKey);
      if (__DEV__) console.log('[VideoFeedback] Intro submitted:', has, 'keys:', keys);
      return has;
    }
    if (lectureId) {
      const has = keys.some((k) => k === lectureId || k === String(lectureId));
      if (__DEV__) console.log('[VideoFeedback] Lecture submitted:', has, 'lectureId:', lectureId, 'keys:', keys);
      return has;
    }
    return false;
  } catch (error) {
    if (__DEV__) console.log('[VideoFeedback] Check error (assuming not submitted):', error);
    return false;
  }
}

export async function submitVideoFeedback(
  body: VideoFeedbackRequest
): Promise<VideoFeedbackResponse> {
  const { data } = await api.post<VideoFeedbackResponse>('/video-feedback', body);
  return data;
}
