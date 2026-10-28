import { useEffect, useRef, useState } from 'react';
import {
  POCKETBRAIN_SOURCE, BRAINC_HEALTH_URL, importPocketBrainSdk,
  normalizeTinyReceipt, probeBrainCHealth, validateTinyPrompt
} from './sovereignBridge';
import type {
  BrainCHealth, PocketBrainEvidence, TinyClient, TinyDevice, TinyMode, TinyStatus
} from './sovereignBridge';

const EMPTY: TinyStatus = {
  phase: 'idle', version: POCKETBRAIN_SOURCE.sdkVersion,
  ready: false, model: null, device: null, dtype: null, completedRuns: 0, error: null
};
const SAMPLE_PROMPT = 'Explain in two simple sentences why repeatable scientific observations matter.';
function exportEvidence(evidence: PocketBrainEvidence) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'gypsyai-pocketbrain-tiny-receipt-v1.json';
  a.click(); setTimeout(() => URL.revokeObjectURL(url), 500);
}
function metric(x: unknown) {
  return typeof x === 'number' && Number.isFinite(x) ? x.toFixed(2) : 'n/a';
}

export function SovereignBrainPanel() {
  const [status, setStatus] = useState<TinyStatus>(EMPTY);
  const [device, setDevice] = useState<TinyDevice>('auto');
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [disposing, setDisposing] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [mode, setMode] = useState<TinyMode>('baseline');
  const [cap, setCap] = useState<32 | 64>(32);
  const [preview, setPreview] = useState('');
  const [evidence, setEvidence] = useState<PocketBrainEvidence | null>(null);
  const [brainBusy, setBrainBusy] = useState(false);
  const [brainStatus, setBrainStatus] = useState<BrainCHealth | null>(null);
  const [brainError, setBrainError] = useState('');
  const client = useRef<TinyClient | null>(null);
  const generation = useRef(false);
  const unmounted = useRef(false);
  const loadingPromise = useRef<Promise<TinyClient> | null>(null);

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
      // Prevent orphaned model residency on navigation, including a pending load/generation.
      const pending = loadingPromise.current;
      if (pending) {
        void pending.then(async (c) => {
          if (!generation.current) await c.dispose().catch(() => undefined);
        }).catch(() => undefined);
      } else if (client.current && !generation.current) {
        void client.current.dispose().catch(() => undefined);
      }
    };
  }, []);

  async function loadTiny() {
    if (loading || generating || disposing || client.current || !acknowledged) return;
    setLoading(true); setError(''); setProgress('Importing source-pinned SDK snapshot…');
    let loadedClient: TinyClient | null = null;
    try {
      const task = (async () => {
        const sdk = await importPocketBrainSdk();
        const c = sdk.createPocketBrainTinyClient({
          onStateChange: (next) => { if (!unmounted.current) setStatus(next); }
        });
        loadedClient = c;
        if (unmounted.current) throw new Error('Panel closed before model loading.');
        await c.load({
          preferredDevice: device,
          onProgress: (p) => {
            if (unmounted.current) return;
            const x = p && typeof p === 'object' ? p as Record<string, unknown> : {};
            setProgress(typeof x.status === 'string' ? x.status.slice(0, 100) : 'Downloading/initializing browser model…');
          }
        });
        return c;
      })();
      loadingPromise.current = task;
      const readyClient = await task;
      if (unmounted.current) {
        await readyClient.dispose();
        return;
      }
      client.current = readyClient;
      setStatus(readyClient.getStatus());
      setProgress('Browser model initialized. Generating remains a separate user action.');
    } catch (e) {
      const failedClient = loadedClient as TinyClient | null;
      if (failedClient) await failedClient.dispose().catch(() => undefined);
      if (!unmounted.current) setError(e instanceof Error ? e.message : String(e));
    } finally {
      loadingPromise.current = null;
      if (!unmounted.current) setLoading(false);
    }
  }
  async function generateTiny() {
    if (generating || loading || disposing || !client.current || !status.ready) return;
    try { validateTinyPrompt(prompt, cap); } catch (e) {
      setError(e instanceof Error ? e.message : String(e)); return;
    }
    generation.current = true;
    setGenerating(true); setError(''); setPreview(''); setEvidence(null);
    const instance = client.current;
    try {
      const result = await instance.generate(prompt.trim(), {
        mode, maxNewTokens: cap,
        onText: (text) => { if (!unmounted.current) setPreview(text.slice(0, 5000)); }
      });
      const receipt = normalizeTinyReceipt(result.receipt, instance.getStatus(), mode, cap);
      if (!unmounted.current) {
        setPreview(result.text.slice(0, 5000));
        setEvidence(receipt);
        setStatus(instance.getStatus());
      }
    } catch (e) {
      if (!unmounted.current) setError(e instanceof Error ? e.message : String(e));
    } finally {
      generation.current = false;
      if (unmounted.current) await instance.dispose().catch(() => undefined);
      else setGenerating(false);
    }
  }
  async function unloadTiny() {
    if (!client.current || loading || generating || disposing) return;
    setDisposing(true); setError('');
    try {
      await client.current.dispose();
      client.current = null;
      setStatus(EMPTY); setPreview(''); setEvidence(null); setAcknowledged(false);
      setProgress('Model released. Re-loading requires renewed approval.');
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { if (!unmounted.current) setDisposing(false); }
  }
  async function probeBrain() {
    if (brainBusy) return;
    setBrainBusy(true); setBrainError(''); setBrainStatus(null);
    try { setBrainStatus(await probeBrainCHealth()); }
    catch (e) { setBrainError(e instanceof Error ? e.message : String(e)); }
    finally { setBrainBusy(false); }
  }

  return <section className="brain-bridge">
    <div className="section-header">
      <span className="eyebrow">SOVEREIGN BRAIN BRIDGE · v0.2.5</span>
      <h2>One sanctuary. Distinct intelligences.</h2>
      <p>Research-stage connections to existing Phi Commons brains, with separate permissions and truthful execution receipts.
        Neither PocketBrain nor BrainC silently replaces GypsyAI's local Ollama Oracle.</p>
    </div>
    <div className="brain-tiles">
      <div className="panel"><h3>PocketBrain Tiny</h3><span className="lab-pill neutral">OPTIONAL BROWSER INFERENCE</span>
        <p>SmolLM2-135M ONNX · experimental SDK v0.1. Real model execution only after model download, and then your separate Generate click.</p></div>
      <div className="panel"><h3>Ollama / Granite</h3><span className="lab-pill pass">EXISTING LOCAL ORACLE</span>
        <p>Your previously validated browser-to-localhost Ollama route stays unchanged, including TIEKAT consent and model measurement ledgers.</p></div>
      <div className="panel"><h3>BrainC</h3><span className="lab-pill neutral">READ-ONLY DISCOVERY</span>
        <p>BrainC is a separate FastAPI memory-and-tools server. This release can check only its public liveness endpoint, with no login or memory access.</p></div>
      <div className="panel"><h3>ΦStream</h3><span className="lab-pill fail">NOT CHAT READY</span>
        <p>Its real-weight parity and performance research remains separately governed. No inference route is enabled here.</p></div>
    </div>
    <section className="panel">
      <div className="lab-heading"><h3>01 / PocketBrain Tiny · Experimental browser brain</h3>
        <span className={'lab-pill ' + (status.ready ? 'pass' : 'neutral')}>{status.phase.toUpperCase()}</span></div>
      <p className="muted"><strong>Important download boundary:</strong> The SDK, runner and receipt helpers are copied from exact PocketBrain source blobs into GypsyAI, with MIT attribution.
        The adapter still imports Transformers.js 3.8.1 from <code>cdn.jsdelivr.net</code> and retrieves model/tokenizer artifacts from Hugging Face <em>only when you click Load</em>.
        Those upstream model artifacts are <strong>not revision/hash pinned</strong>; this is a research path, not a supply-chain-verified production provider. Network metadata is visible to those hosts.</p>
      <p className="muted">Browser inference uses WebGPU if available (q4f16) or WASM (q8) as selected. This may consume device RAM/VRAM. Model cache behavior and output parity are not independently established.</p>
      <div className="repeat-config">
        <div className="field"><label htmlFor="tiny-device">Requested backend</label><select id="tiny-device" value={device} disabled={loading || status.ready || generating || disposing}
          onChange={(e) => { setDevice(e.target.value as TinyDevice); setAcknowledged(false); }}>
          <option value="auto">Auto (WebGPU or WASM)</option><option value="webgpu">WebGPU only</option><option value="wasm">WASM only</option></select></div>
        <div className="field"><label>Source and model</label>
          <p className="brain-source">{POCKETBRAIN_SOURCE.modelId}</p>
          <small>SDK {POCKETBRAIN_SOURCE.sdkVersion} · checkpoint revision UNPINNED</small></div>
      </div>
      <label className="switch"><input type="checkbox" checked={acknowledged}
        disabled={loading || status.ready || generating || disposing}
        onChange={(e) => setAcknowledged(e.target.checked)}/>
        I approve the external runtime/model downloads and local RAM/GPU usage for this experimental brain.</label>
      <div className="actions">
        <button className="primary" disabled={!acknowledged || loading || status.ready || generating || disposing}
          onClick={() => void loadTiny()}>{loading ? 'Loading model…' : 'Load PocketBrain Tiny explicitly'}</button>
        <button className="secondary" disabled={!status.ready || loading || generating || disposing}
          onClick={() => void unloadTiny()}>{disposing ? 'Disposing…' : 'Dispose browser model'}</button>
      </div>
      {progress && <p className="muted" role="status">{progress}</p>}
      <div className="brain-details">
        <span>State: {status.phase}</span><span>Backend: {status.device || 'not loaded'}</span>
        <span>Datatype: {status.dtype || 'not loaded'}</span><span>Completed runs: {status.completedRuns}</span>
      </div>
      <div className="thin-rule"/>
      <h4>02 / Manual generation experiment</h4>
      <p className="muted">Enter a non-sensitive test prompt. This field is never populated from GypsyAI chat, GEDCOM, approved reading packets or TIEKAT memory. The model does not receive those contexts. No automatic fallback to Ollama occurs.</p>
      <label htmlFor="tiny-prompt">Experimental prompt (max 1000 characters)</label>
      <textarea id="tiny-prompt" value={prompt} maxLength={1000} rows={3}
        disabled={generating} onChange={(e) => setPrompt(e.target.value)}/>
      <div className="repeat-config">
        <div className="field"><label htmlFor="tiny-mode">Generation mode</label>
          <select id="tiny-mode" value={mode} disabled={generating}
            onChange={(e) => setMode(e.target.value as TinyMode)}>
            <option value="baseline">Baseline greedy</option>
            <option value="guarded">Repetition-guarded greedy</option>
          </select></div>
        <div className="field"><label htmlFor="tiny-cap">Output token ceiling</label>
          <select id="tiny-cap" value={cap} disabled={generating}
            onChange={(e) => setCap(Number(e.target.value) as 32 | 64)}>
            <option value={32}>32 maximum</option><option value={64}>64 maximum</option>
          </select></div>
      </div>
      <button className="primary" disabled={!status.ready || generating || loading || disposing || !prompt.trim()}
        onClick={() => void generateTiny()}>{generating ? 'Generating inside browser…' : 'Generate once with PocketBrain Tiny'}</button>
      {error && <p className="error" role="alert">{error}</p>}
      {preview && <div className="brain-output"><strong>Actual model output</strong><p>{preview}</p></div>}
      {evidence && <>
        <div className="metric-row">
          <div className="metric"><strong>{metric(evidence.engineReceipt.generationWallMs)} ms</strong><span>Generation wall incl. prompt processing</span></div>
          <div className="metric"><strong>{metric(evidence.engineReceipt.timeToFirstVisibleTextMs)} ms</strong><span>First visible text callback</span></div>
          <div className="metric"><strong>{String(evidence.engineReceipt.observedTokenCallbackEvents ?? 'n/a')}</strong><span>Observed JS token callbacks</span></div>
        </div>
        <p className="muted">JS callback events are <strong>not equivalent to verified decoded tokens/sec</strong>.
          Cache status and reference parity remain untested. The receipt omits your prompt and generated answer.</p>
        <button className="secondary" onClick={() => exportEvidence(evidence)}>Export PocketBrain evidence JSON</button>
      </>}
    </section>
    <section className="panel">
      <div className="lab-heading"><h3>03 / BrainC · Read-only local health</h3><span className="lab-pill neutral">NO AUTH · NO TOOLS</span></div>
      <p className="muted">Optional GET-only probe to <code>{BRAINC_HEALTH_URL}</code>. This does not start BrainC, request an access token,
        inspect user data, touch SQLite or authorize tool execution. BrainC currently allows localhost browser origins, so the GitHub Pages origin may be blocked by CORS. Do not widen BrainC's CORS to wildcard or expose its service publicly.</p>
      <button className="secondary" disabled={brainBusy} onClick={() => void probeBrain()}>
        {brainBusy ? 'Checking local BrainC…' : 'Probe BrainC liveness only'}</button>
      {brainError && <p className="muted" role="status">No compatible BrainC liveness response: {brainError}. This is expected if BrainC is stopped or browser access is blocked.</p>}
      {brainStatus && <p className="lab-success" role="status">
        BrainC health: {brainStatus.status} · reported version {brainStatus.reportedVersion || 'not verified'}.
        This response is unauthenticated and gives GypsyAI no memory or tool permissions.</p>}
      <p className="muted">A future BrainC retrieval bridge will require explicit user consent, authenticated read-only authorization, controlled data minimization, a security review and compatibility tests before enabling any memory reads.</p>
    </section>
  </section>;
}
