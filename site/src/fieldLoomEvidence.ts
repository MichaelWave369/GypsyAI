/**
 * GAIA Field Loom v2: a local, deterministic provenance layer over confirmed
 * tarot drawings. No LLM, network, predictive assertions, or inferred links.
 * "Element" refers only to existing, not independently audited deck metadata.
 */
import { getSpreadPositions } from '@/lib/tarot/engine';
import { getPositionMeanings } from '@/lib/tarot/positions';
import type { DrawnCard } from '@/types';
import { selectedCardMeaning } from './ritualDraw';
import { validateAtlasLayout } from './spreadAtlas';
import type { AtlasLayout } from './spreadAtlas';

export type LoomLens = 'positions' | 'elements' | 'keywords' | 'arcana';
export type LoomEvidence = {
  source: 'confirmed-draw' | 'spread-definition' | 'deck-data' | 'editorial-question';
  text: string;
};
export type LoomNode = {
  id: string;
  position: string;
  card: string;
  orientation: 'upright' | 'reversed';
  arcana: 'major' | 'minor';
  element: string | null;
  keywords: string[];
  meaning: string;
  positionMeaning: string;
  sources: LoomEvidence[];
};
export type LoomLink = { fromId: string; toId: string; lens: LoomLens; observations: LoomEvidence[] };
export type LoomResult = { nodes: LoomNode[]; links: LoomLink[] };

const SOURCE_LABELS: Record<LoomEvidence['source'], string> = {
  'confirmed-draw': 'Chosen spread',
  'spread-definition': 'Spread definition',
  'deck-data': 'GAIA tarot deck',
  'editorial-question': 'Reflection prompt'
};
export { SOURCE_LABELS };

function label(value: unknown, max = 120): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function selectedKeywords(draw: DrawnCard) {
  const words = draw.orientation === 'upright'
    ? draw.card.upright_keywords : draw.card.reversed_keywords;
  return words.filter((word): word is string => typeof word === 'string')
    .map((word) => label(word, 100)).filter(Boolean).slice(0, 6);
}

function comparisons(a: LoomNode, b: LoomNode, lens: LoomLens): LoomEvidence[] {
  const sequence: LoomEvidence = {
    source: 'spread-definition',
    text: 'Adjacent positions in this spread: ' + a.position + ' → ' + b.position + '.'
  };
  switch (lens) {
    case 'positions':
      return [
        sequence,
        { source: 'spread-definition', text: a.position + ': ' + a.positionMeaning },
        { source: 'spread-definition', text: b.position + ': ' + b.positionMeaning },
        { source: 'editorial-question', text: 'How might the roles of these two positions differ for your chosen focus?' }
      ];
    case 'elements':
      return [
        sequence,
        { source: 'deck-data', text: a.card + ': ' + (a.element || 'No explicit element field') + '.' },
        { source: 'deck-data', text: b.card + ': ' + (b.element || 'No explicit element field') + '.' },
        { source: 'deck-data', text: a.element && b.element
          ? (a.element === b.element ? 'The recorded element labels match.' : 'The recorded element labels differ.')
          : 'Both cards do not have explicit element fields, so no element comparison is made.' }
      ];
    case 'keywords': {
      const setB = new Set(b.keywords.map(v => v.toLowerCase()));
      const shared = a.keywords.filter(x => setB.has(x.toLowerCase()));
      return [
        sequence,
        { source: 'deck-data', text: a.card + ' (' + a.orientation + '): ' + (a.keywords.join(' / ') || 'no recorded keywords') + '.' },
        { source: 'deck-data', text: b.card + ' (' + b.orientation + '): ' + (b.keywords.join(' / ') || 'no recorded keywords') + '.' },
        { source: 'deck-data', text: shared.length
          ? 'Exact matching keyword labels: ' + shared.join(', ') + '.'
          : 'No exact keyword labels overlap. This does not prove the themes are unrelated.' }
      ];
    }
    case 'arcana':
      return [
        sequence,
        { source: 'deck-data', text: a.card + ' is recorded as ' + a.arcana + ' arcana.' },
        { source: 'deck-data', text: b.card + ' is recorded as ' + b.arcana + ' arcana.' },
        { source: 'editorial-question', text: 'What shifts when you consider the two cards as distinct roles rather than a single verdict?' }
      ];
  }
}

export function buildFieldLoom(draws: readonly DrawnCard[], lens: LoomLens, customLayout?: AtlasLayout | null): LoomResult {
  if (!['positions','elements','keywords','arcana'].includes(lens)) {
    throw new Error('Choose a supported evidence lens.');
  }
  const layout = customLayout ? validateAtlasLayout(customLayout) : null;
  const validCount = layout ? draws.length === layout.slots.length : [1,3].includes(draws.length);
  if (!draws.length || draws.length > 5 || !validCount
      || new Set(draws.map(d => d.card.id)).size !== draws.length
      || draws.some(d => !d.card.id || !d.card.name || !['major','minor'].includes(d.card.arcana)
        || !['upright','reversed'].includes(d.orientation))) {
    throw new Error('Field Loom requires a complete confirmed one- or three-card reading.');
  }
  const spread = draws.length === 1 ? 'single' : 'three-card';
  const positions = layout ? layout.slots.map(s=>s.label) : getSpreadPositions(spread);
  if (draws.some((d,i) => d.position !== positions[i])) {
    throw new Error('Card positions must match the selected spread.');
  }
  const nodes: LoomNode[] = draws.map((draw, i) => {
    const positionMeaning = layout ? layout.slots[i].meaning : getPositionMeanings(spread)[i].meaning;
    const keywords = selectedKeywords(draw);
    const element = label(draw.card.hermetic?.element, 50) || null;
    return {
      id: 'chosen-' + (i + 1), card: label(draw.card.name), position: draw.position,
      orientation: draw.orientation, arcana: draw.card.arcana, element, keywords,
      meaning: label(selectedCardMeaning(draw), 500), positionMeaning,
      sources: [
        { source: 'confirmed-draw' as const, text: 'You chose ' + draw.card.name + ' as ' + draw.position + ' (' + draw.orientation + ').' },
        { source: 'spread-definition' as const, text: draw.position + ': ' + positionMeaning +
          (layout ? ' (user-authored Spread Atlas role).' : '') },
        { source: 'deck-data' as const, text: 'Selected-orientation card meaning: ' + selectedCardMeaning(draw) },
        { source: 'deck-data' as const, text: 'Card classification: ' + draw.card.arcana + ' arcana.' },
        { source: 'deck-data' as const, text: element
          ? 'Inherited Hermetic element field: ' + element + ' (not independently audited).'
          : 'No explicit Hermetic element field exists in this card record.' }
      ]
    };
  });
  const links: LoomLink[] = nodes.slice(0,-1).map((n, i) => ({
    fromId: n.id, toId: nodes[i + 1].id, lens,
    observations: comparisons(n, nodes[i + 1], lens)
  }));
  return { nodes, links };
}
