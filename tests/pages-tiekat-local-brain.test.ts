import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TIEKAT_CONSENT, normalizeBrainConsent, permittedPacket, safeBrainMemory,
  planLocalBrainTurn, checkLocalBrainReply
} from '../site/src/tiekatBrain';

describe('GypsyAI Pages TIEKAT local brain', () => {
  it('fails closed on names and living persons even with permissive inputs', () => {
    const consent = normalizeBrainConsent({
      allowAncestry: true, includeNames: true,
      hideLivingPersons: false, memoryEnabled: true
    });
    expect(consent.includeNames).toBe(false);
    expect(consent.hideLivingPersons).toBe(true);
    expect(DEFAULT_TIEKAT_CONSENT.memoryEnabled).toBe(false);
    expect(DEFAULT_TIEKAT_CONSENT.allowAncestry).toBe(false);
  });

  const packet = {
    kind: 'ancestry' as const,
    label: 'Ancestors',
    text: JSON.stringify({
      counts: { people: 42, families: 9 },
      longevity: { count: 8, avg: 74.2, min: 39, max: 98 }
    })
  };

  it('never attaches ancestry when consent is off', async () => {
    expect(permittedPacket(packet, DEFAULT_TIEKAT_CONSENT)).toBeNull();
    const plan = await planLocalBrainTurn({
      message: 'Tell me about lineage',
      councilMode: 'oracle_council',
      consent: DEFAULT_TIEKAT_CONSENT,
      memoryEntries: [],
      packet
    });
    expect(plan.packetAttached).toBe(false);
    expect(plan.promptFrame).not.toContain('42');
    expect(plan.plan.modulesToConsult).not.toContain('ancestry');
    expect(plan.council?.roles).not.toContain('lineage_keeper');
    expect(plan.council?.executionSource).toBe('deterministic_stub');
  });

  it('accepts only numerical aggregate ancestry data on explicit consent', async () => {
    const consent = normalizeBrainConsent({ allowAncestry: true });
    expect(permittedPacket(packet, consent)).not.toBeNull();
    expect(permittedPacket({ ...packet, text: JSON.stringify({
      counts: { people: 42, families: 9 },
      longevity: { count: 8, avg: 74.2, min: 39, max: 98 },
      livingPerson: 'Sensitive User'
    }) }, consent)).toBeNull();
    expect(permittedPacket({ ...packet, text: JSON.stringify({
      counts: { people: 42, families: 9, fullName: 'Sensitive User' },
      longevity: { count: 8, avg: 74.2, min: 39, max: 98 }
    }) }, consent)).toBeNull();
    const plan = await planLocalBrainTurn({
      message: 'Explore my ancestral lineage',
      sessionMode: 'ancestral_listening',
      councilMode: 'oracle_council',
      consent,
      packet,
      memoryEntries: []
    });
    expect(plan.packetAttached).toBe(true);
    expect(plan.council?.roles).toContain('lineage_keeper');
    expect(plan.promptFrame).toContain('"people":42');
  });

  const memory = {
    key: 'memo-1',
    summary: 'Prefers clear step-by-step explanations.',
    anchors: ['research'],
    modules: ['assistant'] as const,
    updatedAt: '2026-10-27T00:00:00Z'
  };

  it('uses no memory while disabled and recalls only relevant curated notes when enabled', async () => {
    expect(safeBrainMemory([memory], DEFAULT_TIEKAT_CONSENT)).toEqual([]);
    const off = await planLocalBrainTurn({
      message: 'research workflow',
      councilMode: 'disabled', consent: DEFAULT_TIEKAT_CONSENT,
      memoryEntries: [memory as any]
    });
    expect(off.memoryCount).toBe(0);
    expect(off.promptFrame).not.toContain(memory.summary);
    const on = await planLocalBrainTurn({
      message: 'research workflow',
      councilMode: 'oracle_council',
      consent: normalizeBrainConsent({ memoryEnabled: true }),
      memoryEntries: [memory as any]
    });
    expect(on.memoryCount).toBe(1);
    expect(on.promptFrame).toContain(memory.summary);
    expect(on.council?.executionSource).toBe('deterministic_stub');
  });

  it('presents verification as a heuristic, not an authoritative verdict', async () => {
    const turn = await planLocalBrainTurn({
      message: 'Help me reflect on my plans',
      councilMode: 'disabled', consent: DEFAULT_TIEKAT_CONSENT,
      memoryEntries: []
    });
    const flagged = checkLocalBrainReply('My ancestor told me.', turn);
    expect(flagged.passed).toBe(false);
    expect(flagged.issues.some((x) => x.includes('ancestry'))).toBe(true);
  });
});
