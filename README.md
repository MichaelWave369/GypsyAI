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
GypsyAI is licensed under the **GNU Affero General Public License v3.0 or later** (`AGPL-3.0-or-later`).

If you modify GypsyAI and run it as a networked service, you must make the corresponding source code of your modified version available under the AGPL.

For organizations seeking proprietary or closed-source hosted/commercial use without AGPL reciprocity obligations, commercial licensing is available from the project owner (see `COMMERCIAL-LICENSING.md`).

GypsyAI remains local-first, privacy-conscious, and community-available, but hosted modifications are subject to AGPL network-use obligations. Deployments should provide users with a visible source-access notice when interacting with the app remotely.

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

## TIEKAT Phase 17 (Agentora Oracle Council Layer)
- Added optional governed council modes (`disabled`, `oracle_council`, `deliberation_oracle`, `swarm_synthesis`) with deterministic roster planning under TIEKAT control.
- Added compact council roles (`oracle_reader`, `pattern_weaver`, `skeptic_grounder`, optional consent-gated `lineage_keeper`, `final_integrator`) with deterministic ordering and purposes.
- Added sanitized council input-envelope and deterministic deliberation summaries (agreement/disagreement, warnings, synthesis note) with modeled/theoretical footer language.
- Assistant API now returns compact council summaries when enabled, while the default single-oracle path remains unchanged when council mode is disabled.
- Oracle artifacts now support additive compact council metadata for replay/export compatibility without storing full council transcripts.

## TIEKAT Phase 18 (Provider-Backed Council Adapter + Continuity)
- Added a governed council adapter seam (`oracleCouncilAdapter.ts`) supporting optional provider-preferred execution while preserving deterministic fallback by default.
- Council summaries now include compact execution metadata (`executionSource`, `adapterName`, `adapterAvailable`) for replay/diagnostics continuity.
- Added local-only council mode preference helpers (`loadCouncilModePreference`, `saveCouncilModePreference`) and wired them into Assistant council controls.
- Added diagnostics-only council continuity summaries from recent artifact council metadata (continuity/shift state, role stability, disagreement rate, execution-source mix).
- Adapter input remains sanitized and summary-only; no raw council/provider transcript persistence paths were introduced.

## TIEKAT Phase 19 (v56 Sovereign Sphere Layer)
- Added canonical v56 metadata/spec helpers (`v56.ts`) as the TypeScript semantic counterpart for the modeled “Awakened/Sovereign Sphere” layer.
- Added deterministic awakened sphere state derivation (`awakenedSphere.ts`) from existing local modeled metadata only (gravity, council continuity, geometry glyph family, constellation continuity, trend/version/session mode/modules).
- Added compact v56 sphere presentation card in Assistant UI with optional diagnostics trace details.
- Kept v54/v55/v56 role distinction explicit: v54 operational runtime, v55 conceptual framing, v56 theoretical integration/presentation layer.
- Sphere outputs remain explicitly modeled/theoretical and do not claim hardware measurement or physical confirmation.

## TIEKAT Phase 20 (Sphere Artifact + Ritual Continuity Layer)
- Oracle artifacts now support an additive compact `v56` summary block (awakening/shield/synchrony/overlap, glyph family, compact caption, confidence note) with normalization-safe defaults for legacy artifacts that have no v56 data.
- Artifact build flow now includes v56 summaries only from already-derived awakened sphere state (no secondary hidden recomputation path).
- Replay and ritual surfaces now show compact v56 continuity metadata when present, while keeping exports compact and local-only.
- Constellation continuity now supports lightweight sphere-state awareness (`sphere_shift`) and a deterministic `buildSphereContinuitySummary(...)` helper for diagnostics-friendly continuity lines.
- All phase additions remain additive, memory-gated, privacy-safe, and explicitly modeled/theoretical (no hardware/physical measurement claims, no raw private payload persistence).

## TIEKAT Phase 21 (Sovereign Habitat Profiles)
- Added local-first habitat profiles as compact preference/config presets (session mode, council mode, adapter preference, geometry/diagnostics/v55 toggles, constellation/ritual filters, prompt-preset mode).
- Habitat profiles intentionally store **no transcript/session content** and no raw private ancestry payloads; they are configuration-only artifacts.
- Added deterministic profile defaults (`Quiet Reflection`, `Tarot Chamber`, `Synthesis Oracle`, `Council Deliberation`, `Sphere Diagnostics`) plus normalization-safe persistence/import/export helpers.
- Assistant UI now includes a compact habitat panel for apply/save/update/delete/export/import profile flows.
- Profile application is explicit and consent-safe: ancestry-forward requests resolve through existing session-mode governance when ancestry consent is disabled.
- Profiles remain local-only and preserve modeled/theoretical runtime posture (no hardware/physical measurement claims and no ontology changes to v54/v55/v56 roles).

