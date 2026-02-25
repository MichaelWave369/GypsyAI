import { describe, it, expect } from 'vitest';
import { chartToMarkdown, tarotToMarkdown, toJsonExport } from '@/lib/export/formatters';
import { markDefaultProfile } from '@/lib/local/storage';

describe('local save/export helpers', () => {
  it('marks one profile default', () => {
    const out = markDefaultProfile([
      { id: '1', name: 'A', date: '2000-01-01', time: '12:00', place: 'x' },
      { id: '2', name: 'B', date: '2000-01-01', time: '12:00', place: 'x' }
    ], '2');
    expect(out[1].isDefault).toBe(true);
    expect(out[0].isDefault).toBe(false);
  });

  it('round-trips json export/import shape', () => {
    const sample = { hello: 'world', n: 3 };
    const text = toJsonExport(sample);
    expect(JSON.parse(text)).toEqual(sample);
  });

  it('builds markdown exports', () => {
    expect(tarotToMarkdown({ spread: 'single', createdAt: 'now', interpretation: 'x', cards: ['A'] })).toContain('# Gypsy AI Tarot Session');
    expect(chartToMarkdown({ createdAt: 'now', placements: ['Sun'], aspects: [], houses: [] })).toContain('# Gypsy AI Chart Export');
  });
});
