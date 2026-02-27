import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

let settingsStore;

beforeEach(async () => {
  localStorage.clear();
  vi.resetModules();
  const mod = await import('./settings.js');
  settingsStore = mod.settingsStore;
});

describe('settingsStore', () => {
  it('starts with empty object when nothing in localStorage', () => {
    expect(get(settingsStore)).toEqual({});
  });

  it('persists to localStorage on set', () => {
    settingsStore.set({ _project: 'test' });
    const stored = JSON.parse(localStorage.getItem('share_settings'));
    expect(stored._project).toBe('test');
  });

  it('persists to localStorage on update', () => {
    settingsStore.set({ _project: 'a' });
    settingsStore.update(s => ({ ...s, _email: true }));
    const stored = JSON.parse(localStorage.getItem('share_settings'));
    expect(stored._project).toBe('a');
    expect(stored._email).toBe(true);
  });

  it('loads from localStorage on creation', async () => {
    localStorage.setItem('share_settings', JSON.stringify({ _project: 'loaded' }));
    vi.resetModules();
    const mod = await import('./settings.js');
    expect(get(mod.settingsStore)._project).toBe('loaded');
  });
});
