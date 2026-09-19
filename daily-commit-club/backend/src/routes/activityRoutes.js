import express from 'express';
import { getMyActivity, getMyTodayActivity, getUserActivity } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyActivity);
router.get('/me/today', protect, getMyTodayActivity);
router.get('/user/:id', getUserActivity);

export default router;
