<script>
  import { get } from 'svelte/store';
  import { uploadText } from '../../lib/api.js';
  import { notifications } from '../../stores/notifications.js';
  import { settingsStore } from '../../stores/settings.js';
  import { link } from 'svelte-spa-router';

  let { entryId = null, onadded = null } = $props();

  const defaults = get(settingsStore);
  let subject = $state('');
  let project = $state(defaults.project || '');
  let textOrUrl = $state('');
  let sendEmail = $state(defaults.sendEmail !== false);
  let uploading = $state(false);
  let result = $state(null);
  let copied = $state(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!textOrUrl.trim()) return;

    uploading = true;
    try {
      const payload = { text_or_url: textOrUrl };
      if (subject.trim()) payload.subject = subject;
      if (project.trim()) payload._project = project;
      if (entryId) payload._id = entryId;
      if (!sendEmail) payload._email = false;
      const response = await uploadText(payload);
      const trimmed = response.trim();
      const id = parseInt(trimmed);
      result = isNaN(id) ? { raw: trimmed } : { id };
      if (entryId) onadded?.();
    } catch (err) {
      notifications.error(err.message);
    } finally {
      uploading = false;
    }
  }

  async function copyId() {
    await navigator.clipboard.writeText(String(result.id));
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  function reset() {
    const d = get(settingsStore);
    result = null;
    subject = '';
    project = d.project || '';
    textOrUrl = '';
    sendEmail = d.sendEmail !== false;
  }
</script>

{#if result}
  <div class="text-center space-y-4">
    <div class="text-green-600 dark:text-green-400 text-lg font-medium">{entryId ? 'Added to entry' : 'Entry created'}</div>
    {#if result.id != null}
      <div class="text-3xl font-mono font-bold">{result.id}</div>
      <div class="flex justify-center gap-3">
        <button
          onclick={copyId}
          class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium"
        >
          {copied ? 'Copied!' : 'Copy ID'}
        </button>
        {#if !entryId}
          <a
            href="/entries/{result.id}"
            use:link
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            View entry
          </a>
        {/if}
      </div>
    {:else}
      <div class="text-sm text-gray-600 dark:text-gray-400">{result.raw}</div>
    {/if}
    <button onclick={reset} class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Add another</button>
  </div>
{:else}
  <form onsubmit={handleSubmit} class="space-y-4">
    <div>
      <label for="text-subject" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject (optional)</label>
      <input
        id="text-subject"
        type="text"
        bind:value={subject}
        placeholder="Optional subject line"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
    </div>
    <div>
      <label for="text-project" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project (optional)</label>
      <input
        id="text-project"
        type="text"
        bind:value={project}
        placeholder="Project name"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
    </div>
    <div>
      <label for="text-body" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text / URL</label>
      <textarea
        id="text-body"
        bind:value={textOrUrl}
        rows="6"
        required
        placeholder="Enter text or a URL to share..."
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      ></textarea>
    </div>
    <div class="flex items-center justify-between">
      <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <input type="checkbox" bind:checked={sendEmail} class="rounded" />
        Send email notification
      </label>
      <button
        type="submit"
        disabled={uploading || !textOrUrl.trim()}
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Adding...' : 'Add Text'}
      </button>
    </div>
  </form>
{/if}
