# API INVENTORY (FOR REACT NATIVE APP)

**Source:** E:\gsgs\GS (read-only analysis)  
**Base URL:** `https://gurusetu.iitm.ac.in` (production) or `VITE_API_URL` (dev)  
**Auth:** JWT in `Authorization: Bearer <token>`; cookies for OAuth; `credentials: 'include'` where applicable

---

## Auth APIs

#### POST `/api/login` (Learner)
- **Endpoint:** `/api/login`
- **Method:** POST
- **Body:** Form-encoded `username` (email), `password`
- **Response:** `{ access_token, token_type: "bearer" }`
- **Headers/Auth:** None (public)
- **Used In:** `frontend/src/components/Login.jsx` (learner login)

#### POST `/api/login/admin`
- **Endpoint:** `/api/login/admin`
- **Method:** POST
- **Body:** Form-encoded `username`, `password`
- **Response:** `{ access_token, token_type: "bearer" }`
- **Headers/Auth:** None (public)
- **Used In:** `frontend/src/components/Login.jsx` (admin login)

#### POST `/api/login/professor`
- **Endpoint:** `/api/login/professor`
- **Method:** POST
- **Body:** Form-encoded `username`, `password`
- **Response:** `{ access_token, token_type: "bearer" }`
- **Headers/Auth:** None (public)
- **Used In:** `frontend/src/components/Login.jsx` (professor login)

#### POST `/api/login/learner`
- **Endpoint:** `/api/login/learner`
- **Method:** POST
- **Body:** Form-encoded `username`, `password`
- **Response:** `{ access_token, token_type: "bearer" }`
- **Headers/Auth:** None (public)
- **Used In:** Backend tests; frontend uses `/api/login` for learner

#### POST `/api/register`
- **Endpoint:** `/api/register`
- **Method:** POST
- **Body:** JSON `{ email, password, first_name?, last_name?, name?, role?: "learner" }`
- **Response:** `{ id, email, email_sent }`
- **Headers/Auth:** None (public)
- **Used In:** `frontend/src/components/Register.jsx`

#### POST `/api/register/professor`
- **Endpoint:** `/api/register/professor`
- **Method:** POST
- **Body:** JSON `{ email, password, first_name?, last_name?, name?, institution?, ... }`
- **Response:** `{ id, email, instructor_id, name, message }` or `{ requires_password_only, instructor, message }`
- **Headers/Auth:** None (public)
- **Used In:** `frontend/src/components/Register.jsx`

#### POST `/api/register/professor/password-only`
- **Endpoint:** `/api/register/professor/password-only`
- **Method:** POST
- **Body:** JSON `{ email, password }`
- **Response:** `{ id, email, instructor_id, name, message }`
- **Headers/Auth:** None (public)
- **Used In:** `frontend/src/components/Register.jsx`

#### GET `/api/auth/token`
- **Endpoint:** `/api/auth/token`
- **Method:** GET
- **Body:** None
- **Response:** `{ token, email, role }` or 204 if no cookie
- **Headers/Auth:** Cookie `session` (OAuth callback)
- **Used In:** `frontend/src/components/Login.jsx` (post-OAuth)

#### POST `/api/auth/logout`
- **Endpoint:** `/api/auth/logout`
- **Method:** POST
- **Body:** None
- **Response:** `{ message: "Logged out successfully" }`
- **Headers/Auth:** Cookie `session`
- **Used In:** Frontend logout flow

#### GET `/api/auth/verify-registration`
- **Endpoint:** `/api/auth/verify-registration?email=<email>`
- **Method:** GET
- **Body:** None
- **Response:** JSON indicating if email is registered
- **Headers/Auth:** None (public)
- **Used In:** Post-OAuth email check

#### GET `/api/auth/health`
- **Endpoint:** `/api/auth/health`
- **Method:** GET
- **Body:** None
- **Response:** Health status JSON
- **Headers/Auth:** None
- **Used In:** Backend health checks

#### POST `/api/forgot-password`
- **Endpoint:** `/api/forgot-password`
- **Method:** POST
- **Body:** JSON `{ email }`
- **Response:** `{ message, user_not_found?, email_sent }`
- **Headers/Auth:** None (public)
- **Used In:** `frontend/src/components/ForgotPasswordModal.jsx`