## TIEKAT Phase 22 (Habitat Diff Preview + Pinning)
- Added deterministic habitat profile diff helpers to preview config changes before apply (session mode, council mode, adapter preference, geometry/diagnostics/v55 toggles, constellation/ritual filters, prompt preset mode).
- Apply preview now surfaces consent-safe ancestry fallback messaging when a profile requests ancestry-forward mode while ancestry consent is disabled.
- Habitat profiles now support additive local-only pinning/order metadata (`pinned`, `sortOrder`) with normalization-safe defaults for legacy profiles.
- Added compact habitat UI controls for pin/unpin and light move up/down ordering without introducing a large management dashboard.
- Pinned/ordered profile data persists locally and round-trips through import/export while remaining configuration-only and privacy-safe.

## TIEKAT Phase 23 (Habitat Transition Layer)
- Added deterministic habitat transition modeling (`habitatTransition.ts`) that derives compact transition summaries and chip previews from existing profile diff/consent-safe mode resolution.
- Added compressed high-priority diff chips (session/council/diagnostics/geometry/v55/fallback) capped to a compact preview set by default.
- Added ritual-style transition summary copy before apply and compact transition-complete acknowledgment after apply.
- Added optional lightweight keyboard shortcuts for habitat management (`Alt+Shift+P`, `Alt+Shift+↑/↓`, `Alt+Shift+A`) with input/textarea safety guards.
- Transition tooling remains local-only, configuration-only, privacy-safe, and modeled/theoretical (no transcript-aware logic, no telemetry, no scoring changes).

## TIEKAT Phase 24 (Habitat Constellation Memories)
- Added additive habitat usage memory metadata on profiles (`lastAppliedAt`, `applyCount`, `lastAppliedSessionMode`) with normalization-safe defaults for legacy rows.
- Profile apply flow now records explicit local usage memory only when the user clicks apply (timestamp/count/mode), with no hidden tracking and no transcript/session payload capture.
- Added compact deterministic habitat memory helpers (`buildHabitatProfileMemorySummary`, `buildHabitatConstellationSummary`, `formatHabitatUsageSummary`) for recent usage, most-used habitat, pinned-never-applied, stale habitats, and a compact continuity note.
- Assistant habitat panel now shows lightweight memory cues (`last applied`, `used N times`, `never applied`) plus compact continuity lines to make habitats feel like living local context.
- Added optional chip-detail expansion control so transition chips stay compact by default but can be expanded on demand.
- Export/import remains additive and local-first; habitat memory stores only config usage metadata and preserves existing consent-safe/modeled-theoretical safety rails.

## TIEKAT Phase 25 (Habitat Time Semantics + Continuity Polish)
- Extracted compact deterministic habitat time helpers (`habitatTime.ts`) so relative-time labels are reusable/testable instead of page-inline logic.
- Added consistent local labels for habitat recency (`just now`, `5m ago`, `2h ago`, `3d ago`, `never applied`) and a dedicated `formatHabitatLastAppliedLabel(...)` helper.
- Added lightweight continuity-status classification/formatting (`never_applied`, `recently_active`, `frequently_used`, `stale`) for compact habitat memory polish.
- Assistant habitat selector now renders a tiny usage-status badge alongside existing memory cues while remaining compact and additive.
- Time/continuity semantics remain local-only metadata transforms with no transcript/private ancestry payload usage, no hidden tracking, and no oracle ontology changes.

## TIEKAT Phase 26 (Habitat-to-Habitat Constellation)
- Centralized habitat continuity thresholds/constants in `habitatConstants.ts` (stale window, frequent-use threshold, recent window size, max constellation nodes) for deterministic reuse.
- Added compact local `habitatConstellation.ts` mapping helpers for deterministic nodes/edges/state/summary derived only from habitat profile usage metadata.
- Constellation nodes reflect profile continuity context (apply count, recency bucket, intensity bucket, pinned marker, session/council mode metadata), while edges use recent transition metadata when available or deterministic recent-use fallback.
- Assistant habitat UI now surfaces tiny constellation cues (dominant continuity headline, dominant pair/line, compact node list) without introducing a dashboard.
- Constellation logic remains local-only/config-only with explicit-apply continuity input, no transcript/session-content analytics, and no changes to modeled/theoretical oracle semantics.

