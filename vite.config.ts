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
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/.{idea,git,cache,output,temp}/**', '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*'],
    setupFiles: './tests/setup.ts',
  },
});
