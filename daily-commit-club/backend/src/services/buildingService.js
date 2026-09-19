import { Building } from '../models/Building.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

const DEFAULT_DAMAGE = parseInt(process.env.DAMAGE_PER_MISSED_DAY || '40', 10);

/**
 * Ensures the building remains alive (can optionally repair minor damage or log survival state)
 */
export const keepBuildingAlive = async (buildingId) => {
  const building = await Building.findById(buildingId);
  if (!building) return null;

  logger.info('BUILDING', `Building #${building.buildingNumber} (${building.name}) remains alive. Health: ${building.health}/${building.maxHealth}`);
  return {
    health: building.health,
    maxHealth: building.maxHealth,
    destroyed: building.destroyed,
    destructionCount: building.destructionCount
  };
};

/**
 * Reduces building health when owner misses a day.
 * Health is floored at 0 (never negative).
 * Destruction state & count increment strictly on transition to 0.
 */
export const damageBuilding = async (buildingId, damageAmount = DEFAULT_DAMAGE) => {
  const building = await Building.findById(buildingId);
  if (!building) return null;

  const previousHealth = building.health;
  const newHealth = Math.max(0, previousHealth - damageAmount);
  building.health = newHealth;

  if (newHealth === 0) {
    if (!building.destroyed) {
      building.destroyed = true;
      building.destructionCount += 1;
      logger.warn('BUILDING', `CRITICAL: Building #${building.buildingNumber} (${building.name}) DESTROYED! Total destructions: ${building.destructionCount}`);
    } else {
      logger.warn('BUILDING', `Building #${building.buildingNumber} is already destroyed (Health: 0/100).`);
    }
  } else {
    logger.warn('BUILDING', `Building #${building.buildingNumber} damaged by -${damageAmount}. Health: ${previousHealth} -> ${building.health}/${building.maxHealth}`);
  }

  await building.save();

  return {
    health: building.health,
    maxHealth: building.maxHealth,
    destroyed: building.destroyed,
    destructionCount: building.destructionCount
  };
};

/**
 * Manually destroy building
 */
export const destroyBuilding = async (buildingId) => {
  const building = await Building.findById(buildingId);
  if (!building) return null;

  if (!building.destroyed) {
    building.destructionCount += 1;
  }
  building.health = 0;
  building.destroyed = true;
  await building.save();

  logger.warn('BUILDING', `Building #${building.buildingNumber} forcefully destroyed.`);
  return building;
};

/**
 * Fully restores building health back to 100%
 */
export const restoreBuilding = async (buildingId) => {
  const building = await Building.findById(buildingId);
  if (!building) return null;

  building.health = building.maxHealth;
  building.destroyed = false;
  await building.save();

  logger.info('BUILDING', `Building #${building.buildingNumber} fully restored to 100% health.`);
  return building;
};

/**
 * Claims an unclaimed building for a user
 * Rules:
 * - One building can have only one owner
 * - One user can own only one building
 * - Two users cannot claim the same building
 */
export const claimBuilding = async (userId, targetBuildingId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const building = await Building.findById(targetBuildingId);
  if (!building) throw new Error('Building not found');

  // Check if building is already owned by another user
  if (building.ownerId && building.ownerId.toString() !== userId.toString()) {
    throw new Error('Building is already owned by another member');
  }

  // Check if user already owns a building
  if (user.buildingId) {
    if (user.buildingId.toString() === targetBuildingId.toString()) {
      return building; // Already owns this building
    }
    throw new Error('User already owns another building. A user can only own one building.');
  }

  building.ownerId = userId;
  await building.save();

  user.buildingId = building._id;
  await user.save();

  logger.info('BUILDING', `@${user.githubUsername} claimed Building #${building.buildingNumber} (${building.name})`);
  return building;
};
