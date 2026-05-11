# System Architecture

## Invertis Feedback System — v2.0 Redesign

---

## 1. Document Information

| Field            | Value                            |
| ---------------- | -------------------------------- |
| **Product**      | Invertis Feedback System (IFS)   |
| **Version**      | 2.0                              |
| **Last Updated** | 2026-05-10                        |

---

## 2. Architecture Overview

The Invertis Feedback System v2.0 follows a **client-heavy, BaaS-backed** architecture pattern. The React frontend communicates directly with Supabase for authentication, data access, and file storage. An optional thin Node.js API layer handles operations that require server-side logic beyond what Supabase RLS can enforce.

### High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            CLIENT TIER                                    │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │              React SPA (Vite + React Router)                        │  │
│  │                                                                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │  Auth    │  │ Student  │  │   HOD    │  │     Admin        │   │  │
│  │  │  Module  │  │  Module  │  │  Module  │  │     Module       │   │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬────────┘   │  │
│  │       │              │              │                 │            │  │
│  │  ┌────┴──────────────┴──────────────┴─────────────────┴────────┐   │  │
│  │  │              Supabase Client SDK (@supabase/supabase-js)     │   │  │
│  │  └──────────────────────────┬───────────────────────────────────┘   │  │
│  └─────────────────────────────┼───────────────────────────────────────┘  │
│                                │                                          │
└────────────────────────────────┼──────────────────────────────────────────┘
                                 │ HTTPS
┌────────────────────────────────┼──────────────────────────────────────────┐
│                        BACKEND TIER                                       │
│                                │                                          │
│  ┌─────────────────────────────┼───────────────────────────────────────┐  │
│  │                    SUPABASE PLATFORM                                │  │
│  │                             │                                       │  │
│  │  ┌──────────────┐  ┌───────┴───────┐  ┌─────────────────────────┐  │  │
│  │  │  Supabase    │  │   Supabase    │  │   Supabase Storage      │  │  │
│  │  │  Auth        │  │   Postgres    │  │   (S3-compatible)       │  │  │
│  │  │              │  │               │  │                         │  │  │
│  │  │  • Sign-up   │  │  • Tables     │  │  • id_card_images       │  │  │
│  │  │  • Sign-in   │  │  • RLS        │  │    bucket               │  │  │
│  │  │  • Sessions  │  │  • Views      │  │  • Authenticated        │  │  │
│  │  │  • JWT       │  │  • Functions  │  │    access only           │  │  │
│  │  │  • Reset     │  │  • Triggers   │  │                         │  │  │
│  │  └──────────────┘  └───────────────┘  └─────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │               OPTIONAL: Node.js API (Express)                      │  │
│  │                                                                     │  │
│  │  • Admin-only bulk operations                                       │  │
│  │  • Complex validation logic                                         │  │
│  │  • Upload orchestration (resize, validate)                          │  │
│  │  • Secure aggregation endpoints                                     │  │
│  │  • Supabase Service Role Key access                                 │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend

| Technology      | Purpose                                | Version   |
| --------------- | -------------------------------------- | --------- |
| React           | UI component library                   | 19.x      |
| Vite            | Build tool and dev server              | 6.x       |
| React Router    | Client-side routing                    | 7.x       |
| Tailwind CSS    | Utility-first CSS framework            | 4.x       |
| Framer Motion   | Animations and transitions             | 11.x      |
| Recharts        | Chart/analytics visualization          | 2.x       |
| Lucide React    | Icon library                           | Latest    |
| @supabase/supabase-js | Supabase client SDK             | 2.x       |
| Axios           | HTTP client (for optional API layer)   | 1.x       |

### 3.2 Backend / Data

| Technology              | Purpose                            | Version   |
| ----------------------- | ---------------------------------- | --------- |
| Supabase Auth           | Authentication and session mgmt    | Managed   |
| Supabase Postgres       | Primary database (PostgreSQL 15+)  | Managed   |
| Supabase Storage        | File storage (ID card images)      | Managed   |
| Supabase RLS            | Row-level security policies        | Built-in  |
| SQL Views               | Analytics and leaderboard queries  | Built-in  |
| Supabase Edge Functions | Server-side logic (optional)       | Deno      |

