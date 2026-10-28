/**
 * GAIA Reading Room: browser-only synthesis of existing deterministic readers.
 * No model calls, implicit uploads, or claims of physical/supernatural proof.
 */
import { createAstroReading, createGeneKeysReading, createTarotReading } from './logic';
import type { TarotSpreadType } from './logic';

export type ReadingKind = 'tarot' | 'astrology' | 'genekeys' | 'ancestry' | 'synthesis';

export const READING_MODES: Record<ReadingKind, string> = {
  tarot: 'tarot_inquiry',
  astrology: 'astrology_reflection',
  genekeys: 'genekeys_contemplation',
  ancestry: 'ancestral_listening',
  synthesis: 'synthesis_oracle'
};

export function readingInvitation(kind: ReadingKind, focus = ''): string {
  const prompts: Record<ReadingKind, string> = {
    tarot: 'Offer a thoughtful tarot reading using only the attached card names, orientations, positions and recorded keywords. Explain how the positions relate; distinguish symbolism from fact.',
    astrology: 'Interpret the attached calculated astrological placements and aspects as symbolic reflection, not scientific prediction. Do not invent additional placements, houses or birth details.',
    genekeys: 'Guide a grounded Gene Keys contemplation using only the attached activation sequence. Its mappings are approximate and symbolic; never imply genetic test results.',
    ancestry: 'Reflect gently on the attached anonymized ancestry counts only. Do not infer identities, cultures, lineages, relationships or personal traits from aggregate data.',
    synthesis: 'Weave a meaningful, cohesive reading from the attached, independently calculated Tarot, Astrology and Gene Keys results. Cite the actual cards, placements and keys. Do not fill in missing data or present symbolic relationships as causal evidence.'
  };
  const specific = focus.trim().slice(0, 300);
  return prompts[kind] +
    (specific ? '\nMy chosen reflection focus: ' + specific : '') +
    '\nBe a curious and creative ally, not a questionnaire. Offer a connected interpretation with nuance, clearly flag approximations and uncertainties, and finish with one optional reflective question. Do not merely repeat the input.';
}

export type IntegratedReadingInput = {
  focus: string;
  date: string;
  utcTime: string;
  latitude: number;
  longitude: number;
  zodiac: 'tropical' | 'sidereal';
  spread?: TarotSpreadType;
};

export function createIntegratedReading(input: IntegratedReadingInput) {
  // Validate birth data BEFORE drawing, so invalid forms do not consume a draw.
  if (!input.date || !input.utcTime ||
      !Number.isFinite(input.latitude) || !Number.isFinite(input.longitude) ||
      input.latitude < -90 || input.latitude > 90 ||
      input.longitude < -180 || input.longitude > 180) {
    throw new Error('Enter a valid date, UTC time, latitude and longitude.');
  }
  const astro = createAstroReading(
    input.date, input.utcTime, input.latitude, input.longitude, input.zodiac
  );
  const gene = createGeneKeysReading(input.date, input.utcTime);
  const tarot = createTarotReading(input.spread || 'three-card');
  const source = {
    schema: 'GAIA_INTEGRATED_READING_V1',
    interpretiveNotPredictive: true,
    calculationNotes: 'Astrological and Gene Keys mappings use the existing reader engines and their documented approximations.',
    tarot: {
      spread: input.spread || 'three-card',
      cards: tarot.cards.map((draw) => ({
        position: draw.position,
        name: draw.card.name,
        orientation: draw.orientation,
        keywords: (draw.orientation === 'upright'
          ? draw.card.upright_keywords : draw.card.reversed_keywords).slice(0, 6)
      }))
    },
    astrology: {
      utcDateTime: input.date + 'T' + input.utcTime + ':00Z',
      latitude: input.latitude,
      longitude: input.longitude,
      zodiac: input.zodiac,
      ascendant: astro.chart.ascendantSign.sign,
      midheaven: astro.chart.mcSign.sign,
      placements: astro.chart.placements.map((p) => ({
        body: p.body, sign: p.sign, degreeInSign: Number(p.degreeInSign.toFixed(2))
      })),
      aspects: astro.chart.aspects.slice(0, 10).map((a) => ({
        bodyA: a.bodyA, bodyB: a.bodyB, type: a.type, orb: Number(a.orb.toFixed(2))
      }))
    },
    geneKeys: {
      approximateSymbolicMapping: true,
      spheres: gene.spheres.map((s) => ({ sphere: s.sphere, key: s.key, line: s.line }))
    }
  };
  return { tarot, astro, gene, packet: source };
}

/** Offline cues are descriptive prompts grounded in the actual drawn cards. */
export function tarotReflectionCues(
  cards: ReturnType<typeof createTarotReading>['cards']
) {
  return cards.map((draw) => {
    const keywords = (draw.orientation === 'upright'
      ? draw.card.upright_keywords : draw.card.reversed_keywords).slice(0, 3);
    return {
      position: draw.position,
      name: draw.card.name,
      keywords,
      question: 'Where do ' + (keywords.join(', ') || 'these themes') +
        ' show up when you consider the role of "' + draw.position + '"?'
    };
  });
}
