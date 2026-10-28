import { describe, expect, it } from 'vitest';
import { createIntegratedReading, readingInvitation, READING_MODES, tarotReflectionCues } from '../site/src/readingExperience';
import { DEFAULT_TIEKAT_CONSENT, permittedPacket } from '../site/src/tiekatBrain';

const valid = {
  focus: 'How can I make a thoughtful decision?',
  date: '2000-01-01',
  utcTime: '12:00',
  latitude: 51.5,
  longitude: 0,
  zodiac: 'tropical' as const
};

describe('GAIA integrated reading room', () => {
  it('rejects missing or invalid birth coordinates before any reading is built', () => {
    expect(() => createIntegratedReading({ ...valid, date: '' })).toThrow();
    expect(() => createIntegratedReading({ ...valid, latitude: NaN })).toThrow();
    expect(() => createIntegratedReading({ ...valid, longitude: 181 })).toThrow();
    expect(() => createIntegratedReading({ ...valid, latitude: -91 })).toThrow();
  });
  it('uses real existing engines and supplies a bounded, labeled combined packet', () => {
    const result = createIntegratedReading(valid);
    expect(result.tarot.cards).toHaveLength(3);
    expect(result.astro.chart.placements.length).toBeGreaterThan(3);
    expect(result.gene.spheres.length).toBeGreaterThan(0);
    expect(result.packet.schema).toBe('GAIA_INTEGRATED_READING_V1');
    expect(result.packet.interpretiveNotPredictive).toBe(true);
    expect(result.packet.astrology.placements.length).toBe(result.astro.chart.placements.length);
    expect(result.packet.tarot.cards.map((c) => c.name)).toEqual(result.tarot.cards.map((c) => c.card.name));
    expect(result.packet.geneKeys.spheres.map((s) => s.key)).toEqual(result.gene.spheres.map((s) => s.key));
    expect(JSON.stringify(result.packet).length).toBeLessThan(6000);
  });
  it('requires explicit selection before an integrated packet can reach the Oracle', () => {
    const result = createIntegratedReading(valid);
    const approved = permittedPacket({
      kind: 'synthesis',
      label: 'Explicitly reviewed constellation',
      text: JSON.stringify(result.packet)
    }, DEFAULT_TIEKAT_CONSENT);
    expect(approved?.kind).toBe('synthesis');
    expect(approved?.text).toContain('GAIA_INTEGRATED_READING_V1');
    expect(approved?.text).not.toContain(valid.focus);
    expect(permittedPacket({
      kind: 'ancestry', label: 'Private', text: '{"counts":{"people":1,"families":1},"longevity":{"count":0,"avg":null,"min":null,"max":null}}'
    }, DEFAULT_TIEKAT_CONSENT)).toBeNull();
  });
  it('only constructs a suggested user-editable prompt; no model interaction', () => {
    const prompt = readingInvitation('synthesis', valid.focus);
    expect(prompt).toContain('calculated Tarot, Astrology and Gene Keys');
    expect(prompt).toContain(valid.focus);
    expect(prompt).toContain('not a questionnaire');
    expect(READING_MODES.synthesis).toBe('synthesis_oracle');
    expect(READING_MODES.ancestry).toBe('ancestral_listening');
    expect(readingInvitation('ancestry')).toContain('anonymized');
  });
  it('generates offline tarot reflections from exact drawn cards', () => {
    const result = createIntegratedReading(valid);
    const cues = tarotReflectionCues(result.tarot.cards);
    expect(cues).toHaveLength(3);
    expect(cues[0].name).toBe(result.tarot.cards[0].card.name);
    expect(cues[0].position).toBe(result.tarot.cards[0].position);
    expect(cues.every((c) => c.question.includes(c.position))).toBe(true);
  });
});
