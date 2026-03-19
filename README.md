# Gypsy AI v1.4 — Ship-Ready + Fully Tested

Gypsy AI is a local-first Hermetic reflection app combining Tarot, Astrology, Gene Keys, Ancestry, and a conversational assistant. v1.4 focuses on production readiness: deterministic testing, backup/restore, offline/PWA support, security hardening, and UX polish.

## v1.4 Highlights
- **End-to-end testing with Playwright**
  - deterministic demo-first critical user journeys in `tests/e2e/*`
  - dedicated scripts: `pnpm test:e2e`, `pnpm test:a11y`
- **Data integrity + recovery**
  - typed IndexedDB wrapper with schema versioning and health checks
  - one-click full local backup/restore (JSON)
  - optional encrypted backups (WebCrypto PBKDF2 + AES-GCM)
- **Offline + installable PWA**
  - app manifest, service worker caching, offline fallback page
  - install prompt and runtime Online/Offline + Demo status indicators
- **Reading guardrails + security**
  - prompt-shield sanitization to reduce injection attempts
  - deterministic grounding/verifier flows remain in place for readings
  - route-level in-memory rate limiting + security headers/CSP
- **UX and release polish**
  - onboarding wizard, module-level recovery affordances, error boundaries
  - issue templates, PR template, dependabot config, changelog updates

## Privacy-first model
- Data is stored locally in browser storage (localStorage + IndexedDB).
- Ancestry imports (GEDCOM) remain local by default.
- Consent controls in `/settings` include:
  - Hide living persons (default ON)
  - Allow AI to use ancestry data (default OFF)
  - Include names in AI context (default OFF)
- “Delete all ancestry data” and full app backup/restore are available in-app.

## Quick start
```bash
pnpm run pnpm:setup
pnpm install
pnpm run doctor
pnpm dev
```

## Verify quality locally
```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
pnpm test:a11y
```

## Test mode (deterministic)
Set `TEST_MODE=1` to force deterministic test behavior:
- Demo Mode forced ON
- External geocode/timezone dependencies avoided in test flows
- Stable seeded behavior for reproducible checks

Example:
```bash
TEST_MODE=1 pnpm test:e2e
```


## Provider configuration (optional, Demo Mode works without keys)
- OpenAI
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL` (default: `gpt-4o-mini`)
- Anthropic (Claude)
  - `ANTHROPIC_API_KEY`
  - `ANTHROPIC_MODEL` (default: `claude-3-5-sonnet-latest`)
  - `ANTHROPIC_VERSION` (default: `2023-06-01`)
- xAI (Grok)
  - `XAI_API_KEY`
  - `XAI_MODEL` (default: `grok-4-0709`)
- Ollama
  - `OLLAMA_BASE_URL`
  - `OLLAMA_MODEL`

## Backup encryption notes
Encrypted backups use browser WebCrypto (`PBKDF2` + `AES-GCM`) and store required metadata (salt/iv) in the backup envelope. This protects backup portability but still depends on strong user passwords and local device security.

## Core routes
- Tarot: `/tarot`
- Astrology: `/astrology`
- Gene Keys: `/genekeys`
- Ancestry: `/ancestry`
- Assistant: `/assistant`
- Privacy: `/privacy`
- Settings/Diagnostics: `/settings`

## Disclaimers
For entertainment and self-reflection only. Gypsy AI does **not** provide legal, medical, or financial advice.

## Credits
- Astronomy calculations: `astronomy-engine`
- Timezone lookup: `tz-lookup`
- Geocoding endpoint: OpenStreetMap Nominatim (disabled in deterministic test mode)
- Framework/runtime: Next.js + React + Tailwind + Vitest + Playwright
- GEDCOM parsing and ancestry derivation logic are implemented in-project (local-first)

## License
MIT (existing LICENSE preserved).

## TIEKAT Phase 1 (Assistant Kernel)
- Assistant requests now run through a small internal **TIEKAT** kernel before response delivery.
- Phase 1 scope is intentionally limited to the Assistant orchestration boundary:
  - deterministic request routing/classification
  - consent-aware context envelope assembly
  - lightweight module adapters (Tarot, Astrology, Gene Keys, Ancestry)
  - local-first, optional compact memory anchors
  - deterministic verification pass on generated outputs
- Privacy safeguards remain strict:
  - ancestry context is only included when consent allows it
  - name inclusion follows settings consent
  - living-person hiding flags are propagated into kernel redaction metadata
  - memory is disableable; when disabled, TIEKAT runs statelessly and does not persist memory
- Out of scope in Phase 1:
  - no full-app refactor
  - no replacement of module engines
  - no remote memory service
  - no non-deterministic hidden classifier layer

## TIEKAT Phase 2 (Gravity Bootstrap Oracle Layer)
- TIEKAT now computes a **Gravity Bootstrap** internal signal for Assistant flows as a deterministic modeled/theoretical layer.
- This layer follows a conceptual modified-Poisson framing and computes a predicted `deltaGPredicted` from symbolic/context signals, but remains an internal model variable.
- Important safety/provenance: this does **not** measure physical gravity, does not read hardware sensors, and must not be interpreted as a real-world gravity reading.
- Inputs are drawn from existing TIEKAT state (anchors, module diversity, coherence, memory continuity, redaction/issue penalties) with transparent deterministic weights.
- Outputs include explicit model labeling (`status`, `sourceMode`, `confidenceNote`) for traceability and future comparison with potential experimental validation work.

## TIEKAT Phase 3 (Transparency, Migration, Longitudinal Memory)
- Gravity Bootstrap now supports **optional diagnostics mode** (default OFF) so normal responses stay compact while debug requests can include deterministic feature/weight/intermediate breakdowns.
- Gravity scoring now includes explicit **`scoringVersion` metadata** and migration normalization helpers for future compatibility across stored rows.
- Compact gravity history is now persisted in local IndexedDB (`gravityHistory`) when memory is enabled, making backup/restore-compatible longitudinal comparison possible.
- History utilities support local-only trend summaries and grouping by scoring version for lightweight diagnostics UI surfaces.
- Privacy/consent guarantees remain enforced: no raw private ancestry/name payloads are stored in diagnostics/history, and memory-disabled mode prevents history persistence.
- This remains a **theoretical modeled layer only** and does not measure physical gravity or use hardware sensors.
