import { writable } from 'svelte/store';

function createNotificationStore() {
  const { subscribe, update } = writable([]);

  let nextId = 0;

  function add(message, type = 'info', duration = 4000) {
    const id = nextId++;
    update((n) => [...n, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }

  function remove(id) {
    update((n) => n.filter((item) => item.id !== id));
  }

  return {
    subscribe,
    success: (msg) => add(msg, 'success'),
    error: (msg) => add(msg, 'error', 6000),
    info: (msg) => add(msg, 'info'),
    remove,
  };
}

export const notifications = createNotificationStore();
