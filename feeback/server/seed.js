import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function generateFeedbackId() {
  return 'ANO-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

async function seed() {
  console.log('🌱 Seeding Supabase database...');

  // ── Check if already seeded ─────────────────────────────────────────────
  const { count } = await supabase.from('users').select('id', { count: 'exact', head: true });
  if (count > 0) {
    console.log(`ℹ️  Database already has ${count} users. Skipping seed.`);
    console.log('   To force re-seed, delete all data first.');
    process.exit(0);
  }

  // ── Departments ────────────────────────────────────────────────────────
  const deptRows = [
    { name: 'B.Tech Artificial Intelligence', code: 'BTAI', portal_open: true },
    { name: 'B.Tech Computer Science', code: 'BCS', portal_open: true },
    { name: 'B.Tech Electronics & Communication', code: 'BTEC', portal_open: true },
    { name: 'B.Tech Mechanical Engineering', code: 'BTME', portal_open: true },
    { name: 'B.Tech Civil Engineering', code: 'BTCE', portal_open: true },
  ];
  const { data: depts } = await supabase.from('departments').insert(deptRows).select();
  const [deptBTAI, deptBCS, deptBTEC, deptBTME, deptBTCE] = depts;
  console.log('✅ Departments created');

  // ── Supreme Authority ──────────────────────────────────────────────────
  const supPassword = await bcrypt.hash('Super@123', 10);
  await supabase.from('users').insert([
    { name: 'SUPAdmin1', email: 'supauth1@invertis.edu.in', password: supPassword, role: 'supreme', status: 'active' },
    { name: 'SUPAdmin2', email: 'supauth2@invertis.edu.in', password: supPassword, role: 'supreme', status: 'active' },
    { name: 'SUPAdmin3', email: 'supauth3@invertis.edu.in', password: supPassword, role: 'supreme', status: 'active' },
  ]);

  // ── Super Admin ────────────────────────────────────────────────────────
  await supabase.from('users').insert({
    name: 'Vikram Chandra', email: 'admin@invertis.edu.in',
    password: await bcrypt.hash('Admin@2025', 10), role: 'super_admin', status: 'active'
  });

  // ── Coordinator ────────────────────────────────────────────────────────
  await supabase.from('users').insert({
    name: 'Sunita Tiwari', email: 'coordinator@invertis.edu.in',
    password: await bcrypt.hash('Coord@2025', 10), role: 'coordinator', status: 'active'
  });

  // ── HODs ───────────────────────────────────────────────────────────────
  const hodPassword = await bcrypt.hash('Hod@2025', 10);
  const hodRows = [
    { name: 'Dr. Priya Sharma', email: 'hod.btai@invertis.edu.in', password: hodPassword, role: 'hod', department_id: deptBTAI.id, status: 'active' },
    { name: 'Dr. Rajesh Kumar', email: 'hod.bcs@invertis.edu.in', password: hodPassword, role: 'hod', department_id: deptBCS.id, status: 'active' },
    { name: 'Dr. Anita Singh', email: 'hod.btec@invertis.edu.in', password: hodPassword, role: 'hod', department_id: deptBTEC.id, status: 'active' },
    { name: 'Dr. Suresh Mishra', email: 'hod.btme@invertis.edu.in', password: hodPassword, role: 'hod', department_id: deptBTME.id, status: 'active' },
    { name: 'Dr. Kavita Verma', email: 'hod.btce@invertis.edu.in', password: hodPassword, role: 'hod', department_id: deptBTCE.id, status: 'active' },
  ];
  const { data: hods } = await supabase.from('users').insert(hodRows).select();
  console.log('✅ Staff accounts created');

  // ── Faculty ────────────────────────────────────────────────────────────
  const facultyRows = [
    { name: 'Dr. Alan Turing', department_id: deptBTAI.id, teacher_type: 'college_faculty' },
    { name: 'Dr. Yoshua Bengio', department_id: deptBTAI.id, teacher_type: 'trainer' },
    { name: 'Dr. Fei-Fei Li', department_id: deptBTAI.id, teacher_type: 'college_faculty' },
    { name: 'Dr. Grace Hopper', department_id: deptBCS.id, teacher_type: 'college_faculty' },
    { name: 'Dr. Ada Lovelace', department_id: deptBCS.id, teacher_type: 'trainer' },
    { name: 'Dr. Dennis Ritchie', department_id: deptBCS.id, teacher_type: 'college_faculty' },
    { name: 'Dr. Richard Feynman', department_id: deptBTEC.id, teacher_type: 'college_faculty' },
    { name: 'Dr. Nikola Tesla', department_id: deptBTEC.id, teacher_type: 'trainer' },
    { name: 'Dr. Isaac Newton', department_id: deptBTME.id, teacher_type: 'college_faculty' },
    { name: 'Dr. Marie Curie', department_id: deptBTME.id, teacher_type: 'trainer' },
    { name: 'Dr. Ratan Tata', department_id: deptBTCE.id, teacher_type: 'college_faculty' },
    { name: 'Dr. Sunita Williams', department_id: deptBTCE.id, teacher_type: 'trainer' },
  ];
  const { data: facultyList } = await supabase.from('faculty').insert(facultyRows).select();
  const [fAI1,fAI2,fAI3,fCS1,fCS2,fCS3,fEC1,fEC2,fME1,fME2,fCE1,fCE2] = facultyList;
  console.log('✅ Faculty created');

  // ── Courses ────────────────────────────────────────────────────────────
  const courseRows = [
    { name: 'Machine Learning Fundamentals', code: 'BTAI301', department_id: deptBTAI.id },
    { name: 'Deep Learning & Neural Networks', code: 'BTAI302', department_id: deptBTAI.id },
    { name: 'Data Structures & Algorithms', code: 'BCS201', department_id: deptBCS.id },
    { name: 'Database Systems & Cloud', code: 'BCS302', department_id: deptBCS.id },
    { name: 'Operating Systems', code: 'BCS303', department_id: deptBCS.id },
    { name: 'Signal Processing', code: 'BTEC301', department_id: deptBTEC.id },
    { name: 'VLSI Design', code: 'BTEC401', department_id: deptBTEC.id },
    { name: 'Thermodynamics', code: 'BTME201', department_id: deptBTME.id },
    { name: 'Fluid Mechanics', code: 'BTME301', department_id: deptBTME.id },
    { name: 'Structural Analysis', code: 'BTCE201', department_id: deptBTCE.id },
    { name: 'Environmental Engineering', code: 'BTCE301', department_id: deptBTCE.id },
  ];
  const { data: courseList } = await supabase.from('courses').insert(courseRows).select();
  const [cAI1,cAI2,cCS1,cCS2,cCS3,cEC1,cEC2,cME1,cME2,cCE1,cCE2] = courseList;
  console.log('✅ Courses created');

  // ── Sections ───────────────────────────────────────────────────────────
  const sectionRows = [
    { name: 'BTAI-3A', code: 'BTAI3A', semester: 3, label: 'A', department_id: deptBTAI.id },
    { name: 'BTAI-3B', code: 'BTAI3B', semester: 3, label: 'B', department_id: deptBTAI.id },
    { name: 'BTAI-5A', code: 'BTAI5A', semester: 5, label: 'A', department_id: deptBTAI.id },
    { name: 'BTAI-5B', code: 'BTAI5B', semester: 5, label: 'B', department_id: deptBTAI.id },
    { name: 'BCS-3A', code: 'BCS3A', semester: 3, label: 'A', department_id: deptBCS.id },
    { name: 'BCS-3B', code: 'BCS3B', semester: 3, label: 'B', department_id: deptBCS.id },
    { name: 'BCS-5A', code: 'BCS5A', semester: 5, label: 'A', department_id: deptBCS.id },
    { name: 'BCS-5B', code: 'BCS5B', semester: 5, label: 'B', department_id: deptBCS.id },
    { name: 'BTEC-3A', code: 'BTEC3A', semester: 3, label: 'A', department_id: deptBTEC.id },
    { name: 'BTEC-3B', code: 'BTEC3B', semester: 3, label: 'B', department_id: deptBTEC.id },
    { name: 'BTME-3A', code: 'BTME3A', semester: 3, label: 'A', department_id: deptBTME.id },
    { name: 'BTME-3B', code: 'BTME3B', semester: 3, label: 'B', department_id: deptBTME.id },
    { name: 'BTCE-3A', code: 'BTCE3A', semester: 3, label: 'A', department_id: deptBTCE.id },
    { name: 'BTCE-3B', code: 'BTCE3B', semester: 3, label: 'B', department_id: deptBTCE.id },
  ];
  const { data: sectionList } = await supabase.from('sections').insert(sectionRows).select();
  const [sAI_3A,sAI_3B,sAI_5A,sAI_5B,sCS_3A,sCS_3B,sCS_5A,sCS_5B,sEC_3A,sEC_3B,sME_3A,sME_3B,sCE_3A,sCE_3B] = sectionList;
  console.log('✅ Sections created');

  // ── SectionFaculty assignments ─────────────────────────────────────────
  const sfRows = [
    { section_id: sAI_3A.id, faculty_id: fAI1.id, course_id: cAI1.id },
    { section_id: sAI_3A.id, faculty_id: fAI2.id, course_id: cAI2.id },
    { section_id: sAI_3B.id, faculty_id: fAI2.id, course_id: cAI1.id },
    { section_id: sAI_3B.id, faculty_id: fAI3.id, course_id: cAI2.id },
    { section_id: sAI_5A.id, faculty_id: fAI3.id, course_id: cAI1.id },
    { section_id: sAI_5B.id, faculty_id: fAI1.id, course_id: cAI2.id },
    { section_id: sCS_3A.id, faculty_id: fCS1.id, course_id: cCS1.id },
    { section_id: sCS_3A.id, faculty_id: fCS2.id, course_id: cCS2.id },
    { section_id: sCS_3B.id, faculty_id: fCS2.id, course_id: cCS1.id },
    { section_id: sCS_3B.id, faculty_id: fCS3.id, course_id: cCS2.id },
    { section_id: sCS_5A.id, faculty_id: fCS1.id, course_id: cCS3.id },
    { section_id: sCS_5B.id, faculty_id: fCS3.id, course_id: cCS3.id },
    { section_id: sEC_3A.id, faculty_id: fEC1.id, course_id: cEC1.id },
    { section_id: sEC_3A.id, faculty_id: fEC2.id, course_id: cEC2.id },
    { section_id: sEC_3B.id, faculty_id: fEC1.id, course_id: cEC2.id },
    { section_id: sME_3A.id, faculty_id: fME1.id, course_id: cME1.id },
    { section_id: sME_3A.id, faculty_id: fME2.id, course_id: cME2.id },
    { section_id: sME_3B.id, faculty_id: fME2.id, course_id: cME1.id },
    { section_id: sCE_3A.id, faculty_id: fCE1.id, course_id: cCE1.id },
    { section_id: sCE_3A.id, faculty_id: fCE2.id, course_id: cCE2.id },
    { section_id: sCE_3B.id, faculty_id: fCE1.id, course_id: cCE2.id },
  ];
  const { data: sfData } = await supabase.from('section_faculty').insert(sfRows).select();
  console.log('✅ Section-Faculty assignments created');

  // ── Students ───────────────────────────────────────────────────────────
  const firstNames = ['Aarav','Aditya','Akash','Alok','Amit','Ananya','Anjali','Ankur','Anuj','Arjun',
    'Aryan','Ayush','Deepak','Divya','Gaurav','Ishaan','Kavya','Kunal','Manish','Meera',
    'Mohit','Neha','Nikhil','Pallavi','Pooja','Priya','Rahul','Raj','Ravi','Rohit',
    'Sachin','Sanjay','Shreya','Shubham','Simran','Sonal','Sumit','Suresh','Tanmay','Tanvi',
    'Tushar','Uday','Varun','Vidya','Vikram','Virat','Vishal','Yash','Zara','Karan'];
  const lastNames = ['Agarwal','Bhatia','Chaudhary','Dubey','Gupta','Jain','Joshi','Kumar','Mehta','Mishra',
    'Pandey','Patel','Rao','Sharma','Singh','Srivastava','Tiwari','Verma','Yadav','Chauhan'];

  const sectionGroups = [
    { dept: deptBTAI, section: sAI_3A, code: 'BTAI', count: 6, semester: 3 },
    { dept: deptBTAI, section: sAI_3B, code: 'BTAI', count: 6, semester: 3 },
    { dept: deptBTAI, section: sAI_5A, code: 'BTAI', count: 5, semester: 5 },
    { dept: deptBTAI, section: sAI_5B, code: 'BTAI', count: 5, semester: 5 },
    { dept: deptBCS, section: sCS_3A, code: 'BCS', count: 7, semester: 3 },
    { dept: deptBCS, section: sCS_3B, code: 'BCS', count: 7, semester: 3 },
    { dept: deptBCS, section: sCS_5A, code: 'BCS', count: 5, semester: 5 },
    { dept: deptBCS, section: sCS_5B, code: 'BCS', count: 5, semester: 5 },
    { dept: deptBTEC, section: sEC_3A, code: 'BTEC', count: 8, semester: 3 },
    { dept: deptBTEC, section: sEC_3B, code: 'BTEC', count: 8, semester: 3 },
    { dept: deptBTME, section: sME_3A, code: 'BTME', count: 8, semester: 3 },
    { dept: deptBTME, section: sME_3B, code: 'BTME', count: 8, semester: 3 },
    { dept: deptBTCE, section: sCE_3A, code: 'BTCE', count: 8, semester: 3 },
    { dept: deptBTCE, section: sCE_3B, code: 'BTCE', count: 8, semester: 3 },
  ];

  const stdPassword = await bcrypt.hash('Student@2025', 10);
  let globalIdx = 0;
  const deptStudentCounters = {};

  for (const { dept, section, code, count, semester } of sectionGroups) {
    if (!deptStudentCounters[code]) deptStudentCounters[code] = 1;

    const studentBatch = [];
    for (let i = 0; i < count; i++) {
      const num = String(deptStudentCounters[code]).padStart(2, '0');
      const studentId = `${code}2025_${num}`;
      const fn = firstNames[globalIdx % firstNames.length];
      const ln = lastNames[(globalIdx + 3) % lastNames.length];
      const isActiveDemo = (i === 0);
      const fbId = generateFeedbackId();

      studentBatch.push({
        name: `${fn} ${ln}`,
        email: isActiveDemo ? `${studentId.toLowerCase().replace('_', '.')}@iu.edu.in` : null,
        password: isActiveDemo ? stdPassword : null,
        role: 'student',
        status: isActiveDemo ? 'active' : 'pending',
        department_id: dept.id,
        section_id: section.id,
        semester,
        student_id: studentId,
        unique_feedback_id: fbId,
        points: Math.floor(Math.random() * 50),
        batch: '2025'
      });

      deptStudentCounters[code]++;
      globalIdx++;
    }

    const { data: createdStudents } = await supabase.from('users').insert(studentBatch).select();

    // Enroll students in section courses
    const { data: sfAssignments } = await supabase.from('section_faculty').select('course_id').eq('section_id', section.id);
    const courseIds = [...new Set((sfAssignments || []).map(sf => sf.course_id))];
    const enrollmentBatch = [];
    for (const student of (createdStudents || [])) {
      for (const courseId of courseIds) {
        enrollmentBatch.push({ student_id: student.id, course_id: courseId, section_id: section.id });
      }
    }
    if (enrollmentBatch.length > 0) {
      await supabase.from('enrollments').insert(enrollmentBatch);
    }
  }
  console.log('✅ Students created and enrolled');

  // ── Seed TLFQs ─────────────────────────────────────────────────────────
  const stdQuestions = [
    'The instructor explains course material clearly and effectively.',
    'The instructor is responsive to questions during and outside of class.',
    'The assignments and projects contribute significantly to my learning.',
    'The course content is relevant and up-to-date.',
    'The instructor is well-prepared for every lecture.',
    'Overall, I would rate this instructor\'s effectiveness as high.',
  ];
  const closingDate = new Date();
  closingDate.setDate(closingDate.getDate() + 7);

  for (const sf of sfData) {
    const { data: section } = await supabase.from('sections').select('name, department_id').eq('id', sf.section_id).single();
    if (!section) continue;
    const { data: course } = await supabase.from('courses').select('code').eq('id', sf.course_id).single();
    const hodForDept = hods.find(h => h.department_id === section.department_id);
    if (!hodForDept) continue;

    const { data: tlfq } = await supabase.from('tlfqs').insert({
      section_id: sf.section_id, course_id: sf.course_id, faculty_id: sf.faculty_id,
      title: `${section.name} — ${course.code} Feedback`,
      is_active: true, closing_time: closingDate.toISOString(),
      created_by: hodForDept.id
    }).select().single();

    await supabase.from('questions').insert(
      stdQuestions.map(q => ({ tlfq_id: tlfq.id, question_text: q }))
    );
  }
  console.log('✅ TLFQs and questions created');

  console.log('\n🎉 Seeding completed! Full structured data across 5 departments.');
  console.log('\n📋 Login Credentials:');
  console.log('   Supreme:     supauth1@invertis.edu.in / Super@123');
  console.log('   Admin:       admin@invertis.edu.in / Admin@2025');
  console.log('   Coordinator: coordinator@invertis.edu.in / Coord@2025');
  console.log('   HOD (BTAI):  hod.btai@invertis.edu.in / Hod@2025');
  console.log('   HOD (BCS):   hod.bcs@invertis.edu.in / Hod@2025');
  console.log('   Student:     BTAI2025_01 / Student@2025 (or any *2025_01 ID)');
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
