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
  [key: string]: unknown;
}

/**
 * Get all quizzes for a course
 * Response may include completion status (is_completed, submission_status) for authenticated users
 */
export async function getCourseQuizzes(courseId: string): Promise<Quiz[]> {
  const { data } = await api.get<Quiz[]>(`/courses/${courseId}/quizzes`);
  const quizzes = Array.isArray(data) ? data : [];
  console.log('[QuizService] Raw quizzes from API:', quizzes);
  // Normalize completion status - check multiple possible fields
  return quizzes.map((quiz) => {
    const isCompleted = quiz.is_completed === true || 
                       quiz.submission_status === 'completed' || 
                       (quiz.score !== undefined && quiz.score !== null);
    console.log('[QuizService] Quiz completion check:', {
      id: quiz.id,
      is_completed: quiz.is_completed,
      submission_status: quiz.submission_status,
      score: quiz.score,
      final: isCompleted,
    });
    return {
      ...quiz,
      is_completed: isCompleted,
    };
  });
}

/**
 * Get a specific quiz with questions
 * Response may include user's submission status and score if authenticated
 */
export async function getQuiz(quizId: string): Promise<Quiz> {
  const { data } = await api.get<Quiz>(`/quizzes/${quizId}`);
  const isCompleted = data.is_completed === true || 
                     data.submission_status === 'completed' || 
                     (data.score !== undefined && data.score !== null);
  console.log('[QuizService] Quiz details completion check:', {
    id: data.id,
    is_completed: data.is_completed,
    submission_status: data.submission_status,
    score: data.score,
    final: isCompleted,
  });
  return {
    ...data,
    is_completed: isCompleted,
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
 * Submit quiz answers
 */
export async function submitQuiz(
  quizId: string,
  answers: QuizSubmissionRequest
): Promise<QuizSubmissionResponse> {
  const { data } = await api.post<QuizSubmissionResponse>(`/quizzes/${quizId}/submit`, answers);
  return data;
}
