/**
 * Shared 3D Tilt Mouse Handlers
 * Respects prefers-reduced-motion for accessibility.
 * Eliminates code duplication across Dashboard, Onboarding, and other card components.
 */

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Handles mousemove on a tilt-card wrapper to produce CSS variable-driven 3D tilt.
 * @param {React.MouseEvent} e - The synthetic mouse event from React.
 * @param {number} maxDeg - Maximum rotation degrees (default 6).
 */
export const handleTiltMove = (e, maxDeg = 6) => {
  if (prefersReducedMotion()) return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const xc = x / rect.width - 0.5;
  const yc = y / rect.height - 0.5;
  el.style.setProperty('--rx', `${(-yc * maxDeg).toFixed(2)}deg`);
  el.style.setProperty('--ry', `${(xc * maxDeg).toFixed(2)}deg`);
  el.style.setProperty('--mx', `${((x / rect.width) * 100).toFixed(1)}%`);
  el.style.setProperty('--my', `${((y / rect.height) * 100).toFixed(1)}%`);
};

/**
 * Resets 3D tilt CSS variables when mouse leaves the card.
 * @param {React.MouseEvent} e
 */
export const handleTiltLeave = (e) => {
  const el = e.currentTarget;
  el.style.setProperty('--rx', '0deg');
  el.style.setProperty('--ry', '0deg');
};
