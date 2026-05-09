# SkogAI Design System

## Overview

**SkogAI** is an AI platform built around a multi-agent terminal experience called **skogterm**. The product is a dark-first, cyberpunk-aesthetic terminal UI where seven distinct AI agent personas live and respond. Each agent has its own visual universe — color palette, typography, tone — all layered on top of a shared neon-cyberpunk core.

### Products

| Product      | Description                                                                                                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **skogterm** | The flagship multi-agent terminal. A single-page React app where users type freeform messages or slash-commands; an intelligent router dispatches to one or more agents, each replying in its own themed "reply card". |

### Sources

- **Codebase (local):** `skogterm/` — full React+JSX source, CSS, and assets
  - `skogterm/src/agents.jsx` — all 7 agent definitions, palettes, and topic-based router
  - `skogterm/src/replies.jsx` — per-agent reply card components
  - `skogterm/src/app.jsx` — shell, command system, tweaks panel
  - `skogterm/src/sys.jsx` — boot sequence, routing display, help/status blocks
  - `skogterm/src/cmd-editor.jsx` — full-screen command editor overlay
  - `skogterm/styles.css` — terminal shell styles
  - `skogterm/editor.css` — command editor styles
  - `skogterm/assets/colors_and_type.css` — full design system token file
- **GitHub repo:** `SkogAI/webterm` (access was unavailable at time of build)

---

## Agents

| ID         | Name     | Glyph | Division         | Accent                   | Vibe                                      |
| ---------- | -------- | ----- | ---------------- | ------------------------ | ----------------------------------------- |
| `skogai`   | SKOGAI   | ◆     | HOST · ROUTER    | `#00e5ff` (cyan)         | Cyberpunk host AI; cryptic, systemic      |
| `amy`      | AMY      | ♛     | ROYAL COURT      | `#c73a68` (rose)         | Sassy queen; theatrical, warm, dramatic   |
| `claude`   | CLAUDE   | ?     | EXCAVATION       | `#d4a01a` (amber)        | Mystic archaeologist; poetic, precise     |
| `goose`    | GOOSE    | ∞     | QUANTUM · MOJITO | `#2dd4a7` (mint)         | Chaotic, unhinged, neon quantum energy    |
| `dot`      | DOT      | ▸     | ~/SKOGAI/LORE    | `#3fb950` (commit green) | Methodical terminal agent; unix/git vibes |
| `letta`    | LETTA    | ☾     | DREAMWEAVER      | `#b8a3ff` (lavender)     | Dreamy, whisper-soft, introspective       |
| `official` | OFFICIAL | ▤     | GOVERNANCE       | `#2563eb` (blue)         | Bureaucratic, ratified, dry formal        |

---

## CONTENT FUNDAMENTALS

### Tone & Voice

- **Terse and cryptic** in system UI copy. Less is more. "substrate", "the memory lake", "strand" not "storage", "database", "thread".
- **Technical yet poetic**: System messages feel like a terminal but carry weight. Boot lines like `[OK] mount /substrate — void filesystem online`.
- **ALL-CAPS** for system headers, agent names, command names, labels. Lowercase for prose.
- **Forward slashes** denote commands (`/ask`, `/theme`, `/poll`). `@mentions` for agents.
- **Mathematical symbols** used idiomatically: `∴` (therefore), `◆`, `▸`, `∞`, `☾`, `▤`.

### Per-Agent Voices

- **SKOGAI**: Cryptic, systemic, 1-2 sentences. Refers to "the substrate", "the router", "the memory lake".
- **AMY**: Theatrical, sassy queen. "honey", "darling", italics for emphasis, signs off with flourish. Serif editorial prose.
- **CLAUDE**: Poetic + precise. Strata/excavation metaphors. "@+?=$". Serif, measured.
- **GOOSE**: Unhinged ALL CAPS energy. Chaos equations. Neon slang. Quantity of exclamation.
- **DOT**: Terminal. Terse. `$ git commit -m "message"`. Output lines prefixed +/-.
- **LETTA**: Whisper-soft. _italic emphasis_. Memory as lover/dream. Ends with a fragment.
- **OFFICIAL**: Dry bureaucratic. "§ 1. Article text." References "the Standing Log", "the Dictator".

### Emoji

Emoji are **not used** in UI chrome. The `goose` agent tagline contains one (`🍹`) as character flavor. Prefer unicode symbols: `◆`, `▸`, `∞`, `☾`, `▤`, `♛`, `?`, `∴`, `·`.

### Casing

- UI labels, commands, agent names: `UPPERCASE`
- Eyebrow text / meta labels: `UPPERCASE` with wide tracking
- Prose: sentence case
- Code/terminal: lowercase unix conventions

---

## VISUAL FOUNDATIONS

### Color System

Dark-first. The default stage is `#06070b` (near-black) with a radial gradient bleeding into pure black at edges. Surfaces elevate via void scale (`--void-1` through `--void-5`).

