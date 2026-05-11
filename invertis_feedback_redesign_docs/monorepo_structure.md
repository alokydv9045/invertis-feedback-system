# Monorepo Structure

## Invertis Feedback System — v2.0 Redesign

---

## 1. Document Information

| Field            | Value                            |
| ---------------- | -------------------------------- |
| **Product**      | Invertis Feedback System (IFS)   |
| **Package Mgr**  | npm (workspaces)                 |
| **Last Updated** | 2026-05-10                        |

---

## 2. Repository Layout

```
invertis-feedback-system/
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint + test + build on PR
│       ├── deploy-frontend.yml       # Deploy frontend to Vercel
│       └── deploy-supabase.yml       # Apply migrations to Supabase
│
├── packages/
│   │
│   ├── frontend/                     # React SPA (Vite)
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   └── invertis-logo.svg
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── App.jsx           # Root component, router setup
│   │   │   │   ├── main.jsx          # Entry point
│   │   │   │   └── routes.jsx        # Route definitions
│   │   │   │
│   │   │   ├── core/
│   │   │   │   ├── supabase.js       # Supabase client init
│   │   │   │   ├── auth/
│   │   │   │   │   ├── AuthContext.jsx
│   │   │   │   │   ├── AuthGuard.jsx
│   │   │   │   │   └── useAuth.js
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useSupabaseQuery.js
│   │   │   │   │   ├── useFileUpload.js
│   │   │   │   │   └── usePagination.js
│   │   │   │   └── utils/
│   │   │   │       ├── constants.js
│   │   │   │       ├── formatters.js
│   │   │   │       └── validators.js
│   │   │   │
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginPage.jsx
│   │   │   │   │   ├── RegisterPage.jsx
│   │   │   │   │   └── ForgotPasswordPage.jsx
│   │   │   │   │
│   │   │   │   ├── student/
│   │   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   │   ├── FeedbackForm.jsx
│   │   │   │   │   ├── SubmissionHistory.jsx
│   │   │   │   │   ├── StudentProfile.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── FormCard.jsx
│   │   │   │   │       ├── ProgressWidget.jsx
│   │   │   │   │       └── LeaderboardWidget.jsx
│   │   │   │   │
│   │   │   │   ├── hod/
│   │   │   │   │   ├── HodDashboard.jsx
│   │   │   │   │   ├── FormManagement.jsx
│   │   │   │   │   ├── HodAnalytics.jsx
│   │   │   │   │   ├── StudentDirectory.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── TrainerPerformanceCard.jsx
│   │   │   │   │       ├── SubmissionRateChart.jsx
│   │   │   │   │       ├── FeedbackFeed.jsx
│   │   │   │   │       └── FormBuilder.jsx
│   │   │   │   │
│   │   │   │   └── admin/
│   │   │   │       ├── AdminDashboard.jsx
│   │   │   │       ├── UserManagement.jsx
│   │   │   │       ├── FormManagement.jsx
│   │   │   │       ├── CourseManagement.jsx
│   │   │   │       ├── TrainerManagement.jsx
│   │   │   │       ├── GlobalAnalytics.jsx
│   │   │   │       ├── FullLeaderboard.jsx
│   │   │   │       └── components/
│   │   │   │           ├── StatsCard.jsx
│   │   │   │           ├── UserTable.jsx
│   │   │   │           ├── DepartmentOverview.jsx
│   │   │   │           └── CreateUserModal.jsx
│   │   │   │
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   │   ├── Layout.jsx
│   │   │   │   │   ├── Sidebar.jsx
│   │   │   │   │   ├── Topbar.jsx
│   │   │   │   │   ├── Card.jsx
│   │   │   │   │   ├── Button.jsx
│   │   │   │   │   ├── Input.jsx
│   │   │   │   │   ├── Select.jsx
│   │   │   │   │   ├── FileUpload.jsx
│   │   │   │   │   ├── Modal.jsx
│   │   │   │   │   ├── Toast.jsx
│   │   │   │   │   ├── Table.jsx
│   │   │   │   │   ├── Pagination.jsx
│   │   │   │   │   ├── Badge.jsx
│   │   │   │   │   ├── EmptyState.jsx
│   │   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   │   └── ErrorBoundary.jsx
│   │   │   │   └── styles/
│   │   │   │       ├── index.css
│   │   │   │       └── theme.js
│   │   │   │
│   │   │   └── assets/
│   │   │       ├── invertis-logo.svg
│   │   │       └── illustrations/
│   │   │
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── eslint.config.js
│   │   └── package.json
│   │
│   ├── server/                       # Optional Node.js API
│   │   ├── src/
│   │   │   ├── index.js              # Express entry point
│   │   │   ├── config/
│   │   │   │   ├── supabase.js       # Supabase admin client (service role)
│   │   │   │   └── env.js            # Environment validation
│   │   │   ├── middleware/
│   │   │   │   ├── authMiddleware.js  # JWT validation
│   │   │   │   ├── roleMiddleware.js  # Role-based access control
│   │   │   │   ├── errorHandler.js   # Global error handler
│   │   │   │   └── rateLimiter.js    # Rate limiting
│   │   │   ├── routes/
│   │   │   │   ├── authRoutes.js
│   │   │   │   ├── formRoutes.js
│   │   │   │   ├── reviewRoutes.js
│   │   │   │   ├── analyticsRoutes.js
│   │   │   │   └── userRoutes.js
│   │   │   ├── controllers/
│   │   │   │   ├── authController.js
│   │   │   │   ├── formController.js
│   │   │   │   ├── reviewController.js
│   │   │   │   ├── analyticsController.js
│   │   │   │   └── userController.js
│   │   │   └── utils/
│   │   │       ├── responseHelper.js  # Standardized API responses
│   │   │       └── validators.js      # Input validation schemas
│   │   │
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── supabase/                     # Supabase project config
│       ├── config.toml               # Supabase CLI config
│       ├── migrations/
│       │   ├── 20260501000000_create_courses.sql
│       │   ├── 20260501000001_create_trainers.sql
│       │   ├── 20260501000002_create_student_accounts.sql
│       │   ├── 20260501000003_create_hod_accounts.sql
│       │   ├── 20260501000004_create_admin_accounts.sql
│       │   ├── 20260501000005_create_feedback_forms.sql
│       │   ├── 20260501000006_create_feedback_questions.sql
│       │   ├── 20260501000007_create_reviews.sql
│       │   ├── 20260501000008_create_review_answers.sql
│       │   ├── 20260501000009_create_views.sql
│       │   ├── 20260501000010_create_functions.sql
│       │   ├── 20260501000011_create_triggers.sql
│       │   ├── 20260501000012_create_rls_policies.sql
│       │   └── 20260501000013_seed_data.sql
│       ├── seed.sql                  # Development seed data
│       └── storage/
│           └── id_card_images.json   # Storage bucket config
│
├── docs/                             # Project documentation
│   ├── product_requirement.md
│   ├── user_stories_and_acceptance_criteria.md
│   ├── information_architecture.md
│   ├── system_architecture.md
│   ├── database_schema.md
│   ├── api_contract.md
│   ├── monorepo_structure.md
│   ├── scoring_engine_specs.md
│   ├── engineering_scope_definition.md
│   ├── development_phase.md
│   ├── environment_and_devops.md
│   └── testing_strategy.md
│
├── scripts/
│   ├── setup.sh                      # First-time project setup
│   ├── reset-db.sh                   # Reset and reseed database
│   └── migrate.sh                    # Run Supabase migrations
│
├── .gitignore
├── .env.example                      # Root-level env template
├── package.json                      # Root workspace config
├── README.md
└── LICENSE
```

