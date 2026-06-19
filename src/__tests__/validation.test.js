import { describe, it, expect } from 'vitest';
import {
  sanitiseText,
  clampNumber,
  validateEnum,
  ALLOWED_COMMUTE_MODES,
  ALLOWED_DIET_TYPES
} from '../domain/validation';

// ─── Unit Tests: validation.js ────────────────────────────────────────────────

describe('sanitiseText', () => {
  it('strips < > characters (XSS vectors)', () => {
    expect(sanitiseText('<script>alert(1)</script>')).not.toContain('<');
    expect(sanitiseText('<script>alert(1)</script>')).not.toContain('>');
  });

  it('strips & " characters', () => {
    const result = sanitiseText('test & "injected"');
    expect(result).not.toContain('&');
    expect(result).not.toContain('"');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitiseText('  Abhinesh  ')).toBe('Abhinesh');
  });

  it('truncates input exceeding 50 characters', () => {
    const long = 'A'.repeat(100);
    expect(sanitiseText(long).length).toBeLessThanOrEqual(50);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitiseText(null)).toBe('');
    expect(sanitiseText(123)).toBe('');
    expect(sanitiseText(undefined)).toBe('');
  });

  it('preserves normal alphanumeric text', () => {
    expect(sanitiseText('Abhinesh Kumar')).toBe('Abhinesh Kumar');
  });
});

describe('clampNumber', () => {
  it('clamps a value below the minimum to the minimum', () => {
    expect(clampNumber(-10, 0, 100, 50)).toBe(0);
  });

  it('clamps a value above the maximum to the maximum', () => {
    expect(clampNumber(500, 0, 300, 150)).toBe(300);
  });

  it('returns value unchanged when within range', () => {
    expect(clampNumber(100, 0, 300, 150)).toBe(100);
  });

  it('returns fallback for non-numeric input', () => {
    expect(clampNumber('abc', 0, 100, 42)).toBe(42);
    expect(clampNumber(NaN, 0, 100, 42)).toBe(42);
    expect(clampNumber(null, 0, 100, 42)).toBe(42);
  });

  it('parses numeric strings correctly', () => {
    expect(clampNumber('50', 0, 100, 0)).toBe(50);
  });
});

describe('validateEnum', () => {
  it('accepts a valid enum value', () => {
    expect(validateEnum('bus', ALLOWED_COMMUTE_MODES, 'petrol_car')).toBe('bus');
  });

  it('returns fallback for an unknown value', () => {
    expect(validateEnum('rocket_ship', ALLOWED_COMMUTE_MODES, 'petrol_car')).toBe('petrol_car');
  });

  it('returns fallback for an empty string', () => {
    expect(validateEnum('', ALLOWED_DIET_TYPES, 'balanced')).toBe('balanced');
  });

  it('is case-sensitive (no normalisation leakage)', () => {
    // 'BUS' should not match 'bus'
    expect(validateEnum('BUS', ALLOWED_COMMUTE_MODES, 'petrol_car')).toBe('petrol_car');
  });
});
