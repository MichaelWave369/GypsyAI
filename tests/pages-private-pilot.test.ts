import { describe, expect, it, vi } from 'vitest';
import { preparePilotRequest, sendPilotTurn, PILOT_MAX_PROFILE } from '../site/src/pilotSession';
import type { PilotInput } from '../site/src/pilotSession';
import type { ChatTurn } from '../site/src/logic';

const valid: PilotInput = {
  base: 'http://127.0.0.1:11434',
  model: 'granite4.2:8b',
  turns: [],
  message: 'Can we reflect on an open-source art project?',
  profile: 'Call me Wave. I enjoy building free creative tools.',
  approveProfile: false
};
describe('GypsyAI v0.2.7 voluntary first pilot', () => {
  it('requires a loopback Ollama endpoint and rejects remote hosts', () => {
    expect(() => preparePilotRequest({ ...valid, base: 'https://example.com' })).toThrow();
    expect(() => preparePilotRequest({ ...valid, base: 'http://127.0.0.1:11434/admin' })).toThrow();
    expect(preparePilotRequest(valid).origin).toBe('http://127.0.0.1:11434');
  });
  it('rejects missing questions, excessive data, or empty approved profile', () => {
    expect(() => preparePilotRequest({ ...valid, message: ' ' })).toThrow();
    expect(() => preparePilotRequest({ ...valid, message: 'a'.repeat(1201) })).toThrow();
    expect(() => preparePilotRequest({ ...valid, profile: 'x'.repeat(PILOT_MAX_PROFILE + 1) })).toThrow();
    expect(() => preparePilotRequest({ ...valid, profile: '', approveProfile: true })).toThrow();
  });
  it('never inserts a profile without explicit approval', async () => {
    const ask = vi.fn(async () => 'A real local reply from test model.');
    const plan = vi.fn(async () => ({ promptFrame: 'TIEKAT open reflection' }));
    const res = await sendPilotTurn(valid, {
      ask: ask as never, plan: plan as never, clock: () => 21.5
    });
    expect(res.measurement.profileAttachedToThisRequest).toBe(false);
    expect(res.measurement.memorySaved).toBe(false);
    expect(res.measurement.personalTextIncluded).toBe(false);
    expect(res.nextTurns).toHaveLength(2);
    expect(ask).toHaveBeenCalledTimes(1);
    const args = ask.mock.calls[0] as unknown as string[];
    expect(args[0]).toBe('http://127.0.0.1:11434');
    expect(args[1]).toBe('granite4.2:8b');
    expect(args[3]).not.toContain('Call me Wave.');
    expect(plan.mock.calls[0][0]).toMatchObject({
      councilMode: 'disabled',
      consent: { allowAncestry: false, memoryEnabled: false, includeNames: false },
      memoryEntries: [],
      packet: null
    });
  });
  it('includes only operator-approved profile data in the local model request', async () => {
    const ask = vi.fn(async () => 'That sounds meaningful.');
    const plan = vi.fn(async () => ({ promptFrame: 'TIEKAT open reflection' }));
    const res = await sendPilotTurn({ ...valid, approveProfile: true }, {
      ask: ask as never, plan: plan as never, clock: () => 100
    });
    expect(res.measurement.profileAttachedToThisRequest).toBe(true);
    const args = ask.mock.calls[0] as unknown as string[];
    expect(args[3]).toContain('Call me Wave.');
    expect(args[3]).toContain('user-provided personal background');
    expect(JSON.stringify(res.measurement)).not.toContain('Call me Wave.');
    expect(JSON.stringify(res.measurement)).not.toContain('art project');
  });
  it('retains bounded conversation turns in the caller only without data export', async () => {
    const turns: ChatTurn[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Welcome' }
    ];
    const result = await sendPilotTurn({ ...valid, turns }, {
      ask: (async () => 'What would you like to build?') as never,
      plan: (async () => ({ promptFrame: 'TIEKAT' })) as never,
      clock: () => 5
    });
    expect(result.nextTurns).toHaveLength(4);
    expect(result.nextTurns[3].role).toBe('assistant');
    expect(result.nextTurns[3].content).toContain('build');
    expect(JSON.stringify(result.measurement)).not.toContain('Welcome');
  });
  it('rejects invalid history rather than forwarding unbounded or malformed turns', () => {
    const badHistory = Array.from({ length: 11 }, () => ({ role: 'user' as const, content: 'test' }));
    expect(() => preparePilotRequest({ ...valid, turns: badHistory })).toThrow('format');
    expect(() => preparePilotRequest({ ...valid, turns: [{ role: 'assistant', content: 'x'.repeat(5001) }] })).toThrow();
  });
  it('fails visibly without a fake reply or silent fallback', async () => {
    const ask = vi.fn(async () => { throw new Error('Local Ollama is unavailable'); });
    await expect(sendPilotTurn(valid, {
      ask: ask as never, plan: (async () => ({ promptFrame: '' })) as never
    })).rejects.toThrow('Local Ollama is unavailable');
    expect(ask).toHaveBeenCalledTimes(1);
  });
  it('rejects empty model answers rather than recording fabricated pilot success', async () => {
    await expect(sendPilotTurn(valid, {
      ask: (async () => '') as never, plan: (async () => ({ promptFrame: '' })) as never
    })).rejects.toThrow('empty model response');
  });
});
