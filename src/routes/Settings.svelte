<script>
  import { link } from 'svelte-spa-router';
  import { getFields } from '../lib/api.js';

  let resourceFields = $state([]);

  async function loadResourceLinks() {
    try {
      const res = await getFields();
      resourceFields = res.data.filter(f => f.resource);
    } catch {
      // Silently fail — links just won't appear
    }
  }

  loadResourceLinks();
</script>

<div class="max-w-2xl mx-auto">
  <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
  <div class="grid gap-4">
    <a
      href="/settings/built-in-values"
      use:link
      class="block bg-white dark:bg-gray-900 rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Built-in Values</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure default values for new uploads.</p>
    </a>
    {#each resourceFields as rf}
      <a
        href="/settings/resources/{rf.resource.name}"
        use:link
        class="block bg-white dark:bg-gray-900 rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Manage {rf.resource.name.charAt(0).toUpperCase() + rf.resource.name.slice(1)}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Add, rename, or delete {rf.resource.name}.</p>
      </a>
    {/each}
  </div>
</div>
