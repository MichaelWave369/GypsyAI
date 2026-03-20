import { TiekatHabitatDeck } from '@/lib/tiekat/habitatDeck';

export type TiekatHabitatDeckAction = 'opened' | 'imported' | 'exported_json' | 'exported_markdown' | 'created';

export function buildHabitatDeckSphereChips(deck: TiekatHabitatDeck): string[] {
  const continuityType = deck.sphereSummary.dominantAwakeningState === 'mixed' || deck.sphereSummary.dominantGlyphFamily === 'mixed'
    ? 'mixed'
    : 'dominant';
  return [
    deck.sphereSummary.dominantAwakeningState,
    deck.sphereSummary.dominantGlyphFamily,
    continuityType,
    'modeled'
  ];
}

export function buildHabitatDeckContinuityNote(deck: TiekatHabitatDeck): string {
  return `${deck.sphereSummary.line} ${deck.sphereSummary.sphereContinuityLabel} Configuration-derived continuity.`;
}

export function formatHabitatDeckActionEcho(deck: TiekatHabitatDeck, action: TiekatHabitatDeckAction): string {
  const actionLabel: Record<TiekatHabitatDeckAction, string> = {
    opened: 'Opened',
    imported: 'Imported',
    exported_json: 'Exported JSON for',
    exported_markdown: 'Exported Markdown for',
    created: 'Created'
  };
  return `${actionLabel[action]} ${deck.name} with modeled habitat deck sphere memory (${deck.sphereSummary.dominantAwakeningState} / ${deck.sphereSummary.dominantGlyphFamily}).`;
}
