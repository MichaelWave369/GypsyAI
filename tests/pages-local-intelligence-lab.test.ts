import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  diagnoseLocalOllama, runSingleSample, modelUsageReceipt,
  asInstalledModel, asResidentModel, classifyPhiStreamHandshake,
  probePhiStreamResearchOnly
} from '../site/src/localLab';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function jsonResponse(data: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

describe('GypsyAI v0.2.2 Local Intelligence Lab', () => {
  it('accepts Ollama metadata without guessing or converting VRAM into free space', () => {
    expect(asInstalledModel({ name: 'granite:8b', size: 3200000000, details: {
      family: 'granite', parameter_size: '8B', quantization_level: 'Q4_K_M'
    } })?.bytes).toBe(3200000000);
    expect(asResidentModel({ name: 'granite:8b', size: 3200000000, size_vram: 1600000000 })?.vramBytes)
      .toBe(1600000000);
    expect(asResidentModel({ name: 'broken', size_vram: 'lots' })?.vramBytes).toBeNull();
    expect(asInstalledModel({ name: 123 })).toBeNull();
  });

  it('rejects all non-loopback origins before any fetch', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(diagnoseLocalOllama('https://attacker.example')).rejects.toThrow('localhost');
    await expect(runSingleSample('http://192.168.1.2:11434', 'model')).rejects.toThrow('localhost');
    await expect(diagnoseLocalOllama('http://127.0.0.1:11434/malicious')).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('reads only the three allowlisted diagnostic GET endpoints and flags loaded residency', async () => {
    const fetch = vi.fn(async (url: string, options: Record<string, unknown>) => {
      expect(options.method).toBe('GET');
      if (url.endsWith('/api/version')) return jsonResponse({ version: '0.99.1' });
      if (url.endsWith('/api/tags')) return jsonResponse({ models: [
        { name: 'granite:8b', size: 3000000000, details: { family: 'granite' } }
      ] });
      if (url.endsWith('/api/ps')) return jsonResponse({ models: [
        { name: 'granite:8b', size: 3000000000, size_vram: 2000000000, context_length: 4096 }
      ] });
      throw new Error('Unexpected call');
    });
    vi.stubGlobal('fetch', fetch);
    const d = await diagnoseLocalOllama('http://localhost:11434');
    expect(d.version).toBe('0.99.1');
    expect(d.ready).toBe(true);
    expect(d.installed).toHaveLength(1);
    expect(d.loaded[0].vramBytes).toBe(2000000000);
    expect(d.loaded[0].contextLength).toBe(4096);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(d.steps.map((s) => s.endpoint)).toEqual(['/api/version', '/api/tags', '/api/ps']);
  });

  it('fails visibly and never guesses a healthy status when localhost is inaccessible', async () => {
    const fetch = vi.fn(async () => { throw new TypeError('Failed to fetch'); });
    vi.stubGlobal('fetch', fetch);
    const d = await diagnoseLocalOllama('http://127.0.0.1:11434');
    expect(d.ready).toBe(false);
    expect(d.steps).toHaveLength(3);
    expect(d.steps.every((x) => x.status === 'error')).toBe(true);
    expect(d.steps[0].message).toContain('Connection blocked');
  });

  it('computes only reported Ollama single-sample metrics, without manufactured timing', () => {
    const r = modelUsageReceipt('granite:8b', {
      model: 'granite:8b', done: true, done_reason: 'stop',
      total_duration: 2000000000, load_duration: 300000000,
      prompt_eval_count: 12, eval_count: 20, eval_duration: 500000000
    }, 2364);
    expect(r.interpretation).toBe('single_observation_not_benchmark');
    expect(r.reportedTokensPerSecond).toBe(40);
    expect(r.serverTotalMs).toBe(2000);
    expect(r.clientElapsedMs).toBe(2364);
    expect(r.promptEvalMs).toBeNull();
    expect((r as unknown as Record<string, unknown>).response).toBeUndefined();
    expect(() => modelUsageReceipt('wrong', { model: 'right', done: true }, 0)).toThrow();
  });

  it('makes one bounded public-prompt inference request only after explicit invocation', async () => {
    const fetch = vi.fn(async () => jsonResponse({
      model: 'granite:8b', done: true, eval_count: 16,
      eval_duration: 400000000, total_duration: 620000000
    }));
    vi.stubGlobal('fetch', fetch);
    expect(fetch).not.toHaveBeenCalled();
    const sample = await runSingleSample('http://127.0.0.1:11434', 'granite:8b');
    const [url, options] = fetch.mock.calls[0] as unknown as [string, { method: string; body: string }];
    expect(url).toBe('http://127.0.0.1:11434/api/generate');
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body);
    expect(body.options.num_predict).toBe(32);
    expect(body.stream).toBe(false);
    expect(body.prompt).toContain('repeatable measurements');
    expect(body).not.toHaveProperty('messages');
    expect(sample.reportedTokensPerSecond).toBe(40);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not promote a PhiStream research handshake into chat', async () => {
    const accepted = classifyPhiStreamHandshake({
      schema: 'phistream-gypsyai-bridge/v1', mode: 'read_only', model_execution: false,
      chat_compatible: true, speedup_proven: true
    });
    expect(accepted.status).toBe('read_only_research');
    expect(accepted.chatProviderEnabled).toBe(false);
    expect(accepted.modelExecutionEnabled).toBe(false);
    expect(accepted.source).toBe('self_reported_unverified');
    expect(classifyPhiStreamHandshake({ schema: 'bad', mode: 'run', model_execution: true }).status).toBe('invalid_response');
    const fetch = vi.fn(async () => jsonResponse({
      schema: 'phistream-gypsyai-bridge/v1', mode: 'read_only', model_execution: false
    }));
    vi.stubGlobal('fetch', fetch);
    const result = await probePhiStreamResearchOnly();
    expect(result.chatProviderEnabled).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe('http://127.0.0.1:8765/health');
    expect(fetch.mock.calls[0][1].method).toBe('GET');
  });
});
