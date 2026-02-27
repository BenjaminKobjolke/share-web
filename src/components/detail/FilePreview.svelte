<script>
  import { onMount, onDestroy } from 'svelte';
  import LoadingSpinner from '../shared/LoadingSpinner.svelte';

  let { fetchFile, filename = '' } = $props();

  let blobUrl = $state(null);
  let mimeType = $state('');
  let loading = $state(true);
  let error = $state('');

  const imageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
  const textTypes = ['text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json', 'application/xml'];

  let isImage = $derived(imageTypes.some((t) => mimeType.startsWith(t)));
  let isText = $derived(textTypes.some((t) => mimeType.startsWith(t)));
  let isVideo = $derived(mimeType.startsWith('video/'));
  let isAudio = $derived(mimeType.startsWith('audio/'));
  let isPdf = $derived(mimeType === 'application/pdf');

  let textContent = $state('');

  onMount(async () => {
    try {
      const res = await fetchFile();
      if (!res.ok) throw new Error('Failed to load file');
      mimeType = res.headers.get('Content-Type')?.split(';')[0] || '';
      const blob = await res.blob();
      blobUrl = URL.createObjectURL(blob);

      if (textTypes.some((t) => mimeType.startsWith(t))) {
        textContent = await blob.text();
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  });
</script>

{#if loading}
  <LoadingSpinner size="sm" />
{:else if error}
  <p class="text-sm text-red-500 dark:text-red-400">{error}</p>
{:else if blobUrl}
  <div class="mt-2">
    {#if isImage}
      <img src={blobUrl} alt={filename} class="max-w-full max-h-96 rounded" />
    {:else if isText}
      <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm max-h-64 overflow-auto whitespace-pre-wrap">{textContent}</pre>
    {:else if isVideo}
      <!-- svelte-ignore a11y_media_has_caption -->
      <video src={blobUrl} controls class="max-w-full rounded"></video>
    {:else if isAudio}
      <audio src={blobUrl} controls></audio>
    {:else if isPdf}
      <iframe src={blobUrl} class="w-full h-96 rounded border" title={filename}></iframe>
    {:else}
      <a href={blobUrl} download={filename} class="text-blue-600 dark:text-blue-400 hover:underline text-sm">Download {filename}</a>
    {/if}
  </div>
{/if}
