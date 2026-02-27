<script>
  import { getFields, getResourceItems } from '../../lib/api.js';

  let { defaults = {}, getValues = $bindable(() => ({})) } = $props();

  let fields = $state([]);
  let values = $state({});
  let resourceOptions = $state({});
  let loading = $state(true);

  function defaultForType(field) {
    if (field.resource) return '';
    if (field.type === 'bool') return true;
    return '';
  }

  async function loadFields() {
    try {
      const res = await getFields();
      fields = res.data.filter(f => f.name !== '_id');

      const vals = {};
      for (const f of fields) {
        vals[f.name] = defaults[f.name] ?? defaultForType(f);
      }
      values = vals;

      await Promise.all(fields.filter(f => f.resource).map(async (f) => {
        try {
          const res = await getResourceItems(f.resource.path);
          resourceOptions[f.name] = res.data;
        } catch {
          resourceOptions[f.name] = [];
        }
      }));
    } catch {
      // Fields will remain empty — form still works without dynamic fields
    } finally {
      loading = false;
    }
  }

  loadFields();

  getValues = () => {
    const result = {};
    for (const f of fields) {
      const v = values[f.name];
      if (f.resource) {
        if (v !== '' && v != null) result[f.name] = Number(v);
      } else if (f.type === 'bool') {
        if (v === false) result[f.name] = false;
      } else if (f.type === 'int') {
        if (v !== '' && v != null) result[f.name] = Number(v);
      } else {
        if (typeof v === 'string' && v.trim()) result[f.name] = v.trim();
      }
    }
    return result;
  };

  function formatLabel(name) {
    return name.replace(/^_/, '').replace(/^\w/, c => c.toUpperCase());
  }
</script>

{#if !loading}
  {#each fields as field (field.name)}
    <div>
      {#if field.resource}
        <label for="dynamic-{field.name}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{formatLabel(field.name)} (optional)</label>
        <select
          id="dynamic-{field.name}"
          bind:value={values[field.name]}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">None</option>
          {#each resourceOptions[field.name] || [] as item}
            <option value={item.id}>{item.name}</option>
          {/each}
        </select>
      {:else if field.type === 'bool'}
        <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input type="checkbox" bind:checked={values[field.name]} class="rounded" />
          {formatLabel(field.name)}
        </label>
      {:else if field.type === 'int'}
        <label for="dynamic-{field.name}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{formatLabel(field.name)} (optional)</label>
        <input
          id="dynamic-{field.name}"
          type="number"
          bind:value={values[field.name]}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      {:else}
        <label for="dynamic-{field.name}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{formatLabel(field.name)} (optional)</label>
        <input
          id="dynamic-{field.name}"
          type="text"
          bind:value={values[field.name]}
          placeholder={field.description || ''}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      {/if}
      {#if field.description}
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{field.description}</p>
      {/if}
    </div>
  {/each}
{/if}
