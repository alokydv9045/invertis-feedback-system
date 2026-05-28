import { supabase } from '../db.js';
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
    const { data, error } = await supabase.from('users').insert({
      name, email: email.toLowerCase(), password: hashed, role: 'super_admin', status: 'active'
    }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(400).json({ message: 'Email already in use.' });
      throw error;
    }
    return res.status(201).json({ id: data.id, name: data.name, email: data.email, role: 'super_admin' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── Create HOD ─────────────────────────────────────────────────────────────
export const createHod = async (req, res) => {
  try {
    const { name, email, password, department_id } = req.body;
    if (!name || !email || !password || !department_id) {
      return res.status(400).json({ message: 'name, email, password, department_id required' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const { data, error } = await supabase.from('users').insert({
      name, email: email.toLowerCase(), password: hashed, role: 'hod', department_id, status: 'active'
    }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(400).json({ message: 'Email already in use.' });
      throw error;
    }
    return res.status(201).json({ id: data.id, name: data.name, email: data.email, role: 'hod' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── Create Coordinator ─────────────────────────────────────────────────────
export const createCoordinator = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password required' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const { data, error } = await supabase.from('users').insert({
      name, email: email.toLowerCase(), password: hashed, role: 'coordinator', status: 'active'
    }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(400).json({ message: 'Email already in use.' });
      throw error;
    }
    return res.status(201).json({ id: data.id, name: data.name, email: data.email, role: 'coordinator' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── Get all staff ──────────────────────────────────────────────────────────
export const getStaff = async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('id, name, email, role, department_id').in('role', ['super_admin', 'hod', 'coordinator']);
    if (error) throw error;
    return res.json(data || []);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── Reveal student identity by anonymous ID ───────────────────────────
export const revealStudentByAnonId = async (req, res) => {
  try {
    const { anon_id } = req.query;
    if (!anon_id) return res.status(400).json({ message: 'anon_id query parameter is required.' });
    const { data: student } = await supabase
      .from('users')
      .select('*')
      .eq('unique_feedback_id', anon_id.trim().toUpperCase())
      .eq('role', 'student')
      .single();
    if (!student) return res.status(404).json({ message: 'No student found with that Anonymous ID.' });
    let section_name = null;
    if (student.section_id) {
      const { data: sec } = await supabase.from('sections').select('name').eq('id', student.section_id).single();
      section_name = sec?.name || null;
    }
    return res.json({
      id: student.id, name: student.name, email: student.email,
      student_id: student.student_id, unique_feedback_id: student.unique_feedback_id,
      status: student.status, semester: student.semester,
      batch: student.batch, points: student.points, section_name,
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
    const { data, error } = await supabase.from('users').update(updates).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ message: 'User not found' });
    return res.json({ id: data.id, name: data.name, email: data.email, role: data.role });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── Delete user ────────────────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    await supabase.from('users').delete().eq('id', req.params.id);
    return res.json({ message: 'User deleted' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};
