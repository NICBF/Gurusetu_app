/**
 * Reviews API service.
 * Matches API docs: GET /api/reviews, GET /api/site/reviews, POST /api/reviews
 */
import api from './api';

export interface Review {
  id: string;
  course_id?: string;
  user_id?: string;
  user_name?: string;
  rating: number;
  comment?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface CreateReviewRequest {
  course_id: string;
  rating: number;
  comment?: string;
}

/**
 * Get reviews (requires auth for user-specific views)
 * GET /api/reviews
 */
export async function getReviews(): Promise<Review[]> {
  const { data } = await api.get<Review[] | { reviews?: Review[]; items?: Review[] }>('/reviews');
  if (Array.isArray(data)) return data;
  return data?.reviews ?? data?.items ?? [];
}

/**
 * Get public site reviews (no auth required)
 * GET /api/site/reviews
 */
export async function getSiteReviews(): Promise<Review[]> {
  const { data } = await api.get<Review[] | { reviews?: Review[]; items?: Review[] }>('/site/reviews');
  if (Array.isArray(data)) return data;
  return data?.reviews ?? data?.items ?? [];
}

/**
 * Create a review (requires auth)
 * POST /api/reviews
 */
export async function createReview(review: CreateReviewRequest): Promise<Review> {
  const { data } = await api.post<Review>('/reviews', review);
  return data;
}
