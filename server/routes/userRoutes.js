import express from 'express';
import { getStudentsList, getAllUsers, updateUser, deleteUser, createUser } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/students', authMiddleware, getStudentsList);
router.get('/all', authMiddleware, getAllUsers);
router.post('/', authMiddleware, createUser);
router.patch('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;
