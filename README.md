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

## TIEKAT Phase 4 (Canonical v54 Alignment)
- GypsyAI gravity metadata is now explicitly aligned to canonical **TIEKAT v54** terminology through a TypeScript v54 metadata/spec module.
- Responses include canonical spec/scoring alignment fields and consistent anti-overclaim provenance wording.
- Added compact helpers for per-version comparison and drift summaries across gravity history snapshots.
- Diagnostics mode now supports a lightweight local sparkline for recent modeled Δg values.
- Mixed-version history normalization is strengthened for legacy/missing-version rows and future-safe defaults.
- The system remains deterministic, local-first, privacy-safe, and explicitly theoretical (no hardware/physical measurement claims).

## TIEKAT Phase 5 (Version Comparison Presentation)
- Assistant diagnostics now includes a compact version-comparison summary chip using local modeled gravity history.
- The chip reports current scoring version, number of versions present, and summary state (`insufficient_data`, `single_version`, `mixed_versions`, `drift_detected`).
- When drift is detected across versions, diagnostics can show a short text summary of average `informationIntegral` and `deltaGPredicted` drift.
- Added deterministic mixed-version backup fixture tests to validate normalization defaults for missing legacy fields (`scoringVersion`, `rowVersion`, `canonicalSpecVersion`).
- Comparison UI remains diagnostics-only and gravity interpretation remains explicitly modeled/theoretical.

## TIEKAT Phase 6 (Oracle Presentation Layer)
- Added a deterministic oracle presentation formatter that translates existing modeled gravity metadata into concise human-facing language.
- Oracle presentation is separate from diagnostics: it offers a compact interpreted summary while diagnostics remains an optional debug surface.
- Added shared tiny drift-number formatting for consistent rendering of near-zero and small values.
- Oracle text is generated from existing local/sanitized metadata only and always preserves modeled/theoretical anti-overclaim wording.
- No new scoring path or external data source is introduced in this phase.

## TIEKAT Phase 7 (Master Action Framing Layer)
- Added canonical **v55** metadata/spec helpers for a conceptual master-action framing layer (`TIEKAT-v55`).
- Kept the runtime distinction explicit: v54 remains the operational modeled gravity layer, while v55 is presentation-only theoretical framing.
- Oracle presentation can now optionally include a compact v55 framing sentence without changing underlying scoring.
- Introduced lightweight shared Assistant presentation components (`OracleCard`, `ModeledBadge`, `DiagnosticsSection`, `SectionLabel`) for visual consistency.
- Added low-friction UI visibility tests for oracle/disclaimer/framing and diagnostics placeholder behavior.
- All framing remains modeled/theoretical and does not imply hardware measurement or physical confirmation.

## TIEKAT Phase 8 (Oracle Session Artifact Layer)
- Added a compact local-first **oracle artifact** schema for replayable TIEKAT session snapshots (`TIEKAT-oracle-artifact-v1`).
- Artifacts intentionally store summaries and modeled metadata only: route/mode/modules, prompt/response summaries, gravity snapshot, v54 metadata, optional v55 framing presence, trend/version state, and consent flags.
- Artifacts intentionally do **not** store full transcripts, raw ancestry payloads, or deep private source objects.
- Persistence is additive and local-only via IndexedDB (`oracleArtifacts` store) with normalization-safe defaults, recent listing, deletion, and compact export JSON helper support.
- Artifact persistence is gated by existing session-memory consent (when memory is disabled, artifact persistence does not run).
- Added lightweight Assistant replay UI: recent oracle artifacts list, compact replay panel, optional export/delete actions, and tiny comparison readout against the previous artifact.
- Added deterministic helper coverage for artifact build/summary/normalization, privacy-safe redaction behavior, persistence/load/recent/delete flow, export shape, and artifact comparison deltas.
- As with prior phases, oracle/gravity data remains explicitly modeled/theoretical and not a physical sensor measurement.

## TIEKAT Phase 9 (Ritual / Session Mode)
- Added typed ritual session modes (`open_reflection`, `tarot_inquiry`, `astrology_reflection`, `genekeys_contemplation`, `ancestral_listening`, `synthesis_oracle`) with deterministic routing/presentation preferences.
- Session modes are resolved safely with consent: ancestry-forward mode automatically falls back when ancestry consent is disabled.
- Assistant UI now includes a compact session mode selector and mode ritual framing line; mode does not require diagnostics to function.
- Oracle presentation now carries mode-aware label/ritual framing while preserving modeled/theoretical disclaimers and no diagnostics leakage by default.
- Oracle artifacts now persist session mode identity/labels/ritual framing metadata for coherent replay, while keeping compact/sanitized local-only payloads.
- Artifact replay/list UI was extracted into reusable components (`OracleArtifactList`, `OracleArtifactReplayCard`, `SessionModeBadge`) for cleaner Assistant composition.
- Added optional local artifact import path (single JSON file), with deterministic validation/normalization and memory-enabled gating.
- Maintained local-first behavior, additive API metadata, and explicit v54 operational + v55 conceptual distinction.

