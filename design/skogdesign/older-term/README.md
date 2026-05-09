# skogai Design System

> **skogai** — AI with a cyberpunk soul. A system for building interfaces, decks, and marketing material that feel like they came from a neon-soaked datastream rather than a standard-issue SaaS dashboard.

---

## Sources

This system was built from two visual references provided by the user (no codebase, no Figma — pure art direction):

- `uploads/ChatGPT Image Apr 18, 2026, 12_13_50 AM.png` → hooded figure in a cybernetic mask, electric cyan vs red glow on near-black. Establishes the **cyan × red × hazard-yellow** axis and the idea that skogai is _watching_ — there is an agent behind the interface.
- `uploads/grok_image_1776290090436.jpg` → a 2077-style magenta-neon portrait with wordmark "SKOGAI" set in a heavy, slightly-distressed condensed display face. Establishes the **magenta neon** axis and the **poster-display wordmark**.

Copies live in `assets/skogai-logo-mask.png` and `assets/skogai-poster-2077.jpg`.

No codebase or Figma was attached. If one exists, reattach it via the **Import** menu and this system will be regenerated against the real source of truth.

---

## Index

```
README.md                 ← you are here
SKILL.md                  ← entry point when used as an Agent Skill
colors_and_type.css       ← all tokens: colors, type, spacing, radii, glows
assets/                   ← logos, poster art, exported brand bitmaps
preview/                  ← design-system-tab preview cards
ui_kits/
  ├─ product/             ← the skogai agent interface (chat + terminal)
  └─ marketing/           ← the skogai.com marketing site
```

Not present: `slides/` (no deck template was given — ask if you want one), `fonts/` local files (Google Fonts CDN for now; see Fonts note below).

---

## Content fundamentals

**Voice.** skogai speaks like an operator, not a mascot. Short declarative sentences. Technical confidence without jargon-worship. The vibe is _"we already shipped it."_

- **Person:** second person when addressing the user ("you"), first person only when the agent is _speaking as itself_ ("I'll handle the request"). Never royal-we.
- **Tense:** present, active. "Deploys in 40ms." not "Can be deployed quickly."
- **Casing:** product nouns, section headers, and nav labels are **UPPERCASE with wide tracking**. Body copy is normal sentence case. Never Title Case For Headers.
- **Numbers:** monospaced, concrete. "47 nodes online" beats "many nodes".
- **Emoji:** no. Not as bullets, not as reactions, not decoratively. The brand uses **icons and glyphs** instead.
- **Unicode:** allowed for structural hints — `›` `—` `·` `▸` `//` `::` — used like command-line punctuation.
- **Exclamation marks:** avoid. Confidence does not shout.
- **Length:** headers under 6 words. Product copy under 12 words per line.

### Examples

| ✅ skogai                                | ❌ off-brand                                                |
| ---------------------------------------- | ----------------------------------------------------------- |
| `// AUTONOMOUS AGENTS, PRIVATE COMPUTE`  | `Revolutionary AI agents that empower your workflow!`       |
| `Deploys in 40ms. No cold starts.`       | `Enjoy blazing-fast deployment with our cutting-edge tech.` |
| `Run your agent on your hardware.`       | `Flexible solutions for modern teams 🚀`                    |
| `STATUS ▸ ONLINE`                        | `Everything looks great :)`                                 |
| `I compiled the brief. 3 options below.` | `Here are some options I came up with for you!`             |

Tone adjectives: **terse · operator · confident · nocturnal · slightly ominous**.
Tone adjectives to avoid: playful, whimsical, folksy, corporate, breezy.

---

## Visual foundations

### Palette

Dark-first. The default surface is near-black (`--void-1 #06070b`), _never_ pure white. Accent colors are **neon**, used sparingly as signal, not decoration.

- **Primary — electric cyan** `#00e5ff`. Interactive state, focus, agent-identity.
- **Secondary — hot magenta** `#ff2bd6`. Warnings-as-style, hero moments, the "human" half of the duality.
- **Tertiary — hazard yellow** `#f2ff00`. Rare. Used only for high-urgency callouts or a single poster accent.
- **Danger — blood red** `#ff2d4a`. Errors, destructive state, the _mask's eye glow_.
- **Success — acid green** `#39ff88`. Online / live / connected.

The **duality gradient** (cyan → magenta, 135°) is the signature motif. Use for hero type, focus rings on primary CTAs, and divider accents — never as a flat background fill.

### Type

| Role               | Family             | Weight  | Case                     |
| ------------------ | ------------------ | ------- | ------------------------ |
| Display / poster   | **Orbitron**       | 900     | UPPERCASE, wide tracking |
| UI / buttons / nav | **Chakra Petch**   | 600–700 | UPPERCASE for chrome     |
| Body               | **Rajdhani**       | 400–500 | Sentence case            |
| Mono / data / code | **JetBrains Mono** | 400–500 | As needed                |

All loaded from Google Fonts CDN. If you want the brand to ship without external deps, drop `.woff2` into `fonts/` and swap the `@import` in `colors_and_type.css` for `@font-face` rules. **Flag:** these are Google Fonts substitutes; if skogai later licenses a bespoke display face (e.g. something like _Gridular_, _Monument Extended_, _Nebulica_), swap `--font-display`.

