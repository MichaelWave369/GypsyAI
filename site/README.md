> **GAIA v0.8 · Historical Scholar Mode:** Optional, default-off citations in completed Ritual Draw readings. Actual selected cards are matched against the four specifically reviewed sections of Waite's *Pictorial Key*; absent notes remain explicitly absent. The local model only receives short source annotations after you approve a bounded reading packet and press Send. No new network calls, storage or model dependencies. [Scholar Mode contract and acceptance](GAIA_SCHOLAR_MODE_V0_8.md).

> **GAIA v0.7 · Symbolic Library:** Browse the local 78-card editorial deck, compare four specifically reviewed historical notes to Waite's public-domain text, and see an explicit 74-card historical-review backlog. A source desk separates primary texts from institutional context; legacy Hermetic fields remain labeled unaudited. No additional model calls, imports, network fetches or dependencies. [Evidence ledger and research scope](GAIA_SYMBOLIC_LIBRARY_V0_7.md).

> **GAIA v0.6 · Spread Atlas:** Build a private 1–5 position tarot layout with named roles and normalized canvas coordinates. Drag positions or edit keyboard-accessible numeric fields, validate/export/import versioned JSON, and use the layout in the existing real manual Ritual Draw and four-lens Field Loom. Bounded source data only; local Ollama still requires explicit Send. [Design and acceptance notes](GAIA_SPREAD_ATLAS_V0_6.md).

> **GAIA v0.5 · Field Loom evidence lenses:** After you confirm a one- or three-card Ritual Draw, interactively inspect the actual chosen cards, positions, recorded keywords, inherited Hermetic element fields and arcana classifications. Every assertion carries source labels; no new model inference, uploads, hidden redraws or dependencies. [Design and validation notes](GAIA_FIELD_LOOM_V0_5.md).

> **GAIA v0.4.0 Ritual Draw + Field Loom:** An original, MIT-inspired browser-only card table. Users shuffle, cut, select and reveal fixed face-down cards, confirm a spread, inspect evidence-labeled position threads and optionally export private notes. The Oracle remains a separate explicitly approved localhost handoff. No new dependency or third-party card art. See [MIT inspiration research, provenance and privacy boundaries](GAIA_MIT_INSPIRATION_RITUAL_V0_4.md).

> **GAIA v0.3.0 Reading Room:** The Pages portal is now presented as GAIA, **Gypsy Artificial Intelligence Ally**, while preserving the historic GypsyAI repository name and URL. New Reading Room combines genuine browser-side tarot, astrological chart calculation and approximate Gene Keys activation mapping into a consent-reviewed source packet for the existing local Ollama Oracle. Standalone Tarot, Astrology, Gene Keys, Ancestry, Ally Sanctuary and local intelligence labs remain available. See [GAIA Reading Room contract](GAIA_READING_ROOM.md).

> **v0.2.7 First Human Pilot:** A dedicated Pilot Sanctuary for real, user-initiated TIEKAT + local Ollama conversations. Voluntary profile details require renewed approval before each use; the profile and entire pilot chat remain in ephemeral React state, with no automatic cloud, model-memory, genealogy or source import. See [Pilot Sanctuary privacy and smoke-test contract](PILOT_SANCTUARY.md).

> **v0.2.6 PocketBrain Comparison Studio:** Approved 6/10-request balanced Baseline-vs-Guarded browser experiment on the same fixed public prompt and 64-token ceiling. Actual model outputs stay local for subjective quality review; downloaded JSON contains only numerical observations, execution order and caveats. See [comparison protocol](POCKETBRAIN_COMPARISON.md).

> **v0.2.5 Sovereign Brain Bridge:** Dedicated opt-in PocketBrain Tiny browser inference lab using an MIT source-pinned SDK snapshot (runtime and model downloads still external/unpinned), with real browser receipts and explicit disposal. BrainC's connection is only a fixed local read-only liveness probe. Neither replaces the governed Ollama Oracle; PhiStream remains research-only. See [bridge security and validation contract](SOVEREIGN_BRAIN_BRIDGE.md).

> **v0.2.4 Extended Workload Lab:** Operator-approved 128/256-token runs with actual output count/termination reason, `/api/ps` before/after model-residency snapshots, cross-session V3 JSON export/import, and compatibility flags. No forced cold starts, unsupported CUDA claims or PhiStream activation. See [long workload contract](LONG_WORKLOAD_LAB.md).

> **v0.2.3 Cold/Warm Performance Studio:** Controlled opt-in post-warmup repeat samples, exploratory balanced AB/BA model comparisons, descriptive medians/IQR, local V1 receipt import, and V2 exported experiment ledgers. No forced model unload, external benchmarking, or PhiStream chat. See [repeat laboratory contract](REPEAT_LAB.md).

> **v0.2.2 Local Intelligence Lab:** Browser-initiated Ollama connection checks, reported loaded-model memory, one opt-in fixed-prompt inference observation and a read-only (not chat-ready) PhiStream research handshake. See [Local Lab evidence and security contract](LOCAL_LAB.md). No model speedup is claimed.

