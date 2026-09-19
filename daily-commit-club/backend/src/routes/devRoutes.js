import express from 'express';
import { simulateSuccess, simulateMiss, simulateGitHubError } from '../controllers/devController.js';

const router = express.Router();

// Middleware to disallow simulation endpoints in production environment
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Developer simulation routes are disabled in production environment',
        code: 'FORBIDDEN'
      }
    });
  }
  next();
});

router.post('/simulate-success/:userId', simulateSuccess);
router.post('/simulate-miss/:userId', simulateMiss);
router.post('/simulate-github-error/:userId', simulateGitHubError);

export default router;
