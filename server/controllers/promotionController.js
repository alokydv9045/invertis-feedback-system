import { prisma, AcademicSession, Department, Section, SectionFaculty, User, Enrollment, PromotionLog } from '../db.js';

function getAcademicYearWindow(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const startYear = month >= 7 ? year : year - 1;
  const endYear = startYear + 1;
  return {
    startYear,
    endYear,
    name: `${startYear}-${String(endYear).slice(-2)}`,
  };
}

async function ensureActiveSession() {
  let active = await AcademicSession.findFirst({ where: { is_active: true } });
  if (active) return active;

  const { startYear, endYear, name } = getAcademicYearWindow();
  active = await AcademicSession.upsert({
    where: { name },
    update: { is_active: true },
    create: {
      name,
      start_year: startYear,
      end_year: endYear,
      is_active: true,
    },
  });
  return active;
}

async function getOrCreateNextSession(fromSession) {
  const startYear = fromSession.start_year + 1;
  const endYear = fromSession.end_year + 1;
  const name = `${startYear}-${String(endYear).slice(-2)}`;

  const next = await AcademicSession.upsert({
    where: { name },
    update: {},
    create: {
      name,
      start_year: startYear,
      end_year: endYear,
      is_active: false,
    },
  });

  return next;
}

function normalizeSemesterFilter(semesters) {
  if (!Array.isArray(semesters) || semesters.length === 0) return [];
  return [...new Set(semesters.map(Number).filter(n => Number.isInteger(n) && n > 0))];
}

async function buildPromotionPlan({ department_id, semesters, student_ids }) {
  const activeSession = await ensureActiveSession();
  const nextSession = await getOrCreateNextSession(activeSession);

  const semesterFilter = normalizeSemesterFilter(semesters);
  const studentIdFilter = Array.isArray(student_ids) ? student_ids.filter(Boolean) : [];

  const departments = await Department.findMany();
  const deptMap = new Map(departments.map(d => [d.id, d]));

  const where = {
    role: 'student',
    status: 'active',
    academic_session_id: activeSession.id,
    semester: { not: null },
  };

  if (department_id) where.department_id = department_id;
  if (semesterFilter.length > 0) where.semester = { in: semesterFilter };
  if (studentIdFilter.length > 0) where.id = { in: studentIdFilter };

  const students = await User.findMany({
    where,
    include: {
      section: true,
      department: true,
    },
    orderBy: [{ department_id: 'asc' }, { semester: 'asc' }, { name: 'asc' }],
  });

  const sectionRows = await Section.findMany();
  const sectionIndex = new Map();
  for (const s of sectionRows) {
    sectionIndex.set(`${s.department_id}:${s.semester}:${s.label}`, s);
  }

  const transitions = {};
  const blockers = [];
  const promoteActions = [];
  const graduateActions = [];
  const skipped = [];

  for (const st of students) {
    const maxSemester = deptMap.get(st.department_id)?.max_semester ?? 6;
    const currentSemester = Number(st.semester);

    if (!Number.isInteger(currentSemester) || currentSemester <= 0) {
      skipped.push({
        student_id: st.id,
        student_name: st.name,
        reason: 'invalid_semester',
      });
      continue;
    }

    if (currentSemester >= maxSemester) {
      const key = `${currentSemester}->GRADUATED`;
      transitions[key] = (transitions[key] || 0) + 1;
      graduateActions.push({
        student_id: st.id,
        student_name: st.name,
        from_semester: currentSemester,
      });
      continue;
    }

    if (!st.section) {
      skipped.push({
        student_id: st.id,
        student_name: st.name,
        reason: 'missing_section',
      });
      continue;
    }

    const targetSemester = currentSemester + 1;
    const targetSection = sectionIndex.get(`${st.department_id}:${targetSemester}:${st.section.label}`);
    if (!targetSection) {
      const reason = `missing_next_section_${targetSemester}_${st.section.label}`;
      skipped.push({
        student_id: st.id,
        student_name: st.name,
        reason,
      });
      blockers.push({
        student_id: st.id,
        student_name: st.name,
        department_id: st.department_id,
        section_label: st.section.label,
        required_semester: targetSemester,
      });
      continue;
    }

    const key = `${currentSemester}->${targetSemester}`;
    transitions[key] = (transitions[key] || 0) + 1;
    promoteActions.push({
      student_id: st.id,
      student_name: st.name,
      from_semester: currentSemester,
      to_semester: targetSemester,
      from_section_id: st.section_id,
      to_section_id: targetSection.id,
      department_id: st.department_id,
    });
  }

  const deptCounts = {};
  for (const st of students) {
    const deptName = st.department?.name || 'Unknown';
    deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
  }

  return {
    activeSession,
    nextSession,
    students_scanned: students.length,
    promoteActions,
    graduateActions,
    skipped,
    blockers,
    transitions,
    department_counts: deptCounts,
  };
}