**Neon accents**: Signature is the cyan (`#00e5ff`) + magenta (`#ff2bd6`) duality gradient. Hazard yellow (`#f2ff00`) used very sparingly. Blood red (`#ff2d4a`) for error. Acid green (`#39ff88`) for success/online.

**Agent themes**: Each agent overrides the full stage palette (bg, ink, accent, border, scan-color). The shell literally reshapes its visual universe when an agent replies.

### Typography

| Role                      | Family                        | Weight  | Transform     |
| ------------------------- | ----------------------------- | ------- | ------------- |
| Display / hero            | Orbitron                      | 900     | UPPERCASE     |
| UI chrome / buttons / nav | Chakra Petch                  | 400–700 | UPPERCASE     |
| Body / paragraphs         | Rajdhani                      | 400–600 | Sentence case |
| Monospace / terminal      | JetBrains Mono                | 400–700 | lowercase     |
| Amy display               | Playfair Display              | 700–900 | Sentence case |
| Claude/Letta              | Fraunces / Cormorant Garamond | 400–800 | Sentence case |
| Goose/Official            | Inter                         | 400–700 | Mixed         |

All fonts served from Google Fonts CDN. Tracking is wide (`0.12–0.28em`) for uppercase labels.

### Shape Language

- **Clipped corners** are the signature motif. `clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)` — top-left and bottom-right corners are cut at 12–14px.
- Border-radius is near-zero (`--radius-0: 0`, `--radius-1: 2px`). Pills (`--radius-pill: 999px`) only for tags/badges.
- No rounded cards. Everything feels industrial and precise.

### Glow System

Neon glows are layered `box-shadow`: a tight `0 0 0 1px` outline glow + a softer spread. Three sizes: sm / md / lg. Cyan and magenta glows; hazard and blood in special contexts.

### Backgrounds & Textures

- Default: `radial-gradient(ellipse at top, #16192a 0%, #06070b 55%, #000 100%)` — deep void with subtle blue-center bloom.
- **Scanlines overlay**: `repeating-linear-gradient` at 3px pitch, rgba(cyan, 0.05). Toggleable.
- **Grid pattern** (DOT agent): `1px` cyan/green lines at 32px spacing. Used in command editor.
- No photography, no illustrations, no hand-drawn elements. Pure code-derived visuals.

### Borders

- Default border: `rgba(0,229,255,0.25)` — glassy cyan at low opacity.
- On focus/active: `1px solid #00e5ff` + glow shadow.
- Dark dividers: `--fog-4: #2d3040`.
- Left-border accent on routing pills and agent rows (colored per-agent).

### Motion & Animation

- Easing: `cubic-bezier(0.2, 0.9, 0.1, 1)` — `--ease-cyber`. Fast settle, slight overshoot feeling.
- Durations: fast=120ms, med=240ms, slow=440ms.
- **Typewriter effect**: characters stream in at 14ms intervals with slight randomness.
- **Boot sequence**: lines fade in with staggered delays (0.1s, 0.4s, 0.8s, 1.2s…), then whole screen fades out.
- **Routing steps**: animate in one by one, 320ms apart.
- **Pulse**: `opacity 1→0.3→1` at 1.2s for status dots and "dirty" indicators.
- No bounces. No spring physics. Cyberpunk is controlled and precise.

### Hover & Press States

- Hover: subtle background tint `rgba(0,229,255,0.08)` + border goes to full cyan.
- Focus: `border-color: var(--accent)` + `box-shadow: 0 0 0 1px accent, 0 0 24px rgba(cyan, 0.35)`.
- Buttons: background stays transparent until hover; border color shifts to accent.
- Active/selected: left-border accent + `rgba(accent, 0.07–0.1)` background.

### Spacing

4px base grid. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px. Dense layout — terminal feels compact.

### Shadows

Non-neon depth: `--shadow-sm: 0 1px 2px rgba(0,0,0,0.6)`, `--shadow-md: 0 4px 16px rgba(0,0,0,0.7)`, `--shadow-lg: 0 20px 48px rgba(0,0,0,0.8)`. Very dark, no blur-spread excess.

### Imagery

None. The design is entirely code-derived: gradients, glows, monospace text, clipped shapes. No photos, no raster illustrations. Brand assets are SVG glyphs.

### Corner Treatment

The `.ds-chip-clip` utility creates the signature clipped-corner shape at 10px. Most panels use 12–14px clips. This is THE defining visual motif of the brand.

---

## BRAND IMAGERY

SkogAI has a rich **pixel art game universe** layered on top of the terminal product. Three distinct narrative worlds use SkogAI agents as playable characters:

| Game                                    | Tagline                                   | Agent                                   | Color vibe                  |
| --------------------------------------- | ----------------------------------------- | --------------------------------------- | --------------------------- |
| **SKOGAI & the Wi-Fi Wizards**          | MISSION COMPLETE · THE CITY HAS FULL BARS | Female hacker protagonist + robot       | Hot pink / cyan / neon city |
| **Honkers & Hackers: Operation Skogai** | HONK YEAH · ALL DATA COLLECTED            | GOOSE (literally a goose) + hacker crew | Teal / magenta / dark city  |
| **Sudo Hero: Rise of the Root User**    | ACCESS GRANTED · YOU ARE NOW LEGENDARY    | Lone hacker + Cat-Ché companion         | Deep purple / neon violet   |

