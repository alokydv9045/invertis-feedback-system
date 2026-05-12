import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getStudentCourses, getEvaluation, submitResponse, getAnalytics, getLeaderboard } from '../controllers/responseController.js';

const router = express.Router();

router.get('/courses',         authenticate, authorize('student'), getStudentCourses);
router.get('/tlfq/:tlfqId',    authenticate, authorize('student'), getEvaluation);
router.post('/submit',         authenticate, authorize('student'), submitResponse);
router.get('/analytics',       authenticate, authorize('super_admin', 'hod'), getAnalytics);
router.get('/leaderboard',     authenticate, getLeaderboard);

export default router;
