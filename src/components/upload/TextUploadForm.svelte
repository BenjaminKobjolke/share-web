<script>
  import { get } from 'svelte/store';
  import { uploadText } from '../../lib/api.js';
  import { notifications } from '../../stores/notifications.js';
  import { settingsStore } from '../../stores/settings.js';
  import { link } from 'svelte-spa-router';
  import DynamicFields from './DynamicFields.svelte';

  let { entryId = null, onadded = null } = $props();

  const defaults = get(settingsStore);
  let subject = $state('');
  let textOrUrl = $state('');
  let uploading = $state(false);
  let result = $state(null);
  let copied = $state(false);
  let getValues = $state(() => ({}));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!textOrUrl.trim()) return;

    uploading = true;
    try {
      const extra = getValues();
      extra.text_or_url = textOrUrl;
      if (subject.trim()) extra.subject = subject;
      if (entryId) extra._id = entryId;
      const response = await uploadText(extra);
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
    result = null;
    subject = '';
    textOrUrl = '';
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
    <DynamicFields {defaults} bind:getValues />
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
    <div class="flex items-center justify-end">
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
