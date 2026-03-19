import { describe, expect, it } from 'vitest';
import {
  buildHabitatCardFromProfile,
  buildHabitatDeck,
  buildPinnedHabitatDeck,
  buildRecentHabitatDeck,
  exportHabitatDeckJson,
  exportHabitatDeckMarkdown,
  importHabitatDeckJson,
  summarizeHabitatDeck,
  TIEKAT_HABITAT_DECK_EXPORT_VERSION
} from '@/lib/tiekat/habitatDeck';
import { buildDefaultHabitatProfiles, normalizeHabitatProfile } from '@/lib/tiekat/habitatProfile';

describe('tiekat habitat deck', () => {
  it('builds deterministic habitat card from profile metadata only', () => {
    const profile = normalizeHabitatProfile({
      ...buildDefaultHabitatProfiles()[2],
      applyCount: 6,
      lastAppliedAt: '2026-03-20T00:00:00.000Z'
    });
    const card = buildHabitatCardFromProfile(profile, '2026-03-20T00:10:00.000Z');
    expect(card.profileName).toBe('Synthesis Oracle');
    expect(card.usageBadge).toBe('Frequently Used');
    expect(card.version).toBe(TIEKAT_HABITAT_DECK_EXPORT_VERSION);
    expect(card.footer).toContain('configuration only');
    expect(JSON.stringify(card).toLowerCase()).not.toContain('message');
    expect(JSON.stringify(card).toLowerCase()).not.toContain('ancestor name');
  });

  it('builds pinned and recent decks deterministically', () => {
    const defaults = buildDefaultHabitatProfiles();
    const profiles = [
      normalizeHabitatProfile({ ...defaults[0], pinned: true, applyCount: 0, lastAppliedAt: null }),
      normalizeHabitatProfile({ ...defaults[2], applyCount: 4, lastAppliedAt: '2026-03-20T00:00:00.000Z' }),
      normalizeHabitatProfile({ ...defaults[3], pinned: true, applyCount: 1, lastAppliedAt: '2026-03-19T00:00:00.000Z' })
    ];
    const pinned = buildPinnedHabitatDeck(profiles, '2026-03-20T00:10:00.000Z');
    expect(pinned.cards.every((card) => card.pinned)).toBe(true);
    const recent = buildRecentHabitatDeck(profiles, '2026-03-20T00:10:00.000Z');
    expect(recent.cards[0]?.profileName).toBe('Synthesis Oracle');

    const all = buildHabitatDeck({ profiles, kind: 'all', now: '2026-03-20T00:10:00.000Z' });
    const summary = summarizeHabitatDeck(all);
    expect(summary.cardCount).toBe(3);
    expect(summary.topCardName).toBeTruthy();
  });

  it('exports/imports habitat decks with validation', () => {
    const deck = buildHabitatDeck({
      profiles: buildDefaultHabitatProfiles(),
      kind: 'selected',
      selectedIds: ['habitat-default-synthesis-oracle'],
      now: '2026-03-20T00:10:00.000Z'
    });
    const json = exportHabitatDeckJson(deck);
    const imported = importHabitatDeckJson(json);
    expect(imported.cards.length).toBe(deck.cards.length);
    expect(imported.version).toBe(TIEKAT_HABITAT_DECK_EXPORT_VERSION);
    expect(exportHabitatDeckMarkdown(imported)).toContain('Local habitat ritual object');
    expect(() => importHabitatDeckJson(JSON.stringify({ version: 'bad', cards: [] }))).toThrow('Unsupported habitat deck export version');
  });
});
