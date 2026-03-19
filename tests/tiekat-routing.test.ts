import { describe, expect, it } from 'vitest';
import { classifyTiekatRequest } from '@/lib/tiekat/routing';

const consent = { allowAncestry: true, includeNames: false, hideLivingPersons: true, memoryEnabled: true };

describe('tiekat routing', () => {
  it('routes tarot language to tarot-focused', () => {
    const route = classifyTiekatRequest('Pull a 3 card tarot spread for me', consent);
    expect(route.route).toBe('tarot_focused');
    expect(route.modules).toContain('tarot');
  });

  it('blocks ancestry module when consent is disabled', () => {
    const route = classifyTiekatRequest('Help me with ancestor lineage patterns', { ...consent, allowAncestry: false });
    expect(route.modules).not.toContain('ancestry');
    expect(route.route).toBe('assistant_synthesis');
  });

  it('blends modules when mixed prompt is used', () => {
    const route = classifyTiekatRequest('Blend my tarot cards with chart transits and gene keys', consent);
    expect(route.route).toBe('assistant_synthesis');
    expect(route.modules).toEqual(expect.arrayContaining(['assistant', 'tarot', 'astrology', 'genekeys']));
  });
});
