import { prisma, Department, Section, Course, Faculty, Tlfq, Question, Response, Answer, User, Enrollment, REWARD_POINTS } from '../db.js';
import cache from '../cache.js';

// ── Student: GET courses + TLFQs for their section ─────────────────────────
export const getStudentCourses = async (req, res) => {
  try {
    const { id: userId, department_id } = req.user;
    const student = await User.findUnique({ where: { id: userId } });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (student.status !== 'active') {
      return res.status(403).json({ message: 'Only active students can access feedback forms.' });
    }

    const dept = await Department.findUnique({ where: { id: department_id } });
    if (dept && !dept.portal_open) {
      return res.status(200).json({ portal_closed: true, message: 'The feedback portal is currently closed by your HOD.' });
    }

    const section_id = student.section_id;
    if (!section_id) return res.json([]);

    const tlfqs = await Tlfq.findMany({
      where: {
        section_id,
        is_active: true,
        closing_time: { gt: new Date() }
      },
      include: {
        course: true,
        faculty: true,
        responses: {
          where: { student_id: userId },
          select: { id: true } // Only need existence check, not full data
        }
      }
    });

    const courseMap = {};
    for (const tlfq of tlfqs) {
      const courseId = tlfq.course_id;
      if (!courseMap[courseId]) {
        courseMap[courseId] = { 
          ...tlfq.course, 
          tlfqs: [], 
          pending_count: 0, 
          completed_count: 0 
        };
      }
      
      const isCompleted = tlfq.responses.length > 0;
      const entry = {
        ...tlfq,
        faculty_name: tlfq.faculty ? tlfq.faculty.name : 'Unknown',
        completed: isCompleted
      };
      
      courseMap[courseId].tlfqs.push(entry);
      if (isCompleted) courseMap[courseId].completed_count++;
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
        faculty: true,
        course: true,
        section: true,
        questions: true
      }
    });

    if (!tlfq) return res.status(404).json({ message: 'Form not found.' });
    if (!tlfq.is_active || tlfq.closing_time < new Date()) {
      return res.status(403).json({ message: 'This evaluation is closed or expired.' });
    }

    return res.json({
      ...tlfq,
      faculty_name: tlfq.faculty?.name || 'Unknown',
      course_name:  tlfq.course?.name  || 'Unknown',
      course_code:  tlfq.course?.code  || '',
      section_name: tlfq.section?.name || '',
      questions: tlfq.questions
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── POST /api/student/submit — FIXED: uses transaction to prevent race condition ─
export const submitResponse = async (req, res) => {
  try {
    const { id: student_id, department_id } = req.user;
    const { tlfq_id, answers, comment } = req.body;

    if (!tlfq_id || !answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'tlfq_id and answers array are required.' });
    }

    // Validate ratings are within bounds
    for (const a of answers) {
      if (!a.question_id || !a.rating || a.rating < 1 || a.rating > 7) {
        return res.status(400).json({ message: 'Each answer must have question_id and rating (1-7).' });
      }
    }

    const student = await User.findUnique({ where: { id: student_id } });
    if (!student || student.status !== 'active') {
      return res.status(403).json({ message: 'Only active students can submit feedback.' });
    }

    const dept = await Department.findUnique({ where: { id: department_id } });
    if (dept && !dept.portal_open) {
      return res.status(403).json({ message: 'The feedback portal is currently closed.' });
    }

    const tlfq = await Tlfq.findUnique({ where: { id: tlfq_id } });
    if (!tlfq || !tlfq.is_active || tlfq.closing_time < new Date()) {
      return res.status(403).json({ message: 'This evaluation form is closed or expired.' });
    }

    // Use a transaction to atomically check + insert (prevents race condition)
    try {
      await prisma.$transaction(async (tx) => {
        // Check for existing submission inside transaction
        const existing = await tx.response.findUnique({
          where: { student_id_tlfq_id: { student_id, tlfq_id } }
        });
        if (existing) {
          throw new Error('ALREADY_SUBMITTED');
        }

        // Create response + answers atomically
        await tx.response.create({
          data: {
            student_id,
            tlfq_id,
            submitted_at: new Date().toISOString(),
            comment: comment || '',
            answers: {
              create: answers.map(a => ({
                question_id: a.question_id,
                rating: Number(a.rating)
              }))
            }
          }
        });

        // Award points
        await tx.user.update({
          where: { id: student_id },
          data: { points: { increment: REWARD_POINTS } }
        });
      });
    } catch (txErr) {
      if (txErr.message === 'ALREADY_SUBMITTED') {
        return res.status(400).json({ message: 'Evaluation already submitted.' });
      }
      // P2002 = unique constraint violation (DB-level duplicate prevention)
      if (txErr.code === 'P2002') {
        return res.status(400).json({ message: 'Evaluation already submitted.' });
      }
      throw txErr;
    }

    // Invalidate leaderboard cache since points changed
    cache.invalidatePrefix('leaderboard');

    return res.status(201).json({ message: `Feedback submitted successfully. +${REWARD_POINTS} points!` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Analytics — REWRITTEN for 20k student scale ─────────────────────────────
// Uses targeted queries with filters instead of loading entire DB into memory
export const getAnalytics = async (req, res) => {
  try {
    const { department_id } = req.query;

    // Check cache first (analytics is expensive)
    const cacheKey = `analytics:${department_id || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // 1. Submission Rates — query only needed dept's courses
    const courseFilter = department_id ? { department_id } : {};
    const courses = await Course.findMany({
      where: courseFilter,
      include: { department: true }
    });

    const submissionRates = await Promise.all(courses.map(async (course) => {
      const [enrolled, submittedRows] = await Promise.all([
        Enrollment.count({ where: { course_id: course.id } }),
        Response.findMany({
          where: { tlfq: { course_id: course.id } },
          select: { student_id: true },
          distinct: ['student_id']
        })
      ]);

      const submitted = submittedRows.length;
      return {
        course_id: course.id,
        course_name: course.name,
        course_code: course.code,
        department_id: course.department_id,
        enrolled,
        submitted,
        rate: enrolled > 0 ? Math.round((submitted / enrolled) * 100) : 0
      };
    }));

    // 2. Faculty Rankings — use aggregation instead of loading all responses
    const facultyFilter = department_id ? { department_id } : {};
    const facultyList = await Faculty.findMany({
      where: facultyFilter,
      include: { department: true }
    });

    const avgRatingPerFaculty = (await Promise.all(facultyList.map(async (f) => {
      const agg = await Answer.aggregate({
        where: { response: { tlfq: { faculty_id: f.id } } },
        _avg: { rating: true },
        _count: { rating: true }
      });
      
      const count = agg._count.rating || 0;
      if (count === 0) return null;
      
      const responseCount = await Response.count({ where: { tlfq: { faculty_id: f.id } } });

      return {
        id: f.id,
        name: f.name,
        department_id: f.department_id,
        teacher_type: f.teacher_type,
        total_responses: responseCount,
        avg_rating: agg._avg.rating ? parseFloat(agg._avg.rating.toFixed(2)) : 0
      };
    }))).filter(Boolean).filter(f => f.total_responses > 0)
      .sort((a, b) => b.avg_rating - a.avg_rating);

    // 3. Attribute Analysis — only for filtered faculty
    const facultyIds = avgRatingPerFaculty.map(f => f.id);
    const questionAgg = facultyIds.length > 0 ? await Answer.groupBy({
      by: ['question_id'],
      where: { response: { tlfq: { faculty_id: { in: facultyIds } } } },
      _avg: { rating: true },
      _count: { rating: true }
    }) : [];

    const qIds = questionAgg.map(q => q.question_id);
    const questions = qIds.length > 0 ? await Question.findMany({
      where: { id: { in: qIds } },
      select: { id: true, question_text: true }
    }) : [];
    const qMap = {};
    for (const q of questions) { qMap[q.id] = q.question_text; }

    const attrMap = {};
    for (const agg of questionAgg) {
      const qText = qMap[agg.question_id];
      const avg = agg._avg.rating;
      const cnt = agg._count.rating || 0;
      if (qText && avg && cnt > 0) {
        if (!attrMap[qText]) attrMap[qText] = { total: 0, weight: 0 };
        attrMap[qText].total += avg * cnt;
        attrMap[qText].weight += cnt;
      }
    }

    const attributeAnalytics = Object.keys(attrMap).map(key => ({
      attribute: key.length > 20 ? key.substring(0, 17) + '...' : key,
      score: parseFloat((attrMap[key].total / attrMap[key].weight).toFixed(2)),
      full_text: key
    }));

    // 4. Department Overview — lightweight
    const allDepts = await Department.findMany();
    const deptOverview = allDepts.map(d => {
      const deptFaculty = avgRatingPerFaculty.filter(f => f.department_id === d.id);
      const avgDeptRating = deptFaculty.length > 0 
        ? parseFloat((deptFaculty.reduce((s, f) => s + f.avg_rating, 0) / deptFaculty.length).toFixed(2))
        : 0;

      return {
        id: d.id, name: d.name, code: d.code, portal_open: d.portal_open,
        avg_rating: avgDeptRating, faculty_count: deptFaculty.length
      };
    });

    // 5. Timeline — only recent 90 days, limited query
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const timelineResponses = await Response.findMany({
      where: {
        submitted_at: { gte: ninetyDaysAgo },
        ...(department_id ? { tlfq: { faculty: { department_id } } } : {})
      },
      select: { submitted_at: true }
    });

    const trendMap = {};
    for (const r of timelineResponses) {
      try {
        const date = new Date(r.submitted_at).toISOString().split('T')[0];
        trendMap[date] = (trendMap[date] || 0) + 1;
      } catch (_) { /* skip malformed */ }
    }

    const timelineData = Object.keys(trendMap)
      .map(date => ({ date, count: trendMap[date] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // 6. Recent comments — limited to 20
    const recentResponses = await Response.findMany({
      where: {
        comment: { not: "" },
        tlfq: { faculty: department_id ? { department_id } : {} }
      },
      include: {
        tlfq: {
          include: {
            faculty: { select: { name: true, department_id: true } },
            course: { select: { name: true } },
            section: { select: { name: true } }
          }
        }
      },
      orderBy: { id: 'desc' },
      take: 20
    });

    const recentComments = recentResponses.map(r => ({
      comment: r.comment,
      submitted_at: r.submitted_at,
      faculty_name: r.tlfq.faculty?.name,
      course_name: r.tlfq.course?.name,
      section_name: r.tlfq.section?.name,
      department_id: r.tlfq.faculty?.department_id
    }));

    const result = { 
      avgRatingPerFaculty, submissionRates, recentComments, 
      deptOverview, attributeAnalytics, timelineData
    };

    // Cache for 30 seconds — prevents hammering on dashboard refresh
    cache.set(cacheKey, result, 30);

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Leaderboard — with caching ──────────────────────────────────────────────
export const getLeaderboard = async (req, res) => {
  try {
    const { role, department_id } = req.user;
    const cacheKey = `leaderboard:${role}:${department_id || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const where = { role: 'student', points: { gt: 0 } };
    if (role === 'hod') where.department_id = department_id;

    const students = await User.findMany({
      where,
      orderBy: { points: 'desc' },
      take: 50,
      select: {
        unique_feedback_id: true,
        points: true,
        batch: true
      }
    });

    const result = students.map((s, i) => ({
      rank: i + 1,
      unique_feedback_id: s.unique_feedback_id || 'ANO-?????',
      points: s.points,
      batch: s.batch,
    }));

    cache.set(cacheKey, result, 60); // 1 min cache
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
