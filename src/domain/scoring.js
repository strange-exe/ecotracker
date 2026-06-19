/**
 * Scoring Domain Logic
 * Handles points, levels, and streak calculations.
 *
 * PURE DOMAIN MODULE — no React imports, no DOM, no localStorage.
 */

/** Points earned per kg CO2 saved */
const CO2_POINTS_RATE = 15;
/** Base points for any logged activity */
const BASE_LOG_POINTS = 10;
/** Points rewarded for onboarding completion */
export const WELCOME_BONUS_POINTS = 50;
/** Points earned per 100 points = 1 level */
export const POINTS_PER_LEVEL = 100;
/** Points for CSV bulk import */
export const CSV_IMPORT_BONUS = 25;

/**
 * Computes the user's level from their total points.
 * @param {number} points
 * @returns {number}
 */
export const computeLevel = (points) => Math.floor(points / POINTS_PER_LEVEL) + 1;

/**
 * Computes points to reward for a logged activity.
 * @param {{ category: string, co2e: number }} activity
 * @returns {number}
 */
export const computeActivityPoints = (activity) => {
  if (activity.category === 'saving') {
    return Math.round(activity.co2e * CO2_POINTS_RATE) + BASE_LOG_POINTS;
  }
  return BASE_LOG_POINTS;
};

/**
 * Computes points to reward for completing an eco action.
 * @param {{ healthBenefit: { points: number } }} action
 * @returns {number}
 */
export const computeActionPoints = (action) => action.healthBenefit?.points ?? 15;

/**
 * Determines whether a level-up occurred between two point totals.
 * @param {number} prevPoints
 * @param {number} nextPoints
 * @returns {{ leveledUp: boolean, newLevel: number }}
 */
export const checkLevelUp = (prevPoints, nextPoints) => {
  const prevLevel = computeLevel(prevPoints);
  const nextLevel = computeLevel(nextPoints);
  return {
    leveledUp: nextLevel > prevLevel,
    newLevel: nextLevel
  };
};
