<script>
  import { link, push } from 'svelte-spa-router';
  import TypeBadge from './TypeBadge.svelte';
  import { formatDate, truncate } from '../../lib/utils.js';
  import { fieldToColumn } from '../../lib/fields.js';

  let { entries = [], resourceFields = [], resourceMaps = {} } = $props();
</script>

<div class="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow">
  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
    <thead class="bg-gray-50 dark:bg-gray-800">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subject</th>
        {#each resourceFields as rf}
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{rf.resource.name}</th>
        {/each}
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Attachments</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
      {#each entries as entry (entry.id)}
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            onclick={() => push('/entries/' + entry.id)}>
          <td class="px-4 py-3 text-sm">
            <a href="/entries/{entry.id}" use:link class="text-blue-600 dark:text-blue-400 hover:underline">#{entry.id}</a>
          </td>
          <td class="px-4 py-3"><TypeBadge type={entry.type} /></td>
          <td class="px-4 py-3 text-sm">{truncate(entry.subject, 60)}</td>
          {#each resourceFields as rf}
            {@const col = fieldToColumn(rf.name)}
            {@const id = entry[col]}
            <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{id ? (resourceMaps[rf.name]?.[id] || '\u2014') : ''}</td>
          {/each}
          <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{entry.attachment_count || 0}</td>
          <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(entry.created_at)}</td>
        </tr>
      {:else}
        <tr>
          <td colspan={5 + resourceFields.length} class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No entries found</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
