import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  planLongCohort, validateLongConfig, readResidency, executeLongSample,
  runLongCohort, summarizeLongLedger, parseLongLedger, compareLongSessions
} from '../site/src/longLab';
import type { LongConfig, ResidentSnapshot, LongSample, LongLedger } from '../site/src/longLab';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const config: LongConfig = {
  model: 'granite4.2:8b',
  digest: 'f586c02fdecdf151b656207c339aa003997345774a41768bac1fd6d2fb85913b',
  ollamaVersion: '0.40.11', repetitions: 2
};
const snap: ResidentSnapshot = {
  checkedAt: '2026-10-28T06:00:00.000Z',
  status: 'observed', loaded: true,
  sizeBytes: 4000000000, sizeVramBytes: 3500000000,
  contextLength: 4096, error: null
};
const sample = (cap: 128 | 256) => ({
  cap, browserElapsedMs: 1500, modelLoadMs: 7,
  serverTotalMs: 1490, promptEvalMs: 40, generationMs: 1400,
  promptTokens: 52, outputTokens: cap, generationTokensPerSecond: 110,
  doneReason: 'length', reachedCap: true
});
const execute = async (_: string, __: string, cap: 128 | 256) => sample(cap);
const residence = async () => snap;

describe('v0.2.4 longer workload experimental protocol', () => {
  it('plans one priming and 2/3 measured requests per cap, no cold reset', () => {
    const six = planLongCohort(2);
    expect(six).toHaveLength(6);
    expect(six.map((x) => x.cap)).toEqual([128, 128, 128, 256, 256, 256]);
    expect(six.map((x) => x.phase)).toEqual(['priming', 'measured', 'measured', 'priming', 'measured', 'measured']);
    expect(planLongCohort(3)).toHaveLength(8);
    expect(() => planLongCohort(5 as 2)).toThrow();
    expect(() => validateLongConfig(config, [])).toThrow();
  });
  it('refuses remote Ollama endpoints before any model or residency call', async () => {
    const e = vi.fn(execute), rs = vi.fn(residence);
    await expect(runLongCohort('https://remote.example', config, [config.model],
      { execute: e, residence: rs })).rejects.toThrow();
    expect(e).not.toHaveBeenCalled();
    expect(rs).not.toHaveBeenCalled();
  });
  it('uses exactly one fixed public prompt and obeys 128/256 token caps', async () => {
    const fetch = vi.fn(async (_: string, opts: { body: string; method: string }) => {
      const body = JSON.parse(opts.body);
      expect(body.options.temperature).toBe(0);
      expect(body.stream).toBe(false);
      expect(body.prompt).toContain('neutral generation-length measurement');
      expect(body).not.toHaveProperty('messages');
      return { ok: true, json: async () => ({
        model: body.model, done: true, eval_count: body.options.num_predict,
        eval_duration: 1000000000, total_duration: 1400000000,
        prompt_eval_count: 52, done_reason: 'length'
      }) };
    });
    vi.stubGlobal('fetch', fetch);
    const out128 = await executeLongSample('http://127.0.0.1:11434', config.model, 128);
    const out256 = await executeLongSample('http://127.0.0.1:11434', config.model, 256);
    expect(out128.outputTokens).toBe(128);
    expect(out256.outputTokens).toBe(256);
    expect(out256.generationTokensPerSecond).toBe(256);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0][0]).toBe('http://127.0.0.1:11434/api/generate');
    await expect(executeLongSample('http://127.0.0.1:11434', config.model, 900 as 128)).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('reads /api/ps only, records absence accurately, and fails visibly on unavailable status', async () => {
    const fetch = vi.fn(async (_: string, opts: { method: string }) => {
      expect(opts.method).toBe('GET');
      return { ok: true, json: async () => ({ models: [
        { name: config.model, size: 1200, size_vram: 1000, context_length: 4096 }
      ] }) };
    });
    vi.stubGlobal('fetch', fetch);
    const result = await readResidency('http://localhost:11434', config.model);
    expect(result.loaded).toBe(true);
    expect(result.sizeVramBytes).toBe(1000);
    expect(fetch.mock.calls[0][0]).toBe('http://localhost:11434/api/ps');
    expect((await readResidency('http://localhost:11434', 'absent')).loaded).toBe(false);
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('connection refused'); }));
    expect((await readResidency('http://localhost:11434', config.model)).status).toBe('unavailable');
  });
  it('keeps exactly 6 sequential observations, 12 residency snapshots and excludes priming from statistics', async () => {
    const calls: string[] = [];
    const e = vi.fn(async (_: string, __: string, cap: 128 | 256) => {
      calls.push('inference'); return sample(cap);
    });
    const rs = vi.fn(async () => { calls.push('residency'); return snap; });
    const ledger = await runLongCohort('http://127.0.0.1:11434', config, [config.model],
      { execute: e, residence: rs });
    expect(ledger.status).toBe('completed');
    expect(ledger.observations).toHaveLength(6);
    expect(e).toHaveBeenCalledTimes(6);
    expect(rs).toHaveBeenCalledTimes(12);
    expect(calls.slice(0, 3)).toEqual(['residency', 'inference', 'residency']);
    expect(summarizeLongLedger(ledger).map((x) => x.count)).toEqual([2, 2]);
    expect(ledger.protocol.forcedCold).toBe(false);
    expect(ledger.protocol.responseTextRetained).toBe(false);
    expect(JSON.stringify(ledger)).not.toContain('Write 300');
  });
  it('preserves early EOS output counts instead of pretending the model generated 256 tokens', async () => {
    const ledger = await runLongCohort('http://127.0.0.1:11434', config, [config.model], {
      execute: async (_: string, __: string, cap: 128 | 256) => ({
        ...sample(cap), outputTokens: cap === 256 ? 61 : cap,
        reachedCap: false, doneReason: 'stop'
      }),
      residence
    });
    const summaries = summarizeLongLedger(ledger);
    expect(summaries[1].tokenCounts).toEqual([61, 61]);
    expect(summaries[1].hitCapCount).toBe(0);
  });
  it('stops at the next boundary, preserving partial evidence; fails closed on bad samples', async () => {
    let n = 0;
    const stopped = await runLongCohort('http://127.0.0.1:11434', config, [config.model], {
      execute: async (_: string, __: string, cap: 128 | 256) => { n++; return sample(cap); },
      residence, shouldStop: () => n >= 2
    });
    expect(stopped.status).toBe('stopped');
    expect(stopped.observations).toHaveLength(2);
    const failed = await runLongCohort('http://127.0.0.1:11434', config, [config.model], {
      execute: async (_: string, __: string, cap: 128 | 256) => ({
        ...sample(cap), outputTokens: 300
      }),
      residence
    });
    expect(failed.status).toBe('failed');
    expect(failed.observations).toHaveLength(0);
  });
  it('roundtrips a bounded V3 session while dropping unknown private fields and rejecting wrong order', async () => {
    const ledger = await runLongCohort('http://127.0.0.1:11434', config, [config.model],
      { execute, residence });
    const raw = JSON.parse(JSON.stringify(ledger));
    raw.secret = 'private';
    raw.observations[0].secret = 'private2';
    const imported = parseLongLedger(JSON.stringify(raw));
    expect(imported).toEqual(ledger);
    expect((imported as unknown as Record<string, unknown>).secret).toBeUndefined();
    raw.observations[0].cap = 256;
    expect(() => parseLongLedger(JSON.stringify(raw))).toThrow('order');
    raw.observations[0].cap = 128;
    raw.origin = 'remote';
    expect(() => parseLongLedger(JSON.stringify(raw))).toThrow();
  });
  it('compares only complete matching digest/runtime/cap lengths without certifying any speedup', async () => {
    const a = await runLongCohort('http://127.0.0.1:11434', config, [config.model],
      { execute, residence });
    const b: LongLedger = {
      ...a, sessionId: 'different-session',
      startedAt: '2026-10-29T05:48:41.445Z'
    };
    const comparison = compareLongSessions([a, b]);
    expect(comparison.compatible).toBe(true);
    expect(comparison.sessions).toHaveLength(2);
    expect(compareLongSessions([a, { ...b, config: { ...b.config, digest: 'changed' } }]).compatible).toBe(false);
    expect(compareLongSessions([a, { ...b, config: { ...b.config, ollamaVersion: 'next' } }]).compatible).toBe(false);
    expect(compareLongSessions([a, { ...b, status: 'stopped' }]).compatible).toBe(false);
    expect(compareLongSessions([a, a]).compatible).toBe(false);
    const shortened: LongLedger = {
      ...b, observations: b.observations.map((row) => row.phase === 'measured'
        ? { ...row, outputTokens: row.cap - 1, reachedCap: false } : row)
    };
    expect(compareLongSessions([a, shortened]).compatible).toBe(false);
  });
});
