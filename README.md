# 🎓 Invertis Feedback System (IFS v2.0)

> A production-grade, university-wide **Teaching-Learning Feedback Questionnaire (TLFQ)** platform built for **Invertis University, Bareilly**.
> Enables structured, **fully anonymous** student feedback collection — department-wise, section-wise, and semester-wise — with a complete **5-tier role-based access control** hierarchy and **real-time analytics**.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📸 Screenshots

| Login Portal | Dashboard | Analytics |
|:---:|:---:|:---:|
| Dual-panel layout with campus imagery | Role-aware dashboards with campus backgrounds | Department-wise faculty ratings & filters |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                  Invertis Feedback System v2.0                  │
│                                                                 │
│  ┌─────────┐    ┌─────────────┐    ┌──────────────────────┐    │
│  │ React   │◄──►│ Express.js  │◄──►│ Supabase (PostgreSQL)│    │
│  │ Frontend│    │ REST API    │    │ + Row Level Security │    │
│  └─────────┘    └─────────────┘    └──────────────────────┘    │
│                                                                 │
│  Role Hierarchy:                                                │
│  👑 Supreme Authority → 🛡️  Super Admin → 📋 Coordinator       │
│       → 🏛️  HOD → 🎓 Student                                   │
└────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
Browser → React SPA (Vite) → Axios (JWT Bearer) → Express API → Supabase Client → PostgreSQL
```

---

## 👥 Role Hierarchy & Access Control

| Role | Scope | Key Responsibilities |
|------|-------|---------------------|
| 👑 **Supreme Authority** | Global | Create/manage Super Admin accounts, access all panels, reveal student identities |
| 🛡️ **Super Admin** | University-wide | Create departments, HODs, Coordinators; reveal anonymous student identities; view university-wide analytics |
| 📋 **Coordinator** | University-wide | Manage sections, courses, faculty (College/Trainer), pre-enroll students, manage assignments |
| 🏛️ **HOD** | Own department | Create TLFQ forms, set/extend deadlines, open/close feedback portal |
| 🎓 **Student** | Own section only | Submit anonymous feedback for assigned faculty; view leaderboard |

---

## ✨ Key Features

### 🔒 Student Anonymity System
- Every student is assigned a **computer-generated Anonymous ID** (`ANO-XXXXXX`) at enrollment
- The Leaderboard and all analytics show **only the Anonymous ID** — never the real name
- **Only Super Admin and Supreme Authority** can reveal a student's real identity
- Dedicated **"Identity Reveal"** page with confirmation step before showing real name, roll number, email, and section

### 🗳️ Feedback Engine (TLFQ)
- HODs create **TLFQ forms** per section × course × faculty with configurable deadlines
- Students can only see forms for **their exact section and semester**
- Each submission is **one-time only** (duplicate prevention at database level)
- Students earn **points** per submission — shown anonymously on the Leaderboard
- HOD can **instantly close** the entire department's feedback portal
- Forms auto-expire past `closing_time`

### 📊 Analytics & Leaderboard
- Dept-wise faculty rating charts with **College Faculty vs Trainer** filter
- Super Admin sees university-wide analytics across all departments
- Course-wise performance reports
- Feedback insights and comment analysis
- **Anonymous Leaderboard** — shows top contributing students by ANO- ID and points with podium display

### 🎨 Modern UI / UX
- **Campus imagery** backgrounds at subtle 15% opacity across all pages
- **Dual-panel login** with institutional branding and glassmorphism form
- Responsive **sidebar navigation** with role-filtered menu items
- **Framer Motion** animations — smooth page transitions, spring-loaded podium, fade-in cards
- Reusable **UI component library** — Cards, Modals, Tabs, Badges, Alerts, Skeletons, Buttons, Inputs
- **Recharts** powered interactive charts and bar graphs

### 🔑 Authentication & Security
- **JWT-based authentication** with auto-refresh and protected routes
- **2-step student registration** — pre-enrolled by Coordinator, activated by student
- In-app **password change** for staff roles
- **bcryptjs** password hashing (cost factor 10)
- **Section isolation** — students see only their assigned forms

---

## 🔑 Authentication Flow

```
┌─ Login at /login ─────────────────────────────────────────────┐
│                                                                │
│  Staff Roles  →  Email + Password  →  Role Dashboard           │
│                                                                │
│  Student (Active)   →  Student ID + Password  →  Dashboard     │
│  Student (Pending)  →  Student ID  →  Set Email + Password     │
│                       (first-time registration)                │
└────────────────────────────────────────────────────────────────┘
```

The system **auto-detects** the identifier type (email vs Student ID) and adapts the flow dynamically.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Supabase** project (free tier works) with PostgreSQL
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/alokydv9045/invertis-feedback-system.git
cd invertis-feedback-system
git checkout ankur-pratap-singh
```

