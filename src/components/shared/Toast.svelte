<script>
  import { notifications } from '../../stores/notifications.js';

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };
</script>

{#if $notifications.length > 0}
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
    {#each $notifications as note (note.id)}
      <div class="text-white px-4 py-3 rounded-lg shadow-lg max-w-sm {colors[note.type] || colors.info} flex items-center justify-between gap-3">
        <span>{note.message}</span>
        <button class="text-white/80 hover:text-white font-bold" onclick={() => notifications.remove(note.id)}>&times;</button>
      </div>
    {/each}
  </div>
{/if}
