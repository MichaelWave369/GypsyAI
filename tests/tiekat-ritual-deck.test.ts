import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RitualDeckPanel } from '@/components/assistant/RitualDeckPanel';
import { normalizeOracleArtifact } from '@/lib/tiekat/oracleArtifact';
import {
  buildRecentRitualDeck,
  buildRitualCardFromArtifact,
  buildRitualDeck,
  exportRitualCardJson,
  exportRitualDeckJson,
  exportRitualDeckMarkdown,
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
    }
  });
}

describe('tiekat ritual deck', () => {
  const artifacts = [
    mk('a', '2026-03-01T00:00:00.000Z', 'open_reflection', 'v54-gb-v1'),
    mk('b', '2026-03-02T00:00:00.000Z', 'synthesis_oracle', 'v54-gb-v1'),
    mk('c', '2026-03-03T00:00:00.000Z', 'synthesis_oracle', 'v55-gb-v1')
  ];

  it('builds a compact ritual card from a sanitized artifact', () => {
    const card = buildRitualCardFromArtifact(artifacts[0]);
    expect(card.artifactId).toBe('a');
    expect(card.responseSummary).toBe('response summary');
    expect(card.footer).toContain('Theoretical field interpretation only');
    expect((card as any).prompt).toBeUndefined();
  });

  it('builds deterministic recent and selected ritual decks', () => {
    const recent = buildRecentRitualDeck(artifacts, 2);
    expect(recent.source).toBe('recent');
    expect(recent.cards.length).toBe(2);
    expect(recent.cards[0].artifactId).toBe('b');

    const selected = buildRitualDeck({ source: 'selected', artifacts: [artifacts[2]] });
    expect(selected.cards.length).toBe(1);
    expect(selected.cards[0].artifactId).toBe('c');
  });

  it('exports ritual card/deck JSON and markdown with versioning/footer', () => {
    const deck = buildRitualDeck({ title: 'Deck A', source: 'filtered', artifacts });
    const cardJson = exportRitualCardJson(deck.cards[0]);
    const deckJson = exportRitualDeckJson(deck);
    const deckMd = exportRitualDeckMarkdown(deck);

    expect(cardJson).toContain('TIEKAT-ritual-deck-v1');
    expect(deckJson).toContain('"source": "filtered"');
    expect(deckMd).toContain('# Deck A');
    expect(deckMd).toContain(RITUAL_EXPORT_FOOTER);
  });

  it('summarizes ritual deck deterministically', () => {
    const deck = buildRitualDeck({ title: 'Deck B', artifacts });
    const summary = summarizeRitualDeck(deck);
    expect(summary.cardCount).toBe(3);
    expect(summary.modeKeys).toEqual(['open_reflection', 'synthesis_oracle']);
    expect(summary.scoringVersions).toEqual(['v54-gb-v1', 'v55-gb-v1']);
    expect(summary.timeRange?.start).toBe('2026-03-01T00:00:00.000Z');
  });

  it('renders ritual deck panel with card list and footer', () => {
    const deck = buildRecentRitualDeck(artifacts, 2);
    const summary = summarizeRitualDeck(deck);
    const html = renderToStaticMarkup(
      React.createElement(RitualDeckPanel, {
        deck,
        summary,
        onBuildRecentDeck: () => {},
        onBuildSelectedDeck: () => {},
        onExportDeckJson: () => {},
        onExportDeckMarkdown: () => {},
        onExportCard: () => {}
      })
    );

    expect(html).toContain('Ritual Export Deck');
    expect(html).toContain('ritual-card');
    expect(html).toContain('not a physical measurement');
  });
});
