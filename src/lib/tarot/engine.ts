import seedrandom from 'seedrandom';
import deck from './deck.json';
import { DrawnCard, TarotCard, TarotSpreadType } from '@/types';

const spreads: Record<TarotSpreadType, string[]> = {
  single: ['Focus'],
  'three-card': ['Past', 'Present', 'Future'],
  'celtic-cross': ['Present', 'Challenge', 'Root', 'Past', 'Goal', 'Near Future', 'Self', 'Environment', 'Hopes/Fears', 'Outcome'],
  'tree-of-life': ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah', 'Tiphareth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
  '369': ['Triad Theme', 'Triad Shadow', 'Triad Resource', 'Clarifier 1', 'Clarifier 2', 'Clarifier 3', 'Clarifier 4', 'Clarifier 5', 'Synthesis']
};

export const getSpreadPositions = (spread: TarotSpreadType) => spreads[spread];

export function drawCards(spread: TarotSpreadType, seed?: string): DrawnCard[] {
  const rng = seed ? seedrandom(seed) : Math.random;
  const cards = [...(deck as TarotCard[])];
  const positions = spreads[spread];
  const result: DrawnCard[] = [];

  for (const position of positions) {
    const index = Math.floor(rng() * cards.length);
    const [card] = cards.splice(index, 1);
    const orientation = rng() > 0.5 ? 'upright' : 'reversed';
    result.push({ card, orientation, position });
  }

  return result;
}
