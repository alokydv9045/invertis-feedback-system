# TLFQ Webapp Working Graph

Generated: 2026-05-11T15:00:22.837Z

## Corpus

- Frontend source: 36 files under `frontend/src`
- Backend source: 7 files under `backend/src`
- Architecture/schema docs sampled: 6 files under `invertis_feedback_redesign_docs`
- Sensitive/dependency folders skipped: `node_modules`, `dist`, `build`

Note: the packaged Python `graphify` runtime was not available on this machine, so this run used a Node-based graphify fallback extractor and preserved the same three-artifact output shape.

## Graph Summary

- Nodes: 120
- Edges: 424
- EXTRACTED edges: 388
- INFERRED edges: 36

## Communities

- Express API: 35 nodes
- Frontend Shell and Routing: 25 nodes
- Admin Operations: 12 nodes
- Supabase Data Model: 10 nodes
- Authentication and Authorization: 8 nodes
- Student Feedback Workflow: 8 nodes
- HOD Form and Analytics Workflow: 8 nodes
- Requirements and Architecture Docs: 6 nodes
- End-to-End Product Flows: 5 nodes
- Actors and Roles: 3 nodes

## How The Webapp Works

1. The React app starts at `frontend/src/App.jsx`, wraps routes in `AuthProvider`, and uses `AuthGuard` to protect student, HOD, and admin route groups.
2. `AuthProvider` talks to Supabase Auth, reads the current session, fetches the user's `profiles` row, and exposes `login`, `register`, `logout`, and dev `skipLogin` helpers.
3. Role routing is profile-driven: unauthenticated users go to `/login`; authenticated users land on `/<role>/dashboard`; users entering another role's route are redirected back to their own dashboard.
4. Most current frontend pages query Supabase directly through `frontend/src/lib/supabase.js`; `frontend/src/lib/api.js` is present for tokenized `/api` calls but the page layer relies heavily on direct Supabase table access.
5. The Express backend mounts `/api/auth`, `/api/forms`, `/api/reviews`, `/api/analytics`, and `/api/admin`, each using the service-role Supabase client from `backend/src/config/supabase.js`.
6. The core data model is `profiles -> feedback_forms -> reviews -> review_answers`, with `courses`, `trainers`, and `subjects` supplying academic context.

## Main Flows

- Authentication and role redirect: Login/Register pages -> AuthProvider -> Supabase Auth -> profiles -> React Router/AuthGuard.
- Student feedback: StudentDashboard lists active `feedback_forms`; FeedbackForm inserts `reviews` and `review_answers`; SubmissionHistory reads prior `reviews`.
- HOD work: FormManagement reads courses/trainers/forms and inserts or closes `feedback_forms`; HOD dashboards and analytics aggregate `reviews` and `review_answers`.
- Admin work: Admin pages manage `profiles`, `courses`, `trainers`, forms, leaderboard, and global counts.
- Backend API: Express exposes equivalent server-side operations over Supabase using the admin client, useful for centralized policy, service-role writes, and future page migration away from direct table access.

## Audit Notes

- EXTRACTED edges come from imports, route declarations, Express route mounts, `.from('table')` calls, and SQL `REFERENCES` declarations.
- INFERRED edges are only the five named product flows; they group extracted nodes into user-facing workflows.
- No image/screenshot semantic extraction was performed in this fallback run.

## Outputs

- `graphify-out/graph.html` - interactive graph
- `graphify-out/graph.json` - GraphRAG-ready node-link JSON
- `graphify-out/GRAPH_REPORT.md` - this report
- `graphify-out/audit.json` - edge evidence and confidence trail
