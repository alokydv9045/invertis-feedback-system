import express from 'express';
import { exportData, importData, getCurrentSession } from '../controllers/syncController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin-only endpoints
router.get('/export', authenticate, authorize('super_admin', 'admin'), exportData);
router.post('/import', authenticate, authorize('super_admin', 'admin'), importData);

// Return current active academic session (any authenticated user)
router.get('/session/current', authenticate, getCurrentSession);

export default router;
