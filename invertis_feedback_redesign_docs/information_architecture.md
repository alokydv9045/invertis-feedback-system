# Information Architecture

## Invertis Feedback System — v2.0 Redesign

---

## 1. Document Information

| Field            | Value                            |
| ---------------- | -------------------------------- |
| **Product**      | Invertis Feedback System (IFS)   |
| **Version**      | 2.0                              |
| **Last Updated** | 2026-05-10                        |

---

## 2. Sitemap

```
Invertis Feedback System
│
├── Public (Unauthenticated)
│   ├── /login ────────────────────── Login Page
│   ├── /register ─────────────────── Student Registration Page
│   └── /forgot-password ──────────── Password Reset Page
│
├── Student Portal (Role: student)
│   ├── /student/dashboard ────────── Student Dashboard
│   │   ├── Assigned Forms List
│   │   ├── Submission Progress
│   │   └── Leaderboard Widget
│   ├── /student/feedback/:formId ─── Feedback Submission Form
│   ├── /student/history ──────────── Submission History
│   ├── /student/leaderboard ──────── Full Leaderboard
│   └── /student/profile ──────────── Student Profile View
│
├── HOD Portal (Role: hod)
│   ├── /hod/dashboard ────────────── HOD Dashboard
│   │   ├── Trainer Performance Cards
│   │   ├── Submission Rate Overview
│   │   └── Recent Feedback Feed
│   ├── /hod/forms ────────────────── Manage Feedback Forms
│   │   ├── Form List (Active/Closed)
│   │   └── Create/Edit Form Modal
│   ├── /hod/analytics ────────────── Detailed Analytics
│   │   ├── Trainer Performance Chart
│   │   ├── Course Submission Rates
│   │   └── Department Overview
│   └── /hod/students ─────────────── Student Directory (read-only)
│
├── Admin Portal (Role: admin)
│   ├── /admin/dashboard ──────────── Admin Dashboard
│   │   ├── Global Stats Cards
│   │   ├── Department Overview
│   │   ├── Completion Rate Gauge
│   │   └── Leaderboard Widget
│   ├── /admin/users ──────────────── User Management
│   │   ├── Students Tab
│   │   ├── HODs Tab
│   │   └── Admins Tab
│   ├── /admin/forms ──────────────── Form Management (Global)
│   ├── /admin/courses ────────────── Course Management
│   ├── /admin/trainers ───────────── Trainer Management
│   ├── /admin/analytics ──────────── Global Analytics
│   └── /admin/leaderboard ────────── Full Leaderboard
│
└── Shared
    ├── 404 Page ──────────────────── Not Found (branded)
    └── Error Boundary ────────────── Global Error Handler
```

---

## 3. Navigation Architecture

### 3.1 Public Navigation

| Route              | Element            | Behavior                           |
| ------------------ | ------------------ | ---------------------------------- |
| `/login`           | Login Page         | Default landing for unauthenticated users |
| `/register`        | Registration Page  | Link from login page                |
| `/forgot-password` | Password Reset     | Link from login page                |

### 3.2 Student Sidebar Navigation

| Icon    | Label              | Route                     | Badge             |
| ------- | ------------------ | ------------------------- | ------------------ |
| 🏠      | Dashboard          | `/student/dashboard`      | —                  |
| 📝      | Submit Feedback    | *(via dashboard cards)*   | Pending count      |
| 📋      | History            | `/student/history`        | —                  |
| 🏆      | Leaderboard        | `/student/leaderboard`    | —                  |
| 👤      | Profile            | `/student/profile`        | —                  |
| 🚪      | Logout             | *(action)*                | —                  |

### 3.3 HOD Sidebar Navigation

| Icon    | Label              | Route                     | Badge             |
| ------- | ------------------ | ------------------------- | ------------------ |
| 🏠      | Dashboard          | `/hod/dashboard`          | —                  |
| 📋      | Forms              | `/hod/forms`              | Active count       |
| 📊      | Analytics          | `/hod/analytics`          | —                  |
| 👥      | Students           | `/hod/students`           | —                  |
| 🚪      | Logout             | *(action)*                | —                  |

### 3.4 Admin Sidebar Navigation

| Icon    | Label              | Route                     | Badge             |
| ------- | ------------------ | ------------------------- | ------------------ |
| 🏠      | Dashboard          | `/admin/dashboard`        | —                  |
| 👥      | Users              | `/admin/users`            | —                  |
| 📋      | Forms              | `/admin/forms`            | Active count       |
| 📚      | Courses            | `/admin/courses`          | —                  |
| 🎓      | Trainers           | `/admin/trainers`         | —                  |
| 📊      | Analytics          | `/admin/analytics`        | —                  |
| 🏆      | Leaderboard        | `/admin/leaderboard`      | —                  |
| 🚪      | Logout             | *(action)*                | —                  |

