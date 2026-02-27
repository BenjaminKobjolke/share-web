import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredAuth, storeAuth, clearAuth, makeBasicHeader } from './auth.js';

beforeEach(() => {
  sessionStorage.clear();
});

describe('storeAuth / getStoredAuth', () => {
  it('stores and retrieves credentials', () => {
    storeAuth('user', 'pass');
    const auth = getStoredAuth();
    expect(auth).toEqual({ username: 'user', password: 'pass' });
  });

  it('returns null when nothing stored', () => {
    expect(getStoredAuth()).toBeNull();
  });
});

describe('clearAuth', () => {
  it('removes stored auth', () => {
    storeAuth('user', 'pass');
    clearAuth();
    expect(getStoredAuth()).toBeNull();
  });
});

describe('makeBasicHeader', () => {
  it('returns a Basic auth header string', () => {
    const header = makeBasicHeader('user', 'pass');
    expect(header).toBe('Basic ' + btoa('user:pass'));
  });
});
