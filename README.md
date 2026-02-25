# Gypsy AI v1.2 — Accuracy + Gene Keys

Gypsy AI is a free + open-source Hermetic self-reflection app combining Tarot, Astrology, and Gene Keys with local-first privacy.

## v1.2 Highlights
- **Grounded Reading Engine** for Tarot/Astro/Gene Keys:
  - deterministic facts packet
  - allowed-terms constraints
  - required-sections enforcement
  - verifier pass for missing sections / invented facts
- **Accuracy settings**: Accuracy Mode, passes (1/2/3), temperature preset, and hard “no new correspondences”.
- **Gene Keys module**:
  - `/genekeys`, `/genekeys/profile`, `/study/genekeys`
  - 64-key local dataset + line themes
  - activation sequence + planetary keys + design-date search (~88° solar offset)
  - local save/export only (no server-side profile storage)

## Privacy and disclosures
- Local-first storage (profiles/sessions in browser localStorage).
- Interpretations are contemplative, reflective, and non-fatalistic.
- No medical, legal, or financial advice.

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

## Feature map
- Tarot: `/tarot`
- Astrology: `/astrology`
- Gene Keys: `/genekeys`
- Local profiles: `/profile`, `/genekeys/profile`
- Study mode: `/study`, `/study/tree`, `/study/tarot`, `/study/decans`, `/study/genekeys`

## Credits
- Astronomy calculations: `astronomy-engine`
- Timezone lookup: `tz-lookup`
- Geocoding endpoint: OpenStreetMap Nominatim
- Framework: Next.js + React + Tailwind + Vitest
- Gene Keys mandala/data in this repo are concise original summaries and static mapping authored for this project; no runtime scraping.

## License
MIT (existing LICENSE preserved).
