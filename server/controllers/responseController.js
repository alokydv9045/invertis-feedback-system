import { supabase } from '../db.js';

// ── Student: GET courses + TLFQs for their section ─────────────────────────
export const getStudentCourses = async (req, res) => {
  try {
    const { id: userId, department_id } = req.user;
    const { data: student } = await supabase.from('users').select('*').eq('id', userId).single();
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const { data: dept } = await supabase.from('departments').select('portal_open').eq('id', department_id).single();
    if (dept && !dept.portal_open) {
      return res.status(200).json({ portal_closed: true, message: 'The feedback portal is currently closed by your HOD.' });
    }

    const now = new Date().toISOString();
    const section_id = student.section_id;
    if (!section_id) return res.json([]);

    const { data: tlfqs } = await supabase.from('tlfqs').select('*').eq('section_id', section_id).eq('is_active', true).gt('closing_time', now);

    const courseMap = {};
    for (const tlfq of (tlfqs || [])) {
      const courseId = tlfq.course_id;
      if (!courseMap[courseId]) {
        const { data: course } = await supabase.from('courses').select('*').eq('id', tlfq.course_id).single();
        courseMap[courseId] = { ...course, id: courseId, tlfqs: [], pending_count: 0, completed_count: 0 };
      }
      const { data: faculty } = await supabase.from('faculty').select('name').eq('id', tlfq.faculty_id).single();
      const { data: resp } = await supabase.from('responses').select('id').eq('student_id', userId).eq('tlfq_id', tlfq.id).single();
      const entry = {
        ...tlfq, id: tlfq.id,
        faculty_name: faculty?.name || 'Unknown',
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
    const { data: tlfq } = await supabase.from('tlfqs').select('*').eq('id', req.params.tlfqId).single();
    if (!tlfq) return res.status(404).json({ message: 'Form not found.' });
    if (!tlfq.is_active || new Date(tlfq.closing_time) < new Date()) {
      return res.status(403).json({ message: 'This evaluation is closed or expired.' });
    }
    const { data: faculty } = await supabase.from('faculty').select('name').eq('id', tlfq.faculty_id).single();
    const { data: course } = await supabase.from('courses').select('name, code').eq('id', tlfq.course_id).single();
    const { data: section } = await supabase.from('sections').select('name').eq('id', tlfq.section_id).single();
    const { data: questions } = await supabase.from('questions').select('*').eq('tlfq_id', tlfq.id);
    return res.json({
      ...tlfq, id: tlfq.id,
      faculty_name: faculty?.name || 'Unknown',
      course_name: course?.name || 'Unknown',
      course_code: course?.code || '',
      section_name: section?.name || '',
      questions: questions || []
    });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── POST /api/student/submit ────────────────────────────────────────────────
export const submitResponse = async (req, res) => {
  try {
    const { id: student_id, department_id } = req.user;
    const { tlfq_id, answers, comment } = req.body;

    const { data: dept } = await supabase.from('departments').select('portal_open').eq('id', department_id).single();
    if (dept && !dept.portal_open) {
      return res.status(403).json({ message: 'The feedback portal is currently closed.' });
    }

    const { data: tlfq } = await supabase.from('tlfqs').select('*').eq('id', tlfq_id).single();
    if (!tlfq || !tlfq.is_active || new Date(tlfq.closing_time) < new Date()) {
      return res.status(403).json({ message: 'This evaluation form is closed or expired.' });
    }

    const { data: existing } = await supabase.from('responses').select('id').eq('student_id', student_id).eq('tlfq_id', tlfq_id).single();
    if (existing) return res.status(400).json({ message: 'Evaluation already submitted.' });

    const { data: resp, error } = await supabase.from('responses').insert({
      student_id, tlfq_id, submitted_at: new Date().toISOString(), comment: comment || ''
    }).select().single();
    if (error) throw error;

    if (answers && Array.isArray(answers)) {
      const answerRows = answers.map(({ question_id, rating }) => ({
        response_id: resp.id, question_id, rating: Number(rating)
      }));
      await supabase.from('answers').insert(answerRows);
    }

    // Increment student points
    const { data: student } = await supabase.from('users').select('points').eq('id', student_id).single();
    await supabase.from('users').update({ points: (student?.points || 0) + 10 }).eq('id', student_id);

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

    const { data: allDepts } = await supabase.from('departments').select('*');
    const { data: allResponses } = await supabase.from('responses').select('*');
    const responseIds = (allResponses || []).map(r => r.id);
    const { data: allAnswers } = responseIds.length > 0
      ? await supabase.from('answers').select('*').in('response_id', responseIds)
      : { data: [] };

    let facultyQuery = supabase.from('faculty').select('*');
    if (department_id) facultyQuery = facultyQuery.eq('department_id', department_id);
    const { data: allFaculty } = await facultyQuery;
    const { data: allTlfqs } = await supabase.from('tlfqs').select('*');

    const facultyMap = {};
    for (const f of (allFaculty || [])) {
      facultyMap[f.id] = {
        id: f.id, name: f.name,
        department_id: f.department_id,
        teacher_type: f.teacher_type || 'college_faculty',
        total_responses: 0, total_rating: 0
      };
    }

    for (const tlfq of (allTlfqs || [])) {
      const fId = tlfq.faculty_id;
      if (!facultyMap[fId]) continue;
      const tlfqResponses = (allResponses || []).filter(r => r.tlfq_id === tlfq.id);
      for (const resp of tlfqResponses) {
        const respAnswers = (allAnswers || []).filter(a => a.response_id === resp.id);
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

    const filteredTlfqIds = (allTlfqs || [])
      .filter(t => !department_id || (allFaculty || []).some(f => f.id === t.faculty_id))
      .map(t => t.id);
    const recentResponses = (allResponses || []).filter(r => r.comment && filteredTlfqIds.includes(r.tlfq_id)).slice(-20);
    const recentComments = await Promise.all(recentResponses.map(async r => {
      const tlfq = (allTlfqs || []).find(t => t.id === r.tlfq_id);
      const faculty = tlfq ? (allFaculty || []).find(f => f.id === tlfq.faculty_id) : null;
      let course = null, section = null, deptObj = null;
      if (tlfq) {
        const { data: c } = await supabase.from('courses').select('name').eq('id', tlfq.course_id).single();
        const { data: s } = await supabase.from('sections').select('name').eq('id', tlfq.section_id).single();
        course = c; section = s;
      }
      if (faculty) deptObj = (allDepts || []).find(d => d.id === faculty.department_id);
      return {
        comment: r.comment, submitted_at: r.submitted_at,
        faculty_name: faculty?.name, course_name: course?.name,
        section_name: section?.name,
        department_id: deptObj?.id
      };
    }));

    const deptOverview = (allDepts || []).map(d => ({
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
    let query = supabase.from('users').select('unique_feedback_id, points, batch').eq('role', 'student').gt('points', 0).order('points', { ascending: false }).limit(50);
    if (role === 'hod') query = query.eq('department_id', department_id);
    const { data: students, error } = await query;
    if (error) throw error;
    return res.json((students || []).map((s, i) => ({
      rank: i + 1,
      unique_feedback_id: s.unique_feedback_id || 'ANO-?????',
      points: s.points,
      batch: s.batch,
    })));
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};