### 2. Backend Setup

```bash
cd server
npm install

# Create environment file
cp .env.example .env
```

Edit `server/.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

#### Database Setup

1. Go to your Supabase Dashboard → **SQL Editor**
2. Run the contents of `server/schema.sql` to create all tables and RLS policies
3. Seed the database:

```bash
npm run seed    # Creates demo users, departments, sections, etc.
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Start Development Servers

```bash
# Terminal 1 — Backend API
cd server
npm run dev          # → http://localhost:5000

# Terminal 2 — Frontend UI
cd frontend
npm run dev          # → http://localhost:5173
```

### 5. Build for Production

```bash
cd frontend
npm run build        # Output in frontend/dist/
```

---

## 🔐 Credentials

Login credentials for all seeded accounts are stored in **`CREDENTIALS.md`** (local only, gitignored).

For a safe password-free template, see [`CREDENTIALS.example.md`](./CREDENTIALS.example.md).

```bash
cp CREDENTIALS.example.md CREDENTIALS.md
# Fill in the actual passwords from the seed script
```

> ⚠️ **`CREDENTIALS.md` is in `.gitignore` — it will never be committed or pushed.**

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <JWT>` header.

### Auth (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/check-student` | Public | Check if student ID exists & return registration status |
| POST | `/auth/complete-registration` | Public | Activate pending student account (set email + password) |
| POST | `/auth/login` | Public | Unified login — auto-detects email vs student_id |
| GET | `/auth/me` | Authenticated | Get current user profile with role info |
| PUT | `/auth/change-password` | supreme, super_admin, hod | Change own password |

### Coordinator (`/api/coordinator`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/coordinator/departments` | coordinator+ | List all departments |
| POST | `/coordinator/departments` | coordinator+ | Create a new department |
| DELETE | `/coordinator/departments/:id` | coordinator+ | Delete a department |
| GET | `/coordinator/sections` | coordinator+ | List sections (filterable by dept) |
| POST | `/coordinator/sections` | coordinator+ | Create a section |
| GET | `/coordinator/courses` | coordinator+ | List courses |
| POST | `/coordinator/courses` | coordinator+ | Create a course |
| GET | `/coordinator/faculty` | coordinator+ | List faculty (with teacher_type) |
| POST | `/coordinator/faculty` | coordinator+ | Add faculty member |
| GET | `/coordinator/assignments` | coordinator+ | List section-faculty-course assignments |
| POST | `/coordinator/assignments` | coordinator+ | Assign faculty to section+course |
| DELETE | `/coordinator/assignments/:id` | coordinator+ | Remove assignment |
| GET | `/coordinator/students` | coordinator+ | List students (filterable) |
| POST | `/coordinator/students` | coordinator+ | Pre-enroll a student |
| PUT | `/coordinator/students/:id/reset-password` | coordinator+ | Reset student password |

### Super Admin (`/api/superadmin`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/superadmin/superadmins` | supreme | Create Super Admin account |
| POST | `/superadmin/hods` | super_admin+ | Create HOD account |
| POST | `/superadmin/coordinators` | super_admin+ | Create Coordinator account |
| GET | `/superadmin/staff` | super_admin+ | List all staff members |
| PUT | `/superadmin/users/:id` | super_admin+ | Update user details |
| DELETE | `/superadmin/users/:id` | super_admin+ | Delete user account |
| GET | `/superadmin/reveal?anon_id=ANO-XXXX` | super_admin+ | Reveal student real identity |

