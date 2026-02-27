import { writable } from 'svelte/store';

const STORAGE_KEY = 'share_settings';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function createSettingsStore() {
  const { subscribe, set, update } = writable(load());
  return {
    subscribe,
    set(values) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      set(values);
    },
    update(fn) {
      update((current) => {
        const next = fn(current);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
  };
}

export const settingsStore = createSettingsStore();
