import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  base: '/GypsyAI/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src/', import.meta.url))
    }
  },
  esbuild: { jsx: 'automatic' },
  build: { outDir: 'dist', emptyOutDir: true }
});
