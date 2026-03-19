import { describe, expect, it } from 'vitest';
import { verifyTiekatOutput } from '@/lib/tiekat/verification';

describe('tiekat verification', () => {
  const plan = {
    mode: 'single_module' as const,
    modulesToConsult: ['assistant', 'tarot'] as const,
    contextSummary: 'summary',
    verificationRules: [],
    memoryKeysUsed: []
  };

  it('passes coherent in-scope output', () => {
    const result = verifyTiekatOutput('This tarot card spread invites reflection and practice.', plan, {
      allowAncestry: false,
      includeNames: false,
      hideLivingPersons: true,
      memoryEnabled: false
    });

    expect(result.passed).toBe(true);
    expect(result.coherenceScore).toBeGreaterThan(0.5);
  });

  it('fails when ancestry leaks without consent', () => {
    const result = verifyTiekatOutput('Your family lineage and ancestors show repeating patterns.', plan, {
      allowAncestry: false,
      includeNames: false,
      hideLivingPersons: true,
      memoryEnabled: false
    });

    expect(result.passed).toBe(false);
    expect(result.issues.join(' ')).toContain('ancestry');
  });
});
