import { User, Department, Enrollment } from '../db.js';
import bcrypt from 'bcryptjs';

// ── GET /api/users/students
export const getStudentsList = async (req, res) => {
  try {
    const { role, department_id } = req.user;
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    let query = { role: 'student' };

    if (role === 'hod') {
      query.department_id = department_id;
    } else if (role !== 'admin' && role !== 'super_admin' && role !== 'coordinator') {
      return res.status(403).json({ message: 'Unauthorized access to user list' });
    }

    const [students, total] = await Promise.all([
      User.findMany({
        where: query,
        include: {
          department: true,
          _count: {
            select: { enrollments: true }
          }
        },
        skip,
        take,
        orderBy: { name: 'asc' }
      }),
      User.count({ where: query })
    ]);

    const result = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      student_id: student.student_id,
      department_name: student.department ? student.department.name : 'Unknown',
      enrollment_count: student._count.enrollments,
      status: student.status
    }));

    return res.status(200).json({
      students: result,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── GET /api/users/all [Admin only - for HOD/Admin management]
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Math.min(Number(limit), 200); // Cap at 200

    const [users, total] = await Promise.all([
      User.findMany({
        include: { department: true },
        skip,
        take,
        orderBy: { name: 'asc' }
      }),
      User.count()
    ]);

    const result = users.map(u => ({
      ...u,
      password: undefined, // Never expose password hashes
      department_name: u.department ? u.department.name : 'N/A'
    }));

    return res.status(200).json({
      users: result,
      pagination: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── PATCH /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, student_id, department_id } = req.body;
    
    const targetUser = await User.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (req.user.role === 'hod' && targetUser.department_id !== req.user.department_id) {
        return res.status(403).json({ message: 'Cannot edit students outside your department' });
      }
      if (req.user.role === 'student' && req.user.id !== id) {
        return res.status(403).json({ message: 'Cannot edit other users' });
      }
    }

    const updated = await User.update({
      where: { id },
      data: { name, email, student_id, department_id }
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const targetUser = await User.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (req.user.role === 'hod' && targetUser.department_id !== req.user.department_id) {
        return res.status(403).json({ message: 'Cannot delete students outside your department' });
      }
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Prisma handle cascading if defined, but we'll do manual cleanup as per original logic
    await Enrollment.deleteMany({ where: { student_id: id } });
    await User.delete({ where: { id } });
    
    return res.status(200).json({ message: 'User and related data deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── POST /api/users
export const createUser = async (req, res) => {
  try {
    const { name, email, student_id, department_id, password, role } = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'hod') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!name || !student_id || !password) {
      return res.status(400).json({ message: 'Name, Student ID, and Password are required' });
    }

    const finalDeptId = req.user.role === 'hod' ? req.user.department_id : department_id;
    const finalRole = role || 'student';

    const existing = await User.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          { student_id }
        ].filter(cond => Object.keys(cond).length > 0)
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'User with this Email or Student ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      data: {
        name,
        email: email || `${student_id}@invertis.edu.in`,
        student_id,
        department_id: finalDeptId,
        password: hashedPassword,
        role: finalRole,
        status: 'active'
      }
    });

    const result = { ...newUser };
    delete result.password;

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