#### POST `/api/verify-reset-code`
- **Endpoint:** `/api/verify-reset-code`
- **Method:** POST
- **Body:** JSON `{ email, code }`
- **Response:** `{ message, verified: true }`
- **Headers/Auth:** None (public)
- **Used In:** `frontend/src/components/ForgotPasswordModal.jsx`

#### POST `/api/reset-password`
- **Endpoint:** `/api/reset-password`
- **Method:** POST
- **Body:** JSON `{ email, code, new_password }`
- **Response:** `{ message: "Password reset successfully" }`
- **Headers/Auth:** None (public)
- **Used In:** `frontend/src/components/ForgotPasswordModal.jsx`

#### POST `/api/change-password`
- **Endpoint:** `/api/change-password`
- **Method:** POST
- **Body:** JSON `{ current_password, new_password }`
- **Response:** Success message JSON
- **Headers/Auth:** JWT required
- **Used In:** Change password flows

---

## Core App APIs

### Profile & User

#### GET `/api/me`
- **Endpoint:** `/api/me`
- **Method:** GET
- **Body:** None
- **Response:**  
  ```json
  {
    "email": "...",
    "name": "...",
    "first_name": "...",
    "last_name": "...",
    "role": "...",
    "profile_picture_url": "...",
    "id": "...",
    "institution": "...",
    "country": "...",
    "state": "...",
    "bio": "...",
    "phone": "..."
  }
  ```
- **Headers/Auth:** `Authorization: Bearer <token>` or session cookie
- **Used In:** Navbar, Profile dialog, dashboards

#### PUT `/api/update-profile`
- **Endpoint:** `/api/update-profile`
- **Method:** PUT (POST also supported)
- **Body:** JSON with editable profile fields
- **Response:** Updated user profile JSON
- **Headers/Auth:** JWT
- **Used In:** `frontend/src/components/ProfileDialog.jsx`

#### POST `/api/update-password`
- **Endpoint:** `/api/update-password`
- **Method:** POST
- **Body:** JSON `{ current_password, new_password }`
- **Response:** Success message JSON
- **Headers/Auth:** JWT
- **Used In:** `frontend/src/components/ProfileDialog.jsx`

#### DELETE `/api/delete-account`
- **Endpoint:** `/api/delete-account`
- **Method:** DELETE
- **Body:** None
- **Response:** Success JSON
- **Headers/Auth:** JWT
- **Used In:** `frontend/src/components/ProfileDialog.jsx`

---

### Courses

#### GET `/api/courses`
- **Endpoint:** `/api/courses` (optional `?vertical=<name>`)
- **Method:** GET
- **Body:** None
- **Response:** Array of course objects
- **Headers/Auth:** None (public listing)
- **Used In:** `homepage.jsx`, `AllCourses.jsx`, `StudentProgressDashboard.jsx`, analytics

#### GET `/api/courses/{course_id}`
- **Endpoint:** `/api/courses/{course_id}`
- **Method:** GET
- **Body:** None
- **Response:** Detailed course JSON (ratings, counts, metadata)
- **Headers/Auth:** None (public)
- **Used In:** student dashboard / course views

#### GET `/api/courses/{course_id}/lectures`
- **Endpoint:** `/api/courses/{course_id}/lectures`
- **Method:** GET
- **Body:** None
- **Response:** Lecture list for a course
- **Headers/Auth:** None (public)
- **Used In:** dashboards, assignments, forums, progress

#### GET `/api/courses/{course_id}/progress`
- **Endpoint:** `/api/courses/{course_id}/progress`
- **Method:** GET
- **Body:** None
- **Response:** Map of lecture/intro ID → progress object
- **Headers/Auth:** JWT
- **Used In:** My courses, dashboards

#### GET `/api/courses/{course_id}/assignments`
- **Endpoint:** `/api/courses/{course_id}/assignments`
- **Method:** GET
- **Body:** None
- **Response:** Assignment list
- **Headers/Auth:** JWT
- **Used In:** student dashboards

#### GET `/api/courses/{course_id}/quizzes`
- **Endpoint:** `/api/courses/{course_id}/quizzes`
- **Method:** GET
- **Body:** None
- **Response:** Quiz list
- **Headers/Auth:** JWT
- **Used In:** dashboards, navbar

---

### Enrollment & Learning

