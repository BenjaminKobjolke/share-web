<script>
  import { getAttachmentFile, deleteAttachment as apiDeleteAttachment } from '../../lib/api.js';
  import { notifications } from '../../stores/notifications.js';
  import TypeBadge from '../entries/TypeBadge.svelte';
  import FilePreview from './FilePreview.svelte';
  import ConfirmDialog from '../shared/ConfirmDialog.svelte';
  import { formatDate, formatFileSize } from '../../lib/utils.js';

  let { attachments = [], ondeleted } = $props();

  let previewId = $state(null);
  let deleteTarget = $state(null);

  async function handleDelete() {
    const id = deleteTarget;
    deleteTarget = null;
    try {
      await apiDeleteAttachment(id);
      notifications.success('Attachment deleted');
      ondeleted?.();
    } catch (err) {
      notifications.error(err.message);
    }
  }
</script>

{#if attachments.length > 0}
  <div class="mt-6">
    <h3 class="text-lg font-semibold mb-3">Attachments ({attachments.length})</h3>
    <div class="space-y-3">
      {#each attachments as att (att.id)}
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <TypeBadge type={att.type} />
              <span class="font-medium text-sm">{att.subject || att.filename || `Attachment #${att.id}`}</span>
              {#if att.filename}
                <span class="text-xs text-gray-500 dark:text-gray-400">{att.filename} ({formatFileSize(att.file_size)})</span>
              {/if}
              <span class="text-xs text-gray-400 dark:text-gray-500">{formatDate(att.created_at)}</span>
            </div>
            <div class="flex gap-2">
              {#if att.file_url}
                <button
                  class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  onclick={() => (previewId = previewId === att.id ? null : att.id)}
                >
                  {previewId === att.id ? 'Hide' : 'Preview'}
                </button>
              {/if}
              <button class="text-xs text-red-600 dark:text-red-400 hover:underline" onclick={() => (deleteTarget = att.id)}>
                Delete
              </button>
            </div>
          </div>

          {#if att.body}
            {#if typeof att.body === 'object' && att.body !== null}
              <div class="mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded space-y-1">
                {#each Object.entries(att.body) as [key, value]}
                  <div>
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{key}: </span>
                    <span class="text-xs text-gray-600 dark:text-gray-400">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                  </div>
                {/each}
              </div>
            {:else}
              <pre class="text-xs text-gray-600 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded whitespace-pre-wrap">{att.body}</pre>
            {/if}
          {/if}

          {#if previewId === att.id && att.file_url}
            <FilePreview fetchFile={() => getAttachmentFile(att.id)} filename={att.filename} />
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}

{#if deleteTarget !== null}
  <ConfirmDialog
    title="Delete Attachment"
    message="This will permanently delete this attachment and its file. Continue?"
    onconfirm={handleDelete}
    oncancel={() => (deleteTarget = null)}
  />
{/if}
