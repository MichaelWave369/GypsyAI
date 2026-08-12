import { describe, expect, it } from 'vitest';

import { runGypsyAstroReader } from '@/lib/mothership/astroAdapter';
import { MOTHERSHIP_READER_SCHEMA } from '@/lib/mothership/contract';

const input = {
  dateISO: '1979-02-23T09:09:00.000Z',
  lat: 38.4784,
  lon: -82.6379,
  zodiacMode: 'tropical' as const,
};

describe('GypsyAI Mothership reader adapter', () => {
  it('emits the shared reader schema with separated claim classes', async () => {
    const envelope = await runGypsyAstroReader(input);

    expect(envelope.schema).toBe(MOTHERSHIP_READER_SCHEMA);
    expect(envelope.reader.id).toBe('gypsy.astro');
    expect(envelope.observations.every((item) => item.claimClass === 'computed')).toBe(true);
    expect(
      envelope.interpretations.every((item) => item.claimClass === 'symbolic_interpretation')
    ).toBe(true);
    expect(envelope.claimBoundary).toContain('does not make astrology');
  });

  it('keeps receipt identity stable across generation timestamps', async () => {
    const a = await runGypsyAstroReader(input);
    const b = await runGypsyAstroReader(input);

    expect(a.receiptHash).toBe(b.receiptHash);
    expect(a.receiptHash).toMatch(/^RDR-[0-9A-F]{16}$/);
  });

  it('rejects invalid coordinate input before producing a reading', async () => {
    await expect(runGypsyAstroReader({ ...input, lat: 120 })).rejects.toThrow(
      'GYPSY_ASTRO_INVALID_LATITUDE'
    );
  });
});
