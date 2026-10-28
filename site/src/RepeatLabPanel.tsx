import { useRef, useState } from 'react';
import { localOllamaUrl } from './logic';
import type { OllamaDiagnosis, LocalBenchmarkReceipt } from './localLab';
import {
  runExperiment, summarizeExperiment, parseLegacySampleJson, makeExperimentSchedule
} from './repeatLab';
import type {
  ExperimentKind, ExperimentLedger, ExperimentObservation, ExperimentConfig,
  ExperimentSummary, MetricKey
} from './repeatLab';

const METRICS: Array<{ key: MetricKey; label: string; unit: string }> = [
  { key: 'clientElapsedMs', label: 'Browser elapsed', unit: 'ms' },
  { key: 'modelLoadMs', label: 'Model load', unit: 'ms' },
  { key: 'promptEvalMs', label: 'Prompt processing', unit: 'ms' },
  { key: 'generationMs', label: 'Generation', unit: 'ms' },
  { key: 'reportedTokensPerSecond', label: 'Generation rate', unit: 'tok/s' }
];
interface Props {
  origin: string;
  diagnosis: OllamaDiagnosis | null;
  disabled: boolean;
  onRunningChange: (busy: boolean) => void;
}
function exportLocalJson(name: string, object: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(object, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name;
  anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 800);
}
function n(x: number | null | undefined) {
  return typeof x === 'number' && Number.isFinite(x) ? x.toFixed(2) : 'n/a';
}
function Summaries({ items }: { items: ExperimentSummary[] }) {
  return <div className="repeat-results">
    {items.map((item) => <div className="repeat-summary" key={item.model}>
      <h4>{item.model} · {item.measured} measured samples</h4>
      <p className="muted">Output token counts per measurement: {item.outputTokens.join(', ') || 'not reported'}. Differences in actual output length affect fairness.</p>
      <div className="data-list">{METRICS.map(({ key, label, unit }) => {
        const s = item.metrics[key];
        return <div className="data-row repeat-row" key={key}>
          <strong>{label}</strong>
          <span>{s ? 'median ' + n(s.median) + ' ' + unit + ' · min ' + n(s.min) + ', max ' +
            n(s.max) + ' · IQR ' + n(s.iqr) : 'n/a'}</span>
        </div>;
      })}</div>
    </div>)}
  </div>;
}