#### GET `/api/my-courses`
- **Endpoint:** `/api/my-courses`
- **Method:** GET
- **Body:** None
- **Response:** Array of enrolled course objects
- **Headers/Auth:** JWT
- **Used In:** navbar, homepage, AllCourses, MyCourses, dashboards, notifications

#### POST `/api/enroll`
- **Endpoint:** `/api/enroll`
- **Method:** POST
- **Body:** JSON `{ course_id }`
- **Response:** `{ message: "Enrolled successfully!" }`
- **Headers/Auth:** JWT
- **Used In:** course cards, dashboard “enroll” buttons

---

### Video & Progress

#### POST `/api/video/token`
- **Endpoint:** `/api/video/token`
- **Method:** POST
- **Body:**  
  ```json
  {
    "video_id": "...",
    "video_type": "intro" | "lecture",
    "course_id": "...",
    "lecture_id": "..." // optional for intro
  }
  ```
- **Response:**  
  ```json
  {
    "token": "..." | null,
    "video_url": "..." | null,
    "is_embedded": true | false,
    "video_type": "intro" | "lecture"
  }
  ```
- **Headers/Auth:** JWT
- **Used In:** video players in student dashboard

#### GET `/api/protected_videos/{video_path}`
- **Endpoint:** `/api/protected_videos/{video_path}?token=<token>`
- **Method:** GET
- **Body:** None
- **Response:** Video stream (binary)
- **Headers/Auth:** Token in query string
- **Used In:** video `<source>` tags

#### POST `/api/video-progress`
- **Endpoint:** `/api/video-progress`
- **Method:** POST
- **Body:**  
  ```json
  {
    "course_id": "...",
    "lecture_id": "...",
    "current_time": 123,
    "duration": 456,
    "progress_percentage": 27.5,
    "is_completed": false,
    "video_type": "intro" | "lecture"
  }
  ```
- **Response:** Stored progress object
- **Headers/Auth:** JWT
- **Used In:** dashboards while watching video

#### GET `/api/video-progress/{course_id}`
- **Endpoint:** `/api/video-progress/{course_id}?video_type=intro&lecture_id=...`
- **Method:** GET
- **Body:** None
- **Response:** Progress object `{ current_time, duration, progress_percentage, is_completed, last_watched_at }`
- **Headers/Auth:** JWT
- **Used In:** My courses page

---

### Assignments & Quizzes

#### GET `/api/quizzes/{quiz_id}`
- **Endpoint:** `/api/quizzes/{quiz_id}`
- **Method:** GET
- **Body:** None
- **Response:** Quiz with questions
- **Headers/Auth:** JWT
- **Used In:** quiz pages (backend + frontend)

#### POST `/api/quizzes/{quiz_id}/submit`
- **Endpoint:** `/api/quizzes/{quiz_id}/submit`
- **Method:** POST
- **Body:** JSON `{ answers: { [question_id]: answer } }`
- **Response:** score / result JSON
- **Headers/Auth:** JWT
- **Used In:** quiz submission flows

#### POST `/api/assignments/{assignment_id}/submit`
- **Endpoint:** `/api/assignments/{assignment_id}/submit`
- **Method:** POST
- **Body:** JSON `{ answers }`
- **Response:** submission result JSON
- **Headers/Auth:** JWT
- **Used In:** assignment submission components

---

### Reviews & Feedback

#### GET `/api/reviews`
- **Endpoint:** `/api/reviews`
- **Method:** GET
- **Body:** None
- **Response:** Array of reviews
- **Headers/Auth:** JWT (for user-specific views)
- **Used In:** dashboards, instructor/course views

#### GET `/api/site/reviews`
- **Endpoint:** `/api/site/reviews`
- **Method:** GET
- **Body:** None
- **Response:** Public reviews for marketing/homepage
- **Headers/Auth:** None (public)
- **Used In:** homepage, login page

#### POST `/api/reviews`
- **Endpoint:** `/api/reviews`
- **Method:** POST
- **Body:** JSON `{ course_id, rating, comment }`
- **Response:** Created review JSON
- **Headers/Auth:** JWT
- **Used In:** review forms on course pages

