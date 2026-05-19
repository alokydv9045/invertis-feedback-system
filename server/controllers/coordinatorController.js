import { Department, Section, Course, Faculty, SectionFaculty, User, Enrollment, Tlfq } from '../db.js';
import bcrypt from 'bcryptjs';

// ── Departments ────────────────────────────────────────────────────────────
export const getDepartments = async (req, res) => {
  try {
    const depts = await Department.findMany();
    return res.json(depts);
  } catch (err) { 
    console.error('getDepartments error:', err); 
    return res.status(500).json({ message: 'Internal Server Error' }); 
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, max_semester } = req.body;
    if (!name || !code) return res.status(400).json({ message: 'name and code required' });
    const dept = await Department.create({ 
      data: { 
        name, 
        code, 
        max_semester: max_semester ? Number(max_semester) : 8 
      } 
    });
    return res.status(201).json(dept);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'Department with that name/code already exists.' });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    await Department.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Department deleted' });
  } catch (err) { 
    console.error('deleteDepartment error:', err); 
    return res.status(500).json({ message: 'Internal Server Error' }); 
  }
};

// ── Sections ───────────────────────────────────────────────────────────────
export const getSections = async (req, res) => {
  try {
    const { department_id } = req.query;
    const where = department_id ? { department_id } : {};
    
    const sections = await Section.findMany({
      where,
      include: {
        department: true,
        sectionFaculty: {
          include: {
            faculty: true,
            course: true
          }
        }
      }
    });

    const result = sections.map(sec => ({
      ...sec,
      department_name: sec.department?.name,
      assignments: sec.sectionFaculty.map(sf => ({
        id: sf.id,
        faculty_name: sf.faculty?.name,
        course_name: sf.course?.name,
        course_code: sf.course?.code,
        faculty_id: sf.faculty_id,
        course_id: sf.course_id
      }))
    }));
    
    return res.json(result);
  } catch (err) { 
    console.error('getSections error:', err); 
    return res.status(500).json({ message: 'Internal Server Error' }); 
  }
};

