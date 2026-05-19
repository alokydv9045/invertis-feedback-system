import { Department, Course, Faculty, Enrollment, Tlfq, Question, Response, User } from '../db.js';
import cache from '../cache.js';
import {
  getDepartments, createDepartment, deleteDepartment,
  createCourse, deleteCourse,
  createFaculty, deleteFaculty
} from './coordinatorController.js';

export {
  getDepartments, createDepartment, deleteDepartment,
  createCourse, deleteCourse,
  createFaculty, deleteFaculty
};

// ── PUT /api/tlfq/departments/:id/portal  [hod + super_admin + admin]
export const togglePortal = async (req, res) => {
  try {
    const { open } = req.body;
    const { role, department_id } = req.user;

    if (role === 'hod' && req.params.id !== department_id) {
      return res.status(403).json({ message: 'You can only manage your own department portal' });
    }

    const dept = await Department.update({
      where: { id: req.params.id },
      data: { portal_open: !!open }
    });
    
    return res.status(200).json({ portal_open: dept.portal_open, message: `Portal ${dept.portal_open ? 'opened' : 'closed'} successfully` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── GET /api/tlfq/courses
export const getCourses = async (req, res) => {
  try {
    const { role, id: userId, department_id } = req.user;

    if (role === 'super_admin' || role === 'admin' || role === 'coordinator') {
      const courses = await Course.findMany({
        include: { department: true }
      });
      return res.status(200).json(courses.map(c => ({
        ...c,
        department_name: c.department ? c.department.name : 'Unknown'
      })));
    }

    if (role === 'hod') {
      const courses = await Course.findMany({
        where: { department_id },
        include: { department: true }
      });
      return res.status(200).json(courses.map(c => ({
        ...c,
        department_name: c.department ? c.department.name : 'Unknown'
      })));
    }

    // Student
    const student = await User.findUnique({ where: { id: userId } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const dept = await Department.findUnique({ where: { id: student.department_id } });
    if (dept && !dept.portal_open) {
      return res.status(200).json({ portal_closed: true, message: 'The feedback portal is currently closed by your HOD.' });
    }

    const enrollments = await Enrollment.findMany({ 
      where: { student_id: userId },
      include: { 
        course: {
          include: {
            tlfqs: {
              where: {
                is_active: true,
                closing_time: { gt: new Date() },
                section_id: student.section_id // Filter by student's section
              },
              include: {
                faculty: true,
                responses: {
                  where: { student_id: userId }
                }
              }
            }
          }
        }
      }
    });

    const courseData = enrollments.map(e => {
      const course = e.course;
      const tlfqs = course.tlfqs.map(t => ({
        ...t,
        faculty_name: t.faculty ? t.faculty.name : 'Unknown',
        completed: t.responses.length > 0
      }));

      const pending = tlfqs.filter(t => !t.completed);
      const completed = tlfqs.filter(t => t.completed);

      return {
        ...course,
        tlfqs: [...pending, ...completed],
        pending_count: pending.length,
        completed_count: completed.length
      };
    });

    return res.status(200).json(courseData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── GET /api/tlfq/faculty
export const getAllFaculty = async (req, res) => {
  try {
    const { role, department_id } = req.user;
    const where = (role === 'hod') ? { department_id } : {};
    const facultyList = await Faculty.findMany({
      where,
      include: { department: true }
    });
    return res.status(200).json(facultyList.map(f => ({
      ...f,
      department_name: f.department ? f.department.name : 'Unknown'
    })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── GET /api/tlfq/courses/:courseId/evaluations
export const getCourseEvaluations = async (req, res) => {
  try {
    const { courseId } = req.params;
    const tlfqs = await Tlfq.findMany({
      where: { course_id: courseId },
      include: {
        faculty: true,
        responses: req.user.role === 'student' ? { where: { student_id: req.user.id } } : false
      }
    });

    const evaluations = tlfqs.map(t => ({
      ...t,
      faculty_name: t.faculty ? t.faculty.name : 'Unknown',
      completed: req.user.role === 'student' ? t.responses.length > 0 : undefined
    }));

    return res.status(200).json(evaluations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── GET /api/tlfq/courses/:courseId/evaluation/:tlfqId
export const getSpecificEvaluation = async (req, res) => {
  try {
    const { tlfqId } = req.params;
    const tlfq = await Tlfq.findUnique({
      where: { id: tlfqId },
      include: {
        faculty: true,
        course: true,
        questions: true
      }
    });

    if (!tlfq) return res.status(404).json({ message: 'Evaluation not found.' });

    return res.status(200).json({
      ...tlfq,
      faculty_name: tlfq.faculty ? tlfq.faculty.name : 'Unknown',
      course_name:  tlfq.course  ? tlfq.course.name  : 'Unknown',
      questions: tlfq.questions
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── POST /api/tlfq  [hod + admin + super_admin]
export const createTlfq = async (req, res) => {
  try {
    const { course_id, faculty_id, title, question_texts, section_id, closing_time } = req.body;
    if (!course_id || !faculty_id || !title || !closing_time || !section_id) {
      return res.status(400).json({ message: 'course_id, faculty_id, section_id, title, closing_time required' });
    }

    const tlfq = await Tlfq.create({
      data: {
        course_id,
        faculty_id,
        section_id,
        title,
        is_active: true,
        closing_time: new Date(closing_time),
        created_by: req.user.id
      }
    });

    if (question_texts && Array.isArray(question_texts)) {
      const qData = question_texts
        .filter(text => !!text)
        .map(text => ({ tlfq_id: tlfq.id, question_text: text }));
      
      if (qData.length > 0) {
        await Question.createMany({ data: qData });
      }
    }

    return res.status(201).json({ id: tlfq.id, message: 'TLFQ created successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── GET /api/tlfq/students  [admin + super_admin]
export const getStudents = async (req, res) => {
  try {
    const { role, department_id } = req.user;
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Math.min(Number(limit), 200); // Cap at 200 per page

    const where = { role: 'student' };
    if (role === 'hod' || role === 'admin') where.department_id = department_id;

    const [students, total] = await Promise.all([
      User.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        select: {
          id: true, name: true, email: true, student_id: true,
          unique_feedback_id: true, department_id: true, points: true, batch: true
        }
      }),
      User.count({ where })
    ]);
    
    return res.status(200).json({
      students: students.map(s => ({
        id: s.id,
        name: (role === 'super_admin' || role === 'coordinator') ? s.name : '— Anonymous —',
        email: (role === 'super_admin' || role === 'coordinator') ? s.email : '—',
        student_id: s.student_id,
        unique_feedback_id: s.unique_feedback_id,
        department_id: s.department_id,
        points: s.points,
        batch: s.batch,
      })),
      pagination: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── POST /api/tlfq/enrollments  [super_admin + admin]
export const createEnrollment = async (req, res) => {
  try {
    const { student_id, course_id, section_id } = req.body;
    if (!student_id || !course_id || !section_id) return res.status(400).json({ message: 'student_id, course_id and section_id required' });
    
    const existing = await Enrollment.findFirst({
      where: { student_id, course_id }
    });
    if (existing) return res.status(400).json({ message: 'Already enrolled' });
    
    const result = await Enrollment.create({ 
      data: { student_id, course_id, section_id } 
    });
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── GET /api/tlfq/stats  [admin + super_admin]
export const getAdminStats = async (req, res) => {
  try {
    const { role, department_id } = req.user;
    const deptFilter = (role === 'hod') ? { department_id } : {};

    // Run all 7 count queries in parallel instead of sequentially
    const [totalStudents, totalFaculty, totalCourses, totalDepts, totalTlfqs, totalResponses, totalEnrollments] = await Promise.all([
      User.count({ where: { role: 'student', ...deptFilter } }),
      Faculty.count({ where: deptFilter }),
      Course.count({ where: deptFilter }),
      Department.count(),
      Tlfq.count(),
      Response.count(),
      Enrollment.count()
    ]);
    
    const completionRate = totalEnrollments > 0
      ? Math.round((totalResponses / totalEnrollments) * 100)
      : 0;

    return res.status(200).json({
      totalStudents, totalFaculty, totalCourses, totalDepts,
      totalTlfqs, totalResponses, completionRate
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── GET /api/tlfq/leaderboard  [student + hod + super_admin]
export const getLeaderboard = async (req, res) => {
  try {
    const { role, department_id } = req.user;
    const cacheKey = `leaderboard:tlfq:${role}:${department_id || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const where = { role: 'student', points: { gt: 0 } };
    if (role === 'hod') where.department_id = department_id;

    const students = await User.findMany({
      where,
      orderBy: { points: 'desc' },
      take: 50
    });

    const result = students.map((s, idx) => ({
      rank: idx + 1,
      unique_feedback_id: s.unique_feedback_id || 'ANO-?????',
      points: s.points,
      batch: s.batch,
      department_id: s.department_id,
      name: (role === 'super_admin' || role === 'coordinator') ? s.name : null,
      student_id: (role === 'super_admin' || role === 'coordinator') ? s.student_id : null,
    }));

    cache.set(cacheKey, result, 60);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
