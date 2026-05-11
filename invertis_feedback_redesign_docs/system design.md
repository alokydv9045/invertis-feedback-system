# System Design

## 1. System summary

This is a role-based university feedback system built around Supabase. It combines:

- student registration
- HOD-led form publishing
- admin control
- feedback submission
- trainer performance analytics
- leaderboard ranking
- responsive university-branded UI

## 2. Proposed architecture

```text
Client (React web app)
    ↓
Supabase Auth
    ↓
Supabase Postgres
    ↓
Supabase Storage
    ↓
Analytics queries / SQL views
```

A small Node.js backend may still be used if extra server-side logic is needed, but the core system can operate primarily through Supabase.

## 3. Logical modules

### 3.1 Auth and session module
Responsibilities:
- sign up and sign in
- role detection
- session persistence
- logout
- route protection

### 3.2 Student profile module
Responsibilities:
- capture student name
- course selection
- start year and end year
- ID card photo upload
- link profile to auth user

### 3.3 Feedback form module
Responsibilities:
- create forms
- assign course/trainer/subject
- define questions
- activate/deactivate forms

### 3.4 Review module
Responsibilities:
- accept written reviews
- save date and time
- save subject and form references
- store reviewer identity securely

### 3.5 Analytics module
Responsibilities:
- trainer performance summary
- course submission stats
- recent feedback feed
- leaderboard computation

### 3.6 Admin module
Responsibilities:
- account deletion
- HOD account control
- student account control
- form moderation
- global data visibility

## 4. Database design

## 4.1 Suggested tables

### `student_accounts`
Stores student profile data.

Columns:
- id
- auth_user_id
- full_name
- course_id
- start_year
- end_year
- id_card_image_url
- created_at
- updated_at
- status

### `hod_accounts`
Stores HOD profiles.

Columns:
- id
- auth_user_id
- full_name
- department_id
- email
- status
- created_at

### `admin_accounts`
Stores admin profiles.

Columns:
- id
- auth_user_id
- full_name
- email
- status
- created_at

### `courses`
Stores course masters.

Columns:
- id
- course_name
- course_code
- department_id
- active

### `trainers`
Stores trainer/faculty master data.

Columns:
- id
- trainer_name
- department_id
- active

### `feedback_forms`
Stores each published form.

Columns:
- id
- published_by_user_id
- course_id
- trainer_id
- subject_name
- title
- status
- published_at
- closed_at

### `feedback_questions`
Stores form questions.

Columns:
- id
- form_id
- question_text
- question_type
- sort_order
- active

### `reviews`
Stores the submitted written review.

Columns:
- id
- student_id
- form_id
- course_id
- trainer_id
- subject_name
- review_text
- submitted_date
- submitted_time
- created_at

### `review_answers`
Optional if structured questions exist.

Columns:
- id
- review_id
- question_id
- answer_text / rating_value

### `leaderboard_view`
A SQL view, not a stored table, recommended for ranking.

Fields:
- student_id
- full_name
- submission_count
- rank

## 5. Relational rules

- One student can have one profile row.
- One HOD can manage many feedback forms.
- One form can contain many questions.
- One form can receive many reviews.
- One review belongs to one student and one form.
- Leaderboard is derived from review submission count.

## 6. Workflow design

### 6.1 Student registration flow
1. Student opens registration page.
2. Enter name, course, year start/end.
3. Upload ID card photo.
4. System creates auth record.
5. System inserts a row into `student_accounts`.
6. User is redirected to dashboard.

### 6.2 HOD publishing flow
1. HOD logs in.
2. HOD selects course, trainer, and subject.
3. HOD defines questions.
4. System saves a row in `feedback_forms`.
5. Questions are saved in `feedback_questions`.
6. Form becomes visible to eligible students.

### 6.3 Review submission flow
1. Student opens assigned form.
2. Student writes review.
3. System records date/time automatically.
4. System saves row in `reviews`.
5. Optional structured answers are saved in `review_answers`.
6. Leaderboard and analytics views update.

### 6.4 Admin control flow
1. Admin opens admin panel.
2. Admin lists users and forms.
3. Admin deletes or disables accounts.
4. Admin publishes or unpublishes forms.
5. Admin accesses global metrics.

## 7. API and service design

If using a custom backend, keep it thin and focused.

### Suggested endpoints
- `POST /auth/register-student`
- `POST /auth/login`
- `GET /me`
- `GET /courses`
- `GET /trainers`
- `POST /forms`
- `GET /forms/assigned`
- `POST /reviews`
- `GET /analytics/trainer-performance`
- `GET /analytics/leaderboard`
- `DELETE /admin/users/:id`

If using Supabase directly from the frontend, these may become server actions or RPC functions instead.

## 8. Security design

### Access control
- Students can only see their own profile and assigned forms.
- HODs can only publish and view data for their assigned department or permissions.
- Admins can see everything.

### Row-level security
Enable Supabase RLS on all private tables.

### Storage security
- ID card images should be in a protected bucket.
- Only authenticated users or admins should access them.

### Data privacy
- Reviews should not expose unnecessary personal data.
- Leaderboard should show count and name only, not review content.

## 9. Responsive UI design

### Desktop
- left sidebar
- large dashboard cards
- analytics charts
- table-based administration

### Mobile
- collapsed sidebar
- stacked cards
- full-width forms
- compact leaderboard cards
- sticky bottom primary actions if needed

## 10. Brand integration

The UI should align with the Invertis University brand direction:

- blue/orange logo colors
- formal university styling
- white or very light background
- strong typography hierarchy
- official-feeling header and navigation
- logo placement in top bar and login screen

## 11. Performance design

### Optimization ideas
- use SQL aggregates for leaderboard
- use indexed foreign keys
- paginate user and review lists
- lazy-load charts
- compress ID card images before upload if possible

## 12. Deployment design

### Frontend
Host on Vercel, Netlify, or another static host.

### Database
Use Supabase hosted Postgres and storage.

### Environment variables
- Supabase URL
- Supabase anon key
- service role key for server-side operations
- optional backend base URL

## 13. Risks

- inconsistent role assignment
- incorrect leaderboard ranking logic
- heavy image uploads
- data duplication if registration is not validated
- accidental exposure of review text

## 14. Recommended implementation sequence

1. Supabase schema
2. Supabase Auth integration
3. student registration
4. HOD login and form publishing
5. review submission
6. analytics and leaderboard
7. admin controls
8. responsive branding polish