export const getPromotionOverview = async (req, res) => {
  try {
    const activeSession = await ensureActiveSession();
    const nextSession = await getOrCreateNextSession(activeSession);
    const departments = await Department.findMany({ orderBy: { name: 'asc' } });

    const recentLogs = await PromotionLog.findMany({
      include: {
        admin: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
        from_session: true,
        to_session: true,
      },
      orderBy: { promoted_at: 'desc' },
      take: 10,
    });

    return res.json({
      active_session: activeSession,
      next_session: nextSession,
      departments,
      recent_logs: recentLogs,
    });
  } catch (err) {
    console.error('getPromotionOverview error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const previewPromotion = async (req, res) => {
  try {
    const { department_id, semesters, student_ids } = req.body || {};

    const plan = await buildPromotionPlan({ department_id, semesters, student_ids });

    return res.json({
      active_session: plan.activeSession,
      next_session: plan.nextSession,
      summary: {
        students_scanned: plan.students_scanned,
        to_promote: plan.promoteActions.length,
        to_graduate: plan.graduateActions.length,
        skipped: plan.skipped.length,
      },
      transitions: plan.transitions,
      department_counts: plan.department_counts,
      blockers: plan.blockers,
      skipped: plan.skipped,
    });
  } catch (err) {
    console.error('previewPromotion error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const executePromotion = async (req, res) => {
  try {
    const {
      department_id,
      semesters,
      student_ids,
      confirm,
      activate_next_session = false,
    } = req.body || {};

    if (!confirm) {
      return res.status(400).json({ message: 'Promotion confirmation required.' });
    }

    const plan = await buildPromotionPlan({ department_id, semesters, student_ids });
    if (plan.promoteActions.length === 0 && plan.graduateActions.length === 0) {
      return res.status(400).json({ message: 'No eligible students found for promotion.' });
    }

    const promotionIds = plan.promoteActions.map(a => a.student_id);
    const graduateIds = plan.graduateActions.map(a => a.student_id);

    const toSectionIds = [...new Set(plan.promoteActions.map(a => a.to_section_id))];

    const sectionFaculty = await SectionFaculty.findMany({
      where: { section_id: { in: toSectionIds } },
      select: { section_id: true, course_id: true },
    });

    const sectionCourses = new Map();
    for (const row of sectionFaculty) {
      if (!sectionCourses.has(row.section_id)) sectionCourses.set(row.section_id, new Set());
      sectionCourses.get(row.section_id).add(row.course_id);
    }

    const enrollmentRows = [];
    for (const a of plan.promoteActions) {
      const courseSet = sectionCourses.get(a.to_section_id) || new Set();
      for (const courseId of courseSet) {
        enrollmentRows.push({
          student_id: a.student_id,
          section_id: a.to_section_id,
          course_id: courseId,
        });
      }
    }

    const transitionSummary = {
      transitions: plan.transitions,
      blockers: plan.blockers,
      skipped: plan.skipped,
    };

    const logEntry = await prisma.$transaction(async (tx) => {
      if (promotionIds.length > 0) {
        // Group promoteActions by destination (to_semester, to_section_id)
        const groupMap = {};
        for (const action of plan.promoteActions) {
          const key = `${action.to_semester}:::${action.to_section_id}`;
          if (!groupMap[key]) {
            groupMap[key] = {
              to_semester: action.to_semester,
              to_section_id: action.to_section_id,
              student_ids: []
            };
          }
          groupMap[key].student_ids.push(action.student_id);
        }

        for (const grp of Object.values(groupMap)) {
          await tx.user.updateMany({
            where: { id: { in: grp.student_ids } },
            data: {
              semester: grp.to_semester,
              section_id: grp.to_section_id,
              academic_session_id: plan.nextSession.id,
            },
          });
        }
      }

      if (graduateIds.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: graduateIds } },
          data: {
            status: 'graduated',
            section_id: null,
            academic_session_id: plan.nextSession.id,
          },
        });
      }

      const affectedIds = [...promotionIds, ...graduateIds];
      if (affectedIds.length > 0) {
        await tx.enrollment.deleteMany({ where: { student_id: { in: affectedIds } } });
      }

      if (enrollmentRows.length > 0) {
        await tx.enrollment.createMany({ 
          data: enrollmentRows,
          skipDuplicates: true
        });
      }

      if (activate_next_session) {
        await tx.academicSession.updateMany({ where: { is_active: true }, data: { is_active: false } });
        await tx.academicSession.update({ where: { id: plan.nextSession.id }, data: { is_active: true } });
      }

      const log = await tx.promotionLog.create({
        data: {
          admin_id: req.user.id,
          department_id: department_id || null,
          from_session_id: plan.activeSession.id,
          to_session_id: plan.nextSession.id,
          scope: student_ids?.length ? 'selected_students' : semesters?.length ? 'semester_scope' : department_id ? 'department_scope' : 'all_departments',
          semesters: Array.isArray(semesters) && semesters.length > 0 ? semesters.map(Number).join(',') : null,
          promoted_count: plan.promoteActions.length,
          graduated_count: plan.graduateActions.length,
          skipped_count: plan.skipped.length,
          metadata: transitionSummary,
        },
      });

      await tx.user.updateMany({
        where: { id: { in: affectedIds } },
        data: { last_promotion_log_id: log.id },
      });

      return log;
    });

    return res.json({
      message: 'Academic promotion executed successfully.',
      log_id: logEntry.id,
      summary: {
        promoted: plan.promoteActions.length,
        graduated: plan.graduateActions.length,
        skipped: plan.skipped.length,
      },
      transitions: plan.transitions,
    });
  } catch (err) {
    console.error('executePromotion error:', err);
    return res.status(500).json({ message: 'Promotion failed. Transaction rolled back.' });
  }
};

export const getPromotionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [rows, total] = await Promise.all([
      PromotionLog.findMany({
        include: {
          admin: { select: { id: true, name: true, email: true } },
          department: { select: { id: true, name: true, code: true } },
          from_session: true,
          to_session: true,
        },
        orderBy: { promoted_at: 'desc' },
        skip,
        take,
      }),
      PromotionLog.count(),
    ]);

    return res.json({
      logs: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error('getPromotionHistory error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
