import { useEffect, useRef, useState } from 'react';
import type { TinyClient, TinyStatus } from './sovereignBridge';
import {
  PAIR_PROMPT, PAIR_TOKEN_CAP, planPocketBrainPairs,
  runPocketBrainPairs, summarizePocketBrainPairs
} from './pocketBrainComparison';
import type {
  PairLedger, PairLocalAnswer, PairObservation, PairSummary
} from './pocketBrainComparison';

interface Props {
  client: TinyClient | null;
  status: TinyStatus;
  blocked: boolean;
  onBusyChange: (busy: boolean) => void;
  onStatusChange: (status: TinyStatus) => void;
}
interface HumanRatings { coherence?: number; repetition?: number }
function numberText(n: number | null | undefined) {
  return typeof n === 'number' && Number.isFinite(n) ? n.toFixed(2) : 'n/a';
}
function saveLedger(ledger: PairLedger) {
  const text = JSON.stringify(ledger, null, 2);
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gypsyai-pocketbrain-paired-ledger-v1.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 750);
}
function ModeSummary({ summary }: { summary: PairSummary }) {
  return <div className="pbc-summary">
    <h4>{summary.mode === 'baseline' ? 'Baseline greedy' : 'Guarded greedy'}</h4>
    <p className="muted">{summary.measuredCount} measured request(s). Priming excluded.</p>
    <div className="data-list">
      <div className="data-row"><strong>Wall time median</strong><span>{numberText(summary.wallMs?.median)} ms</span></div>
      <div className="data-row"><strong>Wall min/max</strong><span>{numberText(summary.wallMs?.min)} / {numberText(summary.wallMs?.max)} ms</span></div>
      <div className="data-row"><strong>First callback</strong><span>{numberText(summary.firstCallbackMs?.median)} ms median</span></div>
      <div className="data-row"><strong>First visible text</strong><span>{numberText(summary.firstVisibleMs?.median)} ms median</span></div>
      <div className="data-row"><strong>Callback events</strong><span>{summary.callbackCounts.join(', ') || 'n/a'}</span></div>
      <div className="data-row"><strong>Output characters</strong><span>{summary.outputCharacters.join(', ') || 'n/a'}</span></div>
      <div className="data-row"><strong>Event rate median</strong><span>{numberText(summary.callbackRatePerWall?.median)} events/sec</span></div>
    </div>
  </div>;
}

