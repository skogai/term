# term

Browser-based fake Linux shell and portfolio (Vite + TypeScript).

## Running

- The `dev` config in `.claude/launch.json` runs vite on `127.0.0.1:5173`.
  Use it rather than `npm run dev`: that script binds port 8080, which a
  termix container holds on this machine.
- In the browser pane, typed `\n` doesn't submit; press `Return` as its own
  key.

## Checks

- `npx vitest run`, `npx tsc --noEmit`, `npx eslint src tests` and
  `npx prettier --check src tests` all work locally.
- e2e (Playwright) doesn't run on this machine. It's native Arch, and
  Playwright's bundled Chromium isn't installed (it's a pain to set up on Arch).
  Don't try to install it. Say the e2e specs weren't run, and leave them to CI
  or a machine that has Playwright set up.