## TIEKAT Phase 27 (Habitat Ritual Decks)
- Added `habitatDeck.ts` to derive compact habitat ritual cards/decks from existing profile usage/config metadata only (no transcript/session content).
- Added deterministic deck builders for pinned/recent/all/selected habitats and compact summaries (`summarizeHabitatDeck`).
- Added local versioned export/import helpers for habitat deck JSON plus Markdown export, with validation and unsupported-version rejection.
- Added lightweight habitat deck controls in habitat UI (build pinned/recent/all, export JSON/Markdown, import JSON) and compact deck preview lines.
- Habitat deck cards include modeled/local-only footer copy and intentionally exclude private ancestry/session payloads and telemetry paths.

## TIEKAT Phase 28 (Habitat Sphere Profiles)
- Added deterministic `habitatSphere.ts` to derive compact modeled habitat sphere signatures from profile configuration/usage metadata only.
- Sphere signatures include compact v56-style identity fields (`awakeningState`, `shieldStatus`, `synchronyState`, `glyphFamily`, caption/confidence note, spec version) with explicit theoretical wording.
- Assistant habitat selector now shows a tiny “Modeled habitat sphere signature” cue (glyph + awakening/shield/synchrony + compact caption/confidence line).
- Habitat ritual cards/decks now carry additive sphere-signature metadata and include sphere lines in markdown export while preserving existing local/config-only posture.
- Sphere-profile logic remains local-only/config-derived, avoids transcript/private ancestry payloads, and makes no hardware/physical measurement claims.

## TIEKAT Phase 29 (Habitat Deck Memory)
- Added optional local habitat deck persistence in IndexedDB (`habitatDecks`) with normalized additive row entries and capped recent history.
- Habitat deck persistence is explicit-intent only: decks are saved when users build/import them, not in hidden background flows.
- Added compact recent habitat deck replay controls (open/delete) in the habitat selector for lightweight local deck memory continuity.
- Existing deck export/import behavior remains stable (JSON/Markdown export plus versioned JSON import validation), now interoperating with local recent deck memory.
- Stored deck memory remains configuration/profile-usage-only and excludes transcript/session/private ancestry payloads.

## TIEKAT Phase 30 (Habitat Deck Continuity Polish)
- Added deterministic compact habitat-deck saved-time helpers (`formatHabitatDeckRelativeTime`, `formatHabitatDeckSavedLabel`) for replay trust cues.
- Recent habitat deck replay list now shows compact metadata (`name`, `kind`, `cardCount`, `saved X ago`) using helper output instead of inline date formatting.
- Added lightweight inline delete confirmation controls (Delete → Confirm/Cancel) for recent deck removal without introducing modal/dashboard complexity.
- Persistence behavior remains explicit-intent only (build/import save, explicit delete remove), with no background sync or hidden tracking.
- Deck replay polish remains local-only/config-only and privacy-safe (no transcript/session/private ancestry payload usage).

## TIEKAT Phase 31 (Source Link + Continuity Refresh Polish)
- Added a lightweight visible `Source` link in the habitat control surface for hosted AGPL transparency clarity.
- Added tiny source metadata constants (`APP_SOURCE_LABEL`, `APP_SOURCE_URL`, `APP_LICENSE_ID`) for deterministic, update-friendly source-link wiring.
- Added minute-level local saved-time refresh so recent habitat deck labels stay current during long-open sessions without mutating persisted data.
- Saved-time refresh remains display-only and local; persistence semantics are unchanged (explicit build/import save, explicit confirmed delete).
- No telemetry/sync paths were added; source/saved-time polish remains privacy-safe and configuration-oriented.

## TIEKAT Phase 32 (Footer/About Memory Surface)
- Added a compact reusable footer/about surface that unifies source + license visibility, local-first/privacy-safe notes, and modeled/theoretical posture.
- Added deterministic app-about metadata constants (`aboutInfo.ts`) for app identity, source/license labels, commercial-licensing note label/path, and short safety notes.
- Footer optionally shows one compact habitat status line using already-safe runtime metadata only (selected habitat name, usage badge, recent deck count, current mode).
- Footer/about content is static + local metadata only: no transcript/session/private ancestry payloads, no telemetry, no cloud sync, and no hidden persistence.
