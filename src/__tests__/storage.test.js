import { describe, it, expect, vi, beforeEach } from 'vitest';
import { safeReadStorage, writeStorage, removeStorage, clearAllStorage, KEYS } from '../services/storage';

// ─── Unit Tests: storage.js ───────────────────────────────────────────────────

describe('safeReadStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns fallback when key is absent', () => {
    expect(safeReadStorage('non_existent_key', [])).toEqual([]);
    expect(safeReadStorage('non_existent_key', null)).toBeNull();
  });

  it('parses valid JSON from localStorage', () => {
    localStorage.setItem('test_key', JSON.stringify({ value: 42 }));
    expect(safeReadStorage('test_key', {})).toEqual({ value: 42 });
  });

  it('returns fallback and removes entry for corrupt JSON', () => {
    localStorage.setItem('corrupt_key', '{{not valid json}}');
    const result = safeReadStorage('corrupt_key', 'fallback');
    expect(result).toBe('fallback');
    expect(localStorage.getItem('corrupt_key')).toBeNull();
  });

  it('parses arrays correctly', () => {
    localStorage.setItem('arr_key', JSON.stringify([1, 2, 3]));
    expect(safeReadStorage('arr_key', [])).toEqual([1, 2, 3]);
  });

  it('parses booleans correctly', () => {
    localStorage.setItem('bool_key', JSON.stringify(false));
    expect(safeReadStorage('bool_key', true)).toBe(false);
  });
});

describe('writeStorage', () => {
  beforeEach(() => { localStorage.clear(); });

  it('serialises objects to localStorage', () => {
    writeStorage('obj_key', { name: 'Abhinesh' });
    expect(localStorage.getItem('obj_key')).toBe('{"name":"Abhinesh"}');
  });

  it('serialises arrays to localStorage', () => {
    writeStorage('arr_key', [10, 20]);
    expect(localStorage.getItem('arr_key')).toBe('[10,20]');
  });
});

describe('removeStorage', () => {
  beforeEach(() => { localStorage.clear(); });

  it('removes a key from localStorage', () => {
    localStorage.setItem('to_remove', '"value"');
    removeStorage('to_remove');
    expect(localStorage.getItem('to_remove')).toBeNull();
  });

  it('does not throw when key does not exist', () => {
    expect(() => removeStorage('does_not_exist')).not.toThrow();
  });
});

describe('clearAllStorage', () => {
  beforeEach(() => { localStorage.clear(); });

  it('removes all EcoTrack KEYS from localStorage', () => {
    Object.values(KEYS).forEach(k => localStorage.setItem(k, '"data"'));
    clearAllStorage();
    Object.values(KEYS).forEach(k => {
      expect(localStorage.getItem(k)).toBeNull();
    });
  });

  it('does not touch unrelated keys', () => {
    localStorage.setItem('unrelated_app_key', '"safe"');
    clearAllStorage();
    expect(localStorage.getItem('unrelated_app_key')).toBe('"safe"');
  });
});
