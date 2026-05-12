import express from 'express';
import {
  getDepartments, createDepartment, deleteDepartment, togglePortal,
  getCourses, createCourse, deleteCourse,
  getAllFaculty, createFaculty, deleteFaculty,
  getCourseEvaluations, getSpecificEvaluation,
  createTlfq, getStudents, createEnrollment, getAdminStats,
  getLeaderboard
} from '../controllers/tlfqController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ── Public (authenticated) endpoints
router.get('/courses',                              authMiddleware, getCourses);
router.get('/departments',                          authMiddleware, getDepartments);
router.get('/courses/:courseId/evaluations',        authMiddleware, getCourseEvaluations);
router.get('/courses/:courseId/evaluation/:tlfqId', authMiddleware, getSpecificEvaluation);
router.get('/leaderboard',                          authMiddleware, getLeaderboard);

// ── HOD + Admin shared
router.get('/faculty', authMiddleware, roleMiddleware(['super_admin', 'admin', 'hod']), getAllFaculty);
router.get('/stats',   authMiddleware, roleMiddleware(['super_admin', 'admin', 'hod']), getAdminStats);
router.get('/students',authMiddleware, roleMiddleware(['super_admin', 'admin', 'hod']), getStudents);

// ── HOD can toggle portal for their own department
router.put('/departments/:id/portal', authMiddleware, roleMiddleware(['super_admin', 'admin', 'hod']), togglePortal);

// ── Admin + Super Admin management
router.post('/departments',   authMiddleware, roleMiddleware(['super_admin', 'admin']), createDepartment);
router.delete('/departments/:id', authMiddleware, roleMiddleware(['super_admin']), deleteDepartment);
router.post('/courses',       authMiddleware, roleMiddleware(['super_admin', 'admin']), createCourse);
router.delete('/courses/:id', authMiddleware, roleMiddleware(['super_admin']), deleteCourse);
router.post('/faculty',       authMiddleware, roleMiddleware(['super_admin', 'admin']), createFaculty);
router.delete('/faculty/:id', authMiddleware, roleMiddleware(['super_admin']), deleteFaculty);
router.post('/',              authMiddleware, roleMiddleware(['super_admin', 'admin', 'hod']), createTlfq);
router.post('/enrollments',   authMiddleware, roleMiddleware(['super_admin', 'admin']), createEnrollment);

export default router;
