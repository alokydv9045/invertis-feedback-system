# Development Phases

## Invertis Feedback System — v2.0 Redesign

---

## 1. Phase Overview

The redesign is organized into **5 sequential phases** over ~10 weeks. Each phase produces a testable, demonstrable increment.

| Phase | Name                     | Duration   | Focus                                    |
| ----- | ------------------------ | ---------- | ---------------------------------------- |
| 1     | Foundation & Auth        | Week 1-2   | Supabase schema, auth, shared UI, brand  |
| 2     | Core Features            | Week 3-5   | Registration, dashboards, form publish, review submit |
| 3     | Analytics & Scoring      | Week 6-7   | Leaderboard, trainer perf, submission rates |
| 4     | Admin Panel              | Week 8-9   | User/course/trainer/form management      |
| 5     | Polish & Launch          | Week 10    | Responsive, brand audit, deploy          |

---

## 2. Phase 1 — Foundation & Authentication (Week 1-2)

### Objective
Stand up Supabase, define schema, build auth flow, create shared UI library with brand tokens.

### Deliverables

| #  | Deliverable                                     | Owner     | Days |
| -- | ----------------------------------------------- | --------- | ---- |
| 1  | Supabase project creation                       | Backend   | 0.5  |
| 2  | All 9 table migrations written and applied       | Backend   | 3    |
| 3  | RLS policies configured and tested               | Backend   | 1    |
| 4  | Storage bucket created (id_card_images)           | Backend   | 0.5  |
| 5  | SQL views (leaderboard, trainer, course)          | Backend   | 1    |
| 6  | RPC functions (get_user_role, get_assigned_forms) | Backend   | 0.5  |
| 7  | Seed data script                                  | Backend   | 0.5  |
| 8  | Frontend scaffolding (Vite + React + Tailwind)    | Frontend  | 0.5  |
| 9  | Supabase client init + AuthContext                | Frontend  | 1    |
| 10 | Login page (UI + Supabase Auth)                   | Frontend  | 1    |
| 11 | AuthGuard + role-based routing                    | Frontend  | 1    |
| 12 | Layout, Sidebar, Topbar components                | Frontend  | 1.5  |
| 13 | Button, Input, Select, Card components            | Frontend  | 1    |
| 14 | Tailwind theme with Invertis brand                | Frontend  | 0.5  |
| 15 | Logout flow                                       | Frontend  | 0.5  |

### Exit Criteria
- Schema live with all tables, views, and RLS
- Login works for seeded admin, HOD, and student
- Role-based redirect to correct dashboard
- Shared layout renders with sidebar + topbar
- Brand colors and typography match Invertis identity

---

## 3. Phase 2 — Core Features (Week 3-5)

### Objective
Build the primary user journeys: student registration, HOD form publishing, and review submission. Complete feedback loop works end-to-end.

### Deliverables

| #  | Deliverable                                     | Owner     | Days |
| -- | ----------------------------------------------- | --------- | ---- |
| 1  | Student Registration page UI                    | Frontend  | 1    |
| 2  | ID card upload (Supabase Storage)                | Frontend  | 1    |
| 3  | Registration flow (auth + profile + upload)      | Full-stack| 1.5  |
| 4  | Student Dashboard page                           | Frontend  | 1.5  |
| 5  | FormCard component (pending/completed)           | Frontend  | 0.5  |
| 6  | ProgressWidget component                         | Frontend  | 0.5  |
| 7  | Feedback Submission page                         | Frontend  | 1.5  |
| 8  | Review submission logic                          | Full-stack| 1    |
| 9  | Submission History page                          | Frontend  | 0.5  |
| 10 | HOD Dashboard page                               | Frontend  | 1.5  |
| 11 | HOD Form Management page                         | Frontend  | 1    |
| 12 | FormBuilder component (create form modal)        | Frontend  | 1.5  |
| 13 | Form publish/deactivate logic                    | Full-stack| 0.5  |
| 14 | Modal, Toast, FileUpload components              | Frontend  | 1    |
| 15 | Table, Pagination, Badge components              | Frontend  | 1    |

### Exit Criteria
- Student can register with name, course, years, ID card → stored in Supabase
- Student dashboard shows assigned forms
- Student can submit written review with auto timestamp
- Duplicate submission blocked
- HOD can publish and deactivate feedback forms
- Published form appears on eligible student dashboards

---

## 4. Phase 3 — Analytics & Scoring Engine (Week 6-7)

### Objective
Implement leaderboard, trainer performance, submission rate dashboards, and department overview. All analytics from SQL views.

### Deliverables

