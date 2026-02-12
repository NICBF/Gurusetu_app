# API Services Reference

This directory contains all API service modules that match the backend API endpoints documented in `api-stored.md`.

## Service Files

### Authentication & Registration
- **authService.ts** - Login endpoints (`/api/login`, `/api/login/professor`, `/api/login/admin`, `/api/me`)
- **registrationService.ts** - Registration endpoints (`/api/register`, `/api/register/professor`)
- **passwordService.ts** - Password reset and change (`/api/forgot-password`, `/api/verify-reset-code`, `/api/reset-password`, `/api/change-password`)

### Courses & Learning
- **coursesService.ts** - Course listing and details (`/api/courses`, `/api/courses/{id}`, `/api/courses/{id}/lectures`, `/api/courses/{id}/progress`, `/api/my-courses`)
- **enrollmentService.ts** - Course enrollment (`/api/enroll`)

### Video & Progress
- **videoTokenService.ts** - Video token generation (`/api/video/token`)
- **videoProgressService.ts** - Video progress tracking (`/api/video-progress`, `/api/video-progress/{course_id}`)
- **videoFeedbackService.ts** - Video feedback submission (`/api/video-feedback`)

### Assessments
- **quizService.ts** - Quiz endpoints (`/api/courses/{id}/quizzes`, `/api/quizzes/{id}`, `/api/quizzes/{id}/submit`)
- **assignmentService.ts** - Assignment endpoints (`/api/courses/{id}/assignments`, `/api/assignments/{id}/submit`)

### User Profile
- **profileService.ts** - Profile management (`/api/me`, `/api/update-profile`, `/api/update-password`, `/api/delete-account`)

### Reviews & Feedback
- **reviewsService.ts** - Review endpoints (`/api/reviews`, `/api/site/reviews`)

### Certificates
- **learner_certificates.ts** - Certificate endpoints (`/api/my-certificates`, `/api/certificates/{id}/download`)

### Notifications
- **notificationsService.ts** - Notification endpoints (`/api/notifications`, `/api/notifications/new-lectures`, `/api/notifications/new-assignments`)

### Other Services
- **chatbotService.ts** - Chatbot API (`/chatbot-api/chat`)
- **contactService.ts** - Contact form (`/api/contact`)
- **liveClassesService.ts** - Live classes (`/api/live-classes`)
- **dashboardService.ts** - Dashboard data aggregation

## API Client Configuration

All services use the centralized `api.ts` client which:
- Automatically adds JWT authentication headers
- Handles 401 unauthorized responses
- Normalizes base URL to always end with `/api`
- Uses `API_BASE` from environment config (`EXPO_PUBLIC_API_URL`)

## Usage Example

```typescript
import { getCourses } from './services/coursesService';
import { enrollInCourse } from './services/enrollmentService';
import { getVideoToken } from './services/videoTokenService';

// Get all courses
const courses = await getCourses();

// Enroll in a course
await enrollInCourse('V10');

// Get video token
const tokenResponse = await getVideoToken('V10', 'intro');
```

## Note on Video Token Endpoint

The `/api/video/token` endpoint may return 404 if the backend hasn't implemented it yet. The service code is correct and matches the API documentation. Once the backend implements this endpoint, it will work automatically.
