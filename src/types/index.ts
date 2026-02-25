export type TarotSpreadType =
  | 'single'
  | 'three-card'
  | 'celtic-cross'
  | 'tree-of-life'
  | '369'
  | 'ancestral-ladder';

export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit: string | null;
  number: number | null;
  court: string | null;
  upright_keywords: string[];
  reversed_keywords: string[];
  short_upright_meaning: string;
  short_reversed_meaning: string;
  hermetic: Record<string, string | undefined>;
}

export interface DrawnCard {
  card: TarotCard;
  orientation: 'upright' | 'reversed';
  position: string;
}

export interface PlanetPosition {
  body: string;
  longitude: number;
  sign: string;
  degreeInSign: number;
  retrograde?: boolean;
  dignity?: string;
}

export interface Aspect {
  bodyA: string;
  bodyB: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx' | 'semisextile';
  orb: number;
  exactAngle: number;
  strength: number;
  tag?: string;
}