#### POST `/api/video-feedback`
- **Endpoint:** `/api/video-feedback`
- **Method:** POST
- **Body:** JSON `{ course_id, lecture_id?, is_intro?, quality_rating, clarity_rating, learning_value_rating, practicality_rating, overall_satisfaction_rating }`
- **Response:** Feedback entry JSON
- **Headers/Auth:** JWT
- **Used In:** video feedback popup

---

### Certificates

#### GET `/api/certificate-system-enabled`
- **Endpoint:** `/api/certificate-system-enabled`
- **Method:** GET
- **Body:** None
- **Response:** `{ certificates_enabled: boolean }`
- **Headers/Auth:** None (public)
- **Used In:** MyCourses to decide whether to show certificates

#### GET `/api/my-certificates`
- **Endpoint:** `/api/my-certificates`
- **Method:** GET
- **Body:** None
- **Response:** Array of certificate summaries
- **Headers/Auth:** JWT
- **Used In:** certificates list for learner

#### GET `/api/certificates/{certificate_id}`
- **Endpoint:** `/api/certificates/{certificate_id}`
- **Method:** GET
- **Body:** None
- **Response:** Certificate detail JSON
- **Headers/Auth:** JWT
- **Used In:** certificate view page

#### GET `/api/certificates/{certificate_id}/download`
- **Endpoint:** `/api/certificates/{certificate_id}/download`
- **Method:** GET
- **Body:** None
- **Response:** PDF binary
- **Headers/Auth:** JWT
- **Used In:** download buttons

---

### Instructors

#### GET `/api/instructors`
- **Endpoint:** `/api/instructors`
- **Method:** GET
- **Body:** None
- **Response:** Instructor list
- **Headers/Auth:** None
- **Used In:** homepage, instructor listing pages

#### GET `/api/instructors/{instructor_id}`
- **Endpoint:** `/api/instructors/{instructor_id}`
- **Method:** GET
- **Body:** None
- **Response:** Instructor detail JSON
- **Headers/Auth:** None
- **Used In:** course & dashboard pages

---

### Homepage & Public Content

#### GET `/api/homepage-stats`
- **Endpoint:** `/api/homepage-stats`
- **Method:** GET
- **Body:** None
- **Response:** Stats like total learners, avg rating, total reviews
- **Headers/Auth:** None
- **Used In:** homepage, login page

#### GET `/api/vertical-content`
- **Endpoint:** `/api/vertical-content` (and variants per-vertical)
- **Method:** GET
- **Body:** None
- **Response:** Content config per vertical (title, description, CTA copy)
- **Headers/Auth:** None
- **Used In:** vertical-specific sections on web

#### POST `/api/contact`
- **Endpoint:** `/api/contact`
- **Method:** POST
- **Body:** JSON `{ name, email, subject, message }`
- **Response:** confirmation JSON
- **Headers/Auth:** None
- **Used In:** contact forms / popups

---

### Forums & Discourse

#### GET `/api/forums/categories`
- **Endpoint:** `/api/forums/categories`
- **Method:** GET
- **Body:** None
- **Response:** Forum categories JSON
- **Headers/Auth:** JWT
- **Used In:** forums UI

#### GET `/api/forums/verticals-courses`
- **Endpoint:** `/api/forums/verticals-courses`
- **Method:** GET
- **Body:** None
- **Response:** mapping of verticals to courses for forums
- **Headers/Auth:** JWT
- **Used In:** forum filters

#### GET `/api/forums/courses/{course_id}/lectures`
- **Endpoint:** `/api/forums/courses/{course_id}/lectures`
- **Method:** GET
- **Body:** None
- **Response:** course lectures used in forums context
- **Headers/Auth:** JWT
- **Used In:** Forums lecture filters

#### GET `/api/forums/all-threads`
- **Endpoint:** `/api/forums/all-threads` (`?mine=1` for own threads)
- **Method:** GET
- **Body:** None
- **Response:** thread list
- **Headers/Auth:** JWT
- **Used In:** main forum listing, “my threads”

#### GET `/api/forums/categories/{category_name}/threads`
- **Endpoint:** `/api/forums/categories/{category_name}/threads`
- **Method:** GET
- **Body:** None
- **Response:** threads filtered by category
- **Headers/Auth:** JWT
- **Used In:** category-specific forum views

#### GET `/api/discourse/courses`
- **Endpoint:** `/api/discourse/courses`
- **Method:** GET
- **Body:** None
- **Response:** courses available in discourse
- **Headers/Auth:** JWT
- **Used In:** Discourse course selection

