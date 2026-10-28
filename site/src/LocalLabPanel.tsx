import { useState } from 'react';
import {
  diagnoseLocalOllama, runSingleSample, probePhiStreamResearchOnly,
  LAB_PHI_GATE_NAMES, formatBytes
} from './localLab';
import type { OllamaDiagnosis, LocalBenchmarkReceipt, PhiStreamProbe } from './localLab';

interface Props { origin: string; modelPreference: string }
function Status({ ok, label }: { ok: boolean; label: string }) {
  return <span className={'lab-pill ' + (ok ? 'pass' : 'fail')}>{ok ? '✓' : '×'} {label}</span>;
}

export function LocalLabPanel({ origin, modelPreference }: Props) {
  const [diagnosis, setDiagnosis] = useState<OllamaDiagnosis | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sampleBusy, setSampleBusy] = useState(false);
  const [model, setModel] = useState('');
  const [approved, setApproved] = useState(false);
  const [sample, setSample] = useState<LocalBenchmarkReceipt | null>(null);
  const [sampleError, setSampleError] = useState('');
  const [phiBusy, setPhiBusy] = useState(false);
  const [phiResult, setPhiResult] = useState<PhiStreamProbe | null>(null);
  const [phiError, setPhiError] = useState('');

  async function diagnose() {
    setBusy(true); setError(''); setDiagnosis(null); setSample(null);
    setApproved(false);
    try {
      const result = await diagnoseLocalOllama(origin);
      setDiagnosis(result);
      const names = result.installed.map((item) => item.name);
      setModel(names.includes(modelPreference) ? modelPreference : names[0] || '');
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }

  async function runSample() {
    if (!diagnosis?.ready || !approved || !model ||
      !diagnosis.installed.some((item) => item.name === model)) return;
    setSampleBusy(true); setSample(null); setSampleError('');
    try { setSample(await runSingleSample(origin, model)); }
    catch (e) { setSampleError(e instanceof Error ? e.message : String(e)); }
    finally { setSampleBusy(false); setApproved(false); }
  }
  async function probePhi() {
    setPhiBusy(true); setPhiError(''); setPhiResult(null);
    try { setPhiResult(await probePhiStreamResearchOnly()); }
    catch (e) { setPhiError(e instanceof Error ? e.message : String(e)); }
    finally { setPhiBusy(false); }
  }
  function exportReceipt() {
    if (!sample) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'gypsyai-local-ollama-sample.json';
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  return <section className="lab-view">
    <div className="section-header">
      <span className="eyebrow">GYPSYAI / LOCAL INTELLIGENCE LAB v0.2.2</span>
      <h2>Measure the local field.</h2>
      <p>Inspect your own Ollama process and model residency, then optionally run one tiny inference sample.
      This page makes no requests until you press a diagnostic or research button.</p>
    </div>
    <div className="two-columns">
      <section className="panel">
        <div className="lab-heading"><h3>01 / Connection diagnostics</h3><span className="lab-pill neutral">READ ONLY</span></div>
        <p className="muted">Selected loopback endpoint: <code>{origin}</code>. The lab will refuse non-local addresses.</p>
        <button className="primary" disabled={busy || sampleBusy} onClick={() => void diagnose()}>{busy ? 'Diagnosing…' : 'Diagnose local Ollama'}</button>
        {error && <p className="error" role="alert">{error}</p>}
        {diagnosis && <>
          <p className="muted">Observed {new Date(diagnosis.checkedAt).toLocaleString()} · version: {diagnosis.version || 'unavailable'}</p>
          <div className="lab-steps">
            {diagnosis.steps.map((step) => <div className="lab-step" key={step.endpoint}>
              <div><strong>{step.endpoint}</strong><Status ok={step.status === 'ok'} label={step.status} /></div>
              <p>{step.message} · browser elapsed {step.elapsedMs} ms</p>
            </div>)}
          </div>
          {diagnosis.ready ? <p className="lab-success">All three diagnostics responded. This does not prove model generation, GPU acceleration, or future availability.</p>
            : <p className="error">At least one endpoint failed. Check Ollama's process, site-origin CORS allowlist, browser local-network permission and HTTPS-to-loopback policy. Keep Ollama bound to localhost.</p>}
          <div className="metric-row lab-metrics">
            <div className="metric"><strong>{diagnosis.installed.length}</strong><span>Discovered models</span></div>
            <div className="metric"><strong>{diagnosis.loaded.length}</strong><span>Loaded in memory</span></div>
          </div>
        </>}
      </section>
      <section className="panel">
        <div className="lab-heading"><h3>02 / Model residency</h3><span className="lab-pill neutral">OLLAMA REPORT</span></div>
        {!diagnosis ? <p className="muted">Run diagnostics first to read model metadata. No performance or memory value is estimated before a local response.</p> :
        <>
          <p className="muted">/api/ps reports size_vram for loaded models. It is Ollama-reported model residency, NOT total GPU VRAM, free GPU memory, or a confirmed CUDA benchmark.</p>
          {diagnosis.loaded.length === 0 ? <p className="muted">Ollama currently reports no loaded models. A model can still be installed and available for inference.</p> :
            <div className="lab-models">{diagnosis.loaded.map((item) =>
              <div className="lab-model" key={item.name}>
                <strong>{item.name}</strong><p>Model size: {formatBytes(item.bytes)} · VRAM residency: {formatBytes(item.vramBytes)}</p>
                <p>Context: {item.contextLength ?? 'not reported'} · Expires: {item.expiresAt || 'not reported'}</p>
              </div>)}</div>}
          <h4>Installed model inventory</h4>
          <div className="lab-models">{diagnosis.installed.map((item) =>
            <div className="lab-model" key={item.name}><strong>{item.name}</strong>
              <p>{item.parameters || 'parameters n/a'} · {item.quantization || 'quantization n/a'} · {formatBytes(item.bytes)} on disk (reported)</p>
            </div>)}</div>
        </>}
      </section>
    </div>
    <section className="panel">
      <div className="lab-heading"><h3>03 / On-demand inference sample</h3><span className="lab-pill neutral">OPERATOR APPROVAL</span></div>
      <p className="muted">A single fixed public prompt requests up to 32 generated tokens from the chosen Ollama model. It may load model weights, allocate RAM/VRAM and take substantial time. This is NOT a repeatable A/B benchmark or a PhiStream speed comparison. No personal chat or ancestry data is sent.</p>
      <div className="control-panel">
        <div className="field grow"><label htmlFor="lab-model">Local installed model</label>
          <select id="lab-model" value={model} disabled={!diagnosis?.ready || sampleBusy} onChange={(e) => { setModel(e.target.value);setSample(null);setApproved(false); }}>
            {!model && <option value="">Diagnose and choose a model</option>}
            {diagnosis?.installed.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
          </select></div>
        <button className="primary" disabled={!approved || !diagnosis?.ready || !model || sampleBusy || busy} onClick={() => void runSample()}>
          {sampleBusy ? 'Executing one local sample…' : 'Run one local sample'}
        </button>
      </div>
      <label className="switch"><input type="checkbox" checked={approved} disabled={!diagnosis?.ready || !model || sampleBusy} onChange={(e) => setApproved(e.target.checked)} />
        I approve a local model inference request that may use system memory and GPU resources.</label>
      {sampleError && <p className="error" role="alert">{sampleError}</p>}
      {sample && <>
        <div className="metric-row">
          <div className="metric"><strong>{sample.reportedTokensPerSecond?.toFixed(2) ?? 'n/a'}</strong><span>Reported generation tokens/sec</span></div>
          <div className="metric"><strong>{sample.generatedTokens ?? 'n/a'}</strong><span>Generated tokens</span></div>
          <div className="metric"><strong>{sample.clientElapsedMs} ms</strong><span>Browser wall duration</span></div>
        </div>
        <div className="lab-sample-details">
          <p><strong>Model</strong> {sample.model}</p><p><strong>Model load</strong> {sample.modelLoadMs ?? 'not reported'} ms</p>
          <p><strong>Prompt evaluation</strong> {sample.promptTokens ?? 'n/a'} tokens · {sample.promptEvalMs ?? 'n/a'} ms</p>
          <p><strong>Generation</strong> {sample.generationMs ?? 'n/a'} ms</p>
          <p><strong>Ollama server total</strong> {sample.serverTotalMs ?? 'n/a'} ms</p>
        </div>
        <p className="muted">One observation only. Includes neither an independently verified reference trace nor a meaningful confidence interval. Server duration and browser wall time are different measurements.</p>
        <button className="secondary" onClick={exportReceipt}>Export local receipt (no prompt or reply)</button>
      </>}
    </section>
    <section className="panel">
      <div className="lab-heading"><h3>04 / ΦStream research bridge</h3><span className="lab-pill fail">NOT CHAT READY</span></div>
      <p>This is a strict read-only handshake for a future local PhiStream companion. The existing PhiStream repository does not yet provide a compatible interactive chat server. The lab does not start, download, expose, or execute PhiStream weights.</p>
      <p className="muted">Optional probe checks only <code>http://127.0.0.1:8765/health</code> for an explicitly defined read-only schema. A local service's claims do not establish scientific verification or automatically enable inference.</p>
      <button className="secondary" onClick={() => void probePhi()} disabled={phiBusy}>{phiBusy ? 'Probing local read-only bridge…' : 'Probe read-only local bridge'}</button>
      {phiError && <p className="muted" role="status">No compatible local research bridge response: {phiError}. This is expected until one is separately installed and reviewed.</p>}
      {phiResult && <><p className="lab-success">Handshake: {phiResult.status}. Execution enabled: no. Chat enabled: no. Evidence is self-reported and unauthenticated.</p>
        {phiResult.reasons.map((reason) => <p className="muted" key={reason}>{reason}</p>)}</>}
      <div className="thin-rule"/>
      <h4>Required independent promotion gates</h4>
      <div className="lab-gates">{LAB_PHI_GATE_NAMES.map((gate, i) =>
        <div className="lab-gate" key={gate}><span>GATE {i + 1}</span><p>{gate}</p><Status ok={false} label="not established" /></div>)}</div>
      <p className="muted">These are architecture acceptance gates, not progress indicators. A successful health probe cannot unlock them. Real PhiStream inference requires a separate reviewed implementation and explicit approval.</p>
    </section>
  </section>;
}
