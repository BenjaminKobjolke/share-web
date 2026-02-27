<script>
  import { link } from 'svelte-spa-router';
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
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure default project and email notification preferences for new uploads.</p>
    </a>
  </div>
</div>
