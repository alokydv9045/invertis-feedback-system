# Product Requirement Document (PRD)

## Invertis University Feedback System — v2.0 Redesign

---

## 1. Document Information

| Field               | Value                                                 |
| ------------------- | ----------------------------------------------------- |
| **Product Name**    | Invertis Feedback System (IFS)                        |
| **Version**         | 2.0 — Full Redesign                                   |
| **Author**          | Engineering Team                                       |
| **Status**          | Draft                                                 |
| **Last Updated**    | 2026-05-10                                             |
| **Stakeholders**    | University Admin, HODs, Students, Development Team     |

---

## 2. Executive Summary

The Invertis Feedback System v2.0 is a ground-up redesign of the existing TLFQ (Teaching-Learning Feedback Questionnaire) platform. The current system runs on MongoDB with a generic user model and an Express/React stack. The redesign migrates the data layer to **Supabase (Postgres)**, introduces **role-specific tables**, adds **student self-registration with ID card upload**, implements a **gamified leaderboard**, and aligns the entire visual identity with the official **Invertis University brand**.

The product serves three user classes — **Students**, **Heads of Department (HODs)**, and **System Administrators** — each with tailored dashboards, permissions, and workflows.

---

## 3. Problem Statement

### 3.1 Current System Limitations

| Issue                              | Description                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| Generic user model                 | A single `User` collection with a `role` field; no profile isolation between roles.              |
| MongoDB + in-memory fallback       | Fragile hybrid storage; in-memory store resets on every restart.                                  |
| No student self-registration       | Students are created by admins; no onboarding flow exists.                                       |
| No ID card verification            | No mechanism for identity verification during registration.                                      |
| No leaderboard / gamification      | No incentive mechanism to drive higher participation.                                             |
| Weak brand identity                | The UI looks like a generic SaaS dashboard, not an Invertis University product.                   |
| Limited analytics                  | Analytics are computed in application code with N+1 queries; no database-level views.             |
| Questionnaire-only feedback        | Only structured rating (1-7) questions; no written / qualitative review support.                  |

### 3.2 Desired Outcome

A production-grade, university-branded feedback platform where:

- Students can self-register, verify identity, and submit feedback.
- HODs can publish course/trainer-specific feedback forms with custom questions.
- Admins can manage the entire ecosystem from a single panel.
- Analytics are fast, reliable, and derived from database-level views.
- A leaderboard encourages student participation.
- The UI matches the official Invertis University website look and feel.

---

## 4. Business Goals

| #  | Goal                                             | Success Metric                                       |
| -- | ------------------------------------------------ | ---------------------------------------------------- |
| G1 | Improve feedback collection quality              | ≥ 70% completion rate per published form              |
| G2 | Make trainer performance visible to HODs          | HOD dashboard shows per-trainer averages               |
| G3 | Give students a trusted, clean feedback flow      | ≤ 3 clicks from login to review submission             |
| G4 | Help admins control users and forms               | All CRUD operations available in admin panel            |
| G5 | Match the platform to Invertis University brand   | UI audit passes brand guidelines checklist              |
| G6 | Encourage participation through gamification      | Leaderboard visible on student dashboard                |

---

## 5. Product Goals

- Fast feedback submission (< 2 min per form).
- Mobile-first, fully responsive access.
- Role-based dashboards with zero cross-role data leakage.
- Accurate, durable storage of user and review data in Supabase.
- Simple, auditable administration.
- Reliable, database-level reporting and analytics.

---

## 6. User Personas

### 6.1 Student

| Attribute       | Detail                                                             |
| --------------- | ------------------------------------------------------------------ |
| **Who**         | Undergraduate or postgraduate student at Invertis University        |
| **Needs**       | Register, submit reviews, track personal submissions                |
| **Pain Points** | Unclear forms, no feedback on submission status, no motivation      |
| **Goal**        | Complete feedback quickly, see leaderboard position                  |

### 6.2 Head of Department (HOD)

| Attribute       | Detail                                                             |
| --------------- | ------------------------------------------------------------------ |
| **Who**         | Department head responsible for academic quality                    |
| **Needs**       | Publish forms, monitor trainer performance, view response trends     |
| **Pain Points** | No department-level drill-down, no timeline analytics                |
| **Goal**        | Data-driven oversight of teaching quality                            |

