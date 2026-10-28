# GypsyAI Pages: TIEKAT Local Brain v0.2.1

This is the second **incremental, non-destructive** phase of the GitHub Pages migration. It reuses original TIEKAT modules from src/lib/tiekat, not a new pseudo-intelligence layer.

## Implemented

1. Browser-based TIEKAT session routing, mode framing and reflection plans in site/src/tiekatBrain.ts, using the existing core, sessionMode and routing modules.
2. Original Oracle Council mode selection (Off, Oracle Council, Deliberation Oracle, Swarm Synthesis) with existing **deterministic** Council roster and summaries. This is a **planning frame for a single Ollama call**, **not** multiple model agents. The original provider-backed adapter is a stub; it is not used in this release.
3. Manual opt-in TIEKAT memory notes using the original memory schema and localStorage key. Explicit recall keywords select at most 3 relevant notes; no automatic extraction or auto-save of user/model conversations. Memory OFF by default, per-note deletion and all-note deletion; disabling memory deletes the saved notes.
4. Ancestry consent OFF by default. Only user-explicitly attached, numerically validated aggregate counts may go to Ollama while consent is enabled; user names and living-person data remain unsupported in Pages TIEKAT. Turning consent off detaches an ancestry packet.
5. UI execution receipt after local Ollama responds: TIEKAT route, selected note count, attachment flag, Council role plan, and visible **heuristic** verification flags from the original verifier.
6. The existing GitHub Pages React static deployment, local Ollama-only request path, chat persistence toggle and deterministic tools are preserved. No server runtime, cloud keys, hosted inference, weight copies, PhiStream activation or unapproved API calls.

## Known limits / honesty

- The model is **an already-running local Ollama model**, selected by the user; the browser does not train or load weights.
- Oracle Council in this PR is **deterministic planning** plus one Ollama response. There is no true multi-agent debate or independent inference.
- TIEKAT output verification checks length and out-of-scope keyword heuristics; it does not establish factual accuracy.
- Memory is stored unencrypted in this browser's localStorage if enabled. Users choose exactly what to remember. A saved note may contain private text and can be included in future local-model calls when its keywords match.
- A user may type sensitive details into ordinary chat manually; consent gating prevents automatic ancestry dataset inclusion, not words a user chooses to submit themselves.
- The legacy TIEKAT habitats, gravity models, artifact import, council continuity and full Oracle UI still require incremental migration.
- Direct browser → localhost Ollama remains subject to browser local-access/CORS policy. This PR adds no unsafe public proxy.
- PhiStream is an **experimental research engine** and is not exposed as a production chat provider.

## Tests and acceptance gates

Run from the repository root:

~~~sh
pnpm lint
pnpm test
pnpm build
pnpm pages:build
~~~

The new tests/pages-tiekat-local-brain.test.ts covers ancestry consent OFF/ON, rejection of unexpected identifying keys, Council's deterministic source, note recall ON/OFF and heuristic verification. In addition, inspect the Pages UI with Ollama disconnected and connected. Manually verify that no local model request occurs until the Send button is pressed, history and memory are opt-in, and toggling ancestry consent OFF removes pending attachments.

After CI passes, merge the PR to deploy Pages through GitHub Actions. The older Vercel-origin data is not automatically copied to GitHub Pages because browser storage is origin-isolated.
