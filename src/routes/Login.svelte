<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { authStore } from '../stores/auth.js';
  import { testAuth } from '../lib/api.js';
  import { notifications } from '../stores/notifications.js';
  import { get } from 'svelte/store';

  let username = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state('');

  onMount(() => {
    const auth = get(authStore);
    if (auth) {
      push('/');
    }
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) return;

    loading = true;
    error = '';

    // Temporarily set auth so testAuth uses these credentials
    authStore.login(username, password);

    try {
      await testAuth();
      notifications.success('Logged in');
      push('/');
    } catch (err) {
      authStore.logout();
      error = 'Invalid credentials';
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex items-center justify-center min-h-[60vh]">
  <div class="bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 w-full max-w-sm">
    <h1 class="text-2xl font-bold mb-6 text-center">Login</h1>

    {#if error}
      <div class="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-2 rounded mb-4 text-sm">{error}</div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-4">
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
        <input
          id="username"
          type="text"
          bind:value={username}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          required
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  </div>
</div>
