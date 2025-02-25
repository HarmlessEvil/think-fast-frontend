import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'dashesOnly',
    },
  },
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost',
      '/ws': 'ws://localhost',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
