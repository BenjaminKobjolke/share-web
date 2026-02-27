import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

let authStore;

beforeEach(async () => {
  sessionStorage.clear();
  vi.resetModules();
  const mod = await import('./auth.js');
  authStore = mod.authStore;
});

describe('authStore', () => {
  it('login stores credentials and updates store', () => {
    authStore.login('user', 'pass');
    const auth = get(authStore);
    expect(auth.username).toBe('user');
    expect(auth.password).toBe('pass');
  });

  it('loginAnonymous sets anonymous flag', () => {
    authStore.loginAnonymous();
    expect(get(authStore)).toEqual({ anonymous: true });
  });

  it('logout clears store to null', () => {
    authStore.login('user', 'pass');
    authStore.logout();
    expect(get(authStore)).toBeNull();
  });

  it('login persists to sessionStorage', () => {
    authStore.login('user', 'pass');
    const stored = JSON.parse(sessionStorage.getItem('share_auth'));
    expect(stored.username).toBe('user');
  });

  it('logout clears sessionStorage', () => {
    authStore.login('user', 'pass');
    authStore.logout();
    expect(sessionStorage.getItem('share_auth')).toBeNull();
  });
});
