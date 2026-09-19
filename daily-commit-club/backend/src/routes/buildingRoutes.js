import express from 'express';
import { getAllBuildings, getBuildingById, claimUserBuilding } from '../controllers/buildingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllBuildings);
router.get('/:id', getBuildingById);
router.post('/:id/claim', protect, claimUserBuilding);

export default router;
