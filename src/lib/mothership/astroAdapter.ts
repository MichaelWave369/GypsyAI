import { computeChart } from '@/lib/astro/engine';
import {
  finalizeReaderEnvelope,
  MOTHERSHIP_READER_SCHEMA,
  type MothershipReaderEnvelope,
} from '@/lib/mothership/contract';

export interface GypsyAstroReaderInput {
  dateISO: string;
  lat: number;
  lon: number;
  zodiacMode?: 'tropical' | 'sidereal';
  orb?: number;
  minorAspects?: boolean;
  extraBodies?: boolean;
}

export async function runGypsyAstroReader(
  input: GypsyAstroReaderInput
): Promise<MothershipReaderEnvelope<GypsyAstroReaderInput>> {
  const date = new Date(input.dateISO);
  if (Number.isNaN(date.getTime())) throw new Error('GYPSY_ASTRO_INVALID_DATE');
  if (!Number.isFinite(input.lat) || input.lat < -90 || input.lat > 90) {
    throw new Error('GYPSY_ASTRO_INVALID_LATITUDE');
  }
  if (!Number.isFinite(input.lon) || input.lon < -180 || input.lon > 180) {
    throw new Error('GYPSY_ASTRO_INVALID_LONGITUDE');
  }

  // The Reader Bus defaults to the core body set. The existing app route can
  // request extra bodies and fall back when an astronomy provider does not
  // support one; this adapter stays deterministic and fail-visible instead.
  const extraBodies = input.extraBodies ?? false;
  const chart = computeChart(
    date,
    input.lat,
    input.lon,
    input.orb ?? 6,
    input.zodiacMode ?? 'tropical',
    input.minorAspects ?? false,
    extraBodies
  );

  const envelope: MothershipReaderEnvelope<GypsyAstroReaderInput> = {
    schema: MOTHERSHIP_READER_SCHEMA,
    reader: {
      id: 'gypsy.astro',
      name: 'GypsyAI Astrology Reader',
      version: '0.1.0',
      implementation: 'GypsyAI/src/lib/astro/engine.ts',
    },
    input: { kind: 'birth_chart_coordinates', payload: { ...input, extraBodies } },
    observations: [
      {
        id: 'astro.placements',
        claim_class: 'computed',
        label: 'Planetary placements',
        value: chart.placements,
        source: 'astronomy-engine + GypsyAI chart logic',
        confidence: 'deterministic',
      },
      {
        id: 'astro.aspects',
        claim_class: 'computed',
        label: 'Angular aspects',
        value: chart.aspects,
        source: 'GypsyAI aspect rules',
        confidence: 'deterministic',
      },
      {
        id: 'astro.houses',
        claim_class: 'computed',
        label: 'Equal-house cusps',
        value: chart.houses,
        source: 'GypsyAI equal-house calculation',
        confidence: 'deterministic',
      },
      {
        id: 'astro.angles',
        claim_class: 'computed',
        label: 'Ascendant and Midheaven',
        value: {
          ascendant: chart.ascendant,
          mc: chart.mc,
          ascendantSign: chart.ascendantSign,
          mcSign: chart.mcSign,
        },
        source: 'GypsyAI sidereal-time calculation',
        confidence: 'deterministic',
      },
    ],
    interpretations: [
      {
        id: 'astro.hermetic_keys',
        framework: 'GypsyAI Hermetic correspondence layer',
        claim_class: 'symbolic_interpretation',
        summary: chart.hermeticKeys.join(' · '),
        based_on: ['astro.placements', 'astro.angles'],
        note: 'Hermetic correspondence is a symbolic framework layered on computational chart data.',
      },
      {
        id: 'astro.aspect_themes',
        framework: 'GypsyAI aspect-tag vocabulary',
        claim_class: 'symbolic_interpretation',
        summary: chart.aspectTags.join(' · '),
        based_on: ['astro.aspects'],
      },
    ],
    provenance: [
      {
        id: 'prov.gypsy.astro.engine',
        kind: 'code',
        label: 'GypsyAI astrology engine',
        locator: 'src/lib/astro/engine.ts',
      },
      {
        id: 'prov.astronomy-engine',
        kind: 'library',
        label: 'astronomy-engine',
        note: 'Used for ecliptic longitudes for supported bodies.',
      },
      {
        id: 'prov.gypsy.hermetic',
        kind: 'dataset',
        label: 'GypsyAI Hermetic correspondence profiles',
        locator: 'src/lib/hermetic/',
      },
    ],
    warnings: [
      {
        code: 'SYMBOLIC_ASTROLOGY_BOUNDARY',
        severity: 'info',
        message:
          'Astronomical calculations and symbolic astrological/Hermetic interpretation are separate claim classes.',
      },
      ...(extraBodies
        ? [
            {
              code: 'EXTRA_BODY_PROVIDER_COMPATIBILITY',
              severity: 'caution' as const,
              message:
                'Extra-body support depends on the underlying astronomy provider; the Reader Bus default is false.',
            },
          ]
        : []),
    ],
    claim_boundary:
      'This adapter exposes computational chart outputs plus explicitly labeled symbolic interpretations. It does not make astrology or Hermetic correspondence OBLP canon, scientific evidence, diagnosis, or fate.',
  };

  return finalizeReaderEnvelope(envelope);
}
