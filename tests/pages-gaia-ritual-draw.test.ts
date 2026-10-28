import { describe, expect, it } from 'vitest';
import {
  secureDeckIndex, shuffledRitualDeck, cutRitualDeck, chooseRitualCard,
  ritualReadingPacket, selectedCardMeaning, getRitualThreads
} from '../site/src/ritualDraw';

function fixedDeck() {
  // Deterministic test source; production uses browser crypto.getRandomValues.
  return shuffledRitualDeck(max => max - 1);
}

describe('GAIA Ritual Draw v0.4.0', () => {
  it('starts with the original 78 unique cards, with orientations fixed before any pick', () => {
    const deck = fixedDeck();
    expect(deck).toHaveLength(78);
    expect(new Set(deck.map(item => item.card.id)).size).toBe(78);
    expect(deck.every(item => item.orientation === 'reversed')).toBe(true);
    expect(deck[0].card.name).toBe('The Fool');
  });

  it('uses unbiased 32-bit rejection sampling and validates randomness', () => {
    const sequence = [4294967295, 16];
    expect(secureDeckIndex(3, () => sequence.shift()!)).toBe(1);
    expect(() => secureDeckIndex(0)).toThrow('Invalid draw range');
    expect(() => secureDeckIndex(79)).toThrow('Invalid draw range');
    expect(() => secureDeckIndex(4, () => -1)).toThrow('Unexpected secure random result');
  });

  it('cuts the full deck without mutation or lost cards and rejects invalid cuts', () => {
    const deck = fixedDeck();
    const cut = cutRitualDeck(deck, 20);
    expect(cut).toHaveLength(78);
    expect(cut[0].card.id).toBe(deck[20].card.id);
    expect(cut[57].card.id).toBe(deck[77].card.id);
    expect(cut[58].card.id).toBe(deck[0].card.id);
    expect(deck[0].card.id).toBe('major-0');
    expect(() => cutRitualDeck(deck, 0)).toThrow();
    expect(() => cutRitualDeck(deck, 78)).toThrow();
    expect(() => cutRitualDeck(deck.slice(1), 10)).toThrow();
  });

  it('lets the person select only remaining face-down cards, never a replacement', () => {
    const first = chooseRitualCard(fixedDeck(), [], 'three-card', 29);
    expect(first.selected).toHaveLength(1);
    expect(first.selected[0].position).toBe('Past');
    expect(first.remaining).toHaveLength(77);
    expect(first.remaining.some(item => item.card.id === first.selected[0].card.id)).toBe(false);

    const second = chooseRitualCard(first.remaining, first.selected, 'three-card', 0);
    const third = chooseRitualCard(second.remaining, second.selected, 'three-card', 0);
    expect(third.selected.map(item => item.position)).toEqual(['Past','Present','Future']);
    expect(new Set(third.selected.map(item => item.card.id)).size).toBe(3);
    expect(() => chooseRitualCard(third.remaining, third.selected, 'three-card', 0)).toThrow('already');
    expect(() => chooseRitualCard(first.remaining, first.selected, 'three-card', -1)).toThrow();
  });

  it('produces a genuine original-card source packet only after all positions are chosen', () => {
    const one = chooseRitualCard(fixedDeck(), [], 'three-card', 5);
    expect(() => ritualReadingPacket('three-card', one.selected)).toThrow('Complete');
    let state = one;
    state = chooseRitualCard(state.remaining, state.selected, 'three-card', 7);
    state = chooseRitualCard(state.remaining, state.selected, 'three-card', 15);
    const packet = ritualReadingPacket('three-card', state.selected);
    expect(packet.modality).toBe('tarot');
    expect(packet.requiredSections).toEqual([]);
    expect(JSON.stringify(packet).length).toBeLessThan(6000);
    const facts = packet.facts.cards as Array<{name:string;position:string;orientation:string;cardSpecificMeaning:string}>;
    expect(facts.map(x=>x.name)).toEqual(state.selected.map(x=>x.card.name));
    expect(facts.map(x=>x.position)).toEqual(['Past','Present','Future']);
    expect(facts[0].cardSpecificMeaning).toBe(selectedCardMeaning(state.selected[0]));
    expect(facts[0].orientation).toBe(state.selected[0].orientation);
  });

  it('explains only recorded connection evidence, never invented energy measurements', () => {
    const deck = fixedDeck();
    let state = chooseRitualCard(deck, [], 'three-card', 25);
    state = chooseRitualCard(state.remaining, state.selected, 'three-card', 26);
    state = chooseRitualCard(state.remaining, state.selected, 'three-card', 27);
    const links = getRitualThreads(state.selected);
    expect(links).toHaveLength(2);
    expect(links[0].evidence).toContain('Past → Present');
    expect(links[1].evidence).toContain('Present → Future');
    expect(links.every(link => !/measured energy|cosmic proof|confirmed destiny/i.test(link.evidence))).toBe(true);
    expect(getRitualThreads(state.selected.slice(0,1))).toHaveLength(0);
  });

  it('allows an authentic single-card focus without silent additional draws', () => {
    const first = chooseRitualCard(fixedDeck(), [], 'single', 10);
    expect(first.selected).toHaveLength(1);
    expect(first.selected[0].position).toBe('Focus');
    expect(ritualReadingPacket('single', first.selected).modality).toBe('tarot');
    expect(() => chooseRitualCard(first.remaining, first.selected, 'single', 0)).toThrow('already');
  });
});
