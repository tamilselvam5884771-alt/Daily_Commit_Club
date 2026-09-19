import { Building } from '../models/Building.js';
import { claimBuilding } from '../services/buildingService.js';

/**
 * List all buildings
 */
export const getAllBuildings = async (req, res, next) => {
  try {
    const buildings = await Building.find()
      .sort({ buildingNumber: 1 })
      .populate('ownerId', 'githubUsername name profileImage githubAvatar currentStreak');

    return res.status(200).json({
      success: true,
      data: buildings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get building details by ID or Building Number
 */
export const getBuildingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let building;

    // Check if ID is a building number (1-10) or ObjectId
    if (!isNaN(id) && parseInt(id, 10) >= 1 && parseInt(id, 10) <= 10) {
      building = await Building.findOne({ buildingNumber: parseInt(id, 10) }).populate('ownerId', 'githubUsername name profileImage githubAvatar currentStreak');
    } else {
      building = await Building.findById(id).populate('ownerId', 'githubUsername name profileImage githubAvatar currentStreak');
    }

    if (!building) {
      return res.status(404).json({
        success: false,
        error: { message: 'Building not found', code: 'NOT_FOUND' }
      });
    }

    return res.status(200).json({
      success: true,
      data: building
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Claim a building
 */
export const claimUserBuilding = async (req, res, next) => {
  try {
    const { id } = req.params; // Building ID or Building Number
    let targetBuildingId = id;

    if (!isNaN(id)) {
      const b = await Building.findOne({ buildingNumber: parseInt(id, 10) });
      if (!b) {
        return res.status(404).json({
          success: false,
          error: { message: `Building #${id} not found`, code: 'NOT_FOUND' }
        });
      }
      targetBuildingId = b._id;
    }

    const building = await claimBuilding(req.user._id, targetBuildingId);

    return res.status(200).json({
      success: true,
      data: building
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: { message: error.message, code: 'CLAIM_FAILED' }
    });
  }
};
