# skogai-intro UI kit

Recreation of the skogai lore-repository site. This is the core surface: a full-viewport hero introducing the active agent with the agent dock + slash-command terminal drawer at the bottom.

## Files

- `index.html` — interactive kit. Click any agent avatar in the dock to switch themes (SKOGAI · Amy · Claude · Goose · Dot · Letta). The tag chip at top-left also opens a picker menu. Click the `›_` terminal button to reveal the slash-command drawer.

## How the agent switching works

- `<body data-agent="...">` swaps CSS custom properties (`--agent-bg`, `--agent-ink`, `--agent-accent`, `--agent-muted`, `--agent-bg-img`) in one place.
- Each agent has its own typography override (Amy = Playfair, Claude = Fraunces, Letta = Cormorant italic, Dot = JetBrains Mono, Goose = Orbitron wide).
- Active agent persisted to localStorage — refresh lands on the last-viewed persona.

## What's intentionally simple

- Avatars use emoji — replace with the real artwork from `assets/screens/*-intro.jpg` when available.
- Terminal drawer is static content (no real command parser). Extend by piping `input.onkeydown` through a command registry.
- Not every per-agent background photo is wired up — `--agent-bg-img` currently falls through to plain gradients except for SKOGAI.
