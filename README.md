# Gypsy AI v1.1

Gypsy AI is a free + open-source **Hermetic Tarot and astrology web app** built with Next.js + TypeScript.

## What’s new in v1.1
- Reliability hardening: pinned pnpm, `.npmrc`, `pnpm:setup`, and `doctor` script.
- Demo Mode (No AI): deterministic fallback interpretations for Tarot/Astrology/Chat.
- Local-first Profiles + Tarot Sessions with import/export.
- Study Mode pages: Tree explorer, Tarot browser, and Decans map.
- Astrology upgrade: Ascendant/MC via sidereal-time math, equal houses from Asc, tropical/sidereal toggle, minor aspects, strength score.

## Features
- Tarot AI Reader with spreads: Single Card, Three Card, Celtic Cross, Tree of Life, and 369.
- Hermetic correspondences panel + deep-link to Study pages.
- Astrology chart generator (Sun–Pluto, aspects, equal houses, Asc/MC).
- Chart → Tarot Keys synthesis (“Hermetic Lens”).
- Local-first saving only (localStorage): no server-side profile persistence.

## Quick start
```bash
pnpm run pnpm:setup
pnpm install
pnpm run doctor
pnpm dev
```
Open http://localhost:3000.

## If install fails (403 / restricted network)
Run:
```bash
corepack enable
corepack prepare pnpm@9.12.3 --activate
pnpm config set registry https://registry.npmjs.org/
pnpm store prune
pnpm install --prefer-offline
pnpm run doctor
```
Then enable **Demo Mode** in `/settings` to keep app usable without AI backends.

## Environment
Create `.env.local` (optional):
```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

## Ollama setup
1. Install Ollama: https://ollama.com/
2. Pull model: `ollama pull llama3.1`
3. Run locally and use default settings.

## Study Mode
- `/study`: hub
- `/study/tree`: 10 Sephiroth + 22 paths explorer
- `/study/tarot`: filterable deck browser
- `/study/decans`: 36 decans linked to minor cards

## Privacy + ethics
- Birth data and sessions are local-first.
- No deterministic/fatalistic claims by design.
- For entertainment/self-reflection only (not medical/legal/financial advice).

## Credits
- Hermetic Qabalah + Golden Dawn tradition (high-level inspiration)
- Astronomy: `astronomy-engine`
- Timezone inference: `tz-lookup`
- Geocoding: OpenStreetMap Nominatim
- Frameworks: Next.js, React, Tailwind CSS, Vitest

## License
MIT (existing LICENSE preserved).
