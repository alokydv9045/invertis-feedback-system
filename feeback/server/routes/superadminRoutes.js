import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { createSuperAdmin, createHod, createCoordinator, getStaff, updateUser, deleteUser, revealStudentByAnonId } from '../controllers/superadminController.js';

const router = express.Router();
const guard        = [authenticate, authorize('super_admin')];
const supremeGuard = [authenticate, authorize('supreme')];

// Only Supreme Authority can create Super Admin accounts
router.post('/superadmins',       supremeGuard, createSuperAdmin);

router.post('/hods',              guard, createHod);
router.post('/coordinators',      guard, createCoordinator);
router.get('/staff',              guard, getStaff);
router.put('/users/:id',          guard, updateUser);
router.delete('/users/:id',       guard, deleteUser);
router.get('/reveal',             guard, revealStudentByAnonId);

export default router;
