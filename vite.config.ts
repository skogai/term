import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: 'src',
  build: {
    target: 'esnext',
    outDir: '../dist',
    emptyOutDir: true,
  },
  test: {
    include: ['../tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
