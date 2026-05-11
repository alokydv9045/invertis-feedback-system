# Engineering Scope Definition

## Invertis Feedback System — v2.0 Redesign

---

## 1. Document Information

| Field            | Value                            |
| ---------------- | -------------------------------- |
| **Product**      | Invertis Feedback System (IFS)   |
| **Version**      | 2.0                              |
| **Last Updated** | 2026-05-10                        |

---

## 2. Purpose

This document defines the precise engineering scope for the v2.0 redesign. It draws a clear line between **what is being built**, **what is being migrated**, **what is being deferred**, and **what is explicitly excluded**. Every engineering decision, sprint plan, and code review should reference this document.

---

## 3. Scope Boundary Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    IN SCOPE (v2.0 MVP)                       │
│                                                              │
│  ✅ Supabase schema + RLS + migrations                       │
│  ✅ Supabase Auth integration                                │
│  ✅ Student self-registration + ID card upload                │
│  ✅ HOD/Admin pre-created accounts + login                   │
│  ✅ Feedback form CRUD (HOD + Admin)                         │
│  ✅ Written review submission + auto timestamp               │
│  ✅ Leaderboard (SQL view, top 5 + full list)                │
│  ✅ Trainer performance analytics (SQL view)                 │
│  ✅ Course submission rate analytics (SQL view)              │
│  ✅ Admin user management (CRUD for all roles)               │
│  ✅ Admin course + trainer management                        │
│  ✅ Responsive UI (desktop sidebar + mobile drawer)          │
│  ✅ Invertis University brand integration                    │
│  ✅ Role-based routing and access control                    │
│  ✅ Error handling and validation                             │
│  ✅ Frontend deployment (Vercel)                              │
│  ✅ Supabase Cloud deployment                                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    DEFERRED (v2.1+)                           │
│                                                              │
│  🔶 Password reset flow via Supabase email                   │
│  🔶 Student profile editing                                  │
│  🔶 CSV export of analytics                                  │
│  🔶 Form re-activation after close                           │
│  🔶 Admin leaderboard filtering by dept/course               │
│  🔶 Gamification badges                                      │
│  🔶 Trend analytics (semester-over-semester)                 │
│  🔶 Materialized views for performance                       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    OUT OF SCOPE                               │
│                                                              │
│  ❌ AI sentiment analysis                                     │
│  ❌ Multi-language / i18n                                     │
│  ❌ Complex approval workflows                                │
│  ❌ Payment / subscription systems                            │
│  ❌ Offline sync engine                                       │
│  ❌ Email campaigns / notifications                           │
│  ❌ Multi-campus segregation                                  │
│  ❌ Public API for third-party integrations                   │
│  ❌ Native mobile app (iOS/Android)                           │
│  ❌ Real-time collaboration features                          │
│  ❌ Social features (comments, likes)                         │
│  ❌ Custom domain / white-label                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Engineering Workstreams

### 4.1 Workstream Overview

| ID   | Workstream                    | Lead Area  | Estimated Effort | Dependencies |
| ---- | ----------------------------- | ---------- | ---------------- | ------------ |
| WS-1 | Database & Infrastructure     | Backend    | 2 weeks          | None         |
| WS-2 | Authentication & Authorization| Full-stack | 1.5 weeks        | WS-1         |
| WS-3 | Student Features              | Frontend   | 2 weeks          | WS-1, WS-2   |
| WS-4 | HOD Features                  | Frontend   | 2 weeks          | WS-1, WS-2   |
| WS-5 | Admin Features                | Full-stack | 2.5 weeks        | WS-1, WS-2   |
| WS-6 | Scoring & Analytics Engine    | Backend    | 1.5 weeks        | WS-1         |
| WS-7 | UI/UX & Branding              | Frontend   | 1.5 weeks        | Parallel     |
| WS-8 | Testing & QA                  | QA         | 1.5 weeks        | WS-3–WS-6    |
| WS-9 | Deployment & DevOps           | DevOps     | 1 week           | WS-1         |

---

### 4.2 WS-1: Database & Infrastructure

**Scope:** Set up Supabase project, define schema, create migrations, configure RLS, create SQL views and functions.

