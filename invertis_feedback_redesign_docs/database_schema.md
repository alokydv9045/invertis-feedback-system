# Database Schema

## Invertis Feedback System — v2.0 Redesign

---

## 1. Document Information

| Field            | Value                            |
| ---------------- | -------------------------------- |
| **Product**      | Invertis Feedback System (IFS)   |
| **Database**     | Supabase Postgres (PostgreSQL 15+) |
| **Last Updated** | 2026-05-10                        |

---

## 2. Schema Overview

The database consists of **9 core tables**, **3 SQL views**, and multiple **RLS policies**. All tables live in the `public` schema. Authentication data is managed by Supabase in the `auth` schema.

### Entity Relationship Diagram

```
auth.users (managed by Supabase)
    │
    ├── 1:1 ── student_accounts
    ├── 1:1 ── hod_accounts
    └── 1:1 ── admin_accounts

courses ──────────┐
                   │
trainers ─────────┤
                   │
                   ├── feedback_forms (course + trainer + subject)
                   │        │
                   │        ├── feedback_questions (1:N)
                   │        │
                   │        └── reviews (1:N)
                   │              │
                   │              └── review_answers (1:N)
                   │
student_accounts ──┘ (reviews.student_id → student_accounts.id)
```

---

## 3. Table Definitions

### 3.1 `student_accounts`

Stores student profile data linked to Supabase Auth.

```sql
CREATE TABLE student_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    course_id       UUID NOT NULL REFERENCES courses(id),
    start_year      INTEGER NOT NULL CHECK (start_year >= 2000 AND start_year <= 2100),
    end_year        INTEGER NOT NULL CHECK (end_year >= 2000 AND end_year <= 2100),
    id_card_image_url TEXT,
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT valid_year_range CHECK (end_year > start_year)
);

-- Indexes
CREATE INDEX idx_student_accounts_auth_user_id ON student_accounts(auth_user_id);
CREATE INDEX idx_student_accounts_course_id ON student_accounts(course_id);
CREATE INDEX idx_student_accounts_status ON student_accounts(status);
```

| Column            | Type         | Nullable | Default            | Description                          |
| ----------------- | ------------ | -------- | ------------------ | ------------------------------------ |
| id                | UUID         | NO       | gen_random_uuid()  | Primary key                          |
| auth_user_id      | UUID         | NO       | —                  | FK → auth.users(id), unique          |
| full_name         | TEXT         | NO       | —                  | Student's full name                  |
| course_id         | UUID         | NO       | —                  | FK → courses(id)                     |
| start_year        | INTEGER      | NO       | —                  | Academic start year                  |
| end_year          | INTEGER      | NO       | —                  | Academic end year                    |
| id_card_image_url | TEXT         | YES      | NULL               | URL to ID card in Supabase Storage   |
| status            | TEXT         | NO       | 'active'           | Account status                       |
| created_at        | TIMESTAMPTZ  | NO       | now()              | Record creation timestamp            |
| updated_at        | TIMESTAMPTZ  | NO       | now()              | Last update timestamp                |

---

### 3.2 `hod_accounts`

Stores Head of Department profiles. Pre-created by admin.

```sql
CREATE TABLE hod_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    department      TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_hod_accounts_auth_user_id ON hod_accounts(auth_user_id);
CREATE INDEX idx_hod_accounts_department ON hod_accounts(department);
```

| Column        | Type         | Nullable | Default            | Description                      |
| ------------- | ------------ | -------- | ------------------ | -------------------------------- |
| id            | UUID         | NO       | gen_random_uuid()  | Primary key                      |
| auth_user_id  | UUID         | NO       | —                  | FK → auth.users(id), unique      |
| full_name     | TEXT         | NO       | —                  | HOD's full name                  |
| department    | TEXT         | NO       | —                  | Department name or code          |
| email         | TEXT         | NO       | —                  | Email address (unique)           |
| status        | TEXT         | NO       | 'active'           | Account status                   |
| created_at    | TIMESTAMPTZ  | NO       | now()              | Record creation timestamp        |

---