### HOD (`/api/hod`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/hod/sections` | hod | List sections in own department |
| GET | `/hod/section-faculty` | hod | Faculty assignments for a section |
| GET | `/hod/stats` | hod | Department statistics overview |
| POST | `/hod/tlfq` | hod | Create evaluation form |
| GET | `/hod/tlfq` | hod | List own department's forms |
| PUT | `/hod/tlfq/:id/toggle` | hod | Open or close a form |
| PUT | `/hod/tlfq/:id/deadline` | hod | Extend form deadline |
| GET | `/hod/portal` | hod | Get portal status |
| PUT | `/hod/portal` | hod | Toggle department portal open/closed |

### Student (`/api/student`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/student/courses` | student | Get section-specific courses + TLFQ forms |
| GET | `/student/tlfq/:tlfqId` | student | Get specific evaluation form details |
| POST | `/student/submit` | student | Submit feedback (one-time per TLFQ) |
| GET | `/student/analytics` | super_admin, hod, supreme | Department analytics data |
| GET | `/student/leaderboard` | all authenticated | Anonymous leaderboard (ANO- IDs only) |

---

## 🗂️ Project Structure

```
invertis-feedback-system/
├── .gitignore                    # Excludes .env, node_modules, CREDENTIALS.md
├── README.md                     # This file
├── CREDENTIALS.example.md        # Safe credentials template (committed)
├── USER_MANUAL.md                # End-user documentation
│
├── server/                       # ── Express.js Backend ──
│   ├── server.js                 # App entry point, Express config, CORS, routes
│   ├── db.js                     # Supabase client initialization
│   ├── schema.sql                # Full PostgreSQL schema with RLS policies
│   ├── seed.js                   # Database seeding script (demo data)
│   ├── drop_db.js                # Utility: truncate all tables
│   ├── .env.example              # Environment variable template
│   ├── controllers/
│   │   ├── authController.js     # 2-step auth, JWT issuance, password change
│   │   ├── coordinatorController.js  # CRUD for depts, sections, courses, faculty, students
│   │   ├── hodController.js      # TLFQ forms, portal control, department stats
│   │   ├── superadminController.js   # Staff management, identity reveal
│   │   ├── responseController.js     # Feedback submission, analytics, leaderboard
│   │   ├── tlfqController.js     # TLFQ lifecycle management
│   │   ├── userController.js     # User profile operations
│   │   └── syncController.js     # Data sync utilities
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── coordinatorRoutes.js  # /api/coordinator/*
│   │   ├── hodRoutes.js          # /api/hod/*
│   │   ├── superadminRoutes.js   # /api/superadmin/*
│   │   └── responseRoutes.js     # /api/student/*
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   └── roleMiddleware.js     # Role-based authorization guard
│   └── lib/
│       └── supabase.js           # Supabase client singleton
│
├── frontend/                     # ── React SPA ──
│   ├── index.html                # HTML entry point
│   ├── vite.config.js            # Vite build configuration
│   ├── tailwind.config.js        # Tailwind theme (Invertis brand colors)
│   ├── public/
│   │   ├── logo.png              # Invertis University official logo
│   │   ├── favicon.svg           # Browser tab icon
│   │   └── campus/               # Campus photography assets
│   │       ├── gate.jpg          # University main gate
│   │       ├── academic-block.jpg    # Academic block view
│   │       ├── academic-block-2.jpg  # Academic block alternate
│   │       ├── hemburgure-image.webp # Campus panoramic
│   │       └── invertis-univ.webp    # University aerial view
│   └── src/
│       ├── main.jsx              # React DOM entry point
│       ├── App.jsx               # Router config & route definitions
│       ├── index.css             # Global styles, design tokens, utilities
│       ├── App.css               # App-level theme & component styles
│       ├── context/
│       │   └── AuthContext.jsx   # Global auth state, JWT management, auto-logout
│       ├── services/
│       │   └── api.js            # Axios instance with auto token injection & interceptors
│       ├── components/
│       │   ├── Navbar.jsx        # Legacy topbar (preserved for compatibility)
│       │   ├── Sidebar.jsx       # Legacy sidebar (preserved for compatibility)
│       │   ├── ProtectedRoute.jsx    # JWT + role guard wrapper
│       │   ├── RatingScale.jsx   # 1-7 Likert scale input for feedback forms
│       │   ├── layout/
│       │   │   ├── AppLayout.jsx # Main layout shell (Sidebar + Topbar + Outlet)
│       │   │   ├── Sidebar.jsx   # Role-filtered sidebar navigation
│       │   │   └── Topbar.jsx    # Top header bar with user info & actions
│       │   └── ui/               # Reusable UI component library
│       │       ├── Alert.jsx     # Dismissible success/error/info alerts
│       │       ├── Badge.jsx     # Color-coded status badges
│       │       ├── Button.jsx    # Primary/secondary/ghost button variants
│       │       ├── Card.jsx      # Card + CardBody containers
│       │       ├── EmptyState.jsx    # Empty data placeholder with icon
│       │       ├── Input.jsx     # Form input with label & error state
│       │       ├── LoadingSpinner.jsx # Animated loading indicator
│       │       ├── Modal.jsx     # Accessible overlay modal dialog
│       │       ├── Select.jsx    # Styled select dropdown
│       │       ├── Skeleton.jsx  # Content loading skeleton placeholders
│       │       ├── StatsCard.jsx # Metric display card with icon & color
│       │       └── Tabs.jsx      # Horizontal tab navigation
│       └── pages/
│           ├── Login.jsx         # Dual-panel login with campus imagery
│           ├── Dashboard.jsx     # Role-aware hub (auto-routes by user role)
│           ├── SupremePanel.jsx   # Supreme: manage Super Admin accounts
│           ├── SuperAdminPanel.jsx    # Super Admin: departments, HODs, coordinators
│           ├── IdentityReveal.jsx    # 🔍 Reveal student identity (super_admin + supreme)
│           ├── CoordinatorPanel.jsx  # 6-tab panel: depts, sections, courses, faculty, assignments, students
│           ├── HODPanel.jsx      # HOD: form creation, management & portal toggle
│           ├── Analytics.jsx     # Dept-wise analytics with faculty/trainer filter
│           ├── Leaderboard.jsx   # Anonymous leaderboard with podium display
│           └── TLFQPage.jsx      # Student feedback evaluation form (Likert scale)
```

