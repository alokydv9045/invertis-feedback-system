import { PrismaClient } from '@prisma/client';
import pkg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pkg;
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // PgBouncer-safe: keep below Supabase pool limit
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 15000, // Fail fast instead of hanging
  statement_timeout: 30000, // Kill queries running longer than 30s
});
const adapter = new PrismaPg(pool);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function bootstrapPromotionSchema() {
  // Repair databases where the promotion migration was recorded but the tables were later dropped.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "AcademicSession" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "start_year" INTEGER NOT NULL,
      "end_year" INTEGER NOT NULL,
      "is_active" BOOLEAN NOT NULL DEFAULT false,
      CONSTRAINT "AcademicSession_pkey" PRIMARY KEY ("id")
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "AcademicSession_name_key"
    ON "AcademicSession"("name");
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS "AcademicSession_is_active_idx"
    ON "AcademicSession"("is_active");
  `);

  await pool.query(`
    ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "academic_session_id" TEXT,
      ADD COLUMN IF NOT EXISTS "last_promotion_log_id" TEXT;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "PromotionLog" (
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
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS "PromotionLog_admin_id_idx" ON "PromotionLog"("admin_id");
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS "PromotionLog_department_id_idx" ON "PromotionLog"("department_id");
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS "PromotionLog_from_session_id_idx" ON "PromotionLog"("from_session_id");
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS "PromotionLog_to_session_id_idx" ON "PromotionLog"("to_session_id");
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS "PromotionLog_promoted_at_idx" ON "PromotionLog"("promoted_at");
  `);
}

async function withDbRetry(operation, label, attempts = 5) {
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      const timeoutLike = err?.code === 'ETIMEDOUT' || /timed out/i.test(err?.message || '');
      if (!timeoutLike || i === attempts) break;

      const waitMs = i * 1500;
      console.warn(`[db:init] ${label} timed out (attempt ${i}/${attempts}). Retrying in ${waitMs}ms...`);
      await sleep(waitMs);
    }
  }
  throw lastError;
}

export const prisma = new PrismaClient({
  adapter,
  // Only log errors in production to avoid console overhead
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
});

// Wrap model accessors in a retrying proxy to handle transient ETIMEDOUT errors.
function wrapModel(modelName) {
  const model = prisma[modelName];
  if (!model) return model;

  return new Proxy(model, {
    get(target, prop) {
      const orig = target[prop];
      if (typeof orig !== 'function') return orig;

      return async function retryingMethod(...args) {
        const maxRetries = 3;
        let attempt = 0;
        while (true) {
          try {
            return await orig.apply(target, args);
          } catch (err) {
            const isTimeout = err?.code === 'ETIMEDOUT' || /timed out/i.test(err?.message || '');
            attempt += 1;
            if (!isTimeout || attempt > maxRetries) throw err;
            const waitMs = attempt * 500;
            console.warn(`[prisma:${modelName}] transient timeout on ${String(prop)}, retry ${attempt}/${maxRetries} in ${waitMs}ms`);
            await sleep(waitMs);
          }
        }
      };
    }
  });
}

export const FEEDBACK_ID_PREFIX = 'ANO-';
export const REWARD_POINTS = 10;

function generateFeedbackId() {
  return FEEDBACK_ID_PREFIX + crypto.randomBytes(3).toString('hex').toUpperCase();
}

export const Department = wrapModel('department');
export const Section = wrapModel('section');
export const SectionFaculty = wrapModel('sectionFaculty');
export const Course = wrapModel('course');
export const Faculty = wrapModel('faculty');
export const Tlfq = wrapModel('tlfq');
export const Question = wrapModel('question');
export const Response = wrapModel('response');
export const Answer = wrapModel('answer');
export const User = wrapModel('user');
export const Enrollment = wrapModel('enrollment');
export const AcademicSession = wrapModel('academicSession');
export const PromotionLog = wrapModel('promotionLog');

function getAcademicYearWindow(date = new Date()) {
  // Academic year rollover in July: 2026-07 => session 2026-27
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const startYear = month >= 7 ? year : year - 1;
  const endYear = startYear + 1;
  return {
    startYear,
    endYear,
    name: `${startYear}-${String(endYear).slice(-2)}`,
  };
}

export const initDb = async () => {
  if (process.env.SEED_DATA !== 'true') return;

  try {
    await bootstrapPromotionSchema();

    const { startYear, endYear, name: currentSessionName } = getAcademicYearWindow();
    const currentSession = await withDbRetry(
      () => AcademicSession.upsert({
        where: { name: currentSessionName },
        update: { is_active: true },
        create: { name: currentSessionName, start_year: startYear, end_year: endYear, is_active: true },
      }),
      'academic_session_upsert'
    );

    await withDbRetry(
      () => AcademicSession.updateMany({
        where: { id: { not: currentSession.id }, is_active: true },
        data: { is_active: false },
      }),
      'academic_session_deactivate_others'
    );

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@invertis.edu.in';
    const adminPass = process.env.ADMIN_PASSWORD || 'Admin@2025';

    console.log('Synchronizing system data (Supreme Auths & Demo Records)...');
    
    const supremeHashedPw = await bcrypt.hash('Super@123', 10);
    const adminHashedPw = await bcrypt.hash(adminPass, 10);
    const coordHashedPw = await bcrypt.hash('Coord@2025', 10);
    const hodHashedPw = await bcrypt.hash('Hod@2025', 10);
    const studentHashedPw = await bcrypt.hash('Student@2025', 10);

    // 1. Create Supreme Authority (Exactly 3)
    console.log('Creating Supreme Authority accounts...');
    const supremeUsers = [
      { name: 'SUPAdmin1', email: 'supauth1@invertis.edu.in', password: supremeHashedPw, role: 'supreme', status: 'active' },
      { name: 'SUPAdmin2', email: 'supauth2@invertis.edu.in', password: supremeHashedPw, role: 'supreme', status: 'active' },
      { name: 'SUPAdmin3', email: 'supauth3@invertis.edu.in', password: supremeHashedPw, role: 'supreme', status: 'active' },
    ];

    for (const s of supremeUsers) {
      await User.upsert({
        where: { email: s.email },
        update: { password: s.password },
        create: s
      });
    }
    
    // 2. Create Departments (Exactly 5 to match HODs)
    const deptsData = [
      { name: 'B.Tech CS', code: 'BCS' },
      { name: 'B.Tech AI', code: 'BTAI' },
      { name: 'Electronics', code: 'BTEC' },
      { name: 'Mechanical', code: 'BTME' },
      { name: 'Civil', code: 'BTCE' },
    ];

    const depts = {};
    for (const d of deptsData) {
      depts[d.code] = await Department.upsert({
        where: { code: d.code },
        update: {},
        create: { ...d, portal_open: true }
      });
    }

    // 3. Create Super Admin (Exactly 1)
    await User.upsert({
      where: { email: adminEmail },
      update: { password: adminHashedPw },
      create: {
        name: 'System Admin',
        email: adminEmail,
        password: adminHashedPw,
        role: 'super_admin',
        status: 'active'
      }
    });

    // 4. Create Coordinators (Exactly 3)
    console.log('Creating Coordinator accounts...');
    const coordUsers = [
      { name: 'Coordinator 1', email: 'coordinator@invertis.edu.in', password: coordHashedPw, role: 'coordinator', status: 'active' },
      { name: 'Coordinator 2', email: 'coordinator2@invertis.edu.in', password: coordHashedPw, role: 'coordinator', status: 'active' },
      { name: 'Coordinator 3', email: 'coordinator3@invertis.edu.in', password: coordHashedPw, role: 'coordinator', status: 'active' },
    ];

    for (const c of coordUsers) {
      await User.upsert({
        where: { email: c.email },
        update: { password: c.password },
        create: c
      });
    }

    // 5. Create HODs (Exactly 5)
    console.log('Creating HOD accounts...');
    for (const code of Object.keys(depts)) {
      await User.upsert({
        where: { email: `hod.${code.toLowerCase()}@invertis.edu.in` },
        update: {},
        create: {
          name: `HOD ${code}`,
          email: `hod.${code.toLowerCase()}@invertis.edu.in`,
          password: hodHashedPw,
          role: 'hod',
          department_id: depts[code].id,
          status: 'active'
        }
      });
    }

    // 6. Create Sample Sections
    const bcs3a = await Section.upsert({
      where: { code: 'BCS3A' },
      update: {},
      create: {
        name: 'BCS-3A',
        code: 'BCS3A',
        semester: 3,
        label: 'A',
        department_id: depts['BCS'].id
      }
    });

    const btai3a = await Section.upsert({
      where: { code: 'BTAI3A' },
      update: {},
      create: {
        name: 'BTAI-3A',
        code: 'BTAI3A',
        semester: 3,
        label: 'A',
        department_id: depts['BTAI'].id
      }
    });

    const btec3a = await Section.upsert({
      where: { code: 'BTEC3A' },
      update: {},
      create: {
        name: 'BTEC-3A',
        code: 'BTEC3A',
        semester: 3,
        label: 'A',
        department_id: depts['BTEC'].id
      }
    });

    const btme3a = await Section.upsert({
      where: { code: 'BTME3A' },
      update: {},
      create: {
        name: 'BTME-3A',
        code: 'BTME3A',
        semester: 3,
        label: 'A',
        department_id: depts['BTME'].id
      }
    });

    const btce3a = await Section.upsert({
      where: { code: 'BTCE3A' },
      update: {},
      create: {
        name: 'BTCE-3A',
        code: 'BTCE3A',
        semester: 3,
        label: 'A',
        department_id: depts['BTCE'].id
      }
    });

    // 7. Create Courses
    const c1 = await Course.upsert({
      where: { code: 'CS201' },
      update: {},
      create: { name: 'Data Structures', code: 'CS201', department_id: depts['BCS'].id }
    });
    const c2 = await Course.upsert({
      where: { code: 'AI301' },
      update: {},
      create: { name: 'Artificial Intelligence', code: 'AI301', department_id: depts['BTAI'].id }
    });
    const c3 = await Course.upsert({
      where: { code: 'EC101' },
      update: {},
      create: { name: 'Basic Electronics', code: 'EC101', department_id: depts['BTEC'].id }
    });
    const c4 = await Course.upsert({
      where: { code: 'ME101' },
      update: {},
      create: { name: 'Thermodynamics', code: 'ME101', department_id: depts['BTME'].id }
    });
    const c5 = await Course.upsert({
      where: { code: 'CE101' },
      update: {},
      create: { name: 'Structural Analysis', code: 'CE101', department_id: depts['BTCE'].id }
    });

    // 8. Create Faculty
    let f1 = await Faculty.findFirst({ where: { name: 'Dr. R.K. Singh' } });
    if (!f1) f1 = await Faculty.create({ data: { name: 'Dr. R.K. Singh', department_id: depts['BCS'].id, teacher_type: 'college_faculty' } });
    
    let f2 = await Faculty.findFirst({ where: { name: 'Dr. Vikram Chandra' } });
    if (!f2) f2 = await Faculty.create({ data: { name: 'Dr. Vikram Chandra', department_id: depts['BTAI'].id, teacher_type: 'college_faculty' } });
    
    let f3 = await Faculty.findFirst({ where: { name: 'Dr. Amit Dixit' } });
    if (!f3) f3 = await Faculty.create({ data: { name: 'Dr. Amit Dixit', department_id: depts['BTEC'].id, teacher_type: 'college_faculty' } });

    let f4 = await Faculty.findFirst({ where: { name: 'Prof. Manish Gupta' } });
    if (!f4) f4 = await Faculty.create({ data: { name: 'Prof. Manish Gupta', department_id: depts['BTME'].id, teacher_type: 'college_faculty' } });

    let f5 = await Faculty.findFirst({ where: { name: 'Er. Sandeep Kumar' } });
    if (!f5) f5 = await Faculty.create({ data: { name: 'Er. Sandeep Kumar', department_id: depts['BTCE'].id, teacher_type: 'college_faculty' } });

    // 9. Assign Faculty to Sections
    const assignments = [
      { section_id: bcs3a.id, faculty_id: f1.id, course_id: c1.id },
      { section_id: btai3a.id, faculty_id: f2.id, course_id: c2.id },
      { section_id: btec3a.id, faculty_id: f3.id, course_id: c3.id },
      { section_id: btme3a.id, faculty_id: f4.id, course_id: c4.id },
      { section_id: btce3a.id, faculty_id: f5.id, course_id: c5.id },
    ];

    for (const a of assignments) {
      const exists = await SectionFaculty.findFirst({ where: a });
      if (!exists) await SectionFaculty.create({ data: a });
    }

    // 10. Create 25 Students per Section (22 Active, 3 Pending)
    console.log('Generating 25 students per field (total 125)...');
    const deptsMapping = [
      { deptCode: 'BCS', section: bcs3a, prefix: 'BCS2025_', courseId: c1.id },
      { deptCode: 'BTAI', section: btai3a, prefix: 'BTAI2025_', courseId: c2.id },
      { deptCode: 'BTEC', section: btec3a, prefix: 'BTEC2025_', courseId: c3.id },
      { deptCode: 'BTME', section: btme3a, prefix: 'BTME2025_', courseId: c4.id },
      { deptCode: 'BTCE', section: btce3a, prefix: 'BTCE2025_', courseId: c5.id },
    ];

    const students = [];
    for (const dm of deptsMapping) {
      for (let i = 1; i <= 25; i++) {
        const suffix = String(i).padStart(2, '0');
        const studentId = `${dm.prefix}${suffix}`;
        const isPending = i > 22;
        const status = isPending ? 'pending' : 'active';
        const email = isPending ? null : `${dm.deptCode.toLowerCase()}2025.${suffix}@iu.edu.in`;
        const name = `${dm.deptCode} Student ${suffix}`;

        const student = await User.upsert({
          where: { student_id: studentId },
          update: { password: studentHashedPw },
          create: {
            name,
            student_id: studentId,
            email,
            password: studentHashedPw,
            role: 'student',
            status,
            department_id: depts[dm.deptCode].id,
            section_id: dm.section.id,
            semester: 3,
            academic_session_id: currentSession.id,
            batch: '2022-26',
            unique_feedback_id: generateFeedbackId(),
            points: isPending ? 0 : 50
          }
        });
        students.push(student);

        // Enrollments
        const enrollExists = await Enrollment.findFirst({ where: { student_id: student.id, course_id: dm.courseId } });
        if (!enrollExists) {
          await Enrollment.create({
            data: {
              student_id: student.id,
              course_id: dm.courseId,
              section_id: dm.section.id
            }
          });
        }
      }
    }

    // 11. Create TLFQ Forms
    console.log('Creating sample TLFQ forms...');
    const coord1 = await User.findFirst({ where: { email: 'coordinator@invertis.edu.in' } });
    const t1 = await Tlfq.upsert({
      where: { id: 'sample-tlfq-1' },
      update: {},
      create: {
        id: 'sample-tlfq-1',
        title: 'Data Structures Mid-Term Feedback',
        section_id: bcs3a.id,
        course_id: c1.id,
        faculty_id: f1.id,
        is_active: true,
        closing_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_by: coord1.id
      }
    });

    const t2 = await Tlfq.upsert({
      where: { id: 'sample-tlfq-2' },
      update: {},
      create: {
        id: 'sample-tlfq-2',
        title: 'AI Concept Evaluation',
        section_id: btai3a.id,
        course_id: c2.id,
        faculty_id: f2.id,
        is_active: true,
        closing_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_by: coord1.id
      }
    });

    const t3 = await Tlfq.upsert({
      where: { id: 'sample-tlfq-3' },
      update: {},
      create: {
        id: 'sample-tlfq-3',
        title: 'Basic Electronics Assessment',
        section_id: btec3a.id,
        course_id: c3.id,
        faculty_id: f3.id,
        is_active: true,
        closing_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_by: coord1.id
      }
    });

    const t4 = await Tlfq.upsert({
      where: { id: 'sample-tlfq-4' },
      update: {},
      create: {
        id: 'sample-tlfq-4',
        title: 'Thermodynamics Course Evaluation',
        section_id: btme3a.id,
        course_id: c4.id,
        faculty_id: f4.id,
        is_active: true,
        closing_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_by: coord1.id
      }
    });

    const t5 = await Tlfq.upsert({
      where: { id: 'sample-tlfq-5' },
      update: {},
      create: {
        id: 'sample-tlfq-5',
        title: 'Structural Analysis Feedback',
        section_id: btce3a.id,
        course_id: c5.id,
        faculty_id: f5.id,
        is_active: true,
        closing_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_by: coord1.id
      }
    });

    // 12. Add Questions
    const questionsText = [
      'How well does the teacher explain concepts?',
      'Is the teacher punctual and regular?',
      'Does the teacher encourage student participation?',
      'Is the study material provided helpful?',
      'Overall satisfaction with the teaching method?'
    ];

    for (const tlfqId of [t1.id, t2.id, t3.id, t4.id, t5.id]) {
      for (const qText of questionsText) {
        const exists = await Question.findFirst({ where: { tlfq_id: tlfqId, question_text: qText } });
        if (!exists) await Question.create({ data: { tlfq_id: tlfqId, question_text: qText } });
      }
    }

    // 13. Responses
    console.log('Generating sample responses...');
    const comments = [
      'Excellent teacher! Explains concepts very clearly.',
      'Very punctual, covers the syllabus thoroughly.',
      'Engages the class and makes learning fun.',
      'Always helpful during and after class hours.',
      'Teaching style is very interactive and helpful.'
    ];
    for (const student of students) {
      if (student.status !== 'active') continue;
      
      let tlfqId;
      if (student.section_id === bcs3a.id) tlfqId = t1.id;
      else if (student.section_id === btai3a.id) tlfqId = t2.id;
      else if (student.section_id === btec3a.id) tlfqId = t3.id;
      else if (student.section_id === btme3a.id) tlfqId = t4.id;
      else if (student.section_id === btce3a.id) tlfqId = t5.id;

      const hasResponded = await Response.findFirst({ where: { student_id: student.id, tlfq_id: tlfqId } });
      if (!hasResponded) {
        const comment = comments[Math.floor(Math.random() * comments.length)];
        const resp = await Response.create({
          data: {
            student_id: student.id,
            tlfq_id: tlfqId,
            submitted_at: new Date().toISOString(),
            comment
          }
        });
        const qs = await Question.findMany({ where: { tlfq_id: tlfqId } });
        for (const q of qs) {
          await Answer.create({ data: { response_id: resp.id, question_id: q.id, rating: Math.floor(Math.random() * 3) + 5 } });
        }
        await User.update({ where: { id: student.id }, data: { points: { increment: REWARD_POINTS } } });
      }
    }

    console.log('System data seeded successfully with Supreme Authority and demo feedback.');
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
};

/** Graceful shutdown — drain pool and disconnect Prisma. */
export const gracefulShutdown = async () => {
  console.log('[db] Graceful shutdown initiated...');
  try {
    await prisma.$disconnect();
    await pool.end();
    console.log('[db] All connections closed.');
  } catch (err) {
    console.error('[db] Shutdown error:', err.message);
  }
};
