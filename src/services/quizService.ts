/**
 * Quiz API: GET /api/courses/{course_id}/quizzes, GET /api/quizzes/{quiz_id}, POST /api/quizzes/{quiz_id}/submit
 */
import api from './api';

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  questions?: QuizQuestion[];
  is_completed?: boolean;
  submission_status?: 'completed' | 'pending' | 'not_started';
  score?: number;
  total?: number;
  percentage?: number;
  attempt_count?: number;
  remaining_attempts?: number;
  max_attempts?: number;
  has_passed?: boolean;
  [key: string]: unknown;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correct_answer?: number | string;
  [key: string]: unknown;
}

export interface QuizSubmissionRequest {
  answers: Record<string, string | number>;
}

export interface QuizSubmissionResponse {
  score?: number;
  total?: number;
  percentage?: number;
  passed?: boolean;
  attempt_count?: number;
  remaining_attempts?: number;
  max_attempts?: number;
  attempts_used?: number;
  attempts_remaining?: number;
  [key: string]: unknown;
}

/** Normalize a single option to string (API may return string or { text, label, value, option, option_text }) */
function optionToString(opt: unknown): string {
  if (typeof opt === 'string') return opt;
  if (opt && typeof opt === 'object') {
    const o = opt as Record<string, unknown>;
    const s = o.text ?? o.label ?? o.value ?? o.option ?? o.option_text ?? o.name;
    if (s != null && s !== '') return String(s);
  }
  return String(opt ?? '');
}

/** Pick first defined number from obj keys (handles various API names for same value) */
function pickNumber(obj: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (typeof v === 'string') {
      const n = parseInt(v, 10);
      if (!Number.isNaN(n)) return n;
    }
  }
  return undefined;
}

/** Normalize attempt fields from multiple possible API shapes (top-level or nested) */
function normalizeAttemptFields(quiz: Record<string, unknown>): {
  attempt_count: number;
  max_attempts: number;
  remaining_attempts: number;
} {
  const sub = (quiz.submission as Record<string, unknown>) ?? quiz;
  const userSub = (quiz.user_submission as Record<string, unknown>) ?? (quiz.quiz_submission as Record<string, unknown>);
  const result = (quiz.result as Record<string, unknown>) ?? (quiz.data as Record<string, unknown>);
  const quizNested = quiz.quiz as Record<string, unknown> | null;
  const sources: Record<string, unknown>[] = [quiz, sub];
  if (userSub && typeof userSub === 'object') sources.push(userSub);
  if (result && typeof result === 'object') sources.push(result);
  if (quizNested && typeof quizNested === 'object') sources.push(quizNested);

  const attemptCount =
    sources.reduce<number | undefined>(
      (acc, obj) =>
        acc ?? pickNumber(obj, 'attempt_count', 'attempts_used', 'attempts_count', 'attempts_taken', 'attempts', 'num_attempts', 'attempts_used_count'),
      undefined
    ) ?? 0;
  const maxAttempts =
    sources.reduce<number | undefined>(
      (acc, obj) =>
        acc ?? pickNumber(obj, 'max_attempts', 'maximum_attempts', 'total_attempts', 'allowed_attempts', 'attempts_allowed', 'num_attempts_allowed'),
      undefined
    ) ?? 3;
  const remainingAttempts =
    sources.reduce<number | undefined>(
      (acc, obj) =>
        acc ?? pickNumber(obj, 'remaining_attempts', 'attempts_remaining', 'attempts_left', 'attempts_remaining_count'),
      undefined
    ) ?? Math.max(0, maxAttempts - attemptCount);

  return {
    attempt_count: attemptCount,
    max_attempts: maxAttempts,
    remaining_attempts: Math.max(0, remainingAttempts),
  };
}

/** Normalize API question shape to QuizQuestion */
function normalizeQuizQuestions(raw: unknown): QuizQuestion[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((q: Record<string, unknown>, i: number) => {
    const rawOpts = q.options ?? q.choices ?? q.answers ?? [];
    const optArr = Array.isArray(rawOpts) ? rawOpts : [];
    const options = optArr.map(optionToString);
    return {
      id: String(q.id ?? q.question_id ?? i),
      text: String(q.text ?? q.question_text ?? q.content ?? q.question ?? ''),
      options,
      correct_answer: q.correct_answer ?? q.correct_answer_index,
    };
  });
}

/**
 * Get all quizzes for a course
 * Response may include completion status (is_completed, submission_status) for authenticated users
 */