| Task ID  | Task                                           | Status      | Effort  |
| -------- | ---------------------------------------------- | ----------- | ------- |
| WS1-01   | Create Supabase project                        | Not Started | 0.5 d   |
| WS1-02   | Write migration: `courses` table               | Not Started | 0.5 d   |
| WS1-03   | Write migration: `trainers` table              | Not Started | 0.5 d   |
| WS1-04   | Write migration: `student_accounts` table      | Not Started | 0.5 d   |
| WS1-05   | Write migration: `hod_accounts` table          | Not Started | 0.5 d   |
| WS1-06   | Write migration: `admin_accounts` table        | Not Started | 0.5 d   |
| WS1-07   | Write migration: `feedback_forms` table        | Not Started | 0.5 d   |
| WS1-08   | Write migration: `feedback_questions` table    | Not Started | 0.5 d   |
| WS1-09   | Write migration: `reviews` table               | Not Started | 0.5 d   |
| WS1-10   | Write migration: `review_answers` table        | Not Started | 0.5 d   |
| WS1-11   | Create SQL views (leaderboard, trainer, course) | Not Started | 1 d    |
| WS1-12   | Create RPC functions (get_user_role, etc.)      | Not Started | 1 d    |
| WS1-13   | Configure RLS policies for all tables           | Not Started | 1 d    |
| WS1-14   | Create triggers (updated_at)                    | Not Started | 0.5 d  |
| WS1-15   | Configure Storage bucket (id_card_images)       | Not Started | 0.5 d  |
| WS1-16   | Write seed data scripts                         | Not Started | 1 d    |
| WS1-17   | Validate schema with test queries               | Not Started | 0.5 d  |

---

### 4.3 WS-2: Authentication & Authorization

**Scope:** Supabase Auth integration, session management, role detection, route protection.

| Task ID  | Task                                           | Status      | Effort  |
| -------- | ---------------------------------------------- | ----------- | ------- |
| WS2-01   | Initialize Supabase client in frontend         | Not Started | 0.5 d   |
| WS2-02   | Implement AuthContext + AuthProvider            | Not Started | 1 d     |
| WS2-03   | Implement AuthGuard (protected routes)          | Not Started | 0.5 d   |
| WS2-04   | Implement role detection (get_user_role RPC)    | Not Started | 0.5 d   |
| WS2-05   | Build Login page (UI + Supabase Auth call)      | Not Started | 1 d     |
| WS2-06   | Implement session persistence and refresh       | Not Started | 0.5 d   |
| WS2-07   | Implement logout flow                           | Not Started | 0.5 d   |
| WS2-08   | Set up role-based routing (redirect by role)    | Not Started | 1 d     |
| WS2-09   | Test auth edge cases (expired token, etc.)      | Not Started | 0.5 d   |

---

### 4.4 WS-3: Student Features

**Scope:** Registration, dashboard, feedback form, submission history, leaderboard view, profile.

| Task ID  | Task                                           | Status      | Effort  |
| -------- | ---------------------------------------------- | ----------- | ------- |
| WS3-01   | Build Registration page UI                     | Not Started | 1 d     |
| WS3-02   | Implement ID card upload (Supabase Storage)     | Not Started | 1 d     |
| WS3-03   | Implement registration flow (auth + profile)    | Not Started | 1 d     |
| WS3-04   | Build Student Dashboard page                    | Not Started | 1 d     |
| WS3-05   | Build FormCard component (pending/completed)    | Not Started | 0.5 d   |
| WS3-06   | Build ProgressWidget component                  | Not Started | 0.5 d   |
| WS3-07   | Build LeaderboardWidget component               | Not Started | 0.5 d   |
| WS3-08   | Build Feedback Form page (with questions)       | Not Started | 1.5 d   |
| WS3-09   | Implement review submission logic               | Not Started | 1 d     |
| WS3-10   | Build Submission History page                   | Not Started | 0.5 d   |
| WS3-11   | Build Student Profile page                      | Not Started | 0.5 d   |
| WS3-12   | Build Full Leaderboard page                     | Not Started | 0.5 d   |

---

### 4.5 WS-4: HOD Features

**Scope:** Dashboard, form management, analytics, student directory.

