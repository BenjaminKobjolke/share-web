import { writable } from 'svelte/store';

export const entriesStore = writable({
  entries: [],
  total: 0,
  page: 1,
  perPage: 20,
  loading: false,
  error: null,
});