---

## 🛡️ Security Model

| Layer | Implementation |
|-------|---------------|
| **Authentication** | JWT tokens (HS256), 24h expiry, auto-injected via Axios interceptor |
| **Authorization** | 5-tier RBAC — each API route enforces minimum role via middleware |
| **Password Security** | bcryptjs hashing (cost factor 10) for all stored passwords |
| **Student Anonymity** | `unique_feedback_id` (`ANO-XXXXXX`) is the only public identifier |
| **Identity Reveal** | Only super_admin/supreme can reveal — requires explicit ANO-ID input + confirmation |
| **Section Isolation** | Students only see TLFQs matching their exact `section_id` and `semester` |
| **Portal Gate** | HOD can disable all feedback submission for their department instantly |
| **Form Expiry** | TLFQs auto-expire past `closing_time` — no manual intervention needed |
| **Duplicate Prevention** | Unique constraint on `(student_id, tlfq_id)` — one submission per form |
| **CORS** | Restricted origin policy in production |
| **Environment Secrets** | `.env` files gitignored; Supabase service key never exposed to client |

---

## 🧩 Data Model (PostgreSQL via Supabase)

```
┌─────────────┐
│ departments │ ←─────────────────────────────────┐
├─────────────┤                                    │
│ id, name,   │                                    │
│ code        │                                    │
└──────┬──────┘                                    │
       │ 1:N                                       │
       ▼                                           │
┌─────────────┐        ┌──────────────┐            │
│  sections   │        │   courses    │            │
├─────────────┤        ├──────────────┤            │
│ dept_id,    │        │ name, code   │            │
│ semester,   │        └──────┬───────┘            │
│ label (A/B) │               │                    │
└──────┬──────┘               │                    │
       │                      │                    │
       ▼ M:N                  ▼                    │
┌──────────────────┐    ┌──────────┐               │
│ section_faculty  │◄──►│ faculty  │               │
├──────────────────┤    ├──────────┤               │
│ section_id,      │    │ name,    │               │
│ faculty_id,      │    │ type:    │               │
│ course_id        │    │ college/ │               │
└──────┬───────────┘    │ trainer  │               │
       │                └──────────┘               │
       ▼ 1:N                                       │
┌──────────────┐                                   │
│    tlfqs     │                                   │
├──────────────┤                                   │
│ section_id,  │        ┌──────────────────┐       │
│ faculty_id,  │        │      users       │       │
│ course_id,   │        ├──────────────────┤       │
│ closing_time,│        │ role: supreme│   │       │
│ is_active    │        │   super_admin│   │       │
└──────┬───────┘        │   coordinator│   │       │
       │                │   hod (dept_id)──┘       │
       ▼ 1:N            │   student    │           │
┌──────────────┐        │ student_id   │           │
│  responses   │◄───────│ anon_id      │           │
├──────────────┤        │ section_id   │           │
│ student_id,  │        └──────────────┘           │
│ tlfq_id,     │                                   │
│ comment      │                                   │
└──────┬───────┘                                   │
       │ 1:N                                       │
       ▼                                           │
┌──────────────┐                                   │
│   answers    │                                   │
├──────────────┤                                   │
│ question_id, │                                   │
│ rating (1-7) │                                   │
└──────────────┘                                   │
```