---

## 4. Page Content Hierarchy

### 4.1 Login Page

```
Login Page
├── University Logo (centered)
├── Page Title: "Invertis Feedback System"
├── Login Form
│   ├── Email Input
│   ├── Password Input
│   ├── Login Button (primary CTA)
│   └── Forgot Password Link
├── Divider
└── "New student? Register here" Link → /register
```

### 4.2 Student Registration Page

```
Registration Page
├── University Logo
├── Page Title: "Student Registration"
├── Registration Form
│   ├── Full Name Input
│   ├── Email Input
│   ├── Password Input
│   ├── Confirm Password Input
│   ├── Course Dropdown (from DB)
│   ├── Start Year Selector
│   ├── End Year Selector
│   ├── ID Card Photo Upload
│   │   ├── Drag & Drop Zone
│   │   ├── File Preview
│   │   └── File Size/Type Validation
│   └── Register Button (primary CTA)
└── "Already registered? Login" Link → /login
```

### 4.3 Student Dashboard

```
Student Dashboard
├── Top Bar
│   ├── University Logo
│   ├── Page Title: "My Dashboard"
│   ├── Notifications Bell (future)
│   └── Profile Avatar + Name
├── Sidebar Navigation
├── Main Content
│   ├── Welcome Card
│   │   ├── "Welcome, {name}"
│   │   └── Course + Year Info
│   ├── Feedback Progress Section
│   │   ├── Total Assigned Forms
│   │   ├── Completed Forms
│   │   └── Pending Forms
│   ├── Assigned Forms List
│   │   └── Form Card (per form)
│   │       ├── Form Title
│   │       ├── Trainer Name
│   │       ├── Subject
│   │       ├── Status Badge (pending/completed)
│   │       └── "Submit Feedback" Button
│   └── Leaderboard Widget
│       ├── Top 5 Entries
│       └── "View All" Link
└── Footer
```

### 4.4 Feedback Submission Page

```
Feedback Form (/student/feedback/:formId)
├── Breadcrumb: Dashboard > Feedback > {Form Title}
├── Form Header
│   ├── Form Title
│   ├── Trainer Name
│   ├── Subject
│   └── Course
├── Questions Section
│   └── Per Question
│       ├── Question Text
│       └── Answer Input
│           ├── Text Area (for type=text)
│           └── Rating Scale (for type=rating)
├── Written Review Section
│   ├── "Your Review" Label
│   ├── Text Area (10-2000 chars)
│   └── Character Counter
├── Submit Button (primary CTA)
└── Cancel Link → back to dashboard
```

### 4.5 HOD Dashboard

```
HOD Dashboard
├── Top Bar (logo, title, profile)
├── Sidebar Navigation
├── Main Content
│   ├── Department Header
│   │   └── Department Name + Code
│   ├── Summary Cards Row
│   │   ├── Total Trainers
│   │   ├── Active Forms
│   │   ├── Total Responses
│   │   └── Average Rating
│   ├── Trainer Performance Section
│   │   └── Trainer Card (per trainer)
│   │       ├── Trainer Name
│   │       ├── Average Rating (stars/number)
│   │       ├── Total Responses
│   │       └── Department
│   ├── Submission Rate Chart
│   │   └── Bar chart: course vs. completion rate
│   └── Recent Feedback Feed
│       └── Comment Card (per comment)
│           ├── Comment Text (anonymized)
│           ├── Course Name
│           ├── Trainer Name
│           └── Timestamp
└── Footer
```

### 4.6 Admin Dashboard

```
Admin Dashboard
├── Top Bar (logo, title, profile)
├── Sidebar Navigation
├── Main Content
│   ├── Global Stats Cards Row
│   │   ├── Total Students
│   │   ├── Total Faculty/Trainers
│   │   ├── Total Courses
│   │   ├── Total Departments
│   │   ├── Total Forms
│   │   ├── Total Responses
│   │   └── Completion Rate %
│   ├── Department Overview Table
│   │   └── Per Department
│   │       ├── Department Name
│   │       ├── Courses Count
│   │       ├── Faculty Count
│   │       ├── Students Count
│   │       └── Avg Rating
│   ├── Leaderboard Widget
│   └── Quick Actions
│       ├── Create HOD Account
│       ├── Publish Form
│       └── Add Course
└── Footer
```

### 4.7 Admin User Management Page

```
User Management (/admin/users)
├── Tab Navigation
│   ├── Students Tab
│   ├── HODs Tab
│   └── Admins Tab
├── Search / Filter Bar
│   ├── Search by Name/Email
│   └── Filter by Department
├── Users Table
│   ├── Name
│   ├── Email
│   ├── Department
│   ├── Status
│   ├── Created At
│   └── Actions (Edit / Delete)
├── Create User Button (opens modal)
└── Pagination Controls
```

