import express from 'express';
import { getAllUsers, getMyProfile, updateMyProfile, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/me', protect, getMyProfile);
router.patch('/me', protect, updateMyProfile);
router.get('/:id', getUserById);

export default router;
