import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbStore: Record<string, unknown> = {};

vi.mock('@/lib/local/db', () => ({
  dbGet: vi.fn(async (store: string) => (store in dbStore ? dbStore[store] : null)),
  dbSet: vi.fn(async (store: string, value: unknown) => {
    dbStore[store] = value;
  })
}));

import { RitualDeckPanel } from '@/components/assistant/RitualDeckPanel';
import { normalizeOracleArtifact } from '@/lib/tiekat/oracleArtifact';
import {
  appendRitualDeck,
  buildRitualDeckContinuityChips,
  buildRitualDeckContinuityNote,
  buildFilteredRitualDeck,
  buildRecentRitualDeck,
  buildRitualCardFromArtifact,
  buildRitualDeck,
  deleteRitualDeck,
  exportRitualCardJson,
  exportRitualDeckJson,
  exportRitualDeckMarkdown,
  filterArtifactsForDeck,
  getRecentRitualDecks,
  importRitualDeckJson,
  normalizeRitualDeck,
  normalizeRitualDeckFilterState,
  RITUAL_EXPORT_FOOTER,
  summarizeRitualDeck
} from '@/lib/tiekat/ritualDeck';

function mk(id: string, ts: string, mode = 'open_reflection', scoring = 'v54-gb-v1') {
  return normalizeOracleArtifact({
    id,
    timestamp: ts,
    sessionMode: { key: mode as any, label: mode, ritualFrame: 'ritual-frame', allowV55Framing: true },
    summary: {
      promptSummary: 'prompt summary',
      responseSummary: 'response summary',
      oracleHeadline: `headline-${id}`
    },
    gravity: {
      status: 'theoretical',
      informationIntegral: id === 'c' ? 0.74 : 0.31,
      deltaGPredicted: 1e-10,
      scoringVersion: scoring,
      canonicalSpecVersion: 'TIEKAT-v54'
    },
    consent: {
      memoryEnabled: true,
      includeNames: false,
      allowAncestry: false,
      hideLivingPersons: true
    },
    v56: id === 'c'
      ? {
        specVersion: 'TIEKAT-v56',
        awakeningState: 'awakened',
        shieldStatus: 'reinforced',
        synchronyState: 'aligned',
        overlapState: 'merged',
        glyphFamily: 'lattice_bloom',
        caption: 'Modeled sovereign sphere summary. Theoretical integration layer only.',
        confidenceNote: 'Modeled sovereign sphere summary only.'
      }
      : undefined
  });
}

