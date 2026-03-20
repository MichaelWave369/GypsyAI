import { describe, expect, it } from 'vitest';
import { buildHabitatDeck } from '@/lib/tiekat/habitatDeck';
import { buildDefaultHabitatProfiles } from '@/lib/tiekat/habitatProfile';
import {
  buildHabitatDeckContinuityNote,
  buildHabitatDeckSphereChips,
  formatHabitatDeckActionEcho
} from '@/lib/tiekat/habitatDeckContinuity';

describe('tiekat habitat deck continuity echo', () => {
  it('builds deterministic continuity notes + chips', () => {
    const deck = buildHabitatDeck({ profiles: buildDefaultHabitatProfiles(), kind: 'recent', now: '2026-03-20T00:40:00.000Z' });
    const note = buildHabitatDeckContinuityNote(deck);
    const chips = buildHabitatDeckSphereChips(deck);

    expect(note).toContain('Modeled habitat deck sphere memory');
    expect(note).toContain('Configuration-derived continuity');
    expect(chips.length).toBe(4);
    expect(chips[3]).toBe('modeled');
  });

  it('formats action echoes and keeps text privacy-safe', () => {
    const deck = buildHabitatDeck({ profiles: buildDefaultHabitatProfiles(), kind: 'pinned', now: '2026-03-20T00:41:00.000Z' });
    const echo = formatHabitatDeckActionEcho(deck, 'exported_json');
    expect(echo).toContain('Exported JSON for');
    expect(echo).toContain('modeled habitat deck sphere memory');
    expect(echo.toLowerCase()).not.toContain('message');
    expect(echo.toLowerCase()).not.toContain('ancestor name');
  });
});