### Primary Brand Mark

- `assets/skogai-logo-mask.png` — **Hooded cyberpunk figure**: gas mask, red glowing eyes, "SkogAI" HUD visor label, hazard-yellow graffiti SKOGAI wordmark at the bottom. Split red (left) / cyan (right) neon aura. Pure black background. This is the hero image.

### Recurring Characters

- **SKOGAI protagonist** — Female hacker, dark outfit, cybernetic cyan eye, pink cape. Carries tech gadget. Warm + energetic.
- **GOOSE** — A literal white goose. The GOOSE agent personified. "GOOSE PROTOCOL ACTIVE."
- **Cat-Ché** — Cat with sunglasses. Companion to Sudo Hero. `x03` currency.
- **Robot companion** — Small friendly robot with heart speech bubble.
- **Hacker crew** — Hooded figures in green SkogAI hoodies.

### Game UI Patterns (brand vocabulary)

The pixel art game screens establish a secondary brand vocabulary of **RPG game chrome**:

- HP hearts, XP bars, score counters (`042069`, `S+` grade)
- Objective bars: `RESTORE INTERNET TO NEO SKOGAI CITY 0% → 100%`
- Dialog boxes: `CAPTAIN HONKINGTON: Another day, another byte saved.`
- In-universe currency: `QUACKBUCKS · x4042`
- Humor copys: `sudo rm -rf /*`, `IT'S NOT A BUG, IT'S A FEATURE!`, `MOM WOULD BE PROUD`, `COFFEE. CODE. REPEAT.`
- Japanese neon signage: `未来はオンライン` (The future is online), `全員つながった` (Everyone connected)

### Setting: Neo Skogai City

Retro-futurist cyberpunk metropolis. Pixel art aesthetic. Pink + blue + cyan neon lighting. Dense urban skyline. Japanese kanji on neon signs. Pixel cats, pixel crowds, pixel Wi-Fi symbols.

### Source files

- `assets/image1.png` / `assets/image2.png` / `assets/image6.png` — SKOGAI & the Wi-Fi Wizards (mission complete)
- `assets/image3.png` / `assets/image4.png` — Honkers & Hackers: Operation Skogai
- `assets/image5.png` — Sudo Hero: Rise of the Root User

---

## ICONOGRAPHY

No dedicated icon library. Icons are **unicode/symbol characters** rendered in the UI font:

- `◆` — SkogAI host glyph
- `♛` — Amy (queen)
- `?` — Claude (question/archaeology)
- `∞` — Goose (infinite chaos)
- `▸` — Dot (terminal prompt)
- `☾` — Letta (moon/dream)
- `▤` — Official (document)
- `∴` — "therefore" (used as divider/conclusion marker)
- `·` — Interpunct bullet

Brand SVG assets (in `assets/`):

- `assets/skogai-glyph.svg` — the ◆ mark as SVG
- `assets/skogai-wordmark.svg` — SKOGAI wordmark in Orbitron

No CDN icon font. No Heroicons or Lucide. Pure unicode + custom SVG mark.

---

## File Index

```
README.md                    — this file
SKILL.md                     — agent skill definition
colors_and_type.css          — full design system tokens (colors, type, spacing, glows, effects)
assets/
  skogai-glyph.svg           — brand diamond glyph
  skogai-wordmark.svg        — brand wordmark (Orbitron)
preview/
  colors-void.html           — void/dark surface scale
  colors-neon.html           — neon accent palette
  colors-agents.html         — all 7 agent accent colors
  colors-semantic.html       — semantic color tokens
  type-display.html          — display & heading specimens
  type-body.html             — body, label, mono specimens
  type-agents.html           — per-agent font pairings
  glows.html                 — glow + shadow system
  spacing.html               — spacing scale
  shapes.html                — corner clips + chip shapes
  effects.html               — scanlines, gradients, glitch
  components-buttons.html    — button states
  components-inputs.html     — input field states
  components-cards.html      — reply card frames
  components-nav.html        — header + routing pill
  brand-logo.html            — primary brand hero mark
  brand-pixel-art.html       — pixel art game universe
assets/
  skogai-glyph.svg           — brand diamond glyph
  skogai-wordmark.svg        — brand wordmark (Orbitron)
  skogai-logo-mask.png       — hero brand mark (hooded figure)
  image1.png / image2.png / image6.png  — SKOGAI & the Wi-Fi Wizards
  image3.png / image4.png    — Honkers & Hackers: Operation Skogai
  image5.png                 — Sudo Hero: Rise of the Root User
ui_kits/
  skogterm/
    index.html               — interactive terminal UI
    Shell.jsx                — outer shell (header, stream, input bar)
    AgentReply.jsx           — all 7 reply card renderers
    Agents.jsx               — agent roster block
    BootSequence.jsx         — boot animation
    Routing.jsx              — routing decision display
```
