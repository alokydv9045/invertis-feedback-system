import express from 'express';
import { exportData, importData } from '../controllers/syncController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin-only endpoints
router.get('/export', authMiddleware, roleMiddleware(['admin']), exportData);
router.post('/import', authMiddleware, roleMiddleware(['admin']), importData);

export default router;
