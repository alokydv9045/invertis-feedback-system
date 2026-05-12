import { supabase } from '../db.js';

// ── GET /api/tlfq/departments
export const getDepartments = async (req, res) => {
  try {
    const { data, error } = await supabase.from('departments').select('*');
    if (error) throw error;
    return res.status(200).json(data || []);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── POST /api/tlfq/departments
export const createDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ message: 'Name and code are required' });
    const { data, error } = await supabase.from('departments').insert({ name, code }).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── DELETE /api/tlfq/departments/:id
export const deleteDepartment = async (req, res) => {
  try {
    await supabase.from('departments').delete().eq('id', req.params.id);
    return res.status(200).json({ message: 'Department deleted' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── PUT /api/tlfq/departments/:id/portal
export const togglePortal = async (req, res) => {
  try {
    const { open } = req.body;
    const { role, department_id } = req.user;
    if (role === 'hod' && req.params.id !== department_id) {
      return res.status(403).json({ message: 'You can only manage your own department portal' });
    }
    const { data: dept, error } = await supabase.from('departments').update({ portal_open: !!open }).eq('id', req.params.id).select().single();
    if (error || !dept) return res.status(404).json({ message: 'Department not found' });
    return res.status(200).json({ portal_open: dept.portal_open, message: `Portal ${dept.portal_open ? 'opened' : 'closed'} successfully` });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── GET /api/tlfq/courses
export const getCourses = async (req, res) => {
  try {
    const { role, id: userId, department_id } = req.user;

    if (role === 'super_admin' || role === 'admin') {
      const { data: courses } = await supabase.from('courses').select('*');
      const result = await Promise.all((courses || []).map(async c => {
        const { data: dept } = await supabase.from('departments').select('name').eq('id', c.department_id).single();
        return { ...c, department_name: dept?.name || 'Unknown' };
      }));
      return res.status(200).json(result);
    }

    if (role === 'hod') {
      const { data: courses } = await supabase.from('courses').select('*').eq('department_id', department_id);
      const result = await Promise.all((courses || []).map(async c => {
        const { data: dept } = await supabase.from('departments').select('name').eq('id', c.department_id).single();
        return { ...c, department_name: dept?.name || 'Unknown' };
      }));
      return res.status(200).json(result);
    }

    // Student
    const { data: enrollments } = await supabase.from('enrollments').select('course_id').eq('student_id', userId);
    const courseIds = (enrollments || []).map(e => e.course_id);
    if (courseIds.length === 0) return res.status(200).json([]);
    const { data: courses } = await supabase.from('courses').select('*').in('id', courseIds);
    const { data: dept } = await supabase.from('departments').select('portal_open').eq('id', department_id).single();

    if (dept && !dept.portal_open) {
      return res.status(200).json({ portal_closed: true, message: 'The feedback portal is currently closed by your HOD.' });
    }

    const { data: student } = await supabase.from('users').select('semester, section_id').eq('id', userId).single();
    const courseData = [];
    const now = new Date().toISOString();
    for (const course of (courses || [])) {
      const { data: tlfqs } = await supabase.from('tlfqs').select('*')
        .eq('course_id', course.id).eq('section_id', student.section_id)
        .eq('is_active', true).gt('closing_time', now);
      const pendingTlfqs = [], completedTlfqs = [];
      for (const tlfq of (tlfqs || [])) {
        const { data: resp } = await supabase.from('responses').select('id').eq('student_id', userId).eq('tlfq_id', tlfq.id).single();
        const { data: faculty } = await supabase.from('faculty').select('name').eq('id', tlfq.faculty_id).single();
        const entry = { ...tlfq, faculty_name: faculty?.name || 'Unknown', completed: !!resp };
        if (resp) completedTlfqs.push(entry); else pendingTlfqs.push(entry);
      }
      courseData.push({ ...course, tlfqs: [...pendingTlfqs, ...completedTlfqs], pending_count: pendingTlfqs.length, completed_count: completedTlfqs.length });
    }
    return res.status(200).json(courseData);
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── POST /api/tlfq/courses
export const createCourse = async (req, res) => {
  try {
    const { name, code, department_id } = req.body;
    if (!name || !code || !department_id) return res.status(400).json({ message: 'name, code, department_id required' });
    const { data, error } = await supabase.from('courses').insert({ name, code, department_id }).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── DELETE /api/tlfq/courses/:id
export const deleteCourse = async (req, res) => {
  try {
    await supabase.from('courses').delete().eq('id', req.params.id);
    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── GET /api/tlfq/faculty
export const getAllFaculty = async (req, res) => {
  try {
    const { role, department_id } = req.user;
    let query = supabase.from('faculty').select('*');
    if (role === 'hod') query = query.eq('department_id', department_id);
    const { data, error } = await query;
    if (error) throw error;
    const result = await Promise.all((data || []).map(async f => {
      const { data: dept } = await supabase.from('departments').select('name').eq('id', f.department_id).single();
      return { ...f, department_name: dept?.name || 'Unknown' };
    }));
    return res.status(200).json(result);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── POST /api/tlfq/faculty
export const createFaculty = async (req, res) => {
  try {
    const { name, department_id } = req.body;
    if (!name || !department_id) return res.status(400).json({ message: 'name and department_id required' });
    const { data, error } = await supabase.from('faculty').insert({ name, department_id }).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── DELETE /api/tlfq/faculty/:id
export const deleteFaculty = async (req, res) => {
  try {
    await supabase.from('faculty').delete().eq('id', req.params.id);
    return res.status(200).json({ message: 'Faculty deleted successfully' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── GET /api/tlfq/courses/:courseId/evaluations
export const getCourseEvaluations = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { data: tlfqs } = await supabase.from('tlfqs').select('*').eq('course_id', courseId);
    const evaluations = await Promise.all((tlfqs || []).map(async tlfq => {
      const { data: faculty } = await supabase.from('faculty').select('name').eq('id', tlfq.faculty_id).single();
      let completed = undefined;
      if (req.user.role === 'student') {
        const { data: resp } = await supabase.from('responses').select('id').eq('student_id', req.user.id).eq('tlfq_id', tlfq.id).single();
        completed = !!resp;
      }
      return { ...tlfq, faculty_name: faculty?.name || 'Unknown', completed };
    }));
    return res.status(200).json(evaluations);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── GET /api/tlfq/courses/:courseId/evaluation/:tlfqId
export const getSpecificEvaluation = async (req, res) => {
  try {
    const { tlfqId } = req.params;
    const { data: tlfq } = await supabase.from('tlfqs').select('*').eq('id', tlfqId).single();
    if (!tlfq) return res.status(404).json({ message: 'Evaluation not found.' });
    const { data: faculty } = await supabase.from('faculty').select('name').eq('id', tlfq.faculty_id).single();
    const { data: course } = await supabase.from('courses').select('name').eq('id', tlfq.course_id).single();
    const { data: questions } = await supabase.from('questions').select('*').eq('tlfq_id', tlfq.id);
    return res.status(200).json({
      ...tlfq, faculty_name: faculty?.name || 'Unknown',
      course_name: course?.name || 'Unknown',
      questions: questions || []
    });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── POST /api/tlfq
export const createTlfq = async (req, res) => {
  try {
    const { course_id, faculty_id, title, question_texts, semester, section, closing_time } = req.body;
    if (!course_id || !faculty_id || !title || !closing_time) {
      return res.status(400).json({ message: 'course_id, faculty_id, title, closing_time required' });
    }
    const { data, error } = await supabase.from('tlfqs').insert({
      course_id, faculty_id, title, is_active: true,
      closing_time: new Date(closing_time).toISOString(),
      section_id: section || null, created_by: req.user.id
    }).select().single();
    if (error) throw error;
    if (question_texts && Array.isArray(question_texts)) {
      const rows = question_texts.filter(q => q).map(q => ({ tlfq_id: data.id, question_text: q }));
      if (rows.length > 0) await supabase.from('questions').insert(rows);
    }
    return res.status(201).json({ id: data.id, message: 'TLFQ created successfully' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── GET /api/tlfq/students
export const getStudents = async (req, res) => {
  try {
    const { role, department_id } = req.user;
    let query = supabase.from('users').select('*').eq('role', 'student');
    if (role === 'hod' || role === 'admin') query = query.eq('department_id', department_id);
    const { data: students } = await query;
    return res.status(200).json((students || []).map(s => ({
      id: s.id,
      name: role === 'super_admin' ? s.name : '— Anonymous —',
      email: role === 'super_admin' ? s.email : '—',
      student_id: s.student_id, unique_feedback_id: s.unique_feedback_id,
      department_id: s.department_id || null, points: s.points, batch: s.batch,
    })));
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── POST /api/tlfq/enrollments
export const createEnrollment = async (req, res) => {
  try {
    const { student_id, course_id } = req.body;
    if (!student_id || !course_id) return res.status(400).json({ message: 'student_id and course_id required' });
    const { data: existing } = await supabase.from('enrollments').select('id').eq('student_id', student_id).eq('course_id', course_id).single();
    if (existing) return res.status(400).json({ message: 'Already enrolled' });
    const { data, error } = await supabase.from('enrollments').insert({ student_id, course_id }).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── GET /api/tlfq/stats
export const getAdminStats = async (req, res) => {
  try {
    const { role, department_id } = req.user;

    let studentsQ = supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student');
    let facultyQ = supabase.from('faculty').select('id', { count: 'exact', head: true });
    let coursesQ = supabase.from('courses').select('id', { count: 'exact', head: true });
    if (role === 'hod') {
      studentsQ = studentsQ.eq('department_id', department_id);
      facultyQ = facultyQ.eq('department_id', department_id);
      coursesQ = coursesQ.eq('department_id', department_id);
    }

    const { count: totalStudents } = await studentsQ;
    const { count: totalFaculty } = await facultyQ;
    const { count: totalCourses } = await coursesQ;
    const { count: totalDepts } = await supabase.from('departments').select('id', { count: 'exact', head: true });
    const { count: totalTlfqs } = await supabase.from('tlfqs').select('id', { count: 'exact', head: true });
    const { count: totalResponses } = await supabase.from('responses').select('id', { count: 'exact', head: true });
    const { count: totalEnrollments } = await supabase.from('enrollments').select('id', { count: 'exact', head: true });
    const completionRate = totalEnrollments > 0 ? Math.round((totalResponses / totalEnrollments) * 100) : 0;

    return res.status(200).json({ totalStudents, totalFaculty, totalCourses, totalDepts, totalTlfqs, totalResponses, completionRate });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── GET /api/tlfq/leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { role, department_id } = req.user;
    let query = supabase.from('users').select('unique_feedback_id, points, batch, department_id, name, student_id')
      .eq('role', 'student').gt('points', 0).order('points', { ascending: false }).limit(50);
    if (role === 'hod') query = query.eq('department_id', department_id);
    const { data: students } = await query;
    return res.status(200).json((students || []).map((s, idx) => ({
      rank: idx + 1,
      unique_feedback_id: s.unique_feedback_id || 'ANO-?????',
      points: s.points, batch: s.batch,
      department_id: s.department_id || null,
      name: role === 'super_admin' ? s.name : null,
      student_id: role === 'super_admin' ? s.student_id : null,
    })));
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};
