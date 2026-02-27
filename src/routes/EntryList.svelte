<script>
  import { onMount } from 'svelte';
  import { getEntries } from '../lib/api.js';
  import { notifications } from '../stores/notifications.js';
  import EntryTable from '../components/entries/EntryTable.svelte';
  import Pagination from '../components/entries/Pagination.svelte';
  import SearchFilter from '../components/entries/SearchFilter.svelte';
  import LoadingSpinner from '../components/shared/LoadingSpinner.svelte';

  let entries = $state([]);
  let total = $state(0);
  let page = $state(1);
  let perPage = $state(20);
  let loading = $state(true);
  let search = $state('');

  let filteredEntries = $derived(
    search
      ? entries.filter(
          (e) =>
            e.subject?.toLowerCase().includes(search.toLowerCase()) ||
            String(e.id).includes(search)
        )
      : entries
  );

  async function load() {
    loading = true;
    try {
      const data = await getEntries(page, perPage);
      entries = data.entries;
      total = data.total;
      page = data.page;
      perPage = data.per_page;
    } catch (err) {
      notifications.error(err.message);
    } finally {
      loading = false;
    }
  }

  function handlePage(newPage) {
    page = newPage;
    load();
  }

  onMount(load);
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">Entries</h1>
    <div class="w-72">
      <SearchFilter value={search} onchange={(v) => (search = v)} />
    </div>
  </div>

  {#if loading}
    <LoadingSpinner />
  {:else}
    <EntryTable entries={filteredEntries} />
    <Pagination {page} {total} {perPage} onpage={handlePage} />
  {/if}
</div>
