<script>
  import { get } from 'svelte/store';
  import { settingsStore } from '../stores/settings.js';
  import { notifications } from '../stores/notifications.js';
  import { getFields, getResourceItems } from '../lib/api.js';
  import { link } from 'svelte-spa-router';

  let fields = $state([]);
  let values = $state({});
  let resourceOptions = $state({});
  let loading = $state(true);
  let error = $state(null);

  function formatLabel(name) {
    return name.replace(/^_/, '').replace(/^\w/, c => c.toUpperCase());
  }

  function defaultForType(field) {
    if (field.resource) return '';
    if (field.type === 'bool') return true;
    return '';
  }

  async function loadFields() {
    try {
      const res = await getFields();
      fields = res.data.filter(f => f.name !== '_id');
      const settings = get(settingsStore);
      const vals = {};
      for (const f of fields) {
        vals[f.name] = settings[f.name] ?? defaultForType(f);
      }
      values = vals;

      await Promise.all(fields.filter(f => f.resource).map(async (f) => {
        try {
          const res = await getResourceItems(f.resource.path);
          resourceOptions[f.name] = res.data;
        } catch {
          resourceOptions[f.name] = [];
        }
      }));
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  loadFields();

  function handleSave(e) {
    e.preventDefault();
    const toSave = {};
    for (const f of fields) {
      const v = values[f.name];
      if (f.resource) {
        toSave[f.name] = v === '' ? '' : Number(v);
      } else if (f.type === 'string') {
        toSave[f.name] = typeof v === 'string' ? v.trim() : '';
      } else {
        toSave[f.name] = v;
      }
    }
    settingsStore.set(toSave);
    notifications.success('Settings saved');
  }
</script>

<div class="max-w-lg mx-auto">
  <div class="mb-6">
    <a href="/settings" use:link class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">&larr; Back to Settings</a>
  </div>
  <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Built-in Values</h1>

  {#if loading}
    <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
      <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      Loading fields...
    </div>
  {:else if error}
    <div class="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-4">
      Failed to load fields: {error}
    </div>
  {:else}
    <form onsubmit={handleSave} class="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
      {#each fields as field (field.name)}
        <div>
          {#if field.resource}
            <label for="settings-{field.name}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{formatLabel(field.name)}</label>
            <select
              id="settings-{field.name}"
              bind:value={values[field.name]}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">None</option>
              {#each resourceOptions[field.name] || [] as item}
                <option value={item.id}>{item.name}</option>
              {/each}
            </select>
          {:else if field.type === 'bool'}
            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" bind:checked={values[field.name]} class="rounded" />
              {formatLabel(field.name)}
            </label>
          {:else if field.type === 'int'}
            <label for="settings-{field.name}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{formatLabel(field.name)}</label>
            <input
              id="settings-{field.name}"
              type="number"
              bind:value={values[field.name]}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          {:else}
            <label for="settings-{field.name}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{formatLabel(field.name)}</label>
            <input
              id="settings-{field.name}"
              type="text"
              bind:value={values[field.name]}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          {/if}
          {#if field.description}
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{field.description}</p>
          {/if}
        </div>
      {/each}
      <div class="pt-2">
        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  {/if}
</div>
