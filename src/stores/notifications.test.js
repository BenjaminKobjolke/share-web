import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';

let notifications;

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  const mod = await import('./notifications.js');
  notifications = mod.notifications;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('notifications store', () => {
  it('starts empty', () => {
    expect(get(notifications)).toEqual([]);
  });

  it('adds a success notification', () => {
    notifications.success('Done');
    const items = get(notifications);
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('success');
    expect(items[0].message).toBe('Done');
  });

  it('adds an error notification', () => {
    notifications.error('Failed');
    const items = get(notifications);
    expect(items[0].type).toBe('error');
  });

  it('adds an info notification', () => {
    notifications.info('Note');
    const items = get(notifications);
    expect(items[0].type).toBe('info');
  });

  it('auto-removes after timeout', () => {
    notifications.info('Temp');
    expect(get(notifications)).toHaveLength(1);
    vi.advanceTimersByTime(5000);
    expect(get(notifications)).toHaveLength(0);
  });

  it('error notifications have longer timeout', () => {
    notifications.error('Oops');
    expect(get(notifications)).toHaveLength(1);
    vi.advanceTimersByTime(5000);
    expect(get(notifications)).toHaveLength(1);
    vi.advanceTimersByTime(2000);
    expect(get(notifications)).toHaveLength(0);
  });

  it('remove() removes by id', () => {
    notifications.success('First');
    notifications.success('Second');
    expect(get(notifications)).toHaveLength(2);
    const id = get(notifications)[0].id;
    notifications.remove(id);
    expect(get(notifications)).toHaveLength(1);
    expect(get(notifications)[0].message).toBe('Second');
  });
});