### 3.3 Optional Server Layer

| Technology    | Purpose                          | Version   |
| ------------- | -------------------------------- | --------- |
| Node.js       | Runtime                          | 20.x LTS  |
| Express.js    | HTTP framework                   | 4.x       |
| Supabase Admin SDK | Service-role database access | 2.x       |

### 3.4 DevOps & Infrastructure

| Technology    | Purpose                          |
| ------------- | -------------------------------- |
| Vercel        | Frontend hosting (primary)       |
| Supabase Cloud| Database, auth, storage hosting  |
| GitHub        | Source control                   |
| GitHub Actions| CI/CD pipeline                   |

---

## 4. Component Architecture

### 4.1 Frontend Module Decomposition

```
src/
├── app/
│   ├── App.jsx                   # Root component, router setup
│   └── main.jsx                  # Entry point
│
├── core/
│   ├── supabase.js               # Supabase client initialization
│   ├── auth/
│   │   ├── AuthContext.jsx        # Auth state provider
│   │   ├── AuthGuard.jsx         # Protected route wrapper
│   │   └── useAuth.js            # Auth hook
│   ├── hooks/
│   │   ├── useSupabaseQuery.js   # Generic data fetching hook
│   │   └── useFileUpload.js      # File upload hook
│   └── utils/
│       ├── constants.js          # App-wide constants
│       ├── formatters.js         # Date/number formatters
│       └── validators.js         # Form validation helpers
│
├── features/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ForgotPasswordPage.jsx
│   │
│   ├── student/
│   │   ├── StudentDashboard.jsx
│   │   ├── FeedbackForm.jsx
│   │   ├── SubmissionHistory.jsx
│   │   ├── StudentProfile.jsx
│   │   └── components/
│   │       ├── FormCard.jsx
│   │       ├── ProgressWidget.jsx
│   │       └── LeaderboardWidget.jsx
│   │
│   ├── hod/
│   │   ├── HodDashboard.jsx
│   │   ├── FormManagement.jsx
│   │   ├── HodAnalytics.jsx
│   │   ├── StudentDirectory.jsx
│   │   └── components/
│   │       ├── TrainerPerformanceCard.jsx
│   │       ├── SubmissionRateChart.jsx
│   │       ├── FeedbackFeed.jsx
│   │       └── FormBuilder.jsx
│   │
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── UserManagement.jsx
│       ├── FormManagement.jsx
│       ├── CourseManagement.jsx
│       ├── TrainerManagement.jsx
│       ├── GlobalAnalytics.jsx
│       ├── FullLeaderboard.jsx
│       └── components/
│           ├── StatsCard.jsx
│           ├── UserTable.jsx
│           ├── DepartmentOverview.jsx
│           └── CreateUserModal.jsx
│
├── shared/
│   ├── components/
│   │   ├── Layout.jsx            # Shell: sidebar + topbar + content
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   ├── Card.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── FileUpload.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Table.jsx
│   │   ├── Pagination.jsx
│   │   ├── Badge.jsx
│   │   ├── EmptyState.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorBoundary.jsx
│   └── styles/
│       ├── index.css             # Global styles, Tailwind directives
│       └── theme.js              # Brand colors, typography tokens
│
└── assets/
    ├── invertis-logo.svg
    └── illustrations/
```

### 4.2 Supabase Layer Architecture

