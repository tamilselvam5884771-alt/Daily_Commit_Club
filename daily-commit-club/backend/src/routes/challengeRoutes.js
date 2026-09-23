import express from 'express';
import {
  getActiveChallenge,
  getChallengeStatus,
  syncSingleUser,
  checkAllUsers,
  checkSingleUser,
  testSuccessCommit,
  testMissedCommit,
  testNotification
} from '../controllers/challengeController.js';

const router = express.Router();

// Public challenge status & sync
router.get('/', getActiveChallenge);
router.get('/status', getChallengeStatus);
router.post('/sync-user/:userId', syncSingleUser);

// Development / Testing endpoints
router.post('/check-all', checkAllUsers);
router.post('/check-user/:userId', checkSingleUser);
router.post('/test-success/:userId', testSuccessCommit);
router.post('/test-missed/:userId', testMissedCommit);

export default router;
