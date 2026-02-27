<script>
  import { link } from 'svelte-spa-router';
  import { authStore } from '../../stores/auth.js';
  import { push } from 'svelte-spa-router';

  function handleLogout() {
    authStore.logout();
    push('/login');
  }
</script>

<nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
  <div class="max-w-6xl mx-auto flex items-center justify-between">
    <a href="/" use:link class="text-xl font-bold text-gray-900 dark:text-white">Share Web</a>
    {#if $authStore}
      <div class="flex items-center gap-4">
        <a href="/" use:link class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Entries</a>
        <a href="/upload" use:link class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Add</a>
        <a href="/settings" use:link class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Settings</a>
        {#if !$authStore.anonymous}
          <span class="text-gray-400 dark:text-gray-500">|</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">{$authStore.username}</span>
          <button class="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" onclick={handleLogout}>Logout</button>
        {/if}
      </div>
    {/if}
  </div>
</nav>