### 6.3 System Administrator

| Attribute       | Detail                                                             |
| --------------- | ------------------------------------------------------------------ |
| **Who**         | University IT/Admin staff                                           |
| **Needs**       | Full control over users, forms, and data                            |
| **Pain Points** | No bulk operations, no audit trail, seeded demo data on restart      |
| **Goal**        | Efficient, reliable platform management                              |

---

## 7. Functional Requirements

### 7.1 Authentication & Authorization

| ID      | Requirement                                                                                       | Priority |
| ------- | ------------------------------------------------------------------------------------------------- | -------- |
| FR-A01  | Students can self-register with email and password via Supabase Auth.                             | P0       |
| FR-A02  | HOD and Admin accounts are pre-created (seeded or admin-created); they cannot self-register.       | P0       |
| FR-A03  | Login supports email-based authentication for all roles.                                          | P0       |
| FR-A04  | JWT or Supabase session tokens manage authenticated sessions.                                      | P0       |
| FR-A05  | Routes are protected by role: student, hod, admin.                                                | P0       |
| FR-A06  | Password reset flow via Supabase Auth email.                                                      | P1       |

### 7.2 Student Registration & Profile

| ID      | Requirement                                                                                       | Priority |
| ------- | ------------------------------------------------------------------------------------------------- | -------- |
| FR-R01  | Registration collects: full name, course (dropdown), start year, end year, ID card photo.          | P0       |
| FR-R02  | ID card photo is uploaded to Supabase Storage (`id_card_images` bucket).                          | P0       |
| FR-R03  | Profile row is stored in `student_accounts` and linked to `auth.users.id`.                        | P0       |
| FR-R04  | Duplicate registration is prevented via unique `auth_user_id`.                                    | P0       |
| FR-R05  | Profile supports `status` field for admin approval workflow (future).                             | P2       |

### 7.3 Feedback Form Management

| ID      | Requirement                                                                                       | Priority |
| ------- | ------------------------------------------------------------------------------------------------- | -------- |
| FR-F01  | HOD and Admin can create a feedback form for a specific course, trainer, and subject.              | P0       |
| FR-F02  | Forms contain one or more questions defined in `feedback_questions`.                               | P0       |
| FR-F03  | Forms can be activated or deactivated by the publisher or admin.                                   | P0       |
| FR-F04  | Only students enrolled in the form's course can see and submit it.                                 | P0       |
| FR-F05  | Forms track `published_at` and `closed_at` timestamps.                                            | P1       |

### 7.4 Review Submission

| ID      | Requirement                                                                                       | Priority |
| ------- | ------------------------------------------------------------------------------------------------- | -------- |
| FR-V01  | Student submits a written review (free text) for each assigned form.                              | P0       |
| FR-V02  | System auto-records `submitted_date` and `submitted_time`.                                        | P0       |
| FR-V03  | Review is linked to `student_id`, `form_id`, `course_id`, `trainer_id`, `subject_name`.           | P0       |
| FR-V04  | A student can submit only **one** review per form (duplicate prevention).                         | P0       |
| FR-V05  | If structured questions exist, per-question answers are stored in `review_answers`.                | P1       |
| FR-V06  | Rating fields (1-7 scale or similar) can optionally accompany written reviews.                    | P1       |

### 7.5 Leaderboard

| ID      | Requirement                                                                                       | Priority |
| ------- | ------------------------------------------------------------------------------------------------- | -------- |
| FR-L01  | Display top 5 students by number of submitted feedback forms.                                     | P0       |
| FR-L02  | Full leaderboard view available on request.                                                       | P1       |
| FR-L03  | Rankings update in real-time as new submissions occur.                                             | P1       |
| FR-L04  | Leaderboard shows only name and count, **never** review content.                                  | P0       |

### 7.6 Analytics

| ID      | Requirement                                                                                       | Priority |
| ------- | ------------------------------------------------------------------------------------------------- | -------- |
| FR-N01  | HOD can view trainer performance averages for their department.                                    | P0       |
| FR-N02  | HOD can view course-level submission counts (submitted vs. pending).                               | P0       |
| FR-N03  | HOD can view recent review summaries (anonymized).                                                 | P1       |
| FR-N04  | Admin can view all analytics globally across departments.                                          | P0       |
| FR-N05  | Analytics use SQL views / aggregates, not application-level loops.                                  | P0       |

