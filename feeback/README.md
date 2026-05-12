# 🎓 Invertis Feedback System

> A production-grade, university-wide **Teaching-Learning Feedback System (TLFQ)** built for **Invertis University, Lucknow**.
> Enables structured, **fully anonymous** student feedback collection — department-wise, section-wise, and semester-wise — with a complete 5-tier role-based access control hierarchy.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────┐
│               Invertis Feedback System                    │
│                                                           │
│  👑 Supreme Authority  →  Manage Super Admins             │
│  🛡️  Super Admin       →  Manage Departments, HODs, Coords│
│  📋 Coordinator        →  Manage Sections, Faculty, Students│
│  🏛️  HOD               →  Create & Open Evaluation Forms  │
│  🎓 Student            →  Submit Feedback (Anonymously)   │
└──────────────────────────────────────────────────────────┘
```

---

## 👥 Role Hierarchy

| Role | Access Level | Key Responsibilities |
|------|-------------|----------------------|
| 👑 **Supreme Authority** | Global | Create/manage Super Admin accounts, access all panels, reveal student identities |
| 🛡️ **Super Admin** | University-wide | Create departments, HODs, Coordinators; reveal anonymous student identities |
| 📋 **Coordinator** | University-wide | Manage sections, courses, faculty (College/Trainer), pre-enroll students |
| 🏛️ **HOD** | Own department | Create TLFQ forms, set deadlines, open/close feedback portal |
| 🎓 **Student** | Own section only | Submit anonymous feedback for assigned faculty; view leaderboard |

---

## ✨ Key Features

### 🔒 Student Anonymity System
- Every student is assigned a **computer-generated Anonymous ID** (`ANO-XXXXXX`) at enrollment
- The Leaderboard and all analytics show **only the Anonymous ID** — never the real name
- **Only Super Admin and Supreme Authority** can reveal a student's real identity
- Dedicated **"Identity Reveal"** page — requires typing the ANO- ID and a confirmation step before showing real name, roll number, email, and section

### 🗳️ Feedback Engine
- HODs create **TLFQ forms** per section × course × faculty with configurable deadlines
- Students can only see forms for **their exact section and semester**
- Each submission is **one-time only** (duplicate prevention)
- Students earn **points** per submission — shown anonymously on the Leaderboard
- HOD can **instantly close** the entire department's feedback portal

### 📊 Analytics & Leaderboard
- Dept-wise faculty rating charts with **College Faculty vs Trainer** filter
- Super Admin sees university-wide analytics across all departments
- **Anonymous Leaderboard** — shows top contributing students by ANO- ID and points

### 🌙 Dark / Light Mode
- Global theme toggle (Sun/Moon) in the Navbar — persists across sessions

### 🔑 Change Password
- In-app password change modal for Supreme, Super Admin, and HOD roles

---

## 🔑 Authentication Flow

```
┌─ Login at /login ────────────────────────────────────────┐
│                                                           │
│  Staff  →  Enter Email  →  Enter Password  →  Dashboard  │
│                                                           │
│  Student (Active)   →  Enter Student ID  →  Password  →  Dashboard │
│  Student (Pending)  →  Enter Student ID  →  Set Email + Password   │
└───────────────────────────────────────────────────────────┘
```

The system **auto-detects** the identifier type (email vs Student ID) and adapts the flow.

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas cluster (or local MongoDB)
- Git

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/alokydv9045/invertis-feedback-system.git
cd invertis-feedback-system

# 2. Backend setup
cd server
npm install
cp .env.example .env
# Edit .env — add your MONGO_URI and JWT_SECRET

# 3. Frontend setup
cd ../frontend
npm install

# 4. Start both (in separate terminals)
cd server && npm start       # API → http://localhost:5000
cd frontend && npm run dev   # UI  → http://localhost:5173
```

### Environment Variables (`server/.env`)

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/invertis_feedback
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

> ⚠️ The database is **auto-seeded** on first startup. All demo accounts (see `CREDENTIALS.example.md`) are created automatically.

---

## 🔐 Credentials

