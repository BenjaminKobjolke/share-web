<script>
  import TextUploadForm from '../components/upload/TextUploadForm.svelte';
  import FileUploadForm from '../components/upload/FileUploadForm.svelte';

  let mode = $state('text');
</script>

<div class="max-w-xl mx-auto space-y-6">
  <h1 class="text-2xl font-bold">Add</h1>

  <div class="flex gap-2">
    <button
      class="px-4 py-2 rounded-lg text-sm font-medium {mode === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}"
      onclick={() => (mode = 'text')}
    >
      Text
    </button>
    <button
      class="px-4 py-2 rounded-lg text-sm font-medium {mode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}"
      onclick={() => (mode = 'file')}
    >
      File
    </button>
  </div>

  <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
    {#if mode === 'text'}
      <TextUploadForm />
    {:else}
      <FileUploadForm />
    {/if}
  </div>
</div>
