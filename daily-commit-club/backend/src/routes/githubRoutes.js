import express from 'express';
import { verifyGitHubUrl } from '../controllers/githubController.js';

const router = express.Router();

router.post('/verify', verifyGitHubUrl);

export default router;
