# GypsyAI v0.2.3 | Cold/Warm Performance Studio

**New in this PR:** browser-only, explicitly approved bounded local Ollama repeat experiments, separate priming and measured runs, a small balanced two-model AB/BA experiment, per-model descriptive statistics, a V2 exportable JSON ledger, and an opt-in importer for older V1 single-sample receipts.

## Research contract: no fake cold start

- The lab NEVER forces a model to unload, stops Ollama, modifies keep_alive, or flushes the OS/GPU caches. It is not a controlled cold-start test.
- **Priming request** means the first request in a local experiment, regardless of whether the model was already loaded. It is included in the raw ledger, excluded from measured summary statistics.
- **Post-warmup measurements** describe requests issued sequentially after an initial priming call. Residency may change; model load_duration is recorded for every request.
- The single-model protocol is one priming request plus 3 or 5 measured requests.
- The two-model protocol is one priming request per model plus 2 or 4 AB/BA paired rounds: 6 or 10 total requests. The four-round sequence is AB, BA, BA, AB. Model eviction can still severely bias these comparisons. No speedup is certified.

Each request reuses the v0.2.2 **exact same public prompt** and /api/generate transport, with temperature 0, stream false, num_predict 32, and a per-request client timeout of 60 seconds. The entire experiment is approved once with an explicit count of maximum calls; the user can stop AFTER the active request. Browser stop does not forcibly cancel the model already running in Ollama. No automatic background work, retries, cloud fallback, auto-run on page load, or model downloads.

## What the dashboard and ledger measure

- Raw model load, prompt processing, generation, total server and browser elapsed time are kept distinct. Generated token counts and server-reported output token/s are retained without assuming identical lengths.
- Median, minimum, maximum, range, and Tukey-halves IQR are displayed per model for measured (not priming) requests only. At N=2, N=3, or N=5, variability is strictly descriptive and not a confidence interval or statistical significance test.
- The JSON ledger has schema GYPSYAI_LOCAL_OLLAMA_REPEAT_V2, a bounded model plan, Ollama-reported model digests/version if available, exact request order, raw V1 receipts, completion state, timestamps, and explicit caveats.
- A stopped or failed run is serialized as stopped/failed, preserving evidence but not pretending the cohort completed.
- Receipts are **self-reported Ollama metadata**, not independently authenticated hardware measurements. Missing values remain null rather than fabricated.

## Historic receipts

The studio accepts only schema GYPSYAI_LOCAL_OLLAMA_SAMPLE_V1 with the fixed prompt label and loopback origin. Numeric fields are validated, extra fields dropped, and each upload is capped at 16 KiB (at most 12 files in one selection). Import is **local-only in this browser tab**; imported samples are not silently merged with measured experiment cohorts, and historical pairs do not prove GPU residency or a true cold/warm controlled comparison.

Users can import their already-exported Granite 4.2 8B first and second JSON files here. Those two observations remain independent, operator-supplied records, not GitHub-published telemetry or certified performance. No prior personal hardware measurement is embedded into this public repository.

## Privacy, safety and model guardrails

- Local requests reuse the pre-existing strict loopback URL validator. No model server or ΦStream bridge is made public.
- The operator must first run the Ollama diagnosis to establish a currently discovered installed-model allowlist. Run controls are disabled if the configured local origin changes after diagnosis.
- No chat, family data, genealogy names, TIEKAT memories, or private prompts are included; responses are discarded, and downloaded JSON contains only public prompt labels and timing/count metadata.
- Sample results are in transient React memory only until the user explicitly chooses Export. No silent localStorage or upload.
- The independent ΦStream read-only panel is unchanged. NO ΦStream inference, comparison or chat-provider promotion occurs in this PR.

## Manual device validation

1. Open https://michaelwave369.github.io/GypsyAI/#lab after merging, from the same machine as Ollama.
2. Diagnose Ollama, choose granite4.2:8b, select 3 repeat measurements, explicitly approve 4 total requests, and run. Verify the initial priming call and three post-warmup measurements appear separately.
3. Optionally import your two previous GypsyAI sample JSON receipts and inspect their side-by-side history. They must not alter the new experiment summary.
4. Optionally choose another installed model for a balanced 2-pair exploratory comparison; read the confounding warning before interpreting any difference.
5. Export the V2 ledger and inspect the raw per-request durations, outputs, model digest, protocol, status and no automatic network upload.
6. Verify Stop after current, no auto-run on refresh, no PhiStream execution, and normal TIEKAT privacy settings.

Automated gates: pnpm lint; pnpm test; pnpm build; pnpm pages:build. These gate logic, routing and static bundling, not the device-specific browser/CORS/GPU behavior.
