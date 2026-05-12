import { supabase } from '../db.js';
import bcrypt from 'bcryptjs';

// ── GET /api/users/students
export const getStudentsList = async (req, res) => {
  try {
    const { role, department_id } = req.user;
    let query = supabase.from('users').select('*').eq('role', 'student');
    if (role === 'hod') query = query.eq('department_id', department_id);

    const { data: students, error } = await query;
    if (error) throw error;

    const result = await Promise.all((students || []).map(async student => {
      const { data: dept } = await supabase.from('departments').select('name').eq('id', student.department_id).single();
      const { count } = await supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('student_id', student.id);
      return {
        id: student.id, name: student.name, email: student.email,
        college_id: student.student_id,
        department_name: dept?.name || 'Unknown',
        enrollment_count: count || 0,
        created_at: student.created_at || new Date()
      };
    }));
    return res.status(200).json(result);
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── GET /api/users/all
export const getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) throw error;
    const result = await Promise.all((users || []).map(async u => {
      const { data: dept } = u.department_id
        ? await supabase.from('departments').select('name').eq('id', u.department_id).single()
        : { data: null };
      return { ...u, department_name: dept?.name || 'N/A' };
    }));
    return res.status(200).json(result);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── PATCH /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, college_id, department_id } = req.body;
    const { data: targetUser } = await supabase.from('users').select('*').eq('id', id).single();
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (req.user.role !== 'admin') {
      if (req.user.role === 'hod' && targetUser.department_id !== req.user.department_id) {
        return res.status(403).json({ message: 'Cannot edit students outside your department' });
      }
      if (req.user.role === 'student' && req.user.id !== id) {
        return res.status(403).json({ message: 'Cannot edit other users' });
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (college_id) updates.student_id = college_id;
    if (department_id) updates.department_id = department_id;

    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return res.status(200).json(data);
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: targetUser } = await supabase.from('users').select('department_id').eq('id', id).single();
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (req.user.role !== 'admin') {
      if (req.user.role === 'hod' && targetUser.department_id !== req.user.department_id) {
        return res.status(403).json({ message: 'Cannot delete students outside your department' });
      }
    }

    await supabase.from('enrollments').delete().eq('student_id', id);
    await supabase.from('users').delete().eq('id', id);
    return res.status(200).json({ message: 'User and related data deleted successfully' });
  } catch { return res.status(500).json({ message: 'Internal Server Error' }); }
};

// ── POST /api/users
export const createUser = async (req, res) => {
  try {
    const { name, email, college_id, department_id, password, role } = req.body;

    if (!name || !college_id || !password) {
      return res.status(400).json({ message: 'Name, College ID, and Password are required' });
    }

    const finalDeptId = req.user.role === 'hod' ? req.user.department_id : department_id;
    const finalRole = role || 'student';

    // Check existing
    const { data: existing } = await supabase.from('users').select('id').or(`email.eq.${email},student_id.eq.${college_id}`).single();
    if (existing) return res.status(400).json({ message: 'User with this Email or College ID already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase.from('users').insert({
      name,
      email: email || `${college_id}@invertis.edu.in`,
      student_id: college_id,
      department_id: finalDeptId,
      password: hashedPassword,
      role: finalRole,
      status: 'active'
    }).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Internal Server Error' }); }
};
