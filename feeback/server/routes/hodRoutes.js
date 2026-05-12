import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getHodSections, getSectionFaculty, createTlfq, getMyForms,
  toggleForm, updateDeadline, getHodStats, togglePortal, getPortalStatus
} from '../controllers/hodController.js';

const router = express.Router();
const guard = [authenticate, authorize('hod')];

router.get('/sections',           guard, getHodSections);
router.get('/section-faculty',    guard, getSectionFaculty);
router.get('/stats',              guard, getHodStats);
router.get('/portal',             guard, getPortalStatus);
router.put('/portal',             guard, togglePortal);
router.post('/tlfq',              guard, createTlfq);
router.get('/tlfq',               guard, getMyForms);
router.put('/tlfq/:id/toggle',    guard, toggleForm);
router.put('/tlfq/:id/deadline',  guard, updateDeadline);

export default router;
