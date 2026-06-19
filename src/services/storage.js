/**
 * Storage Service
 * Centralises all localStorage access for EcoTrack.
 * Components never read/write localStorage directly — they go through this module.
 */

const KEYS = {
  PROFILE: 'ecotrack_profile',
  ACTIVITIES: 'ecotrack_activities',
  ACTIONS: 'ecotrack_actions',
  STREAK: 'ecotrack_streak',
  POINTS: 'ecotrack_points'
};

export { KEYS };

/**
 * Safely reads and JSON-parses a localStorage value.
 * Returns `fallback` when the key is missing or the data is corrupt.
 * Removes the corrupt entry to prevent repeated failures.
 *
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export const safeReadStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    // Corrupted or tampered data — silently discard
    localStorage.removeItem(key);
    return fallback;
  }
};

/**
 * Serialises a value and writes it to localStorage.
 * @param {string} key
 * @param {*} value
 */
export const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

/**
 * Removes a key from localStorage.
 * @param {string} key
 */
export const removeStorage = (key) => {
  localStorage.removeItem(key);
};

/**
 * Clears all EcoTrack-owned keys from localStorage.
 */
export const clearAllStorage = () => {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
};