#### GET `/api/discourse/courses/{course_id}/threads`
- **Endpoint:** `/api/discourse/courses/{course_id}/threads`
- **Method:** GET
- **Body:** None
- **Response:** threads under a course
- **Headers/Auth:** JWT
- **Used In:** discourse thread lists

#### GET `/api/discourse/threads/{thread_id}`
- **Endpoint:** `/api/discourse/threads/{thread_id}`
- **Method:** GET
- **Body:** None
- **Response:** full thread with comments
- **Headers/Auth:** JWT
- **Used In:** thread detail pages

#### POST `/api/discourse/threads`
- **Endpoint:** `/api/discourse/threads`
- **Method:** POST
- **Body:** JSON `{ title, content, course_id?, category?, vertical?, lecture_id? }`
- **Response:** created thread JSON
- **Headers/Auth:** JWT
- **Used In:** new-thread UI

#### POST `/api/discourse/comments`
- **Endpoint:** `/api/discourse/comments`
- **Method:** POST
- **Body:** JSON `{ thread_id, content }`
- **Response:** created comment JSON
- **Headers/Auth:** JWT
- **Used In:** reply box in discourse

---

### Notifications

#### GET `/api/notifications/new-lectures`
- **Endpoint:** `/api/notifications/new-lectures`
- **Method:** GET
- **Body:** None
- **Response:** notifications for new lectures
- **Headers/Auth:** JWT
- **Used In:** notification center, nav badges

#### GET `/api/notifications/new-assignments`
- **Endpoint:** `/api/notifications/new-assignments`
- **Method:** GET
- **Body:** None
- **Response:** notifications for new assignments
- **Headers/Auth:** JWT
- **Used In:** notification center, nav badges

---

### Media & Assets

#### GET `/api/google-drive/image/{file_id}`
- **Endpoint:** `/api/google-drive/image/{file_id}`
- **Method:** GET
- **Body:** None
- **Response:** image binary (proxied from Google Drive)
- **Headers/Auth:** None
- **Used In:** thumbnails, hero images, etc.

#### Static assets
- **Endpoints:** `/images/{path}`, `/videos/{path}`
- **Method:** GET
- **Response:** static files

---

## Admin APIs (Admin Only)

*(summary only — full details are in GS backend, mirror if you build admin mobile features)*

- `/api/admin/me` – GET admin profile
- `/api/dashboard` – GET platform-wide dashboard stats
- `/api/admin/courses` – CRUD courses for admins
- `/api/admin/forums/threads` & related – moderate forum threads and replies
- `/api/admin/certificates` & `/api/admin/certificate-system-status` – manage certificates
- `/api/admin/generate-missing-certificates` – trigger certificate generation
- `/api/admin/assignments`, `/api/admin/quizzes` – manage assignments/quizzes
- `/api/admin/quiz-report`, `/api/admin/assignment-report` – reporting
- `/api/students` – list students
- `/api/admin/monitor/status` – system monitoring status

---

## Instructor APIs (Professor)

- `/api/instructor/profile` – professor profile
- `/api/instructor/courses` – professor’s courses
- `/api/instructor/assignments` – assignments CRUD as instructor
- `/api/instructor/quizzes` – quizzes CRUD as instructor

---

## Optional / Edge APIs

#### GET `/health`
- **Endpoint:** `/health`
- **Method:** GET
- **Response:** liveness info

#### GET `/api/health`
- **Endpoint:** `/api/health`
- **Method:** GET
- **Response:** API health info

#### POST `/chatbot-api/chat`
- **Endpoint:** `/chatbot-api/chat`
- **Method:** POST
- **Body:** JSON `{ question, role }`
- **Response:** `{ answer }` or `{ response }`
- **Headers/Auth:** None
- **Used In:** GuruSetu chatbot widget

#### GET `/api/courses/{course_id}/lectures/{lecture_id}/feedback`
- **Endpoint:** `/api/courses/{course_id}/lectures/{lecture_id}/feedback`
- **Method:** GET
- **Response:** lecture-level feedback

#### GET `/api/reviews/export/pdf`
- **Endpoint:** `/api/reviews/export/pdf`
- **Method:** GET
- **Response:** PDF of reviews