```
Supabase Project
│
├── Auth
│   ├── Email/Password provider (enabled)
│   ├── Password reset via email
│   └── JWT tokens with role metadata
│
├── Database (Postgres)
│   ├── Tables
│   │   ├── student_accounts
│   │   ├── hod_accounts
│   │   ├── admin_accounts
│   │   ├── courses
│   │   ├── trainers
│   │   ├── feedback_forms
│   │   ├── feedback_questions
│   │   ├── reviews
│   │   └── review_answers
│   │
│   ├── Views
│   │   ├── leaderboard_view
│   │   ├── trainer_performance_view
│   │   └── course_submission_view
│   │
│   ├── Functions (RPC)
│   │   ├── get_user_role(auth_uid)
│   │   ├── get_assigned_forms(student_id)
│   │   └── get_department_analytics(dept_id)
│   │
│   ├── Triggers
│   │   └── on_auth_user_created → set default metadata
│   │
│   └── RLS Policies
│       ├── student_accounts: users can read own row
│       ├── reviews: students can insert own, read none
│       ├── feedback_forms: students read active for their course
│       ├── hod_accounts: HODs read own row
│       └── admin_accounts: admins read all
│
├── Storage
│   └── id_card_images (bucket)
│       ├── Policy: authenticated upload only
│       ├── Policy: admin read only
│       └── Max file size: 5 MB
│
└── Edge Functions (optional)
    ├── register-student    # Orchestrates auth + profile + upload
    └── admin-operations    # Bulk admin actions
```

---

## 5. Authentication Architecture

### 5.1 Auth Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Client   │────▶│  Supabase    │────▶│  Postgres    │
│  (React)  │     │  Auth        │     │  Role Tables │
└──────────┘     └──────────────┘     └──────────────┘
     │                  │                     │
     │  1. signUp()     │                     │
     │  ───────────▶    │                     │
     │                  │  2. Create user in  │
     │                  │     auth.users       │
     │                  │  ──────────────▶    │
     │                  │                     │
     │  3. Session +    │                     │
     │     JWT returned │                     │
     │  ◀───────────    │                     │
     │                  │                     │
     │  4. Insert into  │                     │
     │     role table   │                     │
     │  ─────────────────────────────────▶    │
     │                  │                     │
```

### 5.2 Role Detection Strategy

After login, the client determines the user's role by querying role-specific tables:

```javascript
async function detectRole(authUserId) {
  // Check admin first
  const { data: admin } = await supabase
    .from('admin_accounts')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single();
  if (admin) return 'admin';

  // Check HOD
  const { data: hod } = await supabase
    .from('hod_accounts')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single();
  if (hod) return 'hod';

  // Check student
  const { data: student } = await supabase
    .from('student_accounts')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single();
  if (student) return 'student';

  return null; // Unknown role
}
```

**Optimization**: Store role in Supabase user metadata (`auth.users.raw_user_meta_data`) during registration to avoid three queries on every login.

### 5.3 Session Management

| Aspect               | Implementation                                        |
| -------------------- | ----------------------------------------------------- |
| Token storage        | Supabase handles via `localStorage` or cookies         |
| Token refresh        | Automatic via Supabase client SDK                      |
| Session duration     | 24 hours (configurable in Supabase dashboard)          |
| Logout               | `supabase.auth.signOut()` clears all session state     |
| Route protection     | `AuthGuard` component checks session before rendering  |

---

## 6. Data Flow Architecture

### 6.1 Student Registration Data Flow

```
[Client]                    [Supabase Auth]          [Supabase Storage]       [Supabase Postgres]
   │                             │                         │                        │
   │  1. signUp(email, pass)     │                         │                        │
   │  ─────────────────────▶     │                         │                        │
   │                             │                         │                        │
   │  2. Auth user created       │                         │                        │
   │  ◀─────────────────────     │                         │                        │
   │                             │                         │                        │
   │  3. Upload ID card          │                         │                        │
   │  ──────────────────────────────────────────────▶      │                        │
   │                             │                         │                        │
   │  4. Get public URL          │                         │                        │
   │  ◀──────────────────────────────────────────────      │                        │
   │                             │                         │                        │
   │  5. Insert student_accounts │                         │                        │
   │  ──────────────────────────────────────────────────────────────────────▶       │
   │                             │                         │                        │
   │  6. Success                 │                         │                        │
   │  ◀──────────────────────────────────────────────────────────────────────       │
```

### 6.2 Feedback Submission Data Flow

```
[Client]                    [Supabase Postgres]
   │                             │
   │  1. Load form + questions   │
   │  ─────────────────────▶     │
   │  ◀─────────────────────     │
   │                             │
   │  2. Insert review           │
   │  ─────────────────────▶     │
   │                             │
   │  3. Insert review_answers   │
   │  ─────────────────────▶     │
   │                             │
   │  4. Leaderboard view        │
   │     auto-updates            │
   │                             │
