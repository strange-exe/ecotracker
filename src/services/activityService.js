/**
 * Activity Service
 * Business rules for logging, removing, and importing activities.
 * Keeps mutation logic out of UI components.
 */

/**
 * Cryptographically secure ID generator.
 * Replaces Date.now() / Math.random() to prevent collisions.
 * @param {string} prefix
 * @returns {string}
 */
export const generateSecureId = (prefix = 'log') => {
  const array = new Uint32Array(2);
  window.crypto.getRandomValues(array);
  return `${prefix}-${array[0].toString(36)}-${array[1].toString(36)}`;
};

/**
 * Constructs a new activity record ready to be appended to state.
 * @param {Object} activityData - Partial activity fields from a log handler
 * @returns {Object} Full activity record with id and date
 */
export const buildActivity = (activityData) => ({
  id: generateSecureId('log'),
  date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  ...activityData
});

/**
 * Validates and sanitises imported CSV log rows.
 * Replaces any existing IDs with secure cryptographic ones.
 * @param {Array} rows - Raw parsed CSV rows
 * @returns {{ ok: boolean, logs: Array, error?: string }}
 */
export const sanitiseCSVImport = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, logs: [], error: 'Invalid CSV format. No data imported.' };
  }
  const logs = rows.map((row, index) => ({
    ...row,
    id: generateSecureId(`csv-${index}`)
  }));
  return { ok: true, logs };
};
