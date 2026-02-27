<script>
  import { updateEntry } from '../../lib/api.js';
  import { notifications } from '../../stores/notifications.js';

  let { entry, onclose, onsaved } = $props();

  const isObjectBody = typeof entry.body === 'object' && entry.body !== null;

  const initialSubject = entry.subject || '';
  const initialBody = isObjectBody ? null : (entry.body || '');
  const initialFields = isObjectBody ? { ...entry.body } : null;

  let subject = $state(initialSubject);
  let body = $state(initialBody);
  let bodyFields = $state(initialFields ? { ...initialFields } : null);
  let saving = $state(false);

  async function handleSubmit(e) {
    e.preventDefault();
    saving = true;
    try {
      const data = {};
      if (subject !== initialSubject) data.subject = subject;

      if (isObjectBody) {
        // Compare each field to detect changes
        const changed = Object.keys(bodyFields).some(k => bodyFields[k] !== initialFields[k]);
        if (changed) data.body = JSON.stringify(bodyFields);
      } else {
        if (body !== initialBody) data.body = body;
      }

      if (Object.keys(data).length === 0) {
        onclose();
        return;
      }

      await updateEntry(entry.id, data);
      notifications.success('Entry updated');
      onsaved?.();
    } catch (err) {
      notifications.error(err.message);
    } finally {
      saving = false;
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={onclose}>
  <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
  <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-lg w-full mx-4" onclick={(e) => e.stopPropagation()}>
    <h3 class="text-lg font-semibold mb-4">Edit Entry #{entry.id}</h3>
    <form onsubmit={handleSubmit} class="space-y-4">
      <div>
        <label for="edit-subject" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
        <input
          id="edit-subject"
          type="text"
          bind:value={subject}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      {#if isObjectBody && bodyFields}
        {#each Object.keys(bodyFields) as key}
          <div>
            <label for="edit-field-{key}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{key}</label>
            <input
              id="edit-field-{key}"
              type="text"
              bind:value={bodyFields[key]}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        {/each}
      {:else}
        <div>
          <label for="edit-body" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body</label>
          <textarea
            id="edit-body"
            bind:value={body}
            rows="6"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm"
          ></textarea>
        </div>
      {/if}
      <div class="flex justify-end gap-3">
        <button type="button" class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700" onclick={onclose}>
          Cancel
        </button>
        <button type="submit" disabled={saving} class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  </div>
</div>