### 3.3 `admin_accounts`

Stores system administrator profiles.

```sql
CREATE TABLE admin_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_admin_accounts_auth_user_id ON admin_accounts(auth_user_id);
```

| Column        | Type         | Nullable | Default            | Description                      |
| ------------- | ------------ | -------- | ------------------ | -------------------------------- |
| id            | UUID         | NO       | gen_random_uuid()  | Primary key                      |
| auth_user_id  | UUID         | NO       | —                  | FK → auth.users(id), unique      |
| full_name     | TEXT         | NO       | —                  | Admin's full name                |
| email         | TEXT         | NO       | —                  | Email address (unique)           |
| status        | TEXT         | NO       | 'active'           | Account status                   |
| created_at    | TIMESTAMPTZ  | NO       | now()              | Record creation timestamp        |

---

### 3.4 `courses`

Master data for academic courses.

```sql
CREATE TABLE courses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_name     TEXT NOT NULL,
    course_code     TEXT NOT NULL UNIQUE,
    department      TEXT NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_courses_active ON courses(active);
```

| Column       | Type         | Nullable | Default            | Description                      |
| ------------ | ------------ | -------- | ------------------ | -------------------------------- |
| id           | UUID         | NO       | gen_random_uuid()  | Primary key                      |
| course_name  | TEXT         | NO       | —                  | Course display name              |
| course_code  | TEXT         | NO       | —                  | Unique course code (e.g. CS101)  |
| department   | TEXT         | NO       | —                  | Department name or code          |
| active       | BOOLEAN      | NO       | true               | Whether course is active         |
| created_at   | TIMESTAMPTZ  | NO       | now()              | Record creation timestamp        |

---

### 3.5 `trainers`

Master data for faculty / trainers.

```sql
CREATE TABLE trainers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_name    TEXT NOT NULL,
    department      TEXT NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_trainers_department ON trainers(department);
CREATE INDEX idx_trainers_active ON trainers(active);
```

| Column       | Type         | Nullable | Default            | Description                      |
| ------------ | ------------ | -------- | ------------------ | -------------------------------- |
| id           | UUID         | NO       | gen_random_uuid()  | Primary key                      |
| trainer_name | TEXT         | NO       | —                  | Trainer's full name              |
| department   | TEXT         | NO       | —                  | Department name or code          |
| active       | BOOLEAN      | NO       | true               | Whether trainer is active        |
| created_at   | TIMESTAMPTZ  | NO       | now()              | Record creation timestamp        |

---

### 3.6 `feedback_forms`

Each published feedback form targeting a specific course + trainer + subject.

```sql
CREATE TABLE feedback_forms (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    published_by_user_id UUID NOT NULL REFERENCES auth.users(id),
    course_id           UUID NOT NULL REFERENCES courses(id),
    trainer_id          UUID NOT NULL REFERENCES trainers(id),
    subject_name        TEXT NOT NULL,
    title               TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    published_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_feedback_forms_course_id ON feedback_forms(course_id);
CREATE INDEX idx_feedback_forms_trainer_id ON feedback_forms(trainer_id);
CREATE INDEX idx_feedback_forms_status ON feedback_forms(status);
CREATE INDEX idx_feedback_forms_published_by ON feedback_forms(published_by_user_id);
```

| Column               | Type         | Nullable | Default            | Description                          |
| -------------------- | ------------ | -------- | ------------------ | ------------------------------------ |
| id                   | UUID         | NO       | gen_random_uuid()  | Primary key                          |
| published_by_user_id | UUID         | NO       | —                  | FK → auth.users(id) (HOD/Admin)      |
| course_id            | UUID         | NO       | —                  | FK → courses(id)                     |
| trainer_id           | UUID         | NO       | —                  | FK → trainers(id)                    |
| subject_name         | TEXT         | NO       | —                  | Subject being evaluated              |
| title                | TEXT         | NO       | —                  | Form display title                   |
| status               | TEXT         | NO       | 'active'           | Form lifecycle status                |
| published_at         | TIMESTAMPTZ  | NO       | now()              | When the form was published          |
| closed_at            | TIMESTAMPTZ  | YES      | NULL               | When the form was closed             |
| created_at           | TIMESTAMPTZ  | NO       | now()              | Record creation timestamp            |