export function PocketBrainComparison({ client, status, blocked, onBusyChange, onStatusChange }: Props) {
  const [rounds, setRounds] = useState<2 | 4>(2);
  const [approved, setApproved] = useState(false);
  const [running, setRunning] = useState(false);
  const [observations, setObservations] = useState<PairObservation[]>([]);
  const [answers, setAnswers] = useState<PairLocalAnswer[]>([]);
  const [ratings, setRatings] = useState<Record<number, HumanRatings>>({});
  const [ledger, setLedger] = useState<PairLedger | null>(null);
  const [error, setError] = useState('');
  const stop = useRef(false);
  const unmounted = useRef(false);
  const calls = planPocketBrainPairs(rounds).length;
  useEffect(() => {
    unmounted.current = false;
    return () => { unmounted.current = true; stop.current = true; };
  }, []);

  async function run() {
    if (!client || !status.ready || blocked || running || !approved) return;
    stop.current = false;
    onBusyChange(true);
    setRunning(true); setApproved(false); setError('');
    setLedger(null); setObservations([]); setAnswers([]); setRatings({});
    try {
      const result = await runPocketBrainPairs(client, rounds, {
        shouldStop: () => stop.current || unmounted.current,
        onProgress: (nextObservations, nextAnswers) => {
          if (!unmounted.current) {
            setObservations(nextObservations);
            setAnswers(nextAnswers);
          }
        }
      });
      if (!unmounted.current) {
        setLedger(result.ledger);
        if (result.ledger.error) setError(result.ledger.error);
        onStatusChange(client.getStatus());
      }
    } catch (e) {
      if (!unmounted.current) setError(e instanceof Error ? e.message : String(e));
    } finally {
      // On navigation, release a model that cannot be disposed mid-generation.
      if (unmounted.current) await client.dispose().catch(() => undefined);
      else setRunning(false);
      onBusyChange(false);
    }
  }
  function rate(index: number, kind: keyof HumanRatings, raw: string) {
    setRatings((old) => ({
      ...old,
      [index]: { ...old[index], [kind]: raw === '' ? undefined : Number(raw) }
    }));
  }
  const summary = ledger ? summarizePocketBrainPairs(ledger) : [];
  const measured = observations.filter((x) => x.phase === 'measured');
  const outputLengths = new Set(measured.map((x) => x.evidence.engineReceipt.observedTokenCallbackEvents));
  const changingWork = outputLengths.size > 1;
  return <section className="panel tiny-comparison">
    <div className="lab-heading"><h3>04 / PocketBrain comparison studio</h3>
      <span className="lab-pill neutral">EXPLICIT AB/BA · 64 MAX</span></div>
    <p className="muted">Use the <strong>same public prompt</strong> for Baseline and Guarded decoding on one already-loaded PocketBrain Tiny client.
      This experiment executes one priming request per mode, followed by a balanced AB/BA sequence.
      The current Tiny SDK cannot cancel an individual in-flight generation.</p>
    <div className="pbc-prompt"><strong>Fixed experimental prompt</strong><p>{PAIR_PROMPT}</p></div>
    <div className="repeat-config">
      <div className="field">
        <label htmlFor="pbc-rounds">Balanced rounds</label>
        <select id="pbc-rounds" value={rounds} disabled={running}
          onChange={(e) => { setRounds(Number(e.target.value) as 2 | 4); setApproved(false); }}>
          <option value={2}>2 rounds: AB, BA · 6 total requests</option>
          <option value={4}>4 rounds: AB, BA, BA, AB · 10 total requests</option>
        </select>
      </div>
      <div className="field">
        <label>Run conditions</label>
        <p className="brain-source">{status.ready ? (status.device + ' · ' + status.dtype) : 'Load PocketBrain Tiny above first'}</p>
        <small>One browser model held throughout · {PAIR_TOKEN_CAP}-token ceiling</small>
      </div>
    </div>
    <p className="muted">Sequence: {planPocketBrainPairs(rounds).map((s) =>
      s.phase === 'priming' ? (s.mode === 'baseline' ? 'prime A' : 'prime B') :
        (s.mode === 'baseline' ? 'A' : 'B')).join(' → ')}.
      A = Baseline; B = Guarded. The first two priming calls are never included in the summaries.</p>
    <label className="switch"><input type="checkbox" checked={approved}
      disabled={running || blocked || !status.ready}
      onChange={(e) => setApproved(e.target.checked)} />
      I approve exactly {calls} sequential local browser inference requests with the fixed nonpersonal prompt,
      up to {PAIR_TOKEN_CAP} tokens per request, and temporary RAM/VRAM use.</label>
    <div className="actions">
      <button className="primary" disabled={running || blocked || !status.ready || !approved || !client}
        onClick={() => void run()}>{running ? 'Executing paired comparison…' : 'Run approved AB/BA comparison'}</button>
      {running && <button className="secondary" onClick={() => { stop.current = true; }}>
        Stop after current inference</button>}
    </div>
    {running && <p role="status" className="muted">{observations.length}/{calls} completed. Stop takes effect after the current model generation.</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {ledger && <p className={ledger.status === 'completed' ? 'lab-success' : 'muted'}>
      Cohort {ledger.status}. {ledger.observations.length}/{calls} results retained.
      {ledger.status !== 'completed' ? ' Incomplete evidence is not a completed comparison.' : ''}
    </p>}
    {observations.length > 0 && <div className="pbc-answers">
      <h4>Review actual answers · local tab only</h4>
      <p className="muted">These model answers and optional human quality ratings live in temporary browser state, not the measurement export.
        Coherence is subjective (0 = unintelligible, 3 = useful); repetition is subjective (0 = none, 3 = severe).</p>
      {observations.map((observation) => {
        const answer = answers.find((item) => item.index === observation.index);
        const r = observation.evidence.engineReceipt;
        return <article className="pbc-answer" key={observation.index}>
          <div className="pbc-answer-head"><strong>#{observation.index} · {observation.label}</strong>
            <span>{numberText(r.generationWallMs as number | null)} ms · {r.observedTokenCallbackEvents ?? 'n/a'} JS callbacks · {r.outputCharCount ?? 'n/a'} chars</span></div>
          <p className="pbc-answer-text">{answer?.text || '(text not available)'}</p>
          <div className="pbc-rating-row">
            <label>Coherence
              <select aria-label={'Coherence rating for run ' + observation.index}
                value={ratings[observation.index]?.coherence ?? ''}
                onChange={(e) => rate(observation.index, 'coherence', e.target.value)}>
                <option value="">Not rated</option><option value="0">0 · unclear</option>
                <option value="1">1 · weak</option><option value="2">2 · mostly useful</option>
                <option value="3">3 · useful</option>
              </select>
            </label>
            <label>Repetition
              <select aria-label={'Repetition rating for run ' + observation.index}
                value={ratings[observation.index]?.repetition ?? ''}
                onChange={(e) => rate(observation.index, 'repetition', e.target.value)}>
                <option value="">Not rated</option><option value="0">0 · none</option>
                <option value="1">1 · mild</option><option value="2">2 · noticeable</option>
                <option value="3">3 · severe</option>
              </select>
            </label>
          </div>
        </article>;
      })}
    </div>}
    {ledger && <>
      <div className="pbc-summaries">{summary.map((item) => <ModeSummary key={item.mode} summary={item}/>)}</div>
      {changingWork && <p className="error">Measured modes have different JS callback-event counts.
        Their runtime differences are not an equal-work decoding speed comparison.</p>}
      <p className="muted">Comparison measurements are descriptive, not GPU decode benchmarks.
        Different output lengths, cache state, scheduling and token-selection rules can explain differences.
        We never auto-score which answer is scientifically better.</p>
      <button className="secondary" onClick={() => saveLedger(ledger)}>Export numeric-only paired ledger JSON</button>
      <p className="muted">The downloaded file contains no generated text, prompt body, subjective quality ratings,
        other GypsyAI memories, or other chat data. The model/runtime checkpoint hash remains unverified.</p>
      <button className="secondary" onClick={() => {
        setLedger(null); setObservations([]); setAnswers([]); setRatings({}); setError('');
      }}>Clear comparison from this tab</button>
    </>}
  </section>;
}