| Task ID  | Task                                           | Status      | Effort  |
| -------- | ---------------------------------------------- | ----------- | ------- |
| WS4-01   | Build HOD Dashboard page                       | Not Started | 1.5 d   |
| WS4-02   | Build TrainerPerformanceCard component          | Not Started | 0.5 d   |
| WS4-03   | Build SubmissionRateChart component             | Not Started | 1 d     |
| WS4-04   | Build FeedbackFeed component                    | Not Started | 0.5 d   |
| WS4-05   | Build Form Management page                      | Not Started | 1 d     |
| WS4-06   | Build FormBuilder component (create form modal) | Not Started | 1.5 d   |
| WS4-07   | Implement form publish/deactivate logic         | Not Started | 0.5 d   |
| WS4-08   | Build HOD Analytics page                        | Not Started | 1 d     |
| WS4-09   | Build Student Directory page (read-only)        | Not Started | 0.5 d   |

---

### 4.6 WS-5: Admin Features

**Scope:** Dashboard, user management, form management, course/trainer management, global analytics.

| Task ID  | Task                                           | Status      | Effort  |
| -------- | ---------------------------------------------- | ----------- | ------- |
| WS5-01   | Build Admin Dashboard page                     | Not Started | 1.5 d   |
| WS5-02   | Build StatsCard component                       | Not Started | 0.5 d   |
| WS5-03   | Build DepartmentOverview component              | Not Started | 1 d     |
| WS5-04   | Build User Management page (tabbed)             | Not Started | 1.5 d   |
| WS5-05   | Build UserTable component                       | Not Started | 1 d     |
| WS5-06   | Build CreateUserModal (HOD/Admin creation)       | Not Started | 1 d     |
| WS5-07   | Implement user deletion (cascade logic)          | Not Started | 0.5 d   |
| WS5-08   | Build Form Management page (global)              | Not Started | 1 d     |
| WS5-09   | Build Course Management page                     | Not Started | 1 d     |
| WS5-10   | Build Trainer Management page                    | Not Started | 1 d     |
| WS5-11   | Build Global Analytics page                      | Not Started | 1 d     |
| WS5-12   | Build Full Leaderboard page (admin view)         | Not Started | 0.5 d   |
| WS5-13   | Set up optional Express API for admin ops        | Not Started | 1 d     |

---

### 4.7 WS-6: Scoring & Analytics Engine

**Scope:** SQL views, RPC functions, analytics data layer.

| Task ID  | Task                                           | Status      | Effort  |
| -------- | ---------------------------------------------- | ----------- | ------- |
| WS6-01   | Implement leaderboard_view                     | Not Started | 0.5 d   |
| WS6-02   | Implement trainer_performance_view              | Not Started | 0.5 d   |
| WS6-03   | Implement course_submission_view                | Not Started | 0.5 d   |
| WS6-04   | Implement department_overview_view              | Not Started | 0.5 d   |
| WS6-05   | Implement get_user_role RPC function            | Not Started | 0.5 d   |
| WS6-06   | Implement get_assigned_forms RPC function       | Not Started | 0.5 d   |
| WS6-07   | Implement admin stats query (global counts)     | Not Started | 0.5 d   |
| WS6-08   | Performance test all views with seed data        | Not Started | 1 d     |
| WS6-09   | Document scoring logic and edge cases            | Not Started | 0.5 d   |

---

### 4.8 WS-7: UI/UX & Branding

**Scope:** Design system, shared components, responsive layout, brand integration.

| Task ID  | Task                                           | Status      | Effort  |
| -------- | ---------------------------------------------- | ----------- | ------- |
| WS7-01   | Define brand token set (colors, typography)     | Not Started | 0.5 d   |
| WS7-02   | Configure Tailwind theme with Invertis colors   | Not Started | 0.5 d   |
| WS7-03   | Build Layout component (sidebar + topbar)       | Not Started | 1 d     |
| WS7-04   | Build Sidebar component (desktop + mobile)      | Not Started | 1 d     |
| WS7-05   | Build Topbar component                          | Not Started | 0.5 d   |
| WS7-06   | Build shared UI components (Button, Input, etc.)| Not Started | 1.5 d   |
| WS7-07   | Build Modal component                           | Not Started | 0.5 d   |
| WS7-08   | Build Table + Pagination components             | Not Started | 1 d     |
| WS7-09   | Build Toast notification system                 | Not Started | 0.5 d   |
| WS7-10   | Build ErrorBoundary + 404 page                  | Not Started | 0.5 d   |
| WS7-11   | Integrate Invertis logo across all screens       | Not Started | 0.5 d   |
| WS7-12   | Responsive testing and polish                    | Not Started | 1 d     |
| WS7-13   | Framer Motion animations setup                   | Not Started | 0.5 d   |