Login credentials for all seeded accounts are stored in **`CREDENTIALS.md`** (local only, gitignored).

For a safe password-free template, see [`CREDENTIALS.example.md`](./CREDENTIALS.example.md).

To create your local credentials file:
```bash
cp CREDENTIALS.example.md CREDENTIALS.md
# Then fill in the actual passwords from the seed script
```

> ⚠️ **`CREDENTIALS.md` is in `.gitignore` — it will never be committed or pushed.**

---

## 📡 API Reference

### Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/check-student` | Public | Check if student ID exists & return status |
| POST | `/auth/complete-registration` | Public | Activate pending student account |
| POST | `/auth/login` | Public | Unified login (email or student_id + password) |
| GET | `/auth/me` | Authenticated | Get current user profile |
| PUT | `/auth/change-password` | supreme, super_admin, hod | Change own password |

### Coordinator (`/api/coordinator`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET/POST | `/coordinator/departments` | coordinator, super_admin, supreme | List / create departments |
| GET/POST | `/coordinator/sections` | coordinator, super_admin, supreme | List / create sections |
| GET/POST | `/coordinator/courses` | coordinator, super_admin, supreme | List / create courses |
| GET/POST | `/coordinator/faculty` | coordinator, super_admin, supreme | List / add faculty (with teacher_type) |
| POST/DELETE | `/coordinator/assignments` | coordinator, super_admin, supreme | Assign / remove faculty from section |
| GET/POST | `/coordinator/students` | coordinator, super_admin, supreme | List / pre-enroll students |
| PUT | `/coordinator/students/:id/reset-password` | coordinator, super_admin | Reset student password |

### Super Admin (`/api/superadmin`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/superadmin/superadmins` | supreme | Create Super Admin account |
| POST | `/superadmin/hods` | super_admin, supreme | Create HOD account |
| POST | `/superadmin/coordinators` | super_admin, supreme | Create Coordinator account |
| GET | `/superadmin/staff` | super_admin, supreme | List all staff (super_admin, hod, coordinator) |
| PUT/DELETE | `/superadmin/users/:id` | super_admin, supreme | Update / delete user |
| GET | `/superadmin/reveal?anon_id=ANO-XXXX` | super_admin, supreme | Reveal student identity by Anonymous ID |

### HOD (`/api/hod`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/hod/sections` | hod | View sections in own dept |
| GET | `/hod/section-faculty` | hod | Faculty assignments for a section |
| GET | `/hod/stats` | hod | Department statistics |
| POST | `/hod/tlfq` | hod | Create evaluation form |
| GET | `/hod/tlfq` | hod | List own forms |
| PUT | `/hod/tlfq/:id/toggle` | hod | Open / close a form |
| PUT | `/hod/tlfq/:id/deadline` | hod | Extend form deadline |
| GET/PUT | `/hod/portal` | hod | View / toggle department portal |

### Student (`/api/student`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/student/courses` | student | Get section-specific courses + TLFQs |
| GET | `/student/tlfq/:tlfqId` | student | Get specific evaluation form |
| POST | `/student/submit` | student | Submit feedback (one-time per TLFQ) |
| GET | `/student/analytics` | super_admin, hod, supreme | Dept analytics |
| GET | `/student/leaderboard` | all | Anonymous leaderboard (ANO- IDs only) |

---

## 🗂️ Project Structure