export function RepeatLabPanel({ origin, diagnosis, disabled, onRunningChange }: Props) {
  const [kind, setKind] = useState<ExperimentKind>('post_warmup');
  const [modelA, setModelA] = useState('');
  const [modelB, setModelB] = useState('');
  const [repetitions, setRepetitions] = useState<3 | 5>(3);
  const [pairs, setPairs] = useState<2 | 4>(2);
  const [approved, setApproved] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [rows, setRows] = useState<ExperimentObservation[]>([]);
  const [ledger, setLedger] = useState<ExperimentLedger | null>(null);
  const [error, setError] = useState('');
  const [imported, setImported] = useState<LocalBenchmarkReceipt[]>([]);
  const [importError, setImportError] = useState('');
  const stopRequested = useRef(false);
  const names = diagnosis?.installed.map((m) => m.name) ?? [];
  const a = names.includes(modelA) ? modelA : names[0] ?? '';
  const b = names.includes(modelB) && modelB !== a ? modelB : names.find((x) => x !== a) ?? '';
  let originMatches = false;
  try { originMatches = !!diagnosis?.ready && localOllamaUrl(origin) === diagnosis.origin; }
  catch { originMatches = false; }
  const config: ExperimentConfig = {
    kind, modelA: a, modelB: kind === 'paired_exploratory' ? b : undefined,
    repetitions, pairs,
    ollamaVersion: diagnosis?.version,
    modelDigests: Object.fromEntries(diagnosis?.installed.map((m) => [m.name, m.digest]) ?? [])
  };
  let plannedCalls = 0;
  try { plannedCalls = makeExperimentSchedule(config).length; } catch { plannedCalls = 0; }

  async function start() {
    if (running || disabled || !approved || !originMatches || !a ||
      (kind === 'paired_exploratory' && !b)) return;
    stopRequested.current = false;
    setRunning(true); onRunningChange(true);
    setApproved(false); setRows([]); setLedger(null); setError('');
    setProgress({ completed: 0, total: plannedCalls });
    try {
      const finished = await runExperiment(origin, config, names, {
        shouldStop: () => stopRequested.current,
        onProgress: (observations, completed, total) => {
          setRows(observations); setProgress({ completed, total });
        }
      });
      setLedger(finished);
      if (finished.error) setError(finished.error);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally { setRunning(false); onRunningChange(false); }
  }

  async function importFiles(files: File[]) {
    if (!files.length) return;
    setImportError('');
    try {
      if (files.length > 12) throw new Error('Import at most 12 historical receipt files per selection.');
      const read: LocalBenchmarkReceipt[] = [];
      for (const file of files) {
        if (file.size > 16384) throw new Error('Sample JSON must be 16 KiB or smaller.');
        read.push(parseLegacySampleJson(await file.text()));
      }
      setImported((old) => [...old, ...read].slice(-12));
    } catch (e) { setImportError(e instanceof Error ? e.message : String(e)); }
  }

  const importedSorted = [...imported].sort((x, y) => Date.parse(x.timestamp) - Date.parse(y.timestamp));
  const series = ledger ? summarizeExperiment(ledger) : [];
  const mismatch = kind === 'paired_exploratory' && series.length > 1 &&
    new Set(series.flatMap((item) => item.outputTokens)).size > 1;
  const sourceRows = ledger?.observations ?? rows;

  return <section className="panel repeat-lab">
    <div className="lab-heading"><h3>05 / Cold &amp; warm observation studio</h3>
      <span className="lab-pill neutral">LOCAL · OPT-IN · LIMITED</span></div>
    <p className="muted">Your earlier Granite 4.2 receipts showed large differences between initial and repeat requests. This lab distinguishes an initial <em>priming request</em> from later <em>post-warmup</em> samples. It does not forcibly unload models or claim a true controlled cold-start test.</p>
    <div className="repeat-config">
      <div className="field"><label htmlFor="repeat-kind">Experimental protocol</label>
        <select id="repeat-kind" value={kind} disabled={running} onChange={(e) => {
          setKind(e.target.value as ExperimentKind); setApproved(false);
        }}>
          <option value="post_warmup">Single model · initial + repeats</option>
          <option value="paired_exploratory">Two models · balanced AB/BA</option>
        </select></div>
      <div className="field"><label htmlFor="repeat-a">Model A</label>
        <select id="repeat-a" value={a} disabled={running || !originMatches} onChange={(e) => { setModelA(e.target.value); setApproved(false); }}>
          {names.length === 0 && <option value="">Diagnose Ollama first</option>}
          {names.map((name) => <option key={name} value={name}>{name}</option>)}
        </select></div>
      {kind === 'paired_exploratory' && <div className="field"><label htmlFor="repeat-b">Model B</label>
        <select id="repeat-b" value={b} disabled={running || !originMatches} onChange={(e) => { setModelB(e.target.value); setApproved(false); }}>
          {!b && <option value="">Choose another installed model</option>}
          {names.filter((name) => name !== a).map((name) => <option key={name} value={name}>{name}</option>)}
        </select></div>}
      {kind === 'post_warmup' ? <div className="field"><label htmlFor="repeat-count">Post-warmup measurements</label>
        <select id="repeat-count" value={repetitions} disabled={running} onChange={(e) => {
          setRepetitions(Number(e.target.value) as 3 | 5);setApproved(false);
        }}><option value="3">3 measurements</option><option value="5">5 measurements</option></select></div> :
        <div className="field"><label htmlFor="repeat-pairs">Balanced rounds</label>
          <select id="repeat-pairs" value={pairs} disabled={running} onChange={(e) => {
            setPairs(Number(e.target.value) as 2 | 4);setApproved(false);
          }}><option value="2">2 AB/BA rounds</option><option value="4">4 AB/BA/BA/AB rounds</option></select></div>}
    </div>
    <p className="muted">Exactly {plannedCalls || 'no valid'} possible requests, including {kind === 'post_warmup' ? 'one priming call' : 'one priming call per model'}. Each request uses the same public prompt, temperature 0, and at most 32 generated tokens with a 60-second client timeout. Results and loaded models can change during the test.</p>
    <label className="switch"><input type="checkbox" checked={approved} disabled={running || disabled || !originMatches || !a || (kind === 'paired_exploratory' && !b)}
      onChange={(e) => setApproved(e.target.checked)} /> I authorize up to {plannedCalls} sequential local inference calls, including model loading and RAM/VRAM usage. No calls happen automatically.</label>
    <div className="actions">
      <button className="primary" disabled={!approved || running || disabled || !originMatches || !a || (kind === 'paired_exploratory' && !b)}
        onClick={() => void start()}>{running ? 'Executing approved cohort…' : 'Run approved local cohort'}</button>
      {running && <button className="secondary" onClick={() => { stopRequested.current = true; }}>
        Stop after current request</button>}
    </div>
    {running && <p className="muted" role="status">Completed {progress.completed} of {progress.total} requests. Stop requests take effect after the active request finishes; Ollama is not terminated.</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {ledger && <p className={ledger.status === 'completed' ? 'lab-success' : 'muted'}>
      Cohort: {ledger.status}. {ledger.observations.length} recorded requests, {series.map((item) => item.measured + ' measurements for ' + item.model).join('; ')}.
      {ledger.status !== 'completed' ? ' This is a partial ledger and must not be represented as complete.' : ''}</p>}
    {sourceRows.length > 0 && <details className="repeat-rows" open={!ledger}>
      <summary>Individual request evidence · {sourceRows.length} receipts</summary>
      <div className="lab-models">{sourceRows.map((row) => <div className="lab-model" key={row.index}>
        <strong>{row.index}. {row.orderLabel} · {row.model}</strong>
        <p>Load {n(row.receipt.modelLoadMs)} ms · generation {n(row.receipt.generationMs)} ms · browser {n(row.receipt.clientElapsedMs)} ms · {n(row.receipt.reportedTokensPerSecond)} tok/s · {row.receipt.generatedTokens ?? 'n/a'} tokens</p>
      </div>)}</div>
    </details>}
    {ledger && <>
      <Summaries items={series} />
      {mismatch && <p className="error">Models produced different token counts. Do not interpret throughput or wall-time differences as equal-work speedups.</p>}
      <p className="muted">Median/min/max/IQR describe only this small sample. Priming calls are excluded from summary statistics, but retained in the exported ledger. Runtime loading/eviction, output length, thermal state and model quantization remain possible confounders.</p>
      <button className="secondary" onClick={() => exportLocalJson('gypsyai-local-repeat-ledger-v2.json', ledger)}>
        Export cohort ledger JSON (local file only)</button>
    </>}
    <div className="thin-rule"/>
    <h4>Historic sample receipts · local comparison</h4>
    <p className="muted">Import your existing v0.2.2 JSON exports, such as the two Granite 4.2 observations. Imported receipts are treated as user-provided local observations, not authenticated benchmarks. They are kept only in this open browser tab and are NOT merged into new measured cohorts.</p>
    <label className="file-picker">Import GypsyAI V1 sample JSON<input type="file" multiple accept=".json,application/json" onChange={(e) => {
      const chosen = Array.from(e.target.files ?? []);
      e.target.value = '';
      void importFiles(chosen);
    }} /></label>
    {importError && <p className="error" role="alert">{importError}</p>}
    {importedSorted.length > 0 && <>
      <div className="lab-models">{importedSorted.map((sample, index) => <div className="lab-model" key={sample.timestamp + index}>
        <strong>{new Date(sample.timestamp).toLocaleString()} · {sample.model}</strong>
        <p>Load {n(sample.modelLoadMs)} ms · elapsed {n(sample.clientElapsedMs)} ms · generation {n(sample.generationMs)} ms · {n(sample.reportedTokensPerSecond)} tok/s · {sample.generatedTokens ?? 'n/a'} tokens</p>
      </div>)}</div>
      <button className="secondary" onClick={() => setImported([])}>Clear imported samples from this tab</button>
    </>}
    <p className="muted">No automatic exports, hidden benchmarks, public metrics upload, cloud fallback, false cold-start certification, or PhiStream model execution.</p>
  </section>;
}
