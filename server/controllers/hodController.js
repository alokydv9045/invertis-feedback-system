import { Department, Section, SectionFaculty, Course, Faculty, Tlfq, Question, Response, Answer, User, Enrollment } from '../db.js';

// ── GET /api/hod/sections — sections in HOD's dept ────────────────────────
export const getHodSections = async (req, res) => {
  try {
    const { department_id } = req.user;
    const sections = await Section.findMany({ where: { department_id } });
    return res.json(sections);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── GET /api/hod/section-faculty — faculty in section ──────────────────────
export const getSectionFaculty = async (req, res) => {
  try {
    const { section_id } = req.query;
    if (!section_id) return res.status(400).json({ message: 'section_id required' });
    
    const list = await SectionFaculty.findMany({
      where: { section_id },
      include: {
        faculty: true,
        course: true
      }
    });

    const result = list.map(sf => ({
      id: sf.id,
      section_faculty_id: sf.id,
      faculty_id: sf.faculty_id,
      course_id:  sf.course_id,
      faculty_name: sf.faculty?.name || 'Unknown',
      course_name:  sf.course?.name  || 'Unknown',
      course_code:  sf.course?.code  || '',
    }));
    
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── POST /api/hod/tlfq — create evaluation form ───────────────────────────
export const createTlfq = async (req, res) => {
  try {
    const { section_id, course_id, faculty_id, title, closing_time, question_texts } = req.body;
    if (!section_id || !course_id || !faculty_id || !title || !closing_time) {
      return res.status(400).json({ message: 'section_id, course_id, faculty_id, title, closing_time required' });
    }
    
    const section = await Section.findUnique({ where: { id: section_id } });
    if (!section || section.department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'Section not in your department.' });
    }

    const tlfq = await Tlfq.create({
      data: {
        section_id,
        course_id,
        faculty_id,
        title,
        is_active: false,
        closing_time: new Date(closing_time),
        created_by: req.user.id
      }
    });

    const questions = question_texts?.filter(q => q.trim()) || [];
    if (questions.length > 0) {
      await Question.createMany({
        data: questions.map(q => ({ tlfq_id: tlfq.id, question_text: q }))
      });
    }

    return res.status(201).json({ id: tlfq.id, message: 'Evaluation form created. Open it to make it available to students.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── GET /api/hod/tlfq — my forms ──────────────────────────────────────────
export const getMyForms = async (req, res) => {
  try {
    const forms = await Tlfq.findMany({
      where: { created_by: req.user.id },
      include: {
        section: true,
        faculty: true,
        course: true,
        _count: {
          select: { responses: true }
        }
      }
    });

    const now = new Date();
    const result = forms.map(f => {
      const expired = f.closing_time < now;
      return {
        id: f.id,
        title: f.title,
        is_active: f.is_active,
        closing_time: f.closing_time,
        expired,
        status: expired ? 'expired' : f.is_active ? 'open' : 'closed',
        section_name: f.section?.name || '—',
        faculty_name: f.faculty?.name || '—',
        course_name:  f.course?.name  || '—',
        course_code:  f.course?.code  || '',
        responses: f._count.responses,
      };
    });

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── PUT /api/hod/tlfq/:id/toggle — open or close form ─────────────────────
export const toggleForm = async (req, res) => {
  try {
    const { is_active } = req.body;
    const form = await Tlfq.findUnique({ where: { id: req.params.id } });
    if (!form) return res.status(404).json({ message: 'Form not found.' });
    
    if (form.created_by !== req.user.id) {
      return res.status(403).json({ message: 'You can only manage your own forms.' });
    }

    await Tlfq.update({
      where: { id: req.params.id },
      data: { is_active: !!is_active }
    });

    return res.json({ message: `Form ${is_active ? 'opened' : 'closed'} successfully.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── PUT /api/hod/tlfq/:id/deadline — extend deadline ──────────────────────
export const updateDeadline = async (req, res) => {
  try {
    const { closing_time } = req.body;
    if (!closing_time) return res.status(400).json({ message: 'closing_time required' });
    
    const form = await Tlfq.findUnique({ where: { id: req.params.id } });
    if (!form) return res.status(404).json({ message: 'Form not found.' });
    
    if (form.created_by !== req.user.id) {
      return res.status(403).json({ message: 'You can only manage your own forms.' });
    }

    await Tlfq.update({
      where: { id: req.params.id },
      data: { closing_time: new Date(closing_time) }
    });

    return res.json({ message: 'Deadline updated.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── GET /api/hod/stats ─────────────────────────────────────────────────────
export const getHodStats = async (req, res) => {
  try {
    const { department_id } = req.user;
    const now = new Date();
    
    // Run all 6 count queries in parallel instead of sequentially
    const [sections, faculty, courses, students, myForms, openForms] = await Promise.all([
      Section.count({ where: { department_id } }),
      Faculty.count({ where: { department_id } }),
      Course.count({ where: { department_id } }),
      User.count({ where: { role: 'student', department_id } }),
      Tlfq.count({ where: { created_by: req.user.id } }),
      Tlfq.count({ 
        where: { 
          created_by: req.user.id, 
          is_active: true, 
          closing_time: { gt: now } 
        } 
      })
    ]);
    
    return res.json({ sections, faculty, courses, students, myForms, openForms });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── PUT /api/hod/portal — toggle dept portal ──────────────────────────────
export const togglePortal = async (req, res) => {
  try {
    const { open } = req.body;
    const dept = await Department.update({
      where: { id: req.user.department_id },
      data: { portal_open: !!open }
    });
    
    return res.json({ portal_open: dept.portal_open, message: `Portal ${dept.portal_open ? 'opened' : 'closed'}.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getPortalStatus = async (req, res) => {
  try {
    const dept = await Department.findUnique({ where: { id: req.user.department_id } });
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    return res.json({ portal_open: dept.portal_open, department_name: dept.name });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
