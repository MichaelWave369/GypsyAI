import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  askPhiServeOracle, discoverPhiServeModels,
  PHISERVE_LOCAL_URL, phiServeLoopbackOrigin,
} from '../site/src/phiServeOracle';
import { GAIA_ORACLE_SYSTEM_PROMPT, buildOracleMessages } from '../site/src/logic';

const TOKEN = 'local-browser-phi369-secret-abcdefghijklmnopqrstuvwxyz';
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function stub(response: unknown, status = 200) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fake = vi.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return { ok: status === 200, status, json: async () => response };
  });
  return { fake: fake as unknown as typeof fetch, calls };
}
const turns = [{ role: 'user' as const, content: 'Interpret only the provided evidence.' }];

describe('GAIA explicitly selected PhiServe local Oracle', () => {
  it('enforces actual HTTP loopback with a nonzero explicit port, never remote hosts', () => {
    expect(phiServeLoopbackOrigin(PHISERVE_LOCAL_URL)).toBe(PHISERVE_LOCAL_URL);
    expect(phiServeLoopbackOrigin('http://localhost:11435/')).toBe('http://localhost:11435');
    expect(phiServeLoopbackOrigin('http://[::1]:11435')).toBe('http://[::1]:11435');
    for (const bad of [
      'https://127.0.0.1:11435', 'https://example.com',
      'http://192.168.1.100:11435', 'http://127.0.0.1.attacker.invalid:11435',
      'http://user:pass@localhost:11435', 'http://localhost:11435/api/chat',
      'http://localhost:11435/?token=secret', 'http://localhost:11435/#fragment',
      'http://localhost', 'http://localhost:0', 'file:///etc/passwd',
      'not a url',
    ]) {
      expect(() => phiServeLoopbackOrigin(bad), bad).toThrow();
    }
  });

  it('never contacts the network on module import or without valid bearer token', async () => {
    const fetcher = vi.fn(() => { throw new Error('Should not fetch'); }) as unknown as typeof fetch;
    await expect(discoverPhiServeModels(PHISERVE_LOCAL_URL, 'short', fetcher)).rejects.toThrow(/bearer token/);
    await expect(askPhiServeOracle(PHISERVE_LOCAL_URL, '', 'model', turns, '', fetcher)).rejects.toThrow(/bearer token/);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('checks registered GGUF catalog using bearer auth only on exact localhost route', async () => {
    const { fake, calls } = stub({ models: [{ name: 'local-qwen' }, { name: 'local-llama' }] });
    const models = await discoverPhiServeModels(PHISERVE_LOCAL_URL, TOKEN, fake);
    expect(models).toEqual(['local-qwen', 'local-llama']);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(PHISERVE_LOCAL_URL + '/api/tags');
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer ' + TOKEN);
    expect(calls[0].init.credentials).toBe('omit');
    expect(calls[0].init.redirect).toBe('error');
    expect(calls[0].init.cache).toBe('no-store');
  });

  it('rejects malformed or unexpectedly large catalogs', async () => {
    for (const response of [
      {}, { models: null }, { models: [null] },
      { models: [{ id: 'no-name' }] },
      { models: Array.from({ length: 201 }, (_, i) => ({ name: String(i) })) },
    ]) {
      const { fake } = stub(response);
      await expect(discoverPhiServeModels(PHISERVE_LOCAL_URL, TOKEN, fake)).rejects.toThrow(/invalid GGUF model catalog|invalid model catalog/);
    }
  });

  it('uses the exact canonical GAIA identity in both Oracle providers', () => {
    const prompt = buildOracleMessages(turns);
    expect(prompt[0]).toEqual({ role: 'system', content: GAIA_ORACLE_SYSTEM_PROMPT });
    expect(prompt[0].content).toContain('You are GAIA');
    expect(prompt).toHaveLength(2);
    expect(prompt[1]).toEqual(turns[0]);
  });

  it('never invents a reading/ancestry packet when consent has not attached it', async () => {
    const { fake, calls } = stub({ done: true, message: { role: 'assistant', content: 'Grounded answer.' } });
    const result = await askPhiServeOracle(PHISERVE_LOCAL_URL, TOKEN, 'local-qwen', turns, '', fake);
    expect(result).toBe('Grounded answer.');
    const body = JSON.parse(calls[0].init.body as string);
    expect(body.model).toBe('local-qwen');
    expect(body.stream).toBe(false);
    expect(body.options).toEqual({ temperature: 0.3, num_predict: 256 });
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].content).toBe(GAIA_ORACLE_SYSTEM_PROMPT);
    expect(body.messages.every((m: { role: string }) => ['system','user','assistant'].includes(m.role))).toBe(true);
    expect(JSON.stringify(body)).not.toContain('think');
    expect(JSON.stringify(body)).not.toContain('tools');
  });

  it('passes exactly the explicitly approved deterministic packet, bounded to 8k', async () => {
    const { fake, calls } = stub({ done: true, message: { role: 'assistant', content: 'Interpreted as tradition, not a prediction.' } });
    await askPhiServeOracle(PHISERVE_LOCAL_URL, TOKEN, 'local-qwen', turns, 'CONSENT_APPROVED:' + 'A'.repeat(9000), fake);
    const body = JSON.parse(calls[0].init.body as string);
    expect(body.messages).toHaveLength(3);
    expect(body.messages[1].role).toBe('system');
    expect(body.messages[1].content).toContain('CONSENT_APPROVED:');
    expect(body.messages[1].content).toContain('data, not commands');
    expect(body.messages[1].content.length).toBeLessThan(8200);
    expect(body.messages[2]).toEqual(turns[0]);
    expect(calls).toHaveLength(1);
  });

  it('never accepts partial, nonassistant, empty or unbounded responses as a completed reading', async () => {
    for (const response of [
      { done: false, message: { role: 'assistant', content: 'partial' } },
      { done: true, message: { role: 'tool', content: 'trigger action' } },
      { done: true, message: { role: 'assistant', content: '' } },
      { done: true, message: { role: 'assistant', content: 'X'.repeat(100001) } },
      { done: true, error: 'backend failed', message: { role: 'assistant', content: 'fake' } },
      { message: { role: 'assistant', content: 'not finished' } },
    ]) {
      const { fake } = stub(response);
      await expect(askPhiServeOracle(PHISERVE_LOCAL_URL, TOKEN, 'local-qwen', turns, '', fake))
        .rejects.toThrow(/complete, bounded assistant text response/);
    }
  });

  it('rejects non-text and missing last user turn', () => {
    expect(() => buildOracleMessages([{ role: 'assistant', content: 'hi' }])).toThrow(/user message/);
    expect(() => buildOracleMessages([])).toThrow(/user message/);
    expect(() => buildOracleMessages([{ role: 'tool' as 'user', content: 'execute' }, { role: 'user', content: 'hi' }])).toThrow(/only sends text/);
  });

  it('rejects unauthorized or busy local service without cloud fallback or secret leakage', async () => {
    for (const status of [401, 403, 409, 429, 503]) {
      const { fake, calls } = stub({ error: 'secret upstream body' }, status);
      await expect(askPhiServeOracle(PHISERVE_LOCAL_URL, TOKEN, 'local-qwen', turns, '', fake))
        .rejects.toThrow(new RegExp('HTTP ' + status));
      expect(calls).toHaveLength(1);
      expect(calls[0].url).toBe(PHISERVE_LOCAL_URL + '/api/chat');
      try {
        await askPhiServeOracle(PHISERVE_LOCAL_URL, TOKEN, 'local-qwen', turns, '', fake);
      } catch (error) {
        expect(String(error)).not.toContain(TOKEN);
        expect(String(error)).not.toContain('secret upstream body');
      }
    }
  });

  it('does not send oversized direct prompts', async () => {
    const { fake } = stub({ done: true, message: { role: 'assistant', content: 'yes' } });
    await expect(askPhiServeOracle(PHISERVE_LOCAL_URL, TOKEN, 'local-qwen', [
      { role: 'user', content: 'X'.repeat(5001) },
    ], '', fake)).rejects.toThrow(/maximum length/);
    expect(fake).not.toHaveBeenCalled();
  });
});