export async function getCourseQuizzes(courseId: string): Promise<Quiz[]> {
  const { data } = await api.get<Quiz[] | { quizzes?: Quiz[]; items?: Quiz[] }>(`/courses/${courseId}/quizzes`);
  const raw = Array.isArray(data) ? data : (data as { quizzes?: Quiz[]; items?: Quiz[] })?.quizzes ?? (data as { items?: Quiz[] })?.items ?? [];
  const quizzes = Array.isArray(raw) ? raw : [];
  console.log('[QuizService] Raw quizzes from API:', quizzes);
  // Normalize completion status and ensure questions array exists from any key
  return quizzes.map((quiz) => {
    const rawQ = (quiz as Quiz & { question_set?: unknown; quiz_questions?: unknown; items?: unknown }).questions
      ?? (quiz as { question_set?: unknown }).question_set
      ?? (quiz as { quiz_questions?: unknown }).quiz_questions
      ?? (quiz as { items?: unknown }).items;
    const questions = normalizeQuizQuestions(rawQ);
    const isCompleted = quiz.is_completed === true || 
                       quiz.submission_status === 'completed' || 
                       (quiz.score !== undefined && quiz.score !== null);
    const q = quiz as Record<string, unknown>;
    const attempts = normalizeAttemptFields(q);
    const attemptCount = typeof q.attempt_count === 'number' ? q.attempt_count
      : typeof q.attempts_used === 'number' ? q.attempts_used
      : typeof q.attempts === 'number' ? q.attempts
      : attempts.attempt_count;
    const maxAttempts = typeof q.max_attempts === 'number' ? q.max_attempts : attempts.max_attempts;
    const remainingFromApi =
      typeof q.remaining_attempts === 'number' ? q.remaining_attempts
      : typeof q.attempts_remaining === 'number' ? q.attempts_remaining
      : attempts.remaining_attempts;
    const remainingAttempts =
      remainingFromApi !== undefined && remainingFromApi !== null
        ? Math.max(0, remainingFromApi)
        : maxAttempts != null
          ? Math.max(0, maxAttempts - attemptCount)
          : 3;
    console.log('[QuizService] Quiz completion check:', {
      id: quiz.id,
      is_completed: quiz.is_completed,
      submission_status: quiz.submission_status,
      score: quiz.score,
      final: isCompleted,
      questionsCount: questions.length,
      attempt_count: attemptCount,
      max_attempts: maxAttempts,
      remaining_attempts: remainingAttempts,
    });
    return {
      ...quiz,
      questions: questions.length > 0 ? questions : quiz.questions,
      is_completed: isCompleted,
      attempt_count: attemptCount,
      max_attempts: maxAttempts,
      remaining_attempts: remainingAttempts,
    };
  });
}

/**
 * Get a specific quiz with questions
 * Response may include user's submission status and score if authenticated.
 * Normalizes questions from questions | question_set | quiz_questions | items.
 */
export async function getQuiz(quizId: string | number): Promise<Quiz> {
  const id = String(quizId);
  const { data } = await api.get<Quiz & { question_set?: unknown; quiz_questions?: unknown; items?: unknown; quiz?: { questions?: unknown } }>(`/quizzes/${id}`);
  const raw = data as Record<string, unknown>;
  const quizPayload = (raw.quiz as Record<string, unknown> | null) ?? raw;
  const attemptKeys = Object.keys(quizPayload).filter(
    (k) => /attempt|remaining|max_attempt|submission|score|completed/i.test(k)
  );
  const attemptPayload: Record<string, unknown> = {};
  attemptKeys.forEach((k) => {
    attemptPayload[k] = quizPayload[k];
  });
  console.log('[QuizService] Raw quiz attempt-related keys from API:', attemptPayload);
  const rawQuestions =
    data.questions ??
    (data as { question_set?: unknown }).question_set ??
    (data as { quiz_questions?: unknown }).quiz_questions ??
    (data as { items?: unknown }).items ??
    (data as { quiz?: { questions?: unknown } }).quiz?.questions;
  const questions = normalizeQuizQuestions(rawQuestions);
  const isCompleted = data.is_completed === true || 
                     data.submission_status === 'completed' || 
                     (data.score !== undefined && data.score !== null);
  const attempts = normalizeAttemptFields(raw);
  const attemptCount = typeof quizPayload.attempt_count === 'number' ? quizPayload.attempt_count
    : typeof quizPayload.attempts_used === 'number' ? quizPayload.attempts_used
    : typeof quizPayload.attempts === 'number' ? quizPayload.attempts
    : attempts.attempt_count;
  const maxAttempts = typeof quizPayload.max_attempts === 'number' ? quizPayload.max_attempts
    : attempts.max_attempts;
  const remainingFromApi =
    typeof quizPayload.remaining_attempts === 'number' ? quizPayload.remaining_attempts
    : typeof quizPayload.attempts_remaining === 'number' ? quizPayload.attempts_remaining
    : attempts.remaining_attempts;
  const remainingAttempts =
    remainingFromApi !== undefined && remainingFromApi !== null
      ? Math.max(0, remainingFromApi)
      : maxAttempts != null
        ? Math.max(0, maxAttempts - attemptCount)
        : 3;
  console.log('[QuizService] Quiz details completion check:', {
    id: data.id,
    is_completed: data.is_completed,
    submission_status: data.submission_status,
    score: data.score,
    final: isCompleted,
    questionsCount: questions.length,
    attempt_count: attemptCount,
    max_attempts: maxAttempts,
    remaining_attempts: remainingAttempts,
  });
  return {
    ...data,
    questions: questions.length > 0 ? questions : data.questions,
    is_completed: isCompleted,
    attempt_count: attemptCount,
    max_attempts: maxAttempts,
    remaining_attempts: remainingAttempts,
  };
}

/**
 * Check if user has completed a quiz
 * Uses GET /api/quizzes/{quiz_id} which returns completion status for authenticated users
 */
export async function checkQuizCompletion(quizId: string): Promise<boolean> {
  try {
    const quiz = await getQuiz(quizId);
    return !!quiz.is_completed;
  } catch (error) {
    // If quiz doesn't exist or error, assume not completed
    console.log('[QuizService] Error checking quiz completion:', error);
    return false;
  }
}

/**
 * Submit quiz answers.
 * Backend expects body: { answers: { "0": answerIndex, "1": answerIndex, ... }, time_taken?: number }
 */
export async function submitQuiz(
  quizId: string,
  answers: QuizSubmissionRequest['answers']
): Promise<QuizSubmissionResponse> {
  const body = { answers, time_taken: 0 };
  const { data } = await api.post<QuizSubmissionResponse>(`/quizzes/${quizId}/submit`, body);
  return data;
}
