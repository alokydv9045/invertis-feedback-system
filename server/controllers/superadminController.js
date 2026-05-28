import { User, Section } from '../db.js';
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
    const data = await User.create({
      data: { name, email: email.toLowerCase(), password: hashed, role: 'super_admin', status: 'active' }
    });
    return res.status(201).json({ id: data.id, name: data.name, email: data.email, role: 'super_admin' });
  } catch (err) {
    if (err?.code === 'P2002') return res.status(400).json({ message: 'Email already in use.' });
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
    const data = await User.create({
      data: { name, email: email.toLowerCase(), password: hashed, role: 'hod', department_id, status: 'active' }
    });
    return res.status(201).json({ id: data.id, name: data.name, email: data.email, role: 'hod' });
  } catch (err) {
    if (err?.code === 'P2002') return res.status(400).json({ message: 'Email already in use.' });
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
    const data = await User.create({
      data: { name, email: email.toLowerCase(), password: hashed, role: 'coordinator', status: 'active' }
    });
    return res.status(201).json({ id: data.id, name: data.name, email: data.email, role: 'coordinator' });
  } catch (err) {
    if (err?.code === 'P2002') return res.status(400).json({ message: 'Email already in use.' });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Get all staff ──────────────────────────────────────────────────────────
export const getStaff = async (req, res) => {
  try {
    const data = await User.findMany({
      where: { role: { in: ['super_admin', 'hod', 'coordinator'] } },
      select: { id: true, name: true, email: true, role: true, department_id: true }
    });
    return res.json(data || []);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── Reveal student identity by anonymous ID ───────────────────────────
export const revealStudentByAnonId = async (req, res) => {
  try {
    const { anon_id } = req.query;
    if (!anon_id) return res.status(400).json({ message: 'anon_id query parameter is required.' });
    const student = await User.findFirst({
      where: { unique_feedback_id: anon_id.trim().toUpperCase(), role: 'student' },
      include: { section: { select: { name: true } } }
    });
    if (!student) return res.status(404).json({ message: 'No student found with that Anonymous ID.' });
    return res.json({
      id: student.id, name: student.name, email: student.email,
      student_id: student.student_id, unique_feedback_id: student.unique_feedback_id,
      status: student.status, semester: student.semester,
      batch: student.batch, points: student.points,
      section_name: student.section?.name || null,
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
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (department_id) updates.department_id = department_id;
    if (password) updates.password = await bcrypt.hash(password, 10);
    const data = await User.update({ where: { id: req.params.id }, data: updates });
    if (!data) return res.status(404).json({ message: 'User not found' });
    return res.json({ id: data.id, name: data.name, email: data.email, role: data.role });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── Delete user ────────────────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    await User.delete({ where: { id: req.params.id } });
    return res.json({ message: 'User deleted' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};
