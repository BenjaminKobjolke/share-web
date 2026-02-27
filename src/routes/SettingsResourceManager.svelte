<script>
  import { link } from 'svelte-spa-router';
  import { getFields, getResourceItems, createResourceItem, updateResourceItem, deleteResourceItem } from '../lib/api.js';
  import { fieldToColumn } from '../lib/fields.js';
  import { notifications } from '../stores/notifications.js';
  import ConfirmDialog from '../components/shared/ConfirmDialog.svelte';

  let { params = {} } = $props();

  let field = $state(null);
  let items = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let newName = $state('');
  let adding = $state(false);
  let editingId = $state(null);
  let editName = $state('');
  let deleteTarget = $state(null);
  let column = $derived(field ? fieldToColumn(field.name) : null);

  async function load() {
    loading = true;
    error = null;
    try {
      const res = await getFields();
      field = res.data.find(f => f.resource?.name === params.name);
      if (!field) {
        error = `Resource "${params.name}" not found`;
        return;
      }
      const itemsRes = await getResourceItems(field.resource.path);
      items = itemsRes.data;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  load();

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim() || !field) return;
    adding = true;
    try {
      await createResourceItem(field.resource.path, { name: newName.trim() });
      newName = '';
      const itemsRes = await getResourceItems(field.resource.path);
      items = itemsRes.data;
      notifications.success('Item added');
    } catch (err) {
      notifications.error(err.message);
    } finally {
      adding = false;
    }
  }

  function startEdit(item) {
    editingId = item.id;
    editName = item.name;
  }

  function cancelEdit() {
    editingId = null;
    editName = '';
  }

  async function saveEdit(id) {
    if (!editName.trim() || !field) return;
    try {
      await updateResourceItem(field.resource.path, id, { name: editName.trim() });
      editingId = null;
      editName = '';
      const itemsRes = await getResourceItems(field.resource.path);
      items = itemsRes.data;
      notifications.success('Item renamed');
    } catch (err) {
      notifications.error(err.message);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || !field) return;
    const id = deleteTarget.id;
    deleteTarget = null;
    try {
      await deleteResourceItem(field.resource.path, id);
      const itemsRes = await getResourceItems(field.resource.path);
      items = itemsRes.data;
      notifications.success('Item deleted');
    } catch (err) {
      notifications.error(err.message);
    }
  }
</script>

<div class="max-w-lg mx-auto">
  <div class="mb-6">
    <a href="/settings" use:link class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">&larr; Back to Settings</a>
  </div>
  <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
    Manage {params.name ? params.name.charAt(0).toUpperCase() + params.name.slice(1) : ''}
  </h1>

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
      <form onsubmit={handleAdd} class="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          bind:value={newName}
          placeholder="New item name"
          class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {adding ? 'Adding...' : 'Add'}
        </button>
      </form>

      {#if items.length === 0}
        <div class="p-8 text-center text-gray-500 dark:text-gray-400">
          No items yet. Add one above.
        </div>
      {:else}
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          {#each items as item (item.id)}
            <li class="flex items-center justify-between px-4 py-3">
              {#if editingId === item.id}
                <form onsubmit={(e) => { e.preventDefault(); saveEdit(item.id); }} class="flex gap-2 flex-1 mr-2">
                  <input
                    type="text"
                    bind:value={editName}
                    class="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                  />
                  <button type="submit" class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                  <button type="button" onclick={cancelEdit} class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
                </form>
              {:else}
                <div class="flex-1">
                  <span class="text-xs text-gray-400 dark:text-gray-500 font-mono mr-2">#{item.id}</span>
                  <span class="text-gray-900 dark:text-gray-100">{item.name}</span>
                  {#if item.entry_count != null}
                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">({item.entry_count} {item.entry_count === 1 ? 'entry' : 'entries'})</span>
                  {/if}
                </div>
                <div class="flex gap-1">
                  {#if column}
                    <a
                      href="/?{column}={item.id}"
                      use:link
                      class="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      Entries
                    </a>
                  {/if}
                  <button
                    onclick={() => startEdit(item)}
                    class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onclick={() => (deleteTarget = item)}
                    class="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    Delete
                  </button>
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
    message="Are you sure you want to delete &quot;{deleteTarget.name}&quot;? This cannot be undone."
    onconfirm={handleDelete}
    oncancel={() => (deleteTarget = null)}
  />
{/if}
