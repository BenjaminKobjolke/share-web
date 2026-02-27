<script>
  let { size = 'md' } = $props();
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
</script>

<div class="flex justify-center items-center p-4">
  <div class="animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 {sizes[size] || sizes.md}"></div>
</div>
