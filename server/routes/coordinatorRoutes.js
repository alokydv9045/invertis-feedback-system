import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getDepartments, createDepartment, deleteDepartment,
  getSections, createSection, deleteSection,
  getCourses, createCourse, deleteCourse,
  getFaculty, createFaculty, deleteFaculty,
  assignFacultyToSection, removeAssignment,
  getStudents, preCreateStudent, resetStudentPassword, updateStudent,
  bulkImportStudents
} from '../controllers/coordinatorController.js';

const router = express.Router();
const guard = [authenticate, authorize('coordinator', 'super_admin')];

// Departments (coordinator can view all; super_admin creates)
router.get('/departments',         guard, getDepartments);
router.post('/departments',        [authenticate, authorize('super_admin')], createDepartment);
router.delete('/departments/:id',  [authenticate, authorize('super_admin')], deleteDepartment);

// Sections
router.get('/sections',            guard, getSections);
router.post('/sections',           guard, createSection);
router.delete('/sections/:id',     guard, deleteSection);

// Courses
router.get('/courses',             guard, getCourses);
router.post('/courses',            guard, createCourse);
router.delete('/courses/:id',      guard, deleteCourse);

// Faculty
router.get('/faculty',             guard, getFaculty);
router.post('/faculty',            guard, createFaculty);
router.delete('/faculty/:id',      guard, deleteFaculty);

// Section-Faculty assignments
router.post('/assignments',        guard, assignFacultyToSection);
router.delete('/assignments/:id',  guard, removeAssignment);

// Students
router.get('/students',            guard, getStudents);
router.post('/students',           guard, preCreateStudent);
router.put('/students/:id',        guard, updateStudent);
router.post('/students/bulk',   guard, bulkImportStudents);
router.put('/students/:id/reset-password', guard, resetStudentPassword);

export default router;
