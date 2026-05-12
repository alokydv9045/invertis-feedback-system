import { supabase } from '../db.js';
import bcrypt from 'bcryptjs';

// ── Helper: get section with populated data ────────────────────────────────
async function populateSection(sec) {
  const { data: dept } = await supabase.from('departments').select('name').eq('id', sec.department_id).single();
  const { data: assignments } = await supabase.from('section_faculty').select('*').eq('section_id', sec.id);
  const enriched = await Promise.all((assignments || []).map(async sf => {
    const { data: faculty } = await supabase.from('faculty').select('name').eq('id', sf.faculty_id).single();
    const { data: course } = await supabase.from('courses').select('name, code').eq('id', sf.course_id).single();
    return { id: sf.id, faculty_name: faculty?.name, course_name: course?.name, course_code: course?.code, faculty_id: sf.faculty_id, course_id: sf.course_id };
  }));
  return { ...sec, department_name: dept?.name, assignments: enriched };
}

// ── Departments ────────────────────────────────────────────────────────────
export const getDepartments = async (req, res) => {
  try {
    const { data, error } = await supabase.from('departments').select('*');
    if (error) throw error;
    return res.json(data);
  } catch (err) { console.error('getDepartments error:', err); return res.status(500).json({ message: 'Internal Server Error' }); }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ message: 'name and code required' });
    const { data, error } = await supabase.from('departments').insert({ name, code }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(400).json({ message: 'Department with that name/code already exists.' });
      throw error;
    }
    return res.status(201).json(data);
  } catch (err) { return res.status(500).json({ message: 'Internal Server Error' }); }
};