```

### 6.3 Analytics Data Flow

```
[Client]                    [Supabase Postgres]
   │                             │
   │  1. Query trainer_           │
   │     performance_view        │
   │  ─────────────────────▶     │
   │  ◀─────────────────────     │
   │                             │
   │  2. Query course_           │
   │     submission_view         │
   │  ─────────────────────▶     │
   │  ◀─────────────────────     │
   │                             │
   │  3. Query recent reviews    │
   │     (RLS-filtered)          │
   │  ─────────────────────▶     │
   │  ◀─────────────────────     │
```

---

## 7. Security Architecture

### 7.1 Defense Layers

```
┌─────────────────────────────────────────────┐
│  Layer 1: Client-side route guards           │
│  (AuthGuard, role-based redirect)            │
├─────────────────────────────────────────────┤
│  Layer 2: Supabase Auth (JWT verification)   │
│  (Every DB request includes auth token)      │
├─────────────────────────────────────────────┤
│  Layer 3: Row-Level Security (RLS)           │
│  (Postgres policies enforce data access)     │
├─────────────────────────────────────────────┤
│  Layer 4: Storage Policies                   │
│  (Bucket-level access rules)                 │
├─────────────────────────────────────────────┤
│  Layer 5: Optional API middleware            │
│  (Service-role validation for admin ops)     │
└─────────────────────────────────────────────┘
```

### 7.2 RLS Policy Summary

| Table              | Operation | Policy Rule                                           |
| ------------------ | --------- | ----------------------------------------------------- |
| student_accounts   | SELECT    | `auth.uid() = auth_user_id`                            |
| student_accounts   | INSERT    | `auth.uid() = auth_user_id` (self-registration only)   |
| hod_accounts       | SELECT    | `auth.uid() = auth_user_id`                            |
| admin_accounts     | SELECT    | `auth.uid() = auth_user_id`                            |
| courses            | SELECT    | Public (any authenticated user)                        |
| trainers           | SELECT    | Public (any authenticated user)                        |
| feedback_forms     | SELECT    | Students: `status = 'active' AND course_id = user.course_id` |
| feedback_forms     | INSERT    | HOD/Admin only (via role check function)               |
| feedback_questions | SELECT    | Linked to accessible `feedback_forms`                  |
| reviews            | INSERT    | `auth.uid()` matches `student_id`                      |
| reviews            | SELECT    | Admin/HOD only (never student reads)                   |
| review_answers     | INSERT    | Linked to own review                                   |
| review_answers     | SELECT    | Admin/HOD only                                         |

### 7.3 Storage Policies

| Bucket           | Operation | Rule                                                  |
| ---------------- | --------- | ----------------------------------------------------- |
| id_card_images   | Upload    | Authenticated users, path matches `id_cards/{uid}.*`   |
| id_card_images   | Read      | Admin only, or owner (`{uid}` matches path)            |
| id_card_images   | Delete    | Admin only                                              |

---

## 8. Performance Architecture

### 8.1 Database Optimization

| Strategy                          | Implementation                                      |
| --------------------------------- | --------------------------------------------------- |
| SQL Views for analytics           | Pre-computed aggregates, no application loops         |
| Indexed foreign keys              | All `*_id` columns indexed                           |
| Paginated queries                 | Lists use `LIMIT`/`OFFSET` or cursor pagination      |
| Leaderboard via SQL view          | `COUNT(*) ... GROUP BY ... ORDER BY` in database     |
| Connection pooling                | Supabase managed (PgBouncer)                         |

### 8.2 Frontend Optimization

| Strategy                          | Implementation                                      |
| --------------------------------- | --------------------------------------------------- |
| Code splitting                    | React.lazy() for route-level splitting               |
| Lazy-loaded charts                | Recharts components loaded on demand                 |
| Image compression                 | Client-side compression before ID card upload         |
| Caching                           | Supabase client caches session; SWR for data          |
| Debounced search                  | 300ms debounce on search inputs                      |

### 8.3 Performance Targets

| Metric                  | Target              |
| ----------------------- | -------------------- |
| First Contentful Paint  | ≤ 1.5 s              |
| Largest Contentful Paint| ≤ 2.5 s              |
| Time to Interactive     | ≤ 3.0 s              |
| API p95 latency         | ≤ 500 ms             |
| Leaderboard query time  | ≤ 200 ms             |
| Bundle size (gzipped)   | ≤ 300 KB             |

---

## 9. Deployment Architecture

```
┌───────────────────────────────────────────────────────┐
│                    HOSTING                             │
│                                                        │
│  ┌──────────────────────┐   ┌───────────────────────┐ │
│  │     Vercel            │   │   Supabase Cloud      │ │
│  │                       │   │                       │ │
│  │  React SPA            │   │  Auth Service         │ │
│  │  (Static assets)      │   │  PostgreSQL 15        │ │
│  │                       │   │  Storage (S3)         │ │
│  │  CDN edge delivery    │   │  Edge Functions       │ │
│  │  Auto SSL             │   │  Realtime (optional)  │ │
│  │  Preview deployments  │   │                       │ │
│  └──────────────────────┘   └───────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                  GitHub                           │  │
│  │                                                   │  │
│  │  Source → Push → GitHub Actions → Deploy          │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