---

## 5. Data Object Model

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  student_accounts│     │   hod_accounts   │     │  admin_accounts  │
│─────────────────│     │─────────────────│     │─────────────────│
│ id              │     │ id              │     │ id              │
│ auth_user_id ───┼──┐  │ auth_user_id ───┼──┐  │ auth_user_id ───┼──┐
│ full_name       │  │  │ full_name       │  │  │ full_name       │  │
│ course_id ──────┼┐ │  │ department_id   │  │  │ email           │  │
│ start_year      ││ │  │ email           │  │  │ status          │  │
│ end_year        ││ │  │ status          │  │  │ created_at      │  │
│ id_card_img_url ││ │  │ created_at      │  │  └────────┬────────┘  │
│ status          ││ │  └────────┬────────┘  │           │           │
│ created_at      ││ │           │           │           │           │
│ updated_at      ││ │           │           │           │           │
└────────┬────────┘│ │           │           │           │           │
         │         │ └───────────┴───────────┴───────────┘           │
         │         │           Supabase Auth (auth.users)            │
         │         │                                                 │
         │    ┌────┴──────────┐                                      │
         │    │    courses     │     ┌────────────────┐               │
         │    │──────────────│     │    trainers      │               │
         │    │ id           │     │────────────────│               │
         │    │ course_name  │     │ id             │               │
         │    │ course_code  │     │ trainer_name   │               │
         │    │ department_id│     │ department_id  │               │
         │    │ active       │     │ active         │               │
         │    └──────┬───────┘     └──────┬─────────┘               │
         │           │                    │                          │
         │    ┌──────┴────────────────────┴─────────────┐           │
         │    │          feedback_forms                  │           │
         │    │─────────────────────────────────────────│           │
         │    │ id                                      │           │
         │    │ published_by_user_id                    │           │
         │    │ course_id → courses.id                  │           │
         │    │ trainer_id → trainers.id                │           │
         │    │ subject_name                            │           │
         │    │ title                                   │           │
         │    │ status (active/closed)                  │           │
         │    │ published_at                            │           │
         │    │ closed_at                               │           │
         │    └──────┬──────────────────────────────────┘           │
         │           │                                              │
         │    ┌──────┴──────────┐     ┌─────────────────────┐       │
         │    │feedback_questions│     │      reviews         │       │
         │    │────────────────│     │─────────────────────│       │
         │    │ id             │     │ id                  │       │
         │    │ form_id        │     │ student_id          │       │
         │    │ question_text  │     │ form_id             │       │
         │    │ question_type  │     │ course_id           │       │
         │    │ sort_order     │     │ trainer_id          │       │
         │    │ active         │     │ subject_name        │       │
         │    └────────────────┘     │ review_text         │       │
         │                           │ submitted_date      │       │
         │                           │ submitted_time      │       │
         │                           │ created_at          │       │
         │                           └──────┬──────────────┘       │
         │                                  │                      │
         │                           ┌──────┴──────────────┐       │
         │                           │   review_answers     │       │
         │                           │────────────────────│       │
         │                           │ id                  │       │
         │                           │ review_id           │       │
         │                           │ question_id         │       │
         │                           │ answer_text         │       │
         │                           │ rating_value        │       │
         │                           └─────────────────────┘       │
         │                                                         │
         └─────────────────────────────────────────────────────────┘
```

---

## 6. User Flow Diagrams

### 6.1 Student Registration Flow

```
[Start]
   │
   ▼
[Open /register]
   │
   ▼
[Fill Form: name, email, password, course, years]
   │
   ▼
[Upload ID Card Photo]
   │
   ├── Invalid file? → Show error → Stay on form
   │
   ▼
[Click Register]
   │
   ├── Validation errors? → Highlight fields → Stay on form
   │
   ▼
[Create Supabase Auth user]
   │
   ├── Email exists? → Show "Email in use" → Stay on form
   │
   ▼
[Upload ID card to Storage]
   │
   ├── Upload fails? → Delete auth user → Show error
   │
   ▼
[Insert student_accounts row]
   │
   ▼
[Redirect to /login with success toast]
   │
   ▼
[End]
```

### 6.2 Feedback Submission Flow

```
[Student Dashboard]
   │
   ▼
[Click "Submit Feedback" on pending form card]
   │
   ▼
[Navigate to /student/feedback/:formId]
   │
   ▼
[Load form: title, trainer, subject, questions]
   │
   ▼
[Answer questions + write review]
   │
   ├── Validation: review text 10-2000 chars
   │
   ▼
[Click Submit]
   │
   ├── Already submitted? → Show error → Stay on form
   │
   ▼
[Insert reviews row (auto date/time)]
   │
   ▼