---

### 3.7 `feedback_questions`

Questions belonging to a feedback form.

```sql
CREATE TABLE feedback_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id         UUID NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    question_type   TEXT NOT NULL DEFAULT 'text' CHECK (question_type IN ('text', 'rating')),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    active          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_feedback_questions_form_id ON feedback_questions(form_id);
```

| Column        | Type         | Nullable | Default            | Description                          |
| ------------- | ------------ | -------- | ------------------ | ------------------------------------ |
| id            | UUID         | NO       | gen_random_uuid()  | Primary key                          |
| form_id       | UUID         | NO       | —                  | FK → feedback_forms(id)              |
| question_text | TEXT         | NO       | —                  | The question content                 |
| question_type | TEXT         | NO       | 'text'             | 'text' or 'rating'                   |
| sort_order    | INTEGER      | NO       | 0                  | Display order                        |
| active        | BOOLEAN      | NO       | true               | Whether question is active           |
| created_at    | TIMESTAMPTZ  | NO       | now()              | Record creation timestamp            |

---

### 3.8 `reviews`

Student-submitted reviews linked to a feedback form.

```sql
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES student_accounts(id),
    form_id         UUID NOT NULL REFERENCES feedback_forms(id),
    course_id       UUID NOT NULL REFERENCES courses(id),
    trainer_id      UUID NOT NULL REFERENCES trainers(id),
    subject_name    TEXT NOT NULL,
    review_text     TEXT NOT NULL CHECK (char_length(review_text) >= 10),
    submitted_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    submitted_time  TIME NOT NULL DEFAULT CURRENT_TIME,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT unique_student_form UNIQUE (student_id, form_id)
);

-- Indexes
CREATE INDEX idx_reviews_student_id ON reviews(student_id);
CREATE INDEX idx_reviews_form_id ON reviews(form_id);
CREATE INDEX idx_reviews_course_id ON reviews(course_id);
CREATE INDEX idx_reviews_trainer_id ON reviews(trainer_id);
CREATE INDEX idx_reviews_submitted_date ON reviews(submitted_date);
```

| Column         | Type         | Nullable | Default            | Description                          |
| -------------- | ------------ | -------- | ------------------ | ------------------------------------ |
| id             | UUID         | NO       | gen_random_uuid()  | Primary key                          |
| student_id     | UUID         | NO       | —                  | FK → student_accounts(id)            |
| form_id        | UUID         | NO       | —                  | FK → feedback_forms(id)              |
| course_id      | UUID         | NO       | —                  | FK → courses(id) (denormalized)      |
| trainer_id     | UUID         | NO       | —                  | FK → trainers(id) (denormalized)     |
| subject_name   | TEXT         | NO       | —                  | Subject (denormalized)               |
| review_text    | TEXT         | NO       | —                  | Written review (min 10 chars)        |
| submitted_date | DATE         | NO       | CURRENT_DATE       | Date of submission                   |
| submitted_time | TIME         | NO       | CURRENT_TIME       | Time of submission                   |
| created_at     | TIMESTAMPTZ  | NO       | now()              | Record creation timestamp            |

**Unique Constraint**: `(student_id, form_id)` — prevents duplicate submissions.

---

### 3.9 `review_answers`

Per-question answers for structured feedback forms.

```sql
CREATE TABLE review_answers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id       UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES feedback_questions(id),
    answer_text     TEXT,
    rating_value    INTEGER CHECK (rating_value IS NULL OR (rating_value >= 1 AND rating_value <= 7)),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT unique_review_question UNIQUE (review_id, question_id)
);

-- Indexes
CREATE INDEX idx_review_answers_review_id ON review_answers(review_id);
CREATE INDEX idx_review_answers_question_id ON review_answers(question_id);
```

