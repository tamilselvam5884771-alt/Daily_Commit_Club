import express from 'express';
import { githubLogin, githubCallback, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);
router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
