<script>
  let { type } = $props();
</script>

<span class="inline-block px-2 py-0.5 text-xs font-medium rounded-full {type === 'file' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}">
  {type}
</span>
