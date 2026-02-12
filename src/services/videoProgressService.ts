/**
 * Video progress API service.
 * Matches API docs: POST /api/video-progress, GET /api/video-progress/{course_id}
 */
import api from './api';

export interface VideoProgressRequest {
  course_id: string;
  lecture_id?: string;
  current_time: number;
  duration: number;
  progress_percentage: number;
  is_completed: boolean;
  video_type: 'intro' | 'lecture';
}

export interface VideoProgressResponse {
  current_time?: number;
  duration?: number;
  progress_percentage?: number;
  is_completed?: boolean;
  last_watched_at?: string;
  course_id?: string;
  lecture_id?: string;
  video_type?: 'intro' | 'lecture';
}

/**
 * Save video progress (requires auth)
 * POST /api/video-progress
 */
export async function saveVideoProgress(progress: VideoProgressRequest): Promise<VideoProgressResponse> {
  const { data } = await api.post<VideoProgressResponse>('/video-progress', progress);
  return data;
}

/**
 * Get video progress for a course (requires auth)
 * GET /api/video-progress/{course_id}?video_type=intro&lecture_id=...
 */
export async function getVideoProgress(
  courseId: string,
  options?: {
    video_type?: 'intro' | 'lecture';
    lecture_id?: string;
  }
): Promise<VideoProgressResponse | null> {
  let endpoint = `/video-progress/${courseId}`;
  const params = new URLSearchParams();
  if (options?.video_type) params.append('video_type', options.video_type);
  if (options?.lecture_id) params.append('lecture_id', options.lecture_id);
  if (params.toString()) endpoint += `?${params.toString()}`;

  try {
    const { data } = await api.get<VideoProgressResponse>(endpoint);
    return data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null; // No progress found
    }
    throw error;
  }
}
