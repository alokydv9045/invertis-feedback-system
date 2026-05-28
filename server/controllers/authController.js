import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Section, Department, Course, Faculty, Tlfq, Response, Enrollment, SectionFaculty, FEEDBACK_ID_PREFIX } from '../db.js';
import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  console.error('FATAL: JWT_SECRET not found in environment variables');
  process.exit(1);
}

function makeToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, department_id: user.department_id || null },
    SECRET,
    { expiresIn: '1d' }
  );
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    department_id: user.department_id || null,
    section_id: user.section_id || null,
    student_id: user.student_id || null,
    unique_feedback_id: user.unique_feedback_id || null,
    points: user.points || 0,
    batch: user.batch || null,
    semester: user.semester || null,
  };
}

// ── Step 1: Check student ID → returns status ──────────────────────────────
export const checkStudentId = async (req, res) => {
  try {
    const { student_id } = req.body;
    if (!student_id) return res.status(400).json({ message: 'Student ID is required.' });

    const user = await User.findFirst({ 
      where: { 
        student_id: student_id.trim().toUpperCase()
      } 
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User ID / Student ID not found.' });
    }

    return res.status(200).json({
      status: user.status,
      name: user.name,
      student_id: user.student_id
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Step 2: Complete registration (pending → active) ───────────────────────
export const completeRegistration = async (req, res) => {
  try {
    const { student_id, email, password } = req.body;
    if (!student_id || !email || !password) {
      return res.status(400).json({ message: 'Student ID, email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const user = await User.findFirst({ 
      where: { student_id: student_id.trim().toUpperCase() } 
    });
    
    if (!user) return res.status(404).json({ message: 'Student ID not found.' });
    if (user.status === 'active') {
      return res.status(400).json({ message: 'Account already activated. Please login normally.' });
    }
    if (user.status !== 'pending') {
      return res.status(400).json({ message: `Registration is not allowed for ${user.status} accounts.` });
    }

    const emailExists = await User.findFirst({ 
      where: { 
        email: email.trim().toLowerCase(), 
        NOT: { id: user.id } 
      } 
    });
    
    if (emailExists) return res.status(400).json({ message: 'Email is already in use.' });

    const hashed = await bcrypt.hash(password, 10);
    const fbId = FEEDBACK_ID_PREFIX + crypto.randomBytes(3).toString('hex').toUpperCase();

    const updated = await User.update({
      where: { id: user.id },
      data: {
        email: email.trim().toLowerCase(),
        password: hashed,
        status: 'active',
        unique_feedback_id: fbId
      }
    });

    const token = makeToken(updated);
    return res.status(200).json({ token, user: safeUser(updated) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Normal login (student_id / Login ID + password) ──────────────────────────
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: 'Identifier and password are required.' });

    // Login exclusively from IDs (student_id column)
    const user = await User.findFirst({ 
      where: { student_id: identifier.trim().toUpperCase() } 
    });

    if (!user) {
      return res.status(404).json({ message: 'User ID / Login ID not found.' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'ACCOUNT_PENDING', student_id: user.student_id, name: user.name });
    }
    if (user.status === 'alumni' || user.status === 'graduated') {
      return res.status(403).json({ message: 'Alumni accounts can no longer access the feedback portal.' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'ACCOUNT_INACTIVE', status: user.status });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Incorrect password.' });

    const token = makeToken(user);
    return res.status(200).json({ token, user: safeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findUnique({ 
      where: { id: req.user.id },
      include: {
        department: { select: { name: true, code: true } },
        section: { select: { name: true, code: true, semester: true, label: true } },
      }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ user: {
      ...safeUser(user),
      department_name: user.department?.name || null,
      department_code: user.department?.code || null,
      section_name: user.section?.name || null,
      section_code: user.section?.code || null,
    }});
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Change Password (allowed for all roles except student — coordinator handles that) ──
export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ message: 'current_password and new_password are required.' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }
    const user = await User.findUnique({ 
      where: { id: req.user.id } 
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isValid = await bcrypt.compare(current_password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Current password is incorrect.' });

    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    await User.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });
    
    return res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Profile Stats (role-specific aggregated data) ──────────────────────────
export const getProfileStats = async (req, res) => {
  try {
    const { id, role, department_id } = req.user;

    // ── Student stats ─────────────────────────────────────────────────────
    if (role === 'student') {
      const student = await User.findUnique({ where: { id } });
      if (!student) return res.status(404).json({ message: 'User not found' });

      const [totalSubmissions, enrolledCourses, availableForms, rank] = await Promise.all([
        Response.count({ where: { student_id: id } }),
        Enrollment.findMany({
          where: { student_id: id },
          include: { course: { select: { name: true, code: true } } }
        }),
        Tlfq.count({
          where: {
            section_id: student.section_id || undefined,
            is_active: true,
            closing_time: { gt: new Date() }
          }
        }),
        User.count({
          where: {
            role: 'student',
            points: { gt: student.points || 0 }
          }
        })
      ]);

      return res.json({
        role: 'student',
        totalSubmissions,
        points: student.points || 0,
        leaderboardRank: rank + 1,
        enrolledCourses: enrolledCourses.map(e => ({
          name: e.course?.name,
          code: e.course?.code
        })),
        availableForms,
        completedForms: totalSubmissions,
        completionRate: availableForms > 0 ? Math.round((totalSubmissions / availableForms) * 100) : 0
      });
    }

    // ── HOD stats ──────────────────────────────────────────────────────────
    if (role === 'hod') {
      const now = new Date();
      const [sections, faculty, students, totalForms, openForms, dept] = await Promise.all([
        Section.count({ where: { department_id } }),
        Faculty.count({ where: { department_id } }),
        User.count({ where: { role: 'student', department_id } }),
        Tlfq.count({ where: { created_by: id } }),
        Tlfq.count({ where: { created_by: id, is_active: true, closing_time: { gt: now } } }),
        Department.findUnique({ where: { id: department_id } })
      ]);

      return res.json({
        role: 'hod',
        sections, faculty, students, totalForms, openForms,
        portalOpen: dept?.portal_open ?? true,
        departmentName: dept?.name || 'Unknown'
      });
    }

    // ── Super Admin / Supreme stats ────────────────────────────────────────
    if (role === 'super_admin' || role === 'supreme') {
      const [departments, students, staff, totalForms, totalResponses] = await Promise.all([
        Department.count(),
        User.count({ where: { role: 'student' } }),
        User.count({ where: { role: { in: ['super_admin', 'hod', 'coordinator'] } } }),
        Tlfq.count(),
        Response.count()
      ]);

      return res.json({
        role,
        departments, students, staff, totalForms, totalResponses
      });
    }

    // ── Coordinator stats ──────────────────────────────────────────────────
    if (role === 'coordinator') {
      const [sections, faculty, students, courses, assignments] = await Promise.all([
        Section.count(),
        Faculty.count(),
        User.count({ where: { role: 'student' } }),
        Course.count(),
        SectionFaculty.count()
      ]);

      return res.json({
        role: 'coordinator',
        sections, faculty, students, courses, assignments
      });
    }

    return res.json({ role });
  } catch (err) {
    console.error('getProfileStats error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
