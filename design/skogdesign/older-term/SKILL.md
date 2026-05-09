---
name: skogai-design
description: Use this skill to generate well-branded interfaces and assets for skogai, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. skogai is an AI brand with a cyberpunk aesthetic — dark-first, neon cyan/magenta accents, sharp/clipped corners, terse operator-voice copy.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of `assets/` and create static HTML files for the user to view. Link `colors_and_type.css` for tokens. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Palette**: near-black voids (`#06070b`) + electric cyan (`#00e5ff`) + hot magenta (`#ff2bd6`). Hazard yellow and blood red used sparingly. Never pure white backgrounds.
- **Type**: Orbitron (display, UPPERCASE), Chakra Petch (UI chrome), Rajdhani (body), JetBrains Mono (code/data).
- **Corners**: sharp by default; chamfered via `clip-path` is the signature. No soft rounding.
- **Voice**: terse, operator, confident. No emoji. Ever. Uppercase chrome, sentence-case body.
- **Iconography**: Lucide, 1.5px stroke, thin geometric. No filled icons, no gradient fills.
- **Signature motifs**: scanlines, cyan×magenta duality gradient on hero type, glitch RGB-shift on titles, neon glow on hover/focus only.

See `README.md` for the full system.
