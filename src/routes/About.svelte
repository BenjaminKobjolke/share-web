<script>
  import { link } from 'svelte-spa-router';

  let loading = $state(true);
  let error = $state(null);
  let manifest = $state(null);
  let notes = $state(null);
  let currentIndex = $state(0);

  let canPrev = $derived(manifest && currentIndex > 0);
  let canNext = $derived(manifest && currentIndex < manifest.versions.length - 1);

  async function loadManifest() {
    try {
      const res = await fetch(`./release_notes/manifest.json?t=${Date.now()}`);
      if (!res.ok) throw new Error('Failed to load release notes manifest');
      manifest = await res.json();
      if (manifest.versions.length > 0) {
        await loadVersion(0);
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function loadVersion(index) {
    const version = manifest.versions[index];
    const res = await fetch(`./release_notes/${version}/en.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(`Failed to load release notes for ${version}`);
    notes = await res.json();
    currentIndex = index;
  }

  function prev() {
    if (canPrev) loadVersion(currentIndex - 1);
  }

  function next() {
    if (canNext) loadVersion(currentIndex + 1);
  }

  loadManifest();
</script>

<div class="max-w-lg mx-auto">
  <div class="mb-6">
    <a href="/settings" use:link class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">&larr; Back to Settings</a>
  </div>
  <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">About</h1>

  {#if loading}
    <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
      <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      Loading...
    </div>
  {:else if error}
    <div class="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-4">
      {error}
    </div>
  {:else if notes}
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{notes.title}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">v{notes.version} &middot; {notes.date}</p>
        </div>
        <div class="flex gap-2">
          <button
            onclick={prev}
            disabled={!canPrev}
            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
          >
            &larr; Newer
          </button>
          <button
            onclick={next}
            disabled={!canNext}
            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
          >
            Older &rarr;
          </button>
        </div>
      </div>

      {#each notes.sections as section}
        <div class="mt-4">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{section.heading}</h3>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {#each section.items as item}
              <li>{item}</li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>

    {#if manifest.versions.length > 1}
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
        Version {currentIndex + 1} of {manifest.versions.length}
      </p>
    {/if}
  {/if}
</div>
