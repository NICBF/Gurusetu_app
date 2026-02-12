/**
 * Enrollment API service.
 * Matches API docs: POST /api/enroll
 */
import api from './api';

export interface EnrollRequest {
  course_id: string;
}

export interface EnrollResponse {
  message: string;
}

/**
 * Enroll in a course (requires auth)
 * POST /api/enroll
 */
export async function enrollInCourse(courseId: string): Promise<EnrollResponse> {
  const { data } = await api.post<EnrollResponse>('/enroll', { course_id: courseId });
  return data;
}
