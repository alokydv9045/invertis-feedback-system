-- CreateEnum
CREATE TYPE "Role" AS ENUM ('supreme', 'super_admin', 'coordinator', 'hod', 'student');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'active', 'inactive', 'archived', 'graduated');

-- CreateEnum
CREATE TYPE "TeacherType" AS ENUM ('college_faculty', 'trainer');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "portal_open" BOOLEAN NOT NULL DEFAULT true,
    "max_semester" INTEGER NOT NULL DEFAULT 6,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AcademicSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "department_id" TEXT,
    "section_id" TEXT,
    "student_id" TEXT,
    "unique_feedback_id" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "batch" TEXT,
    "semester" INTEGER,
    "academic_session_id" TEXT,
    "last_promotion_log_id" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionLog" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "department_id" TEXT,
    "from_session_id" TEXT NOT NULL,
    "to_session_id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "semesters" TEXT,
    "promoted_count" INTEGER NOT NULL DEFAULT 0,
    "graduated_count" INTEGER NOT NULL DEFAULT 0,
    "skipped_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "promoted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "teacher_type" "TeacherType" NOT NULL DEFAULT 'college_faculty',

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionFaculty" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "faculty_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,

    CONSTRAINT "SectionFaculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tlfq" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "faculty_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "closing_time" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "Tlfq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "tlfq_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "tlfq_id" TEXT NOT NULL,
    "submitted_at" TEXT NOT NULL,
    "comment" TEXT DEFAULT '',

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "response_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE INDEX "Section_department_id_idx" ON "Section"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSession_name_key" ON "AcademicSession"("name");

-- CreateIndex
CREATE INDEX "AcademicSession_is_active_idx" ON "AcademicSession"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_student_id_key" ON "User"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_unique_feedback_id_key" ON "User"("unique_feedback_id");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_department_id_idx" ON "User"("department_id");

-- CreateIndex
CREATE INDEX "User_section_id_idx" ON "User"("section_id");

-- CreateIndex
CREATE INDEX "User_academic_session_id_idx" ON "User"("academic_session_id");

-- CreateIndex
CREATE INDEX "User_points_idx" ON "User"("points");

-- CreateIndex
CREATE INDEX "PromotionLog_admin_id_idx" ON "PromotionLog"("admin_id");

-- CreateIndex
CREATE INDEX "PromotionLog_department_id_idx" ON "PromotionLog"("department_id");

-- CreateIndex
CREATE INDEX "PromotionLog_from_session_id_idx" ON "PromotionLog"("from_session_id");

-- CreateIndex
CREATE INDEX "PromotionLog_to_session_id_idx" ON "PromotionLog"("to_session_id");

-- CreateIndex
CREATE INDEX "PromotionLog_promoted_at_idx" ON "PromotionLog"("promoted_at");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE INDEX "Course_department_id_idx" ON "Course"("department_id");

-- CreateIndex
CREATE INDEX "Faculty_department_id_idx" ON "Faculty"("department_id");

-- CreateIndex
CREATE INDEX "SectionFaculty_section_id_idx" ON "SectionFaculty"("section_id");

-- CreateIndex
CREATE INDEX "SectionFaculty_faculty_id_idx" ON "SectionFaculty"("faculty_id");

-- CreateIndex
CREATE INDEX "SectionFaculty_course_id_idx" ON "SectionFaculty"("course_id");

-- CreateIndex
CREATE INDEX "Enrollment_student_id_idx" ON "Enrollment"("student_id");

-- CreateIndex
CREATE INDEX "Enrollment_course_id_idx" ON "Enrollment"("course_id");

-- CreateIndex
CREATE INDEX "Enrollment_section_id_idx" ON "Enrollment"("section_id");

-- CreateIndex
CREATE INDEX "Tlfq_section_id_idx" ON "Tlfq"("section_id");

-- CreateIndex
CREATE INDEX "Tlfq_course_id_idx" ON "Tlfq"("course_id");

-- CreateIndex
CREATE INDEX "Tlfq_faculty_id_idx" ON "Tlfq"("faculty_id");

-- CreateIndex
CREATE INDEX "Tlfq_is_active_idx" ON "Tlfq"("is_active");

-- CreateIndex
CREATE INDEX "Tlfq_closing_time_idx" ON "Tlfq"("closing_time");

-- CreateIndex
CREATE INDEX "Question_tlfq_id_idx" ON "Question"("tlfq_id");

-- CreateIndex
CREATE INDEX "Response_student_id_idx" ON "Response"("student_id");

-- CreateIndex
CREATE INDEX "Response_tlfq_id_idx" ON "Response"("tlfq_id");

-- CreateIndex
CREATE INDEX "Answer_response_id_idx" ON "Answer"("response_id");

-- CreateIndex
CREATE INDEX "Answer_question_id_idx" ON "Answer"("question_id");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_academic_session_id_fkey" FOREIGN KEY ("academic_session_id") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionLog" ADD CONSTRAINT "PromotionLog_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionLog" ADD CONSTRAINT "PromotionLog_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionLog" ADD CONSTRAINT "PromotionLog_from_session_id_fkey" FOREIGN KEY ("from_session_id") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionLog" ADD CONSTRAINT "PromotionLog_to_session_id_fkey" FOREIGN KEY ("to_session_id") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionFaculty" ADD CONSTRAINT "SectionFaculty_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionFaculty" ADD CONSTRAINT "SectionFaculty_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionFaculty" ADD CONSTRAINT "SectionFaculty_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tlfq" ADD CONSTRAINT "Tlfq_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tlfq" ADD CONSTRAINT "Tlfq_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tlfq" ADD CONSTRAINT "Tlfq_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tlfq" ADD CONSTRAINT "Tlfq_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_tlfq_id_fkey" FOREIGN KEY ("tlfq_id") REFERENCES "Tlfq"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_tlfq_id_fkey" FOREIGN KEY ("tlfq_id") REFERENCES "Tlfq"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_response_id_fkey" FOREIGN KEY ("response_id") REFERENCES "Response"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
