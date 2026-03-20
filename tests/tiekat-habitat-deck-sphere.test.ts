import { describe, expect, it } from 'vitest';
import {
  buildHabitatDeck,
  buildHabitatDeckSphereSummary,
  summarizeHabitatDeckSphereContinuity
} from '@/lib/tiekat/habitatDeck';
import { buildDefaultHabitatProfiles } from '@/lib/tiekat/habitatProfile';

describe('tiekat habitat deck sphere memory', () => {
  it('builds deterministic deck-level sphere summary cues', () => {
    const deck = buildHabitatDeck({
      profiles: buildDefaultHabitatProfiles(),
      kind: 'all',
      now: '2026-03-20T00:30:00.000Z'
    });
    const summary = buildHabitatDeckSphereSummary(deck);
    expect(summary.line).toContain('Modeled habitat deck sphere memory');
    expect(summary.confidenceNote).toContain('Configuration-derived sphere continuity');
    expect(['quiet', 'coherent', 'awakened', 'mixed']).toContain(summary.dominantAwakeningState);
    expect(['quiet_lotus', 'resonant_orbit', 'council_star', 'mixed']).toContain(summary.dominantGlyphFamily);
  });

  it('summarizes continuity text without private/raw payload leakage', () => {
    const deck = buildHabitatDeck({
      profiles: buildDefaultHabitatProfiles(),
      kind: 'selected',
      selectedIds: ['habitat-default-quiet-reflection', 'habitat-default-synthesis-oracle'],
      now: '2026-03-20T00:31:00.000Z'
    });
    const line = summarizeHabitatDeckSphereContinuity(deck);
    expect(line).toContain('Modeled habitat deck sphere memory');
    expect(line.toLowerCase()).not.toContain('message');
    expect(line.toLowerCase()).not.toContain('ancestor name');
  });
});