```
invertis-feedback-system/
├── .gitignore                  # Excludes .env, node_modules, CREDENTIALS.md
├── CREDENTIALS.example.md      # Safe credentials template (committed)
├── CREDENTIALS.md              # Real credentials (LOCAL ONLY — gitignored)
│
├── server/
│   ├── controllers/
│   │   ├── authController.js           # 2-step auth, JWT, password change
│   │   ├── coordinatorController.js    # Sections, faculty, students
│   │   ├── hodController.js            # TLFQ forms, portal control
│   │   ├── superadminController.js     # Staff management, identity reveal
│   │   └── responseController.js       # Feedback submission, analytics, leaderboard
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── coordinatorRoutes.js
│   │   ├── hodRoutes.js
│   │   ├── superadminRoutes.js
│   │   └── responseRoutes.js
│   ├── middleware/
│   │   ├── auth.js             # JWT authenticate + role authorize
│   │   └── roleMiddleware.js   # Role-based middleware
│   ├── db.js                   # Mongoose schemas + full seed data
│   ├── drop_db.js              # Utility: drop all collections
│   └── server.js               # Express app entry point
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx           # Unified login (all roles)
        │   ├── Dashboard.jsx       # Role-aware hub (redirects by role)
        │   ├── SupremePanel.jsx    # Supreme: manage Super Admins
        │   ├── SuperAdminPanel.jsx # Super Admin: departments, HODs, coordinators, student lookup
        │   ├── IdentityReveal.jsx  # 🔍 Reveal student identity by ANO- ID (super+supreme)
        │   ├── CoordinatorPanel.jsx # 6-tab: sections, courses, faculty, students
        │   ├── HODPanel.jsx        # HOD: form creation & portal management
        │   ├── Analytics.jsx       # Dept-wise analytics with faculty/trainer filter
        │   ├── Leaderboard.jsx     # Anonymous leaderboard (ANO- IDs only)
        │   └── TLFQPage.jsx        # Student feedback evaluation form
        ├── components/
        │   ├── Navbar.jsx          # Glassmorphism topbar, role badge, theme toggle, password change
        │   ├── Sidebar.jsx         # Role-filtered navigation
        │   └── ProtectedRoute.jsx  # JWT + role guard
        ├── context/
        │   └── AuthContext.jsx     # Global auth + theme state
        └── services/
            └── api.js              # Axios instance with auto token injection
```

---

## 🛡️ Security Model

- **JWT Authentication** — all protected routes require a valid Bearer token
- **5-Tier RBAC** — Supreme → Super Admin → Coordinator → HOD → Student; each tier strictly scoped
- **Student Anonymity** — `unique_feedback_id` (`ANO-XXXXXX`) is the only public identifier; real identity (name, roll no., email) requires explicit admin reveal with confirmation
- **Section Isolation** — students only see TLFQs matching their exact `section_id` and `semester`
- **Portal Gate** — HOD can disable all feedback submission for their department instantly
- **Form Expiry** — TLFQs auto-expire past `closing_time` (no manual action needed)
- **One-time Submission** — duplicate `(student_id, tlfq_id)` submissions are rejected
- **Password Security** — bcryptjs hashing (cost factor 10) for all passwords

---

## 🧩 Data Model

```
Department ──► Sections (code, semester, label A/B/C)
                  │
                  ├──► SectionFaculty (Faculty × Course per Section)
                  │          │
                  │          └──► TLFQ (Form: section + course + faculty + deadline)
                  │                    │
                  │                    └──► Response (student_id + tlfq_id + comment)
                  │                              └──► Answers (question_id + rating 1–7)
                  │
                  └──► Enrollments (student_id × course_id)

User (roles: supreme | super_admin | coordinator | hod | student)
  ├── student_id         → official roll number (e.g. BCS2025_01) — confidential
  └── unique_feedback_id → anonymous public ID (e.g. ANO-A3F2B1) — shown on leaderboard
```

---

## 🔄 Database Management

```bash
# Reset and re-seed the database
cd server
node drop_db.js   # Drops all collections
npm start         # Auto-seeds on next startup
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS v3, Framer Motion, Recharts |
| **Backend** | Node.js 18+, Express.js |
| **Database** | MongoDB Atlas via Mongoose 8 |
| **Auth** | JSON Web Tokens (JWT), bcryptjs |
| **UI Icons** | Lucide React |
| **Design** | Glassmorphism dark theme + light mode toggle |

---

## 🧑‍💻 Development

```bash
# Run backend with auto-reload
cd server && npm run dev    # uses nodemon

# Run frontend dev server
cd frontend && npm run dev  # Vite HMR at http://localhost:5173

# Build frontend for production
cd frontend && npm run build
```

---

## 📝 License

MIT License — Developed for **Invertis University, Lucknow** by Team Saraswat.