---

## Missing / Implicit APIs

These paths appear in frontend code but are not implemented exactly as such in the backend; they map to `POST /api/video/token`:

- `GET /api/courses/{course_id}/intro-video-token`  
- `GET /api/courses/{course_id}/lectures/{lecture_id}/video-token`  

Use `POST /api/video/token` with appropriate `video_type`, `course_id`, `lecture_id` in the mobile app.

---

## React Native-Friendly API Map (Summary)

| Group           | Base Path                 | Auth                        | Notes                         |
|----------------|---------------------------|-----------------------------|-------------------------------|
| Auth           | `/api/*`                 | Public for login/register   | JWT for protected             |
| User           | `/api/me`, `/api/update-*`| JWT                         | profile + password            |
| Courses        | `/api/courses*`           | None for listing            | JWT for progress/learning     |
| Learning       | `/api/my-courses`, `/api/enroll`, `/api/video-*` | JWT | sessions & progress |
| Assessments    | `/api/assignments*`, `/api/quizzes*` | JWT | assignments + quizzes  |
| Certificates   | `/api/my-certificates*`   | JWT                         | certification                 |
| Forums         | `/api/forums*`, `/api/discourse*` | JWT                     | discussions                   |
| Notifications  | `/api/notifications/*`    | JWT                         | alerts                        |
| Media          | `/api/google-drive/*`, `/images/*`, `/videos/*` | mixed | assets |
| Chatbot        | `/chatbot-api/chat`       | None                        | separate chatbot service      |

---

## Example TypeScript Interfaces (Mobile)

```ts
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_picture_url?: string;
  institution?: string;
  country?: string;
  state?: string;
  bio?: string;
  phone?: string;
}

export interface Course {
  id: string;
  course_id: string;
  title: string;
  description: string;
  vertical: string;
  thumbnail_url: string;
  intro_video_path?: string;
  instructor_id: string;
  is_published: boolean;
  students_count?: number;
  average_rating?: number;
}

export interface VideoTokenResponse {
  token: string | null;
  video_url: string | null;
  is_embedded: boolean;
  video_type: 'intro' | 'lecture';
}

export interface VideoProgressRequest {
  course_id: string;
  lecture_id?: string;
  current_time: number;
  duration: number;
  progress_percentage: number;
  is_completed: boolean;
  video_type: 'intro' | 'lecture';
}

export interface EnrollRequest {
  course_id: string;
}
```

---

## Suggested Service Layer Shape (for this mobile app)

```ts
// api/client.ts
const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'https://gurusetu.iitm.ac.in';

function authHeaders(): HeadersInit {
  const token = getAuthTokenSomehow();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiGet<T>(path: string, auth = true): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

async function apiJson<TReq, TRes>(path: string, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', body: TReq, auth = true): Promise<TRes> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as TRes;
}

// api/auth.ts
export const AuthApi = {
  login: (email: string, password: string, role: 'learner' | 'admin' | 'professor') =>
    apiJson<FormDataLike, TokenResponse>(`/api/login${role === 'learner' ? '' : `/${role}`}`, 'POST', { username: email, password }),
  me: () => apiGet<UserProfile>('/api/me'),
  forgotPassword: (email: string) => apiJson<{ email: string }, { message: string; email_sent?: boolean }>('/api/forgot-password', 'POST', { email }, false),
};

// api/courses.ts
export const CoursesApi = {
  list: (vertical?: string) =>
    apiGet<Course[]>(vertical ? `/api/courses?vertical=${encodeURIComponent(vertical)}` : '/api/courses', false),
  detail: (id: string) => apiGet<Course>(`/api/courses/${id}`, false),
  myCourses: () => apiGet<Course[]>('/api/my-courses'),
  enroll: (courseId: string) => apiJson<EnrollRequest, { message: string }>('/api/enroll', 'POST', { course_id: courseId }),
};

// api/video.ts
export const VideoApi = {
  token: (params: { course_id: string; video_type: 'intro' | 'lecture'; lecture_id?: string }) =>
    apiJson<typeof params, VideoTokenResponse>('/api/video/token', 'POST', params),
  saveProgress: (body: VideoProgressRequest) => apiJson<VideoProgressRequest, unknown>('/api/video-progress', 'POST', body),
};
```

