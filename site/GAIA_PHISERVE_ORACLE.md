# GAIA Sovereign Oracle ↔ PhiServe (opt-in, local browser only)

**Scope:** GAIA's *actual* GitHub Pages Sovereign Oracle may now call PhiServe instead of Ollama for text. Tarot spreads, astronomy, Gene Keys, ancestral redaction, Reading Room source packets, TIEKAT reflection routing/verification, and PocketBrain Tiny remain GAIA's own deterministic or separately opted-in systems.

## Connection

This is **same-device only**. First register a legally held GGUF model locally with PhiServe and install a compatible `llama-server`. Create a private bearer token and run PhiServe with browser authorization enabled:

~~~powershell
phiserve models list
phiserve auth create --output "$HOME/.phiserve/gaia-bridge-token.txt"
phiserve daemon --llama-server "C:\\path\\to\\llama-server.exe" --browser-origin "https://michaelwave369.github.io" --api-key-file "$HOME/.phiserve/gaia-bridge-token.txt"
~~~

Open [GAIA GitHub Pages](https://michaelwave369.github.io/GypsyAI/) **on the computer running PhiServe**, choose *GAIA Oracle*, select **Φ PhiServe (opt-in GGUF)**, enter `http://127.0.0.1:11435`, paste the private bearer token into the masked input, and click **Detect local models**. After choosing a registered GGUF alias, write a message or intentionally prepare a symbolic reading packet, review the exact packet, and press **Send**.

By default, GAIA continues to use Ollama without PhiServe tokens. Switching to PhiServe does not enable a cloud fallback, upload checkpoint weights, start a local server, activate PhiStream safetensors, or grant access to BrainC memories, other users' agents or tools.

**Browser transport can fail:** HTTPS GitHub Pages to local HTTP can require browser Local Network Access/Private Network Access permission, and PhiServe must be started with the exact Pages **origin**, not an arbitrary site path. The `michaelwave369.github.io` origin is shared across projects. Review all site scripts before trusting that origin with a bearer token. Never commit or share the token. No wildcard CORS or `0.0.0.0` binding is needed.

A phone/Quest `127.0.0.1` means that device itself, not the PhiServe desktop. There is no remote gateway in this rung.

## Privacy and permission contract

- PhiServe endpoint and token are held in React state only. They are not placed in localStorage, sessionStorage, IndexedDB, URLs, exported readings, logs, or committed source.
- Existing Ollama configuration persists as before. Provider selection defaults to Ollama on each new page load.
- Changing provider, model or endpoint clears earlier Oracle conversation and any staged reading packet. Disconnect clears the browser token.
- PhiServe chat is ephemeral regardless of the existing Ollama-specific chat-storage preference. The app still optionally retains separate TIEKAT note memory under its original explicit controls. **This does not add model training or inference logs to PhiServe.**
- Existing TIEKAT note-memory consent does **not** automatically follow you to PhiServe. A separate default-off checkbox explicitly approves sharing enabled curated notes with this new local recipient. Switching provider/endpoint/token or disconnecting revokes that extra approval. Without it, the PhiServe planning envelope receives zero saved notes and reports note memory disabled.
- A reading packet is still created by GAIA's deterministic reader, filtered through the unchanged consent/packet review controls, displayed before send, and transmitted to the selected local provider **only** when you press Send. The same canonical GAIA system prompt and approved context framing are reused for both transports.
- Only text `/api/tags` and `/api/chat` are requested; no new server endpoints, arbitrary URL sources, tool execution, background sync or browser file access.
- Bearer 401, origin 403, busy 409, model-loading 503, malformed output and missing final completion fail closed without alternate inference.
- Client guards bound message length, context length, output size and model alias. The web interface does **not** attest physical GPU execution or authenticated tokenizer/reference independence.

## Acceptance

CI uses isolated fake fetch responses in Vitest to verify loopback restrictions, token headers, role/packet boundaries, strict `done:true` response, no automatic fallback and the existing GAIA prompt. It also runs the full Pages build.

**Not yet hardware-tested:** a physical Chrome/Edge browser connecting from GAIA Pages to PhiServe running on an operator's Windows PC, real GGUF execution, CORS/LNA policy and refusal of incorrect token/Origin. This must be performed separately before describing GAIA as physically connected.

**No change** to the legacy Next.js provider routes or native Vercel deployment. This is only the live GitHub Pages React Oracle.
