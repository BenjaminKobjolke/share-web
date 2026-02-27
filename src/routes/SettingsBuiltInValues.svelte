<script>
  import { get } from 'svelte/store';
  import { settingsStore } from '../stores/settings.js';
  import { notifications } from '../stores/notifications.js';
  import { link } from 'svelte-spa-router';

  let settings = get(settingsStore);
  let project = $state(settings.project || '');
  let sendEmail = $state(settings.sendEmail !== false);

  function handleSave(e) {
    e.preventDefault();
    settingsStore.set({
      project: project.trim(),
      sendEmail,
    });
    notifications.success('Settings saved');
  }
</script>

<div class="max-w-lg mx-auto">
  <div class="mb-6">
    <a href="/settings" use:link class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">&larr; Back to Settings</a>
  </div>
  <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Built-in Values</h1>
  <form onsubmit={handleSave} class="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
    <div>
      <label for="settings-project" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default project</label>
      <input
        id="settings-project"
        type="text"
        bind:value={project}
        placeholder="Project name"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Pre-fills the project field on new uploads.</p>
    </div>
    <div>
      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input type="checkbox" bind:checked={sendEmail} class="rounded" />
        Send email by default
      </label>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">When unchecked, new uploads will default to no email notification.</p>
    </div>
    <div class="pt-2">
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Save
      </button>
    </div>
  </form>
</div>
