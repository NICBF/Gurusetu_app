/**
 * Courses API service.
 * Matches API docs: GET /api/courses, GET /api/courses/{course_id}, GET /api/courses/{course_id}/lectures, etc.
 */
import api from './api';

export interface Course {
  id?: string;
  course_id: string;
  title: string;
  description?: string;
  vertical?: string;
  thumbnail_url?: string;
  intro_video_path?: string;
  instructor_id?: string;
  is_published?: boolean;
  students_count?: number;
  average_rating?: number;
  rating?: number;
  is_enrolled?: boolean;
  [key: string]: unknown;
}

export interface Lecture {
  id: string;
  lecture_id?: string;
  title: string;
  video_path?: string;
  order?: number;
  course_id?: string;
  [key: string]: unknown;
}

export interface CourseProgress {
  [lectureOrIntroId: string]: {
    current_time?: number;
    duration?: number;
    progress_percentage?: number;
    is_completed?: boolean;
    last_watched_at?: string;
  };
}

/**
 * Get all courses (public listing)
 * GET /api/courses?vertical=<name> (optional filter)
 */
export async function getCourses(vertical?: string): Promise<Course[]> {
  const endpoint = vertical ? `/courses?vertical=${encodeURIComponent(vertical)}` : '/courses';
  const { data } = await api.get<Course[] | { courses?: Course[]; items?: Course[] }>(endpoint);
  if (Array.isArray(data)) return data;
  return data?.courses ?? data?.items ?? [];
}

/**
 * Get course details by ID
 * GET /api/courses/{course_id}
 */
export async function getCourseDetail(courseId: string): Promise<Course> {
  const { data } = await api.get<Course>(`/courses/${courseId}`);
  return data;
}

/**
 * Get lectures for a course
 * GET /api/courses/{course_id}/lectures
 */
export async function getCourseLectures(courseId: string): Promise<Lecture[]> {
  const { data } = await api.get<Lecture[] | { lectures?: Lecture[]; items?: Lecture[] }>(
    `/courses/${courseId}/lectures`
  );
  if (Array.isArray(data)) return data;
  return data?.lectures ?? data?.items ?? [];
}

/**
 * Get progress for a course (requires auth)
 * GET /api/courses/{course_id}/progress
 */
export async function getCourseProgress(courseId: string): Promise<CourseProgress> {
  const { data } = await api.get<CourseProgress>(`/courses/${courseId}/progress`);
  return data ?? {};
}

/**
 * Get enrolled courses (requires auth)
 * GET /api/my-courses
 */
export async function getMyCourses(): Promise<Course[]> {
  const { data } = await api.get<Course[] | { courses?: Course[]; items?: Course[] }>('/my-courses');
  if (Array.isArray(data)) return data;
  return data?.courses ?? data?.items ?? [];
}
