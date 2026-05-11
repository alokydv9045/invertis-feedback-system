# Environment & DevOps

## Invertis Feedback System — v2.0 Redesign

---

## 1. Document Information

| Field            | Value                            |
| ---------------- | -------------------------------- |
| **Product**      | Invertis Feedback System (IFS)   |
| **Version**      | 2.0                              |
| **Last Updated** | 2026-05-10                        |

---

## 2. Environment Strategy

### 2.1 Environment Matrix

| Environment   | Purpose                      | Frontend Host | Database            | Branch     |
| ------------- | ---------------------------- | ------------- | ------------------- | ---------- |
| Local Dev     | Individual development       | localhost:5173| Supabase local (CLI)| feature/*  |
| Staging       | Integration testing / review | Vercel Preview| Supabase staging    | develop    |
| Production    | Live university access       | Vercel Prod   | Supabase production | main       |

### 2.2 Environment Flow

```
Developer Workstation          Staging                 Production
        │                         │                        │
   feature/* branch          develop branch           main branch
        │                         │                        │
   Local Supabase            Staging Supabase         Prod Supabase
   (supabase start)          project                  project
        │                         │                        │
   localhost:5173            preview.vercel.app        ifs.invertis.edu.in
        │                         │                        │
        └── PR ──▶ CI ──▶ merge ──┘── PR ──▶ CI ──▶ merge ─┘
```

---

## 3. Local Development Setup

### 3.1 Prerequisites

| Tool            | Version   | Purpose                      |
| --------------- | --------- | ---------------------------- |
| Node.js         | ≥ 20.0.0  | JavaScript runtime            |
| npm             | ≥ 10.0.0  | Package manager               |
| Git             | ≥ 2.40    | Version control               |
| Supabase CLI    | ≥ 1.150   | Local Supabase environment    |
| Docker Desktop  | Latest    | Required by Supabase CLI      |

### 3.2 First-Time Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd invertis-feedback-system

# 2. Install all dependencies (workspace)
npm install

# 3. Start local Supabase
cd packages/supabase
supabase start

# 4. Apply migrations
supabase db reset    # Creates tables + seeds data

# 5. Copy environment variables
cp .env.example .env
# Edit .env with local Supabase URL and anon key from supabase start output

# 6. Start frontend
cd packages/frontend
npm run dev

# 7. (Optional) Start API server
cd packages/server
cp .env.example .env
npm run dev
```

### 3.3 Local Supabase Output

After `supabase start`, note these values for `.env`:

```
API URL:    http://localhost:54321
Anon Key:   eyJ...   → VITE_SUPABASE_ANON_KEY
Service Key: eyJ...  → SUPABASE_SERVICE_ROLE_KEY (server only)
Studio URL: http://localhost:54323  (database GUI)
```

### 3.4 Environment Variables

#### Frontend `.env`

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon-key-from-supabase-start>
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

#### Server `.env`

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=<service-key-from-supabase-start>
```

---

## 4. Git Workflow

### 4.1 Branch Strategy

```
main ──────────────────────────────────────────── Production
  │
  └── develop ─────────────────────────────────── Staging
        │
        ├── feature/ws1-create-schema ──────────── Feature branch
        ├── feature/ws2-auth-flow ──────────────── Feature branch
        ├── feature/ws3-student-dashboard ──────── Feature branch
        ├── fix/login-redirect-bug ─────────────── Bug fix branch
        └── hotfix/rls-policy-fix ──────────────── Hotfix branch
```

### 4.2 Branch Naming Convention

| Type    | Pattern                            | Example                          |
| ------- | ---------------------------------- | -------------------------------- |
| Feature | `feature/<workstream>-<short-desc>` | `feature/ws2-auth-flow`          |
| Bug fix | `fix/<short-desc>`                  | `fix/login-redirect-bug`         |
| Hotfix  | `hotfix/<short-desc>`               | `hotfix/rls-policy-fix`          |

### 4.3 Merge Rules

| Rule                                               | Enforced By       |
| -------------------------------------------------- | ----------------- |
| All PRs require at least 1 approval                | GitHub Branch Rule |
| CI must pass before merge                           | GitHub Status Check|
| Squash merge to `develop`                           | GitHub Merge Rule  |
| Merge commit to `main` (preserves history)          | GitHub Merge Rule  |
| No direct pushes to `main` or `develop`             | GitHub Branch Rule |

### 4.4 Commit Message Format

```
<type>(<scope>): <short description>

Types: feat, fix, refactor, style, test, docs, chore, ci
Scope: frontend, server, supabase, shared, docs

Examples:
feat(frontend): add student registration page
fix(supabase): correct RLS policy for reviews table
docs(docs): update API contract with leaderboard endpoint
ci(github): add Supabase migration check to CI
```

---

## 5. CI/CD Pipeline

### 5.1 Pipeline Overview

```
Push to feature/*        Push to develop          Push to main
       │                       │                       │
       ▼                       ▼                       ▼
  ┌─────────┐           ┌─────────┐            ┌─────────┐
  │  Lint   │           │  Lint   │            │  Lint   │
  │  Test   │           │  Test   │            │  Test   │
  │  Build  │           │  Build  │            │  Build  │
  └────┬────┘           └────┬────┘            └────┬────┘
       │                     │                      │
       ▼                     ▼                      ▼
  (PR Check only)     ┌────────────┐         ┌────────────┐
                      │  Deploy    │         │  Deploy    │
                      │  Staging   │         │  Production│
                      │  (Vercel   │         │  (Vercel   │
                      │   Preview) │         │   Prod)    │
                      └────────────┘         └────────────┘
                            │                      │
                            ▼                      ▼
                      ┌────────────┐         ┌────────────┐
                      │  Supabase  │         │  Supabase  │
                      │  Staging   │         │  Production│
                      │  Migrate   │         │  Migrate   │
                      └────────────┘         └────────────┘
```

### 5.2 CI Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI
on:
  pull_request:
    branches: [develop, main]

jobs:
  lint-test-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint --workspace=packages/frontend
      - run: npm run build --workspace=packages/frontend
```

### 5.3 Deploy Frontend (`.github/workflows/deploy-frontend.yml`)

```yaml
name: Deploy Frontend
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build --workspace=packages/frontend
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: packages/frontend
```

### 5.4 Deploy Supabase Migrations (`.github/workflows/deploy-supabase.yml`)

```yaml
name: Deploy Supabase
on:
  push:
    branches: [main]
    paths:
      - 'packages/supabase/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: |
          cd packages/supabase
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## 6. Hosting Configuration

### 6.1 Vercel (Frontend)

| Setting                | Value                                     |
| ---------------------- | ----------------------------------------- |
| Framework Preset       | Vite                                       |
| Root Directory         | `packages/frontend`                        |
| Build Command          | `npm run build`                            |
| Output Directory       | `dist`                                     |
| Node.js Version        | 20.x                                       |
| Environment Variables  | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

### 6.2 Supabase Cloud

| Setting                | Value                                     |
| ---------------------- | ----------------------------------------- |
| Region                 | Mumbai (ap-south-1) or closest             |
| Plan                   | Free tier (MVP) → Pro (production)         |
| Auth Providers          | Email/Password                             |
| Storage Buckets         | `id_card_images` (private)                 |
| RLS                    | Enabled on all tables                      |

---

## 7. Secrets Management

### 7.1 GitHub Secrets

| Secret Name                | Used In               | Value Source              |
| -------------------------- | --------------------- | ------------------------- |
| `VERCEL_TOKEN`             | Frontend deploy        | Vercel dashboard           |
| `VERCEL_ORG_ID`            | Frontend deploy        | Vercel dashboard           |
| `VERCEL_PROJECT_ID`        | Frontend deploy        | Vercel dashboard           |
| `SUPABASE_ACCESS_TOKEN`    | Migration deploy       | Supabase dashboard         |
| `SUPABASE_PROJECT_REF`     | Migration deploy       | Supabase dashboard         |

### 7.2 Security Rules

- **NEVER** commit `.env` files to Git.
- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Use `VITE_` prefix only for values safe to expose in the browser.
- Rotate secrets immediately if accidentally committed.

---

## 8. Monitoring & Observability

### 8.1 Monitoring Stack

| Concern            | Tool                    | Cost    |
| ------------------ | ----------------------- | ------- |
| Frontend errors    | Vercel Analytics (free) | Free    |
| API errors         | Console logs + Vercel   | Free    |
| Database monitoring| Supabase Dashboard      | Free    |
| Uptime monitoring  | Vercel (built-in)       | Free    |
| Performance        | Lighthouse CI           | Free    |

### 8.2 Key Metrics to Monitor

| Metric                          | Target            | Alert Threshold  |
| ------------------------------- | ------------------ | ---------------- |
| Frontend error rate             | < 1%               | > 5%             |
| API response time (p95)         | ≤ 500ms            | > 2000ms         |
| Database connection pool usage  | < 50%              | > 80%            |
| Storage usage                   | < 80% of quota     | > 90%            |
| Auth failure rate               | < 2%               | > 10%            |

---

## 9. Backup & Recovery

| Concern              | Strategy                                              |
| -------------------- | ----------------------------------------------------- |
| Database backup      | Supabase daily automatic backups (Pro plan)            |
| Code backup          | Git (GitHub) — full history                            |
| Migration rollback   | Reverse migration scripts                              |
| Storage backup       | Supabase Storage replication (managed)                  |
| Disaster recovery    | Re-deploy from Git + restore Supabase backup            |

---

## 10. Performance Optimization Checklist

- [ ] Enable Vercel CDN caching for static assets
- [ ] Set correct `Cache-Control` headers for API responses
- [ ] Enable Gzip/Brotli compression on Vercel
- [ ] Use Supabase connection pooling (PgBouncer)
- [ ] Implement client-side image compression before upload
- [ ] Lazy-load Recharts components
- [ ] Code-split routes with React.lazy()
- [ ] Use indexed columns for all WHERE/JOIN clauses
- [ ] Paginate all list endpoints (default limit: 20)
