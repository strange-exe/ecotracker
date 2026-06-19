import '@testing-library/jest-dom';

/**
 * Global localStorage mock for vitest / jsdom.
 * jsdom provides localStorage but .clear() may be undefined in some configurations.
 * We create a robust in-memory store that fully implements the Storage interface.
 */
const localStorageMock = (() => {
  let store = {};
  return {
    getItem:    (key) => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
    setItem:    (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear:      () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key:        (i) => Object.keys(store)[i] ?? null
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});
