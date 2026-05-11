# MVP Tech Doc

## 1. MVP objective

Build the smallest complete version of the redesigned feedback platform that works for Invertis University, matches the college brand, and supports the new Supabase data model.

## 2. MVP scope

### Included in MVP
- student registration
- student login
- HOD login with pre-defined accounts
- admin login with full control
- course dropdown during registration
- start year and end year selection
- ID card photo upload to Supabase Storage
- HOD feedback form publishing
- trainer/course-specific feedback forms
- written review submission
- date and time capture for each review
- leaderboard for top student submitters
- trainer performance dashboard
- admin account management
- responsive mobile and desktop UI
- university-branded theme using Invertis colors and logo

### Not required in MVP
- advanced moderation workflows
- AI sentiment analysis
- multi-language support
- complex approval chains
- offline sync engine
- custom email campaigns
- deep reporting exports unless basic CSV is easy to add

## 3. Recommended technology stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Recharts
- Axios or Supabase client

### Backend / data
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Row Level Security policies
- SQL views for analytics and leaderboard

### Optional server layer
Use a small Node/Express API only if needed for:
- custom validation
- admin-only operations
- upload orchestration
- secure aggregation endpoints

## 4. MVP database approach

Use Supabase as the main system of record.

### Core tables
- `student_accounts`
- `hod_accounts`
- `admin_accounts`
- `courses`
- `trainers`
- `feedback_forms`
- `feedback_questions`
- `reviews`
- `review_answers`

### Suggested storage
- `id_card_images` bucket for student identity documents

### Suggested computed data
- leaderboard view
- trainer performance view
- department/course summary view

## 5. MVP user journeys

### 5.1 Student journey
1. Open registration.
2. Enter name, course, start year, end year.
3. Upload ID card photo.
4. Create login or complete auth-linked registration.
5. Login and view assigned feedback forms.
6. Submit written review for subject/trainer.
7. See submission confirmation.
8. View personal submission history.
9. See leaderboard placement if relevant.

### 5.2 HOD journey
1. Login with pre-defined account.
2. Open dashboard.
3. View trainer performance analytics.
4. Publish a feedback form for a course/trainer.
5. Add questions and subject mapping.
6. Monitor received reviews.

### 5.3 Admin journey
1. Login.
2. View global dashboard.
3. Create or remove HOD accounts.
4. Remove or suspend student accounts.
5. Publish or deactivate forms.
6. View leaderboards and all feedback summaries.
7. Manage course and trainer records.

## 6. UI requirements

### Theme
The interface should reflect the official Invertis University identity:

- blue and orange accents
- white/light background
- official logo on header and login page
- formal academic layout
- strong spacing and readable hierarchy

### Layout
- desktop sidebar
- mobile collapsible drawer
- card-based dashboard
- simple form screens
- compact analytics widgets
- leaderboard section in sidebar or dashboard

## 7. MVP feature list by role

### Student
- registration form
- login
- assigned feedback list
- review form
- submission history
- leaderboard view

### HOD
- login
- create/publish feedback form
- view trainer performance
- review submissions by course/subject

### Admin
- login
- user management
- HOD management
- form publishing
- global analytics
- leaderboard oversight

## 8. Implementation priorities

### Phase 1
- Supabase project setup
- auth and role tables
- registration flow
- login flow
- ID card storage

### Phase 2
- feedback form builder
- review submission
- review persistence
- analytics basics

### Phase 3
- leaderboard
- admin controls
- responsive polish
- brand styling and logo integration

## 9. Success criteria

The MVP is successful if:

- users can register and log in correctly
- student profile data is stored in Supabase
- HODs can publish forms
- students can submit reviews with subject and timestamp
- leaderboard shows top submitters
- admin can manage users and content
- the site looks and feels like an Invertis University product on both phone and desktop

## 10. Key trade-offs

To keep the MVP small:

- keep the review schema simple
- use computed leaderboard queries instead of a heavy ranking engine
- avoid overbuilding permissions
- keep analytics focused on the most valuable metrics
- prioritize stability over feature breadth

## 11. Deliverable definition

MVP deliverable should include:

- working frontend
- working Supabase schema
- role-based navigation
- branded UI
- deployed environment on a stable hosting platform
