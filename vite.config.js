import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: './',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/media-file-explorer-share-api',
        changeOrigin: true,
      },
      '/share.php': {
        target: 'http://localhost/media-file-explorer-share-api',
        changeOrigin: true,
      },
    },
  },
});
