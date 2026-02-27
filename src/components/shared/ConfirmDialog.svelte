<script>
  let { title = 'Confirm', message = 'Are you sure?', confirmText = 'Delete', cancelText = 'Cancel', onconfirm, oncancel, destructive = true } = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={oncancel} onkeydown={(e) => e.key === 'Escape' && oncancel()}>
  <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
  <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onclick={(e) => e.stopPropagation()}>
    <h3 class="text-lg font-semibold mb-2">{title}</h3>
    <p class="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
    <div class="flex justify-end gap-3">
      <button class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700" onclick={oncancel}>
        {cancelText}
      </button>
      <button
        class="px-4 py-2 text-white rounded-lg {destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}"
        onclick={onconfirm}
      >
        {confirmText}
      </button>
    </div>
  </div>
</div>