| Column       | Type         | Nullable | Default            | Description                          |
| ------------ | ------------ | -------- | ------------------ | ------------------------------------ |
| id           | UUID         | NO       | gen_random_uuid()  | Primary key                          |
| review_id    | UUID         | NO       | —                  | FK → reviews(id)                     |
| question_id  | UUID         | NO       | —                  | FK → feedback_questions(id)          |
| answer_text  | TEXT         | YES      | NULL               | Text answer (for type='text')        |
| rating_value | INTEGER      | YES      | NULL               | Rating 1-7 (for type='rating')       |
| created_at   | TIMESTAMPTZ  | NO       | now()              | Record creation timestamp            |

---

## 4. SQL Views

### 4.1 `leaderboard_view`

Ranks students by total number of submitted reviews.

```sql
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
    sa.id AS student_id,
    sa.full_name,
    COUNT(r.id) AS submission_count,
    RANK() OVER (ORDER BY COUNT(r.id) DESC) AS rank
FROM
    student_accounts sa
LEFT JOIN
    reviews r ON r.student_id = sa.id
WHERE
    sa.status = 'active'
GROUP BY
    sa.id, sa.full_name
ORDER BY
    submission_count DESC;
```

### 4.2 `trainer_performance_view`

Computes average ratings per trainer.

```sql
CREATE OR REPLACE VIEW trainer_performance_view AS
SELECT
    t.id AS trainer_id,
    t.trainer_name,
    t.department,
    COUNT(DISTINCT r.id) AS total_reviews,
    COALESCE(ROUND(AVG(ra.rating_value)::numeric, 2), 0) AS avg_rating,
    COUNT(DISTINCT r.student_id) AS unique_reviewers
FROM
    trainers t
LEFT JOIN
    feedback_forms ff ON ff.trainer_id = t.id
LEFT JOIN
    reviews r ON r.form_id = ff.id
LEFT JOIN
    review_answers ra ON ra.review_id = r.id AND ra.rating_value IS NOT NULL
WHERE
    t.active = true
GROUP BY
    t.id, t.trainer_name, t.department
ORDER BY
    avg_rating DESC;
```

### 4.3 `course_submission_view`

Tracks submission rates per course.

```sql
CREATE OR REPLACE VIEW course_submission_view AS
SELECT
    c.id AS course_id,
    c.course_name,
    c.course_code,
    c.department,
    COUNT(DISTINCT sa.id) AS enrolled_students,
    COUNT(DISTINCT r.student_id) AS students_who_submitted,
    CASE
        WHEN COUNT(DISTINCT sa.id) > 0
        THEN ROUND((COUNT(DISTINCT r.student_id)::numeric / COUNT(DISTINCT sa.id)) * 100, 1)
        ELSE 0
    END AS submission_rate_pct
FROM
    courses c
LEFT JOIN
    student_accounts sa ON sa.course_id = c.id AND sa.status = 'active'
LEFT JOIN
    feedback_forms ff ON ff.course_id = c.id AND ff.status = 'active'
LEFT JOIN
    reviews r ON r.form_id = ff.id AND r.student_id = sa.id
WHERE
    c.active = true
GROUP BY
    c.id, c.course_name, c.course_code, c.department
ORDER BY
    c.course_name;
```

---

## 5. Database Functions (RPC)

### 5.1 `get_user_role`

Returns the role of an authenticated user.

