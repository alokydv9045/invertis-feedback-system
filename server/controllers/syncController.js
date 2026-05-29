import { User, Course, Faculty, Enrollment, Tlfq, Question, Response, Answer, Department, Section, AcademicSession, prisma } from '../db.js';

export const exportData = async (req, res) => {
  try {
    // Fetch all data — exclude password hashes from User records for security
    const [departments, sections, users, courses, faculty, enrollments, tlfqs, questions, responses, answers] = await Promise.all([
      Department.findMany(),
      Section.findMany(),
      User.findMany({
        select: {
          id: true, name: true, email: true, role: true, status: true,
          department_id: true, section_id: true, student_id: true,
          unique_feedback_id: true, points: true, batch: true,
          semester: true, academic_session_id: true, last_promotion_log_id: true
          // password intentionally EXCLUDED
        }
      }),
      Course.findMany(),
      Faculty.findMany(),
      Enrollment.findMany(),
      Tlfq.findMany(),
      Question.findMany(),
      Response.findMany(),
      Answer.findMany()
    ]);

    return res.status(200).json({
      Department: departments, Section: sections, User: users,
      Course: courses, Faculty: faculty, Enrollment: enrollments,
      Tlfq: tlfqs, Question: questions, Response: responses, Answer: answers
    });
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ message: 'Error exporting data', error: err.message });
  }
};

export const importData = async (req, res) => {
  try {
    const { data, mode } = req.body; // mode: 'merge' or 'overwrite'
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'Invalid or missing sync data payload' });
    }

    const collections = ['Department', 'Section', 'User', 'Course', 'Faculty', 'Enrollment', 'Tlfq', 'Question', 'Response', 'Answer'];

    await prisma.$transaction(async (tx) => {
      if (mode === 'overwrite') {
        // Wipes everything - reverse order to handle foreign key constraints if any
        for (const col of [...collections].reverse()) {
          const modelName = col.charAt(0).toLowerCase() + col.slice(1);
          await tx[modelName].deleteMany({});
        }
      }

      // Insert everything
      for (const col of collections) {
        if (data[col] && Array.isArray(data[col])) {
          const itemsToInsert = data[col].map(item => {
            const id = item.id || item._id;
            const cleanItem = { ...item };
            if (id) cleanItem.id = id;
            delete cleanItem._id;
            return cleanItem;
          });

          if (itemsToInsert.length > 0) {
            const modelName = col.charAt(0).toLowerCase() + col.slice(1);
            await tx[modelName].createMany({ 
              data: itemsToInsert,
              skipDuplicates: mode === 'merge' 
            });
          }
        }
      }
    });

    return res.status(200).json({ message: `Full system data synchronized successfully using mode: ${mode}` });
  } catch (err) {
    console.error('Import error:', err);
    return res.status(500).json({ message: 'Error importing and synchronizing data', error: err.message });
  }
};

export const getCurrentSession = async (req, res) => {
  try {
    let session = await AcademicSession.findFirst({ where: { is_active: true } });
    if (!session) {
      // fallback to most recent session
      const sessions = await AcademicSession.findMany({ orderBy: { start_year: 'desc' }, take: 1 });
      session = sessions[0] || null;
    }

    if (!session) return res.status(404).json({ message: 'No academic session found' });

    return res.json({ id: session.id, name: session.name, start_year: session.start_year, end_year: session.end_year, is_active: session.is_active });
  } catch (err) {
    console.error('Get current session error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
