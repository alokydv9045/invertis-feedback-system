# Invertis Feedback System — Server

Node.js/Express backend powering the Invertis TLFQ Platform.

## Routes

| Prefix | Description |
|--------|-------------|
| `/api/auth` | 2-step student auth + staff login |
| `/api/coordinator` | Sections, courses, faculty, students (university-wide) |
| `/api/superadmin` | HOD & coordinator creation |
| `/api/hod` | Form creation, portal control (dept-scoped) |
| `/api/student` | Course listing, TLFQ fetch, submission |
| `/api/responses/analytics` | Analytics (super_admin + hod) |

## Quick Start

```bash
npm install
cp .env.example .env
# Add MONGO_URI and JWT_SECRET to .env
npm start
```

## Re-seed database

```bash
node drop_db.js   # drop everything
npm start         # auto-seeds on startup
```

> See [Root README](../README.md) for full documentation.
