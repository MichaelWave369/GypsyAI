# GypsyAI v0.2.5 | Sovereign Brain Bridge

## Implemented

GypsyAI GitHub Pages now has a separate **Brain Bridge** tab. This is an experimental comparison laboratory, not a production multi-provider Oracle router. The existing TIEKAT-to-Ollama path is unchanged.

### PocketBrain Tiny

- PocketBrain's experimental MIT JavaScript SDK v0.1, runner and metrics helpers are copied **without modification** from exact source blob revisions. The source blobs and original MIT license are recorded under site/public/vendor/pocketbrain/PROVENANCE.md.
- Source module import happens only after an explicit Load button. Model initialization additionally requires a consent checkbox. Remote executable Transformers.js 3.8.1 code comes from jsDelivr and an ONNX SmolLM2-135M-Instruct derivative plus tokenizer come from Hugging Face on user action.
- IMPORTANT: CDN runtime package version is named, but the underlying remote ONNX checkpoint and tokenizer revision/hashes are **not pinned**. The code snapshot is not the entire chain of trust. Do not promote this to a secure production provider without pinning exact model artifacts, supply-chain review, cross-origin validation, and model-parity evidence.
- The browser runtime chooses WebGPU q4f16 (if available) or explicit WASM q8. Both run local browser inference; they may use considerable RAM, power or GPU resources. Model assets could be cached. No promise of offline-first cold loading is made.
- User enters a separate non-sensitive test prompt (up to 1000 characters); a separate click generates at most 32 or 64 tokens in baseline or guarded mode. The UI displays the real returned model text and optional streaming previews. No TIEKAT, GEDCOM, existing user chat, memory notes, or reading packets are ever copied into this experiment.
- The receipt is built only from the PocketBrain real runner's BROWSER_SELF_REPORTED_UNVERIFIED fields. JavaScript callback events per second are NOT independently verified tokens per second or CUDA throughput. The JSON export does not contain prompt or response text; it labels cache and external reference parity unverified.
- Explicit Dispose tears down the browser model. Navigating away while the model is idle also attempts disposal; generation cannot be interrupted mid-call. No hidden fallback to a different provider.

### BrainC

- A separate fixed GET to http://127.0.0.1:8000/health is available only when the user clicks Probe.
- No bearer token, authentication, notes, chat history, SQL data, tool action, model switch, file read or code execution is requested. This is unauthenticated self-reported liveness and yields NO permissions.
- BrainC's existing production CORS list does not authorize the GitHub Pages origin; a blocked connection is expected even if BrainC is running. No change to BrainC CORS or network binding is made. NEVER use wildcard CORS, public port forwarding or plaintext credentials to circumvent the restriction.
- A future BrainC memory bridge requires a separately reviewed authenticated local companion and opt-in data minimization with clear approve/revoke semantics.

### PhiStream

PhiStream stays research-only. No model execution, benchmark comparison, credential exchange or automatic provider promotion is included.

## Manual smoke test after merge

1. Open https://michaelwave369.github.io/GypsyAI/#brains in a browser with WebGPU or WASM support.
2. Open the tab and confirm there are NO jsDelivr, model, or BrainC requests until explicitly clicking the corresponding button.
3. Select Auto or WASM; acknowledge external runtime/model downloads and click Load PocketBrain Tiny. Confirm model initialization or a clear browser compatibility/error report. The first-time model download requires internet.
4. Click Generate with the default nonpersonal sample prompt. Confirm generated text, measured JS callback count, wall time, and an exportable metadata-only receipt. Inspect Network for the explicit model/runtime downloads.
5. Click Dispose. Confirm reload requires new approval, and the old run is no longer active.
6. Probe BrainC liveness only if a local BrainC instance is available; an origin/CORS error is expected with the current BrainC settings. Confirm no other paths are requested.
7. Verify the existing Local Oracle works against Ollama and all TIEKAT ancestry/memory consent controls remain unchanged.

## Verification gates

CI runs pnpm lint, pnpm test, pnpm build, and pnpm pages:build. Unit tests mock SDK import, generation receipts and the BrainC health endpoint, but do not actually download or test the 135M model. Cross-origin WebGPU inference requires the user's explicit on-device browser test. Production promotion requires dependency/weight revision pinning, source verification and independent model output reference parity.

**Ledger above ego.**
