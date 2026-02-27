<script>
  import TypeBadge from '../entries/TypeBadge.svelte';
  import { formatDate, formatFileSize } from '../../lib/utils.js';

  let { entry } = $props();
</script>

<div class="flex items-start justify-between">
  <div>
    <div class="flex items-center gap-3 mb-1">
      <h1 class="text-2xl font-bold">#{entry.id}</h1>
      <TypeBadge type={entry.type} />
    </div>
    <h2 class="text-lg text-gray-700 dark:text-gray-300">{entry.subject}</h2>
    <div class="text-sm text-gray-500 dark:text-gray-400 mt-1 space-x-4">
      <span>{formatDate(entry.created_at)}</span>
      {#if entry.filename}
        <span>{entry.filename} ({formatFileSize(entry.file_size)})</span>
      {/if}
      <span>IP: {entry.ip}</span>
    </div>
  </div>
</div>