> **TIEKAT Local Brain v0.2.1 (migration phase 2):** The Pages React Oracle now offers original TIEKAT reflection modes, a deterministic Oracle Council planning panel, consent-gated ancestry aggregates, opt-in locally stored note memory, and visible heuristic verification receipts. See [the v0.2.1 contract](TIEKAT_LOCAL_BRAIN.md). This is still one local Ollama response, not a set of independently operating agents or a PhiStream server.

# GypsyAI Sovereign Portal | React / GitHub Pages

This branch begins the **Vercel exit** for GypsyAI. The public frontend is a Vite-built React single-page app published as static files via GitHub Actions. The original Next.js app stays in the repository during parity migration and is **not** deployed to Pages.

Expected address **after merge + enabling GitHub Actions Pages**:
https://michaelwave369.github.io/GypsyAI/

## Working in this phase

- Responsive original celestial UI and hash-based navigation (safe on GitHub Pages subpaths and refresh).
- Local tarot draws and deterministic grounding packets from the existing GypsyAI deck and source libraries.
- Browser-side astrology engine (UTC input and explicit coordinates) and Gene Keys activation mapping; export JSON.
- GEDCOM parsing, IndexedDB storage, default living-person redaction, local ancestry summaries and delete/export.
- Opt-in direct browser-to-Ollama model discovery and chat, with optional local chat persistence (OFF by default).
- Explicit reading-packet handoff, limited to the local model on user action.
- Clear disabled research status for PhiStream. No downloaded weights, cloud API keys or Vercel backend.

**Not yet migrated:** provider-executed multi-agent Council, TIEKAT habitat/ritual/deck continuity, advanced study and ancestry pages, old encrypted backup import, all provider-grounded verification. This is a real working Phase 1 portal, **not** full functional parity. Preserve old user data and do not turn off the old app before exporting and verifying.

## Build

Run from repository root:

~~~sh
corepack enable
corepack prepare pnpm@9.12.3 --activate
pnpm install --frozen-lockfile=false
pnpm pages:dev
pnpm pages:build
~~~

Vite builds into site/dist at URL base path /GypsyAI/. CI runs the Pages build on pull requests. The Pages deployment workflow runs on main (or manual dispatch).

## Publish

1. Merge this branch after CI is green.
2. GitHub repository **Settings > Pages > Build and deployment > Source: GitHub Actions**.
3. Trigger **GypsyAI - GitHub Pages** if the main push did not launch deployment.
4. Verify https://michaelwave369.github.io/GypsyAI/ across tabs, browsers and mobile.
5. Export any prior Vercel-origin browser data before disconnecting that service. A GitHub Pages migration does not automatically delete a Vercel project.

## Optional local model

Run Ollama on the **same device** as the web browser, bound to localhost. Pull a compatible licensed model (for instance, with the command 'ollama pull gemma3:4b'). Then in **Local Oracle**, connect to http://127.0.0.1:11434 and select a model from detected installations.

Browser-to-local communication might be blocked by HTTPS, CORS or local network access permissions. Restrict allowed origins to your own Pages domain, not wildcard. For example, from PowerShell when launching a stopped Ollama service:

~~~powershell
$env:OLLAMA_ORIGINS = "https://michaelwave369.github.io"
ollama serve
~~~

Ollama's background/tray instance may require restart to apply environment variables. **Do not** bind Ollama to 0.0.0.0, open ports on the router, disable browser security or add a public proxy to work around this. Browser compatibility is not guaranteed. If this fails, use a local development frontend and build a separately reviewed secure local companion in a later PR. Direct local chat uses Ollama's /api/chat endpoint. No hosted backend exists on GitHub Pages.

## Privacy and migration limitations

- Browser storage is isolated per origin. Data on the old Vercel domain is **not** accessible to the new github.io origin.
- Keep any legacy export/backups safely until a future import tool supports those schemas. This Pages preview does not restore encrypted TIEKAT backups.
- GEDCOM stays in local IndexedDB, except when YOU export the full unredacted JSON. That export contains private data; handle carefully.
- The current ancestry portal only offers aggregate numerical counts to the local model, on an explicit button press. It never transmits GEDCOM names or locations.
- Chat is not saved across reloads unless the user turns on local chat history. Clearing history removes the localStorage history.
- Reading packets and chat prompts are sent to the user-controlled Ollama localhost endpoint only if the user submits a model request.

## PhiStream boundary

PhiStream has only a narrow experimental Llama safetensors execution path and SHA-bound real-weight experiments. It has no general GGUF tokenizer/server/chat protocol. Do not promote it to a selectable live provider until a separate local companion has architecture/weight validation, real reference parity, tokenizer handling, memory/latency gates, security controls, and explicit execution permission. The Pages release contains no model weights.

## Acceptance checks

- Both legacy Next build and Vite Pages build must pass CI.
- All public modules work disconnected, including Tarot, chart, Gene Keys and import.
- Hash navigation works after refresh at /GypsyAI/.
- No ancestry is included by default in model requests.
- Unreachable Ollama shows an explicit error, no cloud fallback and no fabricated model answer.
- The old Vercel project stays untouched until migration parity is checked.
