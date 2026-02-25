# Gypsy AI v1.3 — Ancestral Memory + Conversational Oracle

Gypsy AI is a free + open-source Hermetic reflection app combining Tarot, Astrology, Gene Keys, and Ancestry with local-first privacy.

## v1.3 Highlights
- **Ancestry module** (`/ancestry`):
  - GEDCOM import (`/ancestry/import`)
  - family tree (`/ancestry/tree`)
  - people browser/details (`/ancestry/people`, `/ancestry/person/[id]`)
  - ancestry-based readings (`/ancestry/read`)
- **Conversational Oracle** (`/assistant`):
  - free chat + auto reading routing (Tarot/Astro/Gene Keys/Ancestry)
  - local session memory, summarize, export/import
  - strict reading mode with source tags
- **Grounded reading safeguards** continue across modalities.

## Privacy-first model
- Data is stored locally in browser storage (localStorage + IndexedDB object stores).
- GEDCOM ancestry data is never uploaded by default.
- Consent controls in `/settings`:
  - Hide living persons (default ON)
  - Allow AI to use ancestry data (default OFF)
  - Include names in AI context (default OFF)
- You can delete all ancestry data in `/ancestry/import`.

## Quick start
```bash
pnpm run pnpm:setup
pnpm install
pnpm run doctor
pnpm dev
```

## If install fails (restricted network / 403)
```bash
corepack enable
corepack prepare pnpm@9.12.3 --activate
pnpm config set registry https://registry.npmjs.org/
pnpm store prune
pnpm install --prefer-offline
pnpm run doctor
```
Use **Demo Mode** in `/settings` to keep core UX usable without AI backend.

## Core routes
- Tarot: `/tarot`
- Astrology: `/astrology`
- Gene Keys: `/genekeys`
- Ancestry: `/ancestry`
- Assistant: `/assistant`
- Privacy: `/privacy`

## Disclaimers
For entertainment and self-reflection only. No legal, medical, or financial advice.

## Credits
- Astronomy calculations: `astronomy-engine`
- Timezone lookup: `tz-lookup`
- Geocoding endpoint: OpenStreetMap Nominatim
- Framework: Next.js + React + Tailwind + Vitest
- GEDCOM parser implemented in-project for core tags (no runtime scraping/services)

## License
MIT (existing LICENSE preserved).
