import { prisma, User, Section, SectionFaculty, Tlfq, Department } from '../db.js';
import bcrypt from 'bcryptjs';

// ── Create Super Admin (only Supreme Authority can do this) ──────────────
export const createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password required' });
    }
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    
    const hashed = await bcrypt.hash(password, 10);
    const admin = await User.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed,
        role: 'super_admin',
        status: 'active'
      }
    });
    
    return res.status(201).json({ id: admin.id, name: admin.name, email: admin.email, role: 'super_admin' });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'Email already in use.' });
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Create HOD ─────────────────────────────────────────────────────────────
export const createHod = async (req, res) => {
  try {
    const { name, email, password, department_id } = req.body;
    if (!name || !email || !password || !department_id) {
      return res.status(400).json({ message: 'name, email, password, department_id required' });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const hod = await User.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed,
        role: 'hod',
        department_id,
        status: 'active'
      }
    });
    
    return res.status(201).json({ id: hod.id, name: hod.name, email: hod.email, role: 'hod' });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'Email already in use.' });
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Create Coordinator ─────────────────────────────────────────────────────
export const createCoordinator = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password required' });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const coord = await User.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed,
        role: 'coordinator',
        status: 'active'
      }
    });
    
    return res.status(201).json({ id: coord.id, name: coord.name, email: coord.email, role: 'coordinator' });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'Email already in use.' });
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Get all staff ──────────────────────────────────────────────────────────
export const getStaff = async (req, res) => {
  try {
    const staff = await User.findMany({
      where: {
        role: { in: ['super_admin', 'hod', 'coordinator'] }
      }
    });
    
    return res.json(staff.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      department_id: s.department_id
    })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Reveal student identity by anonymous ID ───────────────────────────
export const revealStudentByAnonId = async (req, res) => {
  try {
    const { anon_id } = req.query;
    if (!anon_id) return res.status(400).json({ message: 'anon_id query parameter is required.' });
    
    const student = await User.findFirst({
      where: {
        unique_feedback_id: anon_id.trim().toUpperCase(),
        role: 'student'
      },
      include: {
        section: true
      }
    });
    
    if (!student) return res.status(404).json({ message: 'No student found with that Anonymous ID.' });
    
    return res.json({
      id:                 student.id,
      name:               student.name,
      email:              student.email,
      student_id:         student.student_id,
      unique_feedback_id: student.unique_feedback_id,
      status:             student.status,
      semester:           student.semester,
      batch:              student.batch,
      points:             student.points,
      section_name:       student.section?.name || null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Update user ────────────────────────────────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const { name, email, password, department_id } = req.body;
    const data = {};
    if (name) data.name = name;
    if (email) data.email = email.toLowerCase();
    if (department_id) data.department_id = department_id;
    if (password) data.password = await bcrypt.hash(password, 10);
    
    const user = await User.update({
      where: { id: req.params.id },
      data
    });
    
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Delete user ────────────────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    await User.delete({ where: { id: req.params.id } });
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
// ── Semester Change (Super Admin) ──────────────────────────────────────────
export const semesterChange = async (req, res) => {
  try {
    const departments = await Department.findMany();

    // Wrap ALL steps in a transaction — if any step fails, everything rolls back
    await prisma.$transaction(async (tx) => {
      // 1. Move students in their last semester to 'alumni' status
      for (const dept of departments) {
        const maxSem = dept.max_semester || 8;
        await tx.user.updateMany({
          where: { role: 'student', department_id: dept.id, semester: { gte: maxSem } },
          data: { status: 'alumni' }
        });
      }

      // 2. Increment semester for all non-alumni students
      await tx.user.updateMany({
        where: { role: 'student', status: { not: 'alumni' } },
        data: { semester: { increment: 1 } }
      });

      // 3. Increment semester for all sections
      await tx.section.updateMany({
        data: { semester: { increment: 1 } }
      });

      // 4. Clear faculty assignments (teachers change every semester)
      await tx.sectionFaculty.deleteMany({});

      // 5. Deactivate old TLFQ forms
      await tx.tlfq.updateMany({
        data: { is_active: false }
      });
    });

    return res.json({ message: 'Semester changed successfully. All students advanced and faculty assignments reset.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Semester change failed. Transaction rolled back. No data was modified.' });
  }
};
