
const BASE_URL = 'http://localhost:5000/api';

async function testApi() {
  console.log('🚀 Starting Deep API Test...\n');

  // 1. Test Admin Login
  console.log('--- Testing Admin Login ---');
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@invertis.edu.in', password: 'Admin@2025' })
  });
  const adminData = await adminLogin.json();
  if (adminLogin.status === 200 && adminData.token) {
    console.log('✅ Admin Login: SUCCESS');
  } else {
    console.error('❌ Admin Login: FAILED', adminData);
    return;
  }
  const adminToken = adminData.token;

  // 2. Test Admin Stats
  console.log('\n--- Testing Admin Stats API ---');
  const statsRes = await fetch(`${BASE_URL}/tlfq/stats`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const stats = await statsRes.json();
  if (statsRes.status === 200 && stats.totalStudents >= 50) {
    console.log(`✅ Admin Stats: SUCCESS (Students: ${stats.totalStudents}, Courses: ${stats.totalCourses})`);
  } else {
    console.error('❌ Admin Stats: FAILED', stats);
  }

  // 3. Test Student List Scoping (Admin)
  console.log('\n--- Testing Student List (Admin) ---');
  const studentListRes = await fetch(`${BASE_URL}/users/students`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const students = await studentListRes.json();
  if (studentListRes.status === 200 && Array.isArray(students)) {
    console.log(`✅ Admin Student List: SUCCESS (${students.length} students found)`);
  } else {
    console.error('❌ Admin Student List: FAILED', students);
  }

  // 4. Test HOD Login & Scoping
  console.log('\n--- Testing HOD Login ---');
  const hodLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'hod.bcs@invertis.edu.in', password: 'Hod@2025' })
  });
  const hodData = await hodLogin.json();
  if (hodLogin.status === 200) {
    console.log('✅ HOD Login: SUCCESS');
  } else {
    console.error('❌ HOD Login: FAILED');
  }
  const hodToken = hodData.token;

  // 5. Test HOD Student Scoping
  console.log('\n--- Testing HOD Student List Scoping ---');
  const hodStudentsRes = await fetch(`${BASE_URL}/users/students`, {
    headers: { 'Authorization': `Bearer ${hodToken}` }
  });
  const hodStudents = await hodStudentsRes.json();
  const allDeptCse = hodStudents.every(s => s.department_name.includes('Computer Science'));
  if (hodStudentsRes.status === 200 && allDeptCse) {
    console.log('✅ HOD Scoping: SUCCESS (HOD only sees their department students)');
  } else {
    console.error('❌ HOD Scoping: FAILED or MISMATCH', { count: hodStudents.length, allDeptCse });
  }

  // 6. Test Student Login (by College ID)
  console.log('\n--- Testing Student Login (by College ID) ---');
  const studentLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'BCS2025_01', password: 'Student@2025' })
  });
  const studentData = await studentLogin.json();
  if (studentLogin.status === 200) {
    console.log('✅ Student Login: SUCCESS');
  } else {
    console.error('❌ Student Login: FAILED');
  }
  const studentToken = studentData.token;

  // 7. Test Student Course Access
  console.log('\n--- Testing Student Course Access ---');
  const coursesRes = await fetch(`${BASE_URL}/tlfq/courses`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const courses = await coursesRes.json();
  if (coursesRes.status === 200 && Array.isArray(courses)) {
    console.log(`✅ Student Courses: SUCCESS (${courses.length} courses found)`);
  } else {
    console.error('❌ Student Courses: FAILED');
  }

  console.log('\n🏁 Deep API Test Completed.');
}

testApi();
