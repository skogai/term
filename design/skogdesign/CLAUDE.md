# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo bundles several loosely related artifacts — not a single app:

- **`term/`** — SKOGTERM, the flagship multi-agent terminal (primary product).
- **`backend/`** — **Byte-for-byte duplicate of `term/`** (`diff -rq term backend` is empty). Any change made in one must be mirrored in the other, or the duplication should be consolidated. Treat this as a known issue, not a pair of independent directories.
- **`design-system/`** — SkogAI design tokens, per-surface preview HTML, and a skogterm UI-kit copy. Contains a `SKILL.md` marking it as an agent-invocable skill (`skogai-design`).
- **`older-term/`** — earlier iteration of the design system (legacy reference, includes bundled standalone HTML exports and a marketing UI kit). Do not edit unless explicitly asked; changes belong in `design-system/`.
- **`shellscape/`** — an unrelated third-party project (browser CTF trainer by Sharvil Sagalgile, MIT). Present as reference material; not part of SkogAI.
- `skogix_profile.md` — owner profile, no code.

## Running / developing

There is **no build step, package.json, lockfile, test runner, or linter** anywhere in this repo. Skogterm is served as a static site:

- Open `term/skogterm.html` directly in a browser, or serve the directory (`python3 -m http.server` from `term/`) and visit `skogterm.html`.
- React 18 UMD and `@babel/standalone` are loaded from unpkg CDN at runtime — JSX is transpiled in the browser. No offline/first-load caching.
- Editing a `.jsx` or `.js` file under `term/src/` + refreshing the page is the entire dev loop.
- State persists across reloads in `localStorage` under keys `skogterm.commands.v1`, `skogterm.backend.v1`, `skogterm.webhook.v1`, `skogterm.userstate.v1`. To reset, either run `/reset` in the app or clear those keys.

## Skogterm architecture

### Script load order (from `term/skogterm.html`) is load-bearing

```
src/commands.js          → registers window.commandRegistry, compileHandler, userStorage
src/backends.js          → registers window.backends, window.BACKENDS
src/agents.jsx           → registers window.AGENTS, AGENT_ORDER, routeAgent
src/replies-data.jsx     → scripted reply bank + nextReply()
src/replies.jsx          → per-agent <ReplyBlock/> components
src/sys.jsx              → boot/help/status/routing/user-message blocks
src/cmd-editor.jsx       → <CommandEditor/> overlay
src/app.jsx              → <App/>, mounts into #root
```

There is no module system. Files communicate via `window.*` globals assigned at the bottom of each file. Adding a new file means adding a `<script>` tag to `skogterm.html` in the right position.

### Three orthogonal subsystems

1. **Agents** (`agents.jsx`) — seven personas: `skogai, amy, claude, goose, dot, letta, official`. Each has CSS custom properties (`--stage-bg`, `--stage-accent`, …) that are written onto `document.documentElement` by `applyAgentTheme()` when active — this is how the entire shell "reshapes" to the agent. Fonts and palettes are per-agent. `AGENT_ORDER` is the canonical iteration order.

2. **Routing** (`routeAgent` in `agents.jsx`) — keyword/regex classifier. Scores each agent by topic-keyword hits (×2) plus heuristic regexes (`/\?$/` → claude, `/bug|fix|deploy/` → dot, etc.). Ties fall back to `skogai`. Returns `{ primary, panel, scores, matched, reasoning }`; `panel` can hold 1–3 agents for chorus/polyphonic replies. Density (`never|sometimes|often`) in the Tweaks panel caps panel size.

3. **Backends** (`backends.js`) — the thing that actually produces reply text. Three adapters keyed on `window.backends.current`:
   - `scripted` (default) — rotates through `REPLIES[agentId]` in `replies-data.jsx`.
   - `claude` — calls `window.claude.complete({ messages })`. This global only exists inside Claude's artifact/iframe sandbox; it will throw elsewhere and fall through to a styled error reply.
   - `webhook` — POSTs `{agentId, query, history}` to a user-supplied URL from `localStorage['skogterm.webhook.v1']`.
     Each adapter returns a reply object whose shape is agent-specific (see `shapeToAgent`) — `ReplyBlock` dispatches on `agentId` to one of seven bespoke card components in `replies.jsx`.

### Command system (the main extensibility surface)

User commands are **source-string handlers compiled at runtime** via `new Function('ctx', ...)` in `compileHandler()` (`commands.js`). Built-in commands (`BUILTIN_COMMANDS`) are immutable; user commands (seeded from `SEED_USER_COMMANDS` on first boot) live in `localStorage` and are fully editable through the `/commands` overlay (`cmd-editor.jsx`).

Every handler receives a `ctx` built in `App.buildCtx()` (`app.jsx`). The real ctx and the editor's **sandboxed test ctx** (`buildTestCtx` in `cmd-editor.jsx`) must be kept in sync — the test pane mocks every method, so new ctx methods need mock entries there or the editor's Test pane will misreport handler behavior.

When adding a new ctx capability:

1. Add the method inside `buildCtx` in `app.jsx`.
2. Add a mock (logging) equivalent in `buildTestCtx` in `cmd-editor.jsx`.
3. Document it in the `// ctx provides:` comment block at the top of `commands.js` and in `EXAMPLE_BODY` inside `cmd-editor.jsx`.

### Message stream kinds

`App.messages` is a flat array of `{ id, kind, ... }`. `renderMsg` in `app.jsx` switches on `kind`: `user | help | agents | status | error | sysblock | routing | reply`. To add a new message type, extend both the emitter (usually `ctx.emit` / `ctx.sys`) and the switch.

### Tweaks panel (`__activate_edit_mode`)

The Tweaks panel is hidden by default and is shown only when the page receives `postMessage({type:'__activate_edit_mode'})` from its parent window (used by the host/editor that embeds skogterm in an iframe). The app announces readiness via `postMessage({type:'__edit_mode_available'}, '*')` on mount. The `DEFAULT_TWEAKS` object in `app.jsx` is wrapped in `/*EDITMODE-BEGIN*/ … /*EDITMODE-END*/` sentinel comments — an external editor rewrites the object between those markers, so preserve the sentinels when editing defaults.

## Styles and theming

- `term/styles.css` — shell chrome, boot sequence, per-agent reply card styles.
- `term/editor.css` — command editor overlay only.
- Every agent's look is driven by `--stage-*` CSS custom properties set on `:root` by `applyAgentTheme()`. Don't hardcode agent colors in CSS — read them via `var(--stage-accent)` etc. so the shapeshift feature continues to work.
- Scanlines are toggled by adding/removing `.scanlines` on `<body>` (`tweaks.scanlines`).

## When working on design / brand

Use `design-system/` as the source of truth for tokens (`colors_and_type.css`), type stack, and the unicode-glyph icon set. The `design-system/README.md` and `SKILL.md` set the voice rules: UPPERCASE chrome, no emoji, clipped corners via `clip-path`, neon glows only on hover/focus. Per-agent voice guidelines are spelled out there and are mirrored in the `AGENT_PROMPTS` object in `backends.js` — keep those two in sync if you change an agent's persona.

## Git workflow for this environment

Active development branch for this task: **`claude/add-claude-documentation-BjaXr`**. Commit and push there; do not push elsewhere without explicit permission. There is no CI, no pre-commit hook, and no test suite to gate commits.
