import express from 'express';
import { login, getMe, checkStudentId, completeRegistration, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/check-student',         checkStudentId);
router.post('/complete-registration', completeRegistration);
router.post('/login',                 login);
router.get('/me',                     authenticate, getMe);
router.put('/change-password',        authenticate, changePassword);

export default router;
