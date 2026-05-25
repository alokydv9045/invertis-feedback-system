import express from 'express';
import { getStudentsList, getAllUsers, updateUser, deleteUser, createUser } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/students', authenticate, getStudentsList);
router.get('/all', authenticate, getAllUsers);
router.post('/', authenticate, createUser);
router.patch('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export default router;
