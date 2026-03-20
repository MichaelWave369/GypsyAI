import { TiekatHabitatDeck } from '@/lib/tiekat/habitatDeck';
import { buildContinuityChips, formatContinuityNote, formatContinuityTuple } from '@/lib/tiekat/continuityFormatting';

export type TiekatHabitatDeckAction = 'opened' | 'imported' | 'exported_json' | 'exported_markdown' | 'created';

export function buildHabitatDeckSphereChips(deck: TiekatHabitatDeck): string[] {
  const continuityType = deck.sphereSummary.dominantAwakeningState === 'mixed' || deck.sphereSummary.dominantGlyphFamily === 'mixed'
    ? 'mixed'
    : 'dominant';
  return buildContinuityChips({
    awakening: deck.sphereSummary.dominantAwakeningState,
    glyph: deck.sphereSummary.dominantGlyphFamily,
    continuityType
  });
}

export function buildHabitatDeckContinuityNote(deck: TiekatHabitatDeck): string {
  const continuityType = deck.sphereSummary.dominantAwakeningState === 'mixed' || deck.sphereSummary.dominantGlyphFamily === 'mixed'
    ? 'mixed'
    : 'dominant';
  return `${deck.sphereSummary.line} ${deck.sphereSummary.sphereContinuityLabel} ${formatContinuityNote({
    awakening: deck.sphereSummary.dominantAwakeningState,
    glyph: deck.sphereSummary.dominantGlyphFamily,
    continuityType
  }, 'Modeled habitat deck continuity')}`;
}

export function formatHabitatDeckActionEcho(deck: TiekatHabitatDeck, action: TiekatHabitatDeckAction): string {
  const actionLabel: Record<TiekatHabitatDeckAction, string> = {
    opened: 'Opened',
    imported: 'Imported',
    exported_json: 'Exported JSON for',
    exported_markdown: 'Exported Markdown for',
    created: 'Created'
  };
  const continuityType = deck.sphereSummary.dominantAwakeningState === 'mixed' || deck.sphereSummary.dominantGlyphFamily === 'mixed'
    ? 'mixed'
    : 'dominant';
  return `${actionLabel[action]} ${deck.name} with modeled habitat deck sphere memory (${formatContinuityTuple({
    awakening: deck.sphereSummary.dominantAwakeningState,
    glyph: deck.sphereSummary.dominantGlyphFamily,
    continuityType
  })}).`;
}
