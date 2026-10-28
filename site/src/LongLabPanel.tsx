import { useRef, useState } from 'react';
import { localOllamaUrl } from './logic';
import type { OllamaDiagnosis } from './localLab';
import { formatBytes } from './localLab';
import {
  planLongCohort, runLongCohort, summarizeLongLedger,
  parseLongLedger, compareLongSessions
} from './longLab';
import type { LongLedger, LongConfig, LongSample, LongSummary } from './longLab';

interface Props {
  origin: string;
  diagnosis: OllamaDiagnosis | null;
  disabled: boolean;
  onRunningChange: (running: boolean) => void;
}
function decimal(v: number | null | undefined) {
  return typeof v === 'number' && Number.isFinite(v) ? v.toFixed(2) : 'n/a';
}
function saveLedger(ledger: LongLedger) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(ledger, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'gypsyai-local-long-workload-v3.json';
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 900);
}
function Summary({ summary }: { summary: LongSummary }) {
  return <div className="long-summary">
    <h4>{summary.cap}-token ceiling · {summary.count} measured</h4>
    <div className="data-list">
      <div className="data-row"><strong>Actual output</strong><span>{summary.tokenCounts.join(', ') || 'n/a'} tokens</span></div>
      <div className="data-row"><strong>Hit token cap</strong><span>{summary.hitCapCount}/{summary.count}</span></div>
      <div className="data-row"><strong>Browser elapsed</strong><span>{decimal(summary.browser?.median)} ms median</span></div>
      <div className="data-row"><strong>Model loading</strong><span>{decimal(summary.loading?.median)} ms median</span></div>
      <div className="data-row"><strong>Prompt evaluation</strong><span>{decimal(summary.prompt?.median)} ms median</span></div>
      <div className="data-row"><strong>Generation</strong><span>{decimal(summary.generation?.median)} ms median</span></div>
      <div className="data-row"><strong>Throughput</strong><span>{decimal(summary.tokensPerSecond?.median)} tok/s median</span></div>
      <div className="data-row"><strong>Throughput spread</strong><span>{summary.tokensPerSecond ? decimal(summary.tokensPerSecond.min) + '–' +
        decimal(summary.tokensPerSecond.max) + ' tok/s' : 'n/a'}</span></div>
    </div>
  </div>;
}
function Row({ row }: { row: LongSample }) {
  return <div className="long-observation">
    <strong>#{row.ordinal} · {row.cap} ceiling · {row.phase}</strong>
    <p className="muted">{row.outputTokens ?? 'n/a'} generated / {row.cap} allowed ·
      done: {row.doneReason ?? 'not reported'} · {decimal(row.generationTokensPerSecond)} tok/s</p>
    <p>Browser {decimal(row.browserElapsedMs)} ms · load {decimal(row.modelLoadMs)} ms ·
      prompt {decimal(row.promptEvalMs)} ms · generation {decimal(row.generationMs)} ms</p>
    <p>Before: {row.before.status === 'observed'
      ? (row.before.loaded ? 'loaded, ' + formatBytes(row.before.sizeVramBytes) + ' reported VRAM residency' : 'not listed as loaded')
      : 'residency unavailable'} · After: {row.after.status === 'observed'
      ? (row.after.loaded ? 'loaded, ' + formatBytes(row.after.sizeVramBytes) + ' reported VRAM residency' : 'not listed as loaded')
      : 'residency unavailable'}</p>
  </div>;
}
export function LongLabPanel({ origin, diagnosis, disabled, onRunningChange }: Props) {
  const [modelPref, setModelPref] = useState('');
  const [repetitions, setRepetitions] = useState<2 | 3>(2);
  const [approved, setApproved] = useState(false);
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState<LongSample[]>([]);
  const [ledger, setLedger] = useState<LongLedger | null>(null);
  const [error, setError] = useState('');
  const [imported, setImported] = useState<LongLedger[]>([]);
  const [importError, setImportError] = useState('');
  const [progress, setProgress] = useState(0);
  const stop = useRef(false);
  const installed = diagnosis?.installed ?? [];
  const names = installed.map((x) => x.name);
  const model = names.includes(modelPref) ? modelPref : (names[0] ?? '');
  const selectedMetadata = installed.find((x) => x.name === model);
  let ready = false;
  try { ready = !!diagnosis?.ready && diagnosis.origin === localOllamaUrl(origin); }
  catch { ready = false; }
  const total = planLongCohort(repetitions).length;
  const completed = ledger?.observations ?? rows;
  const sessions = [...imported, ...(ledger ? [ledger] : [])];
  const comparison = sessions.length > 1 ? compareLongSessions(sessions) : null;
  const config: LongConfig = {
    model, digest: selectedMetadata?.digest ?? null,
    ollamaVersion: diagnosis?.version ?? null, repetitions
  };

  async function start() {
    if (running || disabled || !approved || !ready || !model) return;
    stop.current = false;
    setApproved(false); setRows([]); setLedger(null); setError('');
    setRunning(true); setProgress(0); onRunningChange(true);
    try {
      const result = await runLongCohort(origin, config, names, {
        shouldStop: () => stop.current,
        onProgress: (next, done) => { setRows(next); setProgress(done); }
      });
      setLedger(result);
      if (result.error) setError(result.error);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setRunning(false); onRunningChange(false); }
  }
  async function importFiles(files: File[]) {
    if (!files.length) return;
    setImportError('');
    try {
      if (files.length > 6) throw new Error('Import no more than 6 sessions at once.');
      const newLedgers: LongLedger[] = [];
      for (const file of files) {
        if (file.size > 150000) throw new Error('Session file exceeds 150 KB.');
        newLedgers.push(parseLongLedger(await file.text()));
      }
      setImported((old) => {
        const byId = new Map<string, LongLedger>();
        for (const x of [...old, ...newLedgers]) byId.set(x.sessionId, x);
        return [...byId.values()].slice(-8);
      });
    } catch (e) { setImportError(e instanceof Error ? e.message : String(e)); }
  }

  return <section className="panel long-lab">
    <div className="lab-heading"><h3>06 / Longer workload &amp; session studio</h3>
      <span className="lab-pill neutral">128 + 256 · REPEATABLE</span></div>
    <p className="muted">A fixed, neutral long-form prompt and two maximum output lengths, with one priming request then {repetitions} measured requests at each length. We report the <strong>actual</strong> output length and completion reason, not an assumed 128 or 256 generated tokens.</p>
    <div className="repeat-config">
      <div className="field"><label htmlFor="long-model">Locally installed model</label>
        <select id="long-model" value={model} disabled={running || !ready} onChange={(e) => {
          setModelPref(e.target.value); setApproved(false);
        }}>
          {!names.length && <option value="">Diagnose Ollama first</option>}
          {names.map((name) => <option key={name} value={name}>{name}</option>)}
        </select></div>
      <div className="field"><label htmlFor="long-repeat">Measurements per length</label>
        <select id="long-repeat" value={repetitions} disabled={running} onChange={(e) => {
          setRepetitions(Number(e.target.value) as 2 | 3); setApproved(false);
        }}><option value={2}>2 measurements · 6 total calls</option>
          <option value={3}>3 measurements · 8 total calls</option></select></div>
    </div>
    <p className="muted">The lab requests Ollama /api/ps before and after each of the {total} model calls, recording observed residency (or explicit unavailable status). Ollama's reported VRAM residency is not free VRAM or a GPU-use proof. Each model request can take up to 120 seconds and allocate RAM/VRAM.</p>
    <label className="switch"><input type="checkbox" checked={approved}
      disabled={running || disabled || !ready || !model}
      onChange={(e) => setApproved(e.target.checked)}/>
      I approve {total} sequential local model requests plus up to {2 * total} read-only residency checks, with possible memory and GPU use.</label>
    <div className="actions">
      <button className="primary" onClick={() => void start()}
        disabled={running || disabled || !approved || !ready || !model}>
        {running ? 'Measuring locally…' : 'Run approved 128/256 session'}</button>
      {running && <button className="secondary" onClick={() => { stop.current = true; }}>Stop after current request</button>}
    </div>
    {running && <p role="status" className="muted">Completed {progress}/{total} calls. Stop takes effect after the active call and its residency checks.</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {ledger && <p className={ledger.status === 'completed' ? 'lab-success' : 'muted'}>
      Session {ledger.status} · {ledger.observations.length}/{total} requests recorded.
      {ledger.status !== 'completed' ? ' Partial evidence is retained but not promoted as a complete experiment.' : ''}
    </p>}
    {completed.length > 0 && <details className="repeat-rows" open={running}>
      <summary>Inspect {completed.length} raw observations and residency snapshots</summary>
      <div className="long-rows">{completed.map((row) => <Row key={row.ordinal} row={row}/>)}</div>
    </details>}
    {ledger && <>
      <div className="long-summary-grid">
        {summarizeLongLedger(ledger).map((s) => <Summary key={s.cap} summary={s}/>)}
      </div>
      <p className="muted">Priming measurements remain in the raw ledger but never count toward these medians. Two or three samples per length are descriptive, not statistically significant. Early EOS responses and changing token counts weaken comparisons.</p>
      <button className="secondary" onClick={() => saveLedger(ledger)}>Export complete V3 session JSON</button>
    </>}
    <div className="thin-rule"/>
    <h4>Compare exported sessions on this machine</h4>
    <p className="muted">Import up to eight previous V3 session JSON files in this browser tab. No uploads or persistence. A comparison is flagged if model names, reported digests, Ollama versions or output lengths differ, or if any session is incomplete.</p>
    <label className="file-picker">Import V3 session ledgers<input type="file" multiple accept=".json,application/json"
      disabled={running} onChange={(e) => {
        const files = Array.from(e.target.files ?? []); e.target.value = '';
        void importFiles(files);
      }}/></label>
    {importError && <p role="alert" className="error">{importError}</p>}
    {sessions.length > 0 && <div className="long-sessions">
      {sessions.map((s) => <div className="lab-model" key={s.sessionId}>
        <strong>{new Date(s.startedAt).toLocaleString()} · {s.config.model}</strong>
        <p>Session ID {s.sessionId} · {s.status} · Ollama {s.config.ollamaVersion ?? 'unknown'} · {s.observations.length} observations</p>
      </div>)}
    </div>}
    {comparison && <>
      <p className={comparison.compatible ? 'lab-success' : 'error'}>
        {comparison.compatible ? 'Metadata and output lengths pass basic comparison gates; results remain descriptive.' :
          'Not a like-for-like comparison: ' + comparison.reasons.join(' | ')}</p>
      <div className="long-session-compare">{comparison.sessions.map((s) => <div className="long-compare-card" key={s.sessionId}>
        <strong>{new Date(s.startedAt).toLocaleString()} · {s.sessionId}</strong>
        {s.summaries.map((v) => <p key={v.cap}>{v.cap} ceiling: {v.count} measured · median {decimal(v.tokensPerSecond?.median)} tok/s ·
          browser {decimal(v.browser?.median)} ms · actual outputs [{v.tokenCounts.join(', ')}]</p>)}
      </div>)}</div>
    </>}
    {imported.length > 0 && <button className="secondary" onClick={() => setImported([])}>Clear imported session history</button>}
    <p className="muted">PhiStream remains a separate read-only research lane. This instrument cannot certify sustained performance, CUDA execution, or cold-start speedups.</p>
  </section>;
}
