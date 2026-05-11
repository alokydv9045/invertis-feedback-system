# Architecture Document

## 1. Product context

This system is a college feedback and academic review platform for Invertis University. The redesign keeps the strongest parts of the current TLFQ platform and upgrades the data layer to Supabase/Postgres.

The system supports three primary roles:

- **Student**: registers, logs in, selects course/year, uploads ID card photo, and submits written feedback for a subject/trainer.
- **HOD**: pre-defined account, logs in, creates/publishes feedback forms for a specific course and trainer, and views trainer performance analytics.
- **Admin**: full control over users, HOD accounts, feedback forms, reports, and platform settings.

## 2. Design principles

- Keep the current useful features: role-based access, analytics, feedback submission flow, responsive UI, and management panels.
- Change the database architecture to **Supabase** for identity, profile storage, and review storage.
- Keep the UI visually aligned with the official Invertis University brand.
- Make the product fully responsive for mobile and desktop.
- Keep the feedback flow simple enough for students and strong enough for institutional reporting.

## 3. Visual and brand direction

The public Invertis University website has a premium academic look with a strong institutional identity, a blue/red logo, large imagery, and a formal university tone. The redesigned system should follow that same direction:

- **Primary colors**: Invertis blue and red from the logo
- **Base surfaces**: white and very light gray
- **Typography**: clean, formal, modern sans-serif
- **UI tone**: trustworthy, official, premium, academic
- **Logo usage**: university logo in the top bar and login screen
- **Layout style**: spacious cards, structured sections, strong call-to-action blocks

This means the product should feel like an extension of the college website, not a generic SaaS dashboard.

## 4. Target system architecture

```text
Student / HOD / Admin
        ↓
React frontend
        ↓
API layer / server actions
        ↓
Supabase Auth + Supabase Postgres
        ↓
Storage bucket for ID card photos
        ↓
Analytics queries / leaderboard queries
```

## 5. Major modules

### 5.1 Authentication module
Handles login, session management, password handling, role checking, and protected routes.

- Students authenticate after registration.
- HOD and Admin accounts are pre-created by admin or seeded.
- Session is managed through Supabase Auth or secure tokens stored in the app.

### 5.2 Student registration module
Students submit:

- name
- course from dropdown
- start year
- end year
- ID card photo
- login credentials or authentication-linked account

The registration data is stored in Supabase and linked to the auth user id.

### 5.3 Feedback form module
HOD and Admin can publish a feedback form for:

- specific course
- specific trainer/faculty
- selected subject
- defined question set

### 5.4 Feedback submission module
Students submit a form with:

- written review
- rating fields if required
- date
- time
- subject
- trainer/course reference

The review is stored in the reviews table and can also store structured answers if the questionnaire is multi-question.

### 5.5 Analytics module
Provides:

- trainer performance averages
- course-level feedback summary
- submitted vs pending counts
- recent reviews
- leaderboard of top submitters

### 5.6 Management module
Admin can:

- remove student accounts
- remove HOD accounts
- publish forms
- deactivate forms
- manage courses, subjects, and trainers
- inspect feedback trends

## 6. Proposed data architecture

Use separate tables in Supabase to keep role ownership clear:

- `student_accounts`
- `hod_accounts`
- `admin_accounts`
- `courses`
- `trainers`
- `subjects`
- `feedback_forms`
- `feedback_questions`
- `reviews`
- `review_answers` or `review_ratings`
- `leaderboard_view` or computed query

Recommended storage split:

- **Auth credentials** → Supabase Auth
- **Role/profile data** → role-specific tables
- **ID card image** → Supabase Storage bucket
- **Reviews and timestamps** → `reviews`
- **Question definitions** → `feedback_questions`

## 7. Data flow summary

### Student registration
1. Student opens registration page.
2. Enters name, course, year range, and uploads ID card photo.
3. System creates auth record and profile row in Supabase.
4. Student can log in and see feedback forms assigned to the enrolled course.

### HOD workflow
1. HOD logs in using pre-defined account.
2. HOD opens dashboard.
3. HOD publishes a feedback form for a course/trainer.
4. HOD monitors trainer performance and response trends.

### Admin workflow
1. Admin logs in.
2. Admin manages all accounts and forms.
3. Admin can delete users or HODs.
4. Admin can review all analytics and leaderboard data.

### Feedback submission
1. Student opens assigned form.
2. Student writes review and submits.
3. System saves date, time, course, subject, trainer, and review content.
4. Analytics and leaderboard counters update.

## 8. Responsive behavior

### Desktop
- Left sidebar navigation
- Fixed top bar
- Multi-column dashboard cards
- Table-based admin views

### Mobile
- Collapsible sidebar or bottom navigation
- Stacked cards
- Full-width forms
- Compact leaderboard and analytics blocks

## 9. Current features to retain

From the existing TLFQ platform, keep:

- role-based routing
- student dashboard
- HOD analytics
- admin control panels
- feedback form builder
- anonymous or privacy-safe review handling
- performance analytics
- responsive layout

## 10. Main architectural changes from the current system

### Current
- MongoDB + fallback in-memory storage
- feedback centered on questionnaires
- generic user model with role field

### New
- Supabase-backed storage
- role-specific tables
- student registration with profile and ID card upload
- written review table with timestamp and subject
- leaderboard for top contributors
- closer visual match to the official university website

## 11. Risks and constraints

- ID card upload requires secure storage and size limits.
- Leaderboard logic must not expose private review content.
- HOD-created forms must not overwrite each other accidentally.
- Role tables must remain consistent with Supabase Auth ids.
- The UI must stay fast on mobile networks.

## 12. Architecture outcome

The redesigned platform becomes a branded university feedback system with clearer account separation, better review tracking, and a stronger institutional identity. It stays familiar to current users, but the database model and UI become much more aligned with the official Invertis University presence.
