import { describe, expect, it } from 'vitest';
import {
  buildContinuityChips,
  CONTINUITY_MAX_CHIPS,
  formatContinuityNote,
  formatContinuityTuple,
  normalizeContinuityChipOrder
} from '@/lib/tiekat/continuityFormatting';

describe('tiekat shared continuity formatting', () => {
  it('normalizes chip order deterministically', () => {
    expect(normalizeContinuityChipOrder(['glyph', 'awakening'])).toEqual(['glyph', 'awakening', 'continuity', 'modeled', 'local']);
  });

  it('builds tuple/note/chips with compact modeled defaults', () => {
    const tuple = formatContinuityTuple({ awakening: 'coherent', glyph: 'resonant_orbit', continuityType: 'dominant' });
    const note = formatContinuityNote({ awakening: 'coherent', glyph: 'resonant_orbit', continuityType: 'dominant' }, 'Modeled habitat continuity');
    const chips = buildContinuityChips({ awakening: 'coherent', glyph: 'resonant_orbit', continuityType: 'dominant' });

    expect(tuple).toBe('coherent / resonant_orbit');
    expect(note).toContain('Configuration-derived continuity');
    expect(chips).toEqual(['coherent', 'resonant_orbit', 'dominant', 'modeled']);
    expect(chips.length).toBeLessThanOrEqual(CONTINUITY_MAX_CHIPS);
    expect(`${tuple} ${note} ${chips.join(' ')}`.toLowerCase()).not.toContain('ancestor name');
    expect(`${tuple} ${note} ${chips.join(' ')}`.toLowerCase()).not.toContain('message');
  });
});
