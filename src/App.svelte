<script>
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  import { authStore } from './stores/auth.js';
  import { getAuthMethod } from './lib/api.js';
  import Navbar from './components/layout/Navbar.svelte';
  import Toast from './components/shared/Toast.svelte';
  import Login from './routes/Login.svelte';
  import EntryList from './routes/EntryList.svelte';
  import EntryDetail from './routes/EntryDetail.svelte';
  import Upload from './routes/Upload.svelte';
  import Settings from './routes/Settings.svelte';
  import SettingsBuiltInValues from './routes/SettingsBuiltInValues.svelte';

  let initialized = $state(false);

  function isAuthenticated() {
    let auth;
    authStore.subscribe((v) => (auth = v))();
    return !!auth;
  }

  const routes = {
    '/login': Login,
    '/': wrap({ component: EntryList, conditions: [isAuthenticated] }),
    '/entries/:id': wrap({ component: EntryDetail, conditions: [isAuthenticated] }),
    '/upload': wrap({ component: Upload, conditions: [isAuthenticated] }),
    '/settings': wrap({ component: Settings, conditions: [isAuthenticated] }),
    '/settings/built-in-values': wrap({ component: SettingsBuiltInValues, conditions: [isAuthenticated] }),
  };

  function conditionsFailed() {
    window.location.hash = '#/login';
  }

  onMount(async () => {
    const method = await getAuthMethod();
    if (method === 'none') {
      authStore.loginAnonymous();
    } else if (!isAuthenticated()) {
      window.location.hash = '#/login';
    }
    initialized = true;
  });
</script>

{#if initialized}
  <div class="min-h-screen flex flex-col">
    <Navbar />
    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
      <Router {routes} on:conditionsFailed={conditionsFailed} />
    </main>
  </div>
  <Toast />
{/if}
