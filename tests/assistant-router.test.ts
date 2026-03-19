import { describe, expect, it } from 'vitest';
import { classifyIntent } from '@/lib/assistant/router';

describe('assistant router', () => {
  it('classifies intents', () => {
    expect(classifyIntent('pull a tarot spread')).toBe('TAROT_READING');
    expect(classifyIntent('read my natal chart')).toBe('ASTRO_READING');
    expect(classifyIntent('gene keys activation')).toBe('GENEKEYS_READING');
    expect(classifyIntent('show ancestry lineage themes', { allowAncestry: true, includeNames: false, hideLivingPersons: true, memoryEnabled: false })).toBe('ANCESTRY_READING');
    expect(classifyIntent('open study correspondences')).toBe('STUDY_LOOKUP');
    expect(classifyIntent('hello there')).toBe('CHAT');
  });
});
