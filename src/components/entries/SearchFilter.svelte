<script>
  let { value = '', onchange } = $props();

  let timer;
  function handleInput(e) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      onchange(e.target.value);
    }, 300);
  }
</script>

<div class="relative">
  <input
    type="text"
    placeholder="Search entries..."
    value={value}
    oninput={handleInput}
    class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
  />
  <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
</div>
