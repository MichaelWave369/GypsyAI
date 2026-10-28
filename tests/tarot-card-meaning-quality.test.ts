import { describe, expect, it } from 'vitest';
import deck from '@/lib/tarot/deck.json';
import { buildGroundingPacketTarot } from '@/lib/reading/grounding';
import type { DrawnCard, TarotCard } from '@/types';
import { readingInvitation } from '../site/src/readingExperience';

const cards = deck as TarotCard[];
const byName = (name: string): TarotCard => {
  const match = cards.find((card) => card.name === name);
  if (!match) throw new Error('Missing card in deck: ' + name);
  return match;
};

describe('GAIA card-specific tarot data', () => {
  it('retains exactly 78 named cards while giving every card its own upright and reversed vocabulary', () => {
    expect(cards).toHaveLength(78);
    expect(new Set(cards.map(c => c.id)).size).toBe(78);
    expect(new Set(cards.map(c => c.name)).size).toBe(78);
    for (const mode of ['upright', 'reversed'] as const) {
      const key = mode === 'upright' ? 'upright_keywords' : 'reversed_keywords';
      const meaning = mode === 'upright' ? 'short_upright_meaning' : 'short_reversed_meaning';
      expect(new Set(cards.map(c => c[key].join('|'))).size).toBe(78);
      expect(new Set(cards.map(c => c[meaning])).size).toBe(78);
      for (const card of cards) {
        expect(card[key]).toHaveLength(3);
        expect(card[key].every(word => typeof word === 'string' && word.trim().length > 2)).toBe(true);
        expect(card[meaning].length).toBeGreaterThan(30);
      }
    }
  });

  it('distinguishes the exact three cards surfaced in the first human reading', () => {
    expect(byName('5 of Wands').upright_keywords).toContain('creative tension');
    expect(byName('9 of Pentacles').reversed_keywords).toContain('self-worth questions');
    expect(byName('10 of Swords').reversed_keywords).toContain('recovery');
    expect(byName('9 of Pentacles').reversed_keywords).not.toEqual(byName('10 of Swords').reversed_keywords);
    expect(byName('5 of Wands').upright_keywords).not.toContain('flow');
  });

  it('delivers the card-specific description to the Oracle without fabricating any draw', () => {
    const sample: DrawnCard[] = [
      { position: 'Past', orientation: 'upright', card: byName('5 of Wands') },
      { position: 'Present', orientation: 'reversed', card: byName('9 of Pentacles') },
      { position: 'Future', orientation: 'reversed', card: byName('10 of Swords') }
    ];
    const packet = buildGroundingPacketTarot('three-card', sample);
    const facts = packet.facts.cards as Array<{
      name: string; position: string; orientation: string;
      keywords: string[]; cardSpecificMeaning: string;
    }>;
    expect(facts).toHaveLength(3);
    expect(facts.map(c => c.name)).toEqual(sample.map(c => c.card.name));
    expect(facts[1].cardSpecificMeaning).toContain('achievement');
    expect(facts[2].cardSpecificMeaning).toContain('Recovery');
    expect(packet.requiredSections.length).toBeLessThan(6);
    expect(JSON.stringify(packet)).not.toContain('literal death predicted');
  });

  it('prompts a cohesive symbolic reading, not a compliance audit', () => {
    const invitation = readingInvitation('tarot', 'direction in life');
    expect(invitation).toContain('direction in life');
    expect(invitation).toContain('card-specific');
    expect(invitation).toContain('not a compliance report');
    expect(invitation).toContain('symbolic reflection');
  });
});
