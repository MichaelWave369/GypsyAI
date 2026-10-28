# GypsyAI v0.2.7 | First Human Pilot / Pilot Sanctuary

## Why this exists

GypsyAI's TIEKAT local Oracle already works with an operator-run Ollama model. The first-person Pilot Sanctuary is a new, isolated conversation surface intended for hands-on testing with real, **voluntarily supplied** user background. This is not the 135M PocketBrain Tiny comparison lab and not a newly trained personal model.

### Try the pilot

1. Visit `https://michaelwave369.github.io/GypsyAI/#pilot` after this PR is merged and the Pages workflow finishes.
2. Start your own local Ollama on the same machine. Use the button **Detect local models** (no request happens on panel mount). Select `granite4.2:8b` if available, or another model discovered on that machine.
3. Optionally type a small background profile. It is entirely user-authored; it does not import ChatGPT memory, old TIEKAT notes, IndexedDB genealogy, reading packets or chat transcripts.
4. If you want that optional profile included in the **next** request, check the consent box. The model receives the profile only when the box is checked **and** the user presses Send. After each successful send, permission resets and must be checked again.
5. Enter a question. The conversation is real local Ollama generation via the same existing `askLocalModel` provider and TIEKAT `open_reflection` planner. The full response is displayed without manufactured sample text.
6. Continue the conversation if helpful. If you previously shared a profile and choose not to renew approval, the next send starts a **fresh** turn history, preventing prior AI replies that mention your profile from entering the next request. Editing the profile also clears previous pilot history.
7. Click **Clear pilot profile and entire conversation** to erase the pilot profile and visible messages from this tab. Navigation away unmounts the pilot and discards its React state. The clear control is disabled while an already-sent request is in flight; it cannot reverse content previously sent to local Ollama.

## Inference, storage, and consent boundaries

- The Pilot Sanctuary connects only to an explicitly validated localhost, 127.0.0.1, or IPv6 loopback Ollama origin. There is no public proxy or cloud fallback.
- The TIEKAT planner is called with memory disabled, no ancestry consent, no names, no memory entries, no reading packet, Council disabled and session mode `open_reflection`. These defaults **do not** modify the user's settings in the normal Local Oracle.
- No pilot profile, prompts or replies are persisted in localStorage, IndexedDB, GitHub or an export file by this feature. All pilot conversation and optional model profile stay in in-memory component state only.
- The operator-written question itself can contain personal information, and it is sent to local Ollama when the operator presses Send. The separate optional profile requires a fresh per-request checkbox.
- A generated answer might repeat previously supplied sensitive context, so disabling profile inclusion starts a fresh conversation. Clearing the visible UI does not retroactively delete Ollama-side logs/caches, browser process memory, or an already-submitted request.
- Current Ollama browser CORS/local-network policies still apply. Do NOT expose Ollama on 0.0.0.0, use wildcard CORS or forward ports on a router to make this work.
- Responses and charts can be inaccurate; the pilot is reflective, not clinical, legal or financial advice. A birthday/time/location typed into a prompt is not a deterministic horoscope calculation. Use the Astrology tab for the browser's computed chart.
- An in-flight Ollama response is non-streaming and is not cancellable from this pilot UI. Tab navigation drops session state but does not guarantee cancellation of a request already submitted to the local process.
- A measurement-only `GYPSYAI_PILOT_LOCAL_OBSERVATION_V1` is displayed for the last successful run (model, loopback provider, duration, turn count, profile attached yes/no, and no-persistence flags); no automatic export of any details.

## Separate research lanes remain separate

PocketBrain Tiny's experimental ONNX browser inference and its benchmark studio remain in `#brains`. BrainC remains read-only liveness, without tool or memory rights. PhiStream remains research-only. Pilot Sanctuary neither adds a network provider nor claims multiple autonomous agents.

## Validation

`pnpm lint`, `pnpm test`, `pnpm build`, `pnpm pages:build` must pass. Unit tests use injected model/TIEKAT functions to verify localhost-only requests, profile gating, no personal data in measurement receipts, valid history and fail-closed errors. The real local-model conversation still requires the operator's browser smoke test after deployment.

**Ledger Above Ego.**
