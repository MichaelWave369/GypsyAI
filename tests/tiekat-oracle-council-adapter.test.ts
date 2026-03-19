import { describe, expect, it } from 'vitest';
import {
  buildCouncilInputEnvelope,
  loadCouncilModePreference,
  runOracleCouncilWithAdapter,
  saveCouncilModePreference
} from '@/lib/tiekat/oracleCouncil';
import { resolveCouncilAdapter } from '@/lib/tiekat/oracleCouncilAdapter';

describe('oracle council adapter + preferences', () => {
  it('falls back deterministically when adapter unavailable', async () => {
    const envelope = buildCouncilInputEnvelope({
      message: 'Prompt',
      sessionMode: 'open_reflection',
      route: 'assistant_synthesis',
      modules: ['assistant'],
      ritualFrame: 'frame',
      artifactContinuitySummary: 'continuity',
      consent: { allowAncestry: false, includeNames: false }
    });
    const result = await runOracleCouncilWithAdapter({
      mode: 'oracle_council',
      consent: { allowAncestry: false },
      envelope,
      adapterMode: 'deterministic_only',
      provider: 'ollama'
    });
    expect(result?.summary.executionSource).toBe('deterministic_stub');
    expect(result?.summary.adapterAvailable).toBe(false);
  });

  it('uses provider-backed stub adapter when preferred and provider is supported', async () => {
    const envelope = buildCouncilInputEnvelope({
      message: 'Prompt',
      sessionMode: 'open_reflection',
      route: 'assistant_synthesis',
      modules: ['assistant', 'tarot'],
      ritualFrame: 'frame',
      artifactContinuitySummary: 'continuity',
      consent: { allowAncestry: false, includeNames: false }
    });
    const result = await runOracleCouncilWithAdapter({
      mode: 'oracle_council',
      consent: { allowAncestry: false },
      envelope,
      adapterMode: 'provider_preferred',
      provider: 'openai'
    });
    expect(result?.summary.executionSource).toBe('provider_backed');
    expect(result?.summary.adapterName).toContain('provider_stub:openai');
  });

  it('resolves adapter availability deterministically', () => {
    expect(resolveCouncilAdapter('provider_preferred', 'openai').available).toBe(true);
    expect(resolveCouncilAdapter('provider_preferred', 'ollama').available).toBe(false);
    expect(resolveCouncilAdapter('deterministic_only', 'openai').available).toBe(false);
  });

  it('loads/saves council mode preference locally', () => {
    const store: Record<string, string> = {};
    (globalThis as any).window = {
      localStorage: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = v;
        }
      }
    };
    saveCouncilModePreference('swarm_synthesis');
    expect(loadCouncilModePreference('disabled')).toBe('swarm_synthesis');
  });
});
