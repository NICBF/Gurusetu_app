/**
 * Video token API service.
 * Matches API docs: POST /api/video/token
 * Note: api baseURL includes /api, so '/video/token' becomes '/api/video/token'
 */
import api from './api';

export interface VideoTokenRequest {
  video_id?: string; // Optional - backend may derive from course_id/lecture_id
  video_type: 'intro' | 'lecture';
  course_id: string;
  lecture_id?: string; // Optional for intro videos
}

export interface VideoTokenResponse {
  token: string | null;
  video_url: string | null;
  is_embedded: boolean;
  video_type: 'intro' | 'lecture';
}

/**
 * Get video token and playable URL from backend
 */
export async function getVideoToken(
  courseId: string,
  videoType: 'intro' | 'lecture',
  lectureId?: string,
  videoId?: string
): Promise<VideoTokenResponse> {
  try {
    const body: VideoTokenRequest = {
      video_type: videoType,
      course_id: courseId,
    };
    if (lectureId) {
      body.lecture_id = lectureId;
    }
    if (videoId) {
      body.video_id = videoId;
    }

    console.log('[VideoToken] Requesting token:', body);
    console.log('[VideoToken] Endpoint: POST /api/video/token');
    const { data } = await api.post<VideoTokenResponse>('/video/token', body);
    console.log('[VideoToken] Response:', data);
    return data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      if (__DEV__) console.log('[VideoToken] POST /api/video/token returned 404 – using direct video URL fallback');
    } else {
      console.error('[VideoToken] Error:', error);
    }
    throw error;
  }
}

/**
 * Get playable video URL using token
 * If video_url is provided, use it directly
 * Otherwise, construct protected_videos URL with token
 */
export function getPlayableVideoUrl(
  tokenResponse: VideoTokenResponse,
  videoPath?: string
): string | null {
  // If backend provides direct video_url, use it
  if (tokenResponse.video_url) {
    console.log('[VideoToken] Using video_url from response:', tokenResponse.video_url);
    return tokenResponse.video_url;
  }

  // Otherwise, use protected_videos endpoint with token
  if (tokenResponse.token && videoPath) {
    const { API_BASE } = require('../config');
    const base = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
    const apiBase = base.endsWith('/api') ? base : base ? `${base}/api` : '';
    const url = `${apiBase}/protected_videos/${encodeURIComponent(videoPath)}?token=${encodeURIComponent(tokenResponse.token)}`;
    console.log('[VideoToken] Constructed protected_videos URL:', url);
    return url;
  }

  console.warn('[VideoToken] No token or video_path, cannot construct URL');
  return null;
}
