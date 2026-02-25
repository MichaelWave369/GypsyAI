import { describe, it, expect } from 'vitest';
import { demoTarotInterpretation } from '@/lib/ai/demo';

describe('demo mode', () => {
  it('is deterministic for same cards', () => {
    const cards = [
      {
        position: 'Focus',
        orientation: 'upright' as const,
        card: {
          id: 'major-0',
          name: 'The Fool',
          arcana: 'major' as const,
          suit: null,
          number: 0,
          court: null,
          upright_keywords: [],
          reversed_keywords: [],
          short_upright_meaning: 'start',
          short_reversed_meaning: 'pause',
          hermetic: {}
        }
      }
    ];
    expect(demoTarotInterpretation(cards, 'test')).toEqual(demoTarotInterpretation(cards, 'test'));
  });
});
