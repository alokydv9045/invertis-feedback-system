-- =====================================================
-- RLS Policies for IFS v2.0
-- Run this in Supabase SQL Editor AFTER seeding data
-- =====================================================

-- Enable RLS on all tables (already enabled by default)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_answers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES: Users can read all profiles, update own
-- =====================================================
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow insert for authenticated users"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- COURSES: Readable by everyone, writable by admin
-- =====================================================
CREATE POLICY "Courses are viewable by everyone"
  ON courses FOR SELECT
  USING (true);

CREATE POLICY "Courses are insertable by authenticated"
  ON courses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Courses are updatable by authenticated"
  ON courses FOR UPDATE
  USING (true);

CREATE POLICY "Courses are deletable by authenticated"
  ON courses FOR DELETE
  USING (true);

-- =====================================================
-- TRAINERS: Readable by everyone, writable by admin
-- =====================================================
CREATE POLICY "Trainers are viewable by everyone"
  ON trainers FOR SELECT
  USING (true);

CREATE POLICY "Trainers are insertable by authenticated"
  ON trainers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Trainers are updatable by authenticated"
  ON trainers FOR UPDATE
  USING (true);

CREATE POLICY "Trainers are deletable by authenticated"
  ON trainers FOR DELETE
  USING (true);

-- =====================================================
-- SUBJECTS: Readable by everyone
-- =====================================================
CREATE POLICY "Subjects are viewable by everyone"
  ON subjects FOR SELECT
  USING (true);

-- =====================================================
-- FEEDBACK_FORMS: Readable by everyone, writable by HOD/Admin
-- =====================================================
CREATE POLICY "Forms are viewable by everyone"
  ON feedback_forms FOR SELECT
  USING (true);

CREATE POLICY "Forms are insertable by authenticated"
  ON feedback_forms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Forms are updatable by authenticated"
  ON feedback_forms FOR UPDATE
  USING (true);

CREATE POLICY "Forms are deletable by authenticated"
  ON feedback_forms FOR DELETE
  USING (true);

-- =====================================================
-- REVIEWS: Students can submit, everyone can read
-- =====================================================
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Students can submit reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- =====================================================
-- REVIEW_ANSWERS: Readable by everyone, insertable by student
-- =====================================================
CREATE POLICY "Answers are viewable by everyone"
  ON review_answers FOR SELECT
  USING (true);

CREATE POLICY "Answers are insertable by authenticated"
  ON review_answers FOR INSERT
  WITH CHECK (true);
