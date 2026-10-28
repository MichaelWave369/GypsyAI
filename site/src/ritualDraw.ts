/**
 * GAIA Ritual Draw v0.4.0: original browser-local user-selected tarot.
 * The hidden order and orientation are fixed on shuffle; browsing never draws.
 * No inference, persistence, 3rd-party artwork or user data transmission.
 */
import deck from '@/lib/tarot/deck.json';
import { getSpreadPositions } from '@/lib/tarot/engine';
import { buildGroundingPacketTarot } from '@/lib/reading/grounding';
import type { DrawnCard, TarotCard } from '@/types';

export type RitualSpread = 'single' | 'three-card';
export type RitualCard = { card: TarotCard; orientation: 'upright' | 'reversed' };
export type RitualSelection = {
  remaining: RitualCard[];
  selected: DrawnCard[];
};

const FULL_DECK = deck as TarotCard[];
const UINT32_RANGE = 0x100000000;

/** Use rejection sampling to avoid modulo bias for small deck sizes. */
export function secureDeckIndex(maxExclusive: number, source?: () => number): number {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > FULL_DECK.length) {
    throw new Error('Invalid draw range.');
  }
  const rand = source || (() => {
    if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== 'function') {
      throw new Error('Secure browser randomness is unavailable. Shuffling was cancelled.');
    }
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0];
  });
  const threshold = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
  let n = 0;
  do {
    n = rand();
    if (!Number.isSafeInteger(n) || n < 0 || n >= UINT32_RANGE) {
      throw new Error('Unexpected secure random result.');
    }
  } while (n >= threshold);
  return n % maxExclusive;
}

export function shuffledRitualDeck(nextIndex: (max: number) => number = secureDeckIndex): RitualCard[] {
  // Assign orientations once; scrolling through the hidden deck cannot affect them.
  const stack: RitualCard[] = FULL_DECK.map((card) => ({
    card, orientation: nextIndex(2) === 0 ? 'upright' : 'reversed'
  }));
  // Fisher-Yates permutation. No replacement or changing card order upon reveal.
  for (let i = stack.length - 1; i > 0; i--) {
    const j = nextIndex(i + 1);
    if (!Number.isSafeInteger(j) || j < 0 || j > i) throw new Error('Invalid shuffle index.');
    [stack[i], stack[j]] = [stack[j], stack[i]];
  }
  return stack;
}

export function cutRitualDeck(stack: readonly RitualCard[], at: number): RitualCard[] {
  if (stack.length !== FULL_DECK.length || !Number.isSafeInteger(at) || at <= 0 || at >= stack.length) {
    throw new Error('Cut the full deck between card 1 and card 77 before selecting.');
  }
  return [...stack.slice(at), ...stack.slice(0, at)];
}

export function chooseRitualCard(
  remaining: readonly RitualCard[], selected: readonly DrawnCard[],
  spread: RitualSpread, index: number
): RitualSelection {
  const positions = getSpreadPositions(spread);
  if (selected.length >= positions.length) throw new Error('Spread already has all its cards.');
  if (!Number.isSafeInteger(index) || index < 0 || index >= remaining.length) {
    throw new Error('Choose an available face-down card.');
  }
  const picked = remaining[index];
  if (selected.some((c) => c.card.id === picked.card.id)) {
    throw new Error('Cannot select the same card twice.');
  }
  return {
    remaining: remaining.filter((_, i) => i !== index),
    selected: [...selected, { card: picked.card, orientation: picked.orientation,
      position: positions[selected.length] }]
  };
}

export function ritualReadingPacket(spread: RitualSpread, selected: readonly DrawnCard[]) {
  const positions = getSpreadPositions(spread);
  if (selected.length !== positions.length || new Set(selected.map((d) => d.card.id)).size !== selected.length
    || selected.some((d, i) => d.position !== positions[i] || !FULL_DECK.some((c) => c.id === d.card.id)
      || (d.orientation !== 'upright' && d.orientation !== 'reversed'))) {
    throw new Error('Complete a valid spread before preparing a reading.');
  }
  // Reuse original reader facts, not invented lore. Pages reads naturally.
  const packet = { ...buildGroundingPacketTarot(spread, [...selected]), requiredSections: [] };
  if (JSON.stringify(packet).length > 6000) {
    throw new Error('Reading packet is too large for the local Oracle handoff.');
  }
  return packet;
}

export function selectedCardMeaning(draw: DrawnCard): string {
  return draw.orientation === 'upright'
    ? draw.card.short_upright_meaning : draw.card.short_reversed_meaning;
}

export type LoomThread = { from: string; to: string; evidence: string };
export function getRitualThreads(draws: readonly DrawnCard[]): LoomThread[] {
  const threads: LoomThread[] = [];
  for (let i = 0; i + 1 < draws.length; i++) {
    const a = draws[i]; const b = draws[i + 1];
    const ae = a.card.hermetic.element?.trim();
    const be = b.card.hermetic.element?.trim();
    let evidence = 'Spread position sequence: ' + a.position + ' → ' + b.position + '.';
    if (ae && be) {
      evidence += ae === be ? ' Both card records list ' + ae + ' as their element.'
        : ' Listed elements differ: ' + ae + ' → ' + be + '.';
    } else {
      evidence += ' No verified elemental comparison is available from both records.';
    }
    threads.push({ from: a.card.name, to: b.card.name, evidence });
  }
  return threads;
}
