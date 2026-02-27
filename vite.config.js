import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: './',
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/media-file-explorer-share-api',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    include: ['src/**/*.test.js'],
    css: false,
  },
});
