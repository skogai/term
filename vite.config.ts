import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: 'src',
  plugins: [
    preloadDefaultWallpaper('wallpaper_low.jpg', '/themes/wallpaper_low.jpg'),
  ],
  server: {
    allowedHosts: ['3000.skogix.se'],
  },
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
