# GypsyAI

**GypsyAI** is a local-first symbolic reflection environment built with Next.js and TypeScript. It combines deterministic and source-declared readers for Astrology, Hermetic correspondences, Gene Keys, Tarot, ancestry context, and a governed conversational/oracle layer.

The project is designed for **reflection, exploration, and hypothesis generation**. Symbolic outputs are not medical, legal, financial, historical, or scientific verdicts.

## Core modules

- **Astrology** — chart computation, placements, aspects, houses, Ascendant/MC, tropical/sidereal modes, and Hermetic key mapping.
- **Hermetic correspondences** — explicit correspondence registries, including Golden Dawn and Thoth profiles.
- **Gene Keys** — local key, line, and mandala data used by the reflection layer.
- **Tarot** — symbolic reading workflows.
- **Ancestry** — local-first GEDCOM/context workflows with strong consent controls.
- **Assistant / Vessel Oracle** — governed provider-optional conversational synthesis.
- **TIEKAT** — deterministic orchestration, modeled diagnostic metadata, versioning, local continuity artifacts, ritual/session modes, council modes, explainability, and explicit anti-overclaim boundaries.

## Local-first privacy model

GypsyAI is designed to keep user data local by default.

- Browser storage uses localStorage + IndexedDB.
- Ancestry imports remain local by default.
- Living-person hiding defaults ON.
- AI use of ancestry data defaults OFF.
- Name inclusion in AI context defaults OFF.
- Memory can be disabled; stateless operation is supported.
- Backup/restore is local; optional encrypted backup uses browser WebCrypto.
- No feature should reinterpret modeled TIEKAT variables as physical sensor measurements.

## Deterministic and modeled layers

GypsyAI deliberately separates computational facts from symbolic interpretation.

Examples:

- astronomical calculations are computational inputs;
- Hermetic, Tarot, Gene Keys, and ritual associations are symbolic frameworks;
- TIEKAT gravity/sphere/geometry variables are **modeled/theoretical metadata**, not measurements of physical gravity or other hardware-observed phenomena;
- generated oracle language remains interpretation rather than proof.

## Mothership Reader Bus integration

GypsyAI can act as a family of **reader modules** inside the Parallax / OBLP Mothership architecture without being merged into OBLP itself.

The integration boundary lives under:

```text
src/lib/mothership/
```

The adapter contract is designed around:

```text
reader_id
reader_version
input
observations
symbolic_interpretation
provenance
warnings
claim_boundary
receipt_hash
```

Initial reader candidates:

- `gypsy.astro`
- `gypsy.hermetic`
- `gypsy.genekeys`
- `gypsy.lineage`
- optional oracle/presentation adapters

The Mothership adapter does **not** make these outputs OBLP canon. Each reader keeps its own provenance, version, claim boundary, and evidence status.

## Quick start

```bash
pnpm run pnpm:setup
pnpm install
pnpm run doctor
pnpm dev
```

## Quality checks

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
pnpm test:a11y
```

Deterministic browser-test mode:

```bash
TEST_MODE=1 pnpm test:e2e
```

## Optional model providers

Demo/local deterministic behavior does not require a hosted model provider. Optional provider configuration follows the existing environment conventions for OpenAI, Anthropic, xAI, Ollama, and compatible governed adapters.

## Core routes

- `/tarot`
- `/astrology`
- `/genekeys`
- `/ancestry`
- `/assistant`
- `/privacy`
- `/settings`

## Important boundaries

GypsyAI is for symbolic reflection and experimentation. It does **not** provide medical, legal, or financial advice and does not establish historical, theological, psychological, or scientific truth.

Where the project uses astronomy or deterministic calculations, those calculations should remain visibly distinct from downstream symbolic interpretation.

## Credits and third-party material

GypsyAI uses third-party libraries and may contain datasets or source material with licenses/terms independent of this repository's project license. Those materials remain governed by their respective licenses and terms.

Notable runtime dependencies include:

- `astronomy-engine`
- `tz-lookup`
- Next.js / React
- Vitest / Playwright

## License

GypsyAI project-owned source is licensed under the **MIT License**. See [`LICENSE`](LICENSE).

The repository was previously published under AGPL-3.0-or-later. See [`RELICENSE_NOTICE.md`](RELICENSE_NOTICE.md) for the provenance note. Earlier recipients retain the permissions they received under the earlier license; the current project-owned source is offered under MIT.

Third-party dependencies, datasets, assets, excerpts, and other material not owned by this project retain their own licenses or terms.

## History

GypsyAI has evolved through many additive TIEKAT phases covering deterministic orchestration, local artifacts, modeled gravity metadata, explainable sacred-geometry presentation, oracle continuity, ritual decks, council modes, v54/v55/v56 framing, habitat profiles, and local continuity tooling.

The complete phase-by-phase README history remains available in git history. Current development should prefer versioned modules, tests, and explicit provenance over accumulating new claims in prose.
