<script>
  import { onMount } from 'svelte';
  import { querystring } from 'svelte-spa-router';
  import { getEntries } from '../lib/api.js';
  import { loadResourceFields, fieldToColumn } from '../lib/fields.js';
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
  let resourceFields = $state([]);
  let resourceMaps = $state({});
  let filters = $state({});

  let resourceOptions = $derived(
    Object.fromEntries(
      resourceFields.map(rf => [
        rf.name,
        Object.entries(resourceMaps[rf.name] || {}).map(([id, name]) => ({ id, name })),
      ])
    )
  );

  let filteredEntries = $derived(
    search
      ? entries.filter(
          (e) =>
            e.subject?.toLowerCase().includes(search.toLowerCase()) ||
            String(e.id).includes(search)
        )
      : entries
  );

  function parseFilters(qs) {
    if (!qs) return {};
    const params = new URLSearchParams(qs);
    const result = {};
    for (const [key, value] of params) {
      if (key.endsWith('_id') && value) result[key] = value;
    }
    return result;
  }

  function formatLabel(name) {
    return name.replace(/^_/, '').replace(/^\w/, c => c.toUpperCase());
  }

  function setFilter(column, value) {
    const newFilters = { ...filters };
    if (value) newFilters[column] = value;
    else delete newFilters[column];
    const qs = new URLSearchParams(newFilters).toString();
    window.location.hash = qs ? `#/?${qs}` : '#/';
  }

  async function load() {
    loading = true;
    try {
      const data = await getEntries(page, perPage, filters);
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

  $effect(() => {
    const qs = $querystring;
    const newFilters = parseFilters(qs);
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      filters = newFilters;
      page = 1;
    }
    load();
  });

  onMount(() => {
    loadResourceFields().then(r => {
      resourceFields = r.resourceFields;
      resourceMaps = r.resourceMaps;
    }).catch(() => {});
  });
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-2xl font-bold shrink-0">Entries</h1>
    <div class="flex items-center gap-2 ml-auto">
      {#if resourceFields.length > 0}
        {#each resourceFields as rf (rf.name)}
          <select
            value={filters[fieldToColumn(rf.name)] || ''}
            onchange={(e) => setFilter(fieldToColumn(rf.name), e.target.value)}
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="">All {formatLabel(rf.name)}s</option>
            {#each resourceOptions[rf.name] || [] as item (item.id)}
              <option value={item.id}>{item.name}</option>
            {/each}
          </select>
        {/each}
      {/if}
      <div class="w-72 shrink-0">
        <SearchFilter value={search} onchange={(v) => (search = v)} />
      </div>
    </div>
  </div>

  {#if loading}
    <LoadingSpinner />
  {:else}
    <EntryTable entries={filteredEntries} {resourceFields} {resourceMaps} />
    <Pagination {page} {total} {perPage} onpage={handlePage} />
  {/if}
</div>
