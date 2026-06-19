import { describe, it, expect } from 'vitest';
import { buildActivity, sanitiseCSVImport } from '../services/activityService';

// ─── Unit Tests: activityService.js ──────────────────────────────────────────

describe('buildActivity', () => {
  it('injects a secure id field', () => {
    const act = buildActivity({ category: 'saving', co2e: 1.0, label: 'Vegan meal' });
    expect(act.id).toMatch(/^log-/);
  });

  it('injects a date string', () => {
    const act = buildActivity({ category: 'saving', co2e: 1.0, label: 'Vegan meal' });
    expect(typeof act.date).toBe('string');
    expect(act.date.length).toBeGreaterThan(0);
  });

  it('preserves all input fields in the returned object', () => {
    const input = { category: 'transport', type: 'bus', amount: 10, co2e: 0.8, label: 'Bus ride' };
    const act = buildActivity(input);
    expect(act.category).toBe('transport');
    expect(act.type).toBe('bus');
    expect(act.co2e).toBe(0.8);
  });

  it('generates unique IDs for concurrent calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => buildActivity({ co2e: 0 }).id));
    expect(ids.size).toBe(20);
  });
});

describe('sanitiseCSVImport', () => {
  it('returns ok:false for non-array input', () => {
    expect(sanitiseCSVImport(null).ok).toBe(false);
    expect(sanitiseCSVImport('invalid').ok).toBe(false);
    expect(sanitiseCSVImport({}).ok).toBe(false);
  });

  it('returns ok:false for empty array', () => {
    expect(sanitiseCSVImport([]).ok).toBe(false);
  });

  it('returns ok:true and correct length for valid rows', () => {
    const rows = [
      { category: 'saving', co2e: 1.2, label: 'Row A' },
      { category: 'transport', co2e: 0.4, label: 'Row B' }
    ];
    const result = sanitiseCSVImport(rows);
    expect(result.ok).toBe(true);
    expect(result.logs).toHaveLength(2);
  });

  it('replaces IDs on each row with secure crypto ids', () => {
    const rows = [{ id: 'old-id-1', co2e: 1 }, { id: 'old-id-2', co2e: 2 }];
    const { logs } = sanitiseCSVImport(rows);
    logs.forEach((log, i) => {
      expect(log.id).not.toBe(`old-id-${i + 1}`);
      expect(log.id).toMatch(/^csv-/);
    });
  });

  it('preserves all non-id fields from rows', () => {
    const rows = [{ category: 'diet', co2e: 2.6, label: 'Meat meal' }];
    const { logs } = sanitiseCSVImport(rows);
    expect(logs[0].category).toBe('diet');
    expect(logs[0].co2e).toBe(2.6);
  });
});
