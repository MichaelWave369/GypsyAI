# Gypsy AI

Gypsy AI is a free + open-source **Hermetic Tarot and astrology web app** built with Next.js + TypeScript.

## Features
- Tarot AI Reader with spreads: Single Card, Three Card, Celtic Cross, Tree of Life, and 369.
- Hermetic correspondences panel (Golden Dawn-inspired default profile).
- Astrology chart generator (Sun–Pluto placements, aspects, equal houses, estimated ascendant).
- Chart → Tarot Keys synthesis (“Hermetic Lens”).
- Local-first AI with Ollama default and optional OpenAI fallback.

## Hermetic system
This project includes an original, concise correspondence dataset authored specifically for this repository:
- 10 Sephiroth + short meanings
- 22 paths with Hebrew letters and major-key attributions
- Suit ↔ element, number ↔ Sephirah
- 36 decans mapped to minor arcana cards

No long copyrighted text or proprietary tables are included.

## Quick start
```bash
pnpm install
pnpm dev
```
Open http://localhost:3000.

## Environment
Create `.env.local` (optional):
```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
# Optional OpenAI fallback
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

## Ollama setup
1. Install Ollama: https://ollama.com/
2. Pull a model:
   ```bash
   ollama pull llama3.1
   ```
3. Run Ollama locally (default listens on `http://localhost:11434`).
4. Start Gypsy AI and use Tarot/Chat endpoints.

## Scripts
- `pnpm dev` – run development server
- `pnpm lint` – lint
- `pnpm test` – unit tests
- `pnpm build` – production build

## Privacy + ethics
- Birth data is processed per request and not persisted server-side.
- Settings/profile preferences are localStorage-first.
- Interpretations are reflective and non-fatalistic.
- For entertainment/self-reflection only (not medical/legal/financial advice).

## Credits
- Hermetic Qabalah + Golden Dawn tradition (high-level inspiration)
- Astronomy math: `astronomy-engine`
- Timezone inference: `tz-lookup`
- Geocoding endpoint: OpenStreetMap Nominatim
- Frameworks: Next.js, React, Tailwind CSS, Vitest

## License
MIT (existing LICENSE preserved).
