<script>
  import { link } from 'svelte-spa-router';
  import { getCustomFields, createCustomField, updateCustomField, deleteCustomField, exportCustomFields, importCustomFields } from '../lib/api.js';
  import { notifications } from '../stores/notifications.js';
  import ConfirmDialog from '../components/shared/ConfirmDialog.svelte';

  let fields = $state([]);
  let loading = $state(true);
  let error = $state(null);

  // Create form
  let newName = $state('');
  let newDescription = $state('');
  let newSortOrder = $state(0);
  let adding = $state(false);
  let nameError = $state('');

  // Inline edit
  let editingName = $state(null);
  let editDescription = $state('');
  let editSortOrder = $state(0);

  // Delete
  let deleteTarget = $state(null);

  // Import
  let importInput = $state(null);

  const NAME_PATTERN = /^[a-z][a-z_]*$/;

  function validateName(name) {
    if (!name.trim()) return 'Name is required';
    if (!NAME_PATTERN.test(name)) return 'Name must start with a lowercase letter and contain only lowercase letters and underscores';
    return '';
  }

  async function load() {
    loading = true;
    error = null;
    try {
      const res = await getCustomFields();
      fields = res.data;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  load();

  async function handleAdd(e) {
    e.preventDefault();
    const validation = validateName(newName);
    if (validation) {
      nameError = validation;
      return;
    }
    adding = true;
    nameError = '';
    try {
      await createCustomField({
        name: newName.trim(),
        description: newDescription.trim(),
        sort_order: Number(newSortOrder) || 0,
      });
      newName = '';
      newDescription = '';
      newSortOrder = 0;
      const res = await getCustomFields();
      fields = res.data;
      notifications.success('Custom field created');
    } catch (err) {
      notifications.error(err.message);
    } finally {
      adding = false;
    }
  }

  function startEdit(field) {
    editingName = field.name;
    editDescription = field.description || '';
    editSortOrder = field.sort_order ?? 0;
  }

  function cancelEdit() {
    editingName = null;
    editDescription = '';
    editSortOrder = 0;
  }

  async function saveEdit(name) {
    try {
      await updateCustomField(name, {
        description: editDescription.trim(),
        sort_order: Number(editSortOrder) || 0,
      });
      editingName = null;
      const res = await getCustomFields();
      fields = res.data;
      notifications.success('Custom field updated');
    } catch (err) {
      notifications.error(err.message);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteTarget = null;
    try {
      await deleteCustomField(name);
      const res = await getCustomFields();
      fields = res.data;
      notifications.success('Custom field deleted');
    } catch (err) {
      notifications.error(err.message);
    }
  }

  async function handleExport() {
    try {
      const data = await exportCustomFields();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'custom-fields.json';
      a.click();
      URL.revokeObjectURL(url);
      notifications.success('Fields exported');
    } catch (err) {
      notifications.error(err.message);
    }
  }

  function handleImportClick() {
    importInput?.click();
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importCustomFields(data);
      const res = await getCustomFields();
      fields = res.data;
      notifications.success('Fields imported');
    } catch (err) {
      notifications.error(err.message);
    } finally {
      if (importInput) importInput.value = '';
    }
  }
</script>

<div class="max-w-2xl mx-auto">
  <div class="mb-6">
    <a href="/settings" use:link class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">&larr; Back to Settings</a>
  </div>
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Custom Fields</h1>
    <div class="flex gap-2">
      <button
        onclick={handleExport}
        class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Export
      </button>
      <button
        onclick={handleImportClick}
        class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Import
      </button>
      <input
        bind:this={importInput}
        type="file"
        accept=".json"
        class="hidden"
        onchange={handleImportFile}
      />
    </div>
  </div>

  {#if loading}
    <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
      <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      Loading...
    </div>
  {:else if error}
    <div class="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-4">
      {error}
    </div>
  {:else}
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow">
      <form onsubmit={handleAdd} class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-[1fr_2fr_auto_auto] gap-2">
          <input
            type="text"
            bind:value={newName}
            placeholder="Field name"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <input
            type="text"
            bind:value={newDescription}
            placeholder="Description (optional)"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <input
            type="number"
            bind:value={newSortOrder}
            placeholder="Order"
            title="Sort order"
            class="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
        {#if nameError}
          <p class="text-sm text-red-600 dark:text-red-400 mt-1">{nameError}</p>
        {/if}
      </form>

      {#if fields.length === 0}
        <div class="p-8 text-center text-gray-500 dark:text-gray-400">
          No custom fields yet. Add one above.
        </div>
      {:else}
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          {#each fields as field (field.name)}
            <li class="px-4 py-3">
              {#if editingName === field.name}
                <form onsubmit={(e) => { e.preventDefault(); saveEdit(field.name); }} class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">{field.name}</span>
                  </div>
                  <div class="flex gap-2">
                    <input
                      type="text"
                      bind:value={editDescription}
                      placeholder="Description"
                      class="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    />
                    <input
                      type="number"
                      bind:value={editSortOrder}
                      title="Sort order"
                      class="w-20 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    />
                    <button type="submit" class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                    <button type="button" onclick={cancelEdit} class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
                  </div>
                </form>
              {:else}
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">{field.name}</span>
                      {#if field.option_count != null}
                        <span class="text-xs text-gray-500 dark:text-gray-400">({field.option_count} {field.option_count === 1 ? 'option' : 'options'})</span>
                      {/if}
                      <span class="text-xs text-gray-400 dark:text-gray-500">order: {field.sort_order ?? 0}</span>
                    </div>
                    {#if field.description}
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{field.description}</p>
                    {/if}
                  </div>
                  <div class="flex gap-1 ml-2 shrink-0">
                    <a
                      href="/settings/resources/{field.name}"
                      use:link
                      class="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      Options
                    </a>
                    <button
                      onclick={() => startEdit(field)}
                      class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onclick={() => (deleteTarget = field)}
                      class="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>

{#if deleteTarget}
  <ConfirmDialog
    title="Delete {deleteTarget.name}"
    message="Are you sure you want to delete &quot;{deleteTarget.name}&quot;? This will permanently delete the field, all its options, and remove it from all entries."
    onconfirm={handleDelete}
    oncancel={() => (deleteTarget = null)}
  />
{/if}
