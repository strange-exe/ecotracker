import { describe, it, expect } from 'vitest';
import {
  computeLevel,
  computeActivityPoints,
  computeActionPoints,
  checkLevelUp,
  WELCOME_BONUS_POINTS,
  POINTS_PER_LEVEL,
  CSV_IMPORT_BONUS
} from '../domain/scoring';

// ─── Unit Tests: scoring.js ───────────────────────────────────────────────────

describe('computeLevel', () => {
  it('returns Level 1 at 0 points', () => {
    expect(computeLevel(0)).toBe(1);
  });

  it('returns Level 1 at 99 points (not yet levelled up)', () => {
    expect(computeLevel(99)).toBe(1);
  });

  it('returns Level 2 at exactly 100 points', () => {
    expect(computeLevel(100)).toBe(2);
  });

  it('returns Level 2 at 199 points', () => {
    expect(computeLevel(199)).toBe(2);
  });

  it('returns Level 3 at 200 points', () => {
    expect(computeLevel(200)).toBe(3);
  });

  it('scales correctly at 1000 points → Level 11', () => {
    expect(computeLevel(1000)).toBe(11);
  });
});

describe('computeActivityPoints', () => {
  it('awards base + CO2 rate points for saving category', () => {
    const activity = { category: 'saving', co2e: 2.0 };
    // 2.0 * 15 = 30, + 10 base = 40
    expect(computeActivityPoints(activity)).toBe(40);
  });

  it('awards only base points for non-saving category', () => {
    expect(computeActivityPoints({ category: 'transport', co2e: 5 })).toBe(10);
    expect(computeActivityPoints({ category: 'diet', co2e: 1.6 })).toBe(10);
  });

  it('handles zero co2e savings correctly', () => {
    expect(computeActivityPoints({ category: 'saving', co2e: 0 })).toBe(10);
  });
});

describe('computeActionPoints', () => {
  it('returns healthBenefit.points from the action', () => {
    const action = { healthBenefit: { points: 30 } };
    expect(computeActionPoints(action)).toBe(30);
  });

  it('returns default 15 when healthBenefit is absent', () => {
    expect(computeActionPoints({})).toBe(15);
  });
});

describe('checkLevelUp', () => {
  it('detects level-up when points cross a POINTS_PER_LEVEL boundary', () => {
    // 95 → 105 crosses the 100 threshold
    const result = checkLevelUp(95, 105);
    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBe(2);
  });

  it('does not flag level-up within the same tier', () => {
    const result = checkLevelUp(50, 80);
    expect(result.leveledUp).toBe(false);
    expect(result.newLevel).toBe(1);
  });

  it('handles multi-tier leap correctly', () => {
    // 10 → 310 crosses both the 100 and 200 boundaries
    const result = checkLevelUp(10, 310);
    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBe(4);
  });
});

describe('Scoring constants', () => {
  it('WELCOME_BONUS_POINTS is a positive number', () => {
    expect(WELCOME_BONUS_POINTS).toBeGreaterThan(0);
  });

  it('POINTS_PER_LEVEL is a positive number', () => {
    expect(POINTS_PER_LEVEL).toBeGreaterThan(0);
  });

  it('CSV_IMPORT_BONUS is a positive number', () => {
    expect(CSV_IMPORT_BONUS).toBeGreaterThan(0);
  });
});
