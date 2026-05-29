import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Section, Department, Tlfq, SectionFaculty, Course, Enrollment, FEEDBACK_ID_PREFIX } from '../db.js';
import crypto from 'crypto';
import multer from 'multer';

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
    profile_photo: user.profile_photo || null,
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
      include: { department: true, section: true }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ 
      user: {
        ...safeUser(user),
        department_name: user.department?.name || null,
        section_name: user.section?.name || null,
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Profile photo upload (base64 in DB — works on ephemeral FS like Render) ──
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max for DB storage
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    if (allowed.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files (jpg, png, webp, gif) are allowed'));
  }
});

export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    
    // Convert buffer to base64 data URL
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
    
    await User.update({
      where: { id: req.user.id },
      data: { profile_photo: dataUrl }
    });
    
    return res.json({ message: 'Photo uploaded successfully.', profile_photo: dataUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ message: 'Failed to upload photo.' });
  }
};

// ── Profile data (role-specific stats for profile popup) ────────────────────
export const getProfileData = async (req, res) => {
  try {
    const user = await User.findUnique({
      where: { id: req.user.id },
      include: { department: true, section: true }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const base = {
      ...safeUser(user),
      department_name: user.department?.name || null,
      section_name: user.section?.name || null,
    };

    let stats = {};
    let accessLevel = '';
    let quickActions = [];

    const role = user.role;
    const deptId = user.department_id;

    if (role === 'coordinator' || role === 'super_admin' || role === 'supreme') {
      const where = (role === 'coordinator' && deptId) ? { department_id: deptId } : {};
      const [sections, courses, faculty, students, assignments] = await Promise.all([
        Section.count({ where }),
        Course.count({ where }),
        User.count({ where: { ...where, role: 'hod' } }).catch(() => 0),
        User.count({ where: { ...where, role: 'student' } }),
        SectionFaculty.count(where.department_id ? { where: { section: { department_id: where.department_id } } } : {}),
      ]);
      stats = { sections, courses, faculty, students, assignments, systemStatus: 'Online' };
      accessLevel = role === 'coordinator' ? 'Department-wide — Sections, Faculty & Student Management' 
                  : 'University-wide — Sections, Faculty & Student Management';
      quickActions = [
        { label: 'Manage Sections & Faculty', to: '/coordinator?tab=sections' },
        { label: 'Manage Students', to: '/coordinator?tab=students' },
        { label: 'View Leaderboard', to: '/leaderboard' },
      ];
    } else if (role === 'hod') {
      const [sections, courses, faculty, students, myForms, openForms] = await Promise.all([
        Section.count({ where: { department_id: deptId } }),
        Course.count({ where: { department_id: deptId } }),
        SectionFaculty.count({ where: { section: { department_id: deptId } } }),
        User.count({ where: { department_id: deptId, role: 'student' } }),
        Tlfq.count({ where: { created_by: user.id } }),
        Tlfq.count({ where: { created_by: user.id, is_active: true } }),
      ]);
      stats = { sections, courses, faculty, students, myForms, openForms };
      accessLevel = 'Department-level — Evaluation Forms, Analytics & Portal Control';
      quickActions = [
        { label: 'Create Evaluation Form', to: '/hod?tab=create' },
        { label: 'View Analytics', to: '/analytics' },
        { label: 'View Leaderboard', to: '/leaderboard' },
      ];
    } else {
      // Student
      const [formsSubmitted, enrollmentCount] = await Promise.all([
        Tlfq.count({ where: { responses: { some: { student_id: user.id } } } }).catch(() => 0),
        Enrollment.count({ where: { student_id: user.id } }),
      ]);
      stats = { formsSubmitted, enrollments: enrollmentCount, points: user.points };
      accessLevel = 'Student — Feedback Submission & Leaderboard';
      quickActions = [
        { label: 'My Dashboard', to: '/dashboard' },
        { label: 'View Leaderboard', to: '/leaderboard' },
      ];
    }

    return res.json({ user: base, stats, accessLevel, quickActions });
  } catch (err) {
    console.error('getProfileData error:', err);
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
