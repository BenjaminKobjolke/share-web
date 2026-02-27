<script>
  let { page = 1, total = 0, perPage = 20, onpage } = $props();

  let totalPages = $derived(Math.max(1, Math.ceil(total / perPage)));
  let canPrev = $derived(page > 1);
  let canNext = $derived(page < totalPages);
</script>

{#if totalPages > 1}
  <div class="flex items-center justify-between mt-4">
    <span class="text-sm text-gray-600 dark:text-gray-400">
      Page {page} of {totalPages} ({total} entries)
    </span>
    <div class="flex gap-2">
      <button
        disabled={!canPrev}
        onclick={() => onpage(page - 1)}
        class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
      >
        Previous
      </button>
      <button
        disabled={!canNext}
        onclick={() => onpage(page + 1)}
        class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
      >
        Next
      </button>
    </div>
  </div>
{/if}
