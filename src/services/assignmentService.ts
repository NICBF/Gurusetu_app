/**
 * Assignment API: GET /api/courses/{course_id}/assignments, POST /api/assignments/{assignment_id}/submit
 */
import api from './api';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  questions?: AssignmentQuestion[];
  is_completed?: boolean;
  has_passed?: boolean;
  attempt_count?: number;
  remaining_attempts?: number;
  max_attempts?: number;
  score?: number;
  total?: number;
  submission_status?: 'completed' | 'pending' | 'not_started' | 'failed';
  [key: string]: unknown;
}

export interface AssignmentQuestion {
  id: string;
  text: string;
  type?: 'multiple_choice' | 'text' | 'file';
  options?: string[];
  correct_answer?: string | number;
  [key: string]: unknown;
}

export interface AssignmentSubmissionRequest {
  answers: Record<string, string | number | File>;
}

export interface AssignmentSubmissionResponse {
  score?: number;
  total?: number;
  percentage?: number;
  passed?: boolean;
  attempt_count?: number;
  remaining_attempts?: number;
  [key: string]: unknown;
}

/**
 * Get all assignments for a course
 * Response may include completion status, attempt info for authenticated users
 */
export async function getCourseAssignments(courseId: string): Promise<Assignment[]> {
  const { data } = await api.get<Assignment[]>(`/courses/${courseId}/assignments`);
  const assignments = Array.isArray(data) ? data : [];
  // Normalize completion status
  return assignments.map((assignment) => ({
    ...assignment,
    is_completed: assignment.is_completed ?? assignment.has_passed ?? assignment.submission_status === 'completed',
    remaining_attempts: assignment.remaining_attempts ?? (assignment.max_attempts ? assignment.max_attempts - (assignment.attempt_count ?? 0) : 3),
  }));
}

/**
 * Submit assignment answers
 */
export async function submitAssignment(
  assignmentId: string,
  answers: AssignmentSubmissionRequest
): Promise<AssignmentSubmissionResponse> {
  const { data } = await api.post<AssignmentSubmissionResponse>(`/assignments/${assignmentId}/submit`, answers);
  return data;
}