---

### 4.9 WS-8 & WS-9: Covered in separate documents

- WS-8 (Testing & QA) → See `testing_strategy.md`
- WS-9 (Deployment & DevOps) → See `environment_and_devops.md`

---

## 5. Technical Decisions Register

| Decision ID | Decision                                            | Rationale                                                  | Status    |
| ----------- | --------------------------------------------------- | ---------------------------------------------------------- | --------- |
| TD-01       | Use Supabase instead of MongoDB                     | Managed Postgres, built-in Auth, RLS, Storage. Eliminates in-memory fallback. | Approved  |
| TD-02       | Role-specific tables instead of single User model   | Clearer data ownership, better RLS policies, no null columns per role. | Approved  |
| TD-03       | SQL Views for analytics instead of app-level loops   | Eliminates N+1 queries, O(1) API calls for analytics.     | Approved  |
| TD-04       | Department as TEXT instead of separate table          | Simplifies MVP schema. Can normalize later.                | Approved  |
| TD-05       | Denormalize course_id, trainer_id on reviews         | Faster analytics queries; avoids joins through feedback_forms. | Approved  |
| TD-06       | Written review as primary + optional ratings         | Richer feedback than old rating-only system.               | Approved  |
| TD-07       | Single course per student (not multi-enrollment)     | Simplifies MVP. Old system had multi-enrollment via junction table; can re-add. | Approved  |
| TD-08       | Retain React + Vite + Tailwind from old system       | Team familiarity, proven stack, minimal learning curve.    | Approved  |
| TD-09       | Optional Express server (not required for MVP)       | Most CRUD via Supabase SDK; Express only for admin ops needing service role. | Approved  |
| TD-10       | RANK() for leaderboard (competition ranking)         | Standard behavior; ties share the same rank.               | Approved  |

---

## 6. Component Inventory

### 6.1 Shared Components (WS-7)

| Component       | Props                                    | Status      |
| --------------- | ---------------------------------------- | ----------- |
| Layout          | children, sidebar, topbar                 | Not Started |
| Sidebar         | role, activeRoute, onNavigate             | Not Started |
| Topbar          | user, onLogout                            | Not Started |
| Card            | title, children, className                | Not Started |
| Button          | variant, size, onClick, disabled, loading | Not Started |
| Input           | label, type, error, value, onChange       | Not Started |
| Select          | label, options, value, onChange           | Not Started |
| FileUpload      | accept, maxSize, onUpload, preview       | Not Started |
| Modal           | isOpen, onClose, title, children         | Not Started |
| Toast           | message, type, duration                   | Not Started |
| Table           | columns, data, sortable                   | Not Started |
| Pagination      | page, totalPages, onChange                | Not Started |
| Badge           | text, variant (success/warning/error)    | Not Started |
| EmptyState      | icon, title, description                  | Not Started |
| LoadingSpinner  | size                                      | Not Started |
| ErrorBoundary   | fallback                                  | Not Started |

### 6.2 Feature Components

| Feature  | Component                  | Description                                    | Status      |
| -------- | -------------------------- | ---------------------------------------------- | ----------- |
| Student  | FormCard                   | Shows form title, trainer, status, CTA          | Not Started |
| Student  | ProgressWidget             | Shows assigned/completed/pending counts         | Not Started |
| Student  | LeaderboardWidget          | Top 5 leaderboard embed                         | Not Started |
| HOD      | TrainerPerformanceCard     | Trainer name, avg rating, review count           | Not Started |
| HOD      | SubmissionRateChart        | Recharts bar chart for course submission rates   | Not Started |
| HOD      | FeedbackFeed               | Recent anonymous comments list                   | Not Started |
| HOD      | FormBuilder                | Modal form for creating feedback forms           | Not Started |
| Admin    | StatsCard                  | Single metric card (count + label)               | Not Started |
| Admin    | UserTable                  | Tabular user list with actions                   | Not Started |
| Admin    | DepartmentOverview         | Department-level analytics table                 | Not Started |
| Admin    | CreateUserModal            | Form for creating HOD/Admin accounts             | Not Started |