---

## 3. Workspace Configuration

### 3.1 Root `package.json`

```json
{
    "name": "invertis-feedback-system",
    "version": "2.0.0",
    "private": true,
    "workspaces": [
        "packages/frontend",
        "packages/server",
        "packages/supabase"
    ],
    "scripts": {
        "dev": "npm run dev --workspace=packages/frontend",
        "dev:server": "npm run dev --workspace=packages/server",
        "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\"",
        "build": "npm run build --workspace=packages/frontend",
        "lint": "npm run lint --workspace=packages/frontend",
        "test": "npm run test --workspace=packages/frontend",
        "db:migrate": "cd packages/supabase && supabase db push",
        "db:reset": "cd packages/supabase && supabase db reset",
        "db:seed": "cd packages/supabase && supabase db seed",
        "setup": "npm install && npm run db:migrate"
    },
    "devDependencies": {
        "concurrently": "^9.0.0"
    },
    "engines": {
        "node": ">=20.0.0"
    }
}
```

### 3.2 Frontend `package.json`

```json
{
    "name": "@ifs/frontend",
    "version": "2.0.0",
    "private": true,
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview",
        "lint": "eslint src/"
    },
    "dependencies": {
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "react-router-dom": "^7.0.0",
        "@supabase/supabase-js": "^2.45.0",
        "framer-motion": "^11.0.0",
        "recharts": "^2.12.0",
        "lucide-react": "^0.450.0",
        "axios": "^1.7.0"
    },
    "devDependencies": {
        "@vitejs/plugin-react": "^4.3.0",
        "vite": "^6.0.0",
        "tailwindcss": "^4.0.0",
        "postcss": "^8.4.0",
        "eslint": "^9.0.0",
        "@eslint/js": "^9.0.0",
        "eslint-plugin-react-hooks": "^5.0.0"
    }
}
```

### 3.3 Server `package.json`