```sql
CREATE OR REPLACE FUNCTION get_user_role(user_auth_id UUID)
RETURNS TEXT AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM admin_accounts WHERE auth_user_id = user_auth_id) THEN
        RETURN 'admin';
    END IF;

    IF EXISTS (SELECT 1 FROM hod_accounts WHERE auth_user_id = user_auth_id) THEN
        RETURN 'hod';
    END IF;

    IF EXISTS (SELECT 1 FROM student_accounts WHERE auth_user_id = user_auth_id) THEN
        RETURN 'student';
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.2 `get_assigned_forms`

Returns active feedback forms for a student based on their course enrollment.

```sql
CREATE OR REPLACE FUNCTION get_assigned_forms(p_student_id UUID)
RETURNS TABLE (
    form_id UUID,
    title TEXT,
    subject_name TEXT,
    trainer_name TEXT,
    course_name TEXT,
    published_at TIMESTAMPTZ,
    is_completed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ff.id AS form_id,
        ff.title,
        ff.subject_name,
        t.trainer_name,
        c.course_name,
        ff.published_at,
        EXISTS (
            SELECT 1 FROM reviews r
            WHERE r.form_id = ff.id AND r.student_id = p_student_id
        ) AS is_completed
    FROM
        feedback_forms ff
    JOIN courses c ON c.id = ff.course_id
    JOIN trainers t ON t.id = ff.trainer_id
    JOIN student_accounts sa ON sa.course_id = c.id AND sa.id = p_student_id
    WHERE
        ff.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Triggers

### 6.1 Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_student_accounts_updated_at
    BEFORE UPDATE ON student_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 7. Seed Data

### 7.1 Initial Admin Account

```sql
-- After creating the auth user via Supabase Auth API
INSERT INTO admin_accounts (auth_user_id, full_name, email)
VALUES (
    '<auth-user-uuid>',
    'System Administrator',
    'admin@invertis.edu.in'
);
```

### 7.2 Sample Courses

```sql
INSERT INTO courses (course_name, course_code, department) VALUES
    ('Data Structures', 'CS101', 'Computer Science & Engineering'),
    ('Operating Systems', 'CS202', 'Computer Science & Engineering'),
    ('Compiler Design', 'CS305', 'Computer Science & Engineering'),
    ('Analog Circuits', 'EC101', 'Electronics & Communication'),
    ('Microprocessors', 'EC205', 'Electronics & Communication'),
    ('Thermodynamics', 'ME101', 'Mechanical Engineering'),
    ('Pharmacology I', 'PH101', 'Pharmacy & Medical Sciences'),
    ('Quantum Physics', 'AS101', 'Applied Sciences & Humanities');
```

### 7.3 Sample Trainers

```sql
INSERT INTO trainers (trainer_name, department) VALUES
    ('Dr. Alan Turing', 'Computer Science & Engineering'),
    ('Dr. Grace Hopper', 'Computer Science & Engineering'),
    ('Dr. Ada Lovelace', 'Computer Science & Engineering'),
    ('Dr. Richard Feynman', 'Electronics & Communication'),
    ('Prof. Nikola Tesla', 'Electronics & Communication'),
    ('Dr. James Watt', 'Mechanical Engineering'),
    ('Dr. Alexander Fleming', 'Pharmacy & Medical Sciences'),
    ('Dr. Marie Curie', 'Applied Sciences & Humanities');
```

---

## 8. Migration from Old Schema

### 8.1 Schema Mapping

| Old (MongoDB)                     | New (Postgres)                           |
| --------------------------------- | ---------------------------------------- |
| `User` (role='student')           | `auth.users` + `student_accounts`        |
| `User` (role='hod')               | `auth.users` + `hod_accounts`            |
| `User` (role='admin')             | `auth.users` + `admin_accounts`          |
| `Department`                      | Flattened into `department` TEXT columns  |
| `Course`                          | `courses`                                |
| `Faculty`                         | `trainers`                               |
| `Enrollment`                      | Replaced by `student_accounts.course_id` |
| `Tlfq`                            | `feedback_forms`                         |
| `Question`                        | `feedback_questions`                     |
| `Response`                        | `reviews`                                |
| `Answer`                          | `review_answers`                         |

### 8.2 Key Differences

1. **Enrollment simplification**: Old system had a separate `Enrollment` collection mapping students to multiple courses. New system uses `student_accounts.course_id` (one course per student). If multi-course enrollment is needed, re-introduce a junction table.
2. **Department denormalization**: Old system had a `Department` collection. New system uses a `department` TEXT column on relevant tables for simplicity. Can be normalized later if department management becomes complex.
3. **UUID keys**: Old system used MongoDB ObjectIds. New system uses Postgres UUIDs.
4. **Written reviews**: Old system stored only numeric ratings (1-7) + optional comment. New system stores full written reviews as the primary feedback with optional ratings.
