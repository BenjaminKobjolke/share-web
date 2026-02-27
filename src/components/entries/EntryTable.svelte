<script>
  import { link } from 'svelte-spa-router';
  import TypeBadge from './TypeBadge.svelte';
  import { formatDate, truncate } from '../../lib/utils.js';

  let { entries = [] } = $props();
</script>

<div class="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow">
  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
    <thead class="bg-gray-50 dark:bg-gray-800">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subject</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Attachments</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
      {#each entries as entry (entry.id)}
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
          <td class="px-4 py-3 text-sm">
            <a href="/entries/{entry.id}" use:link class="text-blue-600 dark:text-blue-400 hover:underline">#{entry.id}</a>
          </td>
          <td class="px-4 py-3"><TypeBadge type={entry.type} /></td>
          <td class="px-4 py-3 text-sm">{truncate(entry.subject, 60)}</td>
          <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{entry.attachment_count || 0}</td>
          <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(entry.created_at)}</td>
        </tr>
      {:else}
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No entries found</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
