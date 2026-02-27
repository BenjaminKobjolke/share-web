<script>
  let { body } = $props();
</script>

{#if typeof body === 'object' && body !== null}
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4 space-y-3">
    {#each Object.entries(body) as [key, value]}
      <div>
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">{key}</div>
        <div class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</div>
      </div>
    {/each}
  </div>
{:else if body}
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Body</h3>
    <pre class="text-sm whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">{body}</pre>
  </div>
{/if}
