# User Stories & Acceptance Criteria

## Invertis Feedback System — v2.0 Redesign

---

## 1. Document Information

| Field            | Value                            |
| ---------------- | -------------------------------- |
| **Product**      | Invertis Feedback System (IFS)   |
| **Version**      | 2.0                              |
| **Last Updated** | 2026-05-10                        |

---

## 2. Story Map Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER STORY MAP                                  │
├─────────────┬─────────────────┬──────────────┬─────────────────────────┤
│  AUTH        │  REGISTRATION   │  FEEDBACK     │  ANALYTICS & ADMIN     │
├─────────────┼─────────────────┼──────────────┼─────────────────────────┤
│  S-A01 Login │  S-R01 Register │  S-F01 View  │  S-N01 Trainer Perf    │
│  S-A02 Role  │  S-R02 Upload   │  S-F02 Pub   │  S-N02 Submission Rate │
│  S-A03 Lgout │  S-R03 Profile  │  S-F03 Sub   │  S-N03 Leaderboard     │
│  S-A04 Reset │                 │  S-F04 Hist  │  S-D01 Manage Users    │
│              │                 │  S-F05 Deact │  S-D02 Manage Forms    │
│              │                 │              │  S-D03 Global Reports  │
└─────────────┴─────────────────┴──────────────┴─────────────────────────┘
```

---

## 3. Epic: Authentication & Session Management

### S-A01 — Student Login

> **As a** student,  
> **I want to** log in with my registered email and password,  
> **so that** I can access my personalized dashboard and assigned feedback forms.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | Given valid email and password, the system authenticates via Supabase Auth and returns a session token. | P0       |
| 2  | Given invalid credentials, the system shows "Invalid email or password" without revealing which field.  | P0       |
| 3  | On success, the student is redirected to the student dashboard.                                         | P0       |
| 4  | The session persists across page refreshes until explicit logout or token expiry (24h).                 | P0       |
| 5  | If the user's `status` is `suspended`, login is rejected with "Account suspended. Contact admin."       | P1       |

---

### S-A02 — HOD / Admin Login

> **As a** HOD or Admin,  
> **I want to** log in with my pre-assigned email and password,  
> **so that** I can access role-specific management tools.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | HOD and Admin accounts are pre-created by the system administrator; they cannot self-register.           | P0       |
| 2  | On successful login, the user is routed to their role-specific dashboard (HOD dashboard or Admin panel). | P0       |
| 3  | The role is determined from the `hod_accounts` or `admin_accounts` table linked via `auth_user_id`.      | P0       |
| 4  | A user that exists in neither `hod_accounts` nor `admin_accounts` nor `student_accounts` is rejected.    | P0       |

---

### S-A03 — Logout

> **As any** authenticated user,  
> **I want to** log out of the system,  
> **so that** my session is terminated and no one else can use it.

**Acceptance Criteria:**

| #  | Criterion                                                                          | Priority |
| -- | ---------------------------------------------------------------------------------- | -------- |
| 1  | Clicking "Logout" clears the Supabase session and local token storage.              | P0       |
| 2  | After logout, the user is redirected to the login page.                              | P0       |
| 3  | Accessing any protected route after logout redirects to login.                       | P0       |

---

### S-A04 — Password Reset

> **As a** registered user,  
> **I want to** reset my password via email,  
> **so that** I can recover access if I forget my credentials.

**Acceptance Criteria:**

| #  | Criterion                                                                          | Priority |
| -- | ---------------------------------------------------------------------------------- | -------- |
| 1  | User enters their email on the "Forgot Password" screen.                            | P1       |
| 2  | Supabase sends a password reset email with a secure link.                            | P1       |
| 3  | The reset link expires after 1 hour.                                                 | P1       |
| 4  | After resetting, the user can log in with the new password.                          | P1       |

---

## 4. Epic: Student Registration & Profile

### S-R01 — Self-Registration

> **As a** new student,  
> **I want to** register with my name, course, academic years, and ID card photo,  
> **so that** I have a verified account to submit feedback.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | Registration form collects: full name, course (dropdown from `courses` table), start year, end year.    | P0       |
| 2  | The course dropdown is dynamically populated from the `courses` table.                                  | P0       |
| 3  | Start year and end year are numeric selectors; end year must be > start year.                            | P0       |
| 4  | ID card photo upload accepts JPEG/PNG, max 5 MB.                                                        | P0       |
| 5  | On submit, the system creates a Supabase Auth user and inserts a row into `student_accounts`.            | P0       |
| 6  | On success, the student is redirected to the login page with a "Registration successful" toast.          | P0       |
| 7  | If the email is already registered, the system shows "Email already in use."                             | P0       |

---

### S-R02 — ID Card Upload

> **As a** registering student,  
> **I want to** upload my college ID card photo,  
> **so that** the university can verify my identity.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | The upload control shows a preview of the selected image before submission.                             | P0       |
| 2  | Accepted formats: JPEG, PNG. Maximum file size: 5 MB.                                                  | P0       |
| 3  | The image is uploaded to the Supabase Storage `id_card_images` bucket.                                  | P0       |
| 4  | The storage path follows the pattern: `id_cards/{auth_user_id}.{ext}`.                                  | P0       |
| 5  | The resulting URL is stored in `student_accounts.id_card_image_url`.                                    | P0       |
| 6  | If the upload fails, the registration is rolled back (auth user deleted).                                | P0       |

---

### S-R03 — View / Edit Profile

> **As a** registered student,  
> **I want to** view my profile information,  
> **so that** I can verify my data is correct.

**Acceptance Criteria:**

| #  | Criterion                                                                          | Priority |
| -- | ---------------------------------------------------------------------------------- | -------- |
| 1  | The student profile page shows full name, course, start year, end year, and ID card image. | P1   |
| 2  | Editing is limited to name only (course and years are immutable after registration). | P2       |
| 3  | Profile page is accessible from the sidebar/navigation.                              | P1       |

---

## 5. Epic: Feedback Form Management

### S-F01 — View Assigned Feedback Forms

> **As a** student,  
> **I want to** see a list of feedback forms relevant to my enrolled course,  
> **so that** I know which evaluations are pending.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | Student dashboard shows only active forms where `feedback_forms.course_id` matches the student's course. | P0       |
| 2  | Each form card shows: form title, trainer name, subject, and status (pending/completed).                 | P0       |
| 3  | Completed forms are visually distinct (grayed out or marked with a checkmark).                            | P0       |
| 4  | Pending forms show a prominent "Submit Feedback" button.                                                 | P0       |

---

### S-F02 — Publish Feedback Form (HOD/Admin)

> **As a** HOD,  
> **I want to** publish a feedback form for a specific course and trainer,  
> **so that** students can evaluate that trainer's performance.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | HOD selects course, trainer, and subject from dropdowns.                                                 | P0       |
| 2  | HOD defines 1 or more questions using a question builder UI.                                             | P0       |
| 3  | Each question has a type: `text` (free response) or `rating` (numeric scale).                            | P0       |
| 4  | On publish, a row is inserted into `feedback_forms` and questions into `feedback_questions`.              | P0       |
| 5  | The form immediately becomes visible to eligible students.                                                | P0       |
| 6  | `published_at` is auto-set to the current timestamp.                                                     | P0       |
| 7  | HOD can only select courses and trainers within their department.                                         | P0       |
| 8  | Admin can publish forms for any department.                                                               | P0       |

---

### S-F03 — Submit Written Review

> **As a** student,  
> **I want to** submit a written review for a trainer/subject,  
> **so that** my feedback is recorded and contributes to analytics.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | The review form shows the trainer name, subject, and defined questions.                                  | P0       |
| 2  | The student writes a free-text review in a text area (min 10 characters, max 2000).                      | P0       |
| 3  | If rating-type questions exist, the student selects a rating (1-7 or similar scale).                     | P1       |
| 4  | On submit, `reviews` row is created with auto-captured `submitted_date` and `submitted_time`.            | P0       |
| 5  | The review is linked to the correct `form_id`, `course_id`, `trainer_id`, `subject_name`.                | P0       |
| 6  | A student can submit only **one** review per form; re-submission is blocked with an error message.       | P0       |
| 7  | On success, a confirmation toast is shown and the form is marked as completed.                            | P0       |
| 8  | Leaderboard count increments immediately after submission.                                                | P0       |

---

### S-F04 — View Submission History

> **As a** student,  
> **I want to** see a history of my submitted reviews,  
> **so that** I can track what I have completed.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | Submission history shows: form title, trainer name, subject, submitted date.                             | P1       |
| 2  | The list is sorted by most recent first.                                                                 | P1       |
| 3  | Students cannot view or edit the text of their submitted review (write-once).                             | P1       |

---

### S-F05 — Deactivate / Close Feedback Form

> **As an** admin or HOD,  
> **I want to** deactivate a feedback form,  
> **so that** students can no longer submit responses to it.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | Clicking "Deactivate" sets `feedback_forms.status` to `closed` and records `closed_at`.                  | P0       |
| 2  | Closed forms are no longer visible to students.                                                           | P0       |
| 3  | Existing submissions to the form are preserved.                                                           | P0       |
| 4  | Admin can re-activate a closed form (sets status back to `active`).                                       | P1       |

---

## 6. Epic: Leaderboard

### S-L01 — View Leaderboard

> **As a** student,  
> **I want to** see a leaderboard of top feedback contributors,  
> **so that** I am motivated to participate.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | The leaderboard shows the top 5 students ranked by total number of submitted reviews.                    | P0       |
| 2  | Each entry shows: rank, student name, submission count.                                                  | P0       |
| 3  | The leaderboard does **not** display review content, trainer info, or course info.                        | P0       |
| 4  | A "View All" option expands to show the full student ranking.                                             | P1       |
| 5  | The leaderboard is driven by a SQL view (`leaderboard_view`) for performance.                             | P0       |

---

### S-L02 — Admin Leaderboard Oversight

> **As an** admin,  
> **I want to** view the complete leaderboard,  
> **so that** I can monitor engagement across the entire student body.

**Acceptance Criteria:**

| #  | Criterion                                                                         | Priority |
| -- | --------------------------------------------------------------------------------- | -------- |
| 1  | Admin dashboard shows the full leaderboard with pagination.                        | P0       |
| 2  | Admin can filter by course or department.                                           | P2       |

---

## 7. Epic: Analytics & Reporting

### S-N01 — Trainer Performance Dashboard (HOD)

> **As a** HOD,  
> **I want to** view average ratings and feedback summaries for trainers in my department,  
> **so that** I can assess teaching quality.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | The dashboard shows a list of trainers with their average rating and total response count.                | P0       |
| 2  | Trainers are sorted by rating (highest first).                                                           | P0       |
| 3  | HOD can only see trainers within their department.                                                        | P0       |
| 4  | Data is sourced from a SQL view (`trainer_performance_view`), not application-level loops.                | P0       |

---

### S-N02 — Course Submission Rate Dashboard (HOD)

> **As a** HOD,  
> **I want to** see how many students have submitted feedback per course,  
> **so that** I can identify courses with low participation.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | Each course shows: enrolled count, submitted count, submission rate percentage.                           | P0       |
| 2  | Visual indicator (progress bar or color) highlights low participation.                                    | P1       |
| 3  | HOD sees only courses in their department.                                                                | P0       |

---

### S-N03 — Recent Feedback Feed

> **As a** HOD or Admin,  
> **I want to** see a feed of recent anonymous feedback comments,  
> **so that** I can stay informed about current sentiment.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | The feed shows the 20 most recent comments with trainer name, course name, and timestamp.                | P1       |
| 2  | Student identity is **never** shown in the feed.                                                         | P0       |
| 3  | HOD only sees comments for their department's courses.                                                   | P0       |

---

## 8. Epic: Administration & User Management

### S-D01 — Manage User Accounts

> **As an** admin,  
> **I want to** view, create, and delete user accounts,  
> **so that** I have full control over platform access.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | Admin can list all students, HODs, and admins in a tabular view.                                         | P0       |
| 2  | Admin can create a new HOD account by providing name, email, department, and temporary password.          | P0       |
| 3  | Admin can delete a student or HOD account. Deletion cascades: removes profile, enrollments, and reviews.  | P0       |
| 4  | Deleting an admin account requires confirmation dialog with the text "Delete admin {name}?"              | P0       |
| 5  | The current logged-in admin cannot delete their own account.                                              | P0       |

---

### S-D02 — Manage Feedback Forms

> **As an** admin,  
> **I want to** publish, deactivate, and delete feedback forms for any department,  
> **so that** I can control the feedback lifecycle globally.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | Admin sees a list of all feedback forms (active + closed) across all departments.                         | P0       |
| 2  | Admin can publish a new form for any course/trainer combination.                                          | P0       |
| 3  | Admin can deactivate an active form.                                                                      | P0       |
| 4  | Admin can delete a form; all associated questions and reviews are cascade-deleted after confirmation.      | P1       |

---

### S-D03 — Manage Master Data (Courses & Trainers)

> **As an** admin,  
> **I want to** create, edit, and remove courses and trainers,  
> **so that** the system reflects the current academic structure.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | Admin can add a new course with name, code, and department.                                               | P0       |
| 2  | Admin can add a new trainer with name and department.                                                     | P0       |
| 3  | Admin can delete a course or trainer. Deletion is blocked if active feedback forms reference them.         | P1       |
| 4  | Admin can edit course name/code and trainer name.                                                          | P1       |

---

### S-D04 — Global Analytics Dashboard

> **As an** admin,  
> **I want to** view analytics across all departments,  
> **so that** I have a university-wide overview of feedback health.

**Acceptance Criteria:**

| #  | Criterion                                                                                              | Priority |
| -- | ------------------------------------------------------------------------------------------------------ | -------- |
| 1  | Admin dashboard shows: total students, total trainers, total courses, total forms, total responses.       | P0       |
| 2  | Dashboard shows overall feedback completion rate as a percentage.                                          | P0       |
| 3  | Department-level overview shows per-department averages.                                                   | P0       |
| 4  | Admin can drill down into any department's analytics (same view as HOD).                                  | P1       |

---

## 9. Cross-Cutting Stories

### S-X01 — Responsive Layout

> **As any** user,  
> **I want to** use the platform on my phone,  
> **so that** I can submit feedback or check analytics anywhere.

**Acceptance Criteria:**

| #  | Criterion                                                                          | Priority |
| -- | ---------------------------------------------------------------------------------- | -------- |
| 1  | Desktop uses a fixed left sidebar with navigation links.                            | P0       |
| 2  | Mobile (< 768px) collapses the sidebar into a hamburger menu or bottom navigation.  | P0       |
| 3  | Cards stack vertically on mobile.                                                    | P0       |
| 4  | Forms are full-width on mobile with touch-friendly controls.                         | P0       |

---

### S-X02 — University Branding

> **As the** university,  
> **We want** the platform to visually match our official website,  
> **so that** it feels like an institutional product.

**Acceptance Criteria:**

| #  | Criterion                                                                          | Priority |
| -- | ---------------------------------------------------------------------------------- | -------- |
| 1  | Primary color palette: Invertis Blue (#1a3a6b or similar) and Orange (#e67e22).     | P0       |
| 2  | University logo displayed in the top bar and login screen.                           | P0       |
| 3  | Typography: clean, formal sans-serif (Inter, Roboto, or similar).                   | P0       |
| 4  | White/light gray base surfaces.                                                      | P0       |
| 5  | UI tone: trustworthy, official, premium, academic.                                   | P0       |

---

### S-X03 — Error Handling

> **As any** user,  
> **I want to** see clear, helpful error messages when something goes wrong,  
> **so that** I know what happened and what to do.

**Acceptance Criteria:**

| #  | Criterion                                                                          | Priority |
| -- | ---------------------------------------------------------------------------------- | -------- |
| 1  | Network errors show "Connection failed. Please try again."                          | P0       |
| 2  | Validation errors highlight the specific field with an inline message.               | P0       |
| 3  | Upload failures show "File upload failed. Please check your file and try again."     | P0       |
| 4  | 403 errors show "You do not have permission to access this page."                    | P0       |
| 5  | 404 errors show a branded "Page not found" screen.                                   | P1       |

---

## 10. Story Status Tracker

| Story ID | Title                      | Priority | Status      |
| -------- | -------------------------- | -------- | ----------- |
| S-A01    | Student Login              | P0       | Not Started |
| S-A02    | HOD/Admin Login            | P0       | Not Started |
| S-A03    | Logout                     | P0       | Not Started |
| S-A04    | Password Reset             | P1       | Not Started |
| S-R01    | Self-Registration          | P0       | Not Started |
| S-R02    | ID Card Upload             | P0       | Not Started |
| S-R03    | View/Edit Profile          | P1       | Not Started |
| S-F01    | View Assigned Forms        | P0       | Not Started |
| S-F02    | Publish Feedback Form      | P0       | Not Started |
| S-F03    | Submit Written Review      | P0       | Not Started |
| S-F04    | View Submission History    | P1       | Not Started |
| S-F05    | Deactivate Form            | P0       | Not Started |
| S-L01    | View Leaderboard           | P0       | Not Started |
| S-L02    | Admin Leaderboard          | P0       | Not Started |
| S-N01    | Trainer Performance        | P0       | Not Started |
| S-N02    | Course Submission Rate     | P0       | Not Started |
| S-N03    | Recent Feedback Feed       | P1       | Not Started |
| S-D01    | Manage Users               | P0       | Not Started |
| S-D02    | Manage Forms               | P0       | Not Started |
| S-D03    | Manage Master Data         | P0       | Not Started |
| S-D04    | Global Analytics           | P0       | Not Started |
| S-X01    | Responsive Layout          | P0       | Not Started |
| S-X02    | University Branding        | P0       | Not Started |
| S-X03    | Error Handling             | P0       | Not Started |