describe('tiekat ritual deck round-trip + persistence', () => {
  const artifacts = [
    mk('a', '2026-03-01T00:00:00.000Z', 'open_reflection', 'v54-gb-v1'),
    mk('b', '2026-03-15T00:00:00.000Z', 'synthesis_oracle', 'v54-gb-v1'),
    mk('c', '2026-03-18T00:00:00.000Z', 'synthesis_oracle', 'v55-gb-v1')
  ];

  beforeEach(() => {
    for (const key of Object.keys(dbStore)) delete dbStore[key];
  });

  it('builds compact ritual card shape and preserves footer', () => {
    const card = buildRitualCardFromArtifact(artifacts[0]);
    expect(card.artifactId).toBe('a');
    expect(card.responseSummary).toBe('response summary');
    expect(card.footer).toContain('not a physical measurement');
    expect((card as any).prompt).toBeUndefined();
  });

  it('carries compact v56 summary fields in ritual cards/deck exports when present', () => {
    const card = buildRitualCardFromArtifact(artifacts[2]);
    expect(card.v56?.awakeningState).toBe('awakened');
    expect(card.v56?.glyphFamily).toBe('lattice_bloom');

    const deck = buildRitualDeck({ title: 'Deck with Sphere', source: 'selected', artifacts });
    const exported = exportRitualDeckJson(deck);
    expect(exported).toContain('"v56"');
    expect(exported).toContain('"awakeningState": "awakened"');
  });

  it('filters artifacts by mode/version/window and builds filtered deck', () => {
    const filtered = filterArtifactsForDeck(artifacts, { mode: 'synthesis_oracle', scoringVersion: 'v55-gb-v1', timeWindow: 'recent_7' }, new Date('2026-03-19T00:00:00.000Z'));
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('c');

    const deck = buildFilteredRitualDeck({ artifacts, filters: { mode: 'synthesis_oracle', scoringVersion: 'all', timeWindow: 'all' } });
    expect(deck.source).toBe('filtered');
    expect(deck.cards.every((card) => card.sessionMode.key === 'synthesis_oracle')).toBe(true);
  });

  it('normalizes persisted deck with missing legacy fields', () => {
    const normalized = normalizeRitualDeck({
      cards: [{ artifactId: 'legacy-artifact' as any } as any]
    });
    expect(normalized.cards[0].footer).toBe(RITUAL_EXPORT_FOOTER);
    expect(normalized.exportVersion).toBe('TIEKAT-ritual-deck-v1');
    expect(normalized.filterState).toEqual(normalizeRitualDeckFilterState());
  });

  it('is memory-gated for persistence and supports recent/list/delete', async () => {
    const deck = buildRecentRitualDeck(artifacts, 2);
    await appendRitualDeck({ enabled: false, deck });
    expect((await getRecentRitualDecks(8)).length).toBe(0);

    await appendRitualDeck({ enabled: true, deck });
    const rows = await getRecentRitualDecks(8);
    expect(rows.length).toBe(1);
    expect(rows[0].cards.length).toBe(2);

    await deleteRitualDeck(deck.id);
    expect((await getRecentRitualDecks(8)).length).toBe(0);
  });

  it('exports/imports deck round-trip with validation and reject path', () => {
    const deck = buildRitualDeck({ title: 'Deck A', source: 'filtered', artifacts });
    const cardJson = exportRitualCardJson(deck.cards[0]);
    const deckJson = exportRitualDeckJson(deck);
    const deckMd = exportRitualDeckMarkdown(deck);
    const imported = importRitualDeckJson(deckJson);

    expect(cardJson).toContain('TIEKAT-ritual-deck-v1');
    expect(deckMd).toContain(RITUAL_EXPORT_FOOTER);
    expect(imported.cards.length).toBe(deck.cards.length);
    expect(imported.footer).toContain('not a physical measurement');

    expect(() => importRitualDeckJson(JSON.stringify({ exportVersion: 'TIEKAT-ritual-deck-v99' }))).toThrow('Unsupported ritual deck export version');
  });

  it('summarizes deck and renders compact replay panel controls', () => {
    const deck = buildRecentRitualDeck(artifacts, 2);
    const summary = summarizeRitualDeck(deck);
    const continuityNote = buildRitualDeckContinuityNote(deck);
    const continuityChips = buildRitualDeckContinuityChips(deck);
    const html = renderToStaticMarkup(
      React.createElement(RitualDeckPanel, {
        deck,
        summary,
        onBuildRecentDeck: () => {},
        onBuildSelectedDeck: () => {},
        onBuildFilteredDeck: () => {},
        onExportDeckJson: () => {},
        onExportDeckMarkdown: () => {},
        onExportCard: () => {},
        onImportDeck: () => {},
        onSelectDeck: () => {},
        onDeleteDeck: () => {},
        filterOptions: { modes: ['open_reflection'], scoringVersions: ['v54-gb-v1'], timeWindows: ['all', 'recent_7', 'recent_30'] },
        filters: { mode: 'all', scoringVersion: 'all', timeWindow: 'all' },
        onFiltersChange: () => {},
        recentDecks: [deck]
      })
    );

    expect(summary.cardCount).toBe(2);
    expect(summary.continuityNote).toContain('Modeled ritual deck continuity');
    expect(summary.continuityChips?.length).toBeGreaterThan(0);
    expect(continuityNote).toContain('Configuration-derived continuity');
    expect(continuityChips[continuityChips.length - 1]).toBe('modeled');
    expect(html).toContain('Create Filtered Ritual Deck');
    expect(html).toContain('Recent Ritual Decks');
    expect(html).toContain('Modeled ritual deck continuity');
    expect(html).toContain('not a physical measurement');
  });
});
