import '@testing-library/jest-dom/vitest';

// Node v25 provides a native localStorage that lacks standard methods like .clear().
// Override with a proper in-memory implementation for tests.
function createStorage() {
  let store = {};
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { store = {}; },
    get length() { return Object.keys(store).length; },
    key(i) { return Object.keys(store)[i] ?? null; },
  };
}

globalThis.localStorage = createStorage();
