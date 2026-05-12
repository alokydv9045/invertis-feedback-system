import { supabase } from '../db.js';

// ── GET /api/hod/sections — sections in HOD's dept ────────────────────────
export const getHodSections = async (req, res) => {
  try {
    const { department_id } = req.user;
    const { data, error } = await supabase.from('sections').select('*').eq('department_id', department_id);
    if (error) throw error;
    return res.json(data);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── GET /api/hod/section-faculty — faculty in section ──────────────────────
export const getSectionFaculty = async (req, res) => {
  try {
    const { section_id } = req.query;
    if (!section_id) return res.status(400).json({ message: 'section_id required' });
    const { data: list, error } = await supabase.from('section_faculty').select('*').eq('section_id', section_id);
    if (error) throw error;
    const result = await Promise.all((list || []).map(async sf => {
      const { data: faculty } = await supabase.from('faculty').select('name').eq('id', sf.faculty_id).single();
      const { data: course } = await supabase.from('courses').select('name, code').eq('id', sf.course_id).single();
      return {
        id: sf.id, section_faculty_id: sf.id,
        faculty_id: sf.faculty_id, course_id: sf.course_id,
        faculty_name: faculty?.name || 'Unknown',
        course_name: course?.name || 'Unknown',
        course_code: course?.code || '',
      };
    }));
    return res.json(result);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── POST /api/hod/tlfq — create evaluation form ───────────────────────────
export const createTlfq = async (req, res) => {
  try {
    const { section_id, course_id, faculty_id, title, closing_time, question_texts } = req.body;
    if (!section_id || !course_id || !faculty_id || !title || !closing_time) {
      return res.status(400).json({ message: 'section_id, course_id, faculty_id, title, closing_time required' });
    }
    const { data: section } = await supabase.from('sections').select('department_id').eq('id', section_id).single();
    if (!section || section.department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'Section not in your department.' });
    }
    const { data: tlfq, error } = await supabase.from('tlfqs').insert({
      section_id, course_id, faculty_id, title,
      is_active: false,
      closing_time: new Date(closing_time).toISOString(),
      created_by: req.user.id
    }).select().single();
    if (error) throw error;
    const questions = (question_texts || []).filter(q => q.trim());
    if (questions.length > 0) {
      await supabase.from('questions').insert(questions.map(q => ({ tlfq_id: tlfq.id, question_text: q })));
    }
    return res.status(201).json({ id: tlfq.id, message: 'Evaluation form created. Open it to make it available to students.' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── GET /api/hod/tlfq — my forms ──────────────────────────────────────────
export const getMyForms = async (req, res) => {
  try {
    const { data: forms, error } = await supabase.from('tlfqs').select('*').eq('created_by', req.user.id);
    if (error) throw error;
    const now = new Date();
    const result = await Promise.all((forms || []).map(async f => {
      const { data: section } = await supabase.from('sections').select('name').eq('id', f.section_id).single();
      const { data: faculty } = await supabase.from('faculty').select('name').eq('id', f.faculty_id).single();
      const { data: course } = await supabase.from('courses').select('name, code').eq('id', f.course_id).single();
      const { count } = await supabase.from('responses').select('id', { count: 'exact', head: true }).eq('tlfq_id', f.id);
      const expired = new Date(f.closing_time) < now;
      return {
        id: f.id, title: f.title, is_active: f.is_active,
        closing_time: f.closing_time, expired,
        status: expired ? 'expired' : f.is_active ? 'open' : 'closed',
        section_name: section?.name || '—',
        faculty_name: faculty?.name || '—',
        course_name: course?.name || '—',
        course_code: course?.code || '',
        responses: count || 0,
      };
    }));
    return res.json(result);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── PUT /api/hod/tlfq/:id/toggle — open or close form ─────────────────────
export const toggleForm = async (req, res) => {
  try {
    const { is_active } = req.body;
    const { data: form } = await supabase.from('tlfqs').select('created_by').eq('id', req.params.id).single();
    if (!form) return res.status(404).json({ message: 'Form not found.' });
    if (form.created_by !== req.user.id) {
      return res.status(403).json({ message: 'You can only manage your own forms.' });
    }
    await supabase.from('tlfqs').update({ is_active: !!is_active }).eq('id', req.params.id);
    return res.json({ message: `Form ${is_active ? 'opened' : 'closed'} successfully.` });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── PUT /api/hod/tlfq/:id/deadline — extend deadline ──────────────────────
export const updateDeadline = async (req, res) => {
  try {
    const { closing_time } = req.body;
    if (!closing_time) return res.status(400).json({ message: 'closing_time required' });
    const { data: form } = await supabase.from('tlfqs').select('created_by').eq('id', req.params.id).single();
    if (!form) return res.status(404).json({ message: 'Form not found.' });
    if (form.created_by !== req.user.id) {
      return res.status(403).json({ message: 'You can only manage your own forms.' });
    }
    await supabase.from('tlfqs').update({ closing_time: new Date(closing_time).toISOString() }).eq('id', req.params.id);
    return res.json({ message: 'Deadline updated.' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── GET /api/hod/stats ─────────────────────────────────────────────────────
export const getHodStats = async (req, res) => {
  try {
    const { department_id } = req.user;
    const { count: sections } = await supabase.from('sections').select('id', { count: 'exact', head: true }).eq('department_id', department_id);
    const { count: faculty } = await supabase.from('faculty').select('id', { count: 'exact', head: true }).eq('department_id', department_id);
    const { count: courses } = await supabase.from('courses').select('id', { count: 'exact', head: true }).eq('department_id', department_id);
    const { count: students } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student').eq('department_id', department_id);
    const { count: myForms } = await supabase.from('tlfqs').select('id', { count: 'exact', head: true }).eq('created_by', req.user.id);
    const { count: openForms } = await supabase.from('tlfqs').select('id', { count: 'exact', head: true }).eq('created_by', req.user.id).eq('is_active', true).gt('closing_time', new Date().toISOString());
    return res.json({ sections: sections || 0, faculty: faculty || 0, courses: courses || 0, students: students || 0, myForms: myForms || 0, openForms: openForms || 0 });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── PUT /api/hod/portal — toggle dept portal ──────────────────────────────
export const togglePortal = async (req, res) => {
  try {
    const { open } = req.body;
    const { data: dept, error } = await supabase.from('departments').update({ portal_open: !!open }).eq('id', req.user.department_id).select().single();
    if (error || !dept) return res.status(404).json({ message: 'Department not found' });
    return res.json({ portal_open: dept.portal_open, message: `Portal ${dept.portal_open ? 'opened' : 'closed'}.` });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

export const getPortalStatus = async (req, res) => {
  try {
    const { data: dept } = await supabase.from('departments').select('portal_open, name').eq('id', req.user.department_id).single();
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    return res.json({ portal_open: dept.portal_open, department_name: dept.name });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};
