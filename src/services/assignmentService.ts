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

/** Normalize a single option to string (API may return string or { text, label }) */
function optionToString(opt: unknown): string {
  if (typeof opt === 'string') return opt;
  if (opt && typeof opt === 'object' && 'text' in opt) return String((opt as { text: unknown }).text);
  if (opt && typeof opt === 'object' && 'label' in opt) return String((opt as { label: unknown }).label);
  return String(opt ?? '');
}

/** Normalize API question shape to AssignmentQuestion */
function normalizeAssignmentQuestions(raw: unknown): AssignmentQuestion[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((q: Record<string, unknown>, i: number) => {
    const rawOpts = q.options ?? q.choices ?? q.answers ?? [];
    const optArr = Array.isArray(rawOpts) ? rawOpts : [];
    const options = optArr.map(optionToString);
    return {
      id: String(q.id ?? q.question_id ?? i),
      text: String(q.text ?? q.question_text ?? q.content ?? q.question ?? ''),
      type: (q.type as AssignmentQuestion['type']) ?? (optArr.length > 0 ? 'multiple_choice' : 'text'),
      options,
      correct_answer: q.correct_answer ?? q.correct_answer_index,
    };
  });
}

/**
 * Get all assignments for a course
 * Response may include completion status, attempt info for authenticated users
 */
export async function getCourseAssignments(courseId: string): Promise<Assignment[]> {
  const { data } = await api.get<Assignment[] | { assignments?: Assignment[]; items?: Assignment[] }>(`/courses/${courseId}/assignments`);
  const raw = Array.isArray(data) ? data : (data as { assignments?: Assignment[] })?.assignments ?? (data as { items?: Assignment[] })?.items ?? [];
  const assignments = Array.isArray(raw) ? raw : [];
  return assignments.map((assignment) => {
    const rawQ = (assignment as Assignment & { question_set?: unknown; assignment_questions?: unknown; items?: unknown }).questions
      ?? (assignment as { question_set?: unknown }).question_set
      ?? (assignment as { assignment_questions?: unknown }).assignment_questions
      ?? (assignment as { items?: unknown }).items;
    const questions = normalizeAssignmentQuestions(rawQ);
    return {
      ...assignment,
      questions: questions.length > 0 ? questions : assignment.questions,
      is_completed: assignment.is_completed ?? assignment.has_passed ?? assignment.submission_status === 'completed',
      remaining_attempts: assignment.remaining_attempts ?? (assignment.max_attempts ? assignment.max_attempts - (assignment.attempt_count ?? 0) : 3),
    };
  });
}

/**
 * Get a single assignment with questions (for modal display)
 * GET /api/assignments/{assignment_id}
 * Normalizes questions from questions | question_set | assignment_questions | items.
 */
export async function getAssignment(assignmentId: string): Promise<Assignment> {
  const { data } = await api.get<Assignment & { question_set?: unknown; assignment_questions?: unknown; items?: unknown }>(`/assignments/${assignmentId}`);
  const a = data as Assignment;
  const rawQ = a.questions
    ?? (data as { question_set?: unknown }).question_set
    ?? (data as { assignment_questions?: unknown }).assignment_questions
    ?? (data as { items?: unknown }).items;
  const questions = normalizeAssignmentQuestions(rawQ);
  return {
    ...a,
    questions: questions.length > 0 ? questions : a.questions,
    is_completed: a.is_completed ?? a.has_passed ?? a.submission_status === 'completed',
    remaining_attempts:
      a.remaining_attempts ?? (a.max_attempts ? a.max_attempts - (a.attempt_count ?? 0) : 3),
  };
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