### 7.7 Administration

| ID      | Requirement                                                                                       | Priority |
| ------- | ------------------------------------------------------------------------------------------------- | -------- |
| FR-D01  | Admin can create, edit, and delete HOD accounts.                                                  | P0       |
| FR-D02  | Admin can remove or suspend student accounts.                                                     | P0       |
| FR-D03  | Admin can publish, deactivate, and delete feedback forms.                                          | P0       |
| FR-D04  | Admin can manage course and trainer master data.                                                   | P0       |
| FR-D05  | Admin can view the global leaderboard and all feedback summaries.                                  | P0       |
| FR-D06  | Admin can inspect and export feedback trends.                                                      | P2       |

---

## 8. Non-Functional Requirements

### 8.1 Performance

| ID      | Requirement                                                                         | Target             |
| ------- | ----------------------------------------------------------------------------------- | ------------------- |
| NFR-P01 | Page load time (LCP)                                                                | ≤ 2.5 s             |
| NFR-P02 | API response time (p95) for list endpoints                                          | ≤ 500 ms            |
| NFR-P03 | Leaderboard query execution time                                                    | ≤ 200 ms            |
| NFR-P04 | ID card upload time (< 5 MB image)                                                  | ≤ 3 s               |

### 8.2 Security

| ID      | Requirement                                                                         |
| ------- | ----------------------------------------------------------------------------------- |
| NFR-S01 | Row-Level Security (RLS) enabled on all private Supabase tables.                    |
| NFR-S02 | ID card images stored in a protected storage bucket (authenticated access only).     |
| NFR-S03 | Reviews never expose student identity in analytics or leaderboard.                   |
| NFR-S04 | All API endpoints validate role before data access.                                   |
| NFR-S05 | Passwords are hashed using bcrypt with a minimum cost factor of 10.                  |

### 8.3 Responsiveness

| ID      | Requirement                                                                         |
| ------- | ----------------------------------------------------------------------------------- |
| NFR-R01 | All screens must be usable on viewports ≥ 320 px.                                   |
| NFR-R02 | Desktop layout uses sidebar navigation; mobile uses collapsible drawer.              |
| NFR-R03 | Forms are touch-friendly with ≥ 44 px tap targets.                                  |

### 8.4 Reliability

| ID      | Requirement                                                                         |
| ------- | ----------------------------------------------------------------------------------- |
| NFR-E01 | Stable login and session persistence across page refreshes.                         |
| NFR-E02 | Clear error handling for failed uploads and form submissions.                        |
| NFR-E03 | No data loss on server restart (no in-memory fallback in production).                |

### 8.5 Maintainability

| ID      | Requirement                                                                         |
| ------- | ----------------------------------------------------------------------------------- |
| NFR-M01 | Tables separated by responsibility (role-specific accounts, forms, reviews).          |
| NFR-M02 | Business rules are modular and easy to extend.                                       |
| NFR-M03 | Codebase follows monorepo structure with clear package boundaries.                   |

---

## 9. UX & Brand Requirements

| ID      | Requirement                                                                         |
| ------- | ----------------------------------------------------------------------------------- |
| UX-01   | The platform must feel like an official Invertis University product.                 |
| UX-02   | Use the college logo prominently on the top bar and login screen.                    |
| UX-03   | Use the Invertis blue and orange color identity.                                     |
| UX-04   | Keep the interface formal, institutional, not playful.                                |
| UX-05   | Key actions (login, register, publish, submit) are obvious and ≤ 2 clicks away.      |
| UX-06   | Leaderboard and analytics displayed in clean, scannable card layouts.                 |
| UX-07   | Use spacious cards, structured sections, and strong call-to-action blocks.            |

---

## 10. Migration from Current System

### 10.1 What We Keep

