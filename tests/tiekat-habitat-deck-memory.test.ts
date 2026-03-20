import { beforeEach, describe, expect, it, vi } from 'vitest';

const db: Record<string, unknown> = {};

vi.mock('@/lib/local/db', () => ({
  dbGet: vi.fn(async (store: string) => (store in db ? db[store] : null)),
  dbSet: vi.fn(async (store: string, value: unknown) => {
    db[store] = value;
  })
}));

import {
  appendHabitatDeck,
  buildHabitatDeck,
  deleteHabitatDeck,
  getRecentHabitatDecks,
  importHabitatDeckJson,
  loadHabitatDecks,
  normalizeHabitatDeck
} from '@/lib/tiekat/habitatDeck';
import { buildDefaultHabitatProfiles } from '@/lib/tiekat/habitatProfile';

describe('tiekat habitat deck memory', () => {
  beforeEach(() => {
    for (const key of Object.keys(db)) delete db[key];
  });

  it('normalizes legacy decks with safe defaults', () => {
    const normalized = normalizeHabitatDeck({
      name: 'Legacy Deck',
      cards: [{ profileId: 'legacy-id', profileName: 'Legacy Habitat' } as any]
    });
    expect(normalized.kind).toBe('all');
    expect(normalized.footer.toLowerCase()).toContain('configuration only');
    expect(normalized.version).toBe('TIEKAT-habitat-deck-v1');
    expect(normalized.cards[0].sphereSignature.glyphFamily).toBe('quiet_lotus');
    expect(normalized.sphereSummary.line).toContain('Modeled habitat deck sphere memory');
  });

  it('supports append/load/getRecent/delete with local-only deterministic shape', async () => {
    const deckA = buildHabitatDeck({
      profiles: buildDefaultHabitatProfiles(),
      kind: 'pinned',
      now: '2026-03-20T00:00:00.000Z'
    });
    const deckB = buildHabitatDeck({
      profiles: buildDefaultHabitatProfiles(),
      kind: 'recent',
      now: '2026-03-20T00:01:00.000Z'
    });
    await appendHabitatDeck(deckA);
    await appendHabitatDeck(deckB);

    const loaded = await loadHabitatDecks();
    expect(loaded.length).toBe(2);
    expect(await getRecentHabitatDecks(1)).toMatchObject([{ id: deckB.id }]);
    expect(JSON.stringify(loaded).toLowerCase()).not.toContain('message');
    expect(JSON.stringify(loaded).toLowerCase()).not.toContain('ancestor name');

    await deleteHabitatDeck(deckA.id);
    const afterDelete = await getRecentHabitatDecks(5);
    expect(afterDelete.some((deck) => deck.id === deckA.id)).toBe(false);
  });

  it('preserves import + persistence round-trip', async () => {
    const built = buildHabitatDeck({
      profiles: buildDefaultHabitatProfiles(),
      kind: 'selected',
      selectedIds: ['habitat-default-synthesis-oracle'],
      now: '2026-03-20T00:02:00.000Z'
    });
    const imported = importHabitatDeckJson(JSON.stringify(built));
    await appendHabitatDeck(imported);
    const recent = await getRecentHabitatDecks(3);
    expect(recent[0].id).toBe(imported.id);
    expect(recent[0].cards[0]?.sphereSignature?.specVersion).toBe('TIEKAT-habitat-sphere-v1');
    expect(recent[0].sphereSummary.confidenceNote).toContain('Configuration-derived sphere continuity');
  });
});
