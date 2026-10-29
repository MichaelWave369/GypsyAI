/**
 * GAIA Scholar Mode v0.8: opt-in, source-bounded local reading handoff.
 *
 * Never invent historical references. The 78-card Symbolic Library now has
 * one checked Waite source section per card, with source-specific scope limits.
 * Does not call a model, network, or change the selected cards.
 */
import type { DrawnCard } from '@/types';
import { findSymbolicEntry, getSourceForAnnotation } from './symbolicLibrary';

export type ScholarMatch = {
  cardName: string;
  position: string;
  orientation: 'upright' | 'reversed';
  source: string;
  sectionTitle: string;
  sectionUrl: string;
  summary: string;
  scope: 'card-symbolism' | 'divinatory-upright-reversed';
  caution: string;
};
export type ScholarPreview = { matches: ScholarMatch[]; unreviewed: string[]; drawnCount: number };

const MAX_PACKET_CHARS = 5800;

export function scholarPreview(draws: readonly DrawnCard[]): ScholarPreview {
  if (draws.length < 1 || draws.length > 5 ||
      new Set(draws.map(d => d.card.id)).size !== draws.length) {
    throw new Error('Select one to five distinct cards before entering Scholar Mode.');
  }
  const matches: ScholarMatch[] = [];
  const unreviewed: string[] = [];
  for (const draw of draws) {
    const record = findSymbolicEntry(draw.card.id);
    if (!record || record.name !== draw.card.name ||
        (draw.orientation !== 'upright' && draw.orientation !== 'reversed') ||
        !draw.position.trim()) {
      throw new Error('Scholar Mode requires actual GAIA deck cards with known orientations.');
    }
    if (!record.annotation) {
      unreviewed.push(draw.card.name);
      continue;
    }
    const annotation = record.annotation;
    const source = getSourceForAnnotation(annotation);
    matches.push({
      cardName: record.name,
      position: draw.position,
      orientation: draw.orientation,
      source: source.authorOrInstitution + ', ' + source.title,
      sectionTitle: annotation.sectionTitle,
      sectionUrl: annotation.sectionUrl,
      summary: annotation.checkedMeaning,
      scope: annotation.interpretationScope,
      caution: annotation.readingNote
    });
  }
  return { matches, unreviewed, drawnCount: draws.length };
}

export function scholarPacket(base: unknown, draws: readonly DrawnCard[]) {
  if (!base || typeof base !== 'object' || Array.isArray(base)) {
    throw new Error('A verified tarot packet must exist before entering Scholar Mode.');
  }
  const obj = base as Record<string, unknown>;
  if (obj.modality !== 'tarot' || !obj.facts || typeof obj.facts !== 'object') {
    throw new Error('Scholar Mode accepts only a source-grounded tarot packet.');
  }
  const facts = obj.facts as Record<string, unknown>;
  if (!Array.isArray(facts.cards) || facts.cards.length !== draws.length) {
    throw new Error('The reading packet does not match the selected cards.');
  }
  for (let i=0;i<draws.length;i++) {
    const card = facts.cards[i] as Record<string, unknown> | null;
    if (!card || card.name !== draws[i].card.name ||
        card.position !== draws[i].position ||
        card.orientation !== draws[i].orientation) {
      throw new Error('Card positions or orientations changed after the reading was chosen.');
    }
  }
  const preview = scholarPreview(draws);
  const history = {
    mode: 'opt-in-historical-comparison' as const,
    reviewedMatches: preview.matches.map(m=>({
      name:m.cardName, position:m.position, orientation:m.orientation,
      historicalSource:m.source, historicalSection:m.sectionTitle,
      historicalSourceURL:m.sectionUrl, historicalParaphrase:m.summary,
      scope:m.scope, interpretationBoundary:m.caution
    })),
    unreviewedCards: preview.unreviewed,
    groundRules: [
      'These historical statements are descriptions of what a specific author wrote, not facts about this person.',
      'GAIA original card meanings and reviewed historical interpretation are separate traditions and may disagree.',
      'Quote or attribute only reviewedMatches. Do not infer reversed historical meaning when scope is card-symbolism.',
      'Cards in unreviewedCards have NO reviewed historical annotation. Do not manufacture citations.',
      'No claim of empirically verified divination, scientific causation, diagnosis, or fixed prediction.'
    ]
  };
  const withSources = { ...obj, facts: {...facts, scholarMode:history }};
  // Prevent downstream permittedPacket() from silently slicing malformed JSON.
  const length = JSON.stringify(withSources).length;
  if (length > MAX_PACKET_CHARS) {
    // Drop redundant optional terms before any checked source information.
    const compact = { ...withSources, allowedTerms:[] };
    if (JSON.stringify(compact).length <= MAX_PACKET_CHARS) return compact;
    throw new Error('The historical comparison is too large for the local Oracle. Use a smaller spread or regular mode.');
  }
  return withSources;
}