export const deleteDepartment = async (req, res) => {
  try {
    await supabase.from('departments').delete().eq('id', req.params.id);
    return res.json({ message: 'Department deleted' });
  } catch (err) { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── Sections ───────────────────────────────────────────────────────────────
export const getSections = async (req, res) => {
  try {
    const { department_id } = req.query;
    let query = supabase.from('sections').select('*');
    if (department_id) query = query.eq('department_id', department_id);
    const { data, error } = await query;
    if (error) throw error;
    const result = await Promise.all(data.map(populateSection));
    return res.json(result);
  } catch (err) { return res.status(500).json({ message: 'Internal Server Error' }); }
};

export const createSection = async (req, res) => {
  try {
    const { department_id, semester, label } = req.body;
    if (!department_id || !semester || !label) return res.status(400).json({ message: 'department_id, semester, label required' });
    const { data: dept } = await supabase.from('departments').select('code').eq('id', department_id).single();
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const name = `${dept.code}-${semester}${label.toUpperCase()}`;
    const code = `${dept.code}${semester}${label.toUpperCase()}`;
    const { data: existing } = await supabase.from('sections').select('id').eq('code', code).single();
    if (existing) return res.status(400).json({ message: 'Section already exists.' });
    const { data, error } = await supabase.from('sections').insert({ name, code, semester: Number(semester), label: label.toUpperCase(), department_id }).select().single();
    if (error) throw error;
    return res.status(201).json(await populateSection(data));
  } catch (err) { console.error('createSection error:', err); return res.status(500).json({ message: 'Internal Server Error' }); }
};

export const deleteSection = async (req, res) => {
  try {
    await supabase.from('section_faculty').delete().eq('section_id', req.params.id);
    await supabase.from('sections').delete().eq('id', req.params.id);
    return res.json({ message: 'Section deleted' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── Courses ────────────────────────────────────────────────────────────────
export const getCourses = async (req, res) => {
  try {
    const { department_id } = req.query;
    let query = supabase.from('courses').select('*');
    if (department_id) query = query.eq('department_id', department_id);
    const { data, error } = await query;
    if (error) throw error;
    const result = await Promise.all(data.map(async c => {
      const { data: dept } = await supabase.from('departments').select('name').eq('id', c.department_id).single();
      return { ...c, department_name: dept?.name };
    }));
    return res.json(result);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

export const createCourse = async (req, res) => {
  try {
    const { name, code, department_id } = req.body;
    if (!name || !code || !department_id) return res.status(400).json({ message: 'name, code, department_id required' });
    const { data, error } = await supabase.from('courses').insert({ name, code, department_id }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(400).json({ message: 'Course code already exists.' });
      throw error;
    }
    return res.status(201).json(data);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

export const deleteCourse = async (req, res) => {
  try {
    await supabase.from('section_faculty').delete().eq('course_id', req.params.id);
    await supabase.from('courses').delete().eq('id', req.params.id);
    return res.json({ message: 'Course deleted' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── Faculty ────────────────────────────────────────────────────────────────
export const getFaculty = async (req, res) => {
  try {
    const { department_id } = req.query;
    let query = supabase.from('faculty').select('*');
    if (department_id) query = query.eq('department_id', department_id);
    const { data, error } = await query;
    if (error) throw error;
    const result = await Promise.all(data.map(async f => {
      const { data: dept } = await supabase.from('departments').select('name').eq('id', f.department_id).single();
      return { ...f, department_name: dept?.name };
    }));
    return res.json(result);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

export const createFaculty = async (req, res) => {
  try {
    const { name, department_id, teacher_type } = req.body;
    if (!name || !department_id) return res.status(400).json({ message: 'name and department_id required' });
    const validTypes = ['college_faculty', 'trainer'];
    const type = validTypes.includes(teacher_type) ? teacher_type : 'college_faculty';
    const { data, error } = await supabase.from('faculty').insert({ name, department_id, teacher_type: type }).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

export const deleteFaculty = async (req, res) => {
  try {
    await supabase.from('section_faculty').delete().eq('faculty_id', req.params.id);
    await supabase.from('faculty').delete().eq('id', req.params.id);
    return res.json({ message: 'Faculty deleted' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── Section-Faculty assignments ─────────────────────────────────────────────
export const assignFacultyToSection = async (req, res) => {
  try {
    const { section_id, faculty_id, course_id } = req.body;
    if (!section_id || !faculty_id || !course_id) return res.status(400).json({ message: 'section_id, faculty_id, course_id required' });
    const { data: existing } = await supabase.from('section_faculty').select('id').eq('section_id', section_id).eq('faculty_id', faculty_id).eq('course_id', course_id).single();
    if (existing) return res.status(400).json({ message: 'Assignment already exists.' });
    const { data, error } = await supabase.from('section_faculty').insert({ section_id, faculty_id, course_id }).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

export const removeAssignment = async (req, res) => {
  try {
    await supabase.from('section_faculty').delete().eq('id', req.params.id);
    return res.json({ message: 'Assignment removed' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── Students ───────────────────────────────────────────────────────────────
export const getStudents = async (req, res) => {
  try {
    const { department_id, section_id } = req.query;
    let query = supabase.from('users').select('*').eq('role', 'student');
    if (department_id) query = query.eq('department_id', department_id);
    if (section_id) query = query.eq('section_id', section_id);
    const { data: students, error } = await query;
    if (error) throw error;
    const result = await Promise.all(students.map(async s => {
      let section_name = '—';
      if (s.section_id) {
        const { data: sec } = await supabase.from('sections').select('name').eq('id', s.section_id).single();
        section_name = sec?.name || '—';
      }
      return {
        id: s.id, name: s.name, email: s.email,
        student_id: s.student_id, status: s.status, semester: s.semester,
        batch: s.batch, points: s.points,
        unique_feedback_id: s.unique_feedback_id || null,
        section_name, section_id: s.section_id || null
      };
    }));
    return res.json(result);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

export const preCreateStudent = async (req, res) => {
  try {
    const { name, student_id, department_id, section_id, semester, batch } = req.body;
    if (!name || !student_id || !department_id || !section_id || !semester) {
      return res.status(400).json({ message: 'name, student_id, department_id, section_id, semester required' });
    }
    const normalizedId = student_id.trim().toUpperCase();
    const { data: exists } = await supabase.from('users').select('id').eq('student_id', normalizedId).single();
    if (exists) return res.status(400).json({ message: 'Student ID already exists.' });

    const { data: student, error } = await supabase.from('users').insert({
      name, student_id: normalizedId, department_id, section_id,
      semester: Number(semester), batch: batch || new Date().getFullYear().toString(),
      role: 'student', status: 'pending', email: null, password: null
    }).select().single();
    if (error) throw error;

    // Auto-enroll in section courses
    const { data: sfList } = await supabase.from('section_faculty').select('course_id').eq('section_id', section_id);
    const courseIds = [...new Set((sfList || []).map(sf => sf.course_id))];
    for (const courseId of courseIds) {
      await supabase.from('enrollments').insert({ student_id: student.id, course_id: courseId, section_id });
    }

    return res.status(201).json({ id: student.id, name: student.name, student_id: student.student_id, status: 'pending' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const resetStudentPassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    const hashed = await bcrypt.hash(new_password, 10);
    const { data, error } = await supabase.from('users').update({ password: hashed }).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ message: 'Student not found.' });
    return res.json({ message: 'Password reset successfully.' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

export const updateStudent = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'section_id', 'semester', 'batch', 'department_id'];
    const updates = {};
    for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
    const { data, error } = await supabase.from('users').update(updates).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ message: 'Student not found.' });
    return res.json({ id: data.id, ...updates });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};
