-- ═══════════════════════════════════════════════════════════════════════
-- INVERTIS FEEDBACK SYSTEM — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── DEPARTMENTS ──────────────────────────────────────────────────────
CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  code        TEXT NOT NULL UNIQUE,
  portal_open BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── SECTIONS ─────────────────────────────────────────────────────────
CREATE TABLE sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  code          TEXT NOT NULL UNIQUE,
  semester      INTEGER NOT NULL,
  label         TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── USERS ────────────────────────────────────────────────────────────
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  email               TEXT UNIQUE,
  password            TEXT,
  role                TEXT NOT NULL CHECK (role IN ('supreme','super_admin','coordinator','hod','student')),
  status              TEXT DEFAULT 'active' CHECK (status IN ('pending','active')),
  department_id       UUID REFERENCES departments(id) ON DELETE SET NULL,
  section_id          UUID REFERENCES sections(id) ON DELETE SET NULL,
  student_id          TEXT UNIQUE,
  unique_feedback_id  TEXT UNIQUE,
  points              INTEGER DEFAULT 0,
  batch               TEXT,
  semester            INTEGER,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── COURSES ──────────────────────────────────────────────────────────
CREATE TABLE courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  code          TEXT NOT NULL UNIQUE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── FACULTY ──────────────────────────────────────────────────────────
CREATE TABLE faculty (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  teacher_type  TEXT DEFAULT 'college_faculty' CHECK (teacher_type IN ('college_faculty','trainer')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── SECTION_FACULTY ──────────────────────────────────────────────────
CREATE TABLE section_faculty (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  faculty_id  UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(section_id, faculty_id, course_id)
);

-- ── ENROLLMENTS ──────────────────────────────────────────────────────
CREATE TABLE enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  section_id  UUID REFERENCES sections(id) ON DELETE SET NULL
);

-- ── TLFQS ────────────────────────────────────────────────────────────
CREATE TABLE tlfqs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id   UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id   UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  is_active    BOOLEAN DEFAULT false,
  closing_time TIMESTAMPTZ NOT NULL,
  created_by   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── QUESTIONS ────────────────────────────────────────────────────────
CREATE TABLE questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tlfq_id       UUID NOT NULL REFERENCES tlfqs(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL
);

-- ── RESPONSES ────────────────────────────────────────────────────────
CREATE TABLE responses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tlfq_id      UUID NOT NULL REFERENCES tlfqs(id) ON DELETE CASCADE,
  submitted_at TEXT NOT NULL,
  comment      TEXT DEFAULT '',
  UNIQUE(student_id, tlfq_id)
);

-- ── ANSWERS ──────────────────────────────────────────────────────────
CREATE TABLE answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 7)
);

-- ── INDEXES ──────────────────────────────────────────────────────────
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_sections_department_id ON sections(department_id);
CREATE INDEX idx_courses_department_id ON courses(department_id);
CREATE INDEX idx_faculty_department_id ON faculty(department_id);
CREATE INDEX idx_tlfqs_section_id ON tlfqs(section_id);
CREATE INDEX idx_tlfqs_created_by ON tlfqs(created_by);
CREATE INDEX idx_responses_student_id ON responses(student_id);
CREATE INDEX idx_responses_tlfq_id ON responses(tlfq_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_answers_response_id ON answers(response_id);

-- ── DISABLE RLS (server uses service_role key) ───────────────────────
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tlfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, but we add permissive policies for safety
CREATE POLICY "service_role_all" ON departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON faculty FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON section_faculty FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON tlfqs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON answers FOR ALL USING (true) WITH CHECK (true);