---

## 📦 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | React | 19.x |
| **Build Tool** | Vite | 8.x |
| **Styling** | TailwindCSS | 3.4 |
| **Animations** | Framer Motion | 12.x |
| **Charts** | Recharts | 3.x |
| **Icons** | Lucide React | 1.x |
| **HTTP Client** | Axios | 1.x |
| **Routing** | React Router DOM | 7.x |
| **Backend** | Express.js | 4.x |
| **Database** | Supabase (PostgreSQL) | — |
| **Auth Hashing** | bcryptjs | 2.x |
| **Token Auth** | jsonwebtoken (JWT) | 9.x |
| **Design** | Custom campus-themed UI with glassmorphism | — |

---

## 🔄 Database Management

```bash
# Apply schema (run in Supabase SQL Editor)
# Copy-paste contents of server/schema.sql

# Seed demo data
cd server
npm run seed

# Reset database (truncate all tables)
node drop_db.js
npm run seed          # Re-seed after reset
```

---

## 🧑‍💻 Development

```bash
# Run backend with auto-reload
cd server && npm run dev        # Express API → http://localhost:5000

# Run frontend dev server (HMR)
cd frontend && npm run dev      # Vite → http://localhost:5173

# Build frontend for production
cd frontend && npm run build    # Output → frontend/dist/

# Lint frontend code
cd frontend && npm run lint
```

### Environment Variables

#### `server/.env`

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

> ⚠️ **Never commit `.env` files.** The `.gitignore` already excludes them.

---

## 🎨 Design System

### Brand Colors (Invertis)

| Token | Hex | Usage |
|-------|-----|-------|
| `invertis-navy` | `#0A1628` | Primary dark, sidebar, headers |
| `invertis-blue` | `#1E40AF` | Primary accent, links, active states |
| `invertis-orange` | `#EA580C` | Secondary accent, highlights, badges |
| `surface` | `#F8FAFC` | Page background |

### Campus Imagery

All pages feature subtle campus photography backgrounds at **15% opacity** for institutional branding:

| Image | Used On |
|-------|---------|
| `gate.jpg` | Super Admin Panel, HOD Dashboard |
| `academic-block.jpg` | HOD Panel, Student Dashboard |
| `academic-block-2.jpg` | Admin Dashboard, Coordinator, Leaderboard |
| `hemburgure-image.webp` | Analytics, Login (left panel) |

### UI Component Library

12 reusable components in `frontend/src/components/ui/`:

`Alert` · `Badge` · `Button` · `Card` · `EmptyState` · `Input` · `LoadingSpinner` · `Modal` · `Select` · `Skeleton` · `StatsCard` · `Tabs`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m "feat: add my feature"`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License — Developed for **Invertis University, Bareilly** by APS.
