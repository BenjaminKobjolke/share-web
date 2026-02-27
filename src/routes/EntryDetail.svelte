<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { getEntry, getEntryFile, deleteEntry as apiDeleteEntry } from '../lib/api.js';
  import { loadResourceFields } from '../lib/fields.js';
  import { notifications } from '../stores/notifications.js';
  import EntryHeader from '../components/detail/EntryHeader.svelte';
  import EntryBody from '../components/detail/EntryBody.svelte';
  import FilePreview from '../components/detail/FilePreview.svelte';
  import AttachmentList from '../components/detail/AttachmentList.svelte';
  import EditEntryModal from '../components/detail/EditEntryModal.svelte';
  import ConfirmDialog from '../components/shared/ConfirmDialog.svelte';
  import LoadingSpinner from '../components/shared/LoadingSpinner.svelte';
  import TextUploadForm from '../components/upload/TextUploadForm.svelte';
  import FileUploadForm from '../components/upload/FileUploadForm.svelte';

  let { params = {} } = $props();

  let entry = $state(null);
  let loading = $state(true);
  let showEdit = $state(false);
  let showDelete = $state(false);
  let showAdd = $state(false);
  let addMode = $state('text');
  let resourceFields = $state([]);
  let resourceMaps = $state({});

  async function load() {
    loading = true;
    try {
      entry = await getEntry(params.id);
    } catch (err) {
      notifications.error(err.message);
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    showDelete = false;
    try {
      await apiDeleteEntry(params.id);
      notifications.success('Entry deleted');
      push('/');
    } catch (err) {
      notifications.error(err.message);
    }
  }

  function handleSaved() {
    showEdit = false;
    load();
  }

  function handleAdded() {
    showAdd = false;
    load();
  }

  onMount(() => {
    load();
    loadResourceFields().then(r => {
      resourceFields = r.resourceFields;
      resourceMaps = r.resourceMaps;
    }).catch(() => {});
  });
</script>

{#if loading}
  <LoadingSpinner />
{:else if entry}
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <button class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" onclick={() => push('/')}>
        &larr; Back to list
      </button>
      <div class="flex gap-2">
        <button class="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700" onclick={() => (showAdd = !showAdd)}>
          {showAdd ? 'Cancel' : 'Append'}
        </button>
        <button class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700" onclick={() => (showEdit = true)}>
          Edit
        </button>
        <button class="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700" onclick={() => (showDelete = true)}>
          Delete
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      <EntryHeader {entry} {resourceFields} {resourceMaps} />
      <EntryBody body={entry.body} />

      {#if entry.type === 'file' && entry.file_url}
        <div class="mt-4">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">File</h3>
          <FilePreview fetchFile={() => getEntryFile(entry.id)} filename={entry.filename} />
        </div>
      {/if}
    </div>

    {#if showAdd}
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Append to Entry #{entry.id}</h3>
        <div class="flex gap-2 mb-4">
          <button
            class="px-4 py-2 rounded-lg text-sm font-medium {addMode === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}"
            onclick={() => (addMode = 'text')}
          >
            Text
          </button>
          <button
            class="px-4 py-2 rounded-lg text-sm font-medium {addMode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}"
            onclick={() => (addMode = 'file')}
          >
            File
          </button>
        </div>
        {#if addMode === 'text'}
          <TextUploadForm entryId={entry.id} onadded={handleAdded} />
        {:else}
          <FileUploadForm entryId={entry.id} onadded={handleAdded} />
        {/if}
      </div>
    {/if}

    <AttachmentList attachments={entry.attachments} ondeleted={load} />
  </div>

  {#if showEdit}
    <EditEntryModal {entry} onclose={() => (showEdit = false)} onsaved={handleSaved} />
  {/if}

  {#if showDelete}
    <ConfirmDialog
      title="Delete Entry"
      message="This will permanently delete this entry, all its attachments, and files. Continue?"
      onconfirm={handleDelete}
      oncancel={() => (showDelete = false)}
    />
  {/if}
{:else}
  <p class="text-gray-500 dark:text-gray-400 text-center py-12">Entry not found.</p>
{/if}