```json
{
    "name": "@ifs/server",
    "version": "2.0.0",
    "private": true,
    "type": "module",
    "scripts": {
        "dev": "nodemon src/index.js",
        "start": "node src/index.js",
        "lint": "eslint src/"
    },
    "dependencies": {
        "express": "^4.21.0",
        "cors": "^2.8.5",
        "@supabase/supabase-js": "^2.45.0",
        "dotenv": "^16.4.0",
        "express-rate-limit": "^7.4.0",
        "multer": "^1.4.5-lts.1"
    },
    "devDependencies": {
        "nodemon": "^3.1.0"
    }
}
```

---

## 4. Package Responsibilities

### 4.1 `packages/frontend`

| Responsibility          | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| UI rendering            | All React components and pages                              |
| Client-side routing     | React Router with role-based route guards                   |
| State management        | React Context for auth; local state for forms               |
| Supabase client calls   | Direct SDK calls for CRUD, auth, and file upload            |
| Styling                 | Tailwind CSS with Invertis University brand tokens           |
| Animations              | Framer Motion for transitions and micro-interactions         |
| Charts                  | Recharts for analytics visualizations                       |

### 4.2 `packages/server`

| Responsibility          | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| Admin operations        | User creation/deletion using service role key               |
| Upload orchestration    | Image validation, compression, Supabase Storage proxy       |
| Complex validation      | Business rules that can't be enforced in RLS                |
| Rate limiting           | Per-route rate limiting for abuse prevention                 |
| Aggregation             | Complex analytics queries if needed beyond SQL views         |

### 4.3 `packages/supabase`

| Responsibility          | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| Schema migrations       | Versioned SQL migration files                               |
| RLS policies            | Row-Level Security policy definitions                       |
| SQL views               | Leaderboard, trainer performance, submission rate views       |
| Database functions      | RPC functions (get_user_role, get_assigned_forms)            |
| Triggers                | Auto-update timestamps                                       |
| Seed data               | Development seed data for testing                            |
| Storage config          | Bucket definitions and access policies                       |

---

## 5. Dependency Graph

```
packages/frontend
    └── depends on → packages/supabase (schema types, client config)
    └── optional  → packages/server (for admin-only API calls)

packages/server
    └── depends on → packages/supabase (service-role access)

packages/supabase
    └── standalone (no internal dependencies)
```

---

## 6. Import Conventions

### 6.1 Frontend Import Order

```javascript
// 1. React and third-party libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// 2. Core modules (auth, hooks, utils)
import { useAuth } from '@/core/auth/useAuth';
import { useSupabaseQuery } from '@/core/hooks/useSupabaseQuery';

// 3. Shared components
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';

// 4. Feature-specific components
import { FormCard } from './components/FormCard';

// 5. Styles and assets
import '@/shared/styles/index.css';
```

### 6.2 Path Aliases

```javascript
// vite.config.js
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
});
```

---

## 7. Environment Files

### 7.1 Root `.env.example`

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional API Server
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 7.2 Server `.env.example`

```env
PORT=5000
NODE_ENV=development

# Supabase (service role — NEVER expose to frontend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 8. File Naming Conventions

| Category        | Convention                     | Example                       |
| --------------- | ------------------------------ | ----------------------------- |
| Pages           | PascalCase.jsx                  | `StudentDashboard.jsx`         |
| Components      | PascalCase.jsx                  | `FormCard.jsx`                 |
| Hooks           | camelCase.js (use prefix)       | `useAuth.js`                   |
| Utilities       | camelCase.js                    | `formatters.js`                |
| Styles          | camelCase.css                   | `index.css`                    |
| Config files    | camelCase.js                    | `vite.config.js`               |
| SQL migrations  | timestamp_description.sql       | `20260501000000_create_courses.sql` |
| Tests           | *.test.js or *.spec.js          | `LoginPage.test.jsx`           |
| Environment     | .env, .env.example              | `.env.example`                 |

---

## 9. Comparison with Old System Structure

| Aspect                 | Old System                           | New System                              |
| ---------------------- | ------------------------------------ | --------------------------------------- |
| Structure              | Two-folder (frontend + server)       | Monorepo with npm workspaces             |
| Database config        | `server/db.js` (Mongoose schemas)    | `packages/supabase/migrations/*.sql`     |
| API routes             | `server/routes/*.js`                  | `packages/server/src/routes/*.js`         |
| Frontend pages         | `frontend/src/pages/*.jsx`           | `packages/frontend/src/features/**/*.jsx` |
| Shared components      | `frontend/src/components/*.jsx`      | `packages/frontend/src/shared/components/*.jsx` |
| State management       | `frontend/src/context/`              | `packages/frontend/src/core/auth/`        |
| Build orchestration    | Root `package.json` scripts          | npm workspaces + concurrently             |
| Database seed          | Embedded in `db.js`                  | `packages/supabase/seed.sql`              |
| Feature organization   | Flat pages folder                    | Feature-based folder structure            |