export const createSection = async (req, res) => {
  try {
    const { department_id, semester, label } = req.body;
    if (!department_id || !semester || !label) return res.status(400).json({ message: 'department_id, semester, label required' });
    
    const dept = await Department.findUnique({ where: { id: department_id } });
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    
    const name = `${dept.code}-${semester}${label.toUpperCase()}`;
    const code = `${dept.code}${semester}${label.toUpperCase()}`;
    
    const existing = await Section.findFirst({ where: { code } });
    if (existing) return res.status(400).json({ message: 'Section already exists.' });
    
    const section = await Section.create({
      data: {
        name,
        code,
        semester: Number(semester),
        label: label.toUpperCase(),
        department_id
      },
      include: {
        department: true,
        sectionFaculty: {
          include: {
            faculty: true,
            course: true
          }
        }
      }
    });

    return res.status(201).json({
      ...section,
      department_name: section.department?.name,
      assignments: []
    });
  } catch (err) {
    console.error('createSection error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const id = req.params.id;
    await Tlfq.updateMany({ where: { section_id: id }, data: { is_active: false } });
    await Enrollment.deleteMany({ where: { section_id: id } });
    await User.updateMany({ where: { section_id: id }, data: { section_id: null } });
    await SectionFaculty.deleteMany({ where: { section_id: id } });
    await Section.delete({ where: { id } });
    return res.json({ message: 'Section deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Courses ────────────────────────────────────────────────────────────────
export const getCourses = async (req, res) => {
  try {
    const { department_id } = req.query;
    const where = department_id ? { department_id } : {};
    
    const courses = await Course.findMany({
      where,
      include: { department: true }
    });

    const result = courses.map(c => ({
      ...c,
      department_name: c.department?.name
    }));
    
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { name, code, department_id } = req.body;
    if (!name || !code || !department_id) return res.status(400).json({ message: 'name, code, department_id required' });
    const course = await Course.create({ data: { name, code, department_id } });
    return res.status(201).json(course);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'Course code already exists.' });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const id = req.params.id;
    await SectionFaculty.deleteMany({ where: { course_id: id } });
    await Course.delete({ where: { id } });
    return res.json({ message: 'Course deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Faculty ────────────────────────────────────────────────────────────────
export const getFaculty = async (req, res) => {
  try {
    const { department_id } = req.query;
    const where = department_id ? { department_id } : {};
    
    const faculty = await Faculty.findMany({
      where,
      include: { department: true }
    });

    const result = faculty.map(f => ({
      ...f,
      department_name: f.department?.name
    }));
    
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createFaculty = async (req, res) => {
  try {
    const { name, department_id, teacher_type } = req.body;
    if (!name || !department_id) return res.status(400).json({ message: 'name and department_id required' });
    
    const faculty = await Faculty.create({ 
      data: { 
        name, 
        department_id, 
        teacher_type: teacher_type || 'college_faculty' 
      } 
    });
    return res.status(201).json(faculty);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const id = req.params.id;
    await SectionFaculty.deleteMany({ where: { faculty_id: id } });
    await Faculty.delete({ where: { id } });
    return res.json({ message: 'Faculty deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Section-Faculty assignments ─────────────────────────────────────────────
export const assignFacultyToSection = async (req, res) => {
  try {
    const { section_id, faculty_id, course_id } = req.body;
    if (!section_id || !faculty_id || !course_id) return res.status(400).json({ message: 'section_id, faculty_id, course_id required' });
    
    const existing = await SectionFaculty.findFirst({
      where: { section_id, faculty_id, course_id }
    });
    if (existing) return res.status(400).json({ message: 'Assignment already exists.' });
    
    const sf = await SectionFaculty.create({ 
      data: { section_id, faculty_id, course_id } 
    });
    return res.status(201).json(sf);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const removeAssignment = async (req, res) => {
  try {
    await SectionFaculty.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Assignment removed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Students ───────────────────────────────────────────────────────────────
export const getStudents = async (req, res) => {
  try {
    const { department_id, section_id, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = { role: 'student' };
    if (department_id) where.department_id = department_id;
    if (section_id)    where.section_id    = section_id;
    
    const [students, total] = await Promise.all([
      User.findMany({
        where,
        include: { section: true },
        skip,
        take,
        orderBy: { name: 'asc' }
      }),
      User.count({ where })
    ]);

    const result = students.map(s => ({
      id: s.id, 
      name: s.name, 
      email: s.email,
      student_id: s.student_id, 
      status: s.status, 
      semester: s.semester,
      batch: s.batch, 
      points: s.points,
      unique_feedback_id: s.unique_feedback_id || null,
      section_name: s.section?.name || '—',
      section_id: s.section_id
    }));
    
    return res.json({
      students: result,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const preCreateStudent = async (req, res) => {
  try {
    const { name, student_id, department_id, section_id, semester, batch } = req.body;
    if (!name || !student_id || !department_id || !section_id || !semester) {
      return res.status(400).json({ message: 'name, student_id, department_id, section_id, semester required' });
    }
    
    const normalizedId = student_id.trim().toUpperCase();
    const exists = await User.findFirst({ where: { student_id: normalizedId } });
    if (exists) return res.status(400).json({ message: 'Student ID already exists.' });

    const student = await User.create({
      data: {
        name, 
        student_id: normalizedId, 
        department_id, 
        section_id,
        semester: Number(semester), 
        batch: batch || new Date().getFullYear().toString(),
        role: 'student', 
        status: 'pending'
      }
    });

    // Auto-enroll in section courses
    const sfList = await SectionFaculty.findMany({ where: { section_id } });
    const courseIds = [...new Set(sfList.map(sf => sf.course_id))];
    
    if (courseIds.length > 0) {
      await Enrollment.createMany({
        data: courseIds.map(courseId => ({
          student_id: student.id,
          course_id: courseId,
          section_id
        })),
        skipDuplicates: true
      });
    }

    return res.status(201).json({ id: student.id, name: student.name, student_id: student.student_id, status: 'pending' });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'Student ID or email already exists.' });
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const resetStudentPassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    
    const hashed = await bcrypt.hash(new_password, 10);
    const student = await User.update({
      where: { id: req.params.id },
      data: { password: hashed }
    });
    
    return res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'section_id', 'semester', 'batch', 'department_id'];
    const data = {};
    for (const key of allowed) { if (req.body[key] !== undefined) data[key] = req.body[key]; }
    
    const student = await User.update({
      where: { id: req.params.id },
      data
    });
    
    return res.json(student);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const bulkImportStudents = async (req, res) => {
  try {
    const { students } = req.body;
    if (!students || !Array.isArray(students)) return res.status(400).json({ message: 'Invalid payload. "students" array required.' });
    if (students.length > 1000) return res.status(400).json({ message: 'Maximum 1000 students per import batch.' });

    const results = { success: 0, failed: 0, errors: [] };

    // Pre-validate and normalize all student IDs
    const normalizedStudents = students.map(s => ({
      ...s,
      student_id: s.student_id?.toString().trim().toUpperCase()
    }));

    // Batch check: get all existing student IDs in one query
    const allInputIds = normalizedStudents.map(s => s.student_id).filter(Boolean);
    const existingUsers = await User.findMany({
      where: { student_id: { in: allInputIds } },
      select: { student_id: true }
    });
    const existingIdSet = new Set(existingUsers.map(u => u.student_id));

    // Pre-fetch section-faculty map (one query instead of N)
    const uniqueSectionIds = [...new Set(normalizedStudents.map(s => s.section_id).filter(Boolean))];
    const allSectionFaculty = await SectionFaculty.findMany({
      where: { section_id: { in: uniqueSectionIds } },
      select: { section_id: true, course_id: true }
    });
    const sectionCourseMap = {};
    for (const sf of allSectionFaculty) {
      if (!sectionCourseMap[sf.section_id]) sectionCourseMap[sf.section_id] = new Set();
      sectionCourseMap[sf.section_id].add(sf.course_id);
    }

    // Process students — create individually but skip expensive lookups
    for (const s of normalizedStudents) {
      try {
        const { name, student_id, department_id, section_id, semester, batch } = s;
        if (!name || !student_id || !department_id || !section_id || !semester) {
          results.failed++;
          results.errors.push(`${student_id || 'Unknown'}: Missing required fields`);
          continue;
        }

        if (existingIdSet.has(student_id)) {
          results.failed++;
          results.errors.push(`${student_id}: Already exists`);
          continue;
        }

        const student = await User.create({
          data: {
            name,
            student_id,
            department_id,
            section_id,
            semester: Number(semester),
            batch: batch?.toString() || new Date().getFullYear().toString(),
            role: 'student',
            status: 'pending'
          }
        });

        // Auto-enroll using pre-fetched map (0 additional queries)
        const courseIds = sectionCourseMap[section_id];
        if (courseIds && courseIds.size > 0) {
          await Enrollment.createMany({
            data: [...courseIds].map(courseId => ({
              student_id: student.id,
              course_id: courseId,
              section_id
            })),
            skipDuplicates: true
          });
        }

        existingIdSet.add(student_id); // Prevent duplicates within same batch
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Error importing ${s.student_id || 'Unknown'}: ${err.message}`);
      }
    }

    return res.json({ 
      message: `Import complete. ${results.success} students added.`,
      results 
    });
  } catch (err) {
    console.error('Bulk import error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
