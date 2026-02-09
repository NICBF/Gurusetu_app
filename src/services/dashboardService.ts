/**
 * Dashboard API calls
 */
import api from './api';

export interface CourseStats {
  total_courses?: number;
  enrolled_courses?: number;
  completed_courses?: number;
  in_progress_courses?: number;
}

export interface DashboardData {
  user?: {
    email?: string;
    name?: string;
    role?: string;
  };
  stats?: CourseStats;
  recent_courses?: unknown[];
}

/**
 * Get student dashboard data
 */
export async function getStudentDashboard(): Promise<DashboardData> {
  try {
    // Fetch user info and courses
    const [userData, coursesData] = await Promise.all([
      api.get('/me'),
      api.get('/my-courses').catch(() => ({ data: [] })),
    ]);

    const courses = Array.isArray(coursesData.data) ? coursesData.data : [];
    
    return {
      user: userData.data as { email?: string; name?: string; role?: string },
      stats: {
        enrolled_courses: courses.length,
        total_courses: courses.length,
      },
      recent_courses: courses.slice(0, 5),
    };
  } catch (error) {
    console.error('[Dashboard] Error fetching student data:', error);
    return {};
  }
}

/**
 * Get faculty dashboard data
 */
export async function getFacultyDashboard(): Promise<DashboardData> {
  try {
    const [userData, coursesData] = await Promise.all([
      api.get('/me'),
      api.get('/instructor/courses').catch(() => ({ data: [] })),
    ]);

    const courses = Array.isArray(coursesData.data) ? coursesData.data : [];
    
    return {
      user: userData.data as { email?: string; name?: string; role?: string },
      stats: {
        total_courses: courses.length,
      },
      recent_courses: courses.slice(0, 5),
    };
  } catch (error) {
    console.error('[Dashboard] Error fetching faculty data:', error);
    return {};
  }
}