| #  | Deliverable                                     | Owner     | Days |
| -- | ----------------------------------------------- | --------- | ---- |
| 1  | Validate SQL views with seed data                | Backend   | 1    |
| 2  | LeaderboardWidget (top 5)                        | Frontend  | 0.5  |
| 3  | Full Leaderboard page                            | Frontend  | 0.5  |
| 4  | TrainerPerformanceCard component                 | Frontend  | 0.5  |
| 5  | HOD Analytics page                               | Frontend  | 1    |
| 6  | SubmissionRateChart (Recharts)                   | Frontend  | 1    |
| 7  | FeedbackFeed component (anonymous comments)      | Frontend  | 0.5  |
| 8  | Integrate analytics into HOD Dashboard           | Frontend  | 0.5  |
| 9  | Department Overview component                    | Frontend  | 1    |
| 10 | Admin global stats integration                   | Full-stack| 0.5  |
| 11 | Performance testing views with 500+ reviews      | Backend   | 1    |
| 12 | Edge case and privacy verification               | QA        | 1    |
| 13 | Dashboard card animations (Framer Motion)        | Frontend  | 0.5  |

### Exit Criteria
- Leaderboard shows top 5 by submission count (no review content)
- HOD sees trainer performance averages and course submission rates
- Recent feedback feed shows anonymized comments
- Department overview shows per-department aggregates
- All views execute ≤ 200ms

---

## 5. Phase 4 — Admin Panel & User Management (Week 8-9)

### Objective
Complete admin panel with CRUD for users, courses, trainers, and forms.

### Deliverables

| #  | Deliverable                                     | Owner     | Days |
| -- | ----------------------------------------------- | --------- | ---- |
| 1  | Admin Dashboard page                             | Frontend  | 1.5  |
| 2  | StatsCard component                              | Frontend  | 0.5  |
| 3  | User Management page (tabbed)                    | Frontend  | 1.5  |
| 4  | UserTable with search and filter                 | Frontend  | 1    |
| 5  | CreateUserModal (HOD/Admin creation)             | Frontend  | 1    |
| 6  | User deletion (cascade logic)                    | Full-stack| 1    |
| 7  | Admin Form Management page                       | Frontend  | 1    |
| 8  | Course Management page (CRUD)                    | Frontend  | 1    |
| 9  | Trainer Management page (CRUD)                   | Frontend  | 1    |
| 10 | Optional Express API for admin ops               | Backend   | 1    |

### Exit Criteria
- Admin dashboard shows all global stats
- Admin can list/search/filter users by role and department
- Admin can create HOD/Admin accounts and delete any user
- Admin can CRUD courses and trainers
- Admin can manage all feedback forms globally

---

## 6. Phase 5 — Polish, Responsive & Launch (Week 10)

### Objective
Final responsive testing, brand audit, performance optimization, and production deployment.

### Deliverables

| #  | Deliverable                                     | Owner     | Days |
| -- | ----------------------------------------------- | --------- | ---- |
| 1  | Responsive testing (320px to 1440px)             | QA        | 1    |
| 2  | Mobile sidebar/drawer polish                     | Frontend  | 0.5  |
| 3  | Brand audit (colors, typography, logo)           | Frontend  | 0.5  |
| 4  | Framer Motion polish (page transitions)          | Frontend  | 0.5  |
| 5  | Error handling review                            | QA        | 0.5  |
| 6  | Loading states review                            | Frontend  | 0.5  |
| 7  | Lighthouse audit (target ≥ 90)                   | Frontend  | 0.5  |
| 8  | 404 page + ErrorBoundary                         | Frontend  | 0.5  |
| 9  | Vercel deployment setup                          | DevOps    | 0.5  |
| 10 | Supabase production environment                  | DevOps    | 0.5  |
| 11 | Final E2E smoke test                             | QA        | 0.5  |

### Exit Criteria
- All pages render correctly on Chrome, Safari, Edge (desktop + mobile)
- Lighthouse Performance ≥ 90, Accessibility ≥ 85
- Brand matches Invertis University identity
- Vercel deployment live
- E2E smoke test passes: register → login → submit → analytics

---

## 7. Milestone Summary

| Milestone | Week | Deliverable                                    |
| --------- | ---- | ---------------------------------------------- |
| M1        | 2    | Login works, schema live, shared UI ready       |
| M2        | 5    | Full feedback loop: register → submit review    |
| M3        | 7    | Analytics dashboards and leaderboard working    |
| M4        | 9    | Admin panel complete with full CRUD              |
| M5        | 10   | Production-ready, deployed, polished             |

---

## 8. Post-Launch Roadmap (v2.1+)

| Feature                        | Version | Priority | Effort   |
| ------------------------------ | ------- | -------- | -------- |
| Password reset flow            | v2.1    | P1       | 2 days   |
| Student profile editing        | v2.1    | P2       | 2 days   |
| CSV export for analytics       | v2.1    | P2       | 3 days   |
| Gamification badges            | v2.2    | P2       | 5 days   |
| Trend analytics (semesters)    | v2.2    | P2       | 5 days   |
| Email notifications            | v2.3    | P3       | 5 days   |
| AI sentiment analysis          | v3.0    | P3       | 2+ weeks |
