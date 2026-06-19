/**
 * Input Validation Helpers
 * All validation is centralised here so UI components never pass raw values
 * directly into domain calculation functions.
 *
 * PURE DOMAIN MODULE — no React, no DOM.
 */

/**
 * Strips HTML / script-injection characters from a free-text string.
 * Used on user name inputs before storing or displaying.
 * @param {string} str
 * @returns {string}
 */
export const sanitiseText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>&"'/\\]/g, '') // Strip XSS-prone characters
    .trim()
    .substring(0, 50);           // Hard length cap
};

/**
 * Clamps a numeric slider/input value within an inclusive [min, max] range.
 * Returns the fallback when value is not a finite number.
 * @param {number|string} raw
 * @param {number} min
 * @param {number} max
 * @param {number} fallback
 * @returns {number}
 */
export const clampNumber = (raw, min, max, fallback) => {
  const n = parseFloat(raw);
  if (!isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

/**
 * Validates that a string value is a member of an allowed set.
 * Protects enum-like select fields from prototype-pollution or injection.
 * @param {string} value
 * @param {string[]} allowed
 * @param {string} fallback
 * @returns {string}
 */
export const validateEnum = (value, allowed, fallback) => {
  return allowed.includes(value) ? value : fallback;
};

// ── Allowed enum sets used across onboarding ─────────────────────────────────
export const ALLOWED_COMMUTE_MODES = [
  'petrol_car', 'diesel_car', 'hybrid_car', 'electric_car', 'bus', 'train', 'active'
];
export const ALLOWED_DIET_TYPES = ['meat_heavy', 'balanced', 'vegetarian', 'vegan'];
export const ALLOWED_HOME_SIZES = ['small', 'medium', 'large'];
export const ALLOWED_RECYCLING_HABITS = ['none', 'partial_recycling', 'full_recycling'];
export const ALLOWED_PERSONAS = ['student', 'citizen', 'champion'];