## TIEKAT Phase 10 (Ritual Presets + Artifact Diff Layer)
- Added typed, static prompt preset maps per session mode (`promptPresets.ts`) to make ritual/session entry faster without changing scoring or routing internals.
- Presets are mode-aware and compact; ancestry-sensitive presets are filtered when ancestry consent is not allowed.
- Assistant UI now shows lightweight preset chips for the active mode; selecting a preset appends/prefills the prompt input.
- Added compact artifact diff view helper (`buildOracleArtifactDiffView`) to summarize mode/route/module/version and gravity deltas in a scan-friendly “What changed” block.
- Replay UI now renders structured diff lines (up to 8 concise items) instead of a single long comparison sentence.
- All diff/preset behavior uses local metadata only and preserves modeled/theoretical framing (no hardware/physical claims).

## TIEKAT Phase 11 (Sacred Geometry Diagnostic Layer)
- Added a deterministic sacred-geometry mapper (`sacredGeometry.ts`) that derives compact glyph/layer/caption state from existing TIEKAT metadata only (gravity status/integral, trend, version state, session mode, modules, route/mode).
- Added lightweight dependency-free SVG rendering (`SacredGeometryGlyph`) as a quiet modeled diagnostic companion in Assistant UI.
- Geometry glyphs are rule-based (no randomness) and tied to metadata conditions such as drift detection, synthesis density, and single-module sparsity.
- Geometry captions remain explicitly modeled/theoretical and avoid any sensor/measurement claims.
- Included optional low-friction polishes:
  - local-only recent preset ordering (`markPresetUsed`, `orderPresetsByRecent`)
  - copy-to-clipboard action for artifact diff text in replay panel
- Preserved privacy/consent boundaries: geometry and diff/copy use compact sanitized metadata only; no new persistence side-channel.

## TIEKAT Phase 12 (Geometry Explainability + View Control)
- Sacred geometry state now includes a compact deterministic rule trace (`selectionRule`, `selectionReason`, `layerReason`) explaining glyph/layer selection.
- Geometry trace is diagnostics-only and hidden from normal oracle view by default.
- Added explicit user control for sacred geometry visibility in oracle view (`Show sacred geometry in oracle view`).
- Geometry visibility preference is persisted locally (localStorage) with safe defaults and no telemetry/sync.
- Core glyph mapping remains metadata-driven, deterministic, and explicitly modeled/theoretical.

## TIEKAT Phase 13 (Oracle Memory Constellation Layer)
- Added deterministic oracle constellation mapping from recent local artifacts only (`oracleConstellation.ts`) with compact nodes/edges/caption state.
- Added lightweight SVG constellation renderer (`OracleConstellation`) for quiet continuity visualization.
- Constellation is diagnostics-oriented and appears only when recent local artifacts exist.
- Added diagnostics-only sacred-geometry rule legend chips using the current rule vocabulary.
- Constellation captions remain modeled/theoretical and explicitly local-memory based.

## TIEKAT Phase 14 (Constellation Filter Chips)
- Added deterministic diagnostics-only constellation filters for mode, scoring version, and shift type.
- Added compact filter option derivation and filter application helpers (`getConstellationFilterOptions`, `applyConstellationFilters`) with coherent node/edge retention.
- Added lightweight diagnostics filter controls (`ConstellationFilterChips`) with reset support.
- Added local-only persistence for last-used constellation filters (no telemetry/sync).
- Filtered constellation captions remain explicitly local/modelled/theoretical and include deterministic empty-state messaging when no nodes match.

## TIEKAT Phase 15 (Ritual Export Deck Layer)
- Added deterministic ritual export helpers (`ritualDeck.ts`) that derive compact ritual cards and decks from sanitized oracle artifacts only.
- Ritual cards intentionally store summary-level metadata (headline, response summary, mode, gravity summary, v54/v55 framing hints, geometry glyph) and do not export full raw transcripts by default.
- Added local-only export helpers for ritual card/deck JSON plus compact deck markdown summaries with explicit modeled/theoretical footer language.
- Added lightweight Assistant ritual deck panel for creating a recent or selected deck and exporting deck/card artifacts.
- This phase remains additive/local-first: no cloud sync/sharing, no new scoring math, and no hardware/physical measurement claims.

## TIEKAT Phase 16 (Ritual Deck Memory + Round-Trip)
- Added optional memory-gated local ritual deck persistence (`ritualDecks` IndexedDB store) with deterministic normalization and recent list/delete helpers.
- Added compact deck-build filters (mode, scoring version, time window) with deterministic artifact filtering and filtered deck generation.
- Added ritual deck JSON import validation + normalization for local round-trip reuse, with unsupported-version rejection.
- Deck import/build remains local-only and summary-level; no raw transcript persistence paths were added.
- Assistant ritual deck panel now includes filter controls, local recent-deck replay shortcuts, import, and delete actions while preserving modeled/theoretical footer language.
