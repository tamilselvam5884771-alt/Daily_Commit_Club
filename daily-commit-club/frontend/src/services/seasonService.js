/**
 * Season Service for Daily Commit Club World
 * Computes realm season based on group/member streak day count:
 * - Day 1–7: Spring
 * - Day 8–14: Summer
 * - Day 15–21: Autumn
 * - Day 22–30: Winter
 * - Day 31+: Legendary
 */

export const getSeasonFromDay = (streakDay = 1) => {
  if (streakDay >= 31) return 'legendary';
  if (streakDay >= 22) return 'winter';
  if (streakDay >= 15) return 'autumn';
  if (streakDay >= 8) return 'summer';
  return 'spring';
};

export const SEASON_CONFIGS = {
  spring: {
    name: 'Spring Renewal',
    ambientColor: 'rgba(16, 185, 129, 0.15)',
    particles: 'sakura-petals',
    description: 'Soft green growth & gentle pollen breezes.'
  },
  summer: {
    name: 'Solstice Summer',
    ambientColor: 'rgba(245, 158, 11, 0.15)',
    particles: 'fireflies',
    description: 'Warm gold atmosphere & glowing fireflies.'
  },
  autumn: {
    name: 'Amber Harvest',
    ambientColor: 'rgba(234, 88, 12, 0.2)',
    particles: 'falling-leaves',
    description: 'Crisp winds & drifting golden leaves.'
  },
  winter: {
    name: 'Frost Solitude',
    ambientColor: 'rgba(59, 130, 246, 0.2)',
    particles: 'snowfall',
    description: 'Cold atmosphere & silent snowfall.'
  },
  legendary: {
    name: 'Starlight Apex',
    ambientColor: 'rgba(139, 92, 246, 0.25)',
    particles: 'aurora-starlight',
    description: 'Cosmic aurora & celestial starlight.'
  }
};