### Backgrounds

- Near-black base. **Never pure white.**
- Elevated surfaces step up in luminosity by ~3% at a time (`--void-2`, `--void-3`, `--void-4`).
- **Scanline overlay** (`.ds-scanlines`) applied to hero frames and terminal panels. Very subtle — 5% cyan at 1px/3px repeat.
- Radial `--gradient-void` used for page-level backgrounds — slightly brighter at top-center, fading to pure black at corners. Evokes a ceiling streetlight in a cyberpunk alley.
- No full-bleed photographic hero images as default. When used, they must be **desaturated, cool-cast, grain-heavy**, with neon color-grading.

### Corners & shapes

- **Corners are mostly sharp** (`--radius-0`). This is non-negotiable for chrome.
- **Clipped / chamfered corners** via `clip-path` are the signature shape — see `.ds-chip-clip`. Used on badges, buttons, panels.
- Pills (`--radius-pill`) are reserved for **status tags** only.
- Soft rounded corners (8px+) are _never_ used. No Material-style cards.

### Borders

- Default border color is `--border` (`#2d3040`) — visible but quiet.
- Neon borders (1px cyan / magenta) appear on **hover and focus**, not at rest.
- Dashed borders (`1px dashed var(--cyan-dim)`) for empty states.

### Shadows & glows

The system uses **two shadow stacks**, which must not be mixed on the same element:

1. **Non-neon card shadows** (`--shadow-md`, `--shadow-lg`) — straight black drop shadows for floating panels.
2. **Neon glows** (`--glow-cyan-md`, etc) — layered box-shadows in cyan/magenta/hazard/blood. Used for _interactive energy_: hover states, live indicators, primary CTAs.

There is no inner-shadow "inset" treatment except `--glow-inner` on terminal frames.

### Animation

- Easing: `--ease-cyber` — `cubic-bezier(0.2, 0.9, 0.1, 1)`. Snappy start, long tail.
- Durations: 120ms for micro, 240ms for most, 440ms for page-level transitions.
- Preferred motion: **fade + subtle slide (8–16px)**, or **glow-pulse** on live elements. Avoid bouncy spring physics.
- **Scanline drift** and **glitch shift** are reserved for hero moments and loading states.
- `prefers-reduced-motion` must kill all scanlines and pulses.

### Hover / press

- **Hover** on interactive elements: turn the border neon-cyan and apply `--glow-cyan-sm`. Do _not_ lighten the fill.
- **Press**: shift translation 1px down, drop shadow, no color change.
- **Focus-visible**: outer 2px magenta glow — always, always, always.
- **Disabled**: 40% opacity, no glow, cursor `not-allowed`.

### Transparency & blur

- Used for overlays and modal backdrops only (`--bg-overlay` = `rgba(6,7,11,0.72)` with 12px backdrop-blur).
- Frosted-glass panels are **not** part of this system. skogai is hard-edged, not glassy.

### Layout rules

- 4px grid for all spacing (`--space-1` → `--space-9`).
- Max content width 1280px.
- Fixed top nav on marketing; fixed left rail + top bar on product.
- Generous negative space. A skogai page is 60%+ empty.

### Imagery vibe

Cool-cast, nocturnal, high-contrast. Magenta neon and cyan neon as light sources. Grain and chromatic aberration acceptable. Never warm beach photography, never plain stock business.

---

## Iconography

skogai uses **Lucide Icons** (CDN, 1.5px stroke) as the default UI icon set. This is a **substitution flag** — the brand has no bespoke icon library yet; Lucide's thin geometric stroke is closest to a cyberpunk techwear feel.

```html
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="terminal"></i>
<script>
  lucide.createIcons();
</script>
```

**Style rules for icons:**

- 1.5px stroke weight, square line caps.
- Size on a **16 / 20 / 24** scale. Never 17, never 22.
- Default color: `var(--fg-2)`. On hover / active: `var(--cyan)`.
- Never filled with gradients.
- Never set on a colored circular background ("icon chip").

**Emoji: no.** Anywhere. Ever. Not in copy, not as fallback. If you need a status marker, use a colored 6px square or a Unicode glyph (`›`, `▸`, `::`, `//`, `◆`).

**Logos** (in `assets/`):

- `skogai-logo-mask.png` — the hooded cybernetic figure; use as square/app icon.
- `skogai-poster-2077.jpg` — marketing poster art; use full-bleed behind heroes.
- `skogai-wordmark.svg` — text-only wordmark for navs (derived from the poster's lettering).
- `skogai-glyph.svg` — abbreviated glyph mark for favicons and small spaces.

---

## Fonts substitution note

This system ships with Google Fonts substitutes. The posters use a bespoke heavy-condensed display face that Orbitron approximates — but if you want pixel-perfect parity with the poster wordmark, please send the real typeface file (or the name of the font used to generate the poster) and drop it in `fonts/`.

---

## Next steps

This system is a strong v1 but there are open questions. See the summary at the end of the assistant's message for specific asks.
