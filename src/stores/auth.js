import { writable } from 'svelte/store';
import { getStoredAuth, storeAuth, clearAuth } from '../lib/auth.js';

function createAuthStore() {
  const stored = getStoredAuth();
  const { subscribe, set } = writable(stored);

  return {
    subscribe,
    login(username, password) {
      storeAuth(username, password);
      set({ username, password });
    },
    loginAnonymous() {
      clearAuth();
      set({ anonymous: true });
    },
    logout() {
      clearAuth();
      set(null);
    },
  };
}

export const authStore = createAuthStore();
