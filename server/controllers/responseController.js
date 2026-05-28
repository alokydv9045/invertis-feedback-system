import { User, Department, Section, Faculty, Course, SectionFaculty, Tlfq, Question, Response, Answer } from '../db.js';

// ── Student: GET courses + TLFQs for their section ─────────────────────────
export const getStudentCourses = async (req, res) => {
  try {
    const { id: userId, department_id } = req.user;
    const student = await User.findUnique({ where: { id: userId } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const dept = await Department.findUnique({ where: { id: department_id }, select: { portal_open: true } });
    if (dept && !dept.portal_open) {
      return res.status(200).json({ portal_closed: true, message: 'The feedback portal is currently closed by your HOD.' });
    }

    const now = new Date();
    const section_id = student.section_id;
    if (!section_id) return res.json([]);

    const tlfqs = await Tlfq.findMany({
      where: { section_id, is_active: true, closing_time: { gt: now } },
      include: { faculty: { select: { name: true } }, course: true }
    });

    const courseMap = {};
    for (const tlfq of tlfqs) {
      const courseId = tlfq.course_id;
      if (!courseMap[courseId]) {
        courseMap[courseId] = { ...tlfq.course, id: courseId, tlfqs: [], pending_count: 0, completed_count: 0 };
      }
      const resp = await Response.findFirst({ where: { student_id: userId, tlfq_id: tlfq.id }, select: { id: true } });
      const entry = {
        ...tlfq, id: tlfq.id,
        faculty_name: tlfq.faculty?.name || 'Unknown',
        completed: !!resp,
        closing_time: tlfq.closing_time
      };
      courseMap[courseId].tlfqs.push(entry);
      if (resp) courseMap[courseId].completed_count++;
      else courseMap[courseId].pending_count++;
    }
    return res.json(Object.values(courseMap));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── GET specific evaluation form ───────────────────────────────────────────
export const getEvaluation = async (req, res) => {
  try {
    const tlfq = await Tlfq.findUnique({
      where: { id: req.params.tlfqId },
      include: {
        faculty: { select: { name: true } },
        course: { select: { name: true, code: true } },
        section: { select: { name: true } },
        questions: true
      }
    });
    if (!tlfq) return res.status(404).json({ message: 'Form not found.' });
    if (!tlfq.is_active || new Date(tlfq.closing_time) < new Date()) {
      return res.status(403).json({ message: 'This evaluation is closed or expired.' });
    }
    return res.json({
      ...tlfq, id: tlfq.id,
      faculty_name: tlfq.faculty?.name || 'Unknown',
      course_name: tlfq.course?.name || 'Unknown',
      course_code: tlfq.course?.code || '',
      section_name: tlfq.section?.name || '',
      questions: tlfq.questions || []
    });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── POST /api/student/submit ────────────────────────────────────────────────
export const submitResponse = async (req, res) => {
  try {
    const { id: student_id, department_id } = req.user;
    const { tlfq_id, answers, comment } = req.body;

    const dept = await Department.findUnique({ where: { id: department_id }, select: { portal_open: true } });
    if (dept && !dept.portal_open) {
      return res.status(403).json({ message: 'The feedback portal is currently closed.' });
    }

    const tlfq = await Tlfq.findUnique({ where: { id: tlfq_id } });
    if (!tlfq || !tlfq.is_active || new Date(tlfq.closing_time) < new Date()) {
      return res.status(403).json({ message: 'This evaluation form is closed or expired.' });
    }

    const existing = await Response.findFirst({ where: { student_id, tlfq_id }, select: { id: true } });
    if (existing) return res.status(400).json({ message: 'Evaluation already submitted.' });

    const resp = await Response.create({
      data: { student_id, tlfq_id, submitted_at: new Date(), comment: comment || '' }
    });

    if (answers && Array.isArray(answers)) {
      for (const { question_id, rating } of answers) {
        await Answer.create({
          data: { response_id: resp.id, question_id, rating: Number(rating) }
        });
      }
    }

    // Increment student points
    await User.update({ where: { id: student_id }, data: { points: { increment: 10 } } });

    return res.status(201).json({ message: 'Feedback submitted successfully. +10 points!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Analytics (super_admin) ─────────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const { department_id } = req.query;

    const allDepts = await Department.findMany();
    const facultyWhere = department_id ? { department_id } : {};
    const allFaculty = await Faculty.findMany({ where: facultyWhere });
    const allTlfqs = await Tlfq.findMany({
      include: { responses: { include: { answers: true } } }
    });

    const facultyMap = {};
    for (const f of allFaculty) {
      facultyMap[f.id] = {
        id: f.id, name: f.name,
        department_id: f.department_id,
        teacher_type: f.teacher_type || 'college_faculty',
        total_responses: 0, total_rating: 0
      };
    }

    for (const tlfq of allTlfqs) {
      const fId = tlfq.faculty_id;
      if (!facultyMap[fId]) continue;
      for (const resp of (tlfq.responses || [])) {
        const respAnswers = resp.answers || [];
        if (respAnswers.length > 0) {
          const avg = respAnswers.reduce((s, a) => s + a.rating, 0) / respAnswers.length;
          facultyMap[fId].total_rating += avg;
          facultyMap[fId].total_responses++;
        }
      }
    }

    const avgRatingPerFaculty = Object.values(facultyMap)
      .filter(f => f.total_responses > 0)
      .map(f => ({ ...f, avg_rating: parseFloat((f.total_rating / f.total_responses).toFixed(2)) }))
      .sort((a, b) => b.avg_rating - a.avg_rating);

    // Recent comments
    const allResponses = allTlfqs.flatMap(t => (t.responses || []).map(r => ({ ...r, tlfq })));
    const filteredTlfqIds = allTlfqs
      .filter(t => !department_id || allFaculty.some(f => f.id === t.faculty_id))
      .map(t => t.id);
    const recentResponses = allResponses
      .filter(r => r.comment && filteredTlfqIds.includes(r.tlfq_id))
      .slice(-20);

    const recentComments = await Promise.all(recentResponses.map(async r => {
      const tlfq = r.tlfq;
      const faculty = tlfq ? allFaculty.find(f => f.id === tlfq.faculty_id) : null;
      let course = null, section = null, deptObj = null;
      if (tlfq) {
        course = await Course.findUnique({ where: { id: tlfq.course_id }, select: { name: true } });
        section = await Section.findUnique({ where: { id: tlfq.section_id }, select: { name: true } });
      }
      if (faculty) deptObj = allDepts.find(d => d.id === faculty.department_id);
      return {
        comment: r.comment, submitted_at: r.submitted_at,
        faculty_name: faculty?.name, course_name: course?.name,
        section_name: section?.name,
        department_id: deptObj?.id
      };
    }));

    const deptOverview = allDepts.map(d => ({
      id: d.id, name: d.name, code: d.code, portal_open: d.portal_open
    }));

    return res.json({ avgRatingPerFaculty, recentComments, deptOverview });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Leaderboard ─────────────────────────────────────────────────────────────
export const getLeaderboard = async (req, res) => {
  try {
    const { role, department_id } = req.user;
    const where = { role: 'student', points: { gt: 0 } };
    if (role === 'hod') where.department_id = department_id;
    const students = await User.findMany({
      where,
      select: { unique_feedback_id: true, points: true, batch: true },
      orderBy: { points: 'desc' },
      take: 50
    });
    return res.json((students || []).map((s, i) => ({
      rank: i + 1,
      unique_feedback_id: s.unique_feedback_id || 'ANO-?????',
      points: s.points,
      batch: s.batch,
    })));
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};