| Feature                         | Disposition                                      |
| ------------------------------- | ------------------------------------------------ |
| Role-based routing              | Retain, enhance with Supabase RLS                 |
| Student dashboard               | Retain layout, redesign visuals                    |
| HOD analytics                   | Retain concept, rebuild on SQL views               |
| Admin control panels            | Retain, expand with HOD management                 |
| Feedback form builder           | Retain, adapt for trainer/subject binding          |
| Anonymous review handling       | Retain privacy, separate leaderboard from reviews  |
| Performance analytics           | Retain, optimize with DB views                     |
| Responsive layout               | Retain, improve mobile experience                  |

### 10.2 What Changes

| Old System                            | New System                                          |
| ------------------------------------- | --------------------------------------------------- |
| MongoDB + in-memory fallback          | Supabase Postgres (hosted)                           |
| Single `User` collection with role    | Separate `student_accounts`, `hod_accounts`, `admin_accounts` |
| Admin-created student accounts        | Student self-registration with ID card upload         |
| Rating-only feedback (1-7 scale)      | Written review + optional ratings                     |
| No leaderboard                        | Leaderboard view for top submitters                   |
| Generic SaaS UI                       | Invertis University branded design                    |
| JWT with bcrypt                       | Supabase Auth + RLS                                   |
| Application-level analytics           | SQL views and database aggregates                     |

---

## 11. Out of Scope (v2.0)

- AI-generated feedback analysis or sentiment detection.
- Social features (comments, likes, sharing).
- Complex multi-level approval workflows.
- Payment or subscription systems.
- Multi-language / i18n support.
- Multi-campus segregation (unless explicitly requested later).
- Offline sync engine.
- Custom email campaigns.
- Deep reporting exports (basic CSV may be added if trivial).

---

## 12. Acceptance Criteria

The product is considered ready for release when **all P0 requirements** pass and:

1. Student registration stores profile + ID card in Supabase.
2. HOD accounts are pre-defined and can log in.
3. HOD can publish a feedback form for a specific course/trainer.
4. Students can submit written reviews with subject and auto-captured timestamp.
5. Admin can create/remove HOD and student accounts.
6. Leaderboard shows top 5 submitters correctly.
7. Analytics show trainer performance averages and submission rates.
8. The UI matches the Invertis University brand on both phone and desktop.
9. RLS policies prevent cross-role data access.
10. No data loss on server restart.

---

## 13. Priority & Delivery Order

| Phase | Scope                                          | Priority |
| ----- | ---------------------------------------------- | -------- |
| 1     | Supabase schema, auth, and student registration | P0       |
| 2     | HOD/Admin login, feedback form publishing        | P0       |
| 3     | Review submission and storage                    | P0       |
| 4     | Analytics SQL views and dashboards               | P0       |
| 5     | Leaderboard implementation                       | P0       |
| 6     | Admin controls and user management               | P0       |
| 7     | Mobile polish and university branding            | P1       |
| 8     | CSV export, password reset, polish               | P2       |

---

## 14. Risks & Mitigations

| Risk                                         | Impact | Mitigation                                                 |
| -------------------------------------------- | ------ | ---------------------------------------------------------- |
| ID card upload size / format issues           | Medium | Validate file type and size client-side; compress before upload |
| Leaderboard exposes private review data       | High   | SQL view returns only name + count, never review content    |
| HOD forms overwrite each other                | Medium | Unique constraint on (course_id, trainer_id, published_by)  |
| Role tables drift from Supabase Auth ids      | High   | Foreign key constraint + cascade on delete                  |
| Slow performance on mobile networks           | Medium | Lazy-load charts, paginate lists, compress images           |
| Migration data loss                           | High   | Run parallel systems during transition; validate data parity |

---

## 15. Glossary

| Term            | Definition                                                                 |
| --------------- | -------------------------------------------------------------------------- |
| **TLFQ**        | Teaching-Learning Feedback Questionnaire — the original system name.        |
| **IFS**         | Invertis Feedback System — the redesigned product name.                     |
| **RLS**         | Row-Level Security — Supabase/Postgres feature for per-row access control.  |
| **HOD**         | Head of Department — faculty role responsible for a department.              |
| **Supabase**    | Open-source Firebase alternative providing Auth, Postgres, and Storage.     |
| **Leaderboard** | Ranking of students by number of feedback submissions.                      |
