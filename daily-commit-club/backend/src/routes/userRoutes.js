import express from 'express';
import { getMyProfile, updateMyProfile, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.patch('/me', protect, updateMyProfile);
router.get('/:id', getUserById);

export default router;
