-- 1. Create courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_name TEXT NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create trainers table
CREATE TABLE trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_name TEXT NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create subjects table (master list of all subjects across courses/semesters)
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_name TEXT NOT NULL,
    department TEXT NOT NULL,
    semester INTEGER NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_name, subject_code)
);

-- 4. Create profiles table (Handles Student, HOD, and Admin)
-- The 'id' column references Supabase's built-in auth.users table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'hod', 'admin')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT,                       -- Nullable, only for HODs
    course_id UUID REFERENCES courses(id), -- Nullable, only for Students
    batch_year TEXT,                       -- Nullable, only for Students
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create feedback_forms table
CREATE TABLE feedback_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id),
    trainer_id UUID NOT NULL REFERENCES trainers(id),
    subject_name TEXT NOT NULL,
    subject_code TEXT,                  -- Links to subjects table for reference
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    published_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create reviews table
-- Stores the main submission and qualitative feedback
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES feedback_forms(id),
    student_id UUID NOT NULL REFERENCES profiles(id),
    written_feedback TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- This constraint prevents a student from submitting the same form twice
    UNIQUE(form_id, student_id) 
);

-- 6. Create review_answers table
-- Stores the 1-7 ratings for the 10 questions
CREATE TABLE review_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    rating_value INTEGER NOT NULL CHECK (rating_value >= 1 AND rating_value <= 7),
    -- This constraint ensures only one answer per question per review
    UNIQUE(review_id, question_id)
);
