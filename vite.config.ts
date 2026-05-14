import { execSync } from 'node:child_process';
import { defineConfig, type Plugin } from 'vitest/config';

function preloadDefaultWallpaper(assetName: string, devPath: string): Plugin {
  return {
    name: 'preload-default-wallpaper',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        let href = devPath;
        const bundle = ctx.bundle;
        if (bundle) {
          const asset = Object.values(bundle).find(
            f => f.type === 'asset' && f.name === assetName
          );
          if (asset) {
            href = `/${asset.fileName}`;
          }
        }
        return {
          html,
          tags: [
            {
              tag: 'link',
              attrs: {
                rel: 'preload',
                as: 'image',
                href,
                fetchpriority: 'high',
              },
              injectTo: 'head',
            },
          ],
        };
      },
    },
  };
}

function git(args: string): string | undefined {
  try {
    return execSync(`git ${args}`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return undefined;
  }
}

const commitCount = git('rev-list --count HEAD');
if (commitCount) {
  process.env.VITE_APP_VERSION = `1.0.${commitCount}`;
}
const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? git('rev-parse HEAD');
if (commit) {
  process.env.VITE_APP_COMMIT = commit;
}

export default defineConfig({
  root: 'src',
  plugins: [
    preloadDefaultWallpaper('wallpaper_low.jpg', '/themes/wallpaper_low.jpg'),
  ],
  server: {
    allowedHosts: ['3000.skogix.se'],
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: true,
    target: 'es2022',
  },
  test: {
    include: ['../tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