[Insert review_answers rows (if structured questions)]
   │
   ▼
[Show confirmation toast]
   │
   ▼
[Redirect to dashboard (form marked completed)]
   │
   ▼
[Leaderboard updates]
   │
   ▼
[End]
```

### 6.3 HOD Form Publishing Flow

```
[HOD Dashboard]
   │
   ▼
[Navigate to /hod/forms]
   │
   ▼
[Click "Create New Form"]
   │
   ▼
[Modal: select course, trainer, subject]
   │
   ├── Only department-scoped options shown
   │
   ▼
[Add questions (text/rating type)]
   │
   ▼
[Click "Publish"]
   │
   ▼
[Insert feedback_forms row]
   │
   ▼
[Insert feedback_questions rows]
   │
   ▼
[Form appears to eligible students]
   │
   ▼
[Show success toast]
   │
   ▼
[End]
```

---

## 7. Content Taxonomy

### 7.1 Labels & Terminology

| System Term         | Display Label           | Context                          |
| ------------------- | ----------------------- | -------------------------------- |
| `feedback_forms`    | Feedback Form           | HOD/Admin management             |
| `reviews`           | Review / Feedback       | Student submission               |
| `trainers`          | Trainer / Faculty       | Academic staff being evaluated    |
| `courses`           | Course                  | Academic subject group            |
| `student_accounts`  | Student                 | Registered platform user          |
| `hod_accounts`      | Head of Department      | Department overseer               |
| `admin_accounts`    | Administrator           | System administrator              |
| `leaderboard_view`  | Leaderboard             | Gamification ranking              |
| `review_answers`    | Responses / Answers     | Structured question answers       |

### 7.2 Status Values

| Entity          | Status Values                  | Display              |
| --------------- | ------------------------------ | -------------------- |
| User Account    | `active`, `suspended`          | Active / Suspended   |
| Feedback Form   | `active`, `closed`             | Active / Closed      |
| Course          | `active=true/false`            | Active / Inactive    |
| Trainer         | `active=true/false`            | Active / Inactive    |

---

## 8. Access Control Matrix

| Resource                 | Student | HOD          | Admin    |
| ------------------------ | ------- | ------------ | -------- |
| Login                    | ✅       | ✅            | ✅        |
| Register                 | ✅       | ❌            | ❌        |
| View own dashboard       | ✅       | ✅            | ✅        |
| View assigned forms      | ✅       | ❌            | ❌        |
| Submit review            | ✅       | ❌            | ❌        |
| View submission history  | ✅       | ❌            | ❌        |
| View leaderboard         | ✅       | ✅            | ✅        |
| Publish form             | ❌       | ✅ (dept)     | ✅ (all)  |
| Deactivate form          | ❌       | ✅ (own)      | ✅ (all)  |
| View trainer performance | ❌       | ✅ (dept)     | ✅ (all)  |
| View submission rates    | ❌       | ✅ (dept)     | ✅ (all)  |
| View recent feedback     | ❌       | ✅ (dept)     | ✅ (all)  |
| Manage students          | ❌       | ❌            | ✅        |
| Manage HODs              | ❌       | ❌            | ✅        |
| Manage courses           | ❌       | ❌            | ✅        |
| Manage trainers          | ❌       | ❌            | ✅        |
| View student ID cards    | ❌       | ❌            | ✅        |
| Global analytics         | ❌       | ❌            | ✅        |

---

## 9. Search & Discovery

### 9.1 Student

- **Dashboard**: Forms are pre-filtered by enrolled course. No explicit search needed for MVP.
- **History**: Sorted by most recent. Search by trainer name (P2).

### 9.2 HOD

- **Forms**: Filterable by course and status (active/closed).
- **Analytics**: Pre-scoped to department. No cross-department search.
- **Students**: Searchable by name.

### 9.3 Admin

- **Users**: Searchable by name, email. Filterable by role and department.
- **Forms**: Searchable by title. Filterable by department, course, status.
- **Courses**: Searchable by name or code.
- **Trainers**: Searchable by name. Filterable by department.

---

## 10. Notification & Feedback Patterns

| Action                  | Feedback Type      | Message Example                              |
| ----------------------- | ------------------ | -------------------------------------------- |
| Successful login        | Redirect + Toast   | "Welcome back, {name}!"                      |
| Failed login            | Inline error       | "Invalid email or password."                  |
| Registration success    | Redirect + Toast   | "Registration successful! Please log in."      |
| Review submitted        | Toast + UI update  | "Thank you! Your feedback has been recorded."  |
| Form published          | Toast              | "Feedback form published successfully."        |
| Account deleted         | Toast              | "User account deleted."                        |
| Upload failed           | Inline error       | "File upload failed. Please try again."        |
| Validation error        | Inline per-field   | "This field is required."                      |