---

## 7. Definition of Done (DoD)

A task is considered **done** when all of the following are true:

### Code Quality

- [ ] Code compiles and runs without errors.
- [ ] No ESLint warnings or errors.
- [ ] No `console.log` statements in production code.
- [ ] Functions have descriptive names and comments for complex logic.

### Functionality

- [ ] All acceptance criteria for the related user story are met.
- [ ] Edge cases from the scoring engine specs are handled.
- [ ] Error states are handled and display user-friendly messages.

### UI/UX

- [ ] Component renders correctly on desktop (≥ 1024px).
- [ ] Component renders correctly on mobile (320px - 768px).
- [ ] Follows Invertis University brand guidelines (colors, typography, logo).
- [ ] Interactive elements have hover/focus/active states.
- [ ] Loading states are shown during async operations.

### Security

- [ ] RLS policies tested for the affected table(s).
- [ ] No sensitive data exposed in client-side code or console.
- [ ] Role-based access verified (student can't access admin routes, etc.).

### Testing

- [ ] Unit tests pass for utility functions and hooks.
- [ ] Integration tests pass for critical flows (login, register, submit).
- [ ] Manual testing completed on latest Chrome and Safari.

### Documentation

- [ ] API changes reflected in `api_contract.md`.
- [ ] Schema changes reflected in `database_schema.md`.
- [ ] New components documented with props and usage.

---

## 8. Risk Register

| Risk ID | Risk                                              | Probability | Impact | Mitigation                                           |
| ------- | ------------------------------------------------- | ----------- | ------ | ---------------------------------------------------- |
| R-01    | Supabase RLS misconfiguration leaks data           | Medium      | High   | Automated RLS tests; peer review all policies         |
| R-02    | ID card upload fails silently                      | Medium      | Medium | Transactional registration; rollback on failure       |
| R-03    | SQL views become slow with 10K+ students           | Low         | Medium | Monitor query times; upgrade to materialized views    |
| R-04    | Team unfamiliar with Supabase                      | Medium      | Medium | Spike ticket for Supabase learning; pair programming  |
| R-05    | Scope creep from stakeholders                      | High        | High   | Reference this doc; all new requests go to backlog    |
| R-06    | Mobile responsiveness delays                       | Medium      | Low    | Use Tailwind responsive utilities; test early         |
| R-07    | Data migration from old MongoDB system             | Medium      | Medium | Parallel systems; validate parity before cutover      |

---

## 9. Assumptions

| #  | Assumption                                                                              |
| -- | --------------------------------------------------------------------------------------- |
| 1  | Supabase free tier is sufficient for MVP (up to 500 MB database, 1 GB storage).          |
| 2  | Each student is enrolled in exactly one course (no multi-enrollment in MVP).              |
| 3  | HOD and Admin accounts are small in number (< 50) and can be seeded or manually created.  |
| 4  | The Invertis University logo and brand assets are available for use.                      |
| 5  | The team has access to a Supabase project and Vercel account.                            |
| 6  | Written reviews are the primary feedback format; ratings are optional and supplementary.  |
| 7  | No approval workflow is needed for student registrations in MVP.                          |
| 8  | The system operates in a single timezone (IST).                                           |

---

## 10. Constraints

| #  | Constraint                                                                              |
| -- | --------------------------------------------------------------------------------------- |
| 1  | Must use Supabase (not MongoDB) as per architecture decision.                            |
| 2  | Must retain React + Vite + Tailwind stack from old system for team continuity.            |
| 3  | Must match Invertis University visual identity.                                           |
| 4  | ID card images must be stored securely (not publicly accessible).                         |
| 5  | Reviews must never expose student identity in analytics or leaderboard.                   |
| 6  | All dates/times in IST (UTC+5:30).                                                       |
| 7  | Minimum browser support: Chrome 100+, Safari 15+, Edge 100+.                              |