### 9.1 Environment Configuration

| Variable                   | Environment    | Source                     |
| -------------------------- | -------------- | -------------------------- |
| `VITE_SUPABASE_URL`        | Frontend       | Supabase dashboard          |
| `VITE_SUPABASE_ANON_KEY`   | Frontend       | Supabase dashboard          |
| `SUPABASE_SERVICE_ROLE_KEY`| Server only    | Supabase dashboard (secret) |
| `VITE_API_BASE_URL`        | Frontend       | Optional API server URL     |

---

## 10. Migration Strategy from Current System

### 10.1 Architecture Comparison

| Dimension            | Old (TLFQ)                          | New (IFS v2.0)                          |
| -------------------- | ----------------------------------- | --------------------------------------- |
| Database             | MongoDB Atlas + in-memory fallback  | Supabase Postgres (managed)             |
| Auth                 | JWT + bcrypt (custom)               | Supabase Auth (managed)                 |
| User model           | Single `User` collection            | 3 role-specific tables                   |
| API                  | Express REST (tightly coupled)      | Supabase Client SDK + optional Express   |
| File storage         | None                                | Supabase Storage                         |
| Analytics            | Application-level N+1 loops         | SQL Views (database-level)               |
| Hosting              | Node.js server (full stack)         | Vercel (static) + Supabase (managed)     |
| Frontend             | React + Vite + Tailwind             | React + Vite + Tailwind (retained)       |

### 10.2 Data Migration Plan

1. Export existing MongoDB data (users, courses, faculty, responses).
2. Transform data to match new Postgres schema.
3. Import users into Supabase Auth; store role profiles in new tables.
4. Map old `department_id` references to new `courses` / `trainers`.
5. Migrate `Response` + `Answer` data to `reviews` + `review_answers`.
6. Validate data parity between old and new systems.

---

## 11. Scalability Considerations

| Concern                    | Strategy                                              |
| -------------------------- | ----------------------------------------------------- |
| Growing student count      | Supabase manages connection pooling; paginate queries   |
| Image storage growth       | Supabase Storage scales automatically                   |
| Analytics query load       | SQL Views; consider materialized views if needed         |
| Concurrent submissions     | Postgres handles MVCC; no application-level locking      |
| Multi-campus (future)      | Add `campus_id` column; extend RLS policies              |

---

## 12. Risks & Architectural Mitigations

| Risk                                          | Mitigation                                             |
| --------------------------------------------- | ------------------------------------------------------ |
| Supabase downtime affects entire platform      | Monitor status; implement offline-aware UI patterns     |
| RLS misconfiguration leaks data                | Automated RLS tests in CI pipeline                      |
| Large ID card uploads slow registration        | Client-side image compression before upload             |
| Role detection adds latency on login           | Cache role in user metadata; single query role check     |
| Optional API layer becomes a bottleneck        | Keep it stateless; scale horizontally                    |
