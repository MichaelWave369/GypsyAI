import { describe, expect, it, vi } from 'vitest';
import {
  PAIR_PROMPT, PAIR_TOKEN_CAP, planPocketBrainPairs, runPocketBrainPairs,
  summarizePocketBrainPairs
} from '../site/src/pocketBrainComparison';
import { POCKETBRAIN_SOURCE } from '../site/src/sovereignBridge';
import type { TinyClient, TinyMode, TinyStatus } from '../site/src/sovereignBridge';

const ready: TinyStatus = {
  version: POCKETBRAIN_SOURCE.sdkVersion, phase: 'ready', ready: true,
  model: POCKETBRAIN_SOURCE.modelId, device: 'webgpu', dtype: 'q4f16',
  completedRuns: 0, error: null
};
function makeClient() {
  const calls: Array<{ prompt: string; mode: TinyMode; cap: number }> = [];
  let failAt = -1;
  const client: TinyClient = {
    getStatus: () => ready,
    async load() { return ready; },
    async dispose() {},
    async generate(prompt, { mode, maxNewTokens }) {
      const current = calls.length + 1;
      calls.push({ prompt, mode, cap: maxNewTokens });
      if (current === failAt) throw new Error('Synthetic inference failure');
      const callbacks = mode === 'baseline' ? 52 : 64;
      return {
        text: mode === 'baseline' ? 'BASELINE_LOCAL_SECRET_ANSWER' : 'GUARDED_LOCAL_SECRET_ANSWER',
        receipt: {
          schema: 'POCKETBRAIN_TINY_RUN_V2',
          evidence: 'BROWSER_SELF_REPORTED_UNVERIFIED',
          model: POCKETBRAIN_SOURCE.modelId,
          backend: 'webgpu', dtype: 'q4f16', mode,
          decode: { max_new_tokens: maxNewTokens },
          generation_wall_ms: mode === 'baseline' ? 550 : 680,
          time_to_first_token_callback_ms: 45,
          time_to_first_visible_text_ms: 58,
          observed_token_callback_events: callbacks,
          callback_events_per_second_full_wall: 88,
          output_char_count: mode === 'baseline' ? 303 : 398,
          responseText: 'discard'
        }
      };
    }
  };
  return { client, calls, failOn: (n: number) => { failAt = n; } };
}
describe('GypsyAI PocketBrain comparison v0.2.6', () => {
  it('constructs balanced requests including explicitly excluded priming', () => {
    const req = planPocketBrainPairs(2);
    expect(req).toHaveLength(6);
    expect(req.slice(0, 2).map((x) => x.phase)).toEqual(['priming','priming']);
    expect(req.slice(2).map((x) => x.mode === 'baseline' ? 'A' : 'B').join('')).toBe('ABBA');
    const long = planPocketBrainPairs(4);
    expect(long).toHaveLength(10);
    expect(long.slice(2).map((x) => x.mode === 'baseline' ? 'A' : 'B').join('')).toBe('ABBABAAB');
    expect(() => planPocketBrainPairs(5 as 2)).toThrow();
  });
  it('requires an already-loaded PocketBrain model, never initializes it automatically', async () => {
    const { client, calls } = makeClient();
    expect(calls).toHaveLength(0);
    const wrong: TinyClient = { ...client, getStatus: () => ({ ...ready, ready: false, phase: 'idle' }) };
    await expect(runPocketBrainPairs(wrong, 2)).rejects.toThrow();
    const other: TinyClient = { ...client, getStatus: () => ({ ...ready, model: 'remote-provider' }) };
    await expect(runPocketBrainPairs(other, 2)).rejects.toThrow();
    expect(calls).toHaveLength(0);
  });
  it('executes six bounded real-client calls sequentially on a single constant public prompt', async () => {
    const { client, calls } = makeClient();
    const progress = vi.fn();
    const result = await runPocketBrainPairs(client, 2, { onProgress: progress });
    expect(calls).toHaveLength(6);
    expect(calls.every((x) => x.prompt === PAIR_PROMPT && x.cap === PAIR_TOKEN_CAP)).toBe(true);
    expect(progress).toHaveBeenCalledTimes(6);
    expect(result.ledger.status).toBe('completed');
    expect(result.ledger.observations.slice(0, 2).every((x) => x.phase === 'priming')).toBe(true);
    expect(result.ledger.observations.slice(2).every((x) => x.phase === 'measured')).toBe(true);
    expect(result.ledger.protocol.modelUnloadedBetweenModes).toBe(false);
    expect(result.ledger.protocol.inputOutputTextIncluded).toBe(false);
  });
  it('keeps generated answers local, never inside exported ledger or receipt', async () => {
    const { client } = makeClient();
    const result = await runPocketBrainPairs(client, 2);
    const encoded = JSON.stringify(result.ledger);
    expect(result.answers).toHaveLength(6);
    expect(result.answers[0].text).toContain('LOCAL_SECRET');
    expect(encoded).not.toContain('LOCAL_SECRET');
    expect(encoded).not.toContain(PAIR_PROMPT);
    expect(encoded).not.toContain('responseText');
    expect(result.ledger.observations[0].evidence.responseTextIncluded).toBe(false);
    expect(result.ledger.observations[0].evidence.userPromptIncluded).toBe(false);
    expect(result.ledger.observations[0].evidence.source.artifactRevision).toBe('UNPINNED');
  });
  it('reports honest per-mode descriptive stats excluding priming, not false speedup', async () => {
    const { client } = makeClient();
    const result = await runPocketBrainPairs(client, 2);
    const [baseline, guarded] = summarizePocketBrainPairs(result.ledger);
    expect(baseline.measuredCount).toBe(2);
    expect(guarded.measuredCount).toBe(2);
    expect(baseline.callbackCounts).toEqual([52, 52]);
    expect(guarded.callbackCounts).toEqual([64, 64]);
    expect(baseline.outputCharacters).toEqual([303, 303]);
    expect(guarded.wallMs?.median).toBe(680);
    expect(Object.keys(guarded)).not.toContain('gpuTokensPerSecond');
  });
  it('stops at a request boundary, preserving a partial export rather than fake completion', async () => {
    const { client, calls } = makeClient();
    const result = await runPocketBrainPairs(client, 2, {
      shouldStop: () => calls.length >= 3
    });
    expect(result.ledger.status).toBe('stopped');
    expect(result.ledger.observations).toHaveLength(3);
    expect(calls).toHaveLength(3);
    expect(summarizePocketBrainPairs(result.ledger).map((x) => x.measuredCount)).toEqual([1,0]);
  });
  it('fails closed without hidden retries or fallback when SDK generation fails', async () => {
    const { client, calls, failOn } = makeClient();
    failOn(4);
    const result = await runPocketBrainPairs(client, 2);
    expect(result.ledger.status).toBe('failed');
    expect(result.ledger.error).toContain('Synthetic inference failure');
    expect(calls).toHaveLength(4);
    expect(result.ledger.observations).toHaveLength(3);
  });
  it('rejects model changes or contract-mismatched measurements', async () => {
    const { client } = makeClient();
    let n = 0;
    const changed: TinyClient = {
      ...client,
      getStatus: () => ({ ...ready, device: n++ > 1 ? 'wasm' : 'webgpu' })
    };
    const result = await runPocketBrainPairs(changed, 2);
    expect(result.ledger.status).toBe('failed');
    expect(result.ledger.error).toContain('device changed');
  });
});
